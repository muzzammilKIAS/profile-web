#!/usr/bin/env node
// CPU integration test using the repo's actual GLTFLoader/Three.js modules.
// Node has no ImageBitmap: sharp decodes PNG pixels for a minimal image shim.
// This validates parsing and texture decoding, NOT WebGL upload/rendering.
import { registerHooks } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
registerHooks({resolve(specifier, context, nextResolve) {
  if (specifier === 'three') return {url: new URL('vendor/three/three.module.min.js',root).href, shortCircuit:true};
  return nextResolve(specifier, context);
}});
globalThis.self = globalThis;
globalThis.createImageBitmap = async (blob) => {
  const {data,info} = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  return {width:info.width, height:info.height, data, close(){}};
};
const THREE = await import(new URL('vendor/three/three.module.min.js',root));
const {GLTFLoader} = await import(new URL('vendor/three/addons/loaders/GLTFLoader.js',root));
const results=[];
for (const filename of ['jamiah-imam.glb','jamiah-imam.opt.glb']) {
  const bytes=await readFile(new URL(`assets/models/${filename}`,root));
  const loader=new GLTFLoader(); // Deliberately no decoder configuration.
  const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  gltf.scene.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(gltf.scene,true);
  const r={filename, meshes:0, vertices:0, triangles:0, flatShadedMeshes:0, vertexColoredMeshes:0, textures:[],
    bounds:{min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new THREE.Vector3()).toArray(),center:box.getCenter(new THREE.Vector3()).toArray()}};
  gltf.scene.traverse(o=>{
    if(!o.isMesh)return;
    r.meshes++;r.vertices+=o.geometry.attributes.position.count;
    r.triangles+=(o.geometry.index?.count ?? o.geometry.attributes.position.count)/3;
    if(o.material.flatShading)r.flatShadedMeshes++;
    if(o.material.vertexColors)r.vertexColoredMeshes++;
    if(o.material.map){
      const im=o.material.map.image;
      assert.ok(im?.data?.length>0,'Image did not decode');
      r.textures.push({width:im.width,height:im.height,rgbaBytes:im.data.length,
        sha256:createHash('sha256').update(im.data).digest('hex'),colorSpace:o.material.map.colorSpace});
    }
  });
  assert.equal(r.triangles,42154);
  assert.equal(r.flatShadedMeshes,r.meshes);
  assert.equal(r.textures.length,1);
  assert.equal(r.textures[0].width,355);
  assert.equal(r.textures[0].height,49);
  results.push(r);
}
assert.equal(results[0].meshes,1520);
assert.equal(results[1].meshes,2);
assert.deepEqual(results[0].bounds,results[1].bounds);
assert.deepEqual(results[0].textures,results[1].textures);
const report={threeRevision:THREE.REVISION, node:process.version, decoderConfigured:false,
  method:'Vendored GLTFLoader.parseAsync in Node; sharp-backed ImageBitmap shim; no WebGL renderer',
  webglRenderTested:false, results};
await writeFile(new URL('tools/reports/gltfloader-validation.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
