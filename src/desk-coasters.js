import {monsteraSections} from './monstera.js';
export const isCoaster=p=>['coaster','coaster-tray','coaster-rack'].includes(p.kind);
export function validateCoaster(p){
 if(!['round','square','hexagon','monstera'].includes(p.coasterShape)||!['flat','recessed'].includes(p.coasterSurface)||!['open','backed'].includes(p.leafBacking))throw Error('Choose an available coaster shape, surface and leaf backing.');
 if(!Number.isInteger(p.coasterCount)||p.coasterCount<4||p.coasterCount>6)throw Error('Choose a set of 4–6 matching coasters.');
 for(const [key,min,max]of [['width',60,160],['depth',60,160],['height',3,8],['coasterRim',.6,2]])if(!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw Error(`Use ${min}–${max} mm for coaster ${key}. Holders need room around the coasters inside the A1 mini limit.`);
 if(p.coasterSurface==='recessed'&&p.height-p.coasterRim<2.4)throw Error('Leave at least 2.4 mm of solid model thickness below the recessed coaster surface. Increase thickness or reduce rim height.');
 if(p.kind==='coaster')p.finish='smooth';p.openwork='none';p.columns=p.rows=1;if(p.coasterShape==='round')p.depth=p.width;
 return p;
}
export function coasterOutline(module,own,p){const {CrossSection:C}=module,w=p.width,d=p.depth;
 if(p.coasterShape==='round')return own(C.circle(w/2,128));
 if(p.coasterShape==='square')return own(own(C.square([w-12,d-12],true)).offset(6,'Round',2,48));
 if(p.coasterShape==='hexagon')return own(new C([Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*w/2,Math.sin(i*Math.PI/3)*d/Math.sqrt(3)])],'NonZero'));
 return monsteraSections(module,own,w,d).outline;
}
export function makeCoasters(module,own,p,{round,ribs,box,add}){
 const {CrossSection:C,Manifold:M}=module,leaf=p.coasterShape==='monstera',sections=leaf?monsteraSections(module,own,p.width,p.depth):null,profile=sections?.outline??coasterOutline(module,own,p),cuts=sections?.holes;
 const floor=p.coasterSurface==='recessed'?p.height-p.coasterRim:p.height;
 let coaster=own(profile.extrude(p.height));
 if(p.coasterSurface==='recessed')coaster=own(coaster.subtract(own(own(profile.offset(-2.4)).extrude(p.coasterRim+.1).translate([0,0,floor]))));
 if(leaf){const backed=p.leafBacking==='backed',start=backed?Math.max(2.4,floor-.8):-.01,detail=backed&&p.coasterSurface==='recessed'?own(cuts.intersect(own(profile.offset(-2.4)))):cuts;coaster=own(coaster.subtract(own(detail.extrude(p.height+.2).translate([0,0,start]))));}
 const gap=p.clearance,wall=p.wall;
 let fit={width:p.width,depth:p.depth,height:p.height,coasterWidth:p.width,coasterDepth:p.depth,coasterThickness:p.height,count:p.coasterCount,clearance:gap,floor};
 if(p.kind==='coaster'){
  for(let i=0;i<p.coasterCount;i++)add(`coaster-${i+1}`,'coaster',coaster,[(i%2-.5)*(p.width+8),(Math.floor(i/2)-(Math.ceil(p.coasterCount/2)-1)/2)*(p.depth+8),0]);
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
