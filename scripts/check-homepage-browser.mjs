import {chromium} from 'playwright';
import {pageInfo} from '../src/seo.js';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4175/');
 assert.equal(await page.locator('.tool-card').count(),Object.keys(pageInfo).length);
 assert.equal(await page.locator('[data-collection]').count(),4);
 for (const image of await page.locator('.home-model-art img').all()) {
  await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());
  assert.ok(await image.evaluate(el=>el.naturalWidth>0));
 }
 // Every existing generator remains reachable through a project card.
 for(const [key,info] of Object.entries(pageInfo)) if(key!=='home')
  assert.ok(await page.locator(`.project-link[href="./${info.path}"]`).count(),key);
 for(const [group,count] of [['personalise',6],['home-living',3],['workspace',4],['hobbies-games',3]]) {
  await page.locator(`[data-filter="${group}"]`).click();
  assert.equal(await page.locator('.tool-card:visible').count(),count);
  assert.equal(await page.locator('[data-collection]:visible').count(),1);
 }
 await page.locator('[data-filter="all"]').click();
 await page.locator('#project-search').fill('storage');
 assert.ok(await page.locator('.tool-card:visible').count()>1);
 await page.locator('#project-search').fill('nonsenseword');
 assert.equal(await page.locator('.tool-card:visible').count(),0);
 assert.equal(await page.locator('#no-projects').isVisible(),true);
 assert.match(await page.locator('#project-results').textContent(),/0 projects/);
 await page.locator('#project-search').fill('cupboard');
 assert.equal(await page.locator('.tool-card:visible').count(),1);
 await page.locator('#project-search').fill('');
 for(const width of [1440,900,390,320]) for(const theme of ['light','dark']) {
  await page.setViewportSize({width,height:1000});
  if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('.theme-control').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${theme} overflow`);
  await page.evaluate(()=>scrollTo(0,0));
  if(width===1440)await page.screenshot({path:`artifacts/redesign-home-${theme}.png`,fullPage:true});
  if(width===390)await page.screenshot({path:`artifacts/redesign-home-mobile-${theme}.png`,fullPage:true});
 }
 await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('link',{name:'Make a cupboard',exact:false}).click();
 await page.waitForURL('**/desk/?item=cupboard#studio');
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});
 await ready();assert.equal(await page.inputValue('#kind'),'cupboard');
 assert.match(await page.locator('#dimensions').textContent(),/340/);
 await page.click('#reset');await ready();assert.equal(await page.inputValue('#kind'),'cupboard');
 await page.goto('http://localhost:4175/desk/?item=unknown');await ready();assert.equal(await page.inputValue('#kind'),'drawers');
 const context=await browser.newContext({javaScriptEnabled:false});const fallback=await context.newPage();
 await fallback.goto('http://localhost:4175/');assert.equal(await fallback.locator('.tool-card:visible').count(),Object.keys(pageInfo).length);
 assert.equal(await fallback.locator('.finder-controls').isVisible(),false);await context.close();
 assert.deepEqual(errors,[]);
 console.log('Homepage: complete catalogue, four collection filters, combined search, empty state, image decoding, no-JS fallback, theme persistence, responsive layouts and cupboard deep links passed.');
} finally {await browser.close();}
