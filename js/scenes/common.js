// Sumber GPU milik babak sahaja; environment dan renderer kekal milik manager.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Rig } from '../rig.js';
import { mountHud, chapterUI } from '../hud.js';
import { clamp, isRTL, motionPaused, scrollProgress, isNight } from '../scene-manager.js';

export { THREE, clamp };
export const TAU = Math.PI * 2;
export const ease = t => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (p, a, b) => ease((p - a) / (b - a));
export const pulse = (p, a, b, c, d) => ramp(p, a, b) * (1 - ramp(p, c, d));

// Interpolasi ke objek yang sama: tiada objek key baharu dalam update.
export function sample(keys, p, out) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const a = keys[i], b = keys[i + 1], t = ramp(p, a.p, b.p);
  for (const name in a) if (name !== 'p') out[name] = a[name] + (b[name] - a[name]) * t;
  return out;
}

// Rig sebenar dikekalkan (Teroka/zoom/reset/damping). Hanya pensampelan pose
// scripted diganti untuk mengelakkan sampleKeys() memperuntukkan objek setiap bingkai.
class SceneRig extends Rig {
  constructor(options) {
    super(options);
    this.key = {};
    this.direction = new THREE.Vector3();
    this.right = new THREE.Vector3();
  }
  scripted(p, position, target) {
    const k = sample(this.keys, p, this.key), dist = this.base * k.d;
    const e = k.e * Math.PI / 180, az = this.azimuth;
    this.targetAt(p, k, target);
    this.direction.set(Math.sin(az) * Math.cos(e), Math.sin(e), Math.cos(az) * Math.cos(e));
    this.right.set(Math.cos(az), 0, -Math.sin(az));
    const side = this.portrait ? 0 : (k.sx || 0) * (isRTL() ? -1 : 1);
    const lift = this.portrait ? (k.syPortrait ?? 0.2) : (k.sy || 0);
    target.addScaledVector(this.right, -side * dist * Math.tan(this.hHalf));
    target.y -= lift * dist * Math.tan(this.vHalf);
    position.copy(target).addScaledVector(this.direction, dist);
    this.distance = dist;
    return k;
  }
}

export function studio(ctx, radius = 3) {
  const resources = new Set(), cleanup = [];
  const own = resource => { resources.add(resource); return resource; };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x091a14);
  scene.environment = ctx.env;
  scene.environmentIntensity = 0.65;
  scene.fog = new THREE.FogExp2(0x091a14, 0.05);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.025, 100);
  const material = options => own(new THREE.MeshStandardMaterial(options));
  const mesh = (parent, geometry, mat, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(own(geometry), mat);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const floorFade = own(canvasTexture(128, 128, (g, w, h) => {
    const gradient = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, '#fff'); gradient.addColorStop(0.5, '#fff'); gradient.addColorStop(1, '#000');
    g.fillStyle = gradient; g.fillRect(0, 0, w, h);
  }));
  const floorMaterial = material({ color: 0x0b1d16, roughness: 0.9, metalness: 0.02, envMapIntensity: 0.2, alphaMap: floorFade, transparent: true, depthWrite: false });
  const floor = mesh(scene, new THREE.CircleGeometry(14, 64), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  const key = new THREE.DirectionalLight(0xffe6cb, 3.3);
  key.position.set(-4, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(ctx.tier === 'high' ? 2048 : 1024, ctx.tier === 'high' ? 2048 : 1024);
  Object.assign(key.shadow.camera, { left: -radius * 2, right: radius * 2, top: radius * 2, bottom: -radius * 2, near: 0.1, far: 30 });
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = ctx.tier === 'high' ? 4 : 2;
  const rim = new THREE.DirectionalLight(0xc4e1da, 2.2);
  rim.position.set(4, 4, -5);
  const sky = new THREE.HemisphereLight(0xc8ded8, 0x332919, 0.65);
  scene.add(key, rim, sky);
  // Versi Pagi / Malam (Claude): mengikut suis tema laman, sama seperti babak Jamiah.
  const MOODS = {
    night: { bg: 0x091a14, floor: 0x0b1d16, floorRough: 0.9, env: 0.65, exposure: 1.12, key: [0xffe6cb, 3.3], rim: [0xc4e1da, 2.2], sky: [0xc8ded8, 0x332919, 0.65] },
    day: { bg: 0xeee6d6, floor: 0xe3d8c3, floorRough: 0.8, env: 0.95, exposure: 1.0, key: [0xfff3e0, 3.6], rim: [0xffffff, 1.1], sky: [0xf3efe6, 0xb59f7c, 1.15] },
  };
  let moodName = null, exposureNow = 1.12;
  function mood() {
    const next = isNight() ? 'night' : 'day';
    if (next === moodName) return false;
    moodName = next;
    const m = MOODS[next];
    scene.background.setHex(m.bg);
    scene.fog.color.setHex(m.bg);
    floorMaterial.color.setHex(m.floor); floorMaterial.roughness = m.floorRough;
    scene.environmentIntensity = m.env;
    exposureNow = m.exposure;
    key.color.setHex(m.key[0]); key.intensity = m.key[1];
    rim.color.setHex(m.rim[0]); rim.intensity = m.rim[1];
    sky.color.setHex(m.sky[0]); sky.groundColor.setHex(m.sky[1]); sky.intensity = m.sky[2];
    return true;
  }
  // Ray-traced shadows are not required for the broad, soft contact underneath.
  const shadowMap = canvasTexture(128, 128, (g, w, h) => {
    const gradient = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,.6)'); gradient.addColorStop(0.4, 'rgba(0,0,0,.28)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gradient; g.fillRect(0, 0, w, h);
  });
  own(shadowMap);
  const shadowMaterial = own(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, toneMapped: false }));
  function contact(x, z, w, h) {
    const object = mesh(scene, new THREE.PlaneGeometry(w, h), shadowMaterial, x, 0.009, z);
    object.rotation.x = -Math.PI / 2;
    object.castShadow = object.receiveShadow = false;
    return object;
  }
  async function texture(url) {
    const original = own(await new THREE.TextureLoader().loadAsync(url));
    let result = original;
    const source = original.image, max = Math.max(source.width, source.height);
    if (ctx.tier === 'low' && max > 1024) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(source.width * 1024 / max); canvas.height = Math.round(source.height * 1024 / max);
      canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
      result = own(new THREE.CanvasTexture(canvas));
      original.dispose(); resources.delete(original);
    }
    result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
    return result;
  }
  function dispose() {
    for (const fn of cleanup) fn();
    scene.traverse(object => { if (object.isLight && object.shadow) object.shadow.dispose(); });
    for (const resource of resources) resource.dispose();
    resources.clear(); scene.clear();
  }
  mood();
  return { ctx, scene, camera, own, material, mesh, contact, texture, key, rim, cleanup, dispose, mood, exposure: () => exposureNow };
}

export function canvasTexture(w, h, paint) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  paint(canvas.getContext('2d'), w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Seeded texture variation; never changes when reversing scroll.
export function surfaceTexture(kind) {
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = kind === 'wood' ? '#725033' : kind === 'leather' ? '#655b50' : '#dfd0b0';
    g.fillRect(0, 0, w, h);
    let seed = 719;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 4400; i++) {
      const x = random() * w, y = random() * h, a = random() * 0.13;
      g.fillStyle = `rgba(28,20,12,${a})`;
      g.fillRect(x, y, kind === 'wood' ? 30 + random() * 160 : 1.3, kind === 'wood' ? 0.7 : 1.3);
    }
    if (kind === 'page') {
      g.strokeStyle = '#8a6b34'; g.lineWidth = 2.2;
      g.strokeRect(38, 32, w - 76, h - 64); g.strokeRect(45, 39, w - 90, h - 78);
      // Geometric border only: no letters, pseudo-text or calligraphy.
      for (let i = 65; i < 460; i += 24) {
        g.strokeRect(48, i, 7, 7); g.strokeRect(w - 55, i, 7, 7);
      }
    }
    if (kind === 'edge') {
      g.strokeStyle = '#b6a98e'; g.lineWidth = 0.65;
      for (let y = 2; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    }
  });
}

export function rounded(w, h, depth, radius = 0.04) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  const r = Math.min(radius, w / 3, h / 3), b = Math.min(depth / 4, r / 3);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(s, { depth: depth - b * 2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: b, bevelThickness: b, curveSegments: 5 });
  geometry.translate(0, 0, -depth / 2 + b);
  geometry.clearGroups();
  return geometry;
}

// Merge local static parts sharing a material; source buffers disposed immediately.
export function batch(s, parent, material, geometries) {
  const geometry = mergeGeometries(geometries, false);
  for (const item of geometries) item.dispose();
  if (!geometry) throw new Error('Geometri statik tidak serasi');
  return s.mesh(parent, geometry, material);
}

// Curled page in XY; spine at x=0, front normal +Z. Geometry reused during turns.
export function leafGeometry(width, height, curl = 0.12, segments = 24) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 4);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + width / 2) / width;
    pos.setXYZ(i, u * width, pos.getY(i), Math.sin(u * Math.PI) * curl + u * u * curl * 0.3);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function controller(s, { name, radius, keys, targetAt, pose, stable = 0.5, pin = false, extra }) {
  const { ctx, scene, camera } = s, stage = ctx.stage;
  const trigger = stage.closest(pin ? '.chapter' : '.feature');
  const rig = new SceneRig({ camera, canvas: ctx.canvas, stage, radius, keys, targetAt, minDist: 0.15, maxDist: 2.4 });
  // scrollProgress owns its GSAP triggers; capture only the synchronously-created pair.
  const previous = new Set(window.ScrollTrigger?.getAll() || []);
  const progress = scrollProgress(trigger, pin ? 'pin' : 'pass', 0.65);
  const triggers = (window.ScrollTrigger?.getAll() || []).filter(t => !previous.has(t));
  const ui = pin ? chapterUI(trigger) : null;
  const hud = mountHud(stage, rig, { onExplore: () => ctx.requestRender() });
  const directionObserver = new MutationObserver(() => { rig.dirty = true; ctx.requestRender(); });
  directionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  const state = { progress: typeof stable === 'function' ? stable() : stable, yawDeg: 0, distanceRatio: 1, mode: 'scroll', tier: ctx.tier };
  (window.__profile3d ||= {})[name] = state;
  let lastP = -1, disposed = false;
  const api = {
    scene, camera, rig, hud, progress, state,
    get exposure() { s.mood(); return s.exposure(); },
    resize(w, h) { rig.fit(w, h); },
    update(delta) {
      if (disposed) return false;
      const p = motionPaused() ? (typeof stable === 'function' ? stable() : stable) : clamp(progress.value);
      extra?.(p, delta);
      if (p !== lastP) { pose(p, rig, state); lastP = p; rig.dirty = true; }
      if (s.mood()) rig.dirty = true;
      const dirty = rig.update(delta, p);
      if (dirty) {
        ui?.update(p);
        state.progress = p; state.distanceRatio = rig.distance / rig.base; state.mode = rig.mode;
      }
      return dirty;
    },
    onActivate() { s.mood(); rig.dirty = true; ctx.requestRender(); },
    onDeactivate() { if (rig.mode === 'explore') { rig.exitExplore(); hud.label(); } },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const t of triggers) { t.animation?.kill(); t.kill(); }
      window.gsap?.killTweensOf(progress);
      ui?.dispose?.();
      trigger.querySelector('.rail-dots')?.remove();
      directionObserver.disconnect();
      hud.dispose(); rig.dispose(); s.dispose();
      if (window.__profile3d?.[name] === state) delete window.__profile3d[name];
    },
  };
  return api;
}
