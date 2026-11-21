import test from 'node:test';
import assert from 'node:assert/strict';
import {cylinderDefaults,cylinderImageGrid,cylinderSettings} from '../src/cylinder-settings.js';
import {makeCylinder} from '../src/cylinder-geometry.js';

test('fine detail samples more closely while preserving cylinder fit and settings',()=>{
 assert.equal(cylinderDefaults.detail,'standard');
 assert.deepEqual(cylinderImageGrid({height:94}),{cols:512,rows:172});
 assert.deepEqual(cylinderImageGrid({height:94,detail:'fine'}),{cols:768,rows:257});
 assert.throws(()=>cylinderSettings({detail:'invalid'}));
 for(const height of [70,94,150]){
  const meshes=['standard','fine'].map(detail=>{
   const {cols,rows}=cylinderImageGrid({height,detail});
   const tones=new Uint8Array(cols*rows).fill(128);
   return makeCylinder({height,detail},tones,cols,rows);
  });
  assert.ok(meshes[1].faces.length>meshes[0].faces.length*2);
  for(const mesh of meshes){
   let minZ=Infinity,maxZ=-Infinity,maxRadius=0;
   for(let i=0;i<mesh.vertices.length;i+=3){
    minZ=Math.min(minZ,mesh.vertices[i+2]);maxZ=Math.max(maxZ,mesh.vertices[i+2]);
    maxRadius=Math.max(maxRadius,Math.hypot(mesh.vertices[i],mesh.vertices[i+1]));
   }
   assert.equal(minZ,0);assert.equal(maxZ,height);assert.ok(Math.abs(maxRadius-45)<0.001);
  }
 }
});
