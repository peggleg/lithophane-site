import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cylinderCatalogue} from '../src/cylinder-catalogue.js';

test('the sixteen new game and kids TV panoramas have distinct standalone assets',()=>{
 const ids=['gaming-hollow-knight-stairway','gaming-minecraft-mountain-and-mine','gaming-fortnite-battle-bus-plaza','gaming-sonic-green-hill-loop','gaming-pac-man-arcade-maze','gaming-stardew-farm-from-above','kids-tv-pingu-skating-pond','kids-tv-thundercats-journey','kids-tv-peter-rabbit-garden','gaming-zelda-lake-voyage','kids-tv-ninja-turtles-rooftops','kids-tv-maya-bee-meadow','gaming-tetris-block-valley','kids-tv-rabbids-invasion-town-square','gaming-rayman-jungle-swing','kids-tv-shaun-sheep-picnic'].map(s=>s+'-2026-11-20');
 const entries=ids.map(id=>{const d=cylinderCatalogue.find(d=>d.id===id);assert.ok(d,id);assert.equal(d.row,0);assert.equal(d.rows,1);assert.equal(d.orientation,'landscape');assert.equal(d.seamMode,'narrow');assert.equal(d.asset,id+'.webp');assert.ok(fs.existsSync('src/assets/cylinders/'+d.asset));return d;});
 assert.equal(new Set(entries.map(d=>d.asset)).size,16);
 assert.equal(entries.filter(d=>d.collection==='gaming').length,9);
 assert.equal(entries.filter(d=>d.collection==='kids-tv').length,7);
});
