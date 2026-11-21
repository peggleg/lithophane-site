import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';

test('new collections and new individual panoramic additions remain selectable',()=>{
 for(const [collection,count] of [['gaming',12],['kids-tv',10],['movies',23],['sport',15],['christmas',4]]){
  assert.ok(cylinderCollections.some(c=>c.id===collection),collection);
  const items=cylinderCatalogue.filter(d=>d.collection===collection&&d.id.endsWith('2026-11-21'));
  assert.equal(items.length,count,collection);
  for(const d of items){assert.equal(d.row,0);assert.equal(d.rows,1);assert.equal(d.orientation,'landscape');assert.equal(d.seamMode,'narrow');assert.ok(fs.existsSync('src/assets/cylinders/'+d.asset),d.id);}
 }
 assert.equal(new Set(cylinderCatalogue.map(d=>d.id)).size,cylinderCatalogue.length);
});
