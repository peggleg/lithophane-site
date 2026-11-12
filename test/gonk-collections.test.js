import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonalDesigns,artworkCell,sampleSize} from '../src/postcards.js';
import {sampleCollections} from '../src/sample-gallery.js';
import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';
const baseline=JSON.parse(fs.readFileSync('src/fixtures/gonk-baseline-2026-11-12.json'));
const sha=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');
test('all previous gallery entries, crops, cylinder rows and asset bytes are preserved',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.flat.length),baseline.flat);
 assert.deepEqual(cylinderCatalogue.slice(0,baseline.cylinders.length),baseline.cylinders);
 for(const d of baseline.flat)assert.deepEqual(artworkCell(d,1200,1600),baseline.cells[d.id]);
 for(const [path,hash] of Object.entries(baseline.assets))assert.equal(sha(path),hash,path);
});
test('Gonk has a separate loadable postcard and panorama, while Christmas gonks remain available',()=>{
 const flat=seasonalDesigns.filter(d=>d.season==='Gonk'),cylinders=cylinderCatalogue.filter(d=>d.collection==='gonk');
 assert.ok(sampleCollections().some(c=>c.name==='Gonk'));assert.ok(cylinderCollections.some(c=>c.id==='gonk'&&c.name==='Gonk'));
 assert.ok(flat.length>=1);assert.ok(cylinders.length>=1);
 for(const d of flat){assert.ok(fs.existsSync(`src/assets/seasonal-${d.atlas}.png`));assert.deepEqual(sampleSize(d),d.orientation==='landscape'?{width:148,height:105,max:3}:{width:105,height:148,max:3});}
 for(const d of cylinders){assert.equal(d.orientation,'landscape');assert.equal(d.row,0);assert.equal(d.rows,1);assert.ok(fs.existsSync('src/assets/cylinders/'+d.asset));}
 for(const d of baseline.cylinders.filter(d=>d.collection==='christmas'&&d.id.includes('gonk')))assert.deepEqual(cylinderCatalogue.find(x=>x.id===d.id),d);
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,seasonalDesigns.length);assert.equal(new Set(cylinderCatalogue.map(d=>d.id)).size,cylinderCatalogue.length);
});
