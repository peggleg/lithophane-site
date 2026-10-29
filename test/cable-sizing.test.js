import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';
import {validateProduct,productItems} from '../src/product-settings.js';import {cableDimensions} from '../src/cable-settings.js';import {generateProduct} from '../src/product-geometry.js';
const m=await init();m.setup();
test('both cable guides derive circular seats and clip depth from diameter and clearance',()=>{
 for(const kind of ['cable-guide','pegboard-cables'])for(const cableDiameter of [2,5,8])for(const cableClearance of [.15,.3,.5]){
  const p=validateProduct({kind,cableDiameter,cableClearance,depth:9999}),d=cableDimensions(p);
  assert.ok(Math.abs(d.seatDiameter-cableDiameter-2*cableClearance)<1e-9);assert.equal(p.depth,d.depth);assert.ok(p.depth<30);assert.ok(!productItems[kind].fields.some(([key])=>key==='depth'));assert.equal(d.mouthWidth,cableDiameter-.6);
 }
 const a=validateProduct({kind:'cable-guide',cableDiameter:2}),b=validateProduct({kind:'cable-guide',cableDiameter:8});assert.equal(b.depth-a.depth,6);
});
test('minimum and maximum cable clearances preserve closed connected geometry and shared interface',()=>{
 for(const kind of ['cable-guide','pegboard-cables'])for(const cableDiameter of [2,8])for(const cableClearance of [.15,.5]){
  const g=generateProduct(m,{kind,cableDiameter,cableClearance,channels:3}),p=g.parts[0],s=new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces})),pieces=s.decompose();assert.equal(s.status(),'NoError');assert.equal(pieces.length,1);pieces.forEach(x=>x.delete());s.delete();assert.ok(p.printSize.every(x=>x<=170));assert.equal(g.productFit.interface.length,40);assert.equal(g.productFit.cable.depth,g.settings.depth);assert.ok(!g.guide.includes('undefined'));
 }
});
