import './fan.css';
import {defaults,validateFan,stackHeight,outline,bladeAngle,instructions} from './fan-geometry.js';
const $=id=>document.getElementById(id),preview=$('preview'),ctx=preview.getContext('2d'),sample=document.createElement('canvas'),sc=sample.getContext('2d',{willReadFrequently:true});
let image=null,photo=null,view='open',worker=null,loadId=0,busy=false;
const fields=['count','length','angle','stand','crop','panx','pany','brightness','contrast','invert','backlit'];
function settings(){return validateFan({count:+$('count').value,length:+$('length').value,angle:+$('angle').value,stand:$('stand').checked});}
function cancel(){worker?.terminate();worker=null;busy=false;$('progress').hidden=true;$('cancel').hidden=true;enable();}
function enable(){let valid=true;try{settings();}catch{valid=false;}for(const id of ['zip','three-mf'])$(id).disabled=!photo||busy||!valid;$('test-fit').disabled=busy||!valid;$('summary').disabled=!valid;}
function prepare(p){
 if(!image){photo=null;return;}
 const width=2*p.length*Math.sin(p.angle*Math.PI/360),height=p.length+6,cols=401,rows=Math.ceil(cols*height/width);
 sample.width=cols;sample.height=rows;sc.fillStyle='white';sc.fillRect(0,0,cols,rows);
 const ratio=width/height,ir=image.width/image.height;
 if($('crop').value==='cover'){
  const sw=ir>ratio?image.height*ratio:image.width,sh=ir>ratio?image.height:image.width/ratio;
  sc.drawImage(image,(image.width-sw)*+$('panx').value/100,(image.height-sh)*+$('pany').value/100,sw,sh,0,0,cols,rows);
 }else{const dw=ir>ratio?cols:rows*ir,dh=ir>ratio?cols/ir:rows;sc.drawImage(image,(cols-dw)/2,(rows-dh)/2,dw,dh);}
 const pixels=sc.getImageData(0,0,cols,rows),tones=new Uint8Array(cols*rows),c=(100+ +$('contrast').value)/(100- +$('contrast').value);
 for(let i=0;i<tones.length;i++){let t=.2126*pixels.data[i*4]+.7152*pixels.data[i*4+1]+.0722*pixels.data[i*4+2];t=Math.max(0,Math.min(255,(t-127.5)*c+127.5+ +$('brightness').value*2.55));if($('invert').checked)t=255-t;tones[i]=t;
  const l=.22+.78*(t/255)**.7;pixels.data[i*4]=$('backlit').checked?255*l:205+50*t/255;pixels.data[i*4+1]=$('backlit').checked?232*l:205+50*t/255;pixels.data[i*4+2]=$('backlit').checked?195*l:205+50*t/255;
 }sc.putImageData(pixels,0,0);photo={width,height,cols,rows,tones};
}
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function draw(c,p,mode,hasPhoto){
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
  if(hasPhoto){c.save();c.scale(1,-1);c.drawImage(sample,-bounds/2,-p.length,bounds,p.length+6);c.restore();}
  else{c.fillStyle='#cfba91';c.beginPath();c.moveTo(-bounds/2,45);c.lineTo(-70,80);c.lineTo(-30,62);c.lineTo(15,132);c.lineTo(80,68);c.lineTo(bounds/2,90);c.lineTo(bounds/2,0);c.lineTo(-bounds/2,0);c.fill();}
  c.restore();path(c,poly);c.strokeStyle='#fff';c.lineWidth=1.2;c.stroke();
  c.fillStyle='#f5f5f2';c.beginPath();c.moveTo(-6,0);c.lineTo(-7,30);c.quadraticCurveTo(0,38,7,30);c.lineTo(6,0);c.fill();
  c.fillStyle='#c4c4bf';c.beginPath();c.arc(0,0,3.3,0,Math.PI*2);c.fill();c.restore();
 }
 c.fillStyle='#fff';c.strokeStyle='#c3c3be';c.lineWidth=.5;c.beginPath();c.arc(0,0,5,0,Math.PI*2);c.fill();c.stroke();c.restore();
 if(mode==='parts'){c.fillStyle='#544c40';c.font='18px Arial';c.fillText('Numbered blades + guards · printable pivot, washers and nut',W*.07,H*.96);}
}
function render(){let p;try{p=settings();prepare(p);$('feedback').textContent=photo?'All processing stays in this browser. Pivot parts are printable; ribbon is supplied separately.':'Choose a photo or try the sample landscape. The mountain preview is illustrative.';$('blade-estimate').textContent=p.count;$('width-estimate').textContent=`≈${Math.round(2*p.length*Math.sin(p.angle*Math.PI/360))} mm`;$('stack-estimate').textContent=`${stackHeight(p)} mm (provisional)`;if(stackHeight(p)>15)$('feedback').textContent+=' This blade count exceeds the 15 mm default stack target.';draw(ctx,p,view,!!photo);}catch(e){photo=null;$('feedback').textContent=e.message;}enable();}
fields.forEach(id=>$(id).addEventListener('input',()=>{cancel();render();}));
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();};
$('photo').onchange=async()=>{const token=++loadId;cancel();const file=$('photo').files[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){$('feedback').textContent='Choose a JPEG, PNG or WebP under 20 MB.';return;}
 try{const decoded=await createImageBitmap(file,{imageOrientation:'from-image'});if(token!==loadId){decoded.close();return;}if(decoded.width*decoded.height>24000000){decoded.close();throw Error('Choose an image under 24 megapixels.');}image?.close?.();image=decoded;render();}catch(e){$('feedback').textContent=e.message;}
};
function demo(){++loadId;cancel();image?.close?.();const d=document.createElement('canvas');d.width=1000;d.height=600;const c=d.getContext('2d'),g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,'#e6e6e6');g.addColorStop(1,'#fff');c.fillStyle=g;c.fillRect(0,0,1000,600);c.fillStyle='#aaa';c.beginPath();c.moveTo(0,410);c.lineTo(260,240);c.lineTo(370,330);c.lineTo(540,65);c.lineTo(760,330);c.lineTo(1000,220);c.lineTo(1000,600);c.lineTo(0,600);c.fill();c.fillStyle='#f5f5f5';c.beginPath();c.moveTo(455,200);c.lineTo(540,65);c.lineTo(650,215);c.lineTo(553,165);c.lineTo(520,205);c.lineTo(500,160);c.fill();for(let i=0;i<65;i++){const x=i*17,y=380+Math.sin(i*1.7)*35;c.fillStyle=i%2?'#666':'#888';c.beginPath();c.moveTo(x,y-50);c.lineTo(x-17,y+30);c.lineTo(x+17,y+30);c.fill();}c.fillStyle='#d8d8d8';c.fillRect(0,470,1000,130);for(let y=490;y<600;y+=12){c.strokeStyle='#aaa';c.beginPath();c.moveTo(0,y);c.lineTo(1000,y+Math.sin(y)*4);c.stroke();}image=d;render();}
$('demo').onclick=demo;
function download(bytes,name,type){const url=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function start(format){cancel();let p;try{p=settings();}catch(e){$('export-status').textContent=e.message;return;}if(!photo&&format!=='test')return;busy=true;enable();$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Building parts locally…';worker=new Worker(new URL('./fan-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(data.progress)$('progress').value=data.progress;if(data.error){cancel();$('export-status').textContent=`Export failed: ${data.error}`;}if(data.bytes){download(data.bytes,format==='test'?'fan-pivot-test.zip':`folding-fan-${p.count}-blades.${format==='3mf'?'3mf':'zip'}`,format==='3mf'?'model/3mf':'application/zip');cancel();$('export-status').textContent='Downloaded. Read the included assembly instructions; fit remains provisional.';}};worker.onerror=()=>{cancel();$('export-status').textContent='Export failed. Try again with fewer blades.';};worker.postMessage({settings:p,photo,format});}
$('zip').onclick=()=>start('zip');$('three-mf').onclick=()=>start('3mf');$('test-fit').onclick=()=>start('test');$('cancel').onclick=()=>{cancel();$('export-status').textContent='Export cancelled.';};$('summary').onclick=()=>{try{download(instructions(settings()),'fan-assembly.txt','text/plain');}catch(e){$('export-status').textContent=e.message;}};
$('reset').onclick=()=>{++loadId;cancel();image?.close?.();image=null;photo=null;$('photo').value='';for(const [id,val]of Object.entries({...defaults,panx:50,pany:50,brightness:0,contrast:0,crop:'cover'})){if(id==='stand')$('stand').checked=val;else $(id).value=val;}$('invert').checked=false;$('backlit').checked=true;view='open';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='open')));$('export-status').textContent='Session cleared.';render();};
window.addEventListener('pagehide',()=>{++loadId;cancel();image?.close?.();image=null;photo=null;sample.width=1;preview.width=1;});
draw($('hero').getContext('2d'),defaults,'open',false);render();
