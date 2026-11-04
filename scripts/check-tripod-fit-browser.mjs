import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.CYLINDER_ORIGIN||'http://localhost:4175')+'/cylinders/');
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});
 await ready();for(const id of ['tripod-fit-options','tripod-joint-test','tripod-legs'])assert.equal(await page.locator('#'+id).isVisible(),false);
 await page.selectOption('#stand','tall-tripod');await ready();assert.equal(await page.inputValue('#tripodPegWidth'),'10.5');
 assert.equal(await page.locator('.cylinder-workspace .actions #tripod-joint-test').count(),1);assert.equal(await page.locator('.cylinder-workspace .actions #tripod-legs').count(),1);assert.equal(await page.locator('.cylinder-workspace .actions > button').first().getAttribute('id'),'tripod-joint-test');assert.ok((await page.locator('#tripod-fit-options').boundingBox()).y<(await page.locator('#stand-gallery').boundingBox()).y);await page.locator('#tripod-joint-test').scrollIntoViewIfNeeded();assert.ok(await page.locator('#tripod-joint-test').isVisible());await page.locator('.cylinder-workspace .actions').screenshot({path:'artifacts/cylinders/tripod-fit/download-buttons.png'});
 for(const printer of ['a1-mini','256']){
  await page.selectOption('#printer-size',printer);await ready();
  for(const [button,name]of [['tripod-joint-test','tripod-joint'],['tripod-legs','tripod-legs']]){
   const pending=page.waitForEvent('download');await page.click('#'+button);const download=await pending;
   assert.equal(await download.failure(),null);assert.match(download.suggestedFilename(),/10p50mm\.3mf$/);
   await download.saveAs(`artifacts/cylinders/${printer}-${name}.3mf`);
  }
 }
 await page.fill('#tripodPegWidth','10.6');await ready();assert.match(await page.locator('#assembly-note').textContent(),/10.60 mm/);
 await page.fill('#tripodPegWidth','10.9');assert.ok(await page.locator('#tripod-joint-test').isDisabled());assert.ok(await page.locator('#tripod-legs').isDisabled());
 await page.selectOption('#stand','desktop-plain');await ready();for(const id of ['tripod-fit-options','tripod-joint-test','tripod-legs'])assert.equal(await page.locator('#'+id).isVisible(),false);
 await page.click('#reset');await ready();assert.equal(await page.inputValue('#tripodPegWidth'),'10.5');assert.equal(await page.inputValue('#printer-size'),'a1-mini');
 await page.selectOption('#stand','tall-tripod');await ready();
 for(const width of [390,320]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#tripod-joint-test').scrollIntoViewIfNeeded();const button=await page.locator('#tripod-joint-test').boundingBox();assert.ok(button.y>=0&&button.y+button.height<=1000);}
 assert.deepEqual(errors,[]);console.log('Measured-fit default, both printers, joint/legs 3MF downloads, adjustment, invalid input, hidden controls, reset and mobile layout passed.');
}finally{await browser.close();}
