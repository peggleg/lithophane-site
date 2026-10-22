import './theme.js';
import './fan.css';
import {drawPhoto,photoLayout,dragCrop} from './image-processing.js';
import {fanSamples,drawFanSample} from './fan-samples.js';
import {defaults,validateFan,stackHeight,outline,bladeAngle,instructions} from './fan-geometry.js';
const $=id=>document.getElementById(id),preview=$('preview'),ctx=preview.getContext('2d'),sample=document.createElement('canvas'),sc=sample.getContext('2d',{willReadFrequently:true});
let image=null,photo=null,view='open',worker=null,loadId=0,busy=false,loading=false;
const fields=['count','length','angle','stand','crop','zoom','panx','pany','brightness','contrast','invert','backlit'];
const adjustments=()=>({crop:$('crop').value,zoom:+$('zoom').value,panx:+$('panx').value,pany:+$('pany').value});
let drag=null;
function endDrag(){const previous=drag;drag=null;preview.classList.remove('dragging');if(previous&&preview.hasPointerCapture(previous.id))preview.releasePointerCapture(previous.id);}
function cropControls(){
 const ready=!!image&&!loading&&!!photo,cover=$('crop').value==='cover';
 const layout=ready?photoLayout(image.width,image.height,photo.width/photo.height,adjustments()):null;
 const horizontal=!!layout&&layout.sw<image.width-1e-6,vertical=!!layout&&layout.sh<image.height-1e-6;
 $('zoom').disabled=!ready||!cover;$('panx').disabled=!ready||!cover||!horizontal;$('pany').disabled=!ready||!cover||!vertical;$('reset-crop').disabled=!ready;
 $('zoom-value').value=`${$('zoom').value}%`;
 preview.dataset.draggable=String(ready&&cover&&view==='open'&&(horizontal||vertical));
 $('crop-help').textContent=!ready?'Choose a photo to move it around.':!cover?'The whole photo is shown. Choose Fill fan (crop) to reposition it.':view!=='open'?'Choose Open to drag your photo.':horizontal||vertical?'Drag your photo to frame it. Use arrow keys when the preview is focused; hold Shift for bigger steps. Movement stops at the photo edges.':'Enlarge your photo to make room to move it around.';
}
preview.addEventListener('pointerdown',event=>{
 if(event.button!==0||!event.isPrimary||preview.dataset.draggable!=='true')return;
 const r=preview.getBoundingClientRect(),p=settings(),bounds=photo.width,scale=Math.min(preview.width*.88/bounds,preview.height*.76/(p.length+8));
 const layout=photoLayout(image.width,image.height,photo.width/photo.height,adjustments());
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,...adjustments(),...layout,imageWidth:image.width,imageHeight:image.height,width:scale*photo.width*r.width/preview.width,height:scale*photo.height*r.height/preview.height};
 cancel();preview.setPointerCapture(event.pointerId);preview.classList.add('dragging');preview.focus({preventScroll:true});event.preventDefault();
});
preview.addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.id)return;
 const position=dragCrop(drag,event.clientX-drag.x,event.clientY-drag.y);
 $('panx').value=position.panx;$('pany').value=position.pany;render();
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])preview.addEventListener(type,endDrag);
preview.addEventListener('keydown',event=>{
 if(preview.dataset.draggable!=='true')return;
 const delta={ArrowLeft:[1,0],ArrowRight:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[event.key];if(!delta)return;
 event.preventDefault();cancel();const step=event.shiftKey?10:2;
 for(const [i,id]of ['panx','pany'].entries())if(!$(id).disabled)$(id).value=Math.max(0,Math.min(100,+$(id).value+delta[i]*step));render();
});
$('reset-crop').onclick=()=>{endDrag();cancel();$('zoom').value=100;$('panx').value=50;$('pany').value=50;render();};
function settings(){return validateFan({count:+$('count').value,length:+$('length').value,angle:+$('angle').value,stand:$('stand').checked});}
function cancel(){worker?.terminate();worker=null;busy=false;$('progress').hidden=true;$('cancel').hidden=true;enable();}
function enable(){let valid=true;try{settings();}catch{valid=false;}for(const id of ['zip','three-mf'])$(id).disabled=!photo||busy||loading||!valid;$('test-fit').disabled=busy||!valid;$('summary').disabled=!valid;}
function prepare(p){
 if(!image){photo=null;return;}
 const width=2*p.length*Math.sin(p.angle*Math.PI/360),height=p.length+6,cols=401,rows=Math.ceil(cols*height/width);
 sample.width=cols;sample.height=rows;
 drawPhoto(sc,image,cols,rows,width/height,adjustments());
 const pixels=sc.getImageData(0,0,cols,rows),tones=new Uint8Array(cols*rows),c=(100+ +$('contrast').value)/(100- +$('contrast').value);
 for(let i=0;i<tones.length;i++){let t=.2126*pixels.data[i*4]+.7152*pixels.data[i*4+1]+.0722*pixels.data[i*4+2];t=Math.max(0,Math.min(255,(t-127.5)*c+127.5+ +$('brightness').value*2.55));if($('invert').checked)t=255-t;tones[i]=t;
  const l=.22+.78*(t/255)**.7;pixels.data[i*4]=$('backlit').checked?255*l:205+50*t/255;pixels.data[i*4+1]=$('backlit').checked?232*l:205+50*t/255;pixels.data[i*4+2]=$('backlit').checked?195*l:205+50*t/255;
 }sc.putImageData(pixels,0,0);photo={width,height,cols,rows,tones};
}
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function draw(c,p,mode,hasPhoto,texture=sample){
 const W=c.canvas.width,H=c.canvas.height;c.clearRect(0,0,W,H);const poly=outline(p),bounds=2*p.length*Math.sin(p.angle*Math.PI/360),s=Math.min(W*.88/bounds,H*.76/(p.length+8));
 const background=c.createRadialGradient(W/2,H*.4,10,W/2,H*.5,W*.6);background.addColorStop(0,'#fff3dd');background.addColorStop(1,'#e5dbcb');c.fillStyle=background;c.fillRect(0,0,W,H);
 if(mode==='parts'){
  const cols=7,cellW=W/cols,cellH=H*.62,scale=Math.min(cellW*.65/35,cellH*.8/p.length);
  for(let i=0;i<p.count+2;i++){const guard=i>=p.count;c.save();c.translate(cellW*(i%cols+.5),cellH*(Math.floor(i/cols)*.42+.68));c.scale(scale,-scale);path(c,poly);c.fillStyle=guard?'#eeeeeb':'#fafaf8';c.fill();c.strokeStyle='#bfc0b9';c.lineWidth=.6;c.stroke();c.beginPath();c.arc(0,0,3.3,0,Math.PI*2);c.fillStyle='#b6b6ae';c.fill();c.restore();c.fillStyle='#544c40';c.font='14px Arial';c.textAlign='center';c.fillText(guard?'Guard '+(i-p.count+1):'Blade '+(i+1),cellW*(i%cols+.5),cellH*(Math.floor(i/cols)*.42+.68)+22);}
  c.textAlign='left';const y=H*.86;c.fillStyle='#fafaf8';c.strokeStyle='#b8b9b2';c.lineWidth=1;
  c.beginPath();c.roundRect(W*.12,y,85,13,5);c.fill();c.stroke();c.beginPath();c.ellipse(W*.12,y+6,10,18,0,0,Math.PI*2);c.fill();c.stroke();for(let j=0;j<5;j++){c.beginPath();c.moveTo(W*.12+60+j*4,y);c.lineTo(W*.12+56+j*4,y+13);c.stroke();}
  for(let j=0;j<3;j++){const x=W*(.36+j*.13);c.beginPath();c.arc(x,y+5,j===2?18:14,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.arc(x,y+5,7,0,Math.PI*2);c.fillStyle='#d7cebf';c.fill();c.fillStyle='#fafaf8';}
  c.fillStyle='#544c40';c.font='15px Arial';c.fillText('Printed pin',W*.12,y+45);c.fillText('Washers',W*.35,y+45);c.fillText('Printed nut',W*.58,y+45);
  if(p.stand){c.fillStyle='#4b3b2f';for(let i=0;i<2;i++){const x=W*(.77+i*.1);c.fillRect(x,y-5,45,25);c.clearRect(x+14,y-5,17,18);}c.fillStyle='#544c40';c.fillText('Stand cradles',W*.76,y+45);}return;
 }
 if(mode==='closed'){
  c.save();c.translate(W*.38,H*.83);c.rotate(.45);const scale=Math.min(H*.67/p.length,W*.4/p.length);c.scale(scale,-scale);
  for(let i=p.count+1;i>=0;i--){c.save();c.translate(i*.65,-i*1.1);path(c,poly);c.fillStyle=i===0?'#fdfdfb':'#e8e7e3';c.fill();c.strokeStyle='#bcbdb7';c.lineWidth=.5;c.stroke();c.restore();}c.restore();
  c.fillStyle='#544c40';c.font='20px Arial';c.fillText(`${stackHeight(p)} mm stack · pivot protrudes`,W*.1,H*.93);return;
 }
 c.save();c.translate(W/2,H*.85);c.scale(s,-s);
 if(p.stand&&mode==='open'){c.fillStyle='#4b3b2f';c.fillRect(-p.length*.4,-12,p.length*.8,5);c.fillRect(-p.length*.26,-7,4,25);c.fillRect(p.length*.26-4,-7,4,25);}
 for(let i=p.count-1;i>=0;i--){
  const a=bladeAngle(p,i);c.save();if(mode==='parts'){c.translate((i-(p.count-1)/2)*4,0);}
  c.rotate(-a);path(c,poly);c.fillStyle='#fafaf8';c.fill();
  c.save();c.clip();c.rotate(a);
  if(hasPhoto){c.save();c.scale(1,-1);c.drawImage(texture,-bounds/2,-p.length,bounds,p.length+6);c.restore();}
  else{c.fillStyle='#cfba91';c.beginPath();c.moveTo(-bounds/2,45);c.lineTo(-70,80);c.lineTo(-30,62);c.lineTo(15,132);c.lineTo(80,68);c.lineTo(bounds/2,90);c.lineTo(bounds/2,0);c.lineTo(-bounds/2,0);c.fill();}
  c.restore();path(c,poly);c.strokeStyle='#fff';c.lineWidth=1.2;c.stroke();
  c.fillStyle='#f5f5f2';c.beginPath();c.moveTo(-6,0);c.lineTo(-7,30);c.quadraticCurveTo(0,38,7,30);c.lineTo(6,0);c.fill();
  c.fillStyle='#c4c4bf';c.beginPath();c.arc(0,0,3.3,0,Math.PI*2);c.fill();c.restore();
 }
 c.fillStyle='#fff';c.strokeStyle='#c3c3be';c.lineWidth=.5;c.beginPath();c.arc(0,0,5,0,Math.PI*2);c.fill();c.stroke();c.restore();
 if(mode==='parts'){c.fillStyle='#544c40';c.font='18px Arial';c.fillText('Numbered blades + guards · printable pivot, washers and nut',W*.07,H*.96);}
}
function render(){let p;try{p=settings();prepare(p);$('feedback').textContent=photo?'All processing stays in this browser. Pivot parts are printable; ribbon is supplied separately.':'Choose a photo or try the sample landscape. The mountain preview is illustrative.';$('blade-estimate').textContent=p.count;$('width-estimate').textContent=`≈${Math.round(2*p.length*Math.sin(p.angle*Math.PI/360))} mm`;$('stack-estimate').textContent=`${stackHeight(p)} mm (provisional)`;if(stackHeight(p)>15)$('feedback').textContent+=' This blade count exceeds the 15 mm default stack target.';draw(ctx,p,view,!!photo);}catch(e){photo=null;$('feedback').textContent=e.message;}cropControls();enable();}
fields.forEach(id=>$(id).addEventListener('input',()=>{endDrag();cancel();render();}));
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{endDrag();view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();};
$('photo').onchange=async()=>{const token=++loadId;endDrag();cancel();loading=false;const file=$('photo').files[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){$('feedback').textContent='Choose a JPEG, PNG or WebP under 20 MB.';return;}
 loading=true;cropControls();enable();try{const decoded=await createImageBitmap(file,{imageOrientation:'from-image'});if(token!==loadId){decoded.close();return;}if(decoded.width*decoded.height>24000000){decoded.close();throw Error('Choose an image under 24 megapixels.');}image?.close?.();image=decoded;loading=false;$('zoom').value=100;$('panx').value=50;$('pany').value=50;document.querySelectorAll('[data-fan-sample]').forEach(b=>b.setAttribute('aria-pressed','false'));render();}catch(e){if(token!==loadId)return;loading=false;cropControls();enable();$('feedback').textContent=e.message;}
};
async function useSample(id){
 const design=fanSamples.find(d=>d.id===id);if(!design)return;
 const token=++loadId;endDrag();cancel();loading=true;cropControls();enable();$('feedback').textContent=`Loading ${design.name}…`;
 $('sample-status').textContent=`Loading ${design.name}…`;
 try{
  const art=await drawFanSample(document.createElement('canvas'),id);if(token!==loadId)return;
  image?.close?.();image=art;loading=false;$('photo').value='';
  for(const [field,value]of Object.entries({zoom:100,panx:50,pany:50,brightness:0,contrast:0,crop:'cover'}))$(field).value=value;
  $('invert').checked=false;view='open';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='open')));
  render();$('export-status').textContent=`${design.name} loaded. Adjust the crop and tones, then export your fan.`;
  $('sample-status').textContent=`${design.name} loaded in the studio.`;
  document.querySelectorAll('[data-fan-sample]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fanSample===id)));
  $('studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){if(token!==loadId)return;loading=false;enable();$('feedback').textContent='Sample unavailable: '+e.message;$('sample-status').textContent='Sample unavailable. Please try again.';}
}
$('demo').onclick=()=>useSample(fanSamples[0].id);
const gallery=$('fan-samples');
for(const design of fanSamples){
 const card=document.createElement('article');card.className='fan-sample-card';
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=384;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',design.description);
 const heading=document.createElement('h3');heading.textContent=design.name;
 const description=document.createElement('p');description.textContent=design.description;
 const button=document.createElement('button');button.type='button';button.dataset.fanSample=design.id;button.textContent='Use '+design.name+' ↗';button.setAttribute('aria-pressed','false');button.onclick=()=>useSample(design.id);
 card.append(canvas,heading,description,button);gallery.append(card);
 drawFanSample(document.createElement('canvas'),design.id).then(art=>draw(canvas.getContext('2d'),defaults,'open',true,art)).catch(()=>{const warning=document.createElement('p');warning.textContent='Preview unavailable. Use the button to retry.';canvas.replaceWith(warning);});
}

function download(bytes,name,type){const url=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function start(format){cancel();let p;try{p=settings();}catch(e){$('export-status').textContent=e.message;return;}if(!photo&&format!=='test')return;busy=true;enable();$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Building parts locally…';worker=new Worker(new URL('./fan-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(data.progress)$('progress').value=data.progress;if(data.error){cancel();$('export-status').textContent=`Export failed: ${data.error}`;}if(data.bytes){download(data.bytes,format==='test'?'fan-pivot-test.zip':`folding-fan-${p.count}-blades.${format==='3mf'?'3mf':'zip'}`,format==='3mf'?'model/3mf':'application/zip');cancel();$('export-status').textContent='Downloaded. Read the included assembly instructions; fit remains provisional.';}};worker.onerror=()=>{cancel();$('export-status').textContent='Export failed. Try again with fewer blades.';};worker.postMessage({settings:p,photo,format});}
$('zip').onclick=()=>start('zip');$('three-mf').onclick=()=>start('3mf');$('test-fit').onclick=()=>start('test');$('cancel').onclick=()=>{cancel();$('export-status').textContent='Export cancelled.';};$('summary').onclick=()=>{try{download(instructions(settings()),'fan-assembly.txt','text/plain');}catch(e){$('export-status').textContent=e.message;}};
$('reset').onclick=()=>{++loadId;endDrag();cancel();image?.close?.();image=null;photo=null;loading=false;$('photo').value='';for(const [id,val]of Object.entries({...defaults,zoom:100,panx:50,pany:50,brightness:0,contrast:0,crop:'cover'})){if(id==='stand')$('stand').checked=val;else $(id).value=val;}$('invert').checked=false;$('backlit').checked=true;view='open';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='open')));$('export-status').textContent='Session cleared.';$('sample-status').textContent='';document.querySelectorAll('[data-fan-sample]').forEach(b=>b.setAttribute('aria-pressed','false'));render();};
window.addEventListener('pagehide',()=>{++loadId;endDrag();cancel();image?.close?.();image=null;photo=null;sample.width=1;preview.width=1;});
draw($('hero').getContext('2d'),defaults,'open',false);render();

drawFanSample(document.createElement('canvas'),fanSamples[0].id).then(art=>draw($('hero').getContext('2d'),defaults,'open',true,art)).catch(()=>{});
