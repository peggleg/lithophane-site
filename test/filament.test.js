import test from 'node:test';
import assert from 'node:assert/strict';
import {meshVolume,filamentParts,filamentReport,gramsText} from '../src/filament.js';
import {ringMesh,makeFan,defaults,instructions,partsZip} from '../src/fan-geometry.js';
test('filament uses enclosed mesh volume, excludes holes and is translation and winding independent',()=>{
 const mesh=ringMesh({height:10,outer:10,inner:5,steps:128}),expected=128/2*Math.sin(2*Math.PI/128)*(100-25)*10;
 assert.ok(Math.abs(meshVolume(mesh)-expected)<.001);
 const moved={vertices:mesh.vertices.map((v,i)=>v+[200,-350,500][i%3]),faces:mesh.faces};assert.ok(Math.abs(meshVolume(moved)-expected)<.01);
 const reversed={vertices:mesh.vertices,faces:mesh.faces.slice().reverse()};assert.ok(Math.abs(meshVolume(reversed)-expected)<.001);
 const parts=[{name:'hollow',mesh},{name:'copy',mesh}],weights=filamentParts(parts);assert.ok(Math.abs(weights[0].solidGrams-expected*.00124)<.00001);assert.ok(weights[0].grams<weights[0].solidGrams);assert.ok(weights[0].grams>weights[0].solidGrams*.08);assert.match(filamentReport(parts),/8% gyroid/);assert.equal(gramsText(.01),'<0.1 g');
});
test('fan estimate includes blades, guards, pivot, washers and optional stands in guide',()=>{
 const a=makeFan(defaults,null),b=makeFan({...defaults,stand:false},null);assert.equal(a.length,b.length+2);assert.ok(filamentParts(a).every(p=>p.grams>0));const guide=instructions(defaults,a);for(const p of a)assert.ok(guide.includes(p.name+': '));assert.match(guide,/8% gyroid/);assert.ok(partsZip(a,defaults).length>0);
});

test('8% infill is applied only after shell material and thin parts are capped at solid volume',async()=>{
 const {plasticVolume,panelGrams,filamentAssumptions}=await import('../src/filament.js');
 assert.equal(plasticVolume(100,20),26.4);assert.equal(plasticVolume(100,200),100);assert.equal(plasticVolume(100,0),8);
 assert.equal(panelGrams(100,100,1),12.4);assert.ok(panelGrams(100,100,3)<37.2);assert.ok(panelGrams(100,100,3)>37.2*.08);assert.match(filamentAssumptions,/2 wall loops/);assert.match(filamentAssumptions,/3 top and 3 bottom/);
});

test('skin-layer profiles change weight estimates without changing model volume or photo defaults',async()=>{const {meshMaterial,filamentAssumptionsFor}=await import('../src/filament.js'),{makePanel}=await import('../src/geometry.js');const mesh=makePanel({width:40,height:40,min:5,max:5,cols:2,rows:2,tones:new Float32Array(4)}),a=meshMaterial(mesh,'keyring'),b=meshMaterial(mesh,'desk'),c=meshMaterial(mesh,'fan');assert.equal(a.volume,b.volume);assert.equal(b.volume,c.volume);assert.ok(a.plastic<b.plastic);assert.ok(b.plastic<c.plastic);assert.deepEqual(meshMaterial(mesh,'future-tool'),b);assert.equal(filamentAssumptionsFor('lithophane'),filamentAssumptionsFor('fan'));});

test('mount estimates use four walls and 30% core without changing the model volume',async()=>{const {makePanel}=await import('../src/geometry.js'),{meshMaterial,filamentAssumptionsFor,plasticVolume}=await import('../src/filament.js');const mesh=makePanel({width:40,height:40,min:12,max:12,cols:2,rows:2,tones:new Float32Array(4)}),light=meshMaterial(mesh,'desk'),mount=meshMaterial(mesh,'desk-clamp');assert.equal(light.volume,mount.volume);assert.ok(mount.plastic>light.plastic);assert.ok(mount.plastic<=mount.volume);assert.equal(plasticVolume(100,20,.3),44);assert.match(filamentAssumptionsFor('desk-clamp'),/30% gyroid/);assert.match(filamentAssumptionsFor('desk-clamp'),/4 wall loops/);assert.match(filamentAssumptionsFor('desk-clamp'),/30% infill applies only/);assert.match(filamentAssumptionsFor('desk'),/8% infill applies only/);});
