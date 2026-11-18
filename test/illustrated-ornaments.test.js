import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';import fs from 'node:fs';import {generateOrnament} from '../src/ornament-geometry.js';import {ornament3mf,ornamentGuide} from '../src/ornament-export.js';
const m=await init();m.setup();
for(const collection of ['winter-illustrated','pet-illustrated','funky','gaming'])test(`${collection}: 16 connected, raised-detail ornaments with hanging holes`,()=>{
 const seen=new Set();for(let i=1;i<=16;i++){
  const art=JSON.parse(fs.readFileSync(`src/ornament-artwork/${collection}/${i}.json`));const section=new m.CrossSection(art.base,'EvenOdd');
  const holes=section.toPolygons().filter(a=>{let sum=0;for(let j=0;j<a.length;j++){const u=a[j],v=a[(j+1)%a.length];sum+=u[0]*v[1]-v[0]*u[1];}return sum<-8&&Math.max(...a.map(x=>x[1]))>20;});assert.ok(holes.length,`hanging hole ${collection} ${i}`);section.delete();seen.add(JSON.stringify(art.base));
  for(const ams of [false,true]){const model=generateOrnament(m,null,{collection,design:`${collection}-${i}`,thickness:1.8,ams});assert.ok(Math.abs(model.height-2.4)<1e-4);assert.ok(model.parts.every(p=>p.printSize.every(v=>v<=170)));assert.ok(model.singleColourMesh.faces.length);if(ams)assert.deepEqual(model.parts.map(p=>p.extruder),[1,2]);}
 }assert.equal(seen.size,16);
});
test('manual and AMS ornaments export Bambu projects with correct guidance',()=>{for(const collection of ['winter-illustrated','pet-illustrated','funky','gaming'])for(const ams of [false,true]){const model=generateOrnament(m,null,{collection,design:`${collection}-1`,thickness:1.8,ams});assert.match(ornamentGuide(model),/three black layers/);assert.ok(ornament3mf(model).length);}});
