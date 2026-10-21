import mountains from './assets/fan-nature-mountains.webp';
import coast from './assets/fan-nature-coast.webp';
import wildlife from './assets/fan-nature-wildlife.webp';

import {fanSamples,sampleCell} from './fan-sample-data.js';
export {fanSamples} from './fan-sample-data.js';

const urls={mountains,coast,wildlife},loaded=new Map();
function loadAtlas(key){
 if(!loaded.has(key)){
  const image=new Image();image.src=urls[key];
  loaded.set(key,image.decode().then(()=>image).catch(error=>{loaded.delete(key);throw error;}));
 }
 return loaded.get(key);
}
export async function drawFanSample(canvas,id){
 const design=fanSamples.find(d=>d.id===id);if(!design)throw Error('Unknown fan sample.');
 const image=await loadAtlas(design.atlas),cell=sampleCell(design,image.naturalWidth,image.naturalHeight);
 canvas.width=1200;canvas.height=600;
 canvas.getContext('2d').drawImage(image,cell.x,cell.y,cell.width,cell.height,0,0,1200,600);
 return canvas;
}
