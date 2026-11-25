import { THREE, TAU, studio, controller, batch, canvasTexture, ramp } from './common.js';

const KEYS = [
  { p: 0, d: 1.12, e: 22, sx: 0, syPortrait: 0.05, tx: 0, ty: 2 },
  { p: 0.28, d: 0.87, e: 18, sx: 0, syPortrait: 0.05, tx: -0.2, ty: 1.9 },
  { p: 0.4, d: 0.37, e: 8, sx: 0, syPortrait: 0.02, tx: -0.44, ty: 1.8 },
  { p: 0.5, d: 0.86, e: 5, sx: 0, syPortrait: 0.02, tx: 0, ty: 2 },
  { p: 0.6, d: 0.4, e: 9, sx: 0, syPortrait: 0.02, tx: 0.48, ty: 1.63 },
  { p: 0.78, d: 0.96, e: 26, sx: 0, syPortrait: 0.05, tx: 0, ty: 2 },
  { p: 1, d: 1.12, e: 22, sx: 0, syPortrait: 0.05, tx: 0, ty: 2 },
];

function star(radius) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? radius * 0.53 : radius;
    const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    if (i) shape.lineTo(x, y); else shape.moveTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.018, bevelThickness: 0.014 });
  geometry.clearGroups();
  return geometry;
}

function medal(s, metal, ribbonMaterial, x, y, z) {
  const root = new THREE.Group(); root.position.set(x, y, z); s.scene.add(root);
  const segments = s.ctx.tier === 'low' ? 48 : 80;
  const disc = new THREE.CylinderGeometry(0.67, 0.67, 0.105, segments);
  disc.rotateX(Math.PI / 2);
  s.mesh(root, disc, metal);
  const details = [];
  for (const side of [-1, 1]) {
    details.push(new THREE.TorusGeometry(0.626, 0.026, 8, segments).toNonIndexed().translate(0, 0, side * 0.058));
    details.push(new THREE.TorusGeometry(0.55, 0.009, 6, segments).toNonIndexed().translate(0, 0, side * 0.058));
    const emblem = star(0.46);
    if (side < 0) emblem.rotateY(Math.PI);
    emblem.translate(0, 0, side * 0.064); details.push(emblem);
  }
  details.push(new THREE.TorusGeometry(0.108, 0.025, 8, 28).toNonIndexed().translate(0, 0.755, 0));
  // Fine, physical reeding catches the moving key light at the edge.
  for (let i = 0; i < (s.ctx.tier === 'low' ? 48 : 80); i++) {
    const a = i / (s.ctx.tier === 'low' ? 48 : 80) * TAU;
    const g = new THREE.BoxGeometry(0.013, 0.018, 0.086).toNonIndexed();
    g.rotateZ(a); g.translate(Math.sin(a) * 0.669, Math.cos(a) * 0.669, 0); details.push(g);
  }
  batch(s, root, metal, details);
  const ribbons = [];
  for (const sign of [-1, 1]) {
    const g = new THREE.PlaneGeometry(0.24, 0.78, 3, 12);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = (pos.getY(i) + 0.39) / 0.78;
      pos.setXYZ(i, pos.getX(i) * (1 - v * 0.15) + sign * (0.07 + v * 0.13), 0.84 + v * 0.78, -0.03 - v * 0.05 + Math.sin(v * Math.PI) * 0.025 * sign);
    }
    g.computeVertexNormals(); ribbons.push(g.toNonIndexed()); g.dispose();
  }
  batch(s, root, ribbonMaterial, ribbons);
  s.contact(x, z, 2.1, 1.6);
  return root;
}

export default async function create(ctx) {
  const s = studio(ctx, 3);
  try {
    const brush = s.own(canvasTexture(256, 256, (g, w, h) => {
      g.fillStyle = '#dedede'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) { g.fillStyle = y % 6 ? '#c8c8c8' : '#eeeeee'; g.fillRect(0, y, w, 1); }
    }));
    const gold = s.own(new THREE.MeshPhysicalMaterial({ color: 0xe7b85f, metalness: 1, roughness: 0.32, roughnessMap: brush, anisotropy: ctx.tier === 'high' ? 0.2 : 0 }));
    const silver = s.own(new THREE.MeshPhysicalMaterial({ color: 0xc7d0d4, metalness: 1, roughness: 0.35, roughnessMap: brush, anisotropy: ctx.tier === 'high' ? 0.17 : 0 }));
    // Reben satin: zamrud untuk emas, lapis untuk perak (tiada logo atau teks pertandingan).
    const ribbon = s.material({ color: 0x184a39, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide });
    const ribbonSilver = s.material({ color: 0x23466e, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide });
    const goldMedal = medal(s, gold, ribbon, -0.58, 1.48, 0.3);
    const silverMedal = medal(s, silver, ribbonSilver, 0.65, 1.21, -0.12);
    // Physical light sweeps over the raised relief; no emissive/neon effect.
    const sweep = new THREE.SpotLight(0xffefd5, 35, 15, 0.5, 0.85, 2);
    sweep.position.set(-3, 3, 4); sweep.target.position.set(0, 1.5, 0);
    s.scene.add(sweep, sweep.target);
    return controller(s, {
      name: 'pingat', radius: 2.05, keys: KEYS, stable: 0.5,
      targetAt(p, k, out) { out.set(k.tx, k.ty, 0.12); },
      pose(p, rig, state) {
        const turn = Math.PI * (ramp(p, 0.04, 0.44) + ramp(p, 0.56, 0.96)) - Math.PI;
        const az = 0.1 * Math.sin(TAU * p);
        rig.azimuth = az;
        goldMedal.rotation.set(-0.087, turn + az, -0.09 * Math.sin(TAU * p));
        silverMedal.rotation.set(-0.087, -turn + az, 0.08 * Math.sin(TAU * p));
        sweep.position.x = -3.5 + 7 * ramp(p, 0.28, 0.7);
        sweep.position.y = 3 + Math.sin(Math.PI * p);
        state.yawDeg = (turn + Math.PI) * 180 / Math.PI;
        state.silverYawDeg = -state.yawDeg;
        state.lightX = sweep.position.x;
      },
    });
  } catch (error) { s.dispose(); throw error; }
}
