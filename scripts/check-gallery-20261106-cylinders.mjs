import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const batch=JSON.parse(await fs.readFile('src/fixtures/gallery-additions-2026-11-06.json','utf8')).cylinders;
const dir='artifacts/cylinders-2026-11-06';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/chromium'),args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=process.env.CYLINDER_ORIGIN||'http://localhost:4175';await page.goto(origin+'/cylinders/');
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});await ready();
 assert.equal(await page.inputValue('#printer-size'),'a1-mini');assert.equal(await page.locator('#collection option').count(),cylinderCollections.length);
 for(const d of batch){
  await page.selectOption('#collection',d.collection);await ready();
  assert.deepEqual(await page.locator('#design option').evaluateAll(o=>o.map(x=>x.value)),cylinderCatalogue.filter(x=>x.collection===d.collection).map(x=>x.id));
  await page.selectOption('#design',d.id);
  await page.waitForFunction(name=>document.querySelector('#seam-status').textContent.startsWith(name+' ·'),d.name,{timeout:90000});
  await ready();
  if(await page.locator('#stand-only').isChecked())await page.uncheck('#stand-only');
  assert.equal(await page.locator('#model-canvas').getAttribute('data-view'),'assembly');
  assert.match(await page.locator('#seam-status').textContent(),/boundary difference 0\/255/);
  await page.locator('#panorama').screenshot({path:`${dir}/${d.id}-panorama.png`});
  await page.locator('summary').click();await page.locator('#seam-preview').screenshot({path:`${dir}/${d.id}-seam.png`});await page.locator('summary').click();
  await page.locator('#model-preview').screenshot({path:`${dir}/${d.id}-wrapped.png`});
  console.log(d.id+' loaded, all prior options retained, panorama, seam and 3D wrap captured');
 }
 await page.selectOption('#printer-size','256');await ready();await page.selectOption('#printer-size','a1-mini');await ready();
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
