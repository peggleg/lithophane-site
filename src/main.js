import './style.css';
import {drawSeasonal,seasonalDesigns} from './seasonal.js';
import {planSampling,previewSize,exportEstimate,assertExportBudget,memoryBudget,MIB,DEFAULT_DETAIL} from './resolution.js';
import {drawPhoto,paintBacklight,photoLayout} from './image-processing.js';
const $=id=>document.getElementById(id);
const fields=['width','height','min','max','detail','crop','zoom','panx','pany','brightness','contrast','invert','overlap','clearance','overlay'];
let image=null,worker=null,grid=null,loadId=0,exportId=0,exporting=false,loading=false,renderFrame=0;
const canvas=$('preview'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const n=id=>Number($(id).value);
const adjustments=()=>({crop:$('crop').value,zoom:n('zoom'),panx:n('panx'),pany:n('pany'),brightness:n('brightness'),contrast:n('contrast'),invert:$('invert').checked});
function cropControls(p){
 const ready=!!image&&!loading,cover=$('crop').value==='cover';
 const layoutAt=position=>ready&&p?photoLayout(image.width,image.height,p.width/p.height,{...adjustments(),panx:position,pany:position}):null;
 const first=layoutAt(0),last=layoutAt(100);
 const horizontal=!!first&&(Math.abs(first.sx-last.sx)>1e-8||Math.abs(first.dx-last.dx)>1e-8);
 const vertical=!!first&&(Math.abs(first.sy-last.sy)>1e-8||Math.abs(first.dy-last.dy)>1e-8);
 $('zoom').disabled=!ready||!cover;$('panx').disabled=!ready||!cover||!horizontal;$('pany').disabled=!ready||!cover||!vertical;
 $('zoom-out').disabled=!ready||!cover||n('zoom')<=25;$('zoom-in').disabled=!ready||!cover||n('zoom')>=400;
 $('reset-crop').disabled=!ready;
 $('zoom-value').value=`${n('zoom')}%`;
 $('panx-value').value=`${n('panx')}%`;$('pany-value').value=`${n('pany')}%`;
 $('crop-help').textContent=!ready?'Choose a photo to adjust its crop.':!cover?'The whole photo is shown. Choose Fill panel (crop) to zoom and reposition.':n('zoom')<100?'Zoomed out to show more of the photo. White margins may appear; position the image with the sliders.':horizontal&&vertical?'Move the sliders to choose which part of the photo fills the panel.':!horizontal&&!vertical?'The photo fits the panel exactly. Zoom out to show more space, or zoom in to crop and reposition.':!horizontal?'Zoom out to keep more of the scene, or zoom in to enable horizontal positioning.':'Zoom out to keep more of the scene, or zoom in to enable vertical positioning.';
}
function settings(){
 const p={width:n('width'),height:n('height'),min:n('min'),max:n('max')};
 if(![p.width,p.height,p.min,p.max,n('overlap')].every(Number.isFinite)||p.width<20||p.width>300||p.height<20||p.height>300||p.min<0.6||p.min>3||p.max<p.min||p.max>6||n('overlap')<0||n('overlap')>15)throw Error('Use panel sizes of 20–300 mm, minimum thickness 0.6–3 mm, maximum thickness up to 6 mm and at least the minimum, and edge overlap of 0–15 mm.');
 if(2*n('overlap')>=Math.min(p.width,p.height))throw Error('Edge overlap must leave a visible photo area.');
 return {...p,...planSampling(p.width,p.height,n('detail'))};
}
function controlsEnabled(valid){for(const id of ['stl','three-mf','summary','test-fit'])$(id).disabled=!valid||exporting||loading;}
function render(){
 $('brightness-value').value=$('brightness').value;$('contrast-value').value=$('contrast').value;
 let p;try{p=settings();}catch(e){grid=null;controlsEnabled(false);cropControls(null);$('fit-overlay').hidden=true;$('feedback').textContent=e.message;return;}
 cropControls(p);
 grid=image?p:null;
 const stl=exportEstimate(p,'stl'),mf=exportEstimate(p,'3mf');
 $('mesh-summary').textContent=`${p.spacingX.toFixed(3)} × ${p.spacingY.toFixed(3)} mm spacing · ${p.cols.toLocaleString()} × ${p.rows.toLocaleString()} samples · ${p.triangles.toLocaleString()} triangles. STL ${(stl.outputBytes/MIB).toFixed(1)} MiB; 3MF up to ${(mf.outputBytes/MIB).toFixed(1)} MiB (uncompressed).`;
 $('panel-estimate').textContent=`${p.width} × ${p.height} mm`;
 const allowance=$('clearance').value==='side'?0.4:0.2;
 $('fit-summary').textContent=`Planning opening: ${(p.width+allowance).toFixed(1)} × ${(p.height+allowance).toFixed(1)} mm. Visible photo: ${(p.width-2*n('overlap')).toFixed(1)} × ${(p.height-2*n('overlap')).toFixed(1)} mm. This does not resize the panel. Final frame dimensions and clearance convention remain unconfirmed.`;
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
 const volume=p.width*p.height*stats.meanThickness;
 $('material-estimate').textContent=`~${(volume*1.24/1000).toFixed(1)} g · ${(volume/1000).toFixed(1)} cm³`;
 const messages=[];
 if(layout.sw<p.cols*layout.dw||layout.sh<p.rows*layout.dh)messages.push(`Source detail is limited: ${Math.round(layout.sw)} × ${Math.round(layout.sh)} photo pixels in use. Finer mesh spacing cannot create missing image detail.`);
 if(stats.darkFraction>0.35)messages.push('Many dark areas may obscure detail; try increasing brightness.');
 if($('crop').value==='cover'&&(layout.sw<image.width*.98||layout.sh<image.height*.98))messages.push('The photo is cropped. Check faces and important details near the edges.');
 messages.push('PLA estimate assumes solid plastic at 1.24 g/cm³; excludes brim, supports and waste.');
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
for(const id of fields)$(id).addEventListener('input',()=>{cancelExport(false);render();});
 for(const [id,change]of [['zoom-out',-5],['zoom-in',5]])$(id).onclick=()=>{
  $('zoom').value=Math.max(25,Math.min(400,n('zoom')+change));cancelExport(false);render();
 };
function beginLoad(){
 const token=++loadId;cancelExport(false);loading=true;controlsEnabled(false);$('fit-overlay').hidden=true;
 cropControls(null);
 $('feedback').textContent='Opening photo locally…';return token;
}
function failedLoad(token,message){if(token!==loadId)return;loading=false;render();$('feedback').textContent=message;}
$('photo').addEventListener('change',async()=>{
 const file=$('photo').files[0];if(!file)return;
 const token=beginLoad();
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){failedLoad(token,'Choose a JPEG, PNG or WebP photo under 20 MB.');$('photo').value='';return;}
 try{
  const decoded=await createImageBitmap(file,{imageOrientation:'from-image'});
  if(token!==loadId){decoded.close();return;}
  if(decoded.width*decoded.height>24000000){decoded.close();throw Error('Choose a photo no larger than 24 megapixels.');}
  image?.close();image=decoded;loading=false;resetCrop();render();
 }catch{failedLoad(token,'This photo could not be opened. Choose a JPEG, PNG or WebP up to 24 megapixels.');}
});
function download(bytes,name,type){const url=URL.createObjectURL(bytes instanceof Blob?bytes:new Blob([bytes],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
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
  exporting=true;controlsEnabled(false);$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Building your file locally at the selected spacing…';
  if(!test)copy=await createImageBitmap(image);
  if(token!==exportId){copy?.close();return;}
  const job=new Worker(new URL('./export-worker.js',import.meta.url),{type:'module'});worker=job;
  job.onmessage=({data})=>{
   if(token!==exportId)return;
   if(data.progress!==undefined)$('progress').value=data.progress;
   if(data.error){cancelExport(false);$('export-status').textContent=`Export failed: ${data.error}`;}
   if(data.blob){download(data.blob,test?'peggleg-corner-test-fit.stl':`peggleg-panel-${panel.width}x${panel.height}-${panel.detail}mm.${format}`);cancelExport(false);$('export-status').textContent='File generated at the selected spacing. Check your browser downloads.';}
  };
  job.onerror=()=>{if(token!==exportId)return;cancelExport(false);$('export-status').textContent='Export failed at the requested quality. The browser may have run out of memory. No lower-resolution file was generated; try another device or deliberately choose a smaller panel or wider spacing.';};
  job.postMessage({panel,format,image:copy,adjustments:photoAdjustments,budget},copy?[copy]:[]);copy=null;
 }catch(e){copy?.close();if(token!==exportId)return;cancelExport(false);$('export-status').textContent=`Export failed: ${e.message}`;}
}
$('stl').onclick=()=>startExport('stl');$('three-mf').onclick=()=>startExport('3mf');$('test-fit').onclick=()=>startExport('stl',true);$('cancel').onclick=()=>cancelExport();
function resetCrop(){ $('zoom').value=100;$('panx').value=50;$('pany').value=50; }
$('reset-crop').onclick=()=>{cancelExport(false);resetCrop();render();};
$('summary').onclick=()=>{
 if(!grid)return;const p=grid;
 download(`PEGGLEG LITHOPHANE — PRINT SUMMARY\n\nPanel: ${p.width} × ${p.height} mm\nThickness: ${p.min}–${p.max} mm\nMesh: ${$('mesh-summary').textContent}\nMaterial estimate: ${$('material-estimate').textContent}\n${$('fit-summary').textContent}\n\nPhoto adjustments: ${$('crop').value}, zoom ${n('zoom')}%, crop position ${n('panx')}% / ${n('pany')}%, brightness ${n('brightness')}, contrast ${n('contrast')}, invert ${$('invert').checked}\n\nSTARTING PRINT SETTINGS (not a validated printer profile)\nWhite PLA; 0.12–0.16 mm layers; solid panel; vertical orientation with a brim. Slice at 100% scale in millimetres. Mesh spacing is independent of nozzle width and layer height. Inspect toolpaths; use the slicer for time and filament estimates. Test the corner fit before printing the panel.\n\nLIGHTING\nLED tealights only, no flame. Bambu kit frame planned with cable slit; exact kit pending. 0.2 mm is mechanical fit allowance, not thermal clearance. Ventilate, avoid pinched wires, follow manufacturer guidance and test temperatures.\n\nFrames and licences: https://makerworld.com/en/@peggleg\nPhotos and models were generated locally and were not uploaded or stored by this app.\n`,'peggleg-print-summary.txt','text/plain');
};
$('reset').onclick=()=>{
 ++loadId;loading=false;cancelExport(false);image?.close();image=null;grid=null;$('photo').value='';
 for(const [id,value]of Object.entries({width:120,height:100,min:0.8,max:3,detail:DEFAULT_DETAIL,crop:'cover',zoom:100,panx:50,pany:50,brightness:0,contrast:0,overlap:3,clearance:'total'}))$(id).value=value;
 $('invert').checked=false;$('overlay').checked=true;
 canvas.width=1;canvas.height=1;canvas.style.display='none';$('empty').hidden=false;$('fit-overlay').hidden=true;$('material-estimate').textContent='Add a photo';$('export-status').textContent='Session cleared. Existing downloads stay on your device.';$('feedback').textContent='Everything happens in this browser. No account needed.';render();
};
window.addEventListener('pagehide',()=>{$('reset').click();cancelAnimationFrame(renderFrame);});
render();
for(const button of document.querySelectorAll('[data-seasonal]'))button.addEventListener('click',async()=>{
 const token=beginLoad();
 try{
  const art=await drawSeasonal(document.createElement('canvas'),button.dataset.seasonal);
  const decoded=await createImageBitmap(art);art.width=1;art.height=1;
  if(token!==loadId){decoded.close();return;}
  image?.close();image=decoded;loading=false;$('photo').value='';
  $('brightness').value=0;$('contrast').value=0;$('invert').checked=false;resetCrop();
  render();$('export-status').textContent=seasonalDesigns.find(d=>d.id===button.dataset.seasonal).name+' loaded. Custom panel geometry only; frame fit is not validated.';
  $('studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){failedLoad(token,'Could not load seasonal artwork: '+e.message);}
});
for(const thumbnail of document.querySelectorAll('[data-seasonal-preview]')){
 drawSeasonal(thumbnail,thumbnail.dataset.seasonalPreview).then(()=>{thumbnail.dataset.ready='true';}).catch(()=>{
  const message=document.createElement('p');message.textContent='Artwork preview unavailable. Please reload to retry.';
  thumbnail.parentElement.replaceChildren(message);
 });
}
