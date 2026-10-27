// Front cantilever detent. A shallow wall pocket captures the ramped tooth;
// the existing finger scallop exposes the arm for an inward press to release.
export function pillCatch(module,own,p,f){
 const {CrossSection:C}=module,width=4,arm=.9,length=6,gap=.3,engagement=.35,front=f.d/2-p.wall,y=front-gap-arm/2;
 const box=(w,d,h,x,cy,z)=>own(C.square([w,d],true).extrude(h).translate([x,cy,z]));
 const stem=box(width,arm,length+.05,0,y,p.wall-.05);
 const toothProfile=own(new C([[[front-gap-.1,p.wall+4.6],[front+engagement,p.wall+5.4],[front-gap-.1,p.wall+length]]],'NonZero'));
 const tooth=own(toothProfile.extrude(width).rotate([90,0,90]).translate([-width/2,0,0]));
 // section coords (Y,Z) become (Y,Z), extrusion becomes X.
 const tab=own(stem.add(tooth));
 function pocket(x){return box(width+.6,.65,2.3,x,-front-.225,f.baseHeight-6.35);}
 return {tab,pocket,width,arm,length,gap,engagement,front,release:.8};
}
