import test from 'node:test';
import assert from 'node:assert/strict';
import {meshVolume,filamentParts,filamentReport,gramsText} from '../src/filament.js';
import {ringMesh,makeFan,defaults,instructions,partsZip} from '../src/fan-geometry.js';
test('filament uses enclosed mesh volume, excludes holes and is translation and winding independent',()=>{
 const mesh=ringMesh({height:10,outer:10,inner:5,steps:128}),expected=128/2*Math.sin(2*Math.PI/128)*(100-25)*10;
 assert.ok(Math.abs(meshVolume(mesh)-expected)<.001);
 const moved={vertices:mesh.vertices.map((v,i)=>v+[200,-350,500][i%3]),faces:mesh.faces};assert.ok(Math.abs(meshVolume(moved)-expected)<.01);
 const reversed={vertices:mesh.vertices,faces:mesh.faces.slice().reverse()};assert.ok(Math.abs(meshVolume(reversed)-expected)<.001);
 const parts=[{name:'hollow',mesh},{name:'copy',mesh}],weights=filamentParts(parts);assert.ok(Math.abs(weights[0].grams-expected*.00124)<.00001);assert.match(filamentReport(parts),/Total: 5.8 g/);assert.equal(gramsText(.01),'<0.1 g');
});
test('fan estimate includes blades, guards, pivot, washers and optional stands in guide',()=>{
 const a=makeFan(defaults,null),b=makeFan({...defaults,stand:false},null);assert.equal(a.length,b.length+2);assert.ok(filamentParts(a).every(p=>p.grams>0));const guide=instructions(defaults,a);for(const p of a)assert.ok(guide.includes(p.name+': '));assert.match(guide,/100% infill/);assert.ok(partsZip(a,defaults).length>0);
});
