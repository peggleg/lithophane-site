import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonalDesigns,artworkCell,sampleSize} from '../src/postcards.js';
import {cylinderCatalogue} from '../src/cylinder-catalogue.js';
import baseline from '../src/fixtures/gallery-baseline-daily-2026-11-28.json' with {type:'json'};
import additions from '../src/fixtures/seasonal-additions-2026-11-28-daily.json' with {type:'json'};

test('daily gallery pictures accumulate without altering any prior entry or asset',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.flat.length),baseline.flat);
 assert.deepEqual(cylinderCatalogue.slice(0,baseline.cylinders.length),baseline.cylinders);
 for(const [path,hash] of Object.entries(baseline.assets))assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),hash,path);
 assert.equal(new Set(seasonalDesigns.map(x=>x.id)).size,seasonalDesigns.length);
 assert.equal(new Set(cylinderCatalogue.map(x=>x.id)).size,cylinderCatalogue.length);
 const seasons=['Christmas','Easter','Halloween','Valentine’s Day','New Year 2027','Mother’s Day','Father’s Day','Thanksgiving','Gonk','Animals'];
 const groups=['christmas','easter','halloween','valentine','newyear','mother','father','thanksgiving','gonk','animals'];
 assert.deepEqual(additions.map(x=>x.season),seasons);
 assert.ok(seasonalDesigns.length>=baseline.flat.length+additions.length);
 assert.deepEqual(seasonalDesigns.slice(baseline.flat.length,baseline.flat.length+additions.length),additions);
 assert.ok(cylinderCatalogue.length>=baseline.cylinders.length+groups.length);
 const cylinder=cylinderCatalogue.slice(baseline.cylinders.length,baseline.cylinders.length+groups.length);assert.deepEqual(cylinder.map(x=>x.collection),groups);
 assert.deepEqual(new Set(additions.map(x=>x.orientation)),new Set(['portrait','landscape']));
 const mappings=fs.readFileSync('src/seasonal.js','utf8');
 for(const d of additions){assert.equal(d.rows,1);assert.equal(d.columns,1);assert.equal(d.row,0);assert.equal(d.column,0);assert.ok(mappings.includes(`'${d.atlas}':`));assert.ok(fs.existsSync(`src/assets/seasonal-${d.atlas}.png`));const size=sampleSize(d);const crop=artworkCell(d,1536,1024);assert.ok(Math.abs(crop.width/crop.height-size.width/size.height)<1e-9);}
 for(const d of cylinder){assert.equal(d.orientation,'landscape');assert.equal(d.row,0);assert.equal(d.rows,1);assert.ok(fs.existsSync(`src/assets/cylinders/${d.asset}`));}
});
