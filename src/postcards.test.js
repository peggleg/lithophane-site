import test from 'node:test';
import assert from 'node:assert/strict';
import {postcardSize,seasonalDesigns,FRAME_URL} from './postcards.js';
test('postcard default and landscape preserve frame dimensions and thickness',()=>{
 assert.deepEqual(postcardSize(),{width:105,height:148,max:3});
 assert.deepEqual(postcardSize('landscape'),{width:148,height:105,max:3});
});
test('each holiday has four distinct atlas cells and stable sample IDs',()=>{
 for(const season of ['Halloween','Christmas','Easter'])assert.equal(seasonalDesigns.filter(d=>d.season===season).length,4);
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,12);
 assert.equal(new Set(seasonalDesigns.map(d=>`${d.column},${d.row}`)).size,12);
 assert.ok(seasonalDesigns.every(d=>d.column>=0&&d.column<3&&d.row>=0&&d.row<4));
 assert.ok(FRAME_URL.endsWith('3456935-postcard-lithophane-frame#profileId-3944274'));
});
