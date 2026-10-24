import {loadLanternMeshes} from './lantern-assets.js';
import {frameModel,lanternBudget} from './lantern-model.js';
import {frameZip,lanternGuide,packLantern,panelBytes} from './lantern-export.js';
import {drawPhoto,imageTones} from './image-processing.js';
import {makePanel} from './geometry.js';
import {filamentParts} from './filament.js';
self.onmessage=async({data})=>{const photos=data.photos||[];try{
 const frame=frameModel(await loadLanternMeshes());
 if(data.action==='frame'){self.postMessage({blob:new Blob(frameZip(frame),{type:'application/zip'})});return;}
 if(data.action==='guide'){self.postMessage({blob:new Blob([lanternGuide(frame,data.weights,data.panel.detail)],{type:'text/plain'})});return;}
 lanternBudget(data.panel,data.format,data.budget,photos.map(p=>p.image.width*p.image.height));
 const panels=[],weights=[];
 for(let i=0;i<4;i++){
  const photo=photos[i],canvas=new OffscreenCanvas(data.panel.cols,data.panel.rows),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('This browser cannot create a local photo canvas.');
  drawPhoto(ctx,photo.image,canvas.width,canvas.height,105/148,photo.adjustments);const tones=imageTones(ctx.getImageData(0,0,canvas.width,canvas.height).data,photo.adjustments);photo.image.close();canvas.width=canvas.height=1;
  const mesh=makePanel({...data.panel,tones}),name=`lantern-${['front','right','back','left'][i]}`;weights.push(...filamentParts([{name,mesh}],'lithophane'));panels.push({name,bytes:panelBytes(mesh,data.format)});self.postMessage({progress:10+(i+1)*20});
 }
 const blob=new Blob(packLantern(frame,panels,data.format,weights,data.panel.detail),{type:'application/zip'});self.postMessage({progress:100,blob});
 }catch(e){self.postMessage({error:e.message||'Could not export the lantern. No lower-resolution file was generated.'});}finally{photos.forEach(p=>p.image.close());}};
