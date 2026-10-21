import assert from 'node:assert/strict';
import {createCoinMesh} from '../coin-scene.js';
const mesh=createCoinMesh(),edges=new Map();let minZ=Infinity,maxZ=-Infinity;
const point=index=>Array.from(mesh.slice(index,index+3),v=>Math.abs(v)<.000001?'0':v.toFixed(5)).join(',');
for(let i=0;i<mesh.length;i+=21){
 const triangle=[point(i),point(i+7),point(i+14)];
 for(let j=0;j<3;j++){const key=[triangle[j],triangle[(j+1)%3]].sort().join('|');edges.set(key,(edges.get(key)||0)+1)}
}
assert.ok([...edges.values()].every(n=>n===2),'all welded edges must belong to two triangles: no open sides');
for(let i=0;i<mesh.length;i+=7){minZ=Math.min(minZ,mesh[i+2]);maxZ=Math.max(maxZ,mesh[i+2]);assert.ok(Math.max(Math.abs(mesh[i]),Math.abs(mesh[i+1]))>=.179,'central square tunnel stays open');assert.ok(Number.isFinite(mesh[i+3]+mesh[i+4]+mesh[i+5]))}
assert.ok(maxZ-minZ>.12,'coin is a solid volume rather than a single plane');
console.log('PASS: closed bevelled coin volume, square tunnel, finite normals and continuous side walls.');
