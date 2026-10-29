import {printLimit} from './printer-settings.js';
import {makeCoasterPlant} from './coaster-plant.js';
import {monsteraSections} from './monstera.js';
export const coasterCounts=kind=>kind==='coaster-plant'?[4,6,8,10]:[4,5,6,8,10];
export const isCoaster=p=>['coaster','coaster-tray','coaster-rack','coaster-plant'].includes(p.kind);
export const regularHexagonDepth=width=>width*Math.sqrt(3)/2;
export function validateCoaster(p){
 if(p.coasterShape==='hexagon')p.depth=regularHexagonDepth(p.width);
 if(!['engraved','ams'].includes(p.leafVeins)||![2,3].includes(p.veinLayers)||!/^#[0-9a-f]{6}$/i.test(p.veinColour))throw Error('Choose engraved or AMS veins, two or three layers, and a vein colour.');
 if(p.coasterShape==='monstera'&&p.leafVeins==='ams'&&p.coasterSurface!=='flat')throw Error('Choose a flat leaf surface for flush AMS veins in the first layers.');
 if(p.kind==='coaster-plant')p.leafHanger=true;else p.leafHanger=p.leafHanger!==false;
 if(p.kind==='coaster-plant'&&p.coasterShape!=='monstera')throw Error('The plant display holds monstera leaves. Choose the monstera shape.');
 if(!['round','square','hexagon','monstera'].includes(p.coasterShape)||!['flat','recessed'].includes(p.coasterSurface)||!['open','backed'].includes(p.leafBacking))throw Error('Choose an available coaster shape, surface and leaf backing.');
 if(!Number.isInteger(p.coasterCount)||!coasterCounts(p.kind).includes(p.coasterCount))throw Error(p.kind==='coaster-plant'?'Choose 4, 6, 8 or 10 leaves for the plant.':'Choose 4, 5, 6, 8 or 10 matching coasters.');
 for(const [key,min,max]of [['width',60,printLimit(p)-10],['depth',p.coasterShape==='hexagon'?regularHexagonDepth(60):60,printLimit(p)-10],['height',3,8],['coasterRim',.6,2]])if(!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw Error(`Use ${min}–${max} mm for coaster ${key}. Holders need room around the coasters inside the selected printer limit.`);
 if(p.coasterSurface==='recessed'&&p.height-p.coasterRim<2.4)throw Error('Leave at least 2.4 mm of solid model thickness below the recessed coaster surface. Increase thickness or reduce rim height.');
 if(p.kind==='coaster')p.finish='smooth';p.openwork='none';p.columns=p.rows=1;if(p.coasterShape==='round')p.depth=p.width;
 return p;
}
export function coasterOutline(module,own,p){const {CrossSection:C}=module,w=p.width,d=p.depth;
 if(p.coasterShape==='round')return own(C.circle(w/2,128));
 if(p.coasterShape==='square')return own(own(C.square([w-12,d-12],true)).offset(6,'Round',2,48));
 if(p.coasterShape==='hexagon')return own(new C([Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*w/2,Math.sin(i*Math.PI/3)*w/2])],'NonZero'));
 return monsteraSections(module,own,w,d).outline;
}
export function makeCoasters(module,own,p,{round,ribs,box,add,reference}){
 const {CrossSection:C,Manifold:M}=module,leaf=p.coasterShape==='monstera',sections=leaf?monsteraSections(module,own,p.width,p.depth):null,profile=sections?.outline??coasterOutline(module,own,p),cuts=sections?.holes;
 const floor=p.coasterSurface==='recessed'?p.height-p.coasterRim:p.height;
 let coaster=own(profile.extrude(p.height));
 if(p.coasterSurface==='recessed')coaster=own(coaster.subtract(own(own(profile.offset(-2.4)).extrude(p.coasterRim+.1).translate([0,0,floor]))));
 if(leaf){const backed=p.leafBacking==='backed',start=backed?Math.max(2.4,floor-.8):-.01,detail=backed&&p.coasterSurface==='recessed'?own(cuts.intersect(own(profile.offset(-2.4)))):cuts;coaster=own(coaster.subtract(own(detail.extrude(p.height+.2).translate([0,0,start]))));}
 // Recess the veins rather than raising them under a drinking glass. At the
 // thinnest permitted floor, omit the engraving to retain 2.4 mm of backing.
 const ams=leaf&&p.leafVeins==='ams',inlayDepth=ams?p.veinLayers*.2:0;
 const veinDepth=leaf&&!ams?Math.min(.4,Math.max(0,floor-2.4)):0;
 if(leaf&&veinDepth>.001){const detail=p.coasterSurface==='recessed'?own(sections.veins.intersect(own(profile.offset(-2.4)))):sections.veins;coaster=own(coaster.subtract(own(detail.extrude(veinDepth+.02).translate([0,0,floor-veinDepth]))));}
 if(leaf&&p.leafHanger)coaster=own(coaster.subtract(own(sections.hangingHole.extrude(p.height+.1).translate([0,0,-.01]))));
 let inlay;if(ams){inlay=own(coaster.intersect(own(sections.veins.extrude(inlayDepth).translate([0,0,p.height-inlayDepth]))));coaster=own(coaster.subtract(inlay));}
 const gap=p.clearance,wall=p.wall;
 let fit={width:p.width,depth:p.depth,height:p.height,coasterWidth:p.width,coasterDepth:p.depth,coasterThickness:p.height,count:p.coasterCount,clearance:gap,floor,veinDepth,inlayDepth};
 if(p.kind==='coaster'){
  const printPose=solid=>own(solid.rotate([180,0,0]).translate([0,0,p.height]));
  for(let i=0;i<p.coasterCount;i++){
   const name=`coaster-${i+1}`,position=[(i%2-.5)*(p.width+8),(Math.floor(i/2)-(Math.ceil(p.coasterCount/2)-1)/2)*(p.depth+8),ams?p.height:0],rotation=ams?[Math.PI,0,0]:[0,0,0];
   add(name,'coaster',ams?printPose(coaster):coaster,position,rotation);
   if(ams){add.colour(name,1,'#47674d');add(`${name}-veins`,'coaster-veins',printPose(inlay),position,rotation);add.colour(name,2,p.veinColour);}
  }
 }else if(p.kind==='coaster-tray'){
  const cavity=own(profile.offset(gap,'Round')),outer=own(cavity.offset(wall,'Round')),h=p.coasterCount*p.height+wall+2;
  let holder=own(contourDetail(module,own,p,outer,h).subtract(own(cavity.extrude(h).translate([0,0,wall]))));
  // Finger windows stop above the solid floor and open at the top; no bridges.
  const access=box(Math.min(32,p.width*.35),p.depth+30,h,0,0,wall+2);holder=own(holder.subtract(access));
  // Hollowing a deeply concave waved outline can leave minute decorative
  // flecks or sealed bubbles. Keep the connected functional tray and fill
  // those bubbles; never export loose surface fragments as extra parts.
  if(p.finish==='wave'){const shells=holder.decompose().map(own);holder=shells.reduce((a,b)=>a.volume()>b.volume()?a:b);}
  add('coaster-stacking-holder','holder',holder,[0,0,0]);const b=holder.boundingBox();fit={...fit,width:b.max[0]-b.min[0],depth:b.max[1]-b.min[1],height:h};
 }else if(p.kind==='coaster-plant'){
  const plant=makeCoasterPlant(module,own,p,profile,sections.hanger,{box,add,decorate:(outline,h)=>contourDetail(module,own,p,outline,h)});fit={...fit,...plant};
  for(const slot of fit.plant.slots){const leafPose=own(coaster.translate([-sections.hanger.x,-sections.hanger.y,-p.height/2]).rotate([slot.angle,0,0]).rotate([0,0,slot.rotation]).translate([slot.x,slot.y,slot.z]));const ref=reference('display-leaf-'+slot.name,'reference-leaf',leafPose,[0,0,0]);ref.colour='#47674d';
   if(ams){const veinsPose=own(inlay.translate([-sections.hanger.x,-sections.hanger.y,-p.height/2]).rotate([slot.angle,0,0]).rotate([0,0,slot.rotation]).translate([slot.x,slot.y,slot.z]));ref.veins=reference('display-veins-'+slot.name,'reference-veins',veinsPose,[0,0,0]);ref.veins.colour=p.veinColour;}
   fit.references.push(ref);}
  const bounds={min:[...fit.plant.potBounds.min],max:[...fit.plant.potBounds.max]};for(const ref of fit.references)for(let a=0;a<3;a++){bounds.min[a]=Math.min(bounds.min[a],ref.bounds.min[a]);bounds.max[a]=Math.max(bounds.max[a],ref.bounds.max[a]);}fit.width=bounds.max[0]-bounds.min[0];fit.depth=bounds.max[1]-bounds.min[1];fit.height=bounds.max[2]-bounds.min[2];
 }else{
  const w=p.width+2*gap+2*wall,slot=p.height+2*gap,d=p.coasterCount*slot+(p.coasterCount+1)*wall,h=24,base=round(w,d,3),features=[own(base.extrude(wall))];
  // Slots use the FULL coaster thickness including its rim, not just its floor.
  for(let i=0;i<=p.coasterCount;i++)features.push(box(w-2*wall,wall,h-wall+.01,0,-d/2+wall/2+i*(slot+wall),wall-.01));
  features.push(box(wall,d,h-wall+.01,-w/2+wall/2,0,wall-.01),box(wall,d,h-wall+.01,w/2-wall/2,0,wall-.01));
  let holder=own(own(M.union(features)).intersect(own(base.extrude(h))));holder=ribs(holder,w,d,h);add('coaster-upright-rack','holder',holder,[0,0,0]);const b=holder.boundingBox();fit={...fit,width:b.max[0]-b.min[0],depth:b.max[1]-b.min[1],height:h,slotWidth:slot,slotCentres:Array.from({length:p.coasterCount},(_,i)=>-d/2+wall+slot/2+i*(slot+wall)),restHeight:wall};
 }
 return fit;
}

// Follow the actual holder outline, including hexagons and leaves, rather than
// placing rectangular-wall ribs in empty space beside a shaped holder.
function contourDetail(module,own,p,profile,h){
 const {CrossSection:C,Manifold:M}=module,body=own(profile.extrude(h));if(p.finish==='smooth')return body;
 const adjustable=['ribbed','scalloped','wave'].includes(p.finish),depth=adjustable?p.detailDepth:p.finish==='fluted'?.55:.4,pitch=adjustable?p.detailSpacing:p.finish==='fluted'?4:7,features=[];
 for(const poly of profile.toPolygons()){
  let length=0,area=0;const edges=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);edges.push({a,b,len,start:length});length+=len;area+=a[0]*b[1]-b[0]*a[1];}
  const n=Math.max(8,Math.floor(length/pitch));for(let i=0;i<n;i++){const s=(i+.5)*length/n,e=edges.find(e=>s<=e.start+e.len),t=(s-e.start)/e.len,nx=Math.sign(area)*(e.b[1]-e.a[1])/e.len,ny=-Math.sign(area)*(e.b[0]-e.a[0])/e.len,x=e.a[0]+t*(e.b[0]-e.a[0]),y=e.a[1]+t*(e.b[1]-e.a[1]);
   let section,radius=0,offset;
   if(p.finish==='slatted'||p.finish==='ribbed'){const radial=p.finish==='slatted'?1.3:depth+.4;section=own(own(C.square([radial-.6,p.finish==='slatted'?2.6:1.4],true)).offset(.3,'Round',2,12).rotate(Math.atan2(ny,nx)*180/Math.PI));offset=p.finish==='slatted'?-.25:(depth-.4)/2;}
   else{radius=p.finish==='fluted'?.8:p.finish==='scalloped'?Math.min(pitch*.42,depth*1.5):Math.min(pitch*.38,depth*.65+.15);section=own(C.circle(radius,20));offset=depth-radius;}
   const feature=own(section.extrude(h-2,p.finish==='wave'?16:0).translate([x+nx*offset,y+ny*offset,1]));
   features.push(p.finish==='wave'?own(feature.warp(v=>{const wave=Math.sin((v[2]-1)/(h-2)*Math.PI*2)*Math.min(1.5,pitch*.16);v[0]-=ny*wave;v[1]+=nx*wave;})):feature);
  }
 }
 const band=own(own(profile.offset(depth+.05)).subtract(own(profile.offset(-.3)))),clip=own(band.extrude(h));return own(body.add(own(own(M.union(features)).intersect(clip))));
}
