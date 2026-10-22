import {validateDeskSettings,trayCells,drawerStacking} from './desk-settings.js';
export function generateDeskModel(module,input){
 const p=validateDeskSettings(input),{CrossSection:C,Manifold:M}=module,owned=[];const own=x=>(owned.push(x),x);
 const round=(w,d,r=Math.min(9,w/5,d/5))=>own(own(C.square([w-2*r,d-2*r],true)).offset(r,'Round',2,48));
 const box=(w,d,h,x=0,y=0,z=0)=>own(own(C.square([w,d],true)).extrude(h).translate([x,y,z]));
 const circular=['pot','bin'].includes(p.kind)&&p.shape==='round';
 const outline=(w,d)=>circular?own(C.circle(w/2,128).rotate(360/256)):round(w,d);
 const parts=[];
 function add(name,role,solid,assembly,rotation=[0,0,0]){
  const clean=own(solid.simplify(.001));if(clean.status()!=='NoError'||clean.isEmpty()||clean.volume()<=0)throw Error('Could not make a closed desk part. Adjust the dimensions.');
  const bounds=clean.boundingBox(),size=bounds.max.map((v,i)=>v-bounds.min[i]);if(size.some(v=>v>170.001))throw Error('A finished part exceeds the 170 mm A1 mini design limit. Reduce its dimensions.');
  const mesh=clean.getMesh(),vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let a=0;a<3;a++)vertices[i*3+a]=mesh.vertProperties[i*mesh.numProp+a];
  parts.push({name,role,bounds,mesh:{vertices,faces:new Uint32Array(mesh.triVerts)},assembly,rotation,printSize:size.map(v=>+v.toFixed(2))});
 }
 function ribs(solid,w,d,h,frontOnly=false){
  if(p.finish==='smooth')return solid;
  if(circular){const features=[],radius=p.finish==='fluted'?.8:.65,n=4*Math.floor(Math.PI*w/(p.finish==='fluted'?4:7)/4);for(let i=0;i<n;i++){const a=i*2*Math.PI/n;features.push(own((p.finish==='fluted'?own(C.circle(radius,16)):own(round(1.3,3.2,.6).rotate(a*180/Math.PI))).extrude(h-2).translate([(w/2+ (p.finish==='fluted'?-.25:-.32))*Math.cos(a),(w/2+(p.finish==='fluted'?-.25:-.32))*Math.sin(a),1])));}return own(M.union([solid,...features]));}
  const step=p.finish==='fluted'?4:7,radius=p.finish==='fluted'?.8:1.6,features=[];
  const feature=(x,y,side)=>{
   let profile=p.finish==='fluted'?own(C.circle(radius,16)):round(side?1.3:3.2,side?3.2:1.3,.6);
   features.push(own(profile.extrude(Math.max(.5,h-2)).translate([x,y,1])));
  };
  for(let x=-w/2+10;x<=w/2-10;x+=step){feature(x,-d/2+.25,false);if(!frontOnly)feature(x,d/2-.25,false);}
  if(!frontOnly)for(let y=-d/2+10;y<=d/2-10;y+=step){feature(-w/2+.25,y,true);feature(w/2-.25,y,true);}
  return features.length?own(M.union([solid,...features])):solid;
 }
 function container(w,d,h,frontOnly=false,divisions=true){
  const r=Math.min(9,w/5,d/5),outer=outline(w,d),inside=circular?own(C.circle(w/2-p.wall,128).rotate(360/256)):round(w-2*p.wall,d-2*p.wall,Math.max(1,r-p.wall));
  let solid=own(own(outer.extrude(h)).subtract(own(inside.extrude(h).translate([0,0,p.wall]))));
  const partitions=[];
  for(let i=1;i<(divisions?p.columns:1);i++)partitions.push(own(own(C.square([p.wall,d],true).translate([(i/p.columns-.5)*(w-2*p.wall),0])).intersect(circular?own(inside.offset(.1)):inside)));
  for(let i=1;i<(divisions?p.rows:1);i++)partitions.push(own(own(C.square([w,p.wall],true).translate([0,(i/p.rows-.5)*(d-2*p.wall)])).intersect(circular?own(inside.offset(.1)):inside)));
  if(partitions.length)solid=own(solid.add(own(own(C.union(partitions)).extrude(h-p.wall+.02).translate([0,0,p.wall-.02]))));
  solid=ribs(solid,w,d,h,frontOnly);
  if(frontOnly){const notch=own(round(Math.min(26,w/3),14,4).extrude(p.wall+6).rotate([90,0,0]).translate([0,-d/2+p.wall+2,h+1]));solid=own(solid.subtract(notch));}
  return solid;
 }
 try{
  if(p.kind==='drawers'){
   const stack=drawerStacking(p),bodyHeight=p.height-stack.footHeight;
   const r=2*p.wall,outer=round(p.width,bodyHeight,r),inner=round(p.width-2*p.wall,bodyHeight-2*p.wall,.5);
   let shell=own(own(outer.extrude(p.depth)).subtract(own(inner.extrude(p.depth+.1).translate([0,0,p.wall]))));
   const slot=(bodyHeight-(p.drawers+1)*p.wall)/p.drawers;
   for(let i=1;i<p.drawers;i++){const y=-bodyHeight/2+p.wall+i*slot+(i-.5)*p.wall;shell=own(shell.add(box(p.width-2*p.wall+.02,p.wall,p.depth-p.wall,0,y,p.wall)));}
   for(const [x,y]of stack.positions){
    const z=p.depth/2-y,full=own(round(stack.footWidth,stack.footHeight+.02,.4).translate([x,-bodyHeight/2-stack.footHeight/2+.01])),edge=own(round(stack.footWidth,.04,.01).translate([x,-bodyHeight/2+.005]));
    const foot=own(M.hull([own(edge.extrude(.02).translate([0,0,z-stack.footDepth/2])),own(full.extrude(stack.footDepth-2*stack.footHeight).translate([0,0,z-stack.footDepth/2+stack.footHeight])),own(edge.extrude(.02).translate([0,0,z+stack.footDepth/2-.02]))]));
    shell=own(shell.add(foot));
    if(p.stackTop==='pockets'){
     const pocket=own(round(stack.footWidth+2*stack.clearance,stack.footDepth+2*stack.clearance,.5).extrude(stack.pocketDepth+.02).rotate([90,0,0]).translate([x,bodyHeight/2+.01,z]));shell=own(shell.subtract(pocket));
    }
   }
   add('drawer-case','case',shell,[0,p.depth/2,stack.footHeight+bodyHeight/2],[Math.PI/2,0,0]);
   const detail=p.finish==='fluted'?.55:p.finish==='slatted'?.4:0;
   const dw=p.width-2*p.wall-2*p.clearance,dd=p.depth-p.wall-p.clearance-detail,dh=slot-2*p.clearance;
   for(let i=0;i<p.drawers;i++)add(`drawer-${i+1}`,'drawer',container(dw,dd,dh,true),[0,-p.depth/2+detail+dd/2,stack.footHeight+p.wall+i*(slot+p.wall)+p.clearance]);
  }else if(p.kind==='bin'){
   const inset=p.finish==='fluted'?.55:p.finish==='slatted'?.4:0,w=p.width-2*inset,d=p.depth-2*inset,h=p.height-4;
   const outer=outline(w,d),opening=own(outer.offset(-p.wall-.6)),lidProfile=own(opening.offset(-.6));
   let body=container(w,d,h,false,false);
   // Raised bearing pads support the trunnions; the removable rim closes the seats.
   for(const side of [-1,1])body=own(body.add(box(p.wall,3,1,side*(w/2-p.wall/2),0,h)));
   add('bin-body','bin',body,[0,0,0]);
   let rim=own(own(outer.extrude(4)).subtract(own(opening.extrude(4))));
   for(const side of [-1,1]){
    const bore=own(C.circle(1.25,32).extrude(p.wall+1).rotate([0,90,0]).translate([side<0?-w/2-.1:w/2-p.wall-.8,0,2]));
    const slot=box(p.wall+1,2.5,2,side*(w/2-p.wall/2),0,0);
    rim=own(rim.subtract(own(bore.add(slot))));
   }
   // Inverted for printing: bearing slots face upward.
   add('bearing-rim','rim',own(rim.rotate([180,0,0]).translate([0,0,4])),[0,0,p.height],[Math.PI,0,0]);
   let lid=own(lidProfile.extrude(4));
   const lb=lidProfile.bounds(),pinStart=lb.max[0]-.2,pinLength=w/2-.3-pinStart;
   for(const side of [-1,1])lid=own(lid.add(own(C.circle(1,32).extrude(pinLength).rotate([0,side*90,0]).translate([side*pinStart,0,2]))));
   // Store the actual pivot for the assembled preview.
   add('flat-swing-lid','lid',lid,[0,0,h]);
   parts.at(-1).pivot=[0,0,2];
  }else{
   // Reserve space for the surface detail so the requested footprint includes it.
   const inset=p.finish==='fluted'?.55:p.finish==='slatted'?.4:0;
   const w=p.width-2*inset,d=p.depth-2*inset;
   add(p.kind==='pot'?'pen-pot':'sorting-tray',p.kind,container(w,d,p.height,false,p.kind!=='tray'||p.trayLayout==='fixed'),[0,0,0]);
   if(p.kind==='tray'&&['boxes','pens'].includes(p.trayLayout)){
    const inner=round(w-2*p.wall,d-2*p.wall,Math.max(1,Math.min(9,w/5,d/5)-p.wall)),safe=own(inner.offset(-p.clearance)),bh=p.height-p.wall-.8;
    for(const cell of trayCells(p)){
     const {x,y,width:cw,depth:cd}=cell;
     const profile=own(own(own(round(cw-2*p.clearance,cd-2*p.clearance,3).translate([x,y])).intersect(safe)).translate([-x,-y])),inside=own(profile.offset(-p.wall));
     if(inside.isEmpty())throw Error('The inner boxes are too small for this wall thickness.');
     const solid=own(own(profile.extrude(bh)).subtract(own(inside.extrude(bh).translate([0,0,p.wall]))));
     add(cell.name,'inner-box',solid,[x,y,p.wall]);
     const bounds=inside.bounds();parts.at(-1).usableSize=[bounds.max[0]-bounds.min[0],bounds.max[1]-bounds.min[1],bh-p.wall].map(v=>+v.toFixed(2));
    }
   }
  }
  let x=0;for(const part of parts){part.x=x-part.bounds.min[0];part.y=-part.bounds.min[1];x+=part.printSize[0]+10;}
  return {settings:p,parts,width:p.width,height:p.height,depth:p.depth,...(p.kind==='drawers'?{stacking:drawerStacking(p)}:{}),prototype:true};
 }finally{for(const obj of owned.reverse())obj.delete();}
}
