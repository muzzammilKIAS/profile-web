import { THREE, TAU, studio, controller, rounded, batch, sample, ramp, pulse } from './common.js';

const KEYS = [
  { p: 0, d: 1.08, e: 38, sx: 0, syPortrait: 0.3, focus: 0 },
  { p: 0.12, d: 0.72, e: 9, sx: 0.38, syPortrait: 0.3, focus: 0 },
  { p: 0.2, d: 0.72, e: 9, sx: 0.38, syPortrait: 0.3, focus: 0 },
  { p: 0.225, d: 0.36, e: 12, sx: 0.3, syPortrait: 0.3, focus: 0 },
  { p: 0.32, d: 1.12, e: 29, sx: 0, syPortrait: 0.3, focus: 0.5 },
  { p: 0.44, d: 0.62, e: 4, sx: -0.4, syPortrait: 0.3, focus: 1 },
  { p: 0.56, d: 0.62, e: 4, sx: -0.4, syPortrait: 0.3, focus: 1 },
  { p: 0.585, d: 0.3, e: 7, sx: -0.3, syPortrait: 0.3, focus: 1 },
  { p: 0.68, d: 1.12, e: 23, sx: 0, syPortrait: 0.3, focus: 1.5 },
  { p: 0.78, d: 0.58, e: 4, sx: 0.4, syPortrait: 0.3, focus: 2 },
  { p: 0.9, d: 0.58, e: 4, sx: 0.4, syPortrait: 0.3, focus: 2 },
  { p: 0.925, d: 0.28, e: 7, sx: 0.3, syPortrait: 0.3, focus: 2 },
  { p: 1, d: 1.15, e: 24, sx: 0, syPortrait: 0.3, focus: 1 },
];

function screen(s, parent, map, w, h, x, y, z) {
  // Emissive preserves the actual screenshot; no recreated UI or overlay glass glare.
  const material = s.material({ color: 0x000000, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1, roughness: 1, metalness: 0, envMapIntensity: 0, fog: false, toneMapped: false });
  const mesh = s.mesh(parent, new THREE.PlaneGeometry(w, h), material, x, y, z);
  mesh.castShadow = false;
  return mesh;
}

function laptop(s, parent, map, metal, bezel, glass) {
  const root = new THREE.Group(); parent.add(root);
  const deck = s.mesh(root, rounded(3.3, 2.18, 0.13, 0.09), metal, 0, -0.8, 0.8);
  deck.rotation.x = -Math.PI / 2;
  const keys = [];
  for (let row = 0; row < 5; row++) for (let col = 0; col < 13; col++) {
    const geometry = rounded(0.19, 0.13, 0.018, 0.018);
    geometry.rotateX(-Math.PI / 2); geometry.translate((col - 6) * 0.222, -0.722, 0.17 + row * 0.19);
    keys.push(geometry);
  }
  const space = rounded(1.13, 0.13, 0.018, 0.016);
  space.rotateX(-Math.PI / 2); space.translate(0, -0.722, 1.12); keys.push(space);
  batch(s, root, bezel, keys);
  const trackpad = s.mesh(root, rounded(1.02, 0.48, 0.008, 0.045), metal, 0, -0.726, 1.53);
  trackpad.rotation.x = -Math.PI / 2;
  const seam = s.mesh(root, rounded(1.05, 0.51, 0.006, 0.045), bezel, 0, -0.73, 1.53);
  seam.rotation.x = -Math.PI / 2;
  const hinge = new THREE.Group(); hinge.position.set(0, -0.73, -0.23); root.add(hinge);
  const barrel = s.mesh(root, new THREE.CylinderGeometry(0.075, 0.075, 2.7, 20), metal, 0, -0.74, -0.23);
  barrel.rotation.z = Math.PI / 2;
  s.mesh(hinge, rounded(3.3, 2.12, 0.09, 0.08), metal, 0, 1.06);
  s.mesh(hinge, rounded(3.2, 2.02, 0.012, 0.055), bezel, 0, 1.06, 0.05);
  s.mesh(hinge, rounded(3.09, 1.94, 0.008, 0.025), glass, 0, 1.06, 0.06);
  screen(s, hinge, map, 3.04, 1.9, 0, 1.06, 0.067);
  s.mesh(hinge, new THREE.CircleGeometry(0.016, 12), glass, 0, 2.065, 0.058);
  return { root, hinge, focal: new THREE.Vector3(0, 0.3, 0), shadow: s.contact(0, 0, 4.1, 3) };
}

function handheld(s, parent, map, phone, metal, bezel, glass) {
  const root = new THREE.Group(); parent.add(root);
  const h = phone ? 2.55 : 2.7, w = h * (phone ? 780 / 1688 : 1024 / 1365);
  const bodyW = w + 0.14, bodyH = h + 0.2, depth = phone ? 0.1 : 0.095;
  s.mesh(root, rounded(bodyW, bodyH, depth, phone ? 0.14 : 0.1), metal);
  s.mesh(root, rounded(bodyW - 0.036, bodyH - 0.036, 0.012, 0.095), bezel, 0, 0, depth / 2 + 0.005);
  s.mesh(root, rounded(w + 0.025, h + 0.025, 0.009, 0.045), glass, 0, 0, depth / 2 + 0.013);
  screen(s, root, map, w, h, 0, 0, depth / 2 + 0.02);
  const fittings = [];
  fittings.push(rounded(0.025, 0.25, 0.04, 0.008).translate(bodyW / 2 + 0.008, 0.55, 0));
  fittings.push(rounded(0.025, 0.17, 0.04, 0.008).translate(-bodyW / 2 - 0.008, 0.7, 0));
  batch(s, root, metal, fittings);
  // Hardware is on the bezel/back, never drawn over the supplied screenshot.
  s.mesh(root, new THREE.CircleGeometry(0.022, 16), glass, 0, bodyH / 2 - 0.05, depth / 2 + 0.015);
  const rear = s.mesh(root, rounded(phone ? 0.34 : 0.2, phone ? 0.5 : 0.2, 0.035, 0.065), bezel, -bodyW / 2 + 0.25, bodyH / 2 - 0.33, -depth / 2 - 0.018);
  rear.rotation.y = Math.PI;
  const lens = s.mesh(root, new THREE.CylinderGeometry(0.065, 0.065, 0.026, 20), glass, -bodyW / 2 + 0.25, bodyH / 2 - 0.27, -depth / 2 - 0.045);
  lens.rotation.x = Math.PI / 2;
  return { root, focal: new THREE.Vector3(), shadow: s.contact(0, 0, 2.6, 2) };
}

export default async function create(ctx) {
  const s = studio(ctx, 4);
  try {
    const maps = [];
    for (const file of ['ehadis40-laptop.webp', 'fiqh-manhaji-tablet.webp', 'haji-pintar-phone.webp']) maps.push(await s.texture(`assets/textures/apps/${file}`));
    const metal = s.material({ color: 0x939a9d, metalness: 1, roughness: 0.31 });
    const bezel = s.material({ color: 0x080b0c, metalness: 0.15, roughness: 0.45 });
    const glass = s.own(new THREE.MeshPhysicalMaterial({ color: 0x111c20, metalness: 0.25, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.12 }));
    const orbit = new THREE.Group(); s.scene.add(orbit);
    const devices = [laptop(s, orbit, maps[0], metal, bezel, glass), handheld(s, orbit, maps[1], false, metal, bezel, glass), handheld(s, orbit, maps[2], true, metal, bezel, glass)];
    const k = {}, world = new THREE.Vector3(), other = new THREE.Vector3();
    return controller(s, {
      name: 'makmal', radius: 3.35, keys: KEYS, pin: true, stable: 0.5,
      targetAt(p, key, out) {
        const a = Math.floor(key.focus), b = Math.min(2, a + 1);
        world.copy(devices[a].focal); devices[a].root.localToWorld(world);
        other.copy(devices[b].focal); devices[b].root.localToWorld(other);
        out.copy(world).lerp(other, key.focus - a);
      },
      pose(p, rig, state) {
        sample(KEYS, p, k);
        const theta = Math.PI * (ramp(p, 0.2, 0.44) + ramp(p, 0.56, 0.78));
        const az = 0.24 * Math.sin(TAU * p);
        rig.azimuth = az; orbit.rotation.y = theta;
        for (let i = 0; i < 3; i++) {
          const d = devices[i];
          const focus = i === 0 ? pulse(p, 0, 0.12, 0.2, 0.34) : i === 1 ? pulse(p, 0.32, 0.44, 0.56, 0.7) : pulse(p, 0.66, 0.78, 0.9, 1);
          const phase = (i - 1) * 2.7;
          // Bring the hero to world-space foreground even on the back half of the orbit.
          // Otherwise the laptop could hide the tablet at the 180-degree checkpoint.
          // Peranti bukan fokus berundur jauh ke belakang dan ke sisi, keluar dari zon teks (semakan Gemini P0).
          const away = 1 - focus;
          d.root.position.set(phase * away * 1.45 - Math.sin(theta) * 1.6 * focus, 1.85 + i * 0.2 + focus * 0.05, (-2.8 - i * 0.95) * away + Math.cos(theta) * 1.6 * focus);
          if (!d.screens) { d.screens = []; d.root.traverse((o) => { if (o.material?.emissiveMap) d.screens.push(o.material); }); }
          for (const m of d.screens) m.emissiveIntensity = 0.18 + 0.82 * focus;
          // The composition revolves; each hero turns its display toward the lens.
          d.root.rotation.set(-k.e * Math.PI / 180 * focus, -theta * focus + az + (i - 1) * 0.2 * (1 - focus), (i - 1) * 0.09 * (1 - focus));
          if (d.hinge) d.hinge.rotation.x = (1 - ramp(p, 0.015, 0.12)) * Math.PI / 2 - 0.02;
          d.root.updateWorldMatrix(true, false);
          d.root.getWorldPosition(world);
          d.shadow.position.x = world.x; d.shadow.position.z = world.z;
        }
        state.yawDeg = theta / TAU * 360;
        state.lidOpenDeg = 90 - devices[0].hinge.rotation.x * 180 / Math.PI;
        state.focus = k.focus;
      },
    });
  } catch (error) { s.dispose(); throw error; }
}
