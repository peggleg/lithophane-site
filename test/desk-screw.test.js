import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import init from 'manifold-3d/manifold';
import {generateDeskModel} from '../src/desk-geometry.js';import {deskDefaults,deskPresets} from '../src/desk-settings.js';import {solid3mf,deskGuide} from '../src/desk-export.js';function unzip(chunks){const bytes=new Uint8Array(chunks.reduce((n,c)=>n+c.length,0));let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}const view=new DataView(bytes.buffer),files={};for(let i=0;view.getUint32(i,true)===0x04034b50;){const size=view.getUint32(i+18,true),n=view.getUint16(i+26,true),extra=view.getUint16(i+28,true),start=i+30+n+extra;files[new TextDecoder().decode(bytes.slice(i+30,i+30+n))]=bytes.slice(start,start+size);i=start+size;}return files;}
const m=await init();m.setup();const font=fs.readFileSync('src/fonts/Nunito-ExtraBold.ttf'),buffer=font.buffer.slice(font.byteOffset,font.byteOffset+font.byteLength);
const build=p=>generateDeskModel(m,{...deskDefaults,kind:'screw',...deskPresets.screw,...p},buffer);
const restore=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
test('screw container and lid are connected closed parts with clear right-handed screw travel',()=>{
 for(const width of [40,70,170])for(const height of [30,170])for(const clearance of [.2,.8]){
  const model=build({width,height,clearance,finish:'smooth'});assert.equal(model.parts.length,2);
  const [body,lid]=model.parts.map(restore);for(const s of [body,lid]){assert.equal(s.status(),'NoError');const pieces=s.decompose();assert.equal(pieces.length,1);pieces.forEach(p=>p.delete());assert.ok(s.volume()>0);}for(const part of model.parts)assert.ok(part.printSize.every(x=>x<=170.001));
  for(const dz of [0,.3,.9,1.8,3.6,7.2,12]){const pose=lid.rotate([180,0,0]).translate([0,0,height]).rotate([0,0,360*dz/model.screwFit.pitch]).translate([0,0,dz]),hit=body.intersect(pose);assert.ok(hit.volume()<.002,`width ${width}, height ${height}, gap ${clearance}, opening ${dz}: ${hit.volume()}`);pose.delete();hit.delete();}
  const roof=lid.slice(.1),outline=m.CrossSection.circle(model.screwFit.radius,128);assert.ok(Math.abs(roof.area()-outline.area())<.002,'unlettered lid top must be a complete flat disk');roof.delete();outline.delete();
  const floor=body.slice(1);assert.ok(floor.area()>Math.PI*(width/2-1)**2);floor.delete();body.delete();lid.delete();
 }
});
test('all desk surface styles and optional engraved lid text export with existing desk profile',()=>{
 for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave']){const model=build({finish,lidText:'BITS'});for(const part of model.parts){const s=restore(part);assert.equal(s.status(),'NoError');const pieces=s.decompose();assert.equal(pieces.length,1);pieces.forEach(p=>p.delete());s.delete();}const files=unzip(solid3mf(model));const profile=JSON.parse(new TextDecoder().decode(files['Metadata/project_settings.config']));assert.equal(profile.top_shell_layers,'3');assert.equal(profile.bottom_shell_layers,'3');assert.equal(profile.sparse_infill_density,'8%');assert.equal(profile.sparse_infill_pattern,'gyroid');assert.match(deskGuide(model),/heights may differ/);}
});
test('different heights have identical lid meshes and dimensions; invalid text and height reject',()=>{const short=build({height:30}),tall=build({height:150});assert.deepEqual(short.parts[1].mesh,tall.parts[1].mesh);assert.throws(()=>build({height:25}),/30 mm/);assert.throws(()=>build({lidText:'a'.repeat(25)}),/24/);});
