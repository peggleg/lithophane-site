import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {seasonalDesigns,artworkCell,sampleSize} from '../src/postcards.js';
import baseline from '../src/fixtures/flat-christmas-baseline-2026-11-21.json' with {type:'json'};
import added from '../src/fixtures/flat-christmas-additions-2026-11-21.json' with {type:'json'};

test('new Christmas postcards accumulate without changing previous entries',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.length),baseline);
 assert.ok(seasonalDesigns.length>=baseline.length+added.length);
 assert.deepEqual(seasonalDesigns.slice(baseline.length,baseline.length+added.length),added);
 assert.equal(new Set(seasonalDesigns.map(d=>d.id)).size,seasonalDesigns.length);
 assert.deepEqual(new Set(added.map(d=>d.orientation)),new Set(['portrait','landscape']));
 const mappings=fs.readFileSync('src/seasonal.js','utf8');
 for(const d of added){
  assert.equal(d.season,'Christmas');assert.ok(fs.existsSync(`src/assets/seasonal-${d.atlas}.png`));
  assert.ok(mappings.includes(`'${d.atlas}':`));
  const crop=artworkCell(d,1536,1024),size=sampleSize(d);
  assert.ok(Math.abs(crop.width/crop.height-size.width/size.height)<1e-9);
 }
});
