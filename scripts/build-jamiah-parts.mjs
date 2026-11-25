// Bina `assets/models/jamiah-imam.parts.glb` daripada GLB asal (tidak diubah):
// gabungkan 1,520 mesh kepada satu mesh bagi setiap jenis bahan (batu, gangsa, kubah, kaca, tumbuhan, papan tanda),
// bakar transform dunia dan kimpal verteks. Normal dikira semasa muat.
// Guna: node scripts/build-jamiah-parts.mjs   (perlukan @gltf-transform/core; lihat README)
import { NodeIO, Document } from '@gltf-transform/core';
const SRC = 'assets/models/jamiah-imam.glb', OUT = 'assets/models/jamiah-imam.parts.glb';
const io = new NodeIO();
const src = await io.read(SRC);
const toHex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(Math.pow(v, 1 / 2.2) * 255).toString(16).padStart(2, '0')).join('');
const BY_COLOR = { '#8aa674': 'foliage', '#a4b484': 'lawn', '#77736e': 'bronze', '#aaadac': 'slate', '#6e8489': 'glass' };
const parts = {};
let signTexture = null;
for (const node of src.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'), col = prim.getAttribute('COLOR_0'), uv = prim.getAttribute('TEXCOORD_0'), idx = prim.getIndices();
    const c0 = [1, 1, 1, 1]; if (col) col.getElement(0, c0);
    let cat = uv ? 'sign' : (BY_COLOR[toHex(c0)] || 'stone');
    // Bebola semak (sfera hijau) dipisahkan supaya boleh digayakan sebagai topiari maket.
    if (cat === 'foliage' && /^part/.test(node.getName())) cat = 'shrub';
    if (uv) signTexture = prim.getMaterial()?.getBaseColorTexture() || signTexture;
    const part = parts[cat] ||= { tris: [] };
    const count = idx ? idx.getCount() : pos.getCount();
    const el = [0, 0, 0], ce = [1, 1, 1, 1], ue = [0, 0];
    for (let i = 0; i < count; i++) {
      const v = idx ? idx.getScalar(i) : i;
      pos.getElement(v, el); if (col) col.getElement(v, ce); if (uv) uv.getElement(v, ue);
      part.tris.push({
        p: [m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12], m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13], m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14]],
        c: [ce[0], ce[1], ce[2]], uv: [ue[0], ue[1]],
      });
    }
  }
}
const out = new Document();
const buffer = out.createBuffer();
const scene = out.createScene('jamiah');
const report = [];
for (const [name, part] of Object.entries(parts)) {
  // Kimpal verteks yang sama (kedudukan + warna + UV) dan guna indeks supaya fail kekal kecil.
  // Normal tidak disimpan: dikira semasa muat (rata atau licin mengikut nama bahagian).
  const n = part.tris.length;
  const lookup = new Map(), positions = [], colors = [], uvs = [], indices = [];
  const needColor = name === 'stone', needUv = name === 'sign';
  for (const vert of part.tris) {
    const k = vert.p.map((v) => Math.round(v * 2000)).join(',') + (needColor ? '|' + vert.c.map((v) => Math.round(v * 255)).join(',') : '') + (needUv ? '|' + vert.uv.join(',') : '');
    let index = lookup.get(k);
    if (index === undefined) {
      index = positions.length / 3; lookup.set(k, index);
      positions.push(...vert.p); if (needColor) colors.push(...vert.c.map((v) => Math.round(v * 255))); if (needUv) uvs.push(...vert.uv);
    }
    indices.push(index);
  }
  const vertexCount = positions.length / 3;
  const prim = out.createPrimitive()
    .setAttribute('POSITION', out.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer))
    .setIndices(out.createAccessor().setType('SCALAR').setArray(vertexCount > 65535 ? new Uint32Array(indices) : new Uint16Array(indices)).setBuffer(buffer));
  if (needColor) prim.setAttribute('COLOR_0', out.createAccessor().setType('VEC3').setNormalized(true).setArray(new Uint8Array(colors)).setBuffer(buffer));
  const material = out.createMaterial(name).setRoughnessFactor(0.9).setMetallicFactor(0);
  if (name === 'sign') {
    prim.setAttribute('TEXCOORD_0', out.createAccessor().setType('VEC2').setArray(new Float32Array(uvs)).setBuffer(buffer));
    if (signTexture) material.setBaseColorTexture(out.createTexture('sign').setImage(signTexture.getImage()).setMimeType(signTexture.getMimeType()));
  }
  prim.setMaterial(material);
  scene.addChild(out.createNode(name).setMesh(out.createMesh(name).addPrimitive(prim)));
  report.push(`${name}: ${n / 3} segi tiga, ${vertexCount} verteks`);
}
await io.write(OUT, out);
console.log(report.join(' | '));
