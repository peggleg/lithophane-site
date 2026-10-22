import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({hasTouch:touch,viewport:touch?{width:390,height:844}:{width:1400,height:1000}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const Native=window.Worker;window.Worker=class extends Native{postMessage(data,...rest){if(data.photo)window.exportPhoto=Array.from(data.photo.tones);return super.postMessage(data,...rest);}};});
  await page.goto('http://localhost:4175/folding-fan/');
  await page.locator('#demo').click();await page.waitForFunction(()=>document.querySelector('#preview').dataset.draggable==='true');
  await page.locator('#zoom').evaluate(el=>{el.value=200;el.dispatchEvent(new Event('input'));});
  const canvas=page.locator('#preview');await canvas.scrollIntoViewIfNeeded();
  const box=await canvas.boundingBox(),x=box.x+box.width/2,y=box.y+box.height*.45;
  const initial=await page.locator('#panx').inputValue();
  if(touch){const session=await context.newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+30,y:y+15}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+60,y+30,{steps:5});await page.mouse.up();}
  assert.ok(+(await page.locator('#panx').inputValue())<+initial,'photo follows drag');
  await canvas.focus();const before=+(await page.locator('#panx').inputValue());await page.keyboard.press('ArrowLeft');assert.equal(+(await page.locator('#panx').inputValue()),before+2);
  await canvas.focus();for(let i=0;i<12;i++)await page.keyboard.press('Shift+ArrowLeft');assert.equal(await page.locator('#panx').inputValue(),'100');
  await page.locator('[data-view=closed]').click();assert.equal(await canvas.getAttribute('data-draggable'),'false');
  await page.locator('[data-view=open]').click();
  await page.locator('#crop').selectOption('contain');assert.equal(await canvas.getAttribute('data-draggable'),'false');assert.equal(await page.locator('#zoom').isDisabled(),true);
  await page.locator('#crop').selectOption('cover');await page.locator('#reset-crop').click();assert.equal(await page.locator('#zoom').inputValue(),'100');assert.equal(await page.locator('#panx').inputValue(),'50');
  if(!touch){
   await page.locator('#zip').click();await page.waitForFunction(()=>window.exportPhoto);const centered=await page.evaluate(()=>window.exportPhoto);await page.locator('#cancel').click();
   await page.locator('#zoom').evaluate(el=>{el.value=200;el.dispatchEvent(new Event('input'));});await canvas.focus();await page.keyboard.press('Shift+ArrowLeft');
   await page.evaluate(()=>window.exportPhoto=null);await page.locator('#zip').click();await page.waitForFunction(()=>window.exportPhoto);const moved=await page.evaluate(()=>window.exportPhoto);assert.notDeepEqual(moved,centered,'exported relief uses adjusted crop');
   const download=await page.waitForEvent('download',{timeout:120000});assert.match(download.suggestedFilename(),/folding-fan.*zip/);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Fan crop: mouse, touch, keyboard, zoom, modes, reset and cropped STL export passed.');
}finally{await browser.close();}
