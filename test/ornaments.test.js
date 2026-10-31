import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import init from 'manifold-3d/manifold';
import {generateOrnament} from '../src/ornament-geometry.js';import {ornamentCollections,releasedOrnamentCollections,validateOrnament} from '../src/ornament-settings.js';import {solid3mf} from '../src/ornament-export.js';import {printProfile} from '../src/print-profile.js';
const m=await init();m.setup();const bytes=fs.readFileSync('src/fonts/DancingScript.ttf'),font=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const build=p=>generateOrnament(m,font,p),restore=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
function files(chunks){const b=Buffer.concat(chunks.map(c=>Buffer.from(c))),result={};for(let i=0;b.readUInt32LE(i)===0x04034b50;){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),start=i+30+n+extra;result[b.subarray(i+30,i+30+n).toString()]=b.subarray(start,start+size);i=start+size;}return result;}
for(const collection of releasedOrnamentCollections)test(`${collection}: every design is connected at both size limits with a real open centre`,()=>{
 for(const [design]of ornamentCollections[collection].designs)for(const diameter of [80,160]){
  const model=build({collection,design,diameter,line1:ornamentCollections[collection].nameExample}),solid=restore(model.parts[0]);
  assert.equal(solid.status(),'NoError');const pieces=solid.decompose();assert.equal(pieces.length,1,design);pieces.forEach(p=>p.delete());
  assert.ok(solid.volume()<Math.PI*(diameter/2)**2*model.settings.thickness*.7,'openwork must not become a filled plaque');
  assert.ok(model.parts[0].printSize.every(x=>x<=170.001));solid.delete();
 }
});
test('every standard wording works without a name and retains a maximum of two lines',()=>{
 for(const collection of releasedOrnamentCollections)for(const [line1,line2]of ornamentCollections[collection].wording){const model=build({collection,design:ornamentCollections[collection].designs[0][0],line1,line2});assert.equal(model.settings.line1,line1);assert.equal(model.settings.line2,line2);}
});
test('AMS lettering is flush, occupies only the first 2/3 layers, and assembles into the same connected print',()=>{
 for(const inlayLayers of [2,3]){const model=build({ams:true,inlayLayers,line1:'Merry',line2:'Christmas'}),[body,text]=model.parts.map(restore);
  assert.equal(model.parts[1].bounds.min[2],0);assert.ok(Math.abs(model.parts[1].bounds.max[2]-inlayLayers*.2)<.001);assert.equal(model.parts[0].colourGroup,model.parts[1].colourGroup);
  const hit=body.intersect(text);assert.ok(hit.volume()<.001);hit.delete();const combined=body.add(text),pieces=combined.decompose();assert.equal(pieces.length,1);pieces.forEach(p=>p.delete());combined.delete();body.delete();text.delete();
  const archive=files(solid3mf(model)),profile=JSON.parse(archive['Metadata/project_settings.config']);for(const [k,v]of Object.entries(printProfile('ornament')))assert.equal(profile[k],v);assert.deepEqual(profile.filament_colour,[model.settings.frameColour,model.settings.textColour]);assert.match(archive['Metadata/model_settings.config'].toString(),/key="extruder" value="2"/);
 }
});
test('printer size includes the hanging loop and invalid text/size/layer requests reject',()=>{
 const model=build({printer:'256',diameter:246});assert.ok(model.parts[0].printSize.every(x=>x<=256.001));
 for(const p of [{diameter:161},{ams:true,diameter:121},{line1:''},{line1:'A\nB'},{line2:'x'.repeat(25)},{inlayLayers:4},{frameColour:'bad'},{thickness:2.5}])assert.throws(()=>validateOrnament(p));
});
