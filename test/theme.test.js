import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/theme-boot.js',import.meta.url),'utf8');
function boot(saved,systemDark,blocked=false){const data={};const keys=[];vm.runInNewContext(source,{document:{documentElement:{dataset:data}},localStorage:{getItem(key){keys.push(key);if(blocked)throw Error('Storage unavailable');return saved;}},matchMedia(){return {matches:systemDark};}});assert.deepEqual(keys,['design-studio-theme']);return data;}
test('theme boot applies saved choice before page UI and defaults to the system',()=>{assert.equal(boot('dark',false).theme,'dark');assert.equal(boot('light',true).theme,'light');assert.equal(boot(null,true).theme,'dark');assert.equal(boot('system',false).theme,'light');assert.equal(boot('invalid',true).themePreference,'system');});
test('blocked storage leaves theme switching available using System',()=>{const d=boot(null,true,true);assert.equal(d.theme,'dark');assert.equal(d.themePreference,'system');});
