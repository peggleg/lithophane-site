import {cupboardCaps,connectorAxes} from './cupboard-settings.js';
import {snapBridge,rearHole} from './storage-connectors.js';
import {cupboardInterior} from './cupboard-interior.js';
import {makeStorageLabel} from './storage-labels.js';
import {openworkCells} from './desk-openwork.js';

export function makeCupboard(module,own,p,{round,box,add,fontBuffer}){
 const {CrossSection:C,Manifold:M}=module,W=p.width/p.cupboardColumns,H=p.height,D=p.depth,back=D/2,front=-D/2+18,axisY=-D/2+10,faceY=axisY-4,thickness=p.wall+(p.finish==='smooth'?0:['ribbed','scalloped','wave'].includes(p.finish)?p.detailDepth:p.finish==='fluted'?.55:.4),margin=Math.max(8+p.wall+p.clearance,11+p.clearance),pinRadius=1.4,bore=pinRadius+p.clearance,R=4,ports=connectorAxes(p.cupboardPorts),hinges=[H*.25-9,H*.75-9],doorRecords=[],joining=[],portMap=new Map(),cases=[],notes=[];
 const interior=cupboardInterior(module,own,p,{round,box,add});
 const circle=(r,h,z=0)=>own(C.circle(r,64).extrude(h).translate([0,0,z]));
 const boreSection=direction=>own(own(C.circle(bore,64)).add(own(new C([[[-bore/Math.SQRT2,direction*bore/Math.SQRT2],[bore/Math.SQRT2,direction*bore/Math.SQRT2],[0,direction*bore*Math.SQRT2]]],'NonZero'))));
 const caseBore=boreSection(-1),doorBore=boreSection(1);
 const globalCylinder=(r,h,x,y,z)=>own(circle(r,h).translate([x,y,z]));
 const plate=(w,h,r=2)=>round(w,h,Math.min(r,w/4,h/4));
 const printCase=s=>own(s.translate([0,-back,-H/2]).rotate([-90,0,0]));
 function port(row,col,x,z){const key=`${row}/${col}`,a=portMap.get(key)||[];if(!a.some(v=>Math.abs(v[0]-x)<.01&&Math.abs(v[1]-z)<.01))a.push([x,z]);portMap.set(key,a);}
 // Shared rear ports sit 8 mm either side of each module boundary.
 for(let row=0;row<p.cupboardRows;row++)for(let col=0;col<p.cupboardColumns;col++){
  if(ports.vertical)for(const x of [-1,1])for(const edge of [8,H-8])port(row,col,x*(W/2-18),edge);
  if(ports.sides)for(const x of [-1,1])for(const z of [H*.25,H*.75])port(row,col,x*(W/2-8),z);
 }
 for(let row=1;row<p.cupboardRows;row++)for(let col=0;col<p.cupboardColumns;col++)for(const sign of [-1,1]){
  const x=sign*(W/2-18);port(row-1,col,x,H-8);port(row,col,x,8);joining.push({axis:'vertical',x:(col-(p.cupboardColumns-1)/2)*W+x,z:row*H});
 }
 for(let col=1;col<p.cupboardColumns;col++)for(let row=0;row<p.cupboardRows;row++)for(const z of [H*.25,H*.75]){port(row,col-1,W/2-8,z);port(row,col,-W/2+8,z);joining.push({axis:'sides',x:(col-p.cupboardColumns/2)*W,z:row*H+z});}
 function hingeCase(solid,x,start,side,opening){
  const pieces=[];
  for(const z of [start,start+13]){
   let barrel=globalCylinder(R,5,x,axisY,z);
   const edge=side*(W/2),xa=Math.min(x-side*R,edge),xb=Math.max(x-side*R,edge),arm=box(xb-xa,front+p.wall-axisY,5,(xa+xb)/2,(axisY+front+p.wall)/2,z);
   barrel=own(own(barrel.add(arm)).subtract(own(caseBore.extrude(5.2).translate([x,axisY,z-.1]))));pieces.push(barrel);
  }
  function sector(inner,outer){const points=[];for(let i=0;i<=12;i++){const a=(opening-110+153+13*i/12)*Math.PI/180;points.push([-side*outer*Math.cos(a),-outer*Math.sin(a)]);}for(let i=12;i>=0;i--){const a=(opening-110+153+13*i/12)*Math.PI/180;points.push([-side*inner*Math.cos(a),-inner*Math.sin(a)]);}return own(new C([points],'NonZero').translate([x,axisY]));}
  const post=own(sector(6.2,7).extrude(7).translate([0,0,start+4.6])),root=box(1.2,p.wall,7,side*(W/2-.6),front+p.wall/2,start+4.6);
  pieces.push(own(sector(3.4,7).extrude(2.8).translate([0,0,start+2])),own(M.hull([post,root])));
  return own(solid.add(own(M.union(pieces))));
 }
 function doorCutouts(profile,w,h,keep){
  if(p.openwork==='none')return null;
  const shapes=[];
  for(const cell of openworkCells(w,h,{...p,wall:6},{pull:true})){
   const a=cell.width,b=cell.height;let c;
   if(p.openwork==='honeycomb')c=own(new C([Array.from({length:6},(_,i)=>{const t=(30+i*60)*Math.PI/180;return [a/Math.sqrt(3)*Math.cos(t),a/Math.sqrt(3)*Math.sin(t)];})]));
   else if(p.openwork==='diamond')c=own(new C([[[0,-b/2],[a/2,0],[0,b/2],[-a/2,0]]]));
   else if(p.openwork==='arches')c=own(own(C.square([a,b-a/2],true).translate([0,-a/4])).add(own(C.circle(a/2,32).translate([0,b/2-a/2]))));
   else c=plate(p.openwork==='woven'&&(cell.row+cell.col)%2?a*.55:a,p.openwork==='woven'&&(cell.row+cell.col)%2===0?b*.55:b,p.openwork==='slots'?a/2-.01:2);
   shapes.push(own(c.translate([cell.x,cell.z-h/2])));
  }
  const frame=own(C.square([Math.max(1,w-12),Math.max(1,h-24)],true));return own(own(own(C.union(shapes)).intersect(frame)).subtract(keep));
 }
 function styledDoor(profile,w,h,keep){
  let s=own(profile.extrude(thickness));if(p.finish==='smooth')return s;
  const cuts=[],depth=thickness-p.wall,pitch=['fluted','slatted'].includes(p.finish)?p.finish==='fluted'?4:7:p.detailSpacing,usable=own(own(profile.offset(-6)).subtract(keep));
  for(let x=-w/2+8;x<w/2-6;x+=pitch){
   if(p.finish==='scalloped'){
    const radius=Math.min(pitch*.42,depth*1.5),groove=own(circle(radius,h-12).rotate([90,0,0]).translate([x,h/2-6,depth-radius]));cuts.push(own(groove.intersect(own(usable.extrude(depth+.01)))));
   }else if(p.finish==='wave'){
    const half=Math.max(.7,(pitch-1.6)/2),left=[],right=[];for(let i=0;i<=32;i++){const y=-h/2+6+(h-12)*i/32,xx=x+Math.sin(i/32*Math.PI*2)*1.3;left.push([xx-half,y]);right.push([xx+half,y]);}const wave=own(new C([[...left,...right.reverse()]],'NonZero'));cuts.push(own(own(wave.intersect(usable)).extrude(depth)));
   }else{const width=p.finish==='fluted'?2.4:p.finish==='slatted'?2:Math.max(1,pitch-1.4),strip=own(plate(width,h-12,.6).translate([x,0]));cuts.push(own(own(strip.intersect(usable)).extrude(depth)));}
  }
  return cuts.length?own(s.subtract(own(M.union(cuts)))):s;
 }
 const keyProfile=own(new C([[[-3,0],[3,0],[2,2],[-2,2]]]));
 function channel(profile,length){return own(profile.extrude(length).rotate([90,0,0]));}
 for(let row=0;row<p.cupboardRows;row++)for(let col=0;col<p.cupboardColumns;col++){
  const cx=(col-(p.cupboardColumns-1)/2)*W,z0=row*H,caps=cupboardCaps(p,row),doorBottom=(caps.floor?p.wall:0)+p.clearance,doorTop=H-(caps.top?p.wall:0)-p.clearance,dh=doorTop-doorBottom,dc=(doorBottom+doorTop)/2;
  let shell=own(M.union([box(W,p.wall,H,0,back-p.wall/2,0),box(p.wall,D-18,H,-W/2+p.wall/2,(front+back)/2,0),box(p.wall,D-18,H,W/2-p.wall/2,(front+back)/2,0),box(8+p.wall,p.wall,H,-W/2+(8+p.wall)/2,front+p.wall/2,0),box(8+p.wall,p.wall,H,W/2-(8+p.wall)/2,front+p.wall/2,0)]));
  if(caps.floor)shell=own(shell.add(box(W-2*p.wall,D-18,p.wall,0,(front+back)/2,0)));
  if(caps.top)shell=own(shell.add(box(W-2*p.wall,D-18,p.wall,0,(front+back)/2,H-p.wall)));
  for(const side of [-1,1]){const edge=side*W/2,inner=edge-side*p.wall,wide=edge-side*(8+p.wall),ramp=own(new C([[[inner,front+p.wall+8.2],[inner,front+p.wall-.02],[wide,front+p.wall-.02]]],'NonZero').extrude(H));shell=own(shell.add(ramp));}
  const ranges=[{left:-W/2+margin,right:W/2-margin,side:p.hingeSide==='left'?-1:1}];
  for(let leaf=0;leaf<ranges.length;leaf++){
   const q=ranges[leaf],opening=110,pullHeight=5,dw=q.right-q.left,dx=(q.left+q.right)/2,hx=q.side*(W/2-7),localAxis=hx-dx,free=-q.side,edge=free*dw/2,pullX=edge-free*7,pullRow=Math.floor(p.cupboardRows/2),hasPull=row===pullRow,keepShapes=[own(C.circle(7,48).translate([pullX,0])),own(C.square([10,26],true).translate([edge,0]))];
   const label=hasPull?makeStorageLabel(module,own,p,'cupboard',col,dw,fontBuffer):null;if(label)keepShapes.push(own(label.keep.offset(2).translate([0,15])));
   if(p.doorMagnets)keepShapes.push(own(C.circle(5,40).translate([edge+free*1.5,q.side===1?-17:17])));
   const keep=own(C.union(keepShapes)),profile=plate(dw,dh,2);let door=styledDoor(profile,dw,dh,keep);
   const holes=doorCutouts(profile,dw,dh,keep);if(holes&&!holes.isEmpty())door=own(door.subtract(own(holes.extrude(thickness+1).translate([0,0,-.1]))));
   if(label?.cut)door=own(door.subtract(own(label.cut.translate([0,15,-.01]))));
   // The barrel axis lies in the print plane, with its underside on the bed.
   for(const start of hinges){
    shell=hingeCase(shell,hx,start,q.side,opening);
    const y=dc-(start+5+p.clearance),length=8-2*p.clearance;
    let barrel=own(circle(R,length).rotate([90,0,0]).translate([localAxis,y,4]));
    const arm=box(Math.abs(localAxis-q.side*dw/2)+.2,length,thickness,(localAxis+q.side*dw/2)/2,y-length/2,0);
    const footProfile=own(new C([[[-2.4,0],[2.4,0],[4,2.4],[4,4],[-4,4],[-4,2.4]]],'NonZero')),foot=own(footProfile.extrude(length).rotate([90,0,0]).translate([localAxis,y,0]));
    barrel=own(own(own(barrel.add(arm)).add(foot)).subtract(own(doorBore.extrude(length+.2).rotate([90,0,0]).translate([localAxis,y+.1,4]))));door=own(door.add(barrel));
    // Separate replaceable pin: bed-facing head and split-free round shaft.
    const pin=own(M.union([circle(2.5,1),circle(pinRadius,18.2,1),own(M.cylinder(.6,pinRadius,1,40).translate([0,0,19.2]))]));
    add(`hinge-pin-r${row+1}-c${col+1}-d${leaf+1}-${start===hinges[0]?'lower':'upper'}`,'hinge-pin',pin,[cx+hx,axisY,z0+start+19],[Math.PI,0,0]);
   }
   // One flex catch per module, with a receiving pocket integral with the case.
   const slot=box(.6,16,thickness+.2,edge-free*1.8,0,-.1),release=box(2.1,.6,thickness+.2,edge-free*.75,8,-.1);door=own(door.subtract(own(slot.add(release))));
   const nub=box(1.2,2.4,1.2,edge+free*.4,0,thickness-.9);door=own(door.add(nub));
   const ex=dx+edge,receiver=box(3.4,front+p.wall-(faceY+thickness-1.2),8,ex+free*1.9,(front+p.wall+faceY+thickness-1.2)/2,dc-4),pocket=box(1.8,3.2,2.8,ex+free*.7,faceY+thickness-.3,dc-1.4);shell=own(shell.add(own(receiver.subtract(pocket))));
   if(hasPull){
    door=own(door.subtract(own(C.square([6+2*p.clearance,3+2*p.clearance],true).extrude(thickness+2).translate([pullX,0,-.1]))));
    const cap=circle(4.5,pullHeight),stem=circle(1.5,thickness+p.clearance+.05,pullHeight-.01),root=circle(1.5,.08,pullHeight+thickness+p.clearance-.02),tab=box(6,2.2,.4,0,0,pullHeight+thickness+p.clearance+2);
    const knob=own(M.union([cap,stem,own(M.hull([root,tab]))])),groove=own(plate(5,1.2,.4).extrude(.5));
    const pull=own(own(knob.subtract(groove)).rotate([0,0,90]));
    add(`door-pull-c${col+1}-d${leaf+1}`,'door-pull',pull,[cx+dx+pullX,faceY-pullHeight,z0+dc],[-Math.PI/2,0,0]);add.door([cx+hx,axisY,0],q.side,opening);
   }
   if(p.doorMagnets){
    const mx=edge+free*1.5,my=q.side===1?-17:17,pad=own(C.circle(4.5,48).extrude(thickness+1.2).translate([mx,my,0]));door=own(own(door.add(pad)).subtract(own(C.circle(3.1,48).extrude(2.1).translate([mx,my,thickness-.8]))));
    const gx=dx+mx,gz=dc-my,magnetFront=faceY+thickness+1.2+p.clearance,rootWidth=8+p.wall,rootX=free*(W/2-rootWidth/2),block=own(M.hull([box(rootWidth,.2,9,rootX,front+p.wall-.05,gz-4.5),box(9,3.2,9,gx,magnetFront+1.6,gz-4.5)])),magnetHole=own(C.circle(3.1,48).extrude(2.1).rotate([-90,0,0]).translate([gx,magnetFront-.1,gz]));shell=own(shell.add(own(block.subtract(magnetHole))));
   }
   // Closed-ended dovetail tunnels retain the joining keys at the seam. Join
   // all door panels first, present the complete leaf, then insert hinge pins.
   for(const edgeSign of [-1,1]){
    const adjacent=edgeSign===-1?row<p.cupboardRows-1:row>0;if(!adjacent)continue;
    const edgeY=edgeSign*dh/2;
    for(const x of [-dw*.25,dw*.25]){
     const pad=box(10,12,4.2,x,edgeY-edgeSign*6,thickness),clearProfile=own(keyProfile.offset(p.clearance,'Round',2,16)),tool=own(channel(clearProfile,10.1).rotate([0,0,edgeSign===-1?180:0]).translate([x,edgeY+edgeSign*.1,thickness+.4]));
     door=own(door.add(own(pad.subtract(tool))));
    }
   }
   add(`cupboard-door-r${row+1}-c${col+1}-d${leaf+1}`,'cupboard-door',door,[cx+dx,faceY,z0+dc],[-Math.PI/2,0,0]);add.door([cx+hx,axisY,0],q.side,opening);
   if(label?.insert){add(`cupboard-label-c${col+1}`,'door-label',label.insert,[cx+dx,faceY+1,z0+dc-15],[Math.PI/2,0,0]);add.door([cx+hx,axisY,0],q.side,opening);}
   doorRecords.push({row,col,leaf,side:q.side,x:cx+dx,axisX:cx+hx,opening,width:dw,bottom:z0+doorBottom,top:z0+doorTop,centre:z0+dc});
  }
  shell=interior.openings(interior.apply(shell,row),row,portMap.get(`${row}/${col}`)||[]);
  for(const [x,z]of portMap.get(`${row}/${col}`)||[])shell=own(shell.subtract(rearHole(module,own,p,x,z,back)));
  add(`cupboard-case-r${row+1}-c${col+1}`,'cupboard-case',printCase(shell),[cx,back,z0+H/2],[Math.PI/2,0,0]);cases.push({row,col,floor:caps.floor,top:caps.top});
 }
 interior.parts();
 for(const a of doorRecords.filter(a=>a.row<p.cupboardRows-1)){
  const b=doorRecords.find(b=>b.row===a.row+1&&b.col===a.col&&b.leaf===a.leaf),gap=b.bottom-a.top,length=19+gap,solid=own(channel(keyProfile,length).translate([0,length/2,0]));
  for(const [i,offset]of [-a.width*.25,a.width*.25].entries()){add(`door-splice-r${a.row+1}-${a.row+2}-c${a.col+1}-d${a.leaf+1}-${i+1}`,'door-splice',solid,[a.x+offset,faceY+thickness+.4,(a.top+b.bottom)/2],[-Math.PI/2,0,0]);add.door([a.axisX,axisY,0],a.side,a.opening);}
 }
 for(const [i,j]of joining.entries())add(`case-${j.axis}-locking-key-${i+1}`,'connector-key',snapBridge(module,own,p,{horizontal:j.axis==='sides'}),[j.x,back+2.4,j.z],[Math.PI/2,0,0]);
 for(const [axis,on]of Object.entries(ports))if(on)for(let i=1;i<=2;i++){add(`spare-${axis}-locking-key-${i}`,'connector-key',snapBridge(module,own,p,{horizontal:axis==='sides'}),[0,0,0]);add.hidden();}
 return {width:p.width,depth:p.depth+2.4,height:H*p.cupboardRows,caseWidth:W,interior:interior.levels,modules:cases,doors:doorRecords,opening:110,hingeRadius:R,pinDiameter:2*pinRadius,boreDiameter:2*bore,doorThickness:thickness,connectorCount:joining.length,magnet:p.doorMagnets?{diameter:6,thickness:2,pocket:6.2}:null,notes};
}
