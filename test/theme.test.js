import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/theme-boot.js',import.meta.url),'utf8');
function boot(saved,systemDark,blocked=false){const data={};const keys=[];vm.runInNewContext(source,{document:{documentElement:{dataset:data}},localStorage:{getItem(key){keys.push(key);if(blocked)throw Error('Storage unavailable');return saved;}},matchMedia(){return {matches:systemDark};}});assert.deepEqual(keys,['design-studio-theme']);return data;}
test('theme remembers Light or Dark and defaults to Light without System',()=>{assert.equal(boot('dark',false).theme,'dark');assert.equal(boot('light',true).theme,'light');for(const saved of [null,'system','invalid'])assert.equal(boot(saved,true).themePreference,'light');});
test('blocked storage defaults to Light',()=>assert.equal(boot(null,true,true).theme,'light'));
