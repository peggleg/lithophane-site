import init from 'manifold-3d/manifold';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import fontUrl from './fonts/DancingScript.ttf?url';
import {generateOrnament} from './ornament-geometry.js';
import {solid3mf,ornamentZip,ornamentGuide} from './ornament-export.js';
import {strToU8} from './zip.js';
self.onmessage=async({data})=>{try{if(data.action==='generate'){const [m,font]=await Promise.all([init({locateFile:()=>wasmUrl}),fetch(fontUrl).then(r=>{if(!r.ok)throw Error('Could not load the lettering font.');return r.arrayBuffer();})]);m.setup();const model=generateOrnament(m,font,data.settings);self.postMessage({model});}else{const chunks=data.format==='3mf'?solid3mf(data.model):data.format==='guide'?[strToU8(ornamentGuide(data.model))]:ornamentZip(data.model);self.postMessage({chunks},chunks.map(p=>p.buffer));}}catch(e){self.postMessage({error:e.message||'Could not build this ornament.'});}};
