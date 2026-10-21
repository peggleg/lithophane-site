import test from 'node:test';
import assert from 'node:assert/strict';
import {fanSamples,sampleCell} from '../src/fan-sample-data.js';
test('twelve named nature samples use twelve distinct atlas cells',()=>{
 assert.equal(fanSamples.length,12);assert.equal(new Set(fanSamples.map(d=>d.id)).size,12);
 assert.equal(new Set(fanSamples.map(d=>`${d.atlas}:${d.cell}`)).size,12);
 for(const atlas of ['mountains','coast','wildlife'])assert.equal(fanSamples.filter(d=>d.atlas===atlas).length,4);
 for(const design of fanSamples){assert.ok(design.name&&design.description);const c=sampleCell(design,1536,768);assert.equal(c.width/c.height,2);assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=1536&&c.y+c.height<=768);}
});
test('sample atlas crop selects the expected quadrants and rejects invalid cells',()=>{
 assert.deepEqual(sampleCell({cell:0},1600,800),{x:0,y:0,width:800,height:400});
 assert.deepEqual(sampleCell({cell:3},1600,800),{x:800,y:400,width:800,height:400});
 assert.throws(()=>sampleCell({cell:4},1600,800));
});
