// Babak utama: maket seni bina pintu gerbang Jamiah Imam di atas plinth galeri.
// Kemajuan skrol p∈[0,1] → yaw model 0→2π (satu putaran penuh); kamera dolly/elevation ikut storyboard.
// Rupa: bahan PBR berasingan (batu pasir bersusun, gangsa, kubah logam berusuk, kaca), cahaya utama hangat
// dengan bayang lembut, dan ambient occlusion (GTAO) pada peranti berkemampuan.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Rig } from '../rig.js';
import { mountHud, chapterUI } from '../hud.js';
import { scrollProgress, motionPaused, clamp } from '../scene-manager.js';

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const YAW0 = -0.56; // orientasi 3/4 hadapan pada p = 0 dan p = 1
const PLINTH = 1.5;
// Storyboard: d = jarak relatif, e = elevation (°), ty = tinggi sasaran (pecahan tinggi model),
// sx = anjakan sisi, fg/fd = tarikan sasaran ke pintu gerbang / kubah.
const KEYS = [
  { p: 0.0, d: 1.00, e: 12, ty: 0.34, sx: 0.20, fg: 0, fd: 0 },
  { p: 0.2, d: 0.72, e: 7, ty: 0.30, sx: -0.24, fg: 0.5, fd: 0 },
  { p: 0.4, d: 0.95, e: 30, ty: 0.40, sx: 0.24, fg: 0, fd: 0 },
  { p: 0.6, d: 1.15, e: 19, ty: 0.36, sx: -0.24, fg: 0, fd: 0 },
  { p: 0.8, d: 0.70, e: 24, ty: 0.6, sx: 0.3, fg: 0, fd: 0.7 },
  { p: 1.0, d: 1.00, e: 12, ty: 0.34, sx: 0.20, fg: 0, fd: 0 },
];
// Titik fizikal yang dikenal pasti pada model (ruang model asal).
const SPOTS = {
  gate: { at: [0, 3.2, 9.1], normal: [0, 0, 1], show: [0.1, 0.3] },
  dome: { at: [0, 6.9, -5.95], normal: [0, 1, 0.4], show: [0.7, 0.9] },
  minaret: { at: [5.05, 9.2, -5.1], normal: [0.6, 0.6, 0.3], show: [2, 2] }, // hanya dalam mod Teroka
};

function loadModel(url) {
  return new Promise((resolve, reject) => new GLTFLoader().load(url, resolve, undefined, reject));
}

// Batu pasir bersusun: sambungan mortar nipis dan variasi tona setiap blok, dikira dalam ruang model
// (tiada tekstur dimuat turun). Garis dipudarkan pada jarak jauh untuk mengelak moiré.
function masonry(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;\nvarying vec3 vModelNormal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvModelPos = position;\nvModelNormal = normal;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;\nvarying vec3 vModelNormal;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          vec3 an = abs(vModelNormal);
          const float course = 0.46; const float blockW = 0.92;
          vec2 st;
          if (an.y > 0.6) st = vModelPos.xz / blockW;
          else {
            float u = an.x > an.z ? vModelPos.z : vModelPos.x;
            st = vec2(u / blockW + mod(floor(vModelPos.y / course), 2.0) * 0.5, vModelPos.y / course);
          }
          vec2 cell = floor(st), f = fract(st), fw = fwidth(st);
          vec2 edge = min(f, 1.0 - f);
          float joint = 1.0 - min(smoothstep(0.0, fw.x * 1.5 + 0.012, edge.x), smoothstep(0.0, fw.y * 1.5 + 0.02, edge.y));
          joint *= 1.0 - smoothstep(0.12, 0.42, max(fw.x, fw.y));
          float tone = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
          float grain = fract(sin(dot(floor(vModelPos.xz * 9.0) + floor(vModelPos.y * 9.0), vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb *= mix(0.93, 1.03, tone) * mix(0.985, 1.015, grain);
          diffuseColor.rgb *= 1.0 - joint * 0.2;
        }`);
  };
  return material;
}

// Kubah logam berusuk: jalur menegak halus mengikut sudut mengelilingi paksi kubah.
function ribbed(material, cx, cz) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAxis = { value: new THREE.Vector2(cx, cz) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvModelPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;\nuniform vec2 uAxis;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          float angle = atan(vModelPos.z - uAxis.y, vModelPos.x - uAxis.x);
          float rib = abs(fract(angle / 6.2831853 * 28.0) - 0.5) * 2.0;
          diffuseColor.rgb *= mix(0.78, 1.0, smoothstep(0.0, 0.22, rib));
        }`);
  };
  return material;
}

function backdrop() {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 512;
  const g = canvas.getContext('2d');
  const gradient = g.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#040b08');
  gradient.addColorStop(0.42, '#0b1b15');
  gradient.addColorStop(0.6, '#13271f');
  gradient.addColorStop(1, '#0a1611');
  g.fillStyle = gradient; g.fillRect(0, 0, 4, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default async function create(ctx) {
  const { stage, tier, renderer } = ctx;
  const chapter = stage.closest('.chapter');
  const scene = new THREE.Scene();
  const disposables = [];
  const sky = backdrop();
  scene.background = sky;
  scene.fog = new THREE.FogExp2(0x0e1d17, 0.0052);
  scene.environment = ctx.env;
  scene.environmentIntensity = 0.32;
  disposables.push(sky);
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 700);

  const gltf = await loadModel('assets/models/jamiah-imam.parts.glb');
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const MATERIALS = {
    stone: () => masonry(new THREE.MeshStandardMaterial({ color: 0xe4cfaa, vertexColors: true, roughness: 0.84, metalness: 0 })),
    bronze: () => new THREE.MeshStandardMaterial({ color: 0x4a3826, roughness: 0.36, metalness: 0.82, envMapIntensity: 1.3 }),
    slate: () => ribbed(new THREE.MeshStandardMaterial({ color: 0x6a7379, roughness: 0.38, metalness: 0.55, envMapIntensity: 1.2 }), SPOTS.dome.at[0], SPOTS.dome.at[2]),
    glass: () => new THREE.MeshStandardMaterial({ color: 0x14262b, roughness: 0.1, metalness: 0.9, envMapIntensity: 1.6, emissive: 0xffb060, emissiveIntensity: 0.07 }),
    foliage: () => new THREE.MeshStandardMaterial({ color: 0x5f6b49, roughness: 0.92, metalness: 0 }),
    shrub: () => new THREE.MeshStandardMaterial({ color: 0x4d5a3f, roughness: 1, metalness: 0 }),
    lawn: () => new THREE.MeshStandardMaterial({ color: 0x5c6848, roughness: 1, metalness: 0 }),
    sign: (source) => new THREE.MeshStandardMaterial({ color: 0xfff3dc, map: source.map, roughness: 0.8, metalness: 0 }),
  };
  const SMOOTH = new Set(['slate', 'shrub']);
  model.traverse((node) => {
    if (!node.isMesh) return;
    const name = node.name in MATERIALS ? node.name : 'stone';
    if (!SMOOTH.has(name)) node.geometry = node.geometry.toNonIndexed();
    node.geometry.computeVertexNormals();
    const source = node.material;
    node.material = MATERIALS[name](source);
    node.material.side = THREE.DoubleSide;
    node.material.shadowSide = THREE.DoubleSide;
    if (node.material.map) { node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy(); disposables.push(node.material.map); }
    node.castShadow = name !== 'lawn';
    node.receiveShadow = true;
    disposables.push(node.geometry, node.material);
  });
  model.position.set(-center.x, PLINTH - box.min.y, -center.z);
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);
  const radius = Math.hypot(size.x, size.z) * 0.5 * 0.9;

  // Plinth galeri: tapak batu gelap dengan jalur loyang nipis di tepi atas.
  const plinthMaterial = new THREE.MeshStandardMaterial({ color: 0x1d1b18, roughness: 0.55, metalness: 0.1 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(size.x + 2.4, PLINTH, size.z + 2.4), plinthMaterial);
  plinth.position.y = PLINTH / 2 - 0.02;
  plinth.castShadow = plinth.receiveShadow = true;
  const brassMaterial = new THREE.MeshStandardMaterial({ color: 0xb08d4a, roughness: 0.3, metalness: 1 });
  const brass = new THREE.Mesh(new THREE.BoxGeometry(size.x + 2.46, 0.07, size.z + 2.46), brassMaterial);
  brass.position.y = PLINTH - 0.16;
  pivot.add(plinth, brass);
  disposables.push(plinth.geometry, plinthMaterial, brass.geometry, brassMaterial);

  // Lantai galeri: batu gelap separa gilap yang hilang ke dalam kabus.
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x101b17, roughness: 0.42, metalness: 0.15, envMapIntensity: 0.5 });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(radius * 12, 72), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floor.geometry, floorMaterial);

  // Cahaya: lampu utama hangat (bayang lembut), isian langit sejuk, rim dari belakang, lampu sorot galeri.
  const high = tier === 'high';
  const key = new THREE.DirectionalLight(0xffe4bf, 3.4);
  key.position.set(-radius * 1.25, radius * 1.35, radius * 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);
  Object.assign(key.shadow.camera, { left: -radius * 1.7, right: radius * 1.7, top: radius * 1.7, bottom: -radius * 1.7, near: 1, far: radius * 6 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.06;
  key.shadow.radius = high ? 5 : 2;
  key.shadow.blurSamples = 12;
  const fill = new THREE.HemisphereLight(0xa9c0cc, 0x2b2118, 0.55);
  const rim = new THREE.DirectionalLight(0xbfe0d2, 1.1);
  rim.position.set(radius * 1.2, radius * 0.7, -radius * 1.5);
  const pool = new THREE.SpotLight(0xfff0d8, 900, radius * 9, 0.42, 0.9, 1.6);
  pool.position.set(0, radius * 3.2, radius * 0.6);
  pool.target.position.set(0, 0, 0);
  // Cahaya hangat di belakang kekisi pintu gerbang (cadangan art direction Gemini).
  const lantern = new THREE.PointLight(0xf4b86a, 90, radius * 1.1, 2);
  pivot.add(lantern);
  scene.add(key, fill, rim, pool, pool.target);

  const toPivot = (v) => new THREE.Vector3(v[0] - center.x, v[1] - box.min.y + PLINTH, v[2] - center.z);
  lantern.position.copy(toPivot([0, 2.4, 5.4]));
  const spots = Object.entries(SPOTS).map(([name, spot]) => ({
    name, local: toPivot(spot.at), normal: new THREE.Vector3(...spot.normal).normalize(), show: spot.show,
    el: stage.querySelector(`.hotspot[data-spot="${name}"]`), visible: null,
  })).filter((spot) => spot.el);
  const gateLocal = toPivot(SPOTS.gate.at), domeLocal = toPivot(SPOTS.dome.at);
  const world = new THREE.Vector3(), normalWorld = new THREE.Vector3(), toCamera = new THREE.Vector3();

  const rig = new Rig({
    camera, canvas: ctx.canvas, stage, radius, keys: KEYS,
    targetAt(p, k, out) {
      out.set(0, PLINTH + size.y * k.ty, 0);
      if (k.fg > 0.001) out.lerp(world.copy(gateLocal).applyAxisAngle(UP, pivot.rotation.y), k.fg);
      if (k.fd > 0.001) out.lerp(world.copy(domeLocal).applyAxisAngle(UP, pivot.rotation.y), k.fd);
    },
  });
  const progress = scrollProgress(chapter, 'pin', 0.9);
  const ui = chapterUI(chapter);
  const hud = mountHud(stage, rig);
  spots.forEach((spot) => spot.el.addEventListener('click', () => {
    hud.setExplore(true);
    const point = spot.local.clone().applyAxisAngle(UP, pivot.rotation.y);
    const dir = spot.normal.clone().applyAxisAngle(UP, pivot.rotation.y);
    dir.y = Math.max(dir.y, 0.25); dir.normalize();
    rig.tween = { t: 0, pos: camera.position.clone(), target: rig.controls.target.clone(), toPos: point.clone().addScaledVector(dir, rig.base * 0.42), toTarget: point, time: 0.9 };
  }));

  // Ambient occlusion (GTAO) hanya pada peranti berkemampuan; dimuat secara lazy.
  let composer = null;
  if (high) {
    try {
      const [{ EffectComposer }, { RenderPass }, { GTAOPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/GTAOPass.js'), import('three/addons/postprocessing/OutputPass.js'),
      ]);
      const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
      composer = new EffectComposer(renderer, target);
      composer.addPass(new RenderPass(scene, camera));
      const gtao = new GTAOPass(scene, camera, 4, 4);
      gtao.blendIntensity = 1;
      gtao.updateGtaoMaterial({ radius: 1.5, distanceExponent: 1.2, thickness: 1.4, scale: 1.25, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
      composer.addPass(gtao);
      composer.addPass(new OutputPass());
      disposables.push(target, composer);
    } catch (error) {
      console.warn('[3d] Ambient occlusion tidak tersedia; render biasa digunakan.', error);
      composer = null;
    }
  }

  let width = 1, heightPx = 1, lastYaw = null;
  const state = { progress: 0, yawDeg: 0, distanceRatio: 1, mode: 'scroll', ao: !!composer };
  (window.__profile3d ||= {}).jamiah = state;

  function placeSpots(p) {
    const exploring = rig.mode === 'explore';
    spots.forEach((spot) => {
      world.copy(spot.local).applyAxisAngle(UP, pivot.rotation.y);
      normalWorld.copy(spot.normal).applyAxisAngle(UP, pivot.rotation.y);
      toCamera.copy(camera.position).sub(world).normalize();
      const facing = normalWorld.dot(toCamera) > 0.12;
      world.project(camera);
      const inside = Math.abs(world.x) < 0.94 && Math.abs(world.y) < 0.86 && world.z < 1;
      const wanted = facing && inside && (exploring || (p >= spot.show[0] && p <= spot.show[1]));
      if (wanted) spot.el.style.transform = `translate3d(${((world.x + 1) / 2 * width).toFixed(1)}px, ${((1 - world.y) / 2 * heightPx).toFixed(1)}px, 0)`;
      if (wanted !== spot.visible) {
        spot.visible = wanted;
        spot.el.classList.toggle('is-visible', wanted);
        spot.el.tabIndex = wanted ? 0 : -1;
      }
    });
  }

  return {
    scene, camera,
    render(target) {
      if (composer) composer.render(); else target.render(scene, camera);
    },
    resize(w, h) {
      width = w; heightPx = h;
      rig.fit(w, h);
      if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    },
    update(delta) {
      // Mod jeda/reduced motion: pose stabil pada p = 0; Teroka manual kekal tersedia.
      const p = motionPaused() ? 0 : clamp(progress.value);
      const yaw = YAW0 + p * TAU;
      if (yaw !== lastYaw) { pivot.rotation.y = lastYaw = yaw; rig.dirty = true; }
      const dirty = rig.update(delta, p);
      if (dirty) {
        ui.update(p);
        placeSpots(p);
        state.progress = p;
        state.yawDeg = p * 360;
        state.distanceRatio = rig.distance / rig.base;
        state.mode = rig.mode;
      }
      return dirty;
    },
    onDeactivate() { if (rig.mode === 'explore') { rig.exitExplore(); hud.label(); } },
    dispose() {
      hud.dispose(); rig.dispose();
      disposables.forEach((item) => item.dispose?.());
    },
  };
}
