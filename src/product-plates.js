import {printerSpec} from './printer-settings.js';
// Keep supplied printing orientations. Bambu's automatic arranger can omit large
// thin-backed parts, so product projects include explicit, non-overlapping plates.
export function productPlates(entries,settings){
 const size=printerSpec(settings).bed,colourPlates=settings.kind==='hooks'&&settings.colourMode!=='ams',usableX=settings.kind==='hooks'&&settings.colourMode==='ams'?size-48:size,usableY=size;
 const margin=Math.max(0,Math.min(settings.kind==='hooks'?10:5,...entries.flatMap(p=>[0,1].map(a=>(size-p.bounds.max[a]+p.bounds.min[a])/2)))),gap=settings.kind==='hooks'?20:6,plates=[],placed=[];
 for(const p of [...entries].sort((a,b)=>b.printSize[1]-a.printSize[1]||b.printSize[0]-a.printSize[0])){
  const [w,d]=[0,1].map(a=>p.bounds.max[a]-p.bounds.min[a]);let at;
  for(let i=0;i<plates.length;i++){const pl=plates[i];if(colourPlates&&pl.colour!==p.extruder)continue;let {x,y,row}=pl;if(x+w>usableX-margin+.001){x=margin;y+=row+gap;row=0;}if(y+d>usableY-margin+.001)continue;at={i,x,y,row};break;}
  if(!at){at={i:plates.length,x:margin,y:margin,row:0};plates.push({x:margin,y:margin,row:0,items:[],...(colourPlates?{colour:p.extruder}:{})});}
  const pl=plates[at.i];pl.x=at.x+w+gap;pl.y=at.y;pl.row=Math.max(at.row,d);pl.items.push(p.id);placed.push({...p,plate:at.i,localX:at.x-p.bounds.min[0],localY:at.y-p.bounds.min[1]});
 }
 const columns=Math.ceil(Math.sqrt(plates.length));
 return {plates,entries:placed.map(p=>({...p,x:p.localX+(p.plate%columns)*size*1.2,y:p.localY-Math.floor(p.plate/columns)*size*1.2}))};
}
