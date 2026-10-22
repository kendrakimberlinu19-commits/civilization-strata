import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {archiveModels} from '../data/models.js';
import {categories} from '../data/archive.js';
assert.equal(archiveModels.length,12);
assert.equal(new Set(archiveModels.map(m=>m.id)).size,12);
let total=0;
for(const category of categories)assert.equal(archiveModels.filter(m=>m.theme===category.id).length,2);
for(const model of archiveModels){
 const bytes=await readFile(new URL('../'+model.src,import.meta.url));
 assert.equal(bytes.readUInt32LE(0),0x46546c67,'GLB signature');
 assert.equal(bytes.readUInt32LE(4),2,'glTF version');
 assert.equal(bytes.readUInt32LE(8),bytes.length,'complete GLB file');
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 assert(json.extensionsRequired.includes('KHR_draco_mesh_compression'));
 assert(json.meshes?.length&&json.materials?.length&&json.images?.length);
 assert(!json.buffers.some(b=>b.uri),'geometry must be embedded');
 assert(!json.images.some(i=>i.uri),'textures must be embedded');
 assert(bytes.length<3_000_000,'web model size budget');
 await access(new URL('../'+model.poster,import.meta.url));
 total+=bytes.length;
}
for(const file of ['assets/vendor/model-viewer/model-viewer.min.js','assets/vendor/model-viewer/draco/draco_wasm_wrapper.js','assets/vendor/model-viewer/draco/draco_decoder.wasm'])await access(new URL('../'+file,import.meta.url));
console.log('PASS: six model pairs, valid embedded GLBs, local decoders, '+(total/1e6).toFixed(2)+' MB total.');

