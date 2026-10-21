import {makeFan,pivotParts,partsZip,fan3mf,ringMesh} from './fan-geometry.js';
self.onmessage=({data})=>{try{
 self.postMessage({progress:10});const {settings:p,photo,format}=data;
 const parts=format==='test'?[...pivotParts(p),...[1,2,3].map(i=>({name:`test-eyelet-${i}`,mesh:ringMesh({height:1.2,outer:6,inner:3.3,steps:64})}))]:makeFan(p,photo);
 self.postMessage({progress:65});const bytes=format==='3mf'?fan3mf(parts):partsZip(parts,p);
 self.postMessage({bytes,progress:100},[bytes.buffer]);
}catch(e){self.postMessage({error:e.message});}};
