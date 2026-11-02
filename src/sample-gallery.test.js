import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleCollections,collectionSamples,sampleOrientation} from './sample-gallery.js';
import {seasonalDesigns} from './postcards.js';
import {readFileSync} from 'node:fs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/seasonal-baseline-2026-11-02.json',import.meta.url),'utf8'));
test('gallery defaults to Christmas and preserves every existing sample',()=>{
 const collections=sampleCollections();
 assert.equal(collections[0].name,'Christmas');
 assert.equal(collections.length,8);
 for(const collection of collections){
  const prior=baseline.designs.filter(d=>d.season===collection.name);
  assert.ok(collectionSamples(collection).length>=prior.length+1);
  for(const orientation of ['portrait','landscape']){
   const visible=collectionSamples(collection,orientation);
   for(const old of prior.filter(d=>d.orientation===orientation))assert.ok(visible.some(d=>d.id===old.id),old.id);
  }
 }
 assert.deepEqual(new Set(collections.flatMap(c=>c.designs.map(d=>d.id))),new Set(seasonalDesigns.map(d=>d.id)));
});
test('eight collections and mixed orientations need only collection data',()=>{
 const names=['Valentine’s Day','New Year 2027','Mother’s Day','Father’s Day','Thanksgiving'];
 const collections=sampleCollections([...seasonalDesigns.filter(d=>['Christmas','Easter','Halloween'].includes(d.season)),...names.map((season,i)=>({season,id:`test-${i}`,orientation:'landscape'}))]);
 assert.equal(collections.length,8);
 const collection=collections.find(c=>c.name===names[0]);
 assert.equal(collectionSamples(collection,'landscape').length,1);
 assert.equal(collectionSamples(collection,'portrait').length,0);
 assert.equal(sampleOrientation(seasonalDesigns[0]),'portrait');
 assert.equal(sampleCollections().length,8);
});
