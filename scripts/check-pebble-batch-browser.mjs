import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
function entries(bytes){const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),files={};for(let i=0;view.getUint32(i,true)===0x04034b50;){const size=view.getUint32(i+18,true),names=view.getUint16(i+26,true),extra=view.getUint16(i+28,true),start=i+30+names+extra;files[new TextDecoder().decode(bytes.subarray(i+30,i+30+names))]=bytes.subarray(start,start+size);i=start+size;}return files;}
try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4175/clickers/');const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'));await ready();assert.equal(await page.locator('#pebble-batch').isVisible(),false);
 await page.selectOption('#design','pebble');await ready();assert.equal(await page.locator('#pebble-batch').isVisible(),true);assert.equal(await page.locator('#count').inputValue(),'1');
 await page.click('#batch-alphabet');assert.match(await page.locator('#batch-status').textContent(),/26 separate pebbles.*52 printed pieces/);
 async function download(id){const promise=page.waitForEvent('download',{timeout:120000});await page.click(id);const file=await promise;assert.equal(await file.failure(),null);return entries(await fs.readFile(await file.path()));}
 const alphabet=await download('#batch-stl');assert.equal(Object.keys(alphabet).filter(n=>n.endsWith('.stl')).length,52);assert.ok(alphabet['pebble-01-A/base.stl']);assert.ok(alphabet['pebble-26-Z/cap.stl']);assert.match(new TextDecoder().decode(alphabet['PRINT-GUIDE.txt']),/26 separate Pocket Pebbles/);
 const mf=await download('#batch-three-mf'),xml=new TextDecoder().decode(mf['3D/3dmodel.model']);assert.equal((xml.match(/<object /g)||[]).length,52);
 await page.click('#batch-lowercase');assert.equal(await page.locator('#batch-text').inputValue(),'abcdefghijklmnopqrstuvwxyz');
 await page.click('#batch-digits');assert.equal(await page.locator('#batch-text').inputValue(),'0123456789');const digits=await download('#batch-stl');assert.equal(Object.keys(digits).filter(n=>n.endsWith('.stl')).length,20);
 await page.fill('#batch-text','A A\n!');assert.match(await page.locator('#batch-status').textContent(),/3 separate/);const copies=await download('#batch-stl');assert.equal(Object.keys(copies).filter(n=>n.endsWith('.stl')).length,6);assert.ok(copies['pebble-02-A/cap.stl']);assert.ok(copies['pebble-03-u21/cap.stl']);
 await page.fill('#batch-text',' ');assert.equal(await page.locator('#batch-stl').isDisabled(),true);await page.fill('#batch-text','A'.repeat(65));assert.equal(await page.locator('#batch-three-mf').isDisabled(),true);
 await page.click('#batch-alphabet');await page.click('#batch-stl');await page.click('#cancel');assert.match(await page.locator('#export-status').textContent(),/Cancelled/);assert.equal(await page.locator('#batch-stl').isEnabled(),true);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#pebble-batch').screenshot({path:'artifacts/pebble-batch-mobile.png'});
 await page.selectOption('#design','charm');await ready();assert.equal(await page.locator('#pebble-batch').isVisible(),false);assert.equal(await page.locator('#key-buttons button').count(),3);assert.deepEqual(errors,[]);
 console.log('Pocket Pebble alphabet, lowercase/digit presets, custom copies, 52-part ZIP/3MF, limits, cancellation and mobile layout passed.');
}finally{await browser.close();}
