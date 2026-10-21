import test from 'node:test';
import assert from 'node:assert/strict';
import {fitSymbol,symbolSafe,ringHoleX} from '../src/symbols.js';
import {textDefaults} from '../src/text-settings.js';
import {fonts} from '../src/font-catalogue.js';
test('12 local font choices',()=>assert.equal(Object.keys(fonts).length,12));
test('symbols stay inside each outline and away from hole under dragging and resizing',()=>{for(const shape of ['rounded','capsule','circle','heart','star','cloud']){const p={...textDefaults.keyring,shape,width:65,height:65};assert.ok(Number.isFinite(ringHoleX(p)));for(const type of ['heart','star','cloud','flower','plus'])for(const [x,y,size]of [[0,0,8],[-100,100,3],[100,-100,18]]){const s=fitSymbol({type,x,y,size},p);assert.ok(symbolSafe(s,p),`${shape} ${type}`);}}});
test('invalid dimensions cannot trigger an unbounded placement search',()=>{assert.throws(()=>fitSymbol({type:'star',x:0,y:0,size:8},{...textDefaults.keyring,width:1e10}),/35–100/);});
