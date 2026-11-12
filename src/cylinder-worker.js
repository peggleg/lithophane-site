import init from 'manifold-3d/manifold';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import {buildCylinderModel} from './cylinder-geometry.js';
import {solid3mf,cylinderZip,cylinderGuide} from './cylinder-export.js';
import {stlBytes} from './geometry.js';
import {strToU8} from './zip.js';
let kernel;
self.onmessage=async({data})=>{try{
 if(data.action==='generate'){
  kernel??=init({locateFile:()=>wasmUrl}).then(m=>{m.setup();return m;});
  const model=buildCylinderModel(await kernel,data.settings,data.tones,data.cols,data.rows,data.options);
  self.postMessage({model});
 }else{
  const chunks=data.format==='3mf'?solid3mf(data.model):data.format==='guide'?[strToU8(cylinderGuide(data.model))]:data.format==='fit'||data.format==='single-stl'?[stlBytes(data.model.parts[0].mesh)]:cylinderZip(data.model);
  self.postMessage({chunks});
 }
}catch(e){self.postMessage({error:e.message||'Could not create this cylinder.'});}};
