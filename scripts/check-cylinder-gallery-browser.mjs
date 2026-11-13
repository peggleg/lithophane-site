import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {cylinderCatalogue,cylinderCollections} from '../src/cylinder-catalogue.js';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/chromium'),args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.CYLINDER_ORIGIN||'http://localhost:4178')+'/cylinders/');
 for(const collection of cylinderCollections){
  const choices=cylinderCatalogue.filter(d=>d.collection===collection.id),recent=choices.slice().reverse().slice(0,5),older=choices.slice().reverse().slice(5);
  await page.selectOption('#collection',collection.id);
  await page.waitForFunction(name=>document.querySelector('#seam-status').textContent.startsWith(name+' ·')&&document.querySelector('#feedback').textContent.startsWith('Design ready'),recent[0].name,{timeout:90000});
  assert.deepEqual(await page.locator('#design option').evaluateAll(o=>o.map(x=>x.value)),choices.map(d=>d.id));
  assert.deepEqual(await page.locator('#design-gallery [data-design]').evaluateAll(o=>o.map(x=>x.dataset.design)),recent.map(d=>d.id));
  assert.deepEqual(await page.locator('#cylinder-older-gallery [data-design]').evaluateAll(o=>o.map(x=>x.dataset.design)),older.map(d=>d.id));
  assert.equal(await page.inputValue('#design'),recent[0].id);
  assert.equal(await page.locator('#cylinder-more').isVisible(),older.length>0);
  if(older.length){
   assert.equal(await page.locator('#cylinder-more').getAttribute('aria-expanded'),'false');
   assert.equal(await page.locator('#cylinder-older').isVisible(),false);
   await page.locator('#cylinder-more').click();assert.equal(await page.locator('#cylinder-more').getAttribute('aria-expanded'),'true');
   await page.locator(`[data-design="${older[0].id}"]`).click();
   await page.waitForFunction(name=>document.querySelector('#seam-status').textContent.startsWith(name+' ·')&&document.querySelector('#feedback').textContent.startsWith('Design ready'),older[0].name,{timeout:90000});
   assert.equal(await page.inputValue('#design'),older[0].id);
   await page.locator('#cylinder-more').click();assert.equal(await page.locator('#cylinder-older').isVisible(),false);
   await page.selectOption('#design',older[0].id);assert.equal(await page.locator('#cylinder-older').isVisible(),true);
  }
 }
 await page.setViewportSize({width:390,height:900});await page.selectOption('#collection','christmas');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#cylinder-more').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('All collections: five newest, expandable archive, preserved options, old design selection, and mobile layout passed.');
}finally{await browser.close();}
