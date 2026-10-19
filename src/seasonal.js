import artworkUrl from './assets/holiday-postcards.png';
import {seasonalDesigns} from './postcards.js';
export {seasonalDesigns} from './postcards.js';

// Curated site artwork is public. Visitor photos/previews/models stay browser-local.
let artworkPromise;
function loadArtwork(){
 if(!artworkPromise){
  const image=new Image();image.src=artworkUrl;
  artworkPromise=image.decode().then(()=>image).catch(error=>{artworkPromise=null;throw error;});
 }
 return artworkPromise;
}
export async function drawSeasonal(canvas,id){
 const design=seasonalDesigns.find(d=>d.id===id);
 if(!design)throw Error('Unknown seasonal design.');
 const image=await loadArtwork();
 const w=image.naturalWidth/3,h=image.naturalHeight/4;
 canvas.width=630;canvas.height=888;
 canvas.getContext('2d').drawImage(image,design.column*w,design.row*h,w,h,0,0,630,888);
 return canvas;
}
