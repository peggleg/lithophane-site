import test from 'node:test';
import assert from 'node:assert/strict';
import init from 'manifold-3d/manifold';
import {generateDeskModel} from '../src/desk-geometry.js';
import {deskDefaults,deskPresets,validateDeskSettings} from '../src/desk-settings.js';
import {openworkCells,drawerOpenworkPanel} from '../src/desk-openwork.js';
const module=await init();module.setup();
const build=p=>generateDeskModel(module,{...deskDefaults,...deskPresets[p.kind||'drawers'],...p});
const restore=part=>new module.Manifold(new module.Mesh({numProp:3,vertProperties:part.mesh.vertices,triVerts:part.mesh.faces}));
function closed(part){const s=restore(part);assert.equal(s.status(),'NoError');assert.ok(s.volume()>0);const pieces=s.decompose();assert.equal(pieces.length,1,part.name);pieces.forEach(x=>x.delete());for(const n of part.printSize)assert.ok(n<=170.001);const edges=new Map(),f=part.mesh.faces,v=part.mesh.vertices;for(let i=0;i<f.length;i+=3){const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3,u=[0,1,2].map(k=>v[b+k]-v[a+k]),w=[0,1,2].map(k=>v[c+k]-v[a+k]);assert.ok(Math.hypot(u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0])>1e-8);for(let j=0;j<3;j++){const x=f[i+j],y=f[i+(j+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(),e=edges.get(key)||[0,0];e[0]++;e[1]+=x<y?1:-1;edges.set(key,e);}}for(const e of edges.values())assert.deepEqual(e,[2,0]);s.delete();}
const patterns=['honeycomb','diamond','slots','windows','arches','woven'];
test('all openwork patterns stay connected and remove real material while retaining floors and backs',()=>{
 for(const openwork of patterns)for(const openworkFaces of ['front','front-sides']){
  const p={kind:'box',width:90,depth:70,height:65,openwork,openworkFaces,finish:'smooth'},m=build(p),part=m.parts[0];closed(part);
  const solid=restore(part),plain=restore(build({...p,openwork:'none'}).parts[0]);assert.ok(solid.volume()<plain.volume());
  const floor=module.Manifold.cube([40,30,1],true).translate([0,0,.6]),back=module.Manifold.cube([30,1,30],true).translate([0,33.8,30]);
  for(const probe of [floor,back]){const missing=probe.subtract(solid);assert.ok(missing.volume()<.001,`${openwork}: solid protected region`);missing.delete();probe.delete();}
  solid.delete();plain.delete();
 }
});
test('drawer pull surrounds, cases and clearances survive all patterns and placement choices',()=>{
 for(const openwork of patterns){const m=build({kind:'drawers',finish:'smooth',openwork,openworkFaces:'front-sides',drawers:1,width:120,height:90});m.parts.forEach(closed);
  const plain=build({kind:'drawers',finish:'smooth',openwork:'none',drawers:1,width:120,height:90});assert.deepEqual(m.parts[0].mesh,plain.parts[0].mesh,'case unchanged');
  const drawer=restore(m.parts[1]),raw=restore(m.parts[0]),r=raw.rotate([90,0,0]),shell=r.translate(m.parts[0].assembly),posed=drawer.translate(m.parts[1].assembly),overlap=posed.intersect(shell);assert.ok(overlap.volume()<.001,'drawer clears case');[drawer,raw,r,shell,posed,overlap].forEach(x=>x.delete());
 }
});
test('organiser resizing fits complete cells inside frames',()=>{
 for(const openwork of patterns)for(const openingSize of [4,10,20])for(const width of [25,80,170]){
  const p={...deskDefaults,openwork,openingSize},cells=openworkCells(width,70,p);
  for(const c of cells){assert.ok(c.x-c.width/2>=-width/2+9-1e-6);assert.ok(c.x+c.width/2<=width/2-9+1e-6);assert.ok(c.z-c.height/2>=p.wall+4);assert.ok(c.z+c.height/2<=70-4);}
 }
 const m=build({kind:'box',width:25,depth:25,height:12,openwork:'honeycomb',openingSize:20});closed(m.parts[0]);
});
test('invalid openwork settings fail and closed bins/round pots cannot inherit cutouts',()=>{
 for(const p of [{openwork:'bad'},{openingSize:NaN},{openingSize:3},{openingSize:21},{openworkFaces:'all'}])assert.throws(()=>validateDeskSettings({openwork:'honeycomb',...p}));
 for(const p of [{kind:'bin'},{kind:'pot',shape:'round'}])assert.equal(validateDeskSettings({...p,openwork:'honeycomb'}).openwork,'none');
});

test('front-only and side cutouts differ while pull and floor frames remain solid',()=>{for(const openworkFaces of ['front','front-sides']){const p={...deskDefaults,kind:'box',width:90,depth:70,height:65,finish:'smooth',openwork:'honeycomb',openworkFaces},part=build(p).parts[0],s=restore(part),cell=openworkCells(70,65,p)[0],probe=module.Manifold.cube([.5,.5,.5],true).translate([44,cell.x,cell.z]),overlap=s.intersect(probe);assert.ok(openworkFaces==='front'?overlap.volume()>.12:overlap.volume()<.001);[s,probe,overlap].forEach(x=>x.delete());}});

test('maximum footprint and dense cells remain closed across surface styles',()=>{for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave'])for(const openwork of ['honeycomb','woven']){const m=build({kind:'box',width:170,depth:80,height:40,finish,openwork,openingSize:4,openworkFaces:'front-sides'});m.parts.forEach(closed);}});

test('every openwork and surface-style combination generates a valid part',()=>{for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave'])for(const openwork of patterns){const m=build({kind:'box',width:90,depth:70,height:50,finish,openwork,openingSize:10,openworkFaces:'front-sides'});m.parts.forEach(closed);}});

test('hidden opening-size inputs do not block solid walls or closed bins',()=>{for(const p of [{openwork:'none'},{kind:'bin',openwork:'honeycomb'},{kind:'pot',shape:'round',openwork:'slots'}]){const result=validateDeskSettings({...p,openingSize:3});assert.equal(result.openwork,'none');assert.equal(result.openingSize,10);}});

test('drawer pattern fields cover the full panel, centred vertically, with a local pull mask',()=>{for(const openwork of patterns)for(const height of [20,44,90]){const p={...deskDefaults,openwork},b=drawerOpenworkPanel(130,height,p),cells=openworkCells(130,height,p,{pull:true});assert.ok(cells.length);assert.ok(Math.min(...cells.map(c=>c.z-c.height/2))<=b.bottom+1e-6);assert.ok(Math.max(...cells.map(c=>c.z+c.height/2))>=b.top-1e-6);assert.ok(Math.min(...cells.map(c=>c.x-c.width/2))<=-65+b.frame+1e-6);assert.ok(Math.max(...cells.map(c=>c.x+c.width/2))>=65-b.frame-1e-6);assert.equal(b.frame,2.4);assert.ok(b.pullBottom>=height-9);}});

test('slots and arches span the drawer panel while diamonds use a staggered lattice',()=>{for(const openwork of ['slots','arches']){const p={...deskDefaults,openwork},panel=drawerOpenworkPanel(130,44,p),cells=openworkCells(130,44,p,{pull:true});assert.equal(new Set(cells.map(c=>c.row)).size,1);for(const c of cells)assert.equal(c.height,panel.top-panel.bottom);}const p={...deskDefaults,openwork:'diamond'},cells=openworkCells(130,44,p,{pull:true}),a=cells.find(c=>c.row===0),b=cells.find(c=>c.row===1);assert.notEqual(a.x,b.x);assert.ok(Math.abs(a.z-b.z)<p.openingSize);});
