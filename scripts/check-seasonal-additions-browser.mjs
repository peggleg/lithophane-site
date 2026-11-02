import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {seasonalDesigns,sampleSize} from '../src/postcards.js';
const date=process.env.SEASONAL_BATCH_DATE||'2026-11-02';
const batch=JSON.parse(await fs.readFile(new URL('../src/fixtures/seasonal-additions-'+date+'.json',import.meta.url),'utf8'));
const baseline=JSON.parse(await fs.readFile(new URL('../src/fixtures/seasonal-baseline-'+date+'.json',import.meta.url),'utf8'));
const origin=process.env.SEASONAL_ORIGIN||'http://localhost:4176',dir='artifacts/seasonal-'+date;
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report=[],pictures=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)errors.push(response.status()+' '+response.url());});
 await page.goto(origin+'/lithophane/');
 assert.equal(await page.inputValue('#printer-size'),'a1-mini');
 for(const design of batch){
  await page.getByRole('button',{name:design.season,exact:true}).click();
  await page.waitForFunction(()=>[...document.querySelectorAll('#holiday-gallery canvas')].every(c=>c.dataset.ready==='true'));
  const visible=await page.locator('#holiday-gallery [data-seasonal]').evaluateAll(buttons=>buttons.map(b=>b.dataset.seasonal));
  assert.deepEqual(new Set(visible),new Set(seasonalDesigns.filter(d=>d.season===design.season).map(d=>d.id)));
  for(const old of baseline.designs.filter(d=>d.season===design.season))assert.ok(visible.includes(old.id));
  const canvas=page.locator(`[data-seasonal-preview="${design.id}"]`),size=sampleSize(design);
  assert.deepEqual(await canvas.evaluate(c=>[c.width,c.height]),[size.width*6,size.height*6]);
  const url=await canvas.evaluate(c=>c.toDataURL('image/png'));
  await fs.writeFile(dir+'/'+design.id+'-gallery-crop.png',Buffer.from(url.split(',')[1],'base64'));
  pictures.push({name:design.name,season:design.season,url});
  await page.locator('.seasonal-card').filter({has:canvas}).screenshot({path:dir+'/'+design.id+'-card.png'});
  await page.locator(`[data-seasonal="${design.id}"]`).click();
  await page.waitForFunction(name=>document.querySelector('#export-status').textContent.startsWith(name+' loaded'),design.name);
  await page.waitForFunction(()=>!document.querySelector('#stl').disabled);
  assert.equal(Number(await page.inputValue('#width')),size.width);
  assert.equal(Number(await page.inputValue('#height')),size.height);
  assert.equal(Number(await page.inputValue('#max')),3);
  await page.locator('#preview').screenshot({path:dir+'/'+design.id+'-studio.png'});
  for(const orientation of ['portrait','landscape']){
   await page.locator(`[data-filter="${orientation}"]`).click();
   const actual=await page.locator('#holiday-gallery [data-seasonal]').evaluateAll(buttons=>buttons.map(b=>b.dataset.seasonal));
   assert.deepEqual(new Set(actual),new Set(seasonalDesigns.filter(d=>d.season===design.season&&d.orientation===orientation).map(d=>d.id)));
  }
  report.push({id:design.id,season:design.season,priorPreserved:visible.length-1,loaded:true,width:size.width,height:size.height});
  console.log(design.season+': new picture rendered and loaded; previous pictures and both filters preserved.');
 }
 await page.selectOption('#printer-size','256');
 assert.match(await page.locator('#printer-size-help').textContent(),/256/);
 await page.selectOption('#printer-size','a1-mini');
 await page.setViewportSize({width:390,height:900});
 for(const design of batch){
  const index=await page.locator('#holiday-select option').evaluateAll((options,season)=>options.find(o=>o.textContent===season).value,design.season);
  await page.selectOption('#holiday-select',index);
  await page.waitForFunction(()=>[...document.querySelectorAll('#holiday-gallery canvas')].every(c=>c.dataset.ready==='true'));
  assert.ok(await page.locator(`[data-seasonal="${design.id}"]`).isVisible());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.screenshot({path:dir+'/mobile-gallery.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const review=await browser.newPage({viewport:{width:1280,height:1150}});
 await review.setContent('<style>body{font:16px Georgia;background:#f1ede5;margin:20px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;background:white;padding:10px}img{width:100%;height:390px;object-fit:contain}figcaption{padding:8px 0}small{display:block;color:#555}</style><h1>Actual gallery postcard crops · '+date+'</h1><div class="grid">'+pictures.map(p=>'<figure><img src="'+p.url+'"><figcaption>'+p.name+'<small>'+p.season+'</small></figcaption></figure>').join('')+'</div>');
 await review.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 await review.screenshot({path:dir+'/all-gallery-crops.png',fullPage:true});
 await fs.writeFile(dir+'/browser-results.json',JSON.stringify(report,null,2));
 console.log('Eight original additions: gallery crops, all legacy IDs, filters, studio loading, postcard sizes, printer choices and mobile layout passed.');
}finally{await browser.close();}
