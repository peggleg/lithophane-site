import {makeStorageLabel} from './storage-labels.js';
import {drawerStyle} from './drawer-finishes.js';
import {makeCupboard} from './cupboard-geometry.js';
import {connectDrawerCase,addDrawerKeys} from './storage-connectors.js';
import {isHome} from './home-settings.js';
import {makeHomeItems} from './home-geometry.js';
import {makeBin} from './bin-geometry.js';
import {drawerInsertActive,drawerCornerRadius,drawerInsertLayout,addDrawerInsertRails,drawerSheetSolid} from './drawer-inserts.js';
import {isCoaster,makeCoasters} from './desk-coasters.js';
import {isStorage,makeStorage} from './desk-storage.js';
import {makeScrewContainer} from './desk-screw.js';
import {carveOpenwork} from './desk-openwork.js';
import {validateDeskSettings,trayCells,drawerStacking,finishInset,adjustableFinish,standaloneTray,binDimensions} from './desk-settings.js';
export function generateDeskModel(module,input,fontBuffer){
 const p=validateDeskSettings(input),{CrossSection:C,Manifold:M}=module,owned=[];const own=x=>(owned.push(x),x);
 const round=(w,d,r=Math.min(9,w/5,d/5))=>own(own(C.square([w-2*r,d-2*r],true)).offset(r,'Round',2,48));
 const box=(w,d,h,x=0,y=0,z=0)=>own(own(C.square([w,d],true)).extrude(h).translate([x,y,z]));
 const circular=['pot','bin','screw','roll','cotton','toothpick'].includes(p.kind)&&p.shape==='round';
 const outline=(w,d)=>circular?own(C.circle(w/2,128).rotate(360/256)):round(w,d);
 const parts=[];let surface=p;
 function add(name,role,solid,assembly,rotation=[0,0,0]){
  const repair=p.kind==='drawers'&&p.drawerFinishMode==='mixed'||p.kind==='cupboard'||p.kind==='drawers'&&p.drawerConnectors!=='none'||isHome(p)||drawerInsertActive(p)||p.kind==='bin'||p.kind==='coaster-plant'||adjustableFinish(p)||(p.openwork!=='none'&&!['case','inner-box'].includes(role)),prepared=repair?own(solid.setTolerance(.0001)):solid,clean=own(prepared.simplify(.001));if(clean.status()!=='NoError'||clean.isEmpty()||clean.volume()<=0)throw Error('Could not make a closed desk part. Adjust the dimensions.');
  const bounds=clean.boundingBox(),size=bounds.max.map((v,i)=>v-bounds.min[i]);if(size.some(v=>v>170.001))throw Error('A finished part exceeds the 170 mm A1 mini design limit. Reduce its dimensions.');
  let mesh=clean.getMesh();if(repair){mesh.tolerance=.0001;const rounded=own(new M(mesh));const unified=own(rounded.asOriginal()),repaired=own(unified.setTolerance(.001));if(repaired.status()!=='NoError'||repaired.isEmpty())throw Error('Could not resolve the surface detail. Reduce the detail depth or increase spacing.');mesh=((drawerInsertActive(p)||['bin','coaster-plant'].includes(p.kind))?own(repaired.simplify(.001)):repaired).getMesh();}const vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let a=0;a<3;a++)vertices[i*3+a]=mesh.vertProperties[i*mesh.numProp+a];
  parts.push({name,role,...(role==='plant-branch'?{rotationOrder:'ZYX'}:{}),bounds,mesh:{vertices,faces:new Uint32Array(mesh.triVerts)},assembly,rotation,printSize:size.map(v=>+v.toFixed(2))});
 }
 function ribs(solid,w,d,h,frontOnly=false,isRound=circular){
  const p=surface;
  if(p.finish==='smooth')return solid;
  if(adjustableFinish(p))return sculptedRibs(solid,w,d,h,frontOnly,isRound);
  if(isRound){const features=[],radius=p.finish==='fluted'?.8:.65,n=4*Math.floor(Math.PI*w/(p.finish==='fluted'?4:7)/4);for(let i=0;i<n;i++){const a=i*2*Math.PI/n;features.push(own((p.finish==='fluted'?own(C.circle(radius,16)):own(round(1.3,3.2,.6).rotate(a*180/Math.PI))).extrude(h-2).translate([(w/2+ (p.finish==='fluted'?-.25:-.32))*Math.cos(a),(w/2+(p.finish==='fluted'?-.25:-.32))*Math.sin(a),1])));}return own(M.union([solid,...features]));}
  const step=p.finish==='fluted'?4:7,radius=p.finish==='fluted'?.8:1.6,features=[];
  const feature=(x,y,side)=>{
   let profile=p.finish==='fluted'?own(C.circle(radius,16)):round(side?1.3:3.2,side?3.2:1.3,.6);
   features.push(own(profile.extrude(Math.max(.5,h-2)).translate([x,y,1])));
  };
  for(let x=-w/2+10;x<=w/2-10;x+=step){feature(x,-d/2+.25,false);if(!frontOnly)feature(x,d/2-.25,false);}
  if(!frontOnly)for(let y=-d/2+10;y<=d/2-10;y+=step){feature(-w/2+.25,y,true);feature(w/2-.25,y,true);}
  return features.length?own(M.union([solid,...features])):solid;
 }
 function sculptedRibs(solid,w,d,h,frontOnly,isRound){
  const p=surface;
  const depth=p.detailDepth,pitch=p.detailSpacing,features=[],steps=p.finish==='wave'?Math.min(32,Math.max(12,Math.ceil(h/4))):3,rise=h-2,ramp=Math.min(rise/2,Math.max(2,depth+1));
  function feature(x,y,nx,ny){
   let profile;
   if(p.finish==='ribbed')profile=round(depth+.4,Math.min(2,pitch*.25),.35).rotate(Math.atan2(ny,nx)*180/Math.PI);
   else {const radius=p.finish==='scalloped'?Math.min(pitch*.42,depth*1.5):Math.min(pitch*.38,depth*.65+.15);profile=C.circle(radius,24);}
   profile=own(profile);
   // Seat the rib 0.4 mm into the body, or use a broad rounded flute.
   const radius=p.finish==='ribbed'?0:p.finish==='scalloped'?Math.min(pitch*.42,depth*1.5):Math.min(pitch*.38,depth*.65+.15),offset=p.finish==='ribbed'?(depth-.4)/2:depth-radius;
   const full=own(profile.extrude(rise,steps).translate([x+nx*offset,y+ny*offset,1]));
   features.push(own(full.warp(v=>{
    let t=v[2]-1;if(p.finish!=='wave'){const f=t/rise*4,k=Math.min(3,Math.floor(f)),knots=[0,ramp,rise/2,rise-ramp,rise];t=knots[k]+(knots[k+1]-knots[k])*(f-k);v[2]=t+1;}const ease=Math.min(1,t/ramp,(rise-t)/ramp),retract=(depth-.05)*(1-ease),wave=p.finish==='wave'?Math.sin(t/rise*Math.PI*2)*Math.min(1.5,pitch*.16):0;
    if(isRound){const r=Math.hypot(v[0],v[1])-retract,a=Math.atan2(v[1],v[0])+wave/(w/2);v[0]=r*Math.cos(a);v[1]=r*Math.sin(a);}
    else {v[0]-=nx*retract+ny*wave;v[1]-=ny*retract-nx*wave;}
   })));
  }
  if(isRound){const n=Math.max(12,4*Math.floor(Math.PI*w/pitch/4));for(let i=0;i<n;i++){const a=i*2*Math.PI/n;feature(w/2*Math.cos(a),w/2*Math.sin(a),Math.cos(a),Math.sin(a));}}
  else {
   const margin=Math.max(10,pitch*.6),xs=Math.max(1,Math.floor((w-2*margin)/pitch)+1),ys=Math.max(1,Math.floor((d-2*margin)/pitch)+1);
   for(let i=0;i<xs;i++){const x=(i-(xs-1)/2)*pitch;feature(x,-d/2,0,-1);if(!frontOnly)feature(x,d/2,0,1);}
   if(!frontOnly)for(let i=0;i<ys;i++){const y=(i-(ys-1)/2)*pitch;feature(-w/2,y,-1,0);feature(w/2,y,1,0);}
  }
  // Keep the cavity smooth and attach ribs to the wall without exceeding the requested footprint.
  const envelope=frontOnly?own(C.square([w,d+2*depth],true)):isRound?own(C.circle(w/2+depth,128)):outline(w+2*depth,d+2*depth),core=own((isRound?own(C.circle(w/2,128)):outline(w,d)).offset(-.3)),band=own(envelope.subtract(core)),clip=own(band.extrude(h));
  const detail=own(own(M.union(features)).intersect(clip));return own(solid.add(detail));
 }
 function hollowBox(profile,h){const inner=own(profile.offset(-p.wall));if(inner.isEmpty())throw Error('The tray is too small for this wall thickness.');return own(own(profile.extrude(h)).subtract(own(inner.extrude(h).translate([0,0,p.wall]))));}
 function container(w,d,h,frontOnly=false,divisions=true,settings=p){
  const p=settings;
  const r=frontOnly?drawerCornerRadius(w,d,p):Math.min(9,w/5,d/5),outer=frontOnly&&drawerInsertActive(p)?round(w,d,r):outline(w,d),inside=circular?own(C.circle(w/2-p.wall,128).rotate(360/256)):round(w-2*p.wall,d-2*p.wall,Math.max(1,r-p.wall));
  let solid=own(own(outer.extrude(h)).subtract(own(inside.extrude(h).translate([0,0,p.wall]))));
  const partitions=[];
  for(let i=1;i<(divisions?p.columns:1);i++)partitions.push(own(own(C.square([p.wall,d],true).translate([(i/p.columns-.5)*(w-2*p.wall),0])).intersect(circular?own(inside.offset(.1)):inside)));
  for(let i=1;i<(divisions?p.rows:1);i++)partitions.push(own(own(C.square([w,p.wall],true).translate([0,(i/p.rows-.5)*(d-2*p.wall)])).intersect(circular?own(inside.offset(.1)):inside)));
  if(partitions.length)solid=own(solid.add(own(own(C.union(partitions)).extrude(h-p.wall+.02).translate([0,0,p.wall-.02]))));
  solid=ribs(solid,w,d,h,frontOnly);
  solid=carveOpenwork(module,own,solid,w,d,h,p,{pull:frontOnly});
  if(frontOnly){const notch=own(round(Math.min(26,w/3),14,4).extrude(p.wall+6).rotate([90,0,0]).translate([0,-d/2+p.wall+2,h+1]));solid=own(solid.subtract(notch));}
  return solid;
 }
 add.hidden=()=>{parts.at(-1).assemblyHidden=true;};
 add.door=(pivot,side,opening=110)=>{parts.at(-1).doorPivot=pivot;parts.at(-1).doorSide=side;parts.at(-1).doorOpening=opening;};
 add.pill=(day,pivot)=>{parts.at(-1).pillDay=day;if(pivot)parts.at(-1).pillHingePivot=pivot;};
 add.usable=size=>{parts.at(-1).usableSize=size.map(v=>+v.toFixed(2));};
 let screwFit,storageFit,coasterFit,homeFit,cupboardFit;
 try{
  if(p.kind==='cupboard'){cupboardFit=makeCupboard(module,own,p,{round,box,add,fontBuffer});}
  else if(isHome(p)){homeFit=makeHomeItems(module,own,p,{round,ribs,box,add,fontBuffer});}
  else if(isCoaster(p)){coasterFit=makeCoasters(module,own,p,{round,ribs,box,add,reference:(...args)=>{add(...args);return parts.pop();}});}
  else if(isStorage(p)){storageFit=makeStorage(module,own,p,{round,ribs,hollowBox,add});}
  else if(p.kind==='screw'){screwFit=makeScrewContainer(module,own,p,ribs,add,fontBuffer);}
  else if(p.kind==='drawers'){
   const stack=drawerStacking(p),bodyHeight=p.height-stack.footHeight;
   const r=2*p.wall,outer=round(p.width,bodyHeight,r),inner=round(p.width-2*p.wall,bodyHeight-2*p.wall,.5);
   let shell=own(own(outer.extrude(p.depth)).subtract(own(inner.extrude(p.depth+.1).translate([0,0,p.wall]))));
   const slot=(bodyHeight-(p.drawers+1)*p.wall)/p.drawers;
   for(let i=1;i<p.drawers;i++){const y=-bodyHeight/2+p.wall+i*slot+(i-.5)*p.wall;shell=own(shell.add(box(p.width-2*p.wall+.02,p.wall,p.depth-p.wall,0,y,p.wall)));}
   const slotWidth=(p.width-(p.drawerColumns+1)*p.wall)/p.drawerColumns;
   for(let col=1;col<p.drawerColumns;col++)shell=own(shell.add(box(p.wall,bodyHeight-2*p.wall+.02,p.depth-p.wall,-p.width/2+p.wall+col*slotWidth+(col-.5)*p.wall,0,p.wall)));
   for(const [x,y]of stack.positions){
    const z=p.depth/2-y,full=own(round(stack.footWidth,stack.footHeight+.02,.4).translate([x,-bodyHeight/2-stack.footHeight/2+.01])),edge=own(round(stack.footWidth,.04,.01).translate([x,-bodyHeight/2+.005]));
    const foot=own(M.hull([own(edge.extrude(.02).translate([0,0,z-stack.footDepth/2])),own(full.extrude(stack.footDepth-2*stack.footHeight).translate([0,0,z-stack.footDepth/2+stack.footHeight])),own(edge.extrude(.02).translate([0,0,z+stack.footDepth/2-.02]))]));
    shell=own(shell.add(foot));
    if(p.stackTop==='pockets'){
     const pocket=own(round(stack.footWidth+2*stack.clearance,stack.footDepth+2*stack.clearance,.5).extrude(stack.pocketDepth+.02).rotate([90,0,0]).translate([x,bodyHeight/2+.01,z]));shell=own(shell.subtract(pocket));
    }
   }
   shell=connectDrawerCase(module,own,p,shell,bodyHeight);
   add('drawer-case','case',shell,[0,p.depth/2,stack.footHeight+bodyHeight/2],[Math.PI/2,0,0]);
   const sideDetail=p.openwork==='woven'&&p.openworkFaces==='front-sides'?.4:0;
   const dw=slotWidth-2*p.clearance-2*sideDetail,dh=slot-2*p.clearance;
   for(let i=0;i<p.drawers;i++)for(let col=0;col<p.drawerColumns;col++){
    const q={...p,finish:drawerStyle(p,i*p.drawerColumns+col)},detail=finishInset(q),dd=p.depth-p.wall-p.clearance-detail-(p.drawerConnectors!=='none'?2.4:0);surface=q;
    const name=p.drawerColumns===1?`drawer-${i+1}`:`drawer-row-${i+1}-column-${col+1}`,assembly=[-p.width/2+p.wall+slotWidth/2+col*(slotWidth+p.wall),-p.depth/2+detail+dd/2,stack.footHeight+p.wall+i*(slot+p.wall)+p.clearance];
    let drawer=addDrawerInsertRails(module,own,container(dw,dd,dh,true,true,q),dw,dd,dh,q,{box});
    const label=makeStorageLabel(module,own,p,'drawers',i*p.drawerColumns+col,dw,fontBuffer);
    if(label){const y=-dd/2-detail,z=(p.wall+1+dh-8)/2,bottom=z-label.height/2,pad=box(label.width,detail+p.wall+.05,label.height,0,y+(detail+p.wall+.05)/2,bottom);drawer=own(drawer.add(pad));if(detail>0){const root=box(label.width,p.wall,.1,0,-dd/2+p.wall/2,bottom-detail),ramp=own(M.hull([root,box(label.width,detail+p.wall+.05,.1,0,y+(detail+p.wall+.05)/2,bottom)]));drawer=own(drawer.add(ramp));}if(label.cut)drawer=own(drawer.subtract(own(label.cut.rotate([-90,0,0]).translate([0,y-.01,z]))));if(label.insert)add(`${name}-label`,'drawer-label',label.insert,[assembly[0],assembly[1]+y+1,assembly[2]+z],[Math.PI/2,0,0]);}
    add(name,'drawer',drawer,assembly);parts.at(-1).surfaceStyle=q.finish;
    for(const sheet of drawerInsertLayout(dw,dd,dh,q)){
     const solid=drawerSheetSolid(module,own,sheet,dw,dh,q);let position,rotation;
     if(sheet.side===0){position=[sheet.centre,-dd/2+sheet.normal+.5,sheet.bottom];rotation=[Math.PI/2,0,0];}
     else{position=[sheet.side*(dw/2-sheet.normal-.5),sheet.centre,sheet.side===1?sheet.top:sheet.bottom];rotation=[0,sheet.side*Math.PI/2,0];}
     add(`${name}-colour-sheet-${sheet.name}`,'drawer-sheet',solid,position.map((v,a)=>v+assembly[a]),rotation);parts.at(-1).insertFit={...sheet,drawer:name};
    }
   }
   surface=p;addDrawerKeys(module,own,p,add);
  }else if(p.kind==='bin'){
   makeBin(module,own,p,binDimensions(p),{outline,container,box,add});
   parts.find(part=>part.role==='lid').pivot=[0,0,binDimensions(p).pivot];
  }else if(standaloneTray(p)){
   const inset=finishInset(p),w=p.width-2*inset,d=p.depth-2*inset,profile=round(w,d,3),inner=own(profile.offset(-p.wall));
   add(p.kind==='box'?'standalone-sorting-box':'standalone-pen-tray',p.kind,carveOpenwork(module,own,ribs(hollowBox(profile,p.height),w,d,p.height),w,d,p.height,p),[0,0,0]);
   const bounds=inner.bounds();parts.at(-1).usableSize=[bounds.max[0]-bounds.min[0],bounds.max[1]-bounds.min[1],p.height-p.wall].map(v=>+v.toFixed(2));
  }else{
   // Reserve space for the surface detail so the requested footprint includes it.
   const inset=finishInset(p);
   const w=p.width-2*inset,d=p.depth-2*inset;
   add(p.kind==='pot'?'pen-pot':'sorting-tray',p.kind,container(w,d,p.height,false,p.kind!=='tray'||p.trayLayout==='fixed'),[0,0,0]);
   if(p.kind==='tray'&&['boxes','pens'].includes(p.trayLayout)){
    const inner=round(w-2*p.wall,d-2*p.wall,Math.max(1,Math.min(9,w/5,d/5)-p.wall)),safe=own(inner.offset(-p.clearance)),bh=p.height-p.wall-.8;
    for(const cell of trayCells(p)){
     const {x,y,width:cw,depth:cd}=cell;
     const profile=own(own(own(round(cw-2*p.clearance,cd-2*p.clearance,3).translate([x,y])).intersect(safe)).translate([-x,-y])),inside=own(profile.offset(-p.wall));
     if(inside.isEmpty())throw Error('The inner boxes are too small for this wall thickness.');
     const solid=hollowBox(profile,bh);
     add(cell.name,'inner-box',solid,[x,y,p.wall]);
     const bounds=inside.bounds();parts.at(-1).usableSize=[bounds.max[0]-bounds.min[0],bounds.max[1]-bounds.min[1],bh-p.wall].map(v=>+v.toFixed(2));
    }
   }
  }
  let x=0,y=0,rowDepth=0;const grid=p.kind==='cupboard'||p.kind==='drawers'&&p.drawerConnectors!=='none';for(const part of parts){if(grid&&x+part.printSize[0]>340){x=0;y+=rowDepth+12;rowDepth=0;}part.x=x-part.bounds.min[0];part.y=y-part.bounds.min[1];x+=part.printSize[0]+10;rowDepth=Math.max(rowDepth,part.printSize[1]);}
  return {settings:p,parts,...(cupboardFit?{cupboardFit}:{}),...(homeFit?{homeFit}:{}),...(coasterFit?{coasterFit}:{}),...(storageFit?{storageFit}:{}),...(screwFit?{screwFit}:{}),width:cupboardFit?.width??homeFit?.width??coasterFit?.width??p.width,height:cupboardFit?.height??homeFit?.height??coasterFit?.height??p.height,depth:cupboardFit?.depth??homeFit?.depth??coasterFit?.depth??p.depth,...(p.kind==='drawers'?{stacking:drawerStacking(p)}:{}),...(p.kind==='bin'?{binFit:binDimensions(p)}:{}),prototype:true};
 }finally{for(const obj of owned.reverse())obj.delete();}
}
