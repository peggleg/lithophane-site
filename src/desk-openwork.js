// Lay out complete cells only: solid floors, top rails, corners and pull surrounds
// must survive resizing. Dimensions are in the wall's horizontal/vertical plane.
export function openworkCells(width,height,p,{pull=false}={}){
 if(p.openwork==='none')return [];
 const size=p.openingSize,web=2.4,frame=Math.max(4,2*p.wall),margin=Math.max(9,frame),bottom=p.wall+frame,top=height-frame;
 const hex=p.openwork==='honeycomb',tall=['slots','arches'].includes(p.openwork),h=hex?size*2/Math.sqrt(3):tall?Math.min(size*1.6,top-bottom):size;
 if(h<size&&tall)return [];
 const pitchX=size+web*1.2,pitchY=hex?h*.75+web*1.2:h+web,rows=Math.max(0,Math.floor((top-bottom-h)/pitchY)+1),cells=[];
 for(let row=0;row<rows;row++){
  const shift=hex&&row%2?pitchX/2:0,span=width-2*margin,cols=Math.max(0,Math.floor((span-size)/pitchX)+1);
  for(let col=0;col<cols;col++){
   const x=(col-(cols-1)/2)*pitchX+shift,z=bottom+h/2+row*pitchY;
   if(x-size/2< -width/2+margin||x+size/2>width/2-margin)continue;
   if(pull&&Math.abs(x)<Math.min(26,width/3)/2+frame+size/2&&z+h/2>height-14-frame)continue;
   cells.push({x,z,width:size,height:h,row,col});
  }
 }
 return cells;
}
export function carveOpenwork(module,own,solid,w,d,h,p,{pull=false}={}){
 if(p.openwork==='none')return solid;
 const {CrossSection:C,Manifold:M}=module,cuts=[],weave=[],depth=p.wall+2*p.detailDepth+4;
 const rounded=(a,b,r)=>own(own(C.square([a-2*r,b-2*r],true)).offset(r,'Round',2,16));
 function pose(shape,side,offset){
  let out=own(shape.rotate([90,0,0]));
  return side===0?own(out.translate([0,-d/2+offset,0])):own(out.rotate([0,0,side*90]).translate([side*(w/2-offset),0,0]));
 }
 function wall(width,side){
  const cells=openworkCells(width,h,p,{pull:side===0&&pull});if(!cells.length)return;
  const profiles=cells.map(cell=>{
   const {width:a,height:b,row,col}=cell;let shape;
   if(p.openwork==='honeycomb')shape=own(new C([Array.from({length:6},(_,i)=>{const t=(30+i*60)*Math.PI/180;return [a/Math.sqrt(3)*Math.cos(t),a/Math.sqrt(3)*Math.sin(t)];})]));
   else if(p.openwork==='diamond')shape=own(new C([[[0,-b/2],[a/2,0],[0,b/2],[-a/2,0]]]));
   else if(p.openwork==='arches'){
    const r=a/2,base=own(C.square([a,b-r],true).translate([0,-r/2])),cap=own(C.circle(r,32).translate([0,b/2-r]));shape=own(base.add(cap));
   }else if(p.openwork==='woven')shape=rounded((row+col)%2?a*.55:a,(row+col)%2?b:b*.55,.6);
   else shape=rounded(a,b,Math.min(a/2-.01,p.openwork==='slots'?a/2:2));
   return own(shape.translate([cell.x,cell.z]));
  });
  cuts.push(pose(own(own(C.union(profiles)).extrude(depth)),side,p.wall+.05));
  if(p.openwork==='woven'){
   const bars=cells.map(c=>{
    const horizontal=(c.row+c.col)%2===0;
    return own(rounded(horizontal?c.width:.8,horizontal?.8:c.height,.25).translate([c.x+(horizontal?0:c.width/2+1.44),c.z+(horizontal?c.height/2+1.2:0)]));
   });
   weave.push(pose(own(own(C.union(bars)).extrude(.6)),side,.2));
  }
 }
 wall(w,0);if(p.openworkFaces==='front-sides'){wall(d,1);wall(d,-1);}
 if(weave.length)solid=own(solid.add(own(M.union(weave))));
 return cuts.length?own(solid.subtract(own(M.union(cuts)))):solid;
}
