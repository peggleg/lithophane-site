import original from './assets/holiday-postcards.png';
import valentine from './assets/valentine-portraits.png';
import newyear from './assets/newyear-portraits.png';
import mother from './assets/mother-portraits.png';
import father from './assets/father-portraits.png';
import thanksgiving from './assets/thanksgiving-portraits.png';
import existingLandscapes from './assets/land-existing.png';
import autumnLove from './assets/land-autumn-love.png';
import newyearMother from './assets/land-newyear-mother.png';
import fatherThanks from './assets/land-father-thanks.png';
import {seasonalDesigns,sampleSize,artworkCell} from './postcards.js';
export {seasonalDesigns} from './postcards.js';

const atlases={original,valentine,newyear,mother,father,thanksgiving,
 'land-existing':existingLandscapes,'land-autumn-love':autumnLove,
 'land-newyear-mother':newyearMother,'land-father-thanks':fatherThanks};
// Load only artwork needed for the active collection, sharing decoded sheets.
const artworkPromises=new Map();
function loadArtwork(atlas){
 if(!artworkPromises.has(atlas)){
  const image=new Image();image.src=atlases[atlas];
  artworkPromises.set(atlas,image.decode().then(()=>image).catch(error=>{artworkPromises.delete(atlas);throw error;}));
 }
 return artworkPromises.get(atlas);
}
export async function drawSeasonal(canvas,id){
 const design=seasonalDesigns.find(d=>d.id===id);
 if(!design)throw Error('Unknown seasonal design.');
 const image=await loadArtwork(design.atlas);
 const cell=artworkCell(design,image.naturalWidth,image.naturalHeight),size=sampleSize(design);
 canvas.width=size.width*6;canvas.height=size.height*6;
 canvas.getContext('2d').drawImage(image,cell.x,cell.y,cell.width,cell.height,0,0,canvas.width,canvas.height);
 return canvas;
}
