import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';
import {generateDeskModel} from '../src/desk-geometry.js';import {deskDefaults,deskPresets} from '../src/desk-settings.js';import {storageLayout} from '../src/desk-storage.js';
const m=await init();m.setup();const build=p=>generateDeskModel(m,{...deskDefaults,...deskPresets[p.kind||'storage'],kind:'storage',...p});const restore=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
test('both storage formats have solid floors, connected parts and removable lids that clear every pot/divider',()=>{
 for(const kind of ['storage','storage-pots'])for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave'])for(const storageLid of ['none','lift']){
  const model=build({kind,finish,storageLid}),parts=model.parts.map(restore);assert.equal(parts.length,(kind==='storage'?1:7)+(storageLid==='lift'?1:0));
  for(let i=0;i<parts.length;i++){assert.equal(parts[i].status(),'NoError');const pieces=parts[i].decompose();assert.equal(pieces.length,1,`${kind} ${finish} ${model.parts[i].name}`);pieces.forEach(x=>x.delete());assert.ok(model.parts[i].printSize.every(v=>v<=170.001));}
  const floor=parts[0].slice(1);assert.ok(floor.area()>10000);floor.delete();
  const posed=parts.map((s,i)=>{const p=model.parts[i];return s.rotate(p.rotation.map(x=>x*180/Math.PI)).translate(p.assembly);});
  for(let i=1;i<parts.length;i++){for(let j=0;j<i;j++){const hit=posed[i].intersect(posed[j]);assert.ok(hit.volume()<.001,`${kind} ${finish} collision ${i}/${j}: ${hit.volume()}`);hit.delete();}
   if(model.parts[i].role==='storage-lid'||model.parts[i].role==='inner-box')for(const dz of [1,3,10,45]){const moving=posed[i].translate([0,0,dz]),hit=moving.intersect(posed[0]);assert.ok(hit.volume()<.001,'vertical lift path clear');hit.delete();moving.delete();}}
  [...parts,...posed].forEach(x=>x.delete());
 }
});
test('row/column shares change cell dimensions and inserts auto-size at every permitted footprint',()=>{
 for(const kind of ['storage','storage-pots'])for(const width of [120,170]){const equal=build({kind,width}),weighted=build({kind,width,columnShares:'2,1,1',rowShares:'1,2'});const l=weighted.storageFit;assert.ok(Math.abs(l.xs[0].size/l.xs[1].size-2)<1e-9);assert.ok(Math.abs(l.ys[1].size/l.ys[0].size-2)<1e-9);if(kind==='storage-pots')assert.notEqual(equal.parts[1].usableSize[0],weighted.parts[1].usableSize[0]);}
 for(const p of [{columnShares:'2,1'},{rowShares:'0,2'},{columnShares:'1,1,99'},{height:12},{storageLid:'hinged'}])assert.throws(()=>build(p));
 assert.equal(storageLayout({...deskDefaults,...deskPresets.storage,kind:'storage',columnShares:'',rowShares:''}).cells.length,6);
});
