import {ornamentCollections,releasedOrnamentCollections,validateOrnament} from './ornament-settings.js';
import {generateOrnament} from './ornament-geometry.js';
import {ornament3mf} from './ornament-export.js';
import {stlBytes} from './geometry.js';
import {zipParts} from './zip.js';

// Build every design with the same settings; a failed design stops the entire download.
export function buildOrnamentCollectionZip(module,font,settings,onProgress=()=>{}){
 const selected=validateOrnament(settings),collection=ornamentCollections[selected.collection];
 if(!releasedOrnamentCollections.includes(selected.collection))throw Error('Choose an available collection.');
 const files={};
 for(const [index,[design,label]] of collection.designs.entries()){
  onProgress(index+1,collection.designs.length,label);
  try{
   const model=generateOrnament(module,font,{...selected,design});
   const name=`${String(index+1).padStart(2,'0')}-${design}`;
   files[`STL/${name}.stl`]=stlBytes(model.singleColourMesh);
   files[`3MF/${name}.3mf`]=ornament3mf(model);
  }catch(error){throw Error(`Could not build ${label}: ${error.message||error}`);}
 }
 return zipParts(files);
}
