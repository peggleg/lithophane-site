import {symbolNames} from '../src/clicker-symbols.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import init from 'manifold-3d/manifold';
import {generateClickerModel} from '../src/clicker-geometry.js';
import {clickerDefaults,clickerPresets,clickerPositions,validateClickerSettings} from '../src/clicker-settings.js';
import {clickerStlZip,clickerGuide,solid3mf} from '../src/clicker-export.js';
const module=await init();module.setup();const b=fs.readFileSync(new URL('../src/fonts/NotoSans-Bold.ttf',import.meta.url)),font=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
const build=p=>generateClickerModel(module,font,{...clickerDefaults,...clickerPresets.pebble,design:'pebble',font:'sans',...p});
function checkMesh({vertices:v,faces:f}){const edges=new Map();let volume=0;for(let i=0;i<f.length;i+=3){const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3,ux=v[b]-v[a],uy=v[b+1]-v[a+1],uz=v[b+2]-v[a+2],vx=v[c]-v[a],vy=v[c+1]-v[a+1],vz=v[c+2]-v[a+2];assert.ok(Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)>1e-9,'non-degenerate triangle');volume+=(v[a]*(v[b+1]*v[c+2]-v[b+2]*v[c+1])+v[a+1]*(v[b+2]*v[c]-v[b]*v[c+2])+v[a+2]*(v[b]*v[c+1]-v[b+1]*v[c]))/6;for(let j=0;j<3;j++){const x=f[i+j],y=f[i+(j+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(),e=edges.get(key)||[0,0];e[0]++;e[1]+=x<y?1:-1;edges.set(key,e);}}for(const [count,balance]of edges.values()){assert.equal(count,2);assert.equal(balance,0);}assert.ok(volume>0);assert.ok([...v].every(Number.isFinite));return volume;}
function unzip(chunks){const bytes=new Uint8Array(chunks.reduce((n,p)=>n+p.length,0));let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}const view=new DataView(bytes.buffer),files={};for(let i=0;view.getUint32(i,true)===0x04034b50;){const size=view.getUint32(i+18,true),names=view.getUint16(i+26,true),extra=view.getUint16(i+28,true),start=i+30+names+extra;files[new TextDecoder().decode(bytes.slice(i+30,i+30+names))]=bytes.slice(start,start+size);i=start+size;}return files;}
test('all designs with square cover caps create closed positive-volume parts',()=>{for(const [design,preset]of Object.entries(clickerPresets))for(const capShape of ['rounded']){const m=build({...preset,design,capShape});assert.equal(m.parts.length,m.settings.count+5);for(const part of m.parts)checkMesh(part.mesh);assert.equal(m.prototype,true);assert.equal(m.parts.filter(p=>p.role==='cap').length,preset.count);}});
test('1–5 switches have separate openings and caps with clearance between square caps',()=>{for(const design of ['charm','gamepad','bloom','christmas','namebar','symbols','numbers','cloud'])for(let count=1;count<=5;count++){const p={...clickerDefaults,design,count,keys:Array.from({length:count},(_,i)=>({type:'text',value:String(i+1)}))},positions=clickerPositions(p),m=build(p);assert.equal(m.parts.filter(p=>p.role==='cap').length,count);for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)assert.ok(Math.max(Math.abs(positions[i][0]-positions[j][0]),Math.abs(positions[i][1]-positions[j][1]))>=22);checkMesh(m.parts[0].mesh);const solid=restoreMesh(m.parts[0]),components=solid.decompose();assert.equal(components.length,1,`${design} ${count} has one joined tray`);components.forEach(c=>c.delete());solid.delete();for(const [x,y]of positions){const v=m.parts.find(p=>p.role==='deck').mesh.vertices;let corner=false;for(let i=0;i<v.length;i+=3)if(Math.abs(Math.abs(v[i]-x)-p.cutout/2)<.001&&Math.abs(Math.abs(v[i+1]-y)-p.cutout/2)<.001&&Math.abs(v[i+2]-p.plate)<.001)corner=true;assert.ok(corner,'open switch aperture in the top plate');}}});
test('stem socket is open underneath and clearance controls change actual geometry',()=>{const narrow=build({socketClearance:0}),wide=build({socketClearance:.3});assert.ok(checkMesh(narrow.parts.find(p=>p.role==='cap').mesh)>checkMesh(wide.parts.find(p=>p.role==='cap').mesh));const v=wide.parts.find(p=>p.role==='cap').mesh.vertices;let bottom=false;for(let i=0;i<v.length;i+=3)if(Math.abs(v[i+2]-(wide.capRoof-wide.settings.stemHeight))<.001&&Math.abs(Math.abs(v[i])-2.15)<.001)bottom=true;assert.ok(bottom);const thicker=build({plate:2,cavity:18});assert.equal(thicker.baseHeight,29);});
test('STL archive and 3MF contain named caps, base and fit coupons, never switch proxies',()=>{const m=build({...clickerPresets.namebar,design:'namebar'}),files=unzip(clickerStlZip(m)),mf=unzip(solid3mf(m)),xml=new TextDecoder().decode(mf['3D/3dmodel.model']);for(const part of m.parts)assert.ok(files[part.name+'.stl']);assert.ok(files['PRINT-GUIDE.txt']);assert.equal((xml.match(/<object /g)||[]).length,8);assert.match(xml,/unit="millimeter"/);assert.match(xml,/switch-plate-fit-test/);assert.match(xml,/keycap-socket-fit-test/);assert.doesNotMatch(xml,/switch-proxy/);assert.match(clickerGuide(m),/NOT fit-tested/);assert.match(clickerGuide(m),/4 mm/);});
test('blank caps work and unsafe, unsupported or inconsistent settings fail',()=>{checkMesh(build({keys:[{type:'blank',value:''}]}).parts.find(p=>p.role==='cap').mesh);for(const p of [{capShape:'circle'},{capShape:'heart'},{count:6},{cutout:0},{plate:Infinity},{count:2},{stemWidth:5.6,socketClearance:.4},{keys:[{type:'text',value:'AB'}]},{keys:[{type:'symbol',value:'invalid'}]}])assert.throws(()=>build(p));assert.throws(()=>build({keys:[{type:'text',value:'猫'}]}),/does not support/);assert.throws(()=>validateClickerSettings({...clickerDefaults,design:'unknown'}));});

function restoreMesh(part){return new module.Manifold(new module.Mesh({numProp:3,vertProperties:part.mesh.vertices,triVerts:part.mesh.faces}));}
test('exported trays have a continuous solid floor below every switch, not merely watertight open shells',()=>{
 for(const [design,preset]of Object.entries(clickerPresets)){
  const m=build({...preset,design}),tray=restoreMesh(m.parts[0]),floor=tray.slice(m.settings.floor/2),above=tray.slice(m.settings.floor+.3);
  assert.equal(m.construction,'closed-tray');assert.equal(m.floorThickness,m.settings.floor);assert.ok(floor.area()>above.area()*1.5,design);
  for(const [x,y]of m.positions){const patch=module.CrossSection.square([10,10],true).translate([x,y]),missing=patch.subtract(floor);assert.ok(missing.area()<1e-5,design+' has floor under switch pins');missing.delete();patch.delete();}
  const pieces=tray.decompose();assert.equal(pieces.length,1,design+' tray and eyelet are joined');pieces.forEach(p=>p.delete());floor.delete();above.delete();tray.delete();
 }
});
test('floor thickness and deck fit change actual exported solids and fit coupons',()=>{
 const thin=build({floor:1.6,deckClearance:.2}),thick=build({floor:3.2,deckClearance:-.1});assert.ok(checkMesh(thick.parts[0].mesh)>checkMesh(thin.parts[0].mesh));assert.ok(checkMesh(thick.parts.find(p=>p.role==='deck').mesh)>checkMesh(thin.parts.find(p=>p.role==='deck').mesh));
 for(const m of [thin,thick]){assert.ok(m.parts.some(p=>p.name==='closed-tray-fit-test'));const coupon=restoreMesh(m.parts.find(p=>p.name==='closed-tray-fit-test')),slice=coupon.slice(m.settings.floor/2);assert.ok(slice.area()>950);slice.delete();coupon.delete();}
 assert.throws(()=>build({floor:0}));assert.throws(()=>build({deckClearance:-1}));
});
test('every collection symbol, including the Christmas set, produces closed caps with square covers',()=>{for(const value of Object.keys(symbolNames))for(const capShape of ['rounded']){const m=build({capShape,keys:[{type:'symbol',value}]});checkMesh(m.parts.find(p=>p.role==='cap').mesh);}});

function readStl(bytes){const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),vertices=[],faces=[],indices=new Map();for(let i=0;i<view.getUint32(80,true);i++)for(let j=0;j<3;j++){const offset=84+i*50+12+j*12,point=[0,1,2].map(k=>view.getFloat32(offset+k*4,true)),key=point.join();if(!indices.has(key)){indices.set(key,vertices.length/3);vertices.push(...point);}faces.push(indices.get(key));}return {vertices:new Float32Array(vertices),faces:new Uint32Array(faces)};}
test('the downloaded base STL contains the solid floor and the deck is a separate exported file',()=>{for(const [design,preset]of Object.entries(clickerPresets)){const m=build({...preset,design}),zip=unzip(clickerStlZip(m));assert.ok(zip['switch-deck.stl']);assert.ok(zip['closed-tray-fit-test.stl']);const mesh=readStl(zip['clicker-base.stl']);checkMesh(mesh);const solid=restoreMesh({mesh}),floor=solid.slice(m.settings.floor/2);for(const [x,y]of m.positions){const patch=module.CrossSection.square([8,8],true).translate([x,y]),outside=patch.subtract(floor);assert.ok(outside.area()<1e-5,design+' STL has a closed bottom');outside.delete();patch.delete();}floor.delete();solid.delete();}});
test('nominal keycap press positions clear the tray rim and deck through 4 mm of travel',()=>{for(const [design,preset]of Object.entries(clickerPresets)){const m=build({...preset,design}),tray=restoreMesh(m.parts[0]),flatDeck=restoreMesh(m.parts.find(p=>p.role==='deck')),deck=flatDeck.translate([0,0,m.deckSeat]),housing=tray.add(deck);for(const part of m.parts.filter(p=>p.role==='cap')){const cap=restoreMesh(part);for(const travel of [0,4]){const pose=cap.translate([part.assembly[0],part.assembly[1],part.assembly[2]-travel]),overlap=pose.intersect(housing);assert.ok(overlap.volume()<1e-5,`${design} button ${part.key+1} hits housing at ${travel} mm`);overlap.delete();pose.delete();}cap.delete();}housing.delete();deck.delete();flatDeck.delete();tray.delete();}});

test('square covers enclose the switch on every side with hollow skirts, opaque roofs and full-travel clearance',()=>{
 const {CrossSection:C}=module;
 for(const [design,preset]of Object.entries(clickerPresets)){
  const m=build({...preset,design}),part=m.parts.find(p=>p.role==='cap'),cap=restoreMesh(part);
  // This is an independent nominal housing envelope, not a preview screenshot:
  // 16 mm square upper body, with a central stem well above 3.5 mm.
  const square=C.square([16,16],true),body=square.extrude(6),wellProfile=C.square([7.2,7.2],true),well=wellProfile.extrude(3).translate([0,0,3.5]),upperBody=body.subtract(well);
  const low=cap.slice(.5),inside=C.square([17,17],true),interiorOverlap=low.intersect(inside);
  assert.ok(interiorOverlap.area()<1e-6,'skirt cavity is open underneath');
  assert.ok(low.area()>95&&low.area()<125,'continuous skirt material surrounds the cavity');
  const inspection=C.square([16.8,16.8],true),projection=cap.project(),missing=inspection.subtract(projection);
  assert.ok(missing.area()<1e-6,'cap footprint covers every switch corner');
  assert.ok(m.capWidth>16&&m.capInterior>16,'cap encloses the square switch footprint');
  const roof=cap.slice(m.capRoof+1),uncovered=square.subtract(roof);
  assert.ok(uncovered.area()<1e-6,'roof completely covers square switch including corners');
  assert.ok(m.capRest<m.rimHeight,'skirt overlaps case rim at rest to hide the switch from the side');
  for(const travel of [0,1,2,3,4]){
   const pose=cap.translate([0,0,m.capRest-travel]),collision=pose.intersect(upperBody);
   assert.ok(collision.volume()<1e-5,`${design} cover collides with nominal switch at ${travel} mm`);collision.delete();pose.delete();
  }
  for(const object of [cap,square,body,wellProfile,well,upperBody,low,inspection,projection,inside,interiorOverlap,missing,roof,uncovered])object.delete();
 }
});
