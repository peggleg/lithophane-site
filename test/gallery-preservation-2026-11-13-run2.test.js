import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonalDesigns,artworkCell} from '../src/postcards.js';
import {cylinderCatalogue} from '../src/cylinder-catalogue.js';
const baseline=JSON.parse(fs.readFileSync('src/fixtures/gallery-baseline-2026-11-13-run2.json'));
test('preserves the prior gallery, crops, cylinder rows and artwork bytes',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.flat.length),baseline.flat);
 assert.deepEqual(cylinderCatalogue.slice(0,baseline.cylinders.length),baseline.cylinders);
 for(const d of baseline.flat) assert.deepEqual(artworkCell(d,1200,1600),baseline.cells[d.id]);
 for(const [path,expected] of Object.entries(baseline.assets)) assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),expected,path);
});
