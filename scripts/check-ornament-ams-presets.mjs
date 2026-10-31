import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {releasedOrnamentCollections} from '../src/ornament-settings.js';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1440,height:1100}});for(const collection of releasedOrnamentCollections){
 const dir=`artifacts/ornaments/${collection}`;await fs.mkdir(dir,{recursive:true});await page.goto(`http://localhost:4175/ornaments/?collection=${collection}`);
 const ready=()=>page.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});await ready();assert.equal(await page.inputValue('#collection'),collection);await page.check('#ams');await ready();
 await page.locator('#model-preview').screenshot({path:`${dir}/standard-ams.png`});const pending=page.waitForEvent('download');await page.click('#three-mf');await(await pending).saveAs(`${dir}/ornament-standard.3mf`);console.log(`${collection}: complete script AMS preview and project exported`);
 }}finally{await browser.close();}
