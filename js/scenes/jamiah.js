// Babak utama: maket seni bina pintu gerbang Jamiah Imam di atas plinth galeri.
// Kemajuan skrol p∈[0,1] → yaw model 0→2π (satu putaran penuh); kamera dolly/elevation ikut storyboard.
// Rupa: bahan PBR berasingan (batu pasir bersusun, gangsa, kubah logam berusuk, kaca), cahaya utama hangat
// dengan bayang lembut, dan ambient occlusion (GTAO) pada peranti berkemampuan.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Rig } from '../rig.js';
import { mountHud, chapterUI } from '../hud.js';
import { scrollProgress, motionPaused, clamp, isNight } from '../scene-manager.js';

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const YAW0 = -0.56; // orientasi 3/4 hadapan pada p = 0 dan p = 1
const PLINTH = 1.5;
// Storyboard: d = jarak relatif, e = elevation (°), ty = tinggi sasaran (pecahan tinggi model),
// sx = anjakan sisi, fg/fd = tarikan sasaran ke pintu gerbang / kubah.
// Syot: (0) establishing rendah → (0.2) hampiri pintu gerbang, close-up kekisi → (0.3) lalu rendah di sisi →
// (0.4) orbit tinggi kompleks → (0.6) pandangan belakang luas → (0.8) close-up kubah dan menara →
// (0.9) kamera naik → (1.0) aerial reveal pada orientasi asal.
const KEYS = [
  { p: 0.00, d: 1.02, e: 8, fov: 26, az: 0, ty: 0.34, sx: 0.22, fg: 0, fd: 0 },
  { p: 0.20, d: 0.40, e: 4, fov: 34, az: 0, ty: 0.30, sx: -0.26, fg: 0.92, fd: 0 },
  { p: 0.30, d: 0.56, e: 5, fov: 32, az: 16, ty: 0.26, sx: 0, fg: 0.2, fd: 0 },
  { p: 0.40, d: 0.92, e: 27, fov: 28, az: 0, ty: 0.38, sx: 0.24, fg: 0, fd: 0 },
  { p: 0.60, d: 1.12, e: 15, fov: 26, az: 0, ty: 0.36, sx: -0.24, fg: 0, fd: 0 },
  { p: 0.80, d: 0.40, e: 17, fov: 34, az: 0, ty: 0.6, sx: 0.28, fg: 0, fd: 0.9 },
  { p: 0.90, d: 0.84, e: 44, fov: 30, az: -12, ty: 0.4, sx: 0.1, fg: 0, fd: 0.2 },
  { p: 1.00, d: 1.16, e: 66, fov: 30, az: 0, ty: 0.16, sx: 0.2, fg: 0, fd: 0 },
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
          const float course = 0.26; const float blockW = 0.62;
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
          diffuseColor.rgb *= 1.0 - joint * 0.11;
          // Luluhawa frekuensi rendah supaya dinding tidak nampak seperti jubin seragam.
          float weather = sin(vModelPos.x * 0.37 + vModelPos.y * 0.9) * sin(vModelPos.z * 0.29 - vModelPos.y * 0.5);
          diffuseColor.rgb *= mix(0.92, 1.04, weather * 0.5 + 0.5);
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
          float rib = abs(fract(angle / 6.2831853 * 36.0) - 0.5) * 2.0;
          diffuseColor.rgb *= mix(0.68, 1.04, smoothstep(0.0, 0.2, rib));
        }`);
  };
  return material;
}

// Hingar nilai 3D ringkas untuk tumbuhan (GLSL).
const NOISE = `
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }`;
// Semak: sfera licin dipecah menjadi gumpalan daun bersegi (anjakan hingar + bayang rata) dengan tiga tona zaitun.
function shrubby(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;' + NOISE)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float n = noise3(position * 3.4) * 0.7 + noise3(position * 8.1) * 0.3;
        transformed += normal * (n - 0.45) * 0.26;
        vModelPos = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float t = noise3(vModelPos * 5.0);
        diffuseColor.rgb *= mix(vec3(0.78, 0.84, 0.7), vec3(1.18, 1.12, 0.92), t);`);
  };
  return material;
}
// Pelepah kurma: variasi tona zaitun-kering mengikut kedudukan.
function foliageTone(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvModelPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vModelPos;' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= mix(vec3(0.82, 0.86, 0.72), vec3(1.2, 1.1, 0.86), noise3(vModelPos * 2.2));`);
  };
  return material;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner); grad.addColorStop(0.55, inner); grad.addColorStop(1, outer);
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function backdrop(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 512;
  const g = canvas.getContext('2d');
  const gradient = g.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([at, colour]) => gradient.addColorStop(at, colour));
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
  // Dua mood: Malam (senja zamrud, lampu galeri hangat) dan Pagi (matahari pagi Riyadh, langit gading).
  const skies = {
    night: backdrop([[0, '#050a08'], [0.54, '#091310'], [0.68, '#0e1b16'], [1, '#07100d']]),
    day: backdrop([[0, '#c9d6d8'], [0.45, '#efe7d6'], [1, '#e9dcc4']]),
  };
  scene.fog = new THREE.FogExp2(0x0c1915, 0.0105);
  scene.environment = ctx.env;
  disposables.push(skies.night, skies.day);
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 700);

  // Papan tanda: khat Thuluth penuh «جامعة الإمام محمد بن سعود الإسلامية» (4096 px, lutsinar) menggantikan
  // tekstur asal 355×49 yang kabur. Dijana oleh scripts/render-jamiah-sign.mjs dengan fon Diwan Thuluth.
  const [gltf, signMap] = await Promise.all([
    loadModel('assets/models/jamiah-imam.parts.glb'),
    new THREE.TextureLoader().loadAsync('assets/textures/jamiah-sign-thuluth.webp').catch(() => null),
  ]);
  if (signMap) {
    signMap.colorSpace = THREE.SRGBColorSpace;
    signMap.flipY = false; // konvensyen UV glTF
    signMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    disposables.push(signMap);
  }
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const MATERIALS = {
    stone: () => masonry(new THREE.MeshStandardMaterial({ color: 0xd8bf96, vertexColors: true, roughness: 0.91, metalness: 0 })),
    bronze: () => new THREE.MeshStandardMaterial({ color: 0x5a4328, roughness: 0.3, metalness: 0.92, envMapIntensity: 1.8 }),
    slate: () => ribbed(new THREE.MeshStandardMaterial({ color: 0x4f595e, roughness: 0.56, metalness: 0.42, envMapIntensity: 0.85 }), SPOTS.dome.at[0], SPOTS.dome.at[2]),
    glass: () => new THREE.MeshStandardMaterial({ color: 0x0f1f24, roughness: 0.14, metalness: 0.85, envMapIntensity: 1.4, emissive: 0xe89b48, emissiveIntensity: 0.32 }),
    foliage: () => foliageTone(new THREE.MeshStandardMaterial({ color: 0x4a5938, roughness: 0.86, metalness: 0, flatShading: true })),
    shrub: () => shrubby(new THREE.MeshStandardMaterial({ color: 0x3c4b2f, roughness: 0.94, metalness: 0, flatShading: true })),
    lawn: () => new THREE.MeshStandardMaterial({ color: 0x445235, roughness: 0.98, metalness: 0 }),
    sign: (source) => signMap
      ? new THREE.MeshStandardMaterial({ map: signMap, transparent: true, alphaTest: 0.04, depthWrite: false, roughness: 0.62, metalness: 0.1, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })
      : new THREE.MeshStandardMaterial({ color: 0xfff3dc, map: source.map, roughness: 0.8, metalness: 0 }),
  };
  const SMOOTH = new Set(['slate', 'shrub']); // shrub kekal berindeks supaya anjakan hingar tidak merekah
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
    node.castShadow = name !== 'lawn' && name !== 'sign';
    if (name === 'sign') node.renderOrder = 2;
    node.receiveShadow = true;
    disposables.push(node.geometry, node.material);
  });
  model.position.set(-center.x, PLINTH - box.min.y, -center.z);
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);
  const radius = Math.hypot(size.x, size.z) * 0.5 * 0.9;

  // Plinth galeri: tapak batu gelap dengan jalur loyang nipis di tepi atas.
  const plinthMaterial = new THREE.MeshStandardMaterial({ color: 0x121110, roughness: 0.68, metalness: 0.08 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(size.x + 2.4, PLINTH, size.z + 2.4), plinthMaterial);
  plinth.position.y = PLINTH / 2 - 0.02;
  plinth.castShadow = plinth.receiveShadow = true;
  const brassMaterial = new THREE.MeshStandardMaterial({ color: 0xc7a45e, roughness: 0.26, metalness: 0.95, envMapIntensity: 1.4 });
  const brass = new THREE.Mesh(new THREE.BoxGeometry(size.x + 2.46, 0.07, size.z + 2.46), brassMaterial);
  brass.position.y = PLINTH - 0.16;
  pivot.add(plinth, brass);
  disposables.push(plinth.geometry, plinthMaterial, brass.geometry, brassMaterial);

  // Lantai galeri: batu gelap separa gilap yang hilang ke dalam kabus.
  const floorFade = radialTexture('#ffffff', '#000000');
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x091310, roughness: 0.78, metalness: 0.05, envMapIntensity: 0.25, alphaMap: floorFade, transparent: true, depthWrite: false });
  const contactMap = radialTexture('#000000', 'rgba(0,0,0,0)');
  const contactMaterial = new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, opacity: 0.65, depthWrite: false, toneMapped: false });
  const contact = new THREE.Mesh(new THREE.PlaneGeometry((size.x + 2.4) * 1.45, (size.z + 2.4) * 1.45), contactMaterial);
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.015;
  contact.renderOrder = 1;
  pivot.add(contact);
  disposables.push(floorFade, contactMap, contactMaterial, contact.geometry);
  const plinthNight = new THREE.Color(0x121110), plinthDay = new THREE.Color(0x3a332a);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(radius * 4.5, 72), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floor.geometry, floorMaterial);

  // Kaleidoskop asal laman menjadi medalion loyang bertatah pada lantai galeri; coraknya berubah mengikut skrol.
  const kaleidoCanvas = stage.querySelector('.stage-kaleido');
  let medallion = null, medallionMap = null, lastMorph = -1;
  if (kaleidoCanvas && kaleidoCanvas.width > 8) {
    medallionMap = new THREE.CanvasTexture(kaleidoCanvas);
    medallionMap.colorSpace = THREE.SRGBColorSpace;
    const medallionMaterial = new THREE.MeshBasicMaterial({ map: medallionMap, transparent: true, opacity: 0.075, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    medallion = new THREE.Mesh(new THREE.CircleGeometry(radius * 2.2, 64), medallionMaterial);
    medallion.rotation.x = -Math.PI / 2;
    medallion.position.y = 0.03;
    scene.add(medallion);
    disposables.push(medallion.geometry, medallionMaterial, medallionMap);
  }

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
  const pool = new THREE.SpotLight(0xffe8c4, 140, radius * 9, 0.34, 1, 2);
  pool.position.set(0, radius * 3.2, radius * 0.6);
  pool.target.position.set(0, PLINTH + 3, 0);
  // Cahaya hangat di belakang kekisi pintu gerbang (cadangan art direction Gemini).
  const lantern = new THREE.PointLight(0xf4b86a, 34, 7.5, 2);
  pivot.add(lantern);
  scene.add(key, fill, rim, pool, pool.target);

  const MOODS = {
    night: { sky: skies.night, fog: 0x091310, fogD: 0.0115, env: 0.48, exposure: 0.96, key: [0xffd7a3, 2.45], keyPos: [-1.6, 0.95, 1.15], fill: [0x7e9fb3, 0x1c1510, 0.38], rim: [0xd9c192, 1.45], rimPos: [1.4, 0.85, -1.6], pool: 140, lantern: 34, floor: 0x091310, floorRough: 0.78, plinth: plinthNight, glass: 0.32, medallion: 0.075, contact: 0.65 },
    day: { sky: skies.day, fog: 0xebe2d0, fogD: 0.0072, env: 0.75, exposure: 1.0, key: [0xfff1dc, 4.6], keyPos: [1.1, 1.05, 1.35], fill: [0xdfe9f0, 0xb79f7a, 1.25], rim: [0xfff4e0, 0.5], rimPos: [1.2, 0.7, -1.5], pool: 0, lantern: 0, floor: 0xd9ccb3, floorRough: 0.7, plinth: plinthDay, glass: 0, medallion: 0.16, contact: 0.4 },
  };
  let mood = null;
  function applyMood() {
    const next = isNight() ? 'night' : 'day';
    if (next === mood) return false;
    mood = next;
    const m = MOODS[next];
    scene.background = m.sky;
    scene.fog.color.setHex(m.fog); scene.fog.density = m.fogD;
    scene.environmentIntensity = m.env;
    renderer.toneMappingExposure = m.exposure;
    key.color.setHex(m.key[0]); key.intensity = m.key[1];
    key.position.set(m.keyPos[0] * radius, m.keyPos[1] * radius, m.keyPos[2] * radius);
    fill.color.setHex(m.fill[0]); fill.groundColor.setHex(m.fill[1]); fill.intensity = m.fill[2];
    rim.color.setHex(m.rim[0]); rim.intensity = m.rim[1]; rim.position.set(m.rimPos[0] * radius, m.rimPos[1] * radius, m.rimPos[2] * radius);
    pool.intensity = m.pool; lantern.intensity = m.lantern; contactMaterial.opacity = m.contact;
    floorMaterial.color.setHex(m.floor); floorMaterial.roughness = m.floorRough;
    plinthMaterial.color.copy(m.plinth);
    model.traverse((node) => { if (node.isMesh && node.name === 'glass') node.material.emissiveIntensity = m.glass; });
    if (medallion) {
      medallion.material.opacity = m.medallion;
      medallion.material.blending = next === 'day' ? THREE.NormalBlending : THREE.AdditiveBlending;
      medallion.material.needsUpdate = true;
    }
    stage.dataset.mood = next;
    state.mood = next;
    return true;
  }

  const toPivot = (v) => new THREE.Vector3(v[0] - center.x, v[1] - box.min.y + PLINTH, v[2] - center.z);
  lantern.position.copy(toPivot([0, 2.6, 4.2]));
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
  const state = { progress: 0, yawDeg: 0, distanceRatio: 1, mode: 'scroll', ao: !!composer, mood: null };
  (window.__profile3d ||= {}).jamiah = state;
  applyMood();

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
      if (medallion) {
        medallion.rotation.z = -p * Math.PI * 0.5;
        const morph = Math.round(p * 60);
        if (morph !== lastMorph && window.__kaleidoDraw) { lastMorph = morph; window.__kaleidoDraw(kaleidoCanvas, 2.5 + p * 9); medallionMap.needsUpdate = true; }
      }
      if (applyMood()) rig.dirty = true;
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
    onActivate() { mood = null; applyMood(); },
    onDeactivate() { if (rig.mode === 'explore') { rig.exitExplore(); hud.label(); } },
    dispose() {
      hud.dispose(); rig.dispose();
      disposables.forEach((item) => item.dispose?.());
    },
  };
}
