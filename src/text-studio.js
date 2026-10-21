import {createSymbolEditor} from './symbol-editor.js';
import './theme.js';
import './text-studio.css';
import {textDefaults} from './text-settings.js';
import {createTextPreview} from './text-preview.js';
const $=id=>document.getElementById(id),kind=document.body.dataset.generator,defaults=textDefaults[kind];
const fields=['line1','line2','font','width','height','base','relief','size','mode','align',...(kind==='keyring'?['shape','hole']:['stand'])];
let editor=null;
let worker=null,timer=null,model=null,generation=0,preview=null,busy=false;
try{preview=createTextPreview($('model-canvas'));}catch{$('model-preview').textContent='Interactive preview needs WebGL. You can still generate and download your design.';}
function settings(){const result={...defaults};for(const id of fields)result[id]=$(id).type==='checkbox'?$(id).checked:$(id).type==='number'?Number($(id).value):$(id).value;if(kind==='keyring'&&result.shape==='circle')result.height=result.width;result.symbols=editor?.get()||[];return result;}
function enable(){for(const id of ['stl','three-mf','print-guide'])$(id).disabled=!model||busy;}
function stop(report=false){clearTimeout(timer);worker?.terminate();worker=null;busy=false;$('progress').hidden=true;$('cancel').hidden=true;if(report)$('export-status').textContent='Cancelled. Change a setting to rebuild your design.';enable();}
function fail(message){model=null;preview?.setModel(null);$('feedback').textContent=message;$('dimensions').textContent='—';$('fitted-size').textContent='—';$('part-count').textContent='—';stop();}
function generate(){
 try{editor?.refresh();}catch(e){fail(e.message);return;}
 const token=++generation;stop();model=null;enable();preview?.setModel(null);$('feedback').textContent='Preparing your design…';for(const id of ['dimensions','fitted-size','part-count'])$(id).textContent='—';
 if(kind==='keyring'){$('height').disabled=$('shape').value==='circle';if($('height').disabled)$('height').value=$('width').value;}
 timer=setTimeout(()=>{busy=true;enable();$('progress').hidden=false;$('progress').value=5;$('cancel').hidden=false;
 worker=new Worker(new URL('./text-worker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{if(token!==generation)return;if(data.error){fail(data.error);return;}if(data.progress)$('progress').value=data.progress;
  if(data.model){model=data.model;stop();preview?.setModel(model);$('dimensions').textContent=`${model.width} × ${model.height} × ${model.settings.base+(model.settings.mode==='raised'?model.settings.relief:0)} mm`;$('fitted-size').textContent=model.fontSize+' mm';$('part-count').textContent=model.parts.length;$('feedback').textContent=`Design ready. ${model.warnings.join(' ')}`;$('stl').textContent=model.parts.length>1?'STL parts ZIP ↓':'Download STL ↓';$('export-status').textContent='';}
 };worker.onerror=()=>{if(token===generation)fail('Could not generate the design. Retry, or use shorter text.');};worker.postMessage({action:'generate',settings:settings()});},250);
}
function download(chunks,name,type){const url=URL.createObjectURL(new Blob(chunks,{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function start(format){if(!model||busy)return;stop();busy=true;enable();$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;$('export-status').textContent='Preparing download locally…';const current=model;worker=new Worker(new URL('./text-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(data.error){stop();$('export-status').textContent=data.error;}if(data.progress)$('progress').value=data.progress;if(data.chunks){const extension=format==='guide'?'txt':format==='3mf'?'3mf':current.parts.length>1?'zip':'stl';download(data.chunks,`${kind}-${current.width}x${current.height}.${extension}`,extension==='zip'?'application/zip':extension==='txt'?'text/plain':extension==='3mf'?'model/3mf':'model/stl');stop();$('export-status').textContent='Downloaded. Inspect the toolpaths and print guide before printing.';}};worker.onerror=()=>{stop();$('export-status').textContent='Download failed. Please try again.';};worker.postMessage({action:'export',model:current,format});}
fields.forEach(id=>$(id).addEventListener('input',generate));
function colours(){preview?.setColours({base:$('base-colour').value,text:$('text-colour').value});}
for(const id of ['base-colour','text-colour'])$(id).addEventListener('input',colours);
$('parts-view').addEventListener('change',()=>preview?.setParts($('parts-view').checked));$('parts-view').parentElement.hidden=kind!=='nameplate';
$('reset-view').onclick=()=>preview?.reset();$('top-view').onclick=()=>preview?.reset(true);
$('stl').onclick=()=>start('stl');$('three-mf').onclick=()=>start('3mf');$('print-guide').onclick=()=>start('guide');
$('cancel').onclick=()=>{++generation;stop(true);};
function reset(){for(const id of fields)if($(id).type==='checkbox')$(id).checked=defaults[id];else $(id).value=defaults[id];$('base-colour').value=kind==='keyring'?'#c59772':'#77916c';$('text-colour').value='#f4eddb';$('parts-view').checked=false;preview?.setParts(false);colours();generate();}
if(kind==='keyring')editor=createSymbolEditor(settings,generate);
$('reset').onclick=()=>{editor?.reset();reset();};window.addEventListener('pagehide',()=>{++generation;stop();preview?.dispose();model=null;});reset();
