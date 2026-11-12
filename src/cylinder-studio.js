import './style.css';import './theme.js';import './cylinder.css';
import {cylinderSettings,cylinderDefaults,cylinderStands,cylinderLightFits} from './cylinder-settings.js';
import {cylinderCollections,cylinderDesigns,cylinderArtwork} from './cylinder-artwork.js';
import {cylinderPreview} from './cylinder-preview.js';
import {mountPrinterPicker} from './printer-picker.js';
import {filamentParts,gramsText} from './filament.js';
import {profileSummary} from './print-profile.js';
import {cylinderOnly} from './cylinder-export.js';

const $=id=>document.getElementById(id),thumbs=import.meta.glob('./assets/cylinder-stands/*.webp',{eager:true,query:'?url',import:'default'});
let state={...cylinderDefaults},design=cylinderDesigns[0],model=null,worker=null,timer,revision=0,busy=false,art=null;
const preview=cylinderPreview($('model-canvas'));
const picker=mountPrinterPicker(printer=>{state.printer=printer;generate();});
const buttons=['stl','three-mf','cylinder-stl','cylinder-three-mf','stand-download','stand-three-mf','test-fit','fit-three-mf','print-guide','tripod-joint-test','tripod-legs'];
function showLightFit(){const fit=cylinderLightFits[state.lightSource],kit=state.lightSource==='bambu001',input=$('fitDiameter');input.min=fit.minDiameter;input.max=fit.maxDiameter;input.value=state.fitDiameter;$('light-fit-help').textContent=kit?'The 59 × 8 mm kit sits in a 5 mm deep recess with a 5 mm open cable channel; it projects 3 mm above the deck. Default diameter: 59.6 mm. Print the small fit cup first.':'Default 39 mm gives 1 mm total diameter clearance. The recess is 3 mm deep. Print the small fit cup first.';}
function showStand(value){$('stand-only').checked=value;$('lit').disabled=value;preview.setStandOnly(value);$('parts-view').checked=false;preview.setParts(false);}
function controls(){for(const id of buttons)$(id).disabled=!model||busy;$('panorama-download').disabled=!art||busy;$('cancel').hidden=!busy;}
function stop(){clearTimeout(timer);worker?.terminate();worker=null;busy=false;controls();}
function workerFor(token){const w=new Worker(new URL('./cylinder-worker.js',import.meta.url),{type:'module'});worker=w;w.onerror=()=>{if(token===revision){stop();$('feedback').textContent='Could not build the design. Change a setting to retry.';}};return w;}
function save(chunks,name,type='application/octet-stream'){const url=URL.createObjectURL(new Blob(chunks,{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function drawArt(value){
 const target=$('panorama');target.width=value.width;target.height=value.height;target.getContext('2d').drawImage(value.canvas,0,0);
 const seam=$('seam-preview'),strip=Math.round(value.width*.14);seam.width=strip*2;seam.height=value.height;const ctx=seam.getContext('2d');ctx.drawImage(value.canvas,value.width-strip,0,strip,value.height,0,0,strip,value.height);ctx.drawImage(value.canvas,0,0,strip,value.height,strip,0,strip,value.height);
 $('seam-status').textContent=`${design.name} · full landscape · 360° wrap · boundary difference ${value.seam.maximum}/255. Expand below to inspect the join.`;
}
function generate(){
 const tripod=state.stand==='tall-tripod';
 for(const id of ['tripod-fit-options','tripod-joint-test','tripod-legs'])$(id).hidden=!tripod;
 const token=++revision;stop();model=null;art=null;controls();preview.setModel(null);$('dimensions').textContent='';$('filament-estimate').textContent='';$('export-status').textContent='';$('rotation-value').textContent=state.rotation+'°';
 for(const b of $('stand-gallery').children)b.setAttribute('aria-pressed',String(b.dataset.stand===state.stand));
 for(const b of document.querySelectorAll('[data-design]'))b.setAttribute('aria-pressed',String(b.dataset.design===design.id));
 let settings;try{settings={...cylinderSettings(state),designId:design.id,designName:design.name};}catch(e){$('feedback').textContent=e.message;return;}
 $('feedback').textContent='Preparing your panorama and print parts…';busy=true;controls();
 timer=setTimeout(async()=>{try{
  const cols=512,rows=Math.round(settings.height/.55)+1;
  const [full,grid]=await Promise.all([cylinderArtwork(design,1536,512,settings.brightness),cylinderArtwork(design,cols,rows,settings.brightness)]);
  if(token!==revision)return;art=full;drawArt(full);
  const w=workerFor(token);w.onmessage=({data})=>{if(token!==revision)return;if(data.error){stop();$('feedback').textContent=data.error;return;}model=data.model;stop();preview.setModel(model);
   $('dimensions').textContent=`Cylinder: 90 mm diameter × ${settings.height} mm · ${cylinderStands.find(s=>s.id===settings.stand).name} · ${model.seatZ} mm elevation`;
   $('assembly-note').textContent=model.note;
   $('feedback').textContent='Design ready. Rotate the model to inspect the full landscape.';
   $('filament-estimate').textContent=`Estimated PLA: ${gramsText(filamentParts(model.parts,'cylinder').reduce((n,p)=>n+p.grams,0))}. ${profileSummary('cylinder')} Stands: ${profileSummary('cylinder-stand')}`;
  };w.postMessage({action:'generate',settings,tones:grid.tones,cols,rows});
 }catch(e){if(token===revision){stop();$('feedback').textContent=e.message;}}},160);
}
function toggleOlder(expanded){
 const older=$('cylinder-older-gallery').children.length;
 $('cylinder-older').hidden=!expanded;$('cylinder-more').setAttribute('aria-expanded',String(expanded));
 $('cylinder-more').textContent=`${expanded?'Hide':'Show'} older pictures (${older})`;
}
async function selectCollection(id){
 showStand(false);$('collection').value=id;const choices=cylinderDesigns.filter(d=>d.collection===id),newest=choices.slice().reverse();design=newest[0];
 $('design').replaceChildren();$('design-gallery').replaceChildren();$('cylinder-older-gallery').replaceChildren();
 for(const d of choices)$('design').append(new Option(d.name,d.id));
 $('design').value=design.id;
 for(const [index,d] of newest.entries()){
  const b=document.createElement('button');b.type='button';b.className='cylinder-choice quiet';b.dataset.design=d.id;b.setAttribute('aria-pressed',String(d===design));const c=document.createElement('canvas');c.width=450;c.height=150;c.setAttribute('aria-hidden','true');b.append(c,document.createTextNode(d.name));(index<5?$('design-gallery'):$('cylinder-older-gallery')).append(b);
  cylinderArtwork(d,450,150).then(a=>{c.getContext('2d').drawImage(a.canvas,0,0);}).catch(()=>{b.title='Panorama could not load; select to retry.';});
  b.onclick=()=>{design=d;$('design').value=d.id;showStand(false);generate();};
 }
 $('cylinder-more').hidden=newest.length<=5;toggleOlder(false);generate();
}
$('cylinder-more').onclick=()=>toggleOlder($('cylinder-older').hidden);
for(const c of cylinderCollections)$('collection').append(new Option(c.name,c.id));
for(const group of ['Desktop','Elevated']){const g=document.createElement('optgroup');g.label=group;for(const s of cylinderStands.filter(s=>s.group===group)){g.append(new Option(s.name,s.id));const b=document.createElement('button');b.type='button';b.className='stand-choice quiet';b.dataset.stand=s.id;const image=document.createElement('img');image.src=thumbs[`./assets/cylinder-stands/${s.id}.webp`];image.alt='';image.width=640;image.height=480;image.loading='lazy';image.decoding='async';const label=document.createElement('span');label.textContent=s.name;const detail=document.createElement('small');detail.textContent=s.group+' · '+s.height+' mm';b.append(image,label,detail);b.onclick=()=>{state.stand=s.id;$('stand').value=s.id;showStand(true);generate();};$('stand-gallery').append(b);}$('stand').append(g);}
$('collection').oninput=()=>selectCollection($('collection').value);
$('design').oninput=()=>{design=cylinderDesigns.find(d=>d.id===$('design').value);if($('cylinder-older-gallery').querySelector(`[data-design="${design.id}"]`))toggleOlder(true);showStand(false);generate();};
$('stand').oninput=()=>{state.stand=$('stand').value;showStand(true);generate();};
$('lightSource').oninput=()=>{state.lightSource=$('lightSource').value;state.fitDiameter=cylinderLightFits[state.lightSource].recessDiameter;showLightFit();generate();};
for(const id of ['height','min','max','fitDiameter','tripodPegWidth','brightness','rotation'])$(id).oninput=()=>{state[id]=Number($(id).value);generate();};
$('stand-only').onchange=()=>{$('lit').disabled=$('stand-only').checked;preview.setStandOnly($('stand-only').checked);};
$('lit').onchange=()=>preview.setLit($('lit').checked);$('parts-view').onchange=()=>preview.setParts($('parts-view').checked);$('reset-view').onclick=()=>preview.reset();
$('cancel').onclick=()=>{++revision;stop();model=null;art=null;controls();$('feedback').textContent='Cancelled. Change a setting to rebuild.';};
$('reset').onclick=()=>{state={...cylinderDefaults};picker.reset();for(const id of ['height','min','max','fitDiameter','tripodPegWidth','brightness','rotation','stand','lightSource'])$(id).value=state[id];showLightFit();$('parts-view').checked=false;$('lit').checked=true;preview.setParts(false);preview.setLit(true);selectCollection('christmas');};
function exportFile(format,{standOnly=false,cylinderOnly:onlyCylinder=false,test=false,tripodTest=false,legsOnly=false}={}){
 if(!model||busy)return;const token=revision,original=model;stop();busy=true;controls();$('export-status').textContent='Preparing your download…';
 const w=workerFor(token);const send=m=>w.postMessage({action:'export',format,model:m});
 w.onmessage=({data})=>{if(token!==revision)return;if(data.error){stop();$('export-status').textContent=data.error;return;}if(data.model){send(data.model);return;}
  const peg=state.tripodPegWidth.toFixed(2).replace('.','p');
  const suffix=tripodTest?'tripod-joint-test-'+peg+'mm':legsOnly?'tripod-replacement-legs-'+peg+'mm':test||format==='fit'?(state.lightSource==='bambu001'?'bambu-led-001-fit-':'tealight-fit-')+state.fitDiameter.toFixed(1)+'mm':onlyCylinder?design.id+'-cylinder-only':standOnly?state.stand+(state.lightSource==='bambu001'?'-bambu-led-001':'')+(state.stand==='tall-tripod'?'-pegs-'+peg+'mm':''):design.id+'-'+state.stand+(state.lightSource==='bambu001'?'-bambu-led-001':''),ext=format==='3mf'?'3mf':format==='guide'?'txt':format==='fit'||format==='single-stl'?'stl':'zip';
  save(data.chunks,'peggleg-'+suffix+'.'+ext);stop();$('export-status').textContent='File generated. Check your browser downloads.';
 };
 if(tripodTest)w.postMessage({action:'generate',settings:original.settings,options:{tripodTest:true}});
 else if(legsOnly)send({...original,parts:original.parts.filter(p=>p.role==='stand-leg')});
 else if(test||format==='fit')w.postMessage({action:'generate',settings:original.settings,options:{test:true}});
 else if(onlyCylinder)send(cylinderOnly(original));
 else if(standOnly)send({...original,parts:original.parts.filter(p=>p.role!=='cylinder')});else send(original);
}
$('stl').onclick=()=>exportFile('stl');$('three-mf').onclick=()=>exportFile('3mf');$('stand-download').onclick=()=>exportFile('stl',{standOnly:true});$('test-fit').onclick=()=>exportFile('fit');$('print-guide').onclick=()=>exportFile('guide');
$('cylinder-stl').onclick=()=>exportFile('single-stl',{cylinderOnly:true});$('cylinder-three-mf').onclick=()=>exportFile('3mf',{cylinderOnly:true});
$('stand-three-mf').onclick=()=>exportFile('3mf',{standOnly:true});$('fit-three-mf').onclick=()=>exportFile('3mf',{test:true});
$('tripod-joint-test').onclick=()=>exportFile('3mf',{tripodTest:true});$('tripod-legs').onclick=()=>exportFile('3mf',{legsOnly:true});
$('panorama-download').onclick=()=>{if(!art||busy)return;art.canvas.toBlob(blob=>{if(blob)save([blob],'peggleg-'+design.id+'-seamless-landscape.png','image/png');},'image/png');};
window.addEventListener('pagehide',()=>{++revision;stop();preview.dispose();});
selectCollection('christmas');
