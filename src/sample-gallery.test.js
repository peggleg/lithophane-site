import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleCollections,collectionSamples,sampleOrientation} from './sample-gallery.js';
import {seasonalDesigns} from './postcards.js';
test('gallery defaults to Christmas and preserves every existing sample',()=>{
 const collections=sampleCollections();
 assert.equal(collections[0].name,'Christmas');
 assert.equal(collections.length,3);
 for(const collection of collections){
  assert.equal(collectionSamples(collection).length,4);
  assert.equal(collectionSamples(collection,'portrait').length,4);
  assert.equal(collectionSamples(collection,'landscape').length,0);
 }
 assert.deepEqual(new Set(collections.flatMap(c=>c.designs.map(d=>d.id))),new Set(seasonalDesigns.map(d=>d.id)));
});
test('eight collections and mixed orientations need only collection data',()=>{
 const names=['Valentine’s Day','New Year 2027','Mother’s Day','Father’s Day','Thanksgiving'];
 const collections=sampleCollections([...seasonalDesigns,...names.map((season,i)=>({season,id:`test-${i}`,orientation:'landscape'}))]);
 assert.equal(collections.length,8);
 const collection=collections.find(c=>c.name===names[0]);
 assert.equal(collectionSamples(collection,'landscape').length,1);
 assert.equal(collectionSamples(collection,'portrait').length,0);
 assert.equal(sampleOrientation(seasonalDesigns[0]),'portrait');
 assert.equal(sampleCollections().length,3);
});
