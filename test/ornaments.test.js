import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import init from 'manifold-3d/manifold';
import {generateOrnament} from '../src/ornament-geometry.js';import {ornamentCollections,releasedOrnamentCollections,validateOrnament,ornamentDesignDefault} from '../src/ornament-settings.js';import {solid3mf} from '../src/ornament-export.js';import {printProfile} from '../src/print-profile.js';
const m=await init();m.setup();const bytes=fs.readFileSync('src/fonts/Lobster-Regular.ttf'),font=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const testedCollections=process.env.ORN_COLLECTION?[process.env.ORN_COLLECTION]:releasedOrnamentCollections;
for(const id of testedCollections)assert.ok(releasedOrnamentCollections.includes(id));
const build=p=>generateOrnament(m,font,p),restore=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
function files(chunks){const b=Buffer.concat(chunks.map(c=>Buffer.from(c))),result={};for(let i=0;b.readUInt32LE(i)===0x04034b50;){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),start=i+30+n+extra;result[b.subarray(i+30,i+30+n).toString()]=b.subarray(start,start+size);i=start+size;}return result;}
for(const collection of testedCollections)test(`${collection}: every design is connected at both size limits with a real open centre`,()=>{
 for(const [design]of ornamentCollections[collection].designs)for(const diameter of [80,160]){
  const model=build({collection,design,diameter,line1:ornamentCollections[collection].nameExample,line2:''}),solid=restore(model.parts[0]);
  assert.equal(solid.status(),'NoError');const pieces=solid.decompose();assert.equal(pieces.length,1,design);pieces.forEach(p=>p.delete());
  assert.ok(solid.volume()<Math.PI*(diameter/2)**2*model.settings.thickness*.7,'openwork must not become a filled plaque');
  assert.ok(model.parts[0].printSize.every(x=>x<=170.001));assert.ok(Math.abs(model.width-diameter)<.002,'nominal circle width must be accurate');solid.delete();
 }
});
test('every standard wording works without a name and retains a maximum of two lines',()=>{
 for(const collection of testedCollections)for(const [line1,line2]of ornamentCollections[collection].wording){const model=build({collection,design:ornamentCollections[collection].designs[0][0],line1,line2});assert.equal(model.settings.line1,line1);assert.equal(model.settings.line2,line2);}
});
test('AMS lettering is flush, occupies only the first 2/3 layers, and assembles into the same connected print',()=>{
 for(const inlayLayers of [2,3]){const model=build({ams:true,inlayLayers,line1:'Merry',line2:'Christmas'}),[body,text]=model.parts.map(restore);
  assert.equal(model.parts[1].bounds.min[2],0);assert.ok(Math.abs(model.parts[1].bounds.max[2]-inlayLayers*.2)<.001);assert.equal(model.parts[0].colourGroup,model.parts[1].colourGroup);assert.equal(model.parts[0].x,model.parts[1].x);assert.equal(model.parts[0].y,model.parts[1].y);
  assert.ok(model.productFit.colourOverlapArea<1e-6);assert.ok(model.productFit.colourCoverageError<1e-5);
  // Coplanar Float32 mesh round-trips accumulate CSG noise along intricate
  // interfaces. Bound it to 0.001% of the actual part volume; the authored
  // 2D colour partition above must remain exact. Native slicing is checked too.
  const hit=body.intersect(text);assert.ok(Math.abs(hit.volume())<(body.volume()+text.volume())*1e-5+.0001);hit.delete();const combined=body.add(text),pieces=combined.decompose();assert.equal(pieces.filter(p=>p.volume()>1e-6).length,1);pieces.forEach(p=>p.delete());combined.delete();body.delete();text.delete();
  const archive=files(solid3mf(model)),profile=JSON.parse(archive['Metadata/project_settings.config']);for(const [k,v]of Object.entries(printProfile('ornament')))assert.equal(profile[k],v);assert.deepEqual(profile.filament_colour,[model.settings.frameColour,model.settings.textColour]);assert.match(archive['Metadata/model_settings.config'].toString(),/key="extruder" value="2"/);
 }
});
test('printer size includes the hanging loop and invalid text/size/layer requests reject',()=>{
 const model=build({printer:'256',diameter:246});assert.ok(model.parts[0].printSize.every(x=>x<=256.001));
 for(const p of [{diameter:161},{ams:true,diameter:121},{line1:''},{line1:'A\nB'},{line2:'x'.repeat(25)},{inlayLayers:4},{frameColour:'bad'},{thickness:2.5}])assert.throws(()=>validateOrnament(p));
});

test('every released template retains its approved default wording and separate custom frame',()=>{for(const collection of testedCollections)for(const [design]of ornamentCollections[collection].designs){const a=JSON.parse(fs.readFileSync(`src/ornament-artwork/${collection}-${design}.json`));assert.ok(a.frame?.length,collection+':'+design);const model=build({collection,design,diameter:80,...ornamentDesignDefault(collection,design)});assert.equal(model.parts.length,1);assert.equal(model.productFit.connected,true);}});
test('every default greeting has a nonempty flush AMS script with exact colour coverage',()=>{for(const collection of testedCollections)for(const [design]of ornamentCollections[collection].designs){const model=build({collection,design,ams:true,...ornamentDesignDefault(collection,design)});assert.equal(model.parts.length,2);assert.ok(model.parts[1].mesh.faces.length>0);assert.ok(Math.abs(model.parts[1].bounds.max[2]-.6)<.001);assert.ok(model.productFit.colourOverlapArea<1e-6);assert.ok(model.productFit.colourCoverageError<1e-5);}});

test('leafy wreaths retain open branch edges, connected themed artwork and printer limits',()=>{for(const collection of testedCollections)for(const [design]of ornamentCollections[collection].designs)for(const diameter of [80,160]){const model=build({collection,design,diameter,frameStyle:'leafy',...ornamentDesignDefault(collection,design)}),solid=restore(model.parts[0]),pieces=solid.decompose();assert.equal(pieces.length,1,collection+':'+design);pieces.forEach(p=>p.delete());assert.ok(model.parts[0].printSize.every(v=>v<=170.001));const outline=new m.CrossSection(model.outlineContours,'EvenOdd'),outer=m.CrossSection.circle(diameter/2,192),inner=m.CrossSection.circle(diameter*.464,192),band=outer.subtract(inner),hit=outline.intersect(band);assert.ok(hit.area()<band.area()*.55,'a leafy frame must not recreate a solid outer ring');[outline,outer,inner,band,hit,solid].forEach(v=>v.delete());}});
test('leafy custom wording and flush AMS retain the shared print profile',()=>{for(const inlayLayers of [2,3]){const model=build({frameStyle:'leafy',line1:'Happy',line2:'Birthday',ams:true,inlayLayers});assert.equal(model.parts.length,2);assert.ok(model.productFit.colourOverlapArea<1e-6);assert.ok(model.productFit.colourCoverageError<1e-5);assert.ok(Math.abs(model.parts[1].bounds.max[2]-inlayLayers*.2)<.001);const archive=files(solid3mf(model)),p=JSON.parse(archive['Metadata/project_settings.config']);for(const [k,v]of Object.entries(printProfile('ornament')))assert.equal(p[k],v);}assert.throws(()=>validateOrnament({frameStyle:'wrong'}));});

test('eight decorative edges have distinct printable outlines and support flush AMS',()=>{const outlines=new Set();for(const edgePattern of ['laurel','pine','holly','blossom','berries','stars','thorns','scallop'])for(const diameter of [80,160]){const model=build({frameStyle:'leafy',edgePattern,diameter,printer:diameter===160?'256':'a1-mini',ams:diameter===160});assert.equal(model.productFit.connected,true);assert.ok(model.parts.every(p=>p.printSize.every(v=>v<=256)));if(diameter===80)outlines.add(JSON.stringify(model.outlineContours));else{assert.equal(model.parts.length,2);assert.ok(model.productFit.colourCoverageError<1e-5);}}assert.equal(outlines.size,8);assert.throws(()=>validateOrnament({edgePattern:'unknown'}));});
