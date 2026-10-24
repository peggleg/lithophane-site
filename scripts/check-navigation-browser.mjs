import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['','lithophane/','folding-fan/','nameplates/','keyrings/','clickers/','desk/','coasters/']){
  await page.goto('http://localhost:4175/'+route);
  const menu=page.getByRole('button',{name:'Menu',exact:true}),nav=page.locator('#site-navigation');
  await menu.waitFor();
  for(const width of [1440,900,390,320]){
   await page.setViewportSize({width,height:900});
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.theme-control').click();
    assert.equal(await menu.isVisible(),true);assert.equal(await nav.isVisible(),false);
    await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.equal(await nav.isVisible(),true);assert.equal(await nav.locator('a').count(),8);
    const box=await nav.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);
    const links=await nav.locator('a').all();let previous=-Infinity;for(const link of links){const r=await link.boundingBox();assert.ok(r.y>previous);previous=r.y;}
    await page.keyboard.press('Escape');assert.equal(await nav.isVisible(),false);assert.equal(await menu.evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Enter');await page.keyboard.press('Tab');assert.equal(await nav.locator('a').first().evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Escape');await menu.click();const openBox=await nav.boundingBox();await page.mouse.click(5,openBox.y+10);assert.equal(await nav.isVisible(),false);assert.equal(await menu.getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} ${width} ${theme}`);
   }
  }
 }
 await page.setViewportSize({width:1440,height:900});await page.goto('http://localhost:4175/');await page.getByRole('button',{name:'Menu',exact:true}).click();await page.screenshot({path:'artifacts/desktop-menu.png',clip:{x:0,y:0,width:1440,height:410}});await page.getByRole('navigation').getByRole('link',{name:'Clickers',exact:true}).click();await page.waitForURL('**/clickers/');assert.equal(await page.locator('#site-navigation').isVisible(),false);assert.deepEqual(errors,[]);
 console.log('Dropdown navigation on all eight pages: desktop/tablet/mobile, Light/Dark, keyboard, Escape, outside click, link navigation and overflow passed.');
}finally{await browser.close();}
