import test from 'node:test';
import assert from 'node:assert/strict';
import {narrowPeriodicTones} from '../src/cylinder-narrow-texture.js';
import {seamMetrics} from '../src/cylinder-texture.js';

test('narrow overlap joins panorama endpoints while retaining interior detail',()=>{
 const width=400,height=4,source=Uint8Array.from({length:width*height},(_,i)=>i%width%256);
 const result=narrowPeriodicTones(source,width,height);
 assert.equal(result.length,source.length);
 assert.deepEqual(seamMetrics(result,width,height),{maximum:0,mean:0});
 assert.ok(new Set(result.slice(50,350)).size>150);
 assert.throws(()=>narrowPeriodicTones(source,width,0));
});
