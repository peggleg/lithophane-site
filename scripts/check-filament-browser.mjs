import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForFunction(()=>document.querySelector('#filament-estimate')?.textContent.includes('g total'),null,{timeout:60000});
 for(const route of ['desk','clickers','nameplates','keyrings','folding-fan']){
  console.log('Checking filament:',route);await page.goto(`http://localhost:4175/${route}/`);await ready();assert.match(await page.locator('#filament-estimate').textContent(),/1.24 g\/cm³/);
  if(route==='folding-fan'){await page.click('#demo');await page.waitForFunction(()=>document.querySelector('#zip').disabled===false);await ready();}
  if(route==='folding-fan')await page.locator('details').filter({has:page.locator('#summary')}).locator('summary').click();console.log('Downloading guide:',route);const promise=page.waitForEvent('download');await page.click(route==='folding-fan'?'#summary':'#print-guide');const download=await promise,guide=await fs.readFile(await download.path(),'utf8');assert.match(guide,/ESTIMATED FILAMENT/);assert.match(guide,/Total: [\d.]+ g/);assert.match(guide,/8% gyroid/);
  if(route==='desk'){const before=await page.locator('#filament-estimate strong').textContent();await page.fill('#width','170');await ready();assert.notEqual(await page.locator('#filament-estimate strong').textContent(),before);await page.fill('#width','171');assert.equal(await page.locator('#filament-estimate').textContent(),'Estimated filament: —');await page.fill('#width','140');await ready();}
  if(route==='clickers'){await page.locator('[data-design="pebble"]').click();await ready();await page.fill('#batch-text','ABC');await page.click('#batch-filament');await page.waitForFunction(()=>document.querySelector('#batch-filament-estimate').textContent.includes('g total'));assert.match(await page.locator('#batch-filament-estimate').textContent(),/Filament by part \(6\)/);await page.fill('#batch-text','AB');assert.equal(await page.locator('#batch-filament-estimate').textContent(),'Estimated filament: —');}
  await page.setViewportSize({width:390,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#filament-estimate').screenshot({path:`artifacts/filament-${route}.png`});await page.setViewportSize({width:1280,height:950});
 }
 await page.goto('http://localhost:4175/lithophane/');assert.ok(await page.locator('#corner-filament').textContent());
 assert.deepEqual(errors,[]);console.log('Filament estimates: five mesh generators, lithophane corner, batch totals, guides, resize, invalidation and mobile checks passed.');
}finally{await browser.close();}
