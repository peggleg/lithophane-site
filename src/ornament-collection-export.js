import {ornamentCollections,releasedOrnamentCollections,validateOrnament} from './ornament-settings.js';
import {generateOrnament} from './ornament-geometry.js';
import {ornament3mf,ornamentFiles} from './ornament-export.js';
import {strToU8,zipParts} from './zip.js';

// Build every design with the same settings; a failed design stops the entire download.
export function buildOrnamentCollectionZip(module,font,settings,onProgress=()=>{}){
 const selected=validateOrnament(settings),collection=ornamentCollections[selected.collection];
 if(!releasedOrnamentCollections.includes(selected.collection))throw Error('Choose an available collection.');
 const files={'README.txt':strToU8(`${collection.name} ornament collection\nEach folder contains an individual Bambu 3MF project, STL files and print guide.\nAll designs use the selected ${selected.diameter} mm size and current settings.\n`)};
 for(const [index,[design,label]] of collection.designs.entries()){
  onProgress(index+1,collection.designs.length,label);
  try{
   const model=generateOrnament(module,font,{...selected,design});
   const folder=`${String(index+1).padStart(2,'0')}-${design}/`;
   for(const [name,bytes] of Object.entries(ornamentFiles(model)))files[folder+name]=bytes;
   files[folder+design+'.3mf']=ornament3mf(model);
  }catch(error){throw Error(`Could not build ${label}: ${error.message||error}`);}
 }
 return zipParts(files);
}
