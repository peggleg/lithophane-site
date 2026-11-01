import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{const p=await browser.newPage();const ready=()=>p.waitForFunction(()=>document.querySelector('#feedback').textContent.startsWith('Design ready'),null,{timeout:90000});const open=async(c,k)=>{await p.goto(`http://localhost:4175/${c}/?item=${k}`);await ready();};
await open('pets','pet-tag');for(const name of ['Zoë!','']){await p.fill('#tagText',name);await ready();assert.equal(await p.locator('#three-mf').isEnabled(),true);}await p.fill('#tagText','🐱');await p.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('font'));assert.equal(await p.locator('#three-mf').isDisabled(),true);
await open('photography','photo-card-case');await p.selectOption('#cardType','micro');await ready();
await open('photography','photo-battery-caddy');await p.selectOption('#cellShape','round');await ready();assert.equal(await p.locator('#cellDepth').isDisabled(),true);await p.selectOption('#cellShape','rectangle');await ready();assert.equal(await p.locator('#cellDepth').isEnabled(),true);
await open('photography','photo-strip-frame');await p.fill('#panels','4');assert.equal(await p.locator('#three-mf').isDisabled(),true);await p.fill('#panelWidth','30');await ready();
await open('reading','reading-stencil');await p.selectOption('#tickSpacing','one');await ready();
await open('pets','pet-toy-basket');await p.selectOption('#basketWalls','solid');await ready();console.log('Text/blank/unsupported glyph, microSD, round battery controls, four-window sizing, 1 mm ticks and solid basket variants passed.');
}finally{await browser.close();}
