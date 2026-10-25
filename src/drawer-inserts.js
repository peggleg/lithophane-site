export const drawerSheetThickness=1;
export const drawerInsertActive=p=>p.kind==='drawers'&&p.openwork!=='none'&&p.drawerInserts==='sheet';
export const drawerCornerRadius=(w,d,p)=>drawerInsertActive(p)?Math.min(p.wall+1,w/5,d/5):Math.min(9,w/5,d/5);
// All mating dimensions and pattern coverage derive from these same sheets.
export function drawerInsertLayout(w,d,h,p){
 if(!drawerInsertActive(p))return [];
 const gap=p.clearance,lip=1.2,r=drawerCornerRadius(w,d,p),wallGap=.2,normal=p.wall+wallGap+drawerSheetThickness/2,bottom=p.wall+.2,top=h-.4;
 const front={side:0,name:'front',min:-w/2+p.wall+gap,max:w/2-p.wall-gap,normal,bottom,top};
 const sheets=[front];
 if(p.openworkFaces==='front-sides'){
  const start=-d/2+normal+drawerSheetThickness/2+gap+lip+.6,end=d/2-r-gap;
  for(const side of [1,-1])sheets.push({side,name:side===1?'right':'left',min:start,max:end,normal,bottom,top});
 }
 return sheets.map(s=>({...s,width:s.max-s.min,height:top-bottom,centre:(s.min+s.max)/2,thickness:drawerSheetThickness,gap,lip,wallGap,bottomLipHeight:1.2}));
}
export function addDrawerInsertRails(module,own,solid,w,d,h,p,{box}){
 const sheets=drawerInsertLayout(w,d,h,p);if(!sheets.length)return solid;
 for(const s of sheets){
  const end=s.normal+s.thickness/2+s.gap+s.lip,start=p.wall-.2,blocks=[];
  function place(u,n,width,depth,height,z){const b=box(width,depth,height,u,n,z);return s.side===0?own(b.translate([0,-d/2,0])):own(b.rotate([0,0,s.side*90]).translate([s.side*w/2,0,0]));}
  // Side guides use u along the side wall. Mirroring their in-plane coordinate
  // makes both slots match the common min/max measured in world Y.
  const lo=s.side===-1?-s.max:s.min,hi=s.side===-1?-s.min:s.max;
  for(const [a,b]of [[lo-s.gap-s.lip,lo+s.lip],[hi-s.lip,hi+s.gap+s.lip]])blocks.push(place((a+b)/2,(start+end)/2,b-a,end-start,h-p.wall-.18,p.wall-.02));
  // The perforated wall itself is the front stop: only 0.2 mm separates it
  // from the sheet. Clear divider ends as well as the small rounded corners.
  const slotEnd=s.normal+s.thickness/2+s.gap;
  const slot=place((lo+hi)/2,(p.wall+slotEnd)/2,hi-lo+2*s.gap,slotEnd-p.wall,h+1,p.wall);
  solid=own(solid.subtract(slot));
  const rails=own(own(module.Manifold.union(blocks)).subtract(slot));
  const bottomLip=place((lo+hi)/2,slotEnd+s.lip/2,hi-lo+2*s.gap,s.lip,s.bottomLipHeight+.02,p.wall-.02);
  solid=own(own(solid.add(rails)).add(bottomLip));
 }
 return solid;
}
export function drawerSheetSolid(module,own,s,w,h,p){
 const {CrossSection:C}=module;
 let profile=own(C.square([s.width,s.height],true).translate([0,s.height/2]));
 if(s.side===0){const gap=s.gap,nw=Math.min(26,w/3)+2*gap,nh=14+2*gap,r=Math.min(4+gap,nw/2-.01),notch=own(own(C.square([nw-2*r,nh-2*r],true)).offset(r,'Round',2,32).translate([0,h+1-s.bottom]));profile=own(profile.subtract(notch));}
 if(s.side!==0)profile=own(profile.rotate(90).translate([s.height,0]));
 return own(profile.extrude(s.thickness));
}
