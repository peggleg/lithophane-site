import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import init from 'manifold-3d/manifold';
import {generateCylinderStand} from '../src/cylinder-geometry.js';
import {cylinderStands} from '../src/cylinder-settings.js';

// Render the same printable meshes and studio lighting as the interactive view.
// Run a Vite development server first (port 4176 by default).
const origin=process.env.CYLINDER_RENDER_ORIGIN||'http://localhost:4176';
const m=await init();m.setup();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await fs.mkdir('artifacts/cylinders/stand-renders',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:800,height:600},deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__stand_thumbnail__',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"></body></html>'}));
 await page.goto(origin+'/__stand_thumbnail__');
 await page.evaluate(async()=>{
  document.body.innerHTML='<div style="width:800px;height:600px"><canvas id="stand-render" style="display:block;width:100%;height:100%;max-width:100%;max-height:100%;box-shadow:none"></canvas></div>';
  const {cylinderPreview}=await import('/src/cylinder-preview.js');
  window.standRenderer=cylinderPreview(document.querySelector('#stand-render'),{thumbnail:true});
 });
 for(const stand of cylinderStands.filter(s=>!process.env.CYLINDER_STAND||s.id===process.env.CYLINDER_STAND)){
  const model=generateCylinderStand(m,{stand:stand.id});
  const serial={...model,parts:model.parts.map(p=>({...p,mesh:{vertices:Array.from(p.mesh.vertices),faces:Array.from(p.mesh.faces)}}))};
  await page.evaluate(model=>{for(const p of model.parts){p.mesh.vertices=new Float32Array(p.mesh.vertices);p.mesh.faces=new Uint32Array(p.mesh.faces);}window.standRenderer.setModel(model);},serial);
  const png=await page.locator('#stand-render').screenshot();
  await fs.writeFile(`artifacts/cylinders/stand-renders/${stand.id}.png`,png);
  const webp=await page.evaluate(()=>{
   window.standRenderer.reset();
   const target=document.createElement('canvas');target.width=640;target.height=480;
   target.getContext('2d').drawImage(document.querySelector('#stand-render'),0,0,640,480);
   return target.toDataURL('image/webp',.92).split(',')[1];
  });
  await fs.writeFile(`src/assets/cylinder-stands/${stand.id}.webp`,Buffer.from(webp,'base64'));
  console.log(stand.name+': rendered from exported stand geometry.');
 }
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
