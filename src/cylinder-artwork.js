import {periodicTones,seamMetrics} from './cylinder-texture.js';
import {cylinderCollections,cylinderCatalogue} from './cylinder-catalogue.js';

const assets=import.meta.glob('./assets/cylinders/*.webp',{eager:true,query:'?url',import:'default'});
export {cylinderCollections};
export const cylinderDesigns=cylinderCatalogue.map(design=>({...design,url:assets[`./assets/cylinders/${design.asset}`]}));
const cache=new Map();
export async function cylinderArtwork(design,width=1024,height=341,brightness=0){
 if(typeof design==='string')design=cylinderDesigns.find(d=>d.id===design);
 if(!design?.url)throw Error('Could not find this cylinder panorama.');
 let promise=cache.get(design.url);
 if(!promise){const image=new Image();image.src=design.url;promise=image.decode().then(()=>image).catch(e=>{cache.delete(design.url);throw e;});cache.set(design.url,promise);}
 const image=await promise,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),h=image.naturalHeight/(design.rows||2);
 ctx.drawImage(image,0,design.row*h,image.naturalWidth,h,0,0,width,height);
 const rgba=ctx.getImageData(0,0,width,height),source=new Uint8Array(width*height);
 for(let i=0;i<source.length;i++)source[i]=Math.round(rgba.data[i*4]*.2126+rgba.data[i*4+1]*.7152+rgba.data[i*4+2]*.0722);
 const tones=periodicTones(source,width,height,brightness);
 for(let i=0;i<tones.length;i++){rgba.data[i*4]=rgba.data[i*4+1]=rgba.data[i*4+2]=tones[i];rgba.data[i*4+3]=255;}
 ctx.putImageData(rgba,0,0);return {canvas,tones,width,height,seam:seamMetrics(tones,width,height)};
}
