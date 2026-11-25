import { THREE, TAU, studio, controller, rounded, batch, surfaceTexture, leafGeometry, ramp } from './common.js';

const KEYS = [
  { p: 0, d: 1.05, e: 28, sx: 0, syPortrait: 0.05, ty: 1.25 },
  { p: 0.24, d: 0.9, e: 45, sx: 0, syPortrait: 0.04, ty: 1.45 },
  { p: 0.42, d: 0.7, e: 36, sx: 0, syPortrait: 0.02, ty: 1.44 },
  { p: 0.56, d: 0.7, e: 36, sx: 0, syPortrait: 0.02, ty: 1.44 },
  { p: 0.7, d: 0.8, e: 32, sx: 0, syPortrait: 0.04, ty: 1.6 },
  { p: 1, d: 1.05, e: 28, sx: 0, syPortrait: 0.05, ty: 1.25 },
];
const PAGE_W = 1.42, PAGE_H = 2.18;

function stackGeometry() {
  const shape = new THREE.Shape();
  const top = u => 0.06 + 0.17 * Math.sin(Math.PI * u) + u * 0.24;
  shape.moveTo(0, top(0));
  for (let i = 1; i <= 28; i++) shape.lineTo(PAGE_W * i / 28, top(i / 28));
  for (let i = 28; i >= 0; i--) shape.lineTo(PAGE_W * i / 28, top(i / 28) - 0.14);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: PAGE_H, steps: 1, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2); geometry.translate(0, PAGE_H / 2, 0); geometry.clearGroups();
  return geometry;
}

export default async function create(ctx) {
  const s = studio(ctx, 3);
  try {
    const woodMap = s.own(surfaceTexture('wood')), leatherMap = s.own(surfaceTexture('leather'));
    const pageMap = s.own(surfaceTexture('page')), edgeMap = s.own(surfaceTexture('edge'));
    const wood = s.material({ color: 0xb39a7c, map: woodMap, bumpMap: woodMap, bumpScale: 0.012, roughness: 0.48 });
    const leather = s.material({ color: 0x42251a, map: leatherMap, bumpMap: leatherMap, bumpScale: 0.009, roughness: 0.64 });
    const brass = s.material({ color: 0xba9858, metalness: 1, roughness: 0.38 });
    const paper = s.material({ map: pageMap, roughness: 0.97, side: THREE.DoubleSide });
    const edges = s.material({ map: edgeMap, color: 0xd6c7a7, roughness: 0.98 });
    const pivot = new THREE.Group(); s.scene.add(pivot);
    // Two intersecting boards, broad in Z: a physical X-shaped wooden rehal.
    const boards = [], trims = [];
    for (const sign of [-1, 1]) {
      const board = rounded(1.72, 2, 0.13, 0.045);
      board.rotateY(Math.PI / 2); board.rotateZ(sign * 0.62); board.translate(0, 0.87, 0); boards.push(board);
      for (const z of [-0.77, 0.77]) {
        const strip = new THREE.BoxGeometry(0.135, 1.91, 0.014).toNonIndexed();
        strip.translate(0, 0, z); strip.rotateZ(sign * 0.62); strip.translate(0, 0.87, 0); trims.push(strip);
      }
    }
    batch(s, pivot, wood, boards);
    batch(s, pivot, brass, trims);
    const pin = s.mesh(pivot, new THREE.CylinderGeometry(0.075, 0.075, 1.82, 20), brass, 0, 0.87, 0);
    pin.rotation.x = Math.PI / 2;
    const book = new THREE.Group(); book.position.y = 1.65; book.rotation.x = -Math.PI / 2; pivot.add(book);
    const ornaments = [];
    for (const sign of [-1, 1]) {
      const wing = new THREE.Group(); wing.scale.x = sign; book.add(wing);
      const cover = s.mesh(wing, rounded(PAGE_W + 0.09, PAGE_H + 0.12, 0.045, 0.03), leather, PAGE_W / 2, 0, 0.055);
      cover.rotation.y = -Math.atan(0.24 / PAGE_W);
      s.mesh(wing, stackGeometry(), edges);
      const top = leafGeometry(PAGE_W, PAGE_H, 0, ctx.tier === 'low' ? 20 : 36);
      const pos = top.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const u = pos.getX(j) / PAGE_W;
        pos.setZ(j, 0.067 + 0.17 * Math.sin(Math.PI * u) + u * 0.24);
      }
      top.computeVertexNormals(); s.mesh(wing, top, paper);
      // Corner mounts are on the leather margins, not on the neutral page face.
      for (const end of [-1, 1]) {
        const corner = new THREE.BoxGeometry(0.18, 0.055, 0.018).toNonIndexed();
        corner.translate(sign * (PAGE_W - 0.035), end * (PAGE_H / 2 + 0.035), 0.185); ornaments.push(corner);
      }
    }
    batch(s, book, brass, ornaments);
    const spine = s.mesh(book, rounded(0.13, PAGE_H + 0.1, 0.12, 0.035), leather, 0, 0, -0.075);
    spine.castShadow = true;
    const turningGeometry = leafGeometry(PAGE_W, PAGE_H - 0.025, 0, ctx.tier === 'low' ? 24 : 40);
    turningGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    turningGeometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    const turning = s.mesh(book, turningGeometry, paper);
    turning.frustumCulled = false;
    const positions = turningGeometry.attributes.position, normals = turningGeometry.attributes.normal;
    const base = new Float32Array(positions.array);
    s.contact(0, 0, 4.1, 3.3);
    return controller(s, {
      name: 'manuskrip', radius: 3.05, keys: KEYS, stable: 0,
      targetAt(p, k, out) { out.set(0, k.ty, 0); },
      pose(p, rig, state) {
        const yaw = TAU * p;
        rig.azimuth = 0.16 * Math.sin(TAU * p);
        pivot.rotation.y = yaw;
        const t = ramp(p, 0.27, 0.72), angle = Math.PI * t;
        const ca = Math.cos(angle), sa = Math.sin(angle), bend = Math.sin(angle) * 0.25;
        // Analytic surface and normals in existing buffers: right -> arched -> left.
        // +sin(angle) lifts the sheet away from the page block at mid-turn.
        for (let j = 0; j < positions.count; j++) {
          const x = base[j * 3], u = x / PAGE_W;
          const z = 0.17 * Math.sin(Math.PI * u) + u * 0.24;
          const dz = 0.17 * Math.PI / PAGE_W * Math.cos(Math.PI * u) + 0.24 / PAGE_W;
          const extraCurl = bend * Math.sin(Math.PI * u);
          const dx = ca - dz * sa, dzdx = sa + dz * ca + bend * Math.PI / PAGE_W * Math.cos(Math.PI * u);
          const length = Math.hypot(dx, dzdx);
          positions.setXYZ(j, x * ca - z * sa, base[j * 3 + 1], 0.079 + x * sa + z * Math.abs(ca) + extraCurl);
          // Derivative uses |cos| for the page's resting crown on either side.
          const nz = sa + dz * Math.abs(ca) + bend * Math.PI / PAGE_W * Math.cos(Math.PI * u);
          const norm = Math.hypot(dx, nz) || length || 1;
          normals.setXYZ(j, -nz / norm, 0, dx / norm);
        }
        positions.needsUpdate = normals.needsUpdate = true;
        state.yawDeg = p * 360; state.pageTurn = t; state.pageTurnDeg = t * 180;
      },
    });
  } catch (error) { s.dispose(); throw error; }
}
