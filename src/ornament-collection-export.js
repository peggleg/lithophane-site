import {ornamentCollections,releasedOrnamentCollections,validateOrnament} from './ornament-settings.js';
import {generateOrnament} from './ornament-geometry.js';
import {ornament3mf} from './ornament-export.js';
import {stlBytes} from './geometry.js';
import {zipParts} from './zip.js';

// Preserve the displayed model name while keeping archives safe to extract on Windows, macOS and Linux.
export function collectionFileName(label,used){
 let base=label.normalize('NFC').replace(/[\x00-\x1f<>:"/\\|?*]/g,' ').trim().replace(/\s+/g,'_').replace(/[._]+$/,'').slice(0,100).replace(/[._]+$/,'');
 if(!base)base='Ornament';
 if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(base))base=`${base}_ornament`;
 let name=base,n=2;while(used.has(name.toLocaleLowerCase('en-US')))name=`${base}_(${n++})`;
 used.add(name.toLocaleLowerCase('en-US'));return name;
}

// Build every design with the same settings; a failed design stops the entire download.
export function buildOrnamentCollectionZip(module,font,settings,onProgress=()=>{}){
 const selected=validateOrnament(settings),collection=ornamentCollections[selected.collection];
 if(!releasedOrnamentCollections.includes(selected.collection))throw Error('Choose an available collection.');
 const files={},usedNames=new Set();
 for(const [index,[design,label]] of collection.designs.entries()){
  onProgress(index+1,collection.designs.length,label);
  try{
   const model=generateOrnament(module,font,{...selected,design});
   const name=collectionFileName(label,usedNames);
   files[`STL/${name}.stl`]=stlBytes(model.singleColourMesh);
   files[`3MF/${name}.3mf`]=ornament3mf(model);
  }catch(error){throw Error(`Could not build ${label}: ${error.message||error}`);}
 }
 return zipParts(files);
}
