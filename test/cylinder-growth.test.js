import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';
const baseline=JSON.parse(fs.readFileSync('src/fixtures/cylinder-baseline-2026-11-03.json')),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('cylinder additions preserve every previous ID, source asset, row selection and wrap processing',()=>{
 assert.ok(cylinderCatalogue.length>=baseline.designs.length+3);assert.equal(new Set(cylinderCatalogue.map(d=>d.id)).size,cylinderCatalogue.length);
 for(const old of baseline.designs){const current=cylinderCatalogue.find(d=>d.id===old.id);assert.ok(current,old.id);for(const [key,value]of Object.entries(old))assert.deepEqual(current[key],value,old.id+':'+key);assert.equal(current.asset,old.collection+'.webp');assert.equal(current.rows,2);}
 for(const [file,sha]of Object.entries(baseline.assets))assert.equal(hash(fs.readFileSync('src/assets/cylinders/'+file)),sha,file);
 assert.equal(hash(fs.readFileSync('src/cylinder-texture.js')),baseline.textureSha256);
});
test('three original dated Christmas scenes accumulate as landscape panoramas with unique new assets',()=>{
 const priorHashes=new Set(Object.values(baseline.assets));for(const suffix of ['midnight-express','frozen-lake','reindeer-valley']){
 const id='christmas-'+suffix+'-2026-11-03',d=cylinderCatalogue.find(d=>d.id===id);assert.ok(d,id);assert.equal(d.collection,'christmas');assert.equal(d.orientation,'landscape');assert.equal(d.row,0);assert.equal(d.rows,2);assert.equal(d.asset,id+'.webp');const sha=hash(fs.readFileSync('src/assets/cylinders/'+d.asset));assert.ok(!priorHashes.has(sha));priorHashes.add(sha);
 }
 for(const d of cylinderCatalogue){assert.ok(cylinderCollections.some(c=>c.id===d.collection));assert.equal(d.orientation,'landscape');assert.ok(Number.isInteger(d.row)&&d.row>=0&&d.row<d.rows);assert.ok(fs.existsSync('src/assets/cylinders/'+d.asset));}
});
