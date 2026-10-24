import {finishInset} from './desk-settings.js';
export const isStorage=p=>['storage','storage-pots'].includes(p.kind);
export function divisionWeights(text,count,label){if(!String(text??'').trim())return Array(count).fill(1);const weights=String(text).split(',').map(x=>Number(x.trim()));if(weights.length!==count||weights.some(x=>!Number.isFinite(x)||x<=0||x>100))throw Error(`Enter ${count} positive ${label} shares, separated by commas, or leave blank for equal sizes.`);return weights;}
export function storageLayout(p){
 const inset=finishInset(p),w=p.width-2*inset-2*p.wall,d=p.depth-2*inset-2*p.wall,removable=p.kind==='storage-pots',gap=removable?0:p.wall;
 const widths=divisionWeights(p.columnShares,p.columns,'column'),depths=divisionWeights(p.rowShares,p.rows,'row');
 const distribute=(shares,total)=>{const sum=shares.reduce((a,b)=>a+b,0),usable=total-(shares.length-1)*gap;let edge=-total/2;return shares.map(value=>{const size=usable*value/sum,centre=edge+size/2;edge+=size+gap;return {size,centre};});};
 const xs=distribute(widths,w),ys=distribute(depths,d);
 return {width:w,depth:d,xs,ys,cells:ys.flatMap((y,row)=>xs.map((x,col)=>({name:`storage-pot-${row+1}-${col+1}`,x:x.centre,y:y.centre,width:x.size,depth:y.size}))),bodyHeight:p.height-(p.storageLid==='lift'?p.wall:0),insertRecess:p.storageLid==='lift'?3.8:.8};
}
export function makeStorage(module,own,p,{round,ribs,hollowBox,add}){
 const {CrossSection:C}=module,l=storageLayout(p),inset=finishInset(p),w=p.width-2*inset,d=p.depth-2*inset,outer=round(w,d),inside=own(outer.offset(-p.wall));
 let body=hollowBox(outer,l.bodyHeight);
 if(p.kind==='storage'){
  const partitions=[],dividerHeight=l.bodyHeight-p.wall-(p.storageLid==='lift'?3.4:0);
  for(let i=0;i<l.xs.length-1;i++){const x=l.xs[i].centre+l.xs[i].size/2+p.wall/2;partitions.push(own(C.square([p.wall,l.depth+.1],true).translate([x,0])));}
  for(let i=0;i<l.ys.length-1;i++){const y=l.ys[i].centre+l.ys[i].size/2+p.wall/2;partitions.push(own(C.square([l.width+.1,p.wall],true).translate([0,y])));}
  if(partitions.length){const field=own(C.union(partitions)),clip=own(field.intersect(own(inside.offset(.02))));body=own(body.add(own(clip.extrude(dividerHeight+.02).translate([0,0,p.wall-.02]))));}
 }
 body=ribs(body,w,d,l.bodyHeight);add(p.kind==='storage'?'compartment-box':'storage-pot-tray','storage-body',body,[0,0,0]);
 if(p.kind==='storage-pots'){
  const safe=own(inside.offset(-p.clearance)),height=l.bodyHeight-p.wall-l.insertRecess;
  for(const cell of l.cells){const profile=own(round(cell.width-2*p.clearance,cell.depth-2*p.clearance,3).translate([cell.x,cell.y])),clipped=own(profile.intersect(safe)),local=own(clipped.translate([-cell.x,-cell.y]));add(cell.name,'inner-box',hollowBox(local,height),[cell.x,cell.y,p.wall]);const b=own(local.offset(-p.wall)).bounds();add.usable([b.max[0]-b.min[0],b.max[1]-b.min[1],height-p.wall]);}
 }
 if(p.storageLid==='lift'){
  const lipOuter=own(inside.offset(-p.clearance)),lipInner=own(lipOuter.offset(-Math.min(1.6,p.wall))),band=own(lipOuter.subtract(lipInner));
  // Lid top on bed: roof first, then a 3 mm locating lip; no unsupported skirt.
  const lid=own(own(outer.extrude(p.wall)).add(own(band.extrude(3.02).translate([0,0,p.wall-.02]))));
  add('storage-lift-off-lid','storage-lid',lid,[0,0,p.height],[Math.PI,0,0]);
 }
 return l;
}
