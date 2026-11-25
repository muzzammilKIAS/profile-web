// Rig kamera: pose berskrip mengikut kemajuan skrol (dolly, elevation, sasaran)
// dan mod Teroka manual (OrbitControls). Model yang berputar; azimut kamera kekal,
// jadi putaran berkesan tidak berganda.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clamp, isRTL } from './scene-manager.js';

const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const DEG = Math.PI / 180;

export function sampleKeys(keys, p) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const a = keys[i], b = keys[i + 1];
  const t = smoother(clamp((p - a.p) / (b.p - a.p)));
  const out = {};
  for (const key in a) if (key !== 'p' && typeof a[key] === 'number') out[key] = a[key] + ((b[key] ?? a[key]) - a[key]) * t;
  out.t = t; out.from = a; out.to = b;
  return out;
}

export class Rig {
  // radius: jejari sfera yang melingkungi subjek. keys: [{ p, d, e, sx?, sy? }]
  // targetAt(p, key, vec3): tulis titik sasaran dunia ke dalam vec3.
  constructor({ camera, canvas, stage, radius, keys, targetAt, azimuth = 0, minDist = 0.34, maxDist = 1.7 }) {
    Object.assign(this, { camera, canvas, stage, radius, keys, targetAt, azimuth, minDist, maxDist });
    this.base = radius * 3;
    this.mode = 'scroll';
    this.target = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.blend = null;
    this.tween = null;
    this.lastP = -1;
    this.dirty = true;
    this.portrait = false;
    this.distance = this.base;
    this.controls = new OrbitControls(camera, canvas);
    Object.assign(this.controls, { enabled: false, enableDamping: true, dampingFactor: 0.08, enablePan: false, rotateSpeed: 0.7, zoomSpeed: 0.8, maxPolarAngle: 88 * DEG, minPolarAngle: 12 * DEG });
    this.controls.addEventListener('change', () => { this.dirty = true; });
    canvas.style.touchAction = 'pan-y';
  }

  fit(width, height) {
    const camera = this.camera;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const vHalf = camera.fov * DEG / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    this.hHalf = hHalf; this.vHalf = vHalf;
    this.portrait = camera.aspect < 0.9;
    this.base = this.radius / Math.sin(Math.min(vHalf, hHalf));
    this.controls.minDistance = this.base * this.minDist;
    this.controls.maxDistance = this.base * this.maxDist;
    this.dirty = true;
  }

  scripted(p, outPos, outTarget) {
    const key = sampleKeys(this.keys, p);
    this.targetAt(p, key, outTarget);
    const dist = this.base * key.d;
    const elev = key.e * DEG;
    const az = this.azimuth;
    const dir = _dir.set(Math.sin(az) * Math.cos(elev), Math.sin(elev), Math.cos(az) * Math.cos(elev));
    // Anjak subjek ke sisi (desktop) atau ke atas (potret) supaya kad teks tidak bertindih.
    const side = this.portrait ? 0 : (key.sx || 0) * (isRTL() ? -1 : 1);
    const lift = this.portrait ? (key.syPortrait ?? 0.2) : (key.sy || 0);
    _right.set(Math.cos(az), 0, -Math.sin(az));
    outTarget.addScaledVector(_right, -side * dist * Math.tan(this.hHalf));
    outTarget.y -= lift * dist * Math.tan(this.vHalf);
    outPos.copy(outTarget).addScaledVector(dir, dist);
    this.distance = dist;
    return key;
  }

  enterExplore() {
    if (this.mode === 'explore') return;
    this.mode = 'explore';
    this.blend = null;
    this.controls.target.copy(this.target);
    this.controls.enabled = true;
    this.canvas.style.touchAction = 'none';
    this.stage.classList.add('is-exploring');
    this.dirty = true;
  }

  exitExplore() {
    if (this.mode !== 'explore') return;
    this.mode = 'scroll';
    this.tween = null;
    this.controls.enabled = false;
    this.canvas.style.touchAction = 'pan-y';
    this.stage.classList.remove('is-exploring');
    // Adun dari pose manual ke pose skrol semasa supaya tiada lompatan.
    this.blend = { t: 0, pos: this.camera.position.clone(), target: this.controls.target.clone() };
    this.dirty = true;
  }

  zoom(factor) {
    if (this.mode !== 'explore') this.enterExplore();
    const offset = _a.copy(this.camera.position).sub(this.controls.target);
    const length = clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    const goal = offset.setLength(length).add(this.controls.target).clone();
    this.tween = { t: 0, pos: this.camera.position.clone(), target: this.controls.target.clone(), toPos: goal, toTarget: this.controls.target.clone(), time: 0.35 };
  }

  reset() {
    if (this.mode !== 'explore') return;
    const toPos = new THREE.Vector3(), toTarget = new THREE.Vector3();
    this.scripted(Math.max(0, this.lastP), toPos, toTarget);
    this.tween = { t: 0, pos: this.camera.position.clone(), target: this.controls.target.clone(), toPos, toTarget, time: 0.7 };
  }

  // Kembalikan true jika kamera berubah (perlu render).
  update(delta, p) {
    let dirty = this.dirty;
    this.dirty = false;
    if (this.mode === 'explore') {
      if (this.tween) {
        const tw = this.tween;
        tw.t = Math.min(1, tw.t + delta / tw.time);
        const k = smoother(tw.t);
        this.camera.position.lerpVectors(tw.pos, tw.toPos, k);
        this.controls.target.lerpVectors(tw.target, tw.toTarget, k);
        if (tw.t >= 1) this.tween = null;
        dirty = true;
      }
      if (this.controls.update()) dirty = true;
      this.lastP = p;
      this.distance = this.camera.position.distanceTo(this.controls.target);
      return dirty;
    }
    if (p !== this.lastP || this.blend) dirty = true;
    if (!dirty) return false;
    this.lastP = p;
    this.scripted(p, this.position, this.target);
    if (this.blend) {
      const blend = this.blend;
      blend.t = Math.min(1, blend.t + delta / 0.9);
      const k = smoother(blend.t);
      this.camera.position.lerpVectors(blend.pos, this.position, k);
      _a.lerpVectors(blend.target, this.target, k);
      this.camera.lookAt(_a);
      if (blend.t >= 1) this.blend = null;
    } else {
      this.camera.position.copy(this.position);
      this.camera.lookAt(this.target);
    }
    return true;
  }

  dispose() { this.controls.dispose(); }
}

const _dir = new THREE.Vector3(), _right = new THREE.Vector3(), _a = new THREE.Vector3();
