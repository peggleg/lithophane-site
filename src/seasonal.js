import added202611020 from './assets/seasonal-christmas-snowbound-toymaker-2026-11-02.png';
import added202611021 from './assets/seasonal-easter-watermill-2026-11-02.png';
import added202611022 from './assets/seasonal-halloween-raven-belltower-2026-11-02.png';
import added202611023 from './assets/seasonal-valentine-tandem-canal-2026-11-02.png';
import added202611024 from './assets/seasonal-newyear-midnight-station-2026-11-02.png';
import added202611025 from './assets/seasonal-mother-otter-iris-pool-2026-11-02.png';
import added202611026 from './assets/seasonal-father-kite-afternoon-2026-11-02.png';
import added202611027 from './assets/seasonal-thanksgiving-covered-bridge-2026-11-02.png';
import added202611010 from './assets/seasonal-christmas-carousel-2026-11-01.png';
import added202611011 from './assets/seasonal-easter-orchard-lambs-2026-11-01.png';
import added202611012 from './assets/seasonal-halloween-owl-apothecary-2026-11-01.png';
import added202611013 from './assets/seasonal-valentine-heartwood-foxes-2026-11-01.png';
import added202611014 from './assets/seasonal-newyear-harbour-first-light-2026-11-01.png';
import added202611015 from './assets/seasonal-mother-elephant-trunk-2026-11-01.png';
import added202611016 from './assets/seasonal-father-stargazing-2026-11-01.png';
import added202611017 from './assets/seasonal-thanksgiving-cider-press-2026-11-01.png';
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

const atlases={
 'christmas-snowbound-toymaker-2026-11-02':added202611020,
 'easter-watermill-2026-11-02':added202611021,
 'halloween-raven-belltower-2026-11-02':added202611022,
 'valentine-tandem-canal-2026-11-02':added202611023,
 'newyear-midnight-station-2026-11-02':added202611024,
 'mother-otter-iris-pool-2026-11-02':added202611025,
 'father-kite-afternoon-2026-11-02':added202611026,
 'thanksgiving-covered-bridge-2026-11-02':added202611027,
 original,valentine,newyear,mother,father,thanksgiving,
 'land-existing':existingLandscapes,'land-autumn-love':autumnLove,
 'land-newyear-mother':newyearMother,'land-father-thanks':fatherThanks,
 'christmas-carousel-2026-11-01':added202611010,
 'easter-orchard-lambs-2026-11-01':added202611011,
 'halloween-owl-apothecary-2026-11-01':added202611012,
 'valentine-heartwood-foxes-2026-11-01':added202611013,
 'newyear-harbour-first-light-2026-11-01':added202611014,
 'mother-elephant-trunk-2026-11-01':added202611015,
 'father-stargazing-2026-11-01':added202611016,
 'thanksgiving-cider-press-2026-11-01':added202611017};
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
