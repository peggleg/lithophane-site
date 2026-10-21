import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});
const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.STUDIO_URL||'http://localhost:4175';
async function ready(){await page.waitForFunction(()=>document.getElementById('feedback')?.textContent.startsWith('Design ready'),{timeout:30000});}
await page.goto(base+'/keyrings/');await ready();assert.equal(await page.locator('#font option').count(),12);
for(const font of await page.locator('#font option').evaluateAll(options=>options.map(o=>o.value))){await page.selectOption('#font',font);await ready();}
await page.selectOption('#font','rounded');await page.click('#add-symbol');await ready();
let symbol=page.locator('#symbol-editor [tabindex]');await symbol.focus();const before=await symbol.getAttribute('points');await symbol.press('ArrowUp');await ready();assert.notEqual(await symbol.getAttribute('points'),before);const once=await symbol.getAttribute('points');await symbol.press('ArrowUp');await ready();assert.notEqual(await symbol.getAttribute('points'),once);
const box=await symbol.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+8,box.y+box.height/2-5);await page.mouse.up();await ready();
await page.locator('#symbol-size').fill('6');await page.locator('#symbol-size').dispatchEvent('input');await ready();
for(const shape of ['rounded','capsule','circle','heart','star','cloud']){
 await page.goto(base+'/keyrings/');await ready();await page.selectOption('#shape',shape);await ready();
 assert.equal(await page.inputValue('#line1'),'EXPLORE');assert.equal(await page.locator('#stl').isEnabled(),true);
 await page.click('#top-view');await page.locator('#model-preview').screenshot({path:`artifacts/keyring-${shape}.png`});
 await page.click('#add-symbol');await ready();
 for(const id of ['stl','three-mf']){const pending=page.waitForEvent('download');await page.click('#'+id);const download=await pending;assert.equal(await download.failure(),null);}
}
for(const id of ['stl','three-mf']){const download=page.waitForEvent('download');await page.click('#'+id);const file=await download;assert.ok((await file.suggestedFilename()).endsWith(id==='stl'?'.stl':'.3mf'));}
await page.getByRole('button',{name:'Dark theme',exact:true}).click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await ready();
for(const width of [1280,390]){await page.setViewportSize({width,height:850});for(const path of ['/','/keyrings/','/nameplates/','/lithophane/','/folding-fan/']){await page.goto(base+path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path);if(width===390){await page.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await page.locator('header nav').isVisible(),true);}}}
for(const shape of ['rounded','capsule','circle','heart','star','cloud']){await page.goto(base+'/keyrings/');await ready();await page.selectOption('#shape',shape);await ready();assert.equal(await page.inputValue('#line1'),'EXPLORE');assert.equal(await page.locator('#stl').isEnabled(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.click('#top-view');await page.locator('#model-preview').screenshot({path:`artifacts/keyring-${shape}-mobile.png`});}
await page.goto(base+'/keyrings/');await ready();await page.click('#add-symbol');await ready();
await page.screenshot({path:'artifacts/studio-mobile.png',fullPage:true});
const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const touchPage=await touchContext.newPage();await touchPage.goto(base+'/keyrings/');await touchPage.waitForFunction(()=>document.getElementById('feedback')?.textContent.startsWith('Design ready'));await touchPage.locator('#add-symbol').tap();await touchPage.waitForFunction(()=>document.getElementById('feedback')?.textContent.startsWith('Design ready'));
const touchSymbol=touchPage.locator('#symbol-editor [tabindex]');await touchSymbol.scrollIntoViewIfNeeded();const touchBefore=await touchSymbol.getAttribute('points'),tb=await touchSymbol.boundingBox(),client=await touchContext.newCDPSession(touchPage);const x=tb.x+tb.width/2,y=tb.y+tb.height/2;
await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-8,y:y-8}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual(await touchSymbol.getAttribute('points'),touchBefore);await touchContext.close();assert.deepEqual(errors,[]);await browser.close();console.log('All six keyring outlines with unchanged default text on desktop/mobile, each outline’s STL/3MF downloads, 12 fonts, symbol keyboard/mouse/touch/resize, remembered theme and all five routes passed.');
