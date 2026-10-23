import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4175/desk/');
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:45000});await ready();
 assert.equal(await page.getByText('Surface style',{exact:false}).first().isVisible(),true);
 assert.equal(await page.locator('#openwork option').count(),7);
 for(const pattern of ['honeycomb','diamond','slots','windows','arches','woven']){
  await page.selectOption('#openwork',pattern);await ready();await page.selectOption('#openworkFaces','front-sides');await ready();
  await page.locator('#model-preview').screenshot({path:`artifacts/openwork-${pattern}.png`});
  assert.match(await page.locator('#bed-status').textContent(),/Every part fits/);
 }
 const drawerDownload=page.waitForEvent('download');await page.click('#three-mf');await fs.mkdir('artifacts/openwork-bambu',{recursive:true});await (await drawerDownload).saveAs('artifacts/openwork-bambu/drawer-front.3mf');
 await page.selectOption('#kind','box');await ready();await page.fill('#height','60');await ready();
 await page.fill('#openingSize','4');await ready();await page.fill('#openingSize','20');await ready();
 await fs.mkdir('artifacts/openwork-bambu',{recursive:true});
 for(const id of ['three-mf','stl','print-guide']){const pending=page.waitForEvent('download');await page.click('#'+id);const file=await pending;assert.equal(await file.failure(),null);if(id==='three-mf')await file.saveAs('artifacts/openwork-bambu/openwork.3mf');if(id==='print-guide'){const text=await fs.readFile(await file.path(),'utf8');assert.match(text,/OPENWORK/);assert.match(text,/8% gyroid/);assert.match(text,/3 top and 3 bottom/);}}
 await page.selectOption('#kind','pot');await ready();await page.selectOption('#shape','round');await ready();assert.equal(await page.locator('#openwork-controls').isVisible(),false);
 await page.selectOption('#kind','bin');await ready();assert.equal(await page.locator('#openwork-controls').isVisible(),false);
 await page.selectOption('#kind','drawers');await ready();assert.equal(await page.locator('#openwork-controls').isVisible(),true);
 await page.setViewportSize({width:390,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#model-preview').screenshot({path:'artifacts/openwork-mobile.png'});
 await page.fill('#openingSize','3');await page.waitForFunction(()=>!document.querySelector('#feedback').textContent.startsWith('Design ready'));assert.equal(await page.locator('#three-mf').isEnabled(),false);await page.selectOption('#openwork','none');await ready();assert.equal(await page.locator('#three-mf').isEnabled(),true);
 assert.deepEqual(errors,[]);console.log('Openwork: six patterns, placement, resizing, all downloads, guides, unavailable shapes, invalidation and mobile layout passed.');
}finally{await browser.close();}
