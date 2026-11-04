import test from 'node:test';
import assert from 'node:assert/strict';
import init from 'manifold-3d/manifold';
import {generateCylinderStand,generateTripodFitTest} from '../src/cylinder-geometry.js';
import {cylinderSettings,tripodFitSpec as T} from '../src/cylinder-settings.js';
import {solid3mf} from '../src/cylinder-export.js';
const m=await init();m.setup();
const restore=part=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:part.mesh.vertices,triVerts:part.mesh.faces}));
function assembled(part){let s=restore(part);for(let a=0;a<3;a++){if(!part.rotation[a])continue;const angles=[0,0,0];angles[a]=part.rotation[a]*180/Math.PI;const next=s.rotate(angles);s.delete();s=next;}const next=s.translate(part.assembly);s.delete();return next;}
function widthAt(s,z){const section=s.slice(z),b=section.bounds();section.delete();return b.max.map((x,i)=>x-b.min[i]);}
function files(chunks){const b=Buffer.concat(chunks.map(c=>Buffer.from(c))),out={};for(let i=0;i+4<b.length&&b.readUInt32LE(i)===0x04034b50;){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),at=i+30+n+extra;out[b.subarray(i+30,i+30+n).toString()]=b.subarray(at,at+size);i=at+size;}return out;}
test('a firm peg option tapers into the existing 10.4 mm sockets, with root interference and roof clearance',()=>{
 const g=generateCylinderStand(m,{stand:'tall-tripod',tripodPegWidth:10.5}),deck=assembled(g.parts.find(p=>p.role==='stand-deck'));
 assert.equal(g.tripodFit.socketWidth,10.4);assert.equal(g.tripodFit.socketDepth,4);assert.equal(g.tripodFit.pegDepth,3.8);
 for(const leg of g.parts.filter(p=>p.role==='stand-leg')){const s=assembled(leg),b=s.boundingBox();assert.ok(Math.abs(b.max[2]-80.8)<.001);const section=s.slice(80.7);assert.ok(Math.abs(section.area()-10.1105263158**2)<.01);section.delete();const hit=deck.intersect(s);assert.ok(hit.volume()>.01,'the previous clearance fit must become a small friction zone');assert.ok(hit.volume()<3,'friction must stay confined to the root');hit.delete();s.delete();}
 const p=g.parts.find(p=>p.role==='stand-leg'),s=assembled(p),root=widthAt(s,77.001),tip=widthAt(s,80.799);assert.ok(Math.abs(root[0]-10.5)<.002);assert.ok(Math.abs(root[1]-10.5)<.002);assert.ok(Math.abs(tip[0]-10.1)<.002);assert.ok(Math.abs(tip[1]-10.1)<.002);s.delete();
 const slice=deck.slice(79),areas=slice.toPolygons().map(poly=>Math.abs(poly.reduce((n,[x,y],i)=>{const q=poly[(i+1)%poly.length];return n+x*q[1]-y*q[0];},0))/2),holes=areas.filter(a=>a<200);assert.equal(holes.length,3);for(const area of holes)assert.ok(Math.abs(area-10.4**2)<.01);slice.delete();const above=deck.slice(81.1);assert.equal(above.toPolygons().length,1);above.delete();deck.delete();
});
test('adjustable legs remain connected and print flat within the selected printer allowance',()=>{
 for(const printer of ['a1-mini','256'])for(const tripodPegWidth of [10.2,10.5,10.8]){const g=generateCylinderStand(m,{stand:'tall-tripod',printer,tripodPegWidth});for(const p of g.parts){const s=restore(p),pieces=s.decompose();assert.equal(s.status(),'NoError');assert.equal(pieces.length,1);pieces.forEach(p=>p.delete());assert.equal(p.bounds.min[2],0);assert.ok(p.printSize.every(v=>v<=170));if(p.role==='stand-leg')assert.ok(Math.abs(p.printSize[2]-tripodPegWidth)<.002);s.delete();}}
 for(const tripodPegWidth of [NaN,10.19,10.81])assert.throws(()=>cylinderSettings({stand:'tall-tripod',tripodPegWidth}));
});
test('joint-test pins share the real leg taper and socket block matches the plate pocket',()=>{
 const g=generateTripodFitTest(m,{});assert.equal(g.parts.length,4);assert.deepEqual(g.tripodFit.pegWidths,[10.4,10.5,10.6]);
 for(const p of g.parts){const s=assembled(p);if(p.role==='tripod-fit-pin'){const root=widthAt(s,12.001),tip=widthAt(s,15.799);assert.ok(Math.abs(root[0]-p.pegWidth)<.002);assert.ok(Math.abs(root[1]-p.pegWidth)<.002);assert.ok(Math.abs(tip[0]-(p.pegWidth-T.leadIn))<.002);}else{const section=s.slice(2),polygons=section.toPolygons();assert.equal(polygons.length,4);section.delete();}s.delete();}
});
test('joint test and replacement legs export as complete lightweight Bambu projects for either printer',()=>{
 for(const printer of ['a1-mini','256']){const full=generateCylinderStand(m,{stand:'tall-tripod',printer}),legs={...full,parts:full.parts.filter(p=>p.role==='stand-leg')};for(const model of [generateTripodFitTest(m,{printer}),legs]){const out=files(solid3mf(model)),profile=JSON.parse(out['Metadata/project_settings.config']),xml=out['3D/3dmodel.model'].toString();assert.equal(profile.top_shell_layers,'3');assert.equal(profile.bottom_shell_layers,'3');assert.match(profile.printer_settings_id,printer==='256'?/Bambu Lab A1 0.4/:/Bambu Lab A1 mini/);assert.equal((xml.match(/<mesh>/g)||[]).length,model.parts.length);assert.doesNotMatch(xml,/lithophane-cylinder/);if(model===legs)assert.doesNotMatch(xml,/tripod-deck/);}}
});

test('joint-test choices stay selectable at both adjustment limits',()=>{for(const tripodPegWidth of [10.2,10.8]){const model=generateTripodFitTest(m,{tripodPegWidth});assert.equal(new Set(model.tripodFit.pegWidths).size,3);assert.ok(model.tripodFit.pegWidths.includes(tripodPegWidth));assert.ok(model.tripodFit.pegWidths.every(w=>w>=10.2&&w<=10.8));}});

test('default fit uses the user confirmed option 3 width',()=>{const g=generateCylinderStand(m,{stand:'tall-tripod'}),s=assembled(g.parts.find(p=>p.role==='stand-leg')),root=widthAt(s,77.001)[0],tip=widthAt(s,80.799)[0],pegBias=9.9-10,printedHole=10.2;assert.equal(g.settings.tripodPegWidth,10.5);assert.ok(root+pegBias-printedHole>.15&&root+pegBias-printedHole<.25);assert.ok(tip+pegBias<printedHole-.1);s.delete();});
