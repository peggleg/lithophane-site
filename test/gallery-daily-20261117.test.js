import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonalDesigns,artworkCell} from '../src/postcards.js';
import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';
const read=p=>JSON.parse(fs.readFileSync('src/fixtures/'+p));
const prior=read('gallery-baseline-daily-2026-11-17.json'),batch=read('gallery-additions-daily-2026-11-17.json');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
test('daily 2026-11-17 preserves all earlier IDs, ordered entries, assets, flat crops and atlas rows',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,prior.flat.length),prior.flat);
 assert.deepEqual(cylinderCatalogue.slice(0,prior.cylinders.length),prior.cylinders);
 assert.deepEqual(cylinderCollections.slice(0,prior.collections.length),prior.collections);
 for(const d of prior.flat)assert.deepEqual(artworkCell(d,1200,1600),prior.cells[d.id]);
 for(const [path,sha]of Object.entries(prior.assets))assert.equal(hash(path),sha,path);
});
test('daily run requests exactly one separate image for every existing collection in each gallery',()=>{
 const flat=new Set(prior.flat.map(d=>d.season));
 assert.deepEqual(new Set(batch.requested.filter(d=>d.kind==='flat').map(d=>d.season)),flat);
 assert.equal(batch.requested.filter(d=>d.kind==='flat').length,flat.size);
 assert.deepEqual(new Set(batch.requested.filter(d=>d.kind==='cylinder').map(d=>d.collection)),new Set(prior.collections.map(c=>c.id)));
 assert.equal(batch.requested.filter(d=>d.kind==='cylinder').length,prior.collections.length);
 const outcomes=[...batch.flat,...batch.cylinders,...batch.blocked];
 assert.equal(outcomes.length,batch.requested.length);assert.equal(new Set(outcomes.map(d=>d.id)).size,outcomes.length);
 assert.deepEqual(new Set(outcomes.map(d=>d.id)),new Set(batch.requested.map(d=>d.id)));
 for(const d of batch.blocked)assert.ok(d.error);
});
test('daily artwork is additive, uniquely dated, registered and has independent source assets',()=>{
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,seasonalDesigns.length);
 assert.equal(new Set(cylinderCatalogue.map(d=>d.id)).size,cylinderCatalogue.length);
 const hashes=new Set(Object.values(prior.assets));
 for(const {asset,sha256,...d}of batch.flat){
  assert.deepEqual(seasonalDesigns.find(x=>x.id===d.id),d);assert.equal(d.columns,1);assert.equal(d.rows,1);assert.equal(d.column,0);assert.equal(d.row,0);assert.equal(d.cropToPostcard,true);
  assert.equal(hash('src/assets/'+asset),sha256);assert.ok(!hashes.has(sha256));hashes.add(sha256);
  assert.ok(fs.readFileSync('src/seasonal.js','utf8').includes("'"+d.id+"':"));
 }
 assert.deepEqual(new Set(batch.flat.map(d=>d.orientation)),new Set(['portrait','landscape']));
 for(const {sha256,...d}of batch.cylinders){assert.deepEqual(cylinderCatalogue.find(x=>x.id===d.id),d);assert.equal(d.orientation,'landscape');assert.equal(d.row,0);assert.equal(d.rows,1);assert.equal(hash('src/assets/cylinders/'+d.asset),sha256);assert.ok(!hashes.has(sha256));hashes.add(sha256);}
 for(const d of [...batch.flat,...batch.cylinders])assert.match(d.id,/-2026-11-17$/);
});
