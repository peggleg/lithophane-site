import test from 'node:test';
import assert from 'node:assert/strict';
import {fanSamples,sampleCell} from '../src/fan-sample-data.js';
test('nature samples remain intact and the new themes add two images each',()=>{
 assert.equal(fanSamples.length,22);assert.equal(new Set(fanSamples.map(d=>d.id)).size,fanSamples.length);
 const nature=fanSamples.slice(0,12);assert.equal(new Set(nature.map(d=>`${d.atlas}:${d.cell}`)).size,12);
 for(const atlas of ['mountains','coast','wildlife'])assert.equal(nature.filter(d=>d.atlas===atlas).length,4);
 for(const ids of [['snoopy-beach','snoopy-gingerbread'],['christmas-tree-farm','christmas-market'],['cartoon-dragon-baker','cartoon-fox-astronaut'],['capybara-snowy-springs','capybara-picnic'],['highland-loch','highland-bakers']])for(const id of ids)assert.ok(fanSamples.find(d=>d.id===id&&d.cell===null));
 for(const design of fanSamples){assert.ok(design.name&&design.description);const c=sampleCell(design,1536,768);assert.equal(c.width/c.height,2);assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=1536&&c.y+c.height<=768);}
});
test('atlas crops remain unchanged and standalone pictures are centred without stretching',()=>{
 assert.deepEqual(sampleCell({cell:0},1600,800),{x:0,y:0,width:800,height:400});
 assert.deepEqual(sampleCell({cell:3},1600,800),{x:800,y:400,width:800,height:400});
 assert.deepEqual(sampleCell({cell:null},1800,600),{x:300,y:0,width:1200,height:600});
 assert.deepEqual(sampleCell({cell:null},800,800),{x:0,y:200,width:800,height:400});
 assert.throws(()=>sampleCell({cell:4},1600,800));
});
