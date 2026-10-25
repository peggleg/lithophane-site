// Integral lid pivots clip into closed bearings by flexing the upper bin wall.
export function makeBin(module,own,p,fit,{outline,container,box,add}){
 const {CrossSection:C,Manifold:M}=module,w=fit.width,H=p.height,axis=H-fit.pivot,outer=outline(w,w),opening=own(outer.offset(-fit.rimWall)),profile=own(opening.offset(-fit.lidGap));
 let body=container(w,w,H,false,false);
 const band=own(own(outer.extrude(fit.rimHeight)).subtract(own(opening.extrude(fit.rimHeight))));body=own(body.add(own(band.translate([0,0,H-fit.rimHeight]))));
 const ramp=fit.rimWall-p.wall,lower=own(own(outer.offset(-p.wall)).extrude(.01)),upper=own(opening.extrude(.01).translate([0,0,ramp])),shoulder=own(own(outer.extrude(ramp+.01)).subtract(own(M.hull([lower,upper]))));body=own(body.add(own(shoulder.translate([0,0,H-fit.rimHeight-ramp]))));
 let lid=own(profile.extrude(fit.lidThickness));const edge=profile.bounds().max[0];
 // Coordinates for the lid are top-down print coordinates: the flat roof is on
 // the bed, hinge bosses and the stop tabs grow upward from it.
 for(const side of [-1,1]){
  const pad=own(box(w/2-edge-.2,11.5,11.5,side*(edge+.2+(w/2-edge-.2)/2),0,H-11.5).intersect(own(outer.extrude(H))));body=own(body.add(pad));
  const bore=own(C.circle(fit.bearingRadius,48).extrude(p.width/2+2-(w/2-fit.rimWall-.8)).rotate([0,side*90,0]).translate([side*(w/2-fit.rimWall-.8),0,axis]));body=own(body.subtract(bore));
  const boss=own(C.circle(fit.bossRadius,48).extrude(7.6).rotate([0,side*90,0]).translate([side*(edge-6),0,fit.pivot]));lid=own(lid.add(boss));
  const start=edge+1.4,end=p.width/2-.6,straight=end-.8-start;
  const shaft=own(C.circle(fit.pinRadius,48).extrude(straight)),tip=own(C.circle(fit.pinRadius,48).extrude(.8,0,0,[.72,.72]).translate([0,0,straight]));
  lid=own(lid.add(own(own(shaft.add(tip)).rotate([0,side*90,0]).translate([side*start,0,fit.pivot]))));
  lid=own(lid.add(box(1.8,1.2,4.4,side*(edge+.7),0,fit.pivot)));
  const counter=own(C.circle(fit.bossRadius+.3,64).extrude(2.3).rotate([0,side*90,0]).translate([side*(edge-.4),0,axis]));
  const disk=own(C.circle(4.8,96)),half=own(C.square([11,5.45],true).translate([0,-2.075])),trackProfile=own(disk.intersect(half));
  const track=own(trackProfile.extrude(2.3).rotate([90,0,0]).rotate([0,0,side*90]).translate([side*(edge-.4),0,axis]));
  body=own(body.subtract(own(counter.add(track))));
 }
 add('bin-body-captive-pivots','bin',body,[0,0,0]);add('thin-swing-lid-with-stops','lid',lid,[0,0,H],[Math.PI,0,0]);
 return {pivot:[0,0,fit.pivot]};
}
