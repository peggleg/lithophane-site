import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';import {productKernel}from '../src/product-kernel.js';import {validateProduct}from '../src/product-settings.js';
const m=await init();m.setup();

import {seasonalPeg}from '../src/game-solitaire.js';
test('seasonal heads connect to their stems without floating geometry or empty layers',()=>{const K=productKernel(m,validateProduct({kind:'game-solitaire'}));try{for(const style of ['tulip','strawberry','pumpkin','snowman','tree']){const solid=seasonalPeg(K,style,5),components=solid.decompose();assert.equal(components.length,1,style);components.forEach(c=>c.delete());for(let z=4.8;z<10;z+=.2)assert.ok(K.own(solid.intersect(K.cyl(1, .1,0,0,z))).volume()>.1,style+' continuous neck');}}finally{K.dispose();}});
