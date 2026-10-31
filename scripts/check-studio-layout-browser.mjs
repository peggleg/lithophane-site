import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});
 for(const route of ['desk','coasters','kitchen','bathroom','mounts','pegboards','seeds','crochet','games','keyrings','nameplates','clickers']) {
  await page.goto(`http://localhost:4175/${route}/`);await page.locator('.maker-studio').waitFor();
  assert.equal(await page.locator('.studio-jumps a').count(),3,route);
  const section=page.locator('.studio-control-section').first(),toggle=section.locator('.studio-section-toggle').first();
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  const input=section.locator('input,select').first();const value=await input.inputValue();
  await toggle.click();assert.equal(await input.isVisible(),false,route);
  await toggle.focus();await page.keyboard.press('Enter');
  assert.equal(await input.isVisible(),true);assert.equal(await input.inputValue(),value);
  for(const width of [1440,390,320]) {
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route}/${width}`);
   await page.getByRole('link',{name:'Download',exact:true}).click();
   assert.ok(await page.locator('.export').evaluate(el=>el===document.activeElement));
  }
  await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto('http://localhost:4175/desk/');await ready();
 await page.selectOption('#kind','pot');await ready();
 assert.equal(await page.locator('#drawer-settings').isVisible(),false);
 const first=page.locator('.studio-section-toggle').first();await first.click();await first.click();
 assert.equal(await page.locator('#drawer-settings').isVisible(),false);
 await page.selectOption('#kind','drawers');await ready();assert.equal(await page.locator('#drawer-settings').isVisible(),true);
 // Existing event handlers still invalidate and rebuild the downloadable model.
 await page.fill('#width','1');assert.equal(await page.locator('#three-mf').isDisabled(),true);
 await page.fill('#width','140');await ready();assert.equal(await page.locator('#three-mf').isDisabled(),false);
 const pending=page.waitForEvent('download');await page.click('#three-mf');const file=await pending;
 assert.equal(await file.failure(),null);assert.match(file.suggestedFilename(),/\.3mf$/);
 await page.setViewportSize({width:1440,height:1000});await page.locator('#studio').screenshot({path:'artifacts/redesign-editor-desktop.png'});
 await page.setViewportSize({width:390,height:900});await page.locator('#studio').screenshot({path:'artifacts/redesign-editor-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('Editors: all 12 non-photo routes, keyboard disclosure, values retained, conditional fields, mobile jump links, invalid/stale export handling and regenerated 3MF passed.');
}finally{await browser.close();}
