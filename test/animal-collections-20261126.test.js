import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {seasonalDesigns,artworkCell,sampleSize} from '../src/postcards.js';import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';import {sampleCollections} from '../src/sample-gallery.js';
import baseline from '../src/fixtures/animal-collections-baseline-2026-11-26.json' with {type:'json'};import flat from '../src/fixtures/animal-collections-flat-2026-11-26.json' with {type:'json'};import cyl from '../src/fixtures/animal-collections-cylinders-2026-11-26.json' with {type:'json'};
test('new sections accumulate and preserve all existing entries and assets',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.flat.length),baseline.flat);assert.deepEqual(cylinderCatalogue.slice(0,baseline.cylinders.length),baseline.cylinders);
 for(const [p,h] of Object.entries(baseline.assets))assert.equal(createHash('sha256').update(fs.readFileSync(p)).digest('hex'),h,p);
 assert.deepEqual(seasonalDesigns.slice(baseline.flat.length,baseline.flat.length+flat.length),flat);assert.deepEqual(cylinderCatalogue.slice(baseline.cylinders.length,baseline.cylinders.length+cyl.length),cyl);
 assert.equal(new Set(seasonalDesigns.map(x=>x.id)).size,seasonalDesigns.length);assert.equal(new Set(cylinderCatalogue.map(x=>x.id)).size,cylinderCatalogue.length);
 const mappings=fs.readFileSync('src/seasonal.js','utf8');for(const d of flat){assert.equal(d.rows,1);assert.equal(d.columns,1);assert.equal(d.row,0);assert.equal(d.column,0);assert.ok(mappings.includes(`'${d.atlas}':`));assert.ok(fs.existsSync(`src/assets/seasonal-${d.atlas}.png`));const size=sampleSize(d),crop=artworkCell(d,1536,1024);assert.ok(Math.abs(crop.width/crop.height-size.width/size.height)<1e-9);assert.ok(sampleCollections().some(x=>x.name===d.season));}
 for(const d of cyl){assert.equal(d.orientation,'landscape');assert.equal(d.row,0);assert.equal(d.rows,1);assert.equal(d.seamMode,'narrow');assert.ok(fs.existsSync(`src/assets/cylinders/${d.asset}`));assert.ok(cylinderCollections.some(x=>x.id===d.collection));}
});
