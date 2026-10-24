import init from 'manifold-3d/manifold';
import fontUrl from './fonts/Nunito-ExtraBold.ttf?url';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import {generateDeskModel} from './desk-geometry.js';
import {deskStlZip,deskGuide,solid3mf} from './desk-export.js';
import {strToU8} from './zip.js';
self.onmessage=async({data})=>{try{self.postMessage({progress:15});if(data.action==='generate'){const m=await init({locateFile:()=>wasmUrl});m.setup();const model=generateDeskModel(m,data.settings,data.settings.lidText?await fetch(fontUrl).then(r=>{if(!r.ok)throw Error('Could not load the lid font.');return r.arrayBuffer();}):undefined);self.postMessage({model},model.parts.flatMap(p=>[p.mesh.vertices.buffer,p.mesh.faces.buffer]));}else{const chunks=data.format==='3mf'?solid3mf(data.model):data.format==='guide'?[strToU8(deskGuide(data.model))]:deskStlZip(data.model);self.postMessage({chunks},chunks.map(p=>p.buffer));}}catch(e){self.postMessage({error:e.message||'Could not build your desk item.'});}};
