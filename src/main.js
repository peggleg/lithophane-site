import {filamentAssumptionsFor,panelGrams} from './filament.js';
import './theme.js';
import {mountSampleGallery} from './sample-gallery.js';
import './style.css';
import {exportFilename,chooseSaveTarget} from './export-save.js';
import {postcardSize,sampleSize,FRAME_URL} from './postcards.js';
import {drawSeasonal,seasonalDesigns} from './seasonal.js';
import {planSampling,previewSize,exportEstimate,assertExportBudget,memoryBudget,MIB,DEFAULT_DETAIL} from './resolution.js';
import {drawPhoto,paintBacklight,photoLayout,dragCrop} from './image-processing.js';
const filamentAssumptions=filamentAssumptionsFor('lithophane');
const $=id=>document.getElementById(id);
const fields=['width','height','min','max','detail','crop','zoom','panx','pany','brightness','contrast','invert','overlap','clearance','overlay'];
let image=null,worker=null,grid=null,loadId=0,exportId=0,exporting=false,loading=false,renderFrame=0;
let source={name:'My lithophane',custom:false};
const canvas=$('preview'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const n=id=>Number($(id).value);
let lanternUI=null,lanternMount=null,lanternReset=0;
function layoutMode(){const on=$('frame').value==='lantern';for(const id of ['upload-label','single-panel-controls','single-photo-controls','single-workspace'])$(id).hidden=on;$('lantern-studio').hidden=!on;$('studio').classList.toggle('lantern-mode',on);if(on&&!lanternMount){const resetAtStart=lanternReset;lanternMount=import('./lantern-studio.js').then(m=>m.mountLantern($('lantern-studio'),{currentPhoto:async()=>{const current=image,name=source.name,config={...adjustments()};return current&&!loading?{image:await createImageBitmap(current),name,adjustments:config}:null;}})).then(ui=>{lanternUI=ui;if(resetAtStart!==lanternReset)ui.reset();if($('frame').value!=='lantern')ui.pause();return ui;}).catch(e=>{$('lantern-studio').textContent='Could not open the lantern studio: '+e.message;lanternMount=null;});}if(!on)lanternUI?.pause();}

const adjustments=()=>({crop:$('crop').value,zoom:n('zoom'),panx:n('panx'),pany:n('pany'),brightness:n('brightness'),contrast:n('contrast'),invert:$('invert').checked});
function cropControls(p){
 const ready=!!image&&!loading,cover=$('crop').value==='cover';
 const layoutAt=position=>ready&&p?photoLayout(image.width,image.height,p.width/p.height,{...adjustments(),panx:position,pany:position}):null;
 const first=layoutAt(0),last=layoutAt(100);
 const horizontal=!!first&&(Math.abs(first.sx-last.sx)>1e-8||Math.abs(first.dx-last.dx)>1e-8);
 const vertical=!!first&&(Math.abs(first.sy-last.sy)>1e-8||Math.abs(first.dy-last.dy)>1e-8);
 $('zoom').disabled=!ready||!cover;$('panx').disabled=!ready||!cover||!horizontal;$('pany').disabled=!ready||!cover||!vertical;
 $('zoom-out').disabled=!ready||!cover||n('zoom')<=100;$('zoom-in').disabled=!ready||!cover||n('zoom')>=400;
 $('reset-crop').disabled=!ready;
 $('zoom-value').value=`${n('zoom')}%`;
 $('panx-value').value=`${n('panx')}%`;$('pany-value').value=`${n('pany')}%`;
 canvas.dataset.draggable=ready&&cover&&(horizontal||vertical)?'true':'false';
 $('crop-help').textContent=!ready?'Choose a photo to adjust its crop.':!cover?'The whole photo is shown. Choose Fill panel (crop) to drag and reposition.':horizontal||vertical?'Drag the photo in the preview to reposition it. Movement stops at its edges, keeping the panel filled.':'The photo fits the panel exactly. Enlarge it slightly to create room to drag, or change the panel proportions.';

}
let drag=null;
function endDrag(){
 if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);
 drag=null;canvas.classList.remove('dragging');
}
canvas.addEventListener('pointerdown',event=>{
 if(event.button!==0||canvas.dataset.draggable!=='true'||!grid)return;
 const r=canvas.getBoundingClientRect(),layout=photoLayout(image.width,image.height,grid.width/grid.height,adjustments());
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,panx:n('panx'),pany:n('pany'),sw:layout.sw,sh:layout.sh,imageWidth:image.width,imageHeight:image.height,width:r.width,height:r.height};
 canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');canvas.focus({preventScroll:true});event.preventDefault();cancelExport(false);
});
canvas.addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.id)return;
 const p=dragCrop(drag,event.clientX-drag.x,event.clientY-drag.y);
 $('panx').value=p.panx;$('pany').value=p.pany;render();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endDrag);
canvas.addEventListener('keydown',event=>{
 if(canvas.dataset.draggable!=='true')return;
 const directions={ArrowLeft:[10,0],ArrowRight:[-10,0],ArrowUp:[0,10],ArrowDown:[0,-10]};
 const delta=directions[event.key];if(!delta)return;
 event.preventDefault();cancelExport(false);
 $('panx').value=Math.max(0,Math.min(100,n('panx')+delta[0]));$('pany').value=Math.max(0,Math.min(100,n('pany')+delta[1]));render();
});
function settings(){
 const p={width:n('width'),height:n('height'),min:n('min'),max:n('max')};
 if(![p.width,p.height,p.min,p.max,n('overlap')].every(Number.isFinite)||p.width<20||p.width>300||p.height<20||p.height>300||p.min<0.6||p.min>3||p.max<p.min||p.max>6||n('overlap')<0||n('overlap')>15)throw Error('Use panel sizes of 20–300 mm, minimum thickness 0.6–3 mm, maximum thickness up to 6 mm and at least the minimum, and edge overlap of 0–15 mm.');
 if(2*n('overlap')>=Math.min(p.width,p.height))throw Error('Edge overlap must leave a visible photo area.');
 return {...p,...planSampling(p.width,p.height,n('detail'))};
}
function controlsEnabled(valid){for(const id of ['stl','three-mf','summary','test-fit'])$(id).disabled=!valid||exporting||loading;}
function render(){
 for(const b of document.querySelectorAll('[data-orientation]')){const size=postcardSize(b.dataset.orientation);b.setAttribute('aria-pressed',String(n('width')===size.width&&n('height')===size.height));}
 $('brightness-value').value=$('brightness').value;$('contrast-value').value=$('contrast').value;
 let p;try{p=settings();}catch(e){grid=null;controlsEnabled(false);cropControls(null);$('fit-overlay').hidden=true;$('feedback').textContent=e.message;return;}
 cropControls(p);
 $('export-name').textContent=image?`Export name: ${exportFilename(source.name,p,'stl')}`:'';
 grid=image?p:null;
 const stl=exportEstimate(p,'stl'),mf=exportEstimate(p,'3mf');
 $('mesh-summary').textContent=`${p.spacingX.toFixed(3)} × ${p.spacingY.toFixed(3)} mm spacing · ${p.cols.toLocaleString()} × ${p.rows.toLocaleString()} samples · ${p.triangles.toLocaleString()} triangles. STL ${(stl.outputBytes/MIB).toFixed(1)} MiB; 3MF up to ${(mf.outputBytes/MIB).toFixed(1)} MiB (uncompressed).`;
 $('corner-filament').textContent=`Corner test estimated filament: ${panelGrams(20,20,p.max).toFixed(1)} g (8% gyroid, 2 walls).`;
 $('panel-estimate').textContent=`${p.width} × ${p.height} mm`;
 const allowance=$('clearance').value==='side'?0.4:0.2;
 $('fit-summary').textContent=`Planning opening: ${(p.width+allowance).toFixed(1)} × ${(p.height+allowance).toFixed(1)} mm. Visible photo: ${(p.width-2*n('overlap')).toFixed(1)} × ${(p.height-2*n('overlap')).toFixed(1)} mm. This does not resize the panel. Postcard frame limit: 105 × 148 × 3 mm, or 148 × 105 × 3 mm.`;
 controlsEnabled(!!image);
 if(!image||loading)return;
 const lightbox=canvas.parentElement,style=getComputedStyle(lightbox);
 const availableWidth=(lightbox.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))*.92;
 const availableHeight=(lightbox.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom))*.92;
 if(availableWidth<=0||availableHeight<=0)return;
 const size=previewSize(availableWidth,availableHeight,p.width/p.height,window.devicePixelRatio||1);
 canvas.width=size.width;canvas.height=size.height;canvas.style.width=`${size.cssWidth}px`;canvas.style.height=`${size.cssHeight}px`;
 const layout=drawPhoto(ctx,image,size.width,size.height,p.width/p.height,adjustments());
 const pixels=ctx.getImageData(0,0,size.width,size.height);
 const stats=paintBacklight(pixels,adjustments(),p.min,p.max);ctx.putImageData(pixels,0,0);
 canvas.style.display='block';$('empty').hidden=true;
 const grams=panelGrams(p.width,p.height,stats.meanThickness),volume=grams/1.24*1000;
 $('material-estimate').textContent=`~${grams.toFixed(1)} g · ${(volume/1000).toFixed(1)} cm³`;
 const messages=[];
 if(layout.sw<p.cols*layout.dw||layout.sh<p.rows*layout.dh)messages.push(`Source detail is limited: ${Math.round(layout.sw)} × ${Math.round(layout.sh)} photo pixels in use. Finer mesh spacing cannot create missing image detail.`);
 if(stats.darkFraction>0.35)messages.push('Many dark areas may obscure detail; try increasing brightness.');
 if($('crop').value==='cover'&&(layout.sw<image.width*.98||layout.sh<image.height*.98))messages.push('The photo is cropped. Check faces and important details near the edges.');
 messages.push(filamentAssumptions);
 $('feedback').textContent=messages.join(' ');positionOverlay();
}
function positionOverlay(){
 const box=$('fit-overlay');box.hidden=!image||!grid||loading||!$('overlay').checked;if(box.hidden)return;
 const r=canvas.getBoundingClientRect(),parent=canvas.parentElement.getBoundingClientRect();
 box.style.left=`${r.left-parent.left}px`;box.style.top=`${r.top-parent.top}px`;box.style.width=`${r.width}px`;box.style.height=`${r.height}px`;
 box.style.borderLeftWidth=box.style.borderRightWidth=`${r.width*n('overlap')/grid.width}px`;
 box.style.borderTopWidth=box.style.borderBottomWidth=`${r.height*n('overlap')/grid.height}px`;
}
function scheduleRender(){cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(render);}
new ResizeObserver(scheduleRender).observe(canvas.parentElement);
window.addEventListener('resize',scheduleRender);
for(const id of fields)$(id).addEventListener('input',()=>{endDrag();cancelExport(false);if(['width','height','max'].includes(id))$('frame').value='custom';render();});
function applyPostcard(orientation){for(const [key,value]of Object.entries(postcardSize(orientation)))$(key).value=value;$('frame').value='postcard';layoutMode();}
for(const button of document.querySelectorAll('[data-orientation]'))button.onclick=()=>{endDrag();cancelExport(false);applyPostcard(button.dataset.orientation);resetCrop();render();};
$('frame').onchange=()=>{endDrag();cancelExport(false);if($('frame').value==='postcard'){applyPostcard(n('width')>n('height')?'landscape':'portrait');resetCrop();}layoutMode();render();};
 for(const [id,change]of [['zoom-out',-5],['zoom-in',5]])$(id).onclick=()=>{
  $('zoom').value=Math.max(100,Math.min(400,n('zoom')+change));cancelExport(false);render();
 };
function beginLoad(){
 endDrag();
 const token=++loadId;cancelExport(false);loading=true;controlsEnabled(false);$('fit-overlay').hidden=true;
 cropControls(null);
 $('feedback').textContent='Opening photo locally…';return token;
}
function failedLoad(token,message){if(token!==loadId)return;loading=false;render();$('feedback').textContent=message;}
$('photo').addEventListener('input',async()=>{
 const file=$('photo').files[0];if(!file)return;
 const token=beginLoad();
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){failedLoad(token,'Choose a JPEG, PNG or WebP photo under 20 MB.');$('photo').value='';return;}
 try{
  const decoded=await createImageBitmap(file,{imageOrientation:'from-image'});
  if(token!==loadId){decoded.close();return;}
  if(decoded.width*decoded.height>24000000){decoded.close();throw Error('Choose a photo no larger than 24 megapixels.');}
  image?.close();image=decoded;source={name:file.name,custom:true};loading=false;resetCrop();render();
 }catch{failedLoad(token,'This photo could not be opened. Choose a JPEG, PNG or WebP up to 24 megapixels.');}
});
function download(bytes,name,type){const url=URL.createObjectURL(bytes instanceof Blob?bytes:new Blob([bytes],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function askExportName(name){
 return new Promise(resolve=>{
  const dialog=$('save-dialog'),input=$('save-name');input.value=name.replace(/\.(jpe?g|png|webp)$/i,'');
  dialog.addEventListener('close',()=>resolve(dialog.returnValue==='save'?input.value:null),{once:true});
  dialog.returnValue='cancel';dialog.showModal();input.focus();input.select();
 });
}
function cancelExport(report=true){
 const wasExporting=exporting;++exportId;worker?.terminate();worker=null;exporting=false;
 if(wasExporting)$('export-status').textContent=report?'Export cancelled.':'Settings or photo changed; the previous export was cancelled.';
 $('progress').hidden=true;$('cancel').hidden=true;controlsEnabled(!!grid);
}
async function startExport(format,test=false){
 if(!grid||loading)return;cancelExport(false);
 const panel=test?{width:20,height:20,min:grid.max,max:grid.max,cols:2,rows:2,tones:new Float32Array(4)}:{...grid};
 const photoAdjustments=adjustments(),budget=memoryBudget(navigator.deviceMemory);
 const token=exportId;let copy=null;
 try{
  assertExportBudget(panel,format,budget,test?0:image.width*image.height);
  if(!test&&typeof OffscreenCanvas==='undefined')throw Error('This browser does not support local image export. Try a current browser with OffscreenCanvas support.');
  if(source.custom)$('export-status').textContent='Choose a file name and save destination.';
  const destination=await chooseSaveTarget({name:test?`${source.name.replace(/\.(jpe?g|png|webp)$/i,'')}-corner-test`:source.name,panel,format,custom:source.custom,picker:typeof window.showSaveFilePicker==='function'?window.showSaveFilePicker.bind(window):null,askName:askExportName});
  if(token!==exportId)return;
  if(!destination){$('export-status').textContent='Save cancelled.';return;}
  exporting=true;controlsEnabled(false);$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Building your file locally at the selected spacing…';
  if(!test)copy=await createImageBitmap(image);
  if(token!==exportId){copy?.close();return;}
  const job=new Worker(new URL('./export-worker.js',import.meta.url),{type:'module'});worker=job;
  job.onmessage=async({data})=>{
   if(token!==exportId)return;
   if(data.progress!==undefined)$('progress').value=data.progress;
   if(data.error){cancelExport(false);$('export-status').textContent=`Export failed: ${data.error}`;}
   if(data.blob){
    let writable;
    try{
     if(destination.handle){
      writable=await destination.handle.createWritable();
      if(token!==exportId){await writable.abort();return;}
      await writable.write(data.blob);
      if(token!==exportId){await writable.abort();return;}
      await writable.close();
     }else download(data.blob,destination.filename,'application/octet-stream');
     if(token!==exportId)return;
     cancelExport(false);$('export-status').textContent=destination.handle?'Saved to your chosen location.':`Downloaded ${destination.filename}. Check your browser downloads.`;
    }catch(e){if(writable)await writable.abort().catch(()=>{});if(token===exportId){cancelExport(false);$('export-status').textContent=`Could not save file: ${e.message}`;}}
   }
  };
  job.onerror=()=>{if(token!==exportId)return;cancelExport(false);$('export-status').textContent='Export failed at the requested quality. The browser may have run out of memory. No lower-resolution file was generated; try another device or deliberately choose a smaller panel or wider spacing.';};
  job.postMessage({panel,format,image:copy,adjustments:photoAdjustments,budget},copy?[copy]:[]);copy=null;
 }catch(e){copy?.close();if(token!==exportId)return;cancelExport(false);$('export-status').textContent=e.name==='AbortError'?'Save cancelled.':`Export failed: ${e.message}`;}
}
$('stl').onclick=()=>startExport('stl');$('three-mf').onclick=()=>startExport('3mf');$('test-fit').onclick=()=>startExport('stl',true);$('cancel').onclick=()=>cancelExport();
function resetCrop(){ $('zoom').value=100;$('panx').value=50;$('pany').value=50; }
$('reset-crop').onclick=()=>{cancelExport(false);resetCrop();render();};
$('summary').onclick=()=>{
 if(!grid)return;const p=grid;
 download(`LITHOPHANE — PRINT SUMMARY\n\nPanel: ${p.width} × ${p.height} mm\nThickness: ${p.min}–${p.max} mm\nMesh: ${$('mesh-summary').textContent}\nMaterial estimate: ${$('material-estimate').textContent}\n${filamentAssumptions}\nCorner fit test: ${panelGrams(20,20,p.max).toFixed(1)} g PLA at the default settings.\n${$('fit-summary').textContent}\n\nPhoto adjustments: ${$('crop').value}, zoom ${n('zoom')}%, crop position ${n('panx')}% / ${n('pany')}%, brightness ${n('brightness')}, contrast ${n('contrast')}, invert ${$('invert').checked}\n\nSTARTING PRINT SETTINGS (not a validated printer profile)\nWhite PLA; 0.12–0.16 mm layers; 8% gyroid sparse infill; 2 wall loops; 4 top and bottom layers; vertical orientation with a brim. Slice at 100% scale in millimetres. Mesh spacing is independent of nozzle width and layer height. Inspect toolpaths; use the slicer for time and filament estimates. Thin photo areas may be filled by the shells. Gyroid can affect backlit image quality; test transmission and the corner fit before printing the panel.\n\nLIGHTING\nLED tealights only, no flame. Postcard frame for Bambu LED kit: 105 × 148 × 3 mm, portrait or landscape; cable exit in base. 0.2 mm is mechanical fit allowance, not thermal clearance. Ventilate, avoid pinched wires, follow manufacturer guidance and test temperatures.\n\nPostcard frame and licence: ${FRAME_URL}\nPhotos and models were generated locally and were not uploaded or stored by this app.\n`,exportFilename(`${source.name.replace(/\.(jpe?g|png|webp)$/i,'')}-print-summary`,p,'txt'),'text/plain');
};
$('reset').onclick=()=>{
 ++lanternReset;lanternUI?.reset();
 endDrag();
 ++loadId;loading=false;cancelExport(false);image?.close();image=null;source={name:'My lithophane',custom:false};grid=null;$('photo').value='';if($('save-dialog').open)$('save-dialog').close('cancel');
 for(const [id,value]of Object.entries({width:105,height:148,min:0.8,max:3,detail:DEFAULT_DETAIL,crop:'cover',zoom:100,panx:50,pany:50,brightness:0,contrast:0,overlap:3,clearance:'total'}))$(id).value=value;
 $('invert').checked=false;$('overlay').checked=true;$('frame').value='postcard';layoutMode();
 canvas.width=1;canvas.height=1;canvas.style.display='none';$('empty').hidden=false;$('fit-overlay').hidden=true;$('material-estimate').textContent='Add a photo';$('export-status').textContent='Session cleared. Existing downloads stay on your device.';$('feedback').textContent='Everything happens in this browser. No account needed.';render();
};
window.addEventListener('pagehide',()=>{$('reset').click();lanternUI?.dispose();cancelAnimationFrame(renderFrame);});
$('choose-lantern').onclick=()=>{cancelExport(false);$('frame').value='lantern';layoutMode();$('studio').scrollIntoView({behavior:'smooth'});};
render();
mountSampleGallery($('seasonal-collections'),{drawArtwork:drawSeasonal,onUse:async(button)=>{
 const token=beginLoad();
 try{
  const art=await drawSeasonal(document.createElement('canvas'),button.dataset.seasonal);
  const decoded=await createImageBitmap(art);art.width=1;art.height=1;
  if(token!==loadId){decoded.close();return;}
  image?.close();image=decoded;source={name:seasonalDesigns.find(d=>d.id===button.dataset.seasonal).name,custom:false};loading=false;$('photo').value='';
  const design=seasonalDesigns.find(d=>d.id===button.dataset.seasonal);
  applyPostcard(design.orientation);$('brightness').value=0;$('contrast').value=0;$('invert').checked=false;resetCrop();
  render();$('export-status').textContent=`${design.name} loaded at ${sampleSize(design).width} × ${sampleSize(design).height} mm, maximum thickness 3 mm.`;
  $('studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){failedLoad(token,'Could not load seasonal artwork: '+e.message);}
}});
