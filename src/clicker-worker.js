import {filamentParts} from './filament.js';
import init from 'manifold-3d/manifold';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import {fonts} from './font-catalogue.js';
import {generateClickerModel} from './clicker-geometry.js';
import {clickerStlZip,clickerGuide,solid3mf} from './clicker-export.js';
import {generatePebbleBatch} from './clicker-batch.js';
import {strToU8} from './zip.js';
self.onmessage=async({data})=>{try{
 if(data.action==='generate'||data.action==='batch'){
  self.postMessage({progress:10});const module=await init({locateFile:()=>wasmUrl});module.setup();
  const urls=import.meta.glob('./fonts/*.ttf',{query:'?url',import:'default',eager:true});const file=fonts[data.settings.font]?.file;if(!file)throw Error('Choose an available font.');
  const response=await fetch(urls['./fonts/'+file+'.ttf']);if(!response.ok)throw Error('Could not load the font.');
  const buffer=await response.arrayBuffer();
  if(data.action==='batch'){const model=generatePebbleBatch(module,buffer,data.settings,data.text,progress=>self.postMessage({progress}));if(data.format==='estimate'){self.postMessage({filament:filamentParts(model.parts,'clicker')});return;}const chunks=data.format==='3mf'?solid3mf(model):clickerStlZip(model);self.postMessage({chunks,filament:filamentParts(model.parts,'clicker')},chunks.map(c=>c.buffer));return;}
  const model=generateClickerModel(module,buffer,data.settings);self.postMessage({model},model.parts.flatMap(part=>[part.mesh.vertices.buffer,part.mesh.faces.buffer]));
 }else{const chunks=data.format==='3mf'?solid3mf(data.model):data.format==='guide'?[strToU8(clickerGuide(data.model))]:clickerStlZip(data.model);self.postMessage({chunks},chunks.map(c=>c.buffer));}
 }catch(e){self.postMessage({error:e.message||'Could not prepare the clicker.'});}};
