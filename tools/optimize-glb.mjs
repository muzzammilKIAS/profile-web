#!/usr/bin/env node
// Run from any directory: node tools/optimize-glb.mjs
// Static-only, decoder-free pipeline. Source is never overwritten.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { dedup, flatten, join, weld, prune } from '@gltf-transform/functions';
import validator from 'gltf-validator';

const repo = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(repo, 'assets/models/jamiah-imam.glb');
const output = path.join(repo, 'assets/models/jamiah-imam.opt.glb');
const evidence = path.join(repo, 'tools/reports');
const io = new NodeIO();
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const rawJSON = (bytes) => {
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  return JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
};
const round = (v) => Math.round(v * 1e5) / 1e5;
function point(m, [x, y, z]) {
  return [0, 1, 2].map(i => m[i] * x + m[4 + i] * y + m[8 + i] * z + m[12 + i]);
}
function normal(m, [x, y, z]) {
  // Inverse-transpose of the world transform, followed by normalization.
  const a = [m[0], m[1], m[2]], b = [m[4], m[5], m[6]], c = [m[8], m[9], m[10]];
  const cross = (u, v) => [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
  const ca = cross(b, c), cb = cross(c, a), cc = cross(a, b);
  const det = a.reduce((s, v, i) => s + v * ca[i], 0);
  assert.ok(Math.abs(det) > 1e-12, 'Singular transform');
  const v = ca.map((n, i) => (n*x + cb[i]*y + cc[i]*z) / det);
  const len = Math.hypot(...v);
  return v.map(n => n / len);
}
function geometryFingerprint(doc) {
  // Multiset of oriented triangles, including every corner's attributes and material.
  // Cyclic permutations are equivalent; reversing winding is deliberately not equivalent.
  const triangles = [];
  const materials = doc.getRoot().listMaterials();
  doc.getRoot().getDefaultScene().traverse(node => {
    const matrix = node.getWorldMatrix();
    for (const prim of node.getMesh()?.listPrimitives() ?? []) {
      assert.equal(prim.getMode(), 4, 'Only TRIANGLES supported');
      const semantics = prim.listSemantics().sort();
      const vertices = Array.from({length: prim.getAttribute('POSITION').getCount()}, (_, i) =>
        semantics.map(s => {
          let value = prim.getAttribute(s).getElement(i, []);
          if (s === 'POSITION') value = point(matrix, value);
          if (s === 'NORMAL') value = normal(matrix, value);
          assert.ok(value.every(Number.isFinite));
          return `${s}:${value.map(round).join(',')}`;
        }).join('|'));
      const indices = prim.getIndices()?.getArray() ?? vertices.map((_, i) => i);
      assert.equal(indices.length % 3, 0);
      for (let i = 0; i < indices.length; i += 3) {
        const t = Array.from(indices.slice(i, i+3), n => vertices[n]);
        const cycles = [t, [t[1],t[2],t[0]], [t[2],t[0],t[1]]].map(a => a.join(';')).sort();
        triangles.push(`${materials.indexOf(prim.getMaterial())}:${cycles[0]}`);
      }
    }
  });
  return { sha256: sha(triangles.sort().join('\n')), triangles: triangles.length, decimalPlaces: 5 };
}
function measure(doc, bytes) {
  const root = doc.getRoot(), json = rawJSON(bytes);
  const prims = root.listMeshes().flatMap(m => m.listPrimitives());
  const positionAccessors = new Set(prims.map(p => p.getAttribute('POSITION')));
  const bounds = getBounds(root.getDefaultScene());
  const size = bounds.min.map((v, i) => bounds.max[i] - v);
  let drawCalls = 0, sceneVertices = 0, sceneTriangles = 0;
  root.getDefaultScene().traverse(n => {
    for (const p of n.getMesh()?.listPrimitives() ?? []) {
      drawCalls++;
      sceneVertices += p.getAttribute('POSITION').getCount();
      sceneTriangles += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
    }
  });
  return {
    bytes: bytes.length, sha256: sha(bytes), meshes: root.listMeshes().length,
    primitives: prims.length, nodes: root.listNodes().length, estimatedDrawCalls: drawCalls,
    verticesPerPrimitiveSum: prims.reduce((n,p) => n+p.getAttribute('POSITION').getCount(),0),
    verticesUniquePositionAccessors: [...positionAccessors].reduce((n,a) => n+a.getCount(),0),
    sceneVertices, sceneTriangles, materials: root.listMaterials().length,
    usesImplicitDefaultMaterial: prims.some(p => !p.getMaterial()),
    textures: root.listTextures().map(t => ({ mimeType: t.getMimeType(),
      dimensions: t.getSize(), bytes: t.getImage().byteLength, sha256: sha(t.getImage()) })),
    attributes: [...new Set(prims.map(p => p.listSemantics().sort().join(', ')))],
    bounds: {...bounds, size, center: size.map((v,i) => bounds.min[i]+v/2)},
    units: 'meters by glTF convention; real-world architectural scale not independently verified',
    upAxis: '+Y (world space)', sceneOrigin: [0,0,0], rescaleFactor: 1,
    extensionsUsed: json.extensionsUsed ?? [], extensionsRequired: json.extensionsRequired ?? [],
  };
}
async function validate(bytes, filename) {
  const result = await validator.validateBytes(new Uint8Array(bytes), {uri: filename, maxIssues: 0});
  await writeFile(path.join(evidence, `${filename}.validation.json`), JSON.stringify(result, null, 2)+'\n');
  assert.equal(result.issues.numErrors, 0, `${filename}: validation errors`);
  assert.equal(result.issues.truncated, false, 'Validation must finish without truncation');
  const {messages, ...counts} = result.issues;
  const codes = {};
  for (const message of messages) codes[message.code] = (codes[message.code] ?? 0) + 1;
  return {...counts, codes};
}

await mkdir(evidence, {recursive: true});
const sourceBytes = await readFile(source);
const json = rawJSON(sourceBytes);
assert.equal((json.extensionsUsed ?? []).length, 0, 'Review extensions before optimizing');
const doc = await io.read(source);
const root = doc.getRoot();
assert.equal(root.listScenes().length, 1);
assert.equal(root.listAnimations().length, 0);
assert.equal(root.listSkins().length, 0);
for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
  assert.equal(p.listTargets().length, 0, 'Morph targets require a different pipeline');
  assert.equal(p.getMode(), 4);
}
const before = measure(doc, sourceBytes);
const beforeFingerprint = geometryFingerprint(doc);
const beforeMaterialJSON = (await io.writeJSON(doc)).json.materials;
const sourceValidation = await validate(sourceBytes, 'jamiah-imam.glb');
await doc.transform(
  dedup(), flatten(), join({keepNamed: false, cleanup: true}), weld(), dedup(),
  prune({keepAttributes: true, keepSolidTextures: true}),
);
// Keep a named identity wrapper at the original origin, without recentering or scaling.
const scene = root.getDefaultScene();
const children = scene.listChildren();
const wrapper = doc.createNode('world');
for (const [i, child] of children.entries()) {
  scene.removeChild(child);
  wrapper.addChild(child);
  child.setName(`jamiah-static-${i}`).setExtras({});
  child.getMesh()?.setName(`jamiah-static-${i}`).setExtras({});
}
scene.addChild(wrapper);
await io.write(output, doc);
const outputBytes = await readFile(output);
const reread = await io.read(output);
const after = measure(reread, outputBytes);
const afterFingerprint = geometryFingerprint(reread);
assert.deepEqual(afterFingerprint, beforeFingerprint, 'Triangle/attribute/material association changed');
assert.deepEqual((await io.writeJSON(reread)).json.materials, beforeMaterialJSON, 'Material changed');
assert.deepEqual(after.textures, before.textures, 'Embedded texture changed');
for (const k of ['min','max','size','center']) before.bounds[k].forEach((v,i) => {
  assert.ok(Math.abs(v-after.bounds[k][i]) < 1e-5, `Bounds ${k} changed`);
});
assert.deepEqual(after.attributes, before.attributes);
assert.equal(after.extensionsRequired.length, 0);
assert.equal(after.extensionsUsed.length, 0);
assert.equal(sha(await readFile(source)), before.sha256, 'Source file modified');
const outputValidation = await validate(outputBytes, 'jamiah-imam.opt.glb');
const report = {pipeline: ['dedup','flatten','join','weld (bitwise identical attributes)','dedup','prune'],
  before, after, checks: {reread: true, sourceUnchanged: true, textureBytesIdentical: true,
    materialIdentical: true, triangleFingerprint: beforeFingerprint,
    boundsTolerance: 1e-5, noDecoderExtensions: true,
    normals: 'Absent in source and output; flat shading retained. No normals generated.',
    sourceValidation, outputValidation},
  caveats: ['Per-part mesh names/extras are replaced by aggregate names; no per-part animation/hotspots.',
    'Draw calls estimated for a single color pass with every primitive visible; shadow passes are additional.']};
await writeFile(path.join(evidence, 'glb-optimization.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({before, after, verified: true}, null, 2));
