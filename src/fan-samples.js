import mountains from './assets/fan-nature-mountains.webp';
import coast from './assets/fan-nature-coast.webp';
import wildlife from './assets/fan-nature-wildlife.webp';
import snoopyBeach from './assets/cylinders/snoopy-random-beach-2026-11-21.webp';
import snoopyGingerbread from './assets/cylinders/snoopy-xmas-gingerbread-2026-11-21.webp';
import christmasFarm from './assets/cylinders/christmas-the-christmas-tree-farm-2026-11-04.webp';
import christmasMarket from './assets/cylinders/christmas-the-snowy-christmas-market-2026-11-06.webp';
import cartoonDragon from './assets/cylinders/cartoons-dragon-baker-panorama-2026-11-16.webp';
import cartoonFox from './assets/cylinders/cartoons-fox-astronaut-panorama-2026-11-16.webp';
import capySprings from './assets/cylinders/collection-capybaras-family-soaking-in-a-snowy-hot-spring-cylinder-2026-11-26.webp';
import capyPicnic from './assets/cylinders/collection-capybaras-capybara-garden-picnic-cylinder-2026-11-26.webp';
import highlandLoch from './assets/cylinders/collection-highland-cows-calf-beside-a-highland-loch-cylinder-2026-11-26.webp';
import highlandBakers from './assets/cylinders/collection-highland-cows-cow-baker-making-shortbread-cylinder-2026-11-26.webp';

import {fanSamples,sampleCell} from './fan-sample-data.js';
export {fanSamples} from './fan-sample-data.js';

const urls={mountains,coast,wildlife,'snoopy-beach':snoopyBeach,'snoopy-gingerbread':snoopyGingerbread,'christmas-tree-farm':christmasFarm,'christmas-market':christmasMarket,'cartoon-dragon-baker':cartoonDragon,'cartoon-fox-astronaut':cartoonFox,'capybara-snowy-springs':capySprings,'capybara-picnic':capyPicnic,'highland-loch':highlandLoch,'highland-bakers':highlandBakers},loaded=new Map();
function loadAtlas(key){
 if(!loaded.has(key)){
  const url=urls[key];if(!url)throw Error('Fan artwork is unavailable.');
 const image=new Image();image.src=url;
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
