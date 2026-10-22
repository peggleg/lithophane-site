import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4175/desk/');
 async function ready(){await page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:30000});assert.equal(await page.locator('#stl').isEnabled(),true);}
 await ready();assert.equal(await page.locator('header nav a').count(),7);
 for(const kind of ['drawers','pot','tray']){
  await page.selectOption('#kind',kind);await ready();
  for(const finish of ['smooth','fluted','slatted']){
   await page.selectOption('#finish',finish);await ready();assert.equal(Number(await page.locator('#part-count').textContent()),kind==='drawers'?3:kind==='tray'?5:1);assert.match(await page.locator('#bed-status').textContent(),/Every part fits/);
   await page.locator('#model-preview').screenshot({path:`artifacts/desk-${kind}-${finish}.png`});
   const promise=page.waitForEvent('download');await page.click('#stl');const file=await promise;assert.equal(await file.failure(),null);const bytes=await fs.readFile(await file.path());assert.equal(bytes.readUInt32LE(0),0x04034b50);assert.ok(bytes.includes(Buffer.from(kind==='drawers'?'drawer-case.stl':kind==='pot'?'pen-pot.stl':'sorting-tray.stl')));
  }
  for(const [id,value]of [['width','160'],['depth','140'],['height',kind==='tray'?'35':'120'],['columns','3'],['rows','2']]){if(['columns','rows'].includes(id))await page.selectOption('#'+id,value);else await page.fill('#'+id,value);await ready();}
  assert.match(await page.locator('#dimensions').textContent(),/160 × 140/);
  for(const id of ['three-mf','print-guide']){const promise=page.waitForEvent('download');await page.click('#'+id);const file=await promise;assert.equal(await file.failure(),null);assert.ok((await fs.stat(await file.path())).size>100);}
  await page.locator('#parts-view').check();await page.locator('#model-preview').screenshot({path:`artifacts/desk-${kind}-printing.png`});await page.locator('#parts-view').uncheck();
 }
 await page.selectOption('#kind','tray');await ready();assert.equal(await page.locator('#trayLayout').inputValue(),'boxes');assert.equal(await page.locator('#part-count').textContent(),'5');
 await page.selectOption('#columns','3');await ready();assert.equal(await page.locator('#part-count').textContent(),'7');await page.fill('#box-clearance','0.6');await ready();
 await page.selectOption('#trayLayout','fixed');await ready();assert.equal(await page.locator('#part-count').textContent(),'1');await page.selectOption('#trayLayout','open');await ready();assert.equal(await page.locator('#compartment-grid').isVisible(),false);await page.selectOption('#trayLayout','boxes');await ready();assert.equal(await page.locator('#part-count').textContent(),'7');await page.locator('#model-preview').screenshot({path:'artifacts/tray-removable-boxes.png'});
 await page.selectOption('#trayLayout','pens');await ready();assert.equal(await page.locator('#rows').inputValue(),'1');assert.equal(await page.locator('#part-count').textContent(),'5');assert.match(await page.locator('#print-sizes').textContent(),/pen-box:.*inside:/);
 const previous=await page.locator('#print-sizes').textContent();await page.fill('#width','170');await ready();assert.notEqual(await page.locator('#print-sizes').textContent(),previous);await page.fill('#penShare','40');await ready();assert.equal(await page.locator('#penShare').inputValue(),'40');await page.locator('#model-preview').screenshot({path:'artifacts/tray-full-width-pen-box.png'});
 for(const id of ['stl','three-mf']){const event=page.waitForEvent('download');await page.click('#'+id);const file=await event;const bytes=await fs.readFile(await file.path());if(id==='stl')assert.ok(bytes.includes(Buffer.from('pen-box.stl')));assert.equal(await file.failure(),null);}
 await page.selectOption('#kind','pot');await ready();await page.selectOption('#kind','tray');await ready();assert.equal(await page.locator('#rows').inputValue(),'1');assert.equal(await page.locator('#part-count').textContent(),'4');
 await page.selectOption('#kind','drawers');await ready();await page.selectOption('#drawers','4');await page.fill('#height','170');await ready();assert.equal(await page.locator('#part-count').textContent(),'5');await page.locator('#open-drawers').check();await page.locator('#model-preview').screenshot({path:'artifacts/desk-four-drawers-open.png'});await page.locator('#open-drawers').uncheck();
 const before=await page.locator('#model-preview').screenshot();await page.selectOption('#palette','charcoal');assert.notDeepEqual(await page.locator('#model-preview').screenshot(),before);
 await page.fill('#width','171');assert.equal(await page.locator('#stl').isDisabled(),true);assert.match(await page.locator('#feedback').textContent(),/170/);await page.fill('#width','170');await ready();
 await page.selectOption('#drawers','4');await page.fill('#height','40');assert.equal(await page.locator('#stl').isDisabled(),true);await page.click('#reset');await ready();assert.equal(await page.locator('#width').inputValue(),'140');assert.equal(await page.locator('#part-count').textContent(),'3');
 for(const width of [1280,390,320]){await page.setViewportSize({width,height:850});for(const kind of ['drawers','pot','tray']){await page.selectOption('#kind',kind);await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width===390)await page.locator('#model-preview').screenshot({path:`artifacts/desk-${kind}-mobile.png`});}}
 const slow=await b.newPage();await slow.addInitScript(()=>{const Native=window.Worker;window.Worker=class extends Native{postMessage(...args){setTimeout(()=>super.postMessage(...args),1000);}};});await slow.goto('http://localhost:4175/desk/');await slow.locator('#cancel').waitFor({state:'visible'});await slow.click('#cancel');await slow.waitForTimeout(1200);assert.match(await slow.locator('#feedback').textContent(),/Build cancelled/);assert.equal(await slow.locator('#stl').isDisabled(),true);await slow.close();
 const touch=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),mobile=await touch.newPage();await mobile.goto('http://localhost:4175/desk/');await mobile.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'));await mobile.selectOption('#kind','tray');await mobile.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'));await mobile.getByRole('button',{name:'Menu',exact:true}).tap();assert.equal(await mobile.getByRole('navigation').isVisible(),true);await touch.close();assert.deepEqual(errors,[]);
 console.log('Desk collection: three items × three finishes, resizing/dividers, all downloads, drawer counts, palettes, invalid sizes, cancellation, touch and responsive layouts passed.');
}finally{await b.close();}
