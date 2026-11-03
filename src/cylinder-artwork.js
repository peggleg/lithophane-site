import {periodicTones,seamMetrics} from './cylinder-texture.js';

const assets=import.meta.glob('./assets/cylinders/*.webp',{eager:true,query:'?url',import:'default'});
const collections=[
 ['christmas','Christmas','Christmas Mountains','Christmas Village'],
 ['easter','Easter','Daffodil Stream','Blossom Bridge'],
 ['halloween','Halloween','Moonlit Manor','Pumpkin Woodland'],
 ['valentine','Valentine’s Day','The Rose Garden','Swans at Dusk'],
 ['newyear','New Year','Midnight by the Lake','The Hilltop Observatory'],
 ['mother','Mother’s Day','The Cottage Garden','Blossom Meadow'],
 ['father','Father’s Day','The Lakeside Canoe','The Mountain Railway'],
 ['thanksgiving','Thanksgiving','Harvest Farm','The Autumn Watermill'],
];
export const cylinderCollections=collections.map(([id,name])=>({id,name}));
export const cylinderDesigns=collections.flatMap(([collection,season,...names])=>names.map((name,row)=>({id:collection+'-'+(row+1),collection,season,name,row,orientation:'landscape',url:assets[`./assets/cylinders/${collection}.webp`]})));
const cache=new Map();
export async function cylinderArtwork(design,width=1024,height=341,brightness=0){
 if(typeof design==='string')design=cylinderDesigns.find(d=>d.id===design);
 if(!design?.url)throw Error('Could not find this cylinder panorama.');
 let promise=cache.get(design.url);
 if(!promise){const image=new Image();image.src=design.url;promise=image.decode().then(()=>image).catch(e=>{cache.delete(design.url);throw e;});cache.set(design.url,promise);}
 const image=await promise,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),h=image.naturalHeight/2;
 ctx.drawImage(image,0,design.row*h,image.naturalWidth,h,0,0,width,height);
 const rgba=ctx.getImageData(0,0,width,height),source=new Uint8Array(width*height);
 for(let i=0;i<source.length;i++)source[i]=Math.round(rgba.data[i*4]*.2126+rgba.data[i*4+1]*.7152+rgba.data[i*4+2]*.0722);
 const tones=periodicTones(source,width,height,brightness);
 for(let i=0;i<tones.length;i++){rgba.data[i*4]=rgba.data[i*4+1]=rgba.data[i*4+2]=tones[i];rgba.data[i*4+3]=255;}
 ctx.putImageData(rgba,0,0);return {canvas,tones,width,height,seam:seamMetrics(tones,width,height)};
}
