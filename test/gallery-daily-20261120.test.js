import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PNG} from 'pngjs';
import {seasonalDesigns, artworkCell, sampleSize} from '../src/postcards.js';
import {sampleCollections, sampleGroups} from '../src/sample-gallery.js';
import {cylinderCatalogue, cylinderCollections} from '../src/cylinder-catalogue.js';
import baseline from '../src/fixtures/gallery-baseline-daily-2026-11-20.json' with {type:'json'};
import flatBatch from '../src/fixtures/seasonal-additions-2026-11-20.json' with {type:'json'};

const date='2026-11-20';
const targetCollections=['christmas','easter','halloween','valentine','newyear','mother','father','thanksgiving','gonk','animals'];
const targets=cylinderCollections.filter(collection=>targetCollections.includes(collection.id));
const wrapBatch=cylinderCatalogue.slice(baseline.cylinders.length,baseline.cylinders.length+targets.length);
const seasonalSource=fs.readFileSync('src/seasonal.js','utf8');
const hash=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');

test('daily galleries preserve every earlier entry, flat asset binding, crop, atlas row and asset byte',()=>{
 assert.deepEqual(seasonalDesigns.slice(0,baseline.flat.length),baseline.flat);
 assert.deepEqual(cylinderCatalogue.slice(0,baseline.cylinders.length),baseline.cylinders);
 assert.deepEqual(cylinderCollections.slice(0,baseline.collections.length),baseline.collections);
 const lines=new Set(seasonalSource.replace('};\n// Load','\n// Load').split('\n').map(line=>line.trim()));
 for(const binding of baseline.flatAssetBindings)assert.ok(lines.has(binding),binding);
 for(const design of baseline.flat)assert.deepEqual(artworkCell(design,1200,1600),baseline.cells[design.id],design.id);
 for(const [path,sha] of Object.entries(baseline.assets))assert.equal(hash(path),sha,path);
});

test('each requested collection gains one new flat picture and a distinct standalone cylinder panorama',()=>{
 const cylinderNames=targets.map(collection=>collection.name);
 const flatNames=cylinderNames.map(name=>name==='New Year'?'New Year 2027':name);
 assert.deepEqual(flatBatch.map(design=>design.season),flatNames);
 assert.deepEqual(wrapBatch.map(design=>design.collection),targetCollections);
 assert.deepEqual(wrapBatch.map(design=>design.season),cylinderNames);
 assert.ok(seasonalDesigns.length>=baseline.flat.length+flatBatch.length);
 assert.ok(cylinderCatalogue.length>=baseline.cylinders.length+wrapBatch.length);
 const ids=[...seasonalDesigns,...cylinderCatalogue].map(design=>design.id);
 for(const design of [...flatBatch,...wrapBatch])assert.equal(ids.filter(id=>id===design.id).length,1,design.id);
 assert.deepEqual(new Set(flatBatch.map(design=>design.orientation)),new Set(['portrait','landscape']));
 const existingHashes=new Set(Object.values(baseline.assets));
 const collections=sampleCollections();
 for(const design of flatBatch){
  assert.deepEqual(seasonalDesigns.find(entry=>entry.id===design.id),design);
  const collection=collections.find(entry=>entry.name===design.season);
  const {recent,older}=sampleGroups(collection);
  assert.ok([...recent,...older].some(entry=>entry.id===design.id));
  assert.ok(design.id.endsWith(date));
  assert.equal(design.atlas,design.id);
  assert.deepEqual([design.column,design.row,design.columns,design.rows,design.cropToPostcard],[0,0,1,1,true]);
  const asset='seasonal-'+design.id+'.png';
  const binding=seasonalSource.match(new RegExp("import (\\w+) from '\\./assets/"+asset.replace('.','\\.')+"'"));
  assert.ok(binding,asset);
  assert.ok(seasonalSource.includes("'"+design.id+"':"+binding[1]+','),design.id);
  const path='src/assets/'+asset;
  const sha=hash(path);
  assert.ok(!existingHashes.has(sha),path);
  existingHashes.add(sha);
  const {width,height,data}=PNG.sync.read(fs.readFileSync(path));
  assert.ok(Math.min(width,height)>=1000,asset);
  assert.equal(width>height?'landscape':'portrait',design.orientation,asset);
  const cell=artworkCell(design,width,height),size=sampleSize(design);
  assert.deepEqual([size.width,size.height],design.orientation==='landscape'?[148,105]:[105,148]);
  assert.ok(Math.abs(cell.width/cell.height-size.width/size.height)<1e-10,asset);
  assert.ok(cell.width*cell.height>=width*height*.9,asset);
  const tones=new Set();
  let sum=0,squares=0;
  for(let i=0;i<data.length;i+=4){
   const luma=Math.round(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2]);
   assert.equal(data[i+3],255);
   tones.add(luma);
   sum+=luma;
   squares+=luma*luma;
  }
  const count=width*height,mean=sum/count;
  assert.ok(tones.size>=150&&mean>25&&mean<230&&Math.sqrt(squares/count-mean*mean)>20,asset);
 }
 for(const design of wrapBatch){
  assert.ok(design.id.endsWith(date));
  assert.equal(design.asset,design.id+'.webp');
  assert.deepEqual([design.orientation,design.row,design.rows,design.seamMode],['landscape',0,1,undefined]);
  assert.equal(cylinderCatalogue.filter(entry=>entry.asset===design.asset).length,1);
  const path='src/assets/cylinders/'+design.asset,sha=hash(path);
  assert.ok(!existingHashes.has(sha),path);
  existingHashes.add(sha);
 }
});
