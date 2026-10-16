import './style.css';
import {drawSeasonal,seasonalDesigns} from './seasonal.js';
const $=id=>document.getElementById(id);
const fields=['width','height','min','max','detail','crop','panx','pany','brightness','contrast','invert','overlap','clearance','overlay'];
let image=null,worker=null,grid=null,loadId=0,exporting=false;
const canvas=$('preview'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const sample=document.createElement('canvas'),sc=sample.getContext('2d',{willReadFrequently:true});
const n=id=>Number($(id).value);
function settings(){
 const p={width:n('width'),height:n('height'),min:n('min'),max:n('max')};
 if(![p.width,p.height,p.min,p.max,n('overlap')].every(Number.isFinite)||p.width<20||p.width>300||p.height<20||p.height>300||p.min<0.6||p.min>3||p.max<p.min||p.max>6||n('overlap')<0||n('overlap')>15)throw Error('Use panel sizes of 20–300 mm, minimum thickness 0.6–3 mm, maximum thickness up to 6 mm and at least the minimum, and edge overlap of 0–15 mm.');
 if(2*n('overlap')>=Math.min(p.width,p.height))throw Error('Edge overlap must leave a visible photo area.');
 p.cols=Math.min(241,Math.ceil(p.width/n('detail'))+1);p.rows=Math.min(241,Math.ceil(p.height/n('detail'))+1);return p;
}
function controlsEnabled(valid){for(const id of ['stl','three-mf','summary','test-fit'])$(id).disabled=!valid||exporting;}
function render(){
 $('brightness-value').value=$('brightness').value;$('contrast-value').value=$('contrast').value;
 let p;try{p=settings();}catch(e){grid=null;controlsEnabled(false);$('fit-overlay').hidden=true;$('feedback').textContent=e.message;return;}
 $('panel-estimate').textContent=`${p.width} × ${p.height} mm`;
 const allowance=$('clearance').value==='side'?0.4:0.2;
 $('fit-summary').textContent=`Planning opening: ${(p.width+allowance).toFixed(1)} × ${(p.height+allowance).toFixed(1)} mm. Visible photo: ${(p.width-2*n('overlap')).toFixed(1)} × ${(p.height-2*n('overlap')).toFixed(1)} mm. This does not resize the panel. Final frame dimensions and clearance convention remain unconfirmed.`;
 if(!image){controlsEnabled(false);return;}
 sample.width=p.cols;sample.height=p.rows;
 const ratio=p.width/p.height,imgRatio=image.width/image.height;
 sc.fillStyle='white';sc.fillRect(0,0,p.cols,p.rows);
 let cropWidth=image.width,cropHeight=image.height;
 if($('crop').value==='cover') {
   if(imgRatio>ratio)cropWidth=image.height*ratio;else cropHeight=image.width/ratio;
   sc.drawImage(image,(image.width-cropWidth)*n('panx')/100,(image.height-cropHeight)*n('pany')/100,cropWidth,cropHeight,0,0,p.cols,p.rows);
 }else{
   const dw=imgRatio>ratio?p.cols:p.cols*imgRatio/ratio,dh=imgRatio>ratio?p.rows*ratio/imgRatio:p.rows;
   sc.drawImage(image,(p.cols-dw)/2,(p.rows-dh)/2,dw,dh);
 }
 const pixels=sc.getImageData(0,0,p.cols,p.rows),tones=new Uint8Array(p.cols*p.rows);
 const contrast=(100+n('contrast'))/(100-n('contrast'));let dark=0,sum=0;
 for(let i=0;i<tones.length;i++){
   const j=i*4;let tone=(0.2126*pixels.data[j]+0.7152*pixels.data[j+1]+0.0722*pixels.data[j+2]);
   tone=Math.max(0,Math.min(255,(tone-127.5)*contrast+127.5+n('brightness')*2.55));
   if($('invert').checked)tone=255-tone;
   tones[i]=Math.round(tone);sum+=p.min+(1-tone/255)*(p.max-p.min);if(tone<40)dark++;
   // A warm illustrative transmission curve, intentionally not a calibrated simulation.
   const light=0.18+0.82*(tone/255)**0.7;
   pixels.data[j]=255*light;pixels.data[j+1]=225*light;pixels.data[j+2]=174*light;pixels.data[j+3]=255;
 }
 sc.putImageData(pixels,0,0);canvas.width=Math.round(720*Math.min(1,ratio));canvas.height=Math.round(720*Math.min(1,1/ratio));ctx.imageSmoothingEnabled=true;ctx.drawImage(sample,0,0,canvas.width,canvas.height);
 canvas.style.display='block';$('empty').hidden=true;grid={...p,tones};controlsEnabled(true);
 const volume=p.width*p.height*sum/tones.length;
 $('material-estimate').textContent=`~${(volume*1.24/1000).toFixed(1)} g · ${(volume/1000).toFixed(1)} cm³`;
 const messages=[];
 const effectiveW=$('crop').value==='cover'?cropWidth:image.width,effectiveH=$('crop').value==='cover'?cropHeight:image.height;
 if(Math.min(effectiveW/p.width,effectiveH/p.height)<4)messages.push('Low photo resolution for this print size; small details may be lost.');
 if(dark/tones.length>0.35)messages.push('Many dark areas may obscure detail; try increasing brightness.');
 if($('crop').value==='cover'&&(cropWidth<image.width*.98||cropHeight<image.height*.98))messages.push('The photo is cropped. Check faces and important details near the edges.');
 if(p.cols===241||p.rows===241)messages.push(`Mesh sampling is capped for device memory: ${(p.width/(p.cols-1)).toFixed(2)} × ${(p.height/(p.rows-1)).toFixed(2)} mm.`);
 messages.push('PLA estimate assumes solid plastic at 1.24 g/cm³; excludes brim, supports and waste.');
 $('feedback').textContent=messages.join(' ');positionOverlay();
}
function positionOverlay(){
 const box=$('fit-overlay');box.hidden=!image||!grid||!$('overlay').checked;if(box.hidden)return;
 const r=canvas.getBoundingClientRect(),parent=canvas.parentElement.getBoundingClientRect();
 box.style.left=`${r.left-parent.left}px`;box.style.top=`${r.top-parent.top}px`;box.style.width=`${r.width}px`;box.style.height=`${r.height}px`;
 box.style.borderLeftWidth=box.style.borderRightWidth=`${r.width*n('overlap')/grid.width}px`;
 box.style.borderTopWidth=box.style.borderBottomWidth=`${r.height*n('overlap')/grid.height}px`;
}
new ResizeObserver(positionOverlay).observe(canvas.parentElement);
for(const id of fields)$(id).addEventListener('input',()=>{cancelExport(false);render();});
$('photo').addEventListener('change',async()=>{
 const file=$('photo').files[0],token=++loadId;cancelExport(false);if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){$('feedback').textContent='Choose a JPEG, PNG or WebP photo under 20 MB.';$('photo').value='';return;}
 $('feedback').textContent='Opening photo locally…';
 try{
  const decoded=await createImageBitmap(file,{imageOrientation:'from-image'});
  if(token!==loadId){decoded.close();return;}
  if(decoded.width*decoded.height>24000000){decoded.close();throw Error('Choose a photo no larger than 24 megapixels.');}
  image?.close();image=decoded;render();
 }catch(e){$('feedback').textContent=e.message||'This photo could not be opened. Try a different JPEG, PNG or WebP file.';}
});
function download(bytes,name,type){const url=URL.createObjectURL(new Blob([bytes],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function cancelExport(report=true){if(worker){worker.terminate();worker=null;if(report)$('export-status').textContent='Export cancelled.';}exporting=false;$('progress').hidden=true;$('cancel').hidden=true;controlsEnabled(!!grid);}
function startExport(format,test=false){
 if(!grid)return;cancelExport(false);exporting=true;controlsEnabled(false);$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Building your file locally…';
 const panel=test?{width:20,height:20,min:grid.max,max:grid.max,cols:2,rows:2,tones:new Uint8Array(4)}:grid;
 worker=new Worker(new URL('./export-worker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{
   if(data.progress)$('progress').value=data.progress;
   if(data.error){cancelExport(false);$('export-status').textContent=`Export failed: ${data.error}`;}
   if(data.bytes){download(data.bytes,test?'peggleg-corner-test-fit.stl':`peggleg-panel-${panel.width}x${panel.height}.${format}`,format==='3mf'?'model/3mf':'model/stl');cancelExport(false);$('export-status').textContent='File generated. Check your browser downloads.';}
 };
 worker.onerror=()=>{cancelExport(false);$('export-status').textContent='Export failed. Try standard detail or a smaller panel.';};
 worker.postMessage({panel,format});
}
$('stl').onclick=()=>startExport('stl');$('three-mf').onclick=()=>startExport('3mf');$('test-fit').onclick=()=>startExport('stl',true);$('cancel').onclick=()=>cancelExport();
$('summary').onclick=()=>{
 if(!grid)return;const p=grid;
 const text=`PEGGLEG LITHOPHANE — PRINT SUMMARY\n\nPanel: ${p.width} × ${p.height} mm\nThickness: ${p.min}–${p.max} mm\nMesh spacing: ${(p.width/(p.cols-1)).toFixed(3)} × ${(p.height/(p.rows-1)).toFixed(3)} mm\nMaterial estimate: ${$('material-estimate').textContent}\nFit: custom panel; frame designs are in development\n${$('fit-summary').textContent}\n\nPhoto adjustments: ${$('crop').value}, crop position ${n('panx')}% / ${n('pany')}%, brightness ${n('brightness')}, contrast ${n('contrast')}, invert ${$('invert').checked}\n\nSTARTING PRINT SETTINGS (not a validated printer profile)\nWhite PLA; 0.12–0.16 mm layers; solid panel; vertical orientation with a brim. Slice at 100% scale in millimetres. Inspect toolpaths and use the slicer for time and filament estimates. Test the corner fit before printing the whole panel.\n\nLIGHTING\nLED tealights only, no flame. Bambu kit frame planned with cable slit; exact kit pending. 0.2 mm is mechanical fit allowance, not thermal clearance. Ventilate, avoid pinched wires, follow manufacturer guidance and test temperatures.\n\nFrames and licences: https://makerworld.com/en/@peggleg\nPhotos and models were generated locally and were not uploaded or stored by this app.\n`;
 download(text,'peggleg-print-summary.txt','text/plain');
};
$('reset').onclick=()=>{
 ++loadId;cancelExport(false);image?.close();image=null;grid=null;$('photo').value='';
 for(const [id,value]of Object.entries({width:120,height:100,min:0.8,max:3,detail:1,crop:'cover',panx:50,pany:50,brightness:0,contrast:0,overlap:3,clearance:'total'}))$(id).value=value;
 $('invert').checked=false;$('overlay').checked=true;
 canvas.width=1;canvas.height=1;sample.width=1;sample.height=1;canvas.style.display='none';$('empty').hidden=false;$('fit-overlay').hidden=true;$('material-estimate').textContent='Add a photo';$('export-status').textContent='Session cleared. Existing downloads stay on your device.';$('feedback').textContent='Everything happens in this browser. No account needed.';render();
};
window.addEventListener('pagehide',()=>{worker?.terminate();image?.close();grid=null;image=null;canvas.width=1;sample.width=1;});
render();

for(const button of document.querySelectorAll('[data-seasonal]'))button.addEventListener('click',async()=>{
 const token=++loadId;cancelExport(false);
 try{
  const art=await drawSeasonal(document.createElement('canvas'),button.dataset.seasonal);
  const decoded=await createImageBitmap(art);art.width=1;art.height=1;
  if(token!==loadId){decoded.close();return;}
  image?.close();image=decoded;$('photo').value='';
  $('brightness').value=0;$('contrast').value=0;$('invert').checked=false;$('panx').value=50;$('pany').value=50;$('detail').value='0.5';
  render();$('export-status').textContent=seasonalDesigns.find(d=>d.id===button.dataset.seasonal).name+' loaded. Custom panel geometry only; frame fit is not validated.';
  $('studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){$('export-status').textContent='Could not load seasonal artwork: '+e.message;}
});

for(const thumbnail of document.querySelectorAll('[data-seasonal-preview]')){
 drawSeasonal(thumbnail,thumbnail.dataset.seasonalPreview).then(()=>{thumbnail.dataset.ready='true';}).catch(()=>{
  const message=document.createElement('p');message.textContent='Artwork preview unavailable. Please reload to retry.';
  thumbnail.parentElement.replaceChildren(message);
 });
}
