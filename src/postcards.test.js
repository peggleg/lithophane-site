import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PNG} from 'pngjs';
import {postcardSize,seasonalDesigns,FRAME_URL,sampleSize,artworkCell} from './postcards.js';
const fixture=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
const baseline=fixture('seasonal-baseline-2026-11-01.json');
const additions=fixture('seasonal-additions-2026-11-01.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('postcard default and landscape preserve frame dimensions and thickness',()=>{
 assert.deepEqual(postcardSize(),{width:105,height:148,max:3});
 assert.deepEqual(postcardSize('landscape'),{width:148,height:105,max:3});
 assert.ok(FRAME_URL.endsWith('3456935-postcard-lithophane-frame#profileId-3944274'));
});
test('all prior catalogue entries, ordering, artwork bytes and atlas crops are preserved',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.designs.length),baseline.designs);
 for(const prior of baseline.designs){
  assert.deepEqual(seasonalDesigns.find(d=>d.id===prior.id),prior);
  assert.deepEqual(artworkCell(prior,1200,1600),baseline.cells[prior.id]);
 }
 for(const [path,hash]of Object.entries(baseline.assets))assert.equal(sha(readFileSync(new URL('../'+path,import.meta.url))),hash,path);
});
test('the dated batch adds one original picture to each existing holiday, without limiting future growth',()=>{
 const seasons=new Set(baseline.designs.map(d=>d.season));
 assert.equal(additions.length,seasons.size);
 assert.deepEqual(new Set(additions.map(d=>d.season)),seasons);
 assert.ok(seasonalDesigns.length>=baseline.designs.length+additions.length);
 for(const season of seasons){
  const prior=baseline.designs.filter(d=>d.season===season),current=seasonalDesigns.filter(d=>d.season===season);
  assert.equal(additions.filter(d=>d.season===season).length,1,season);
  assert.ok(current.length>=prior.length+1,season);
  for(const orientation of ['portrait','landscape'])assert.ok(current.filter(d=>d.orientation===orientation).length>=prior.filter(d=>d.orientation===orientation).length,season+' '+orientation);
 }
 for(const addition of additions){const{asset,sha256,...design}=addition;assert.deepEqual(seasonalDesigns.find(d=>d.id===design.id),design);assert.ok(!baseline.designs.some(d=>d.id===design.id));assert.match(asset,/2026-11-01\.png$/);}
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,seasonalDesigns.length);
 assert.equal(new Set(seasonalDesigns.map(d=>`${d.atlas},${d.column},${d.row}`)).size,seasonalDesigns.length);
});
test('every sample has native postcard dimensions and a valid atlas crop',()=>{
 for(const design of seasonalDesigns){
  const size=sampleSize(design),cell=artworkCell(design,1200,1600);
  assert.equal(size.max,3);
  assert.deepEqual([size.width,size.height],design.orientation==='landscape'?[148,105]:[105,148]);
  assert.ok(cell.x>=0&&cell.y>=0&&cell.x+cell.width<=1200+1e-9&&cell.y+cell.height<=1600+1e-9);
 }
});
test('new assets are distinct, detailed PNGs with full-image postcard crops and useful tonal range',()=>{
 const hashes=new Set();
 for(const design of additions){
  const bytes=readFileSync(new URL('../'+design.asset,import.meta.url)),hash=sha(bytes),image=PNG.sync.read(bytes),cell=artworkCell(design,image.width,image.height),size=sampleSize(design);
  assert.equal(hash,design.sha256);assert.ok(!Object.values(baseline.assets).includes(hash));hashes.add(hash);
  assert.ok(image.width>=1000&&image.height>=1000,design.id);
  assert.ok(Math.abs(cell.width/cell.height-size.width/size.height)<1e-10,design.id);
  assert.ok(cell.width*cell.height/(image.width*image.height)>.9,design.id+' preserves the composition');
  let sum=0,squares=0;const levels=new Set();
  for(let i=0;i<image.data.length;i+=4){const y=.2126*image.data[i]+.7152*image.data[i+1]+.0722*image.data[i+2];sum+=y;squares+=y*y;levels.add(Math.round(y));assert.equal(image.data[i+3],255);}
  const count=image.width*image.height,mean=sum/count,deviation=Math.sqrt(squares/count-mean*mean);
  assert.ok(levels.size>=150,design.id+' tonal detail');assert.ok(deviation>22,design.id+' contrast');assert.ok(mean>35&&mean<225,design.id+' exposure');
 }
 assert.equal(hashes.size,additions.length);
});
