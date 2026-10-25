import test from 'node:test';
import assert from 'node:assert/strict';
import init from 'manifold-3d/manifold';
import {generateDeskModel} from '../src/desk-geometry.js';
import {deskDefaults,deskPresets,binDimensions,validateDeskSettings} from '../src/desk-settings.js';
const m=await init();m.setup();
const styles=['smooth','fluted','slatted','ribbed','scalloped','wave'];
const build=p=>generateDeskModel(m,{...deskDefaults,...deskPresets[p.kind],...p});
const raw=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
function pose(p){const a=raw(p),b=a.rotate(p.rotation.map(x=>x*180/Math.PI)),c=b.translate(p.assembly);a.delete();b.delete();return c;}
function clear(a,b,label){const hit=a.intersect(b),v=hit.volume();hit.delete();assert.ok(v<.0001,`${label}: intersection ${v} mm3`);}
test('integral bin pins seat in enclosed bearings while the rim stays a single connected part',()=>{
 for(const shape of ['square','round'])for(const finish of styles)for(const wall of [1.8,2.4,4])for(const width of [40,110,170]){
  const model=build({kind:'bin',shape,finish,wall,width,height:140});assert.equal(model.parts.length,2);const body=pose(model.parts[0]),lid=pose(model.parts[1]);clear(body,lid,`${shape}/${finish}/${wall}/${width}`);for(const solid of [body,lid]){const pieces=solid.decompose();assert.equal(pieces.length,1);pieces.forEach(x=>x.delete());solid.delete();}
 }
});
test('captured bin hinges clear 90 degrees either way and physically block rotation past vertical',()=>{
 for(const shape of ['square','round'])for(const finish of styles)for(const wall of [1.8,4])for(const width of [40,110,170]){
  const p={...deskDefaults,...deskPresets.bin,kind:'bin',shape,finish,wall,width},fit=binDimensions(p),model=build({...p,height:fit.minimumHeight}),body=pose(model.parts[0]),lid=pose(model.parts[1]),axis=model.height-fit.pivot;
  for(let angle=-90;angle<=90;angle+=15){const a=lid.translate([0,0,-axis]),b=a.rotate([angle,0,0]),c=b.translate([0,0,axis]);clear(c,body,`${shape}/${finish}/${width} swing ${angle}`);[a,b,c].forEach(x=>x.delete());}
  for(const angle of [-95,95]){const a=lid.translate([0,0,-axis]),b=a.rotate([angle,0,0]),c=b.translate([0,0,axis]),hit=c.intersect(body);assert.ok(hit.volume()>.02,'solid stop blocks further rotation');[a,b,c,hit].forEach(x=>x.delete());}
  [body,lid].forEach(x=>x.delete());if(fit.minimumHeight>50)assert.throws(()=>validateDeskSettings({...p,height:fit.minimumHeight-1}),/swing clear/);
 }
});
test('110 mm bin has closed 3.1 mm holes, integral 2.5 mm pins and a 2.5 mm main lid panel',()=>{
 const model=build({kind:'bin',width:110,height:140,shape:'square',finish:'smooth',wall:1.8}),body=raw(model.parts[0]),lid=raw(model.parts[1]),fit=model.binFit,turned=body.rotate([0,90,0]),section=turned.slice(-54),hole=m.CrossSection.circle(1.5,48).translate([140-fit.pivot,0]),hit=section.intersect(hole);assert.ok(hit.area()<.001);const roof=m.CrossSection.square([.3,.3],true).translate([140-fit.pivot+2,0]),solidRoof=section.intersect(roof);assert.ok(solidRoof.area()>.089,'bearing has solid material above it');
 const seated=pose(model.parts[1]),lifted=seated.translate([0,0,1]),capture=lifted.intersect(body);assert.ok(capture.volume()>.1,'closed bearings prevent lifting the seated lid straight out');[seated,lifted,capture].forEach(x=>x.delete());
 const central=m.Manifold.cube([10,10,20],true).translate([0,0,5]),panel=lid.intersect(central);assert.ok(Math.abs(panel.boundingBox().max[2]-2.5)<.001);assert.equal(model.parts[1].printSize[0],108.8);
 const spin=lid.rotate([0,90,0]),pin=spin.slice(-53),bounds=pin.bounds();for(let a=0;a<2;a++)assert.ok(Math.abs(bounds.max[a]-bounds.min[a]-2.5)<.001);assert.ok(Math.abs(pin.area()-Math.PI*1.25**2)<.03);[body,lid,turned,section,hole,hit,roof,solidRoof,central,panel,spin,pin].forEach(x=>x.delete());
});
test('drawer columns, surface detail and openwork clear the case along the full insertion path',()=>{
 for(const finish of styles)for(const openwork of ['none','honeycomb','woven'])for(const drawerColumns of [1,4]){
  const model=build({kind:'drawers',finish,openwork,openworkFaces:'front-sides',drawerColumns,drawers:2,width:170,depth:130,height:100,clearance:.2}),shell=pose(model.parts[0]);
  // Each row has the same clearances; check both extreme columns in every row.
  for(const part of model.parts.filter(p=>p.role==='drawer'&&(drawerColumns===1||/column-(1|4)$/.test(p.name)))){const solid=pose(part);for(let fraction=0;fraction<=1;fraction+=.1){const pulled=solid.translate([0,-model.depth*fraction,0]);clear(pulled,shell,`${finish}/${openwork}/${part.name} insertion ${fraction}`);pulled.delete();}solid.delete();}
  shell.delete();
 }
});
test('tray boxes and pen inserts can be lifted in and out without catching the tray or neighbours',()=>{
 for(const finish of styles)for(const trayLayout of ['boxes','pens'])for(const clearance of [.2,.8]){
  const model=build({kind:'tray',finish,trayLayout,width:170,depth:140,height:35,columns:2,rows:2,clearance}),tray=pose(model.parts[0]),boxes=model.parts.slice(1).map(pose);
  for(let i=0;i<boxes.length;i++)for(const lift of [0,.5,2,10,35]){const raised=boxes[i].translate([0,0,lift]);clear(raised,tray,`${finish}/${trayLayout} box ${i} lift ${lift}`);for(let j=0;j<boxes.length;j++)if(j!==i)clear(raised,boxes[j],`${finish}/${trayLayout} neighbour ${i}/${j}`);raised.delete();}
  [tray,...boxes].forEach(x=>x.delete());
 }
});
test('stacking feet enter matching pockets vertically, with a smooth option only for the final top',()=>{
 for(const [width,depth]of [[70,65],[140,130],[170,170]])for(const stackTop of ['pockets','smooth']){
  const lower=build({kind:'drawers',width,depth,height:100,stackTop:'pockets'}),upper=build({kind:'drawers',width,depth,height:90,stackTop}),bottom=pose(lower.parts[0]),top=pose(upper.parts[0]);
  for(const lift of [0,.1,.5,1,2,5]){const moving=top.translate([0,0,100-upper.stacking.footHeight+lift]);clear(moving,bottom,`stack ${width}/${depth}/${stackTop}/${lift}`);moving.delete();}
  bottom.delete();top.delete();
 }
});
