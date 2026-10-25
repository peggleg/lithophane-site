import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await fs.mkdir('artifacts/home-bambu',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});
 async function download(id,path){const pending=page.waitForEvent('download',{timeout:90000});await page.click('#'+id);const file=await pending;await file.saveAs(path);return file;}
 for(const collection of ['kitchen','bathroom']){
  await page.goto('http://localhost:4175/'+collection+'/');await ready();
  const kinds=await page.locator('#kind option').evaluateAll(els=>els.map(e=>e.value));
  for(const kind of kinds){
   await page.selectOption('#kind',kind);await ready();assert.match(await page.locator('#filament-estimate').textContent(),/8% infill|8% gyroid/);assert.match(await page.locator('#filament-estimate').textContent(),/3 top and 3 bottom/);
   assert.ok(Number(await page.locator('#part-count').textContent())>=1);assert.match(await page.locator('#bed-status').textContent(),/170/);
   if(['roll','toothpick','caddy','soap','toothbrush','cotton','vanity','spoon'].includes(kind)){
    await download('three-mf',`artifacts/home-bambu/${kind}.3mf`);const guide=await download('print-guide',`artifacts/home-bambu/${kind}.txt`);assert.match(await fs.readFile(await guide.path(),'utf8'),/3 top and 3 bottom/);
    await page.locator('#model-preview').screenshot({path:`artifacts/home-${kind}.png`});
   }
   if(['soap','caddy','toothbrush'].includes(kind)){
    for(const pattern of ['diamond','slots','windows','honeycomb']){await page.selectOption('#openwork',pattern);await ready();}
    await page.uncheck('#drainFloor');await ready();await page.check('#drainFloor');await ready();
    if(kind!=='soap'){await page.uncheck('#dripTray');await ready();assert.equal(await page.locator('#part-count').textContent(),'1');await page.check('#dripTray');await ready();}
   }
   if(kind==='roll'){
    await page.fill('#segmentLength','100');await ready();await page.selectOption('#shaftSections','3');await ready();assert.match(await page.locator('#assembly-note').textContent(),/3 shaft sections/);
    await page.uncheck('#weightedBase');await ready();assert.equal(await page.locator('#part-count').textContent(),'5');await page.check('#weightedBase');await ready();
    await page.fill('#segmentLength','151');await page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('70–150'));assert.equal(await page.locator('#three-mf').isDisabled(),true);await page.fill('#segmentLength','150');await ready();
   }
   if(kind==='toothpick'){await page.fill('#dispenseSize','4');await ready();assert.match(await page.locator('#assembly-note').textContent(),/4 mm opening/);}
   for(const width of [390,320]){await page.setViewportSize({width,height:850});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${collection}/${kind} overflow`);}await page.setViewportSize({width:1440,height:1000});
  }
  await page.selectOption('#kind',collection==='kitchen'?'caddy':'soap');await ready();for(const style of ['smooth','fluted','slatted','ribbed','scalloped','wave']){await page.selectOption('#finish',style);await ready();}
  await page.check('#parts-view');await page.locator('#model-preview').screenshot({path:`artifacts/${collection}-parts.png`});await page.uncheck('#parts-view');
  await download('stl',`artifacts/home-bambu/${collection}.zip`);await page.click('#reset');await ready();assert.equal(await page.inputValue('#kind'),collection==='kitchen'?'roll':'soap');
 }
 assert.deepEqual(errors,[]);console.log('Kitchen/bathroom: all items, styles, drainage options, resize limits, profiles/filament, actual downloads, mobile layouts and reset passed.');
}finally{await browser.close();}
