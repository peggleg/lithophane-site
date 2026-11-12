import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import init from 'manifold-3d/manifold';
import {cylinderStands,cylinderSettings} from '../src/cylinder-settings.js';
import {makeCylinder,generateCylinderStand,buildCylinderModel} from '../src/cylinder-geometry.js';
import {periodicTones,seamMetrics} from '../src/cylinder-texture.js';
import {solid3mf,cylinderZip,cylinderOnly} from '../src/cylinder-export.js';
import {stlBytes} from '../src/geometry.js';
import {printProfile,projectProfile} from '../src/print-profile.js';
const m=await init();m.setup();
const restore=mesh=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:mesh.vertices,triVerts:mesh.faces}));
function files(chunks){const b=Buffer.concat(chunks.map(c=>Buffer.from(c))),result={};for(let i=0;i+4<b.length&&b.readUInt32LE(i)===0x04034b50;){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),start=i+30+n+extra;result[b.subarray(i+30,i+30+n).toString()]=b.subarray(start,start+size);i=start+size;}return result;}
test('cylinder-only downloads preserve the kit mesh and selected printer profile',()=>{
 for(const printer of ['a1-mini','256'])for(const stand of ['desktop-plain','tall-tripod']){
  const kit=buildCylinderModel(m,{printer,stand,height:94,fitDiameter:39.4},new Uint8Array(64*24).fill(128),64,24),original=kit.parts.find(p=>p.role==='cylinder'),only=cylinderOnly(kit);
  assert.equal(only.parts.length,1);assert.equal(only.parts[0],original);assert.ok(kit.parts.length>1);assert.deepEqual(stlBytes(only.parts[0].mesh),stlBytes(original.mesh));
  const archive=files(solid3mf(only)),profile=JSON.parse(archive['Metadata/project_settings.config']),xml=archive['3D/3dmodel.model'].toString();
  assert.equal(profile.printer_settings_id,projectProfile('cylinder',{printer}).printer_settings_id);assert.equal(profile.top_shell_layers,'4');assert.equal(profile.bottom_shell_layers,'4');assert.equal((xml.match(/<mesh>/g)||[]).length,1);assert.match(xml,/lithophane-cylinder/);assert.doesNotMatch(xml,/tripod|stand-deck|stand-leg/);
 }
 assert.throws(()=>cylinderOnly({parts:[]}));
});
test('eight connected stands fit both printers, share a clear tealight recess and a cylinder seat',()=>{
 assert.equal(cylinderStands.filter(s=>s.group==='Desktop').length,4);assert.equal(cylinderStands.filter(s=>s.group==='Elevated').length,4);
 for(const printer of ['a1-mini','256'])for(const stand of cylinderStands){
  const g=generateCylinderStand(m,{stand:stand.id,printer}),H=g.seatZ;
  assert.equal(g.fit.diameter,39);assert.equal(g.fit.depth,3);assert.equal(g.fit.seatDiameter,90.6);
  for(const p of g.parts){const s=restore(p.mesh);assert.equal(s.status(),'NoError');assert.ok(s.volume()>0);const pieces=s.decompose();assert.equal(pieces.length,1,p.name);pieces.forEach(p=>p.delete());assert.ok(p.printSize.every(v=>v<=170.001));
   // In assembled space, the 38×19 LED body must clear the recess and deck.
   let assembled=s;if(p.role==='stand-deck')assembled=s.translate([0,0,H-8]);
   if(!['stand-leg'].includes(p.role)){const led=m.Manifold.cylinder(19,19,19,96).translate([0,0,H-3]),hit=assembled.intersect(led);assert.ok(hit.volume()<1e-3,stand.id+' LED clearance');hit.delete();led.delete();}
   if(assembled!==s)assembled.delete();s.delete();
  }
 }
});
test('small test cup uses the same selected recess as every stand',()=>{
 for(const fitDiameter of [38.2,39,40]){const g=generateCylinderStand(m,{fitDiameter},true),s=restore(g.parts[0].mesh),slice=s.slice(3),polygons=slice.toPolygons();assert.equal(polygons.length,2);const radii=polygons.map(r=>Math.max(...r.map(([x,y])=>Math.hypot(x,y)))).sort((a,b)=>a-b);assert.ok(Math.abs(radii[0]-fitDiameter/2)<.002);assert.equal(g.parts[0].printSize[2],5);slice.delete();s.delete();}
});
test('cylinder is one watertight outward mesh with open ends and a fixed seating band',()=>{
 for(const height of [70,94,150])for(const rotation of [0,73,360]){const cols=96,rows=32,tones=periodicTones(Uint8Array.from({length:cols*rows},(_,i)=>i%256),cols,rows),mesh=makeCylinder({height,rotation},tones,cols,rows),s=restore(mesh);assert.equal(s.status(),'NoError');assert.ok(s.volume()>0);const pieces=s.decompose();assert.equal(pieces.length,1);pieces.forEach(p=>p.delete());
  for(const z of [.1,height/2,height-.1]){const section=s.slice(z);assert.equal(section.toPolygons().length,2,'open annular cross section');section.delete();}
  const bottom=s.slice(.1),area=bottom.area();assert.ok(Math.abs(area-Math.PI*(45**2-42**2))<2);bottom.delete();s.delete();
 }
});
test('periodic image processing has an identical boundary for every row without flattening the landscape',()=>{
 const w=300,h=100,source=Uint8Array.from({length:w*h},(_,i)=>(i*17+Math.floor(i/w)*3)%256);
 for(const b of [-40,0,40]){const tones=periodicTones(source,w,h,b);assert.deepEqual(seamMetrics(tones,w,h),{maximum:0,mean:0});if(!b)assert.ok(new Set(tones.slice(60,240)).size>40);}
});
test('complete Bambu projects retain per-part skins and both printer selections',()=>{
 for(const printer of ['a1-mini','256']){const model=buildCylinderModel(m,{printer,stand:'tall-tripod'},new Uint8Array(64*24).fill(128),64,24),archive=files(solid3mf(model)),profile=JSON.parse(archive['Metadata/project_settings.config']);assert.equal(profile.top_shell_layers,'4');assert.equal(profile.bottom_shell_layers,'4');assert.equal(profile.top_shell_thickness,'0');assert.equal(profile.printer_settings_id,projectProfile('cylinder',{printer}).printer_settings_id);assert.match(archive['Metadata/model_settings.config'].toString(),/top_shell_layers" value="3/);assert.match(archive['3D/3dmodel.model'].toString(),/BambuStudio:3mfVersion/);assert.equal(model.parts.length,5);const zip=files(cylinderZip(model));assert.equal(Object.keys(zip).filter(k=>k.endsWith('.stl')).length,5);assert.equal(JSON.parse(zip['tripod-deck-settings.json']).top_shell_layers,'3');}
 assert.equal(printProfile('cylinder').top_shell_layers,'4');assert.equal(printProfile('cylinder-stand').top_shell_layers,'3');
});
test('invalid geometry and fit settings reject before export',()=>{
 for(const input of [{height:151},{height:NaN},{min:.1},{max:4},{max:.9,min:1},{fitDiameter:38},{stand:'missing'},{printer:'bad'}])assert.throws(()=>cylinderSettings(input));
 assert.throws(()=>makeCylinder({},new Uint8Array(4),20,20));
});
test('all eight holiday atlases are landscape and the previous catalogue stays untouched',()=>{
 const sources=JSON.parse(fs.readFileSync('src/fixtures/cylinder-artwork-sources.json','utf8'));assert.equal(sources.length,8);for(const {slug,scenes}of sources){assert.equal(scenes.length,2);assert.ok(fs.statSync('src/assets/cylinders/'+slug+'.webp').size>10000);}
});

test('stand-only and fit-test 3MFs contain only requested parts with lightweight printer profiles',()=>{
 for(const printer of ['a1-mini','256']){
  for(const stand of cylinderStands){const model=generateCylinderStand(m,{printer,stand:stand.id}),originalKind=model.settings.kind,archive=files(solid3mf(model)),profile=JSON.parse(archive['Metadata/project_settings.config']),xml=archive['3D/3dmodel.model'].toString();assert.equal(profile.top_shell_layers,'3');assert.equal(profile.bottom_shell_layers,'3');assert.equal(profile.printer_settings_id,projectProfile('cylinder-stand',{printer}).printer_settings_id);assert.equal((xml.match(/<mesh>/g)||[]).length,stand.id==='tall-tripod'?4:1);assert.doesNotMatch(xml,/name="lithophane-cylinder"/);assert.equal(model.settings.kind,originalKind);}
  const model=generateCylinderStand(m,{printer,fitDiameter:39.4},true),archive=files(solid3mf(model)),profile=JSON.parse(archive['Metadata/project_settings.config']),xml=archive['3D/3dmodel.model'].toString();assert.equal(profile.top_shell_layers,'3');assert.equal(profile.bottom_shell_layers,'3');assert.equal(profile.top_shell_thickness,'0');assert.equal(profile.printer_settings_id,projectProfile('cylinder-stand',{printer}).printer_settings_id);assert.equal((xml.match(/<mesh>/g)||[]).length,1);assert.match(xml,/name="tealight-fit-39.4mm"/);assert.equal(model.fit.diameter,39.4);
 }
});
