import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonalDesigns} from '../src/postcards.js';
import {cylinderCatalogue} from '../src/cylinder-catalogue.js';
const baseline=JSON.parse(fs.readFileSync('src/fixtures/gallery-baseline-2026-11-15.json'));
const batch=JSON.parse(fs.readFileSync('src/fixtures/gallery-additions-2026-11-15.json'));
test('one new flat and cylinder image per collection, with unique assets and preserved entries',()=>{
 assert.equal(batch.flat.length,10);assert.equal(batch.cylinders.length,10);
 assert.equal(seasonalDesigns.length,baseline.flat.length+10);assert.equal(cylinderCatalogue.length,baseline.cylinders.length+10);
 assert.equal(new Set(batch.flat.map(x=>x.season)).size,10);assert.equal(new Set(batch.cylinders.map(x=>x.collection)).size,10);
 for(const x of batch.flat){const {asset,sha256,...entry}=x;assert.deepEqual(seasonalDesigns.find(d=>d.id===x.id),entry);assert.equal(createHash('sha256').update(fs.readFileSync(asset)).digest('hex'),sha256)}
 for(const x of batch.cylinders){const {sha256,...entry}=x;assert.deepEqual(cylinderCatalogue.find(d=>d.id===x.id),entry);assert.equal(createHash('sha256').update(fs.readFileSync('src/assets/cylinders/'+x.asset)).digest('hex'),sha256)}
 assert.equal(new Set([...seasonalDesigns.map(x=>x.id),...cylinderCatalogue.map(x=>x.id)]).size,seasonalDesigns.length+cylinderCatalogue.length);
});
