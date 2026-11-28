import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import init from 'manifold-3d/manifold';
import {unzipSync} from 'fflate';
import {generateOrnament} from '../src/ornament-geometry.js';
import {ornament3mf,ornamentGuide} from '../src/ornament-export.js';
import {buildOrnamentCollectionZip} from '../src/ornament-collection-export.js';
import {ornamentCollections,releasedOrnamentCollections} from '../src/ornament-settings.js';
const m=await init();m.setup();
test('eight Santa ornaments have hanging holes, supported details and six truly blank plates',()=>{
 assert.ok(releasedOrnamentCollections.includes('santa'));assert.equal(ornamentCollections.santa.designs.length,8);
 const seen=new Set();
 for(let i=1;i<=8;i++){
  const art=JSON.parse(fs.readFileSync(`src/ornament-artwork/santa/${i}.json`));const base=new m.CrossSection(art.base,'EvenOdd'),detail=new m.CrossSection(art.detail,'EvenOdd');seen.add(JSON.stringify(art.detail));
  const holes=base.toPolygons().filter(p=>{let sum=0;for(let j=0;j<p.length;j++){let a=p[j],b=p[(j+1)%p.length];sum+=a[0]*b[1]-b[0]*a[1];}return sum < -8 && Math.max(...p.map(v=>v[1]))>30;});assert.ok(holes.length,`hanging hole ${i}`);
  assert.equal(art.blankPlate,i<=6);
  if(art.blankPlate){const [x1,y1,x2,y2]=art.blankPlateBounds;const zone=m.CrossSection.square([x2-x1,y2-y1]).translate([x1,y1]);const ink=detail.intersect(zone),missing=zone.subtract(base);assert.ok(x2-x1>65 && y2-y1>8,`useful blank plate ${i}`);assert.ok(ink.area()<.01,`plate has no artwork ${i}`);assert.ok(missing.area()<.01,`plate is fully backed ${i}`);zone.delete();ink.delete();missing.delete();}
  for(const ams of [false,true]){const model=generateOrnament(m,null,{collection:'santa',design:`santa-${i}`,thickness:1.8,ams});assert.equal(model.parts.length,2);assert.ok(Math.abs(model.height-2.4)<1e-4);assert.ok(model.parts.every(p=>p.printSize.every(v=>v<=170)));if(ams)assert.deepEqual(model.parts.map(p=>p.extruder),[1,2]);assert.ok(ornament3mf(model).reduce((n,b)=>n+b.length,0)>1000);assert.match(ornamentGuide(model),/three black layers/);}
  assert.ok(fs.existsSync(`src/assets/ornaments/santa-santa-${i}.svg`));base.delete();detail.delete();
 }assert.equal(seen.size,8);
});
test('Santa collection ZIP contains all eight model-named STLs and 3MFs',()=>{const chunks=buildOrnamentCollectionZip(m,null,{collection:'santa',design:'santa-1',thickness:1.8,diameter:100,ams:true});const files=Object.keys(unzipSync(Buffer.concat(chunks.map(c=>Buffer.from(c)))));assert.equal(files.filter(n=>/^STL\/[^/]+\.stl$/.test(n)).length,8);assert.equal(files.filter(n=>/^3MF\/[^/]+\.3mf$/.test(n)).length,8);});
