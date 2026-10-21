import init from 'manifold-3d/manifold';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import sans from './fonts/NotoSans-Bold.ttf?url';
import serif from './fonts/NotoSerif-Bold.ttf?url';
import rounded from './fonts/Nunito-ExtraBold.ttf?url';
import {generateTextModel} from './text-geometry.js';
import {solid3mf,textStlZip,textInstructions} from './solid-export.js';
import {stlBytes} from './geometry.js';
import {strToU8} from './zip.js';
self.onmessage=async({data})=>{try{
 if(data.action==='generate'){
  self.postMessage({progress:10});const module=await init({locateFile:()=>wasmUrl});module.setup();
  const response=await fetch({sans,serif,rounded}[data.settings.font]);if(!response.ok)throw Error('Font could not be loaded. Please retry.');
  const model=generateTextModel(module,await response.arrayBuffer(),data.settings);
  self.postMessage({model},model.parts.flatMap(p=>[p.mesh.vertices.buffer,p.mesh.faces.buffer]));
 }else{
  self.postMessage({progress:20});const {model,format}=data;
  const chunks=format==='3mf'?solid3mf(model):format==='guide'?[strToU8(textInstructions(model))]:model.parts.length>1?textStlZip(model):[stlBytes(model.parts[0].mesh)];
  self.postMessage({chunks},chunks.map(p=>p.buffer));
 }
}catch(e){self.postMessage({error:e.message||'Could not build this design.'});}};
