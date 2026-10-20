import test from 'node:test';
import assert from 'node:assert/strict';
import {postcardSize,seasonalDesigns,FRAME_URL,sampleSize,artworkCell} from './postcards.js';
test('postcard default and landscape preserve frame dimensions and thickness',()=>{
 assert.deepEqual(postcardSize(),{width:105,height:148,max:3});
 assert.deepEqual(postcardSize('landscape'),{width:148,height:105,max:3});
});
test('eight holidays each have four portraits and two landscapes with unique cells',()=>{
 assert.equal(seasonalDesigns.length,48);
 assert.equal(new Set(seasonalDesigns.map(d=>d.season)).size,8);
 for(const season of new Set(seasonalDesigns.map(d=>d.season))){
  const designs=seasonalDesigns.filter(d=>d.season===season);
  assert.equal(designs.length,6,season);
  assert.equal(designs.filter(d=>d.orientation==='portrait').length,4,season);
  assert.equal(designs.filter(d=>d.orientation==='landscape').length,2,season);
 }
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,48);
 assert.equal(new Set(seasonalDesigns.map(d=>`${d.atlas},${d.column},${d.row}`)).size,48);
 assert.ok(FRAME_URL.endsWith('3456935-postcard-lithophane-frame#profileId-3944274'));
});
test('every sample has native postcard dimensions and a valid atlas crop',()=>{
 for(const design of seasonalDesigns){
  const size=sampleSize(design);
  assert.equal(size.max,3);
  assert.deepEqual([size.width,size.height],design.orientation==='landscape'?[148,105]:[105,148]);
  const cell=artworkCell(design,1200,1600);
  assert.ok(cell.x>=0&&cell.y>=0&&cell.x+cell.width<=1200&&cell.y+cell.height<=1600);
 }
});
