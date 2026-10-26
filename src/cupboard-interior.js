import {cupboardLevels} from './cupboard-options.js';
// All case additions use assembled coordinates before clipping to each module.
export function cupboardInterior(module,own,p,{box,round,add}){
 const {CrossSection:C,Manifold:M}=module,W=p.width/p.cupboardColumns,H=p.height,D=p.depth,t=p.wall,c=p.clearance,back=D/2,front=-D/2+30,margin=Math.max(8+t+c,11+c),sw=W-2*(margin+1.2),rear=back-t-c,sd=rear-front,sy=(front+rear)/2,levels=cupboardLevels(p),additions=[];
 const union=a=>own(M.union(a));
 const rails=(width,depth,y,z)=>{const a=[];for(let i=1;i<=p.shelfDividers;i++){const x=-width/2+width*i/(p.shelfDividers+1);for(const s of [-1,1])a.push(box(1.8,depth,3,x+s*(t/2+c+.9),y,z-.01));}return a;};
 for(const z of levels.shelves){
  if(p.shelfMode==='fixed')additions.push(box(W-2*t+.02,back-t-front+.02,t,0,(front+back-t)/2,z));
  else for(const s of [-1,1]){
   const outer=s*(W/2-t+.01),inner=s*(sw/2-3),reach=Math.abs(outer-inner),points=[[outer,front],[inner,front],[inner,back-t-reach],[outer,back-t+.02]];
   additions.push(own(new C([points],'NonZero').extrude(3).translate([0,0,z-3])));
  }
 }
 for(const b of levels.platforms)if(p.shelfDividers&&b.kind!=='removable')additions.push(...rails(sw,back-t-front+.02,(front+back-t)/2,b.height));
 const clip=row=>box(W+.1,D+.1,H,0,0,row*H);
 function apply(shell,row){const local=[];for(const s of additions){const clipped=own(s.intersect(clip(row)));if(!clipped.isEmpty()&&clipped.volume()>.001)local.push(own(clipped.translate([0,0,-row*H])));}if(local.length)shell=own(shell.add(union(local)));return shell;}
 function parts(){for(let col=0;col<p.cupboardColumns;col++){
  const cx=(col-(p.cupboardColumns-1)/2)*W;
  for(const [i,z] of levels.shelves.entries())if(p.shelfMode==='removable'){
   let plate=own(round(sw,sd,2).extrude(t));if(p.shelfDividers)plate=own(plate.add(union(rails(sw,sd,0,t))));add(`shelf-${i+1}-c${col+1}`,'shelf',plate,[cx,sy,z]);
  }
  for(const [i,b]of levels.platforms.entries())for(let j=1;j<=p.shelfDividers;j++){
   const finDepth=sd-4,fin=box(t,finDepth,b.finHeight),flat=own(fin.rotate([0,90,0])),bb=flat.boundingBox(),normal=own(flat.translate([0,0,-bb.min[2]])),x=cx-sw/2+sw*j/(p.shelfDividers+1);
   // inverse of the supplied broad-side-down printing transform
   add(`divider-platform-${i+1}-c${col+1}-${j}`,'shelf-divider',normal,[x-bb.min[2],sy-2,b.height],[0,-Math.PI/2,0]);
  }
 }}
 function openings(shell,row,ports){
  const z0=row*H,holes=[],keep=[];
  for(const [x,z]of ports)keep.push(own(C.circle(7,32).translate([x,z-H/2])));
  const cable=levels.cables.includes(z0+20);if(cable)keep.push(own(C.circle(p.cableDiameter/2+4,48).translate([0,20-H/2])));
  for(const b of [...levels.shelves.map(z=>({base:z-4,height:z+t+6})),...levels.platforms.filter(()=>p.shelfDividers).map(b=>({base:b.height-2,height:b.height+5}))])if(b.height>z0&&b.base<z0+H)keep.push(own(C.square([Math.max(W,D)+1,b.height-b.base],true).translate([0,(b.base+b.height)/2-z0-H/2])));
  function field(width,depthAxis=false){const cells=[],size=p.ventSize,step=size+3;
   for(let x=-width/2+12+size/2;x<=width/2-12-size/2;x+=step)for(let z=12+size/2;z<=H-12-size/2;z+=step){let a;
    if(p.cupboardVent==='honeycomb')a=own(new C([Array.from({length:6},(_,i)=>{const r=(30+i*60)*Math.PI/180;return [size/Math.sqrt(3)*Math.cos(r),size/Math.sqrt(3)*Math.sin(r)];})]));
    else if(p.cupboardVent==='diamond')a=own(new C([[[0,-size/2],[size/2,0],[0,size/2],[-size/2,0]]]));
    else a=round(size,depthAxis?Math.min(6,size):size,Math.min(2,size/4));
    cells.push(own(a.translate([x,z-H/2])));
   }
   if(!cells.length)return null;let f=own(C.union(cells));if(keep.length)f=own(f.subtract(own(C.union(keep))));return f;
  }
  if(p.cupboardVent!=='none'){
   if(p.ventFaces!=='sides'){const f=field(W);if(f&&!f.isEmpty())holes.push(own(f.extrude(t+.2).rotate([90,0,0]).translate([0,back+.1,H/2])));}
   if(p.ventFaces!=='back')for(const side of [-1,1]){const width=back-front-10,f=field(width,true);if(f&&!f.isEmpty())holes.push(own(f.extrude(t+.2).rotate([90,0,90]).translate([side===1?W/2-t-.1:-W/2-.1,(front+back)/2,H/2])));}
  }
  if(cable)holes.push(own(C.circle(p.cableDiameter/2,64).extrude(t+.2).rotate([90,0,0]).translate([0,back+.1,20])));
  return holes.length?own(shell.subtract(union(holes))):shell;
 }
 return {apply,parts,openings,levels};
}
