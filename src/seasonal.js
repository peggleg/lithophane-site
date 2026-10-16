import artworkUrl from './assets/seasonal-collection.webp';

// Curated site artwork is public. Visitor photos/previews/models stay browser-local.
export const seasonalDesigns=[
 {id:'cottage',name:'Moonlit manor',season:'Halloween',quadrant:0,description:'A haunted Victorian cottage, moonlit cobblestones and glowing porch pumpkins.'},
 {id:'harvest',name:'Harvest lanterns',season:'Halloween',quadrant:1,description:'Carved pumpkins, curling vines and autumn leaves around an old lantern.'},
 {id:'village',name:'Christmas village',season:'Christmas',quadrant:2,description:'Snow-covered cottages, a stone bridge and a decorated village Christmas tree.'},
 {id:'woodland',name:'Winter woodland',season:'Christmas',quadrant:3,description:'A deer and fawn among snowy firs, holly and a distant woodland cabin.'}
];
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
 const w=image.naturalWidth/2,h=image.naturalHeight/2;
 canvas.width=w;canvas.height=h;
 canvas.getContext('2d').drawImage(image,(design.quadrant%2)*w,Math.floor(design.quadrant/2)*h,w,h,0,0,w,h);
 return canvas;
}
