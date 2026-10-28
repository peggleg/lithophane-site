import {monsteraSections}from'../src/monstera.js';
import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';import {generateDeskModel}from '../src/desk-geometry.js';import {deskDefaults,deskPresets}from '../src/desk-settings.js';import {solid3mf}from '../src/solid-export.js';import {deskGuide}from '../src/desk-export.js';
const m=await init();m.setup();const raw=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
test('flush AMS veins occupy only the first 2 or 3 layers and exactly fill body pockets',()=>{
 for(const printer of ['a1-mini','256'])for(const veinLayers of [2,3])for(const [width,depth]of [[60,160],[100,125],[160,60]])for(const leafBacking of ['backed','open']){
  const model=generateDeskModel(m,{...deskDefaults,...deskPresets.coaster,kind:'coaster',coasterShape:'monstera',coasterSurface:'flat',leafVeins:'ams',veinLayers,width,depth,leafBacking,printer});
  assert.equal(model.parts.length,8);assert.equal(model.coasterFit.inlayDepth,veinLayers*.2);assert.equal(model.coasterFit.veinDepth,0);
  for(let i=0;i<model.parts.length;i+=2){const [body,veins]=model.parts.slice(i,i+2),a=raw(body),b=raw(veins),hit=a.intersect(b),whole=a.add(b);assert.equal(veins.extruder,2);assert.equal(body.extruder,1);assert.equal(body.colourGroup,veins.colourGroup);assert.equal(body.x,veins.x);assert.equal(body.y,veins.y);assert.ok(Math.abs(veins.bounds.min[2])<.0001);assert.ok(Math.abs(veins.bounds.max[2]-veinLayers*.2)<.0001);assert.ok(hit.volume()<.001);const shells=whole.decompose();assert.equal(shells.length,1,'inlays fused to leaf body, no loose colour pieces');const base=whole.slice(.1),upper=whole.slice(veinLayers*.2+.1),missing=base.subtract(upper);assert.ok(missing.area()<.001,'inlay covered by continuous leaf above it');shells.forEach(x=>x.delete());for(const s of [a,b,hit,whole,base,upper,missing])s.delete();}
  assert.match(deskGuide(model),/first [23] layers/);assert.match(deskGuide(model),/5 top \/ 5 bottom/);
 }
});
test('3MF exports each leaf and its inlays as one object with two assigned filaments',()=>{
 const model=generateDeskModel(m,{...deskDefaults,...deskPresets.coaster,kind:'coaster',coasterShape:'monstera',coasterSurface:'flat',leafVeins:'ams'}),buffer=Buffer.concat(solid3mf(model).map(x=>Buffer.from(x))),xml=buffer.toString();assert.match(xml,/coaster-1-veins/);assert.match(xml,/key="extruder" value="2"/);assert.match(xml,/<component objectid="2"/);assert.match(xml,/#b9ce86/);
 assert.throws(()=>generateDeskModel(m,{...model.settings,coasterSurface:'recessed'}),/flat leaf/);
});

test('guide veins form one connected lobe-following network clear of enclosed holes',()=>{for(const [w,d]of [[60,60],[60,160],[100,125],[160,60],[160,160],[60,246],[246,60],[246,246]]){const o=[],own=x=>(o.push(x),x),s=monsteraSections(m,own,w,d),intersection=own(s.veins.intersect(s.holes)),network=own(s.veins.subtract(s.holes)),pieces=network.decompose();assert.ok(intersection.area()<.001);assert.equal(pieces.length,1);pieces.forEach(x=>x.delete());o.reverse().forEach(x=>x.delete());}});
