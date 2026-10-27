// Each lid snaps vertically onto two integral axles; no sideways pin access needed.
export function pillHinges(module,own,p,f){
 const {CrossSection:C,Manifold:M}=module,R=3.2,axle=1.5,r=axle+Math.min(p.clearance,.35),axisY=f.d/2+4.4,axisZ=p.height-R,clips=[[-6.4,-3.6],[3.6,6.4]];
 const box=(w,d,h,x,y,z)=>own(C.square([w,d],true).extrude(h).translate([x,y,z]));
 const along=(section,length,x,y,z)=>own(section.extrude(length).rotate([90,0,90]).translate([x,y,z]));
 function base(x){const pieces=[];for(const [a,b]of clips){for(const [l,u]of [[a-1.6,a-.35],[b+.35,b+1.6]]){const cx=x+(l+u)/2,arm=box(u-l,axisY-f.d/2+p.wall,2.8,cx,(axisY+f.d/2-p.wall)/2,axisZ-R),root=box(u-l,p.wall,2,cx,f.d/2-p.wall/2,Math.max(0,axisZ-R-(4.4+p.wall)));pieces.push(own(M.hull([arm,root])),along(own(C.circle(R,64)),u-l,x+l,axisY,axisZ));}pieces.push(along(own(C.circle(axle,64)),b-a+.9,x+a-.45,axisY,axisZ));}return own(own(M.union(pieces)).subtract(box(f.w+20,f.d+20,p.height+1,0,-10,f.baseHeight)));}
 function lid(s){const edge=-f.d/2+p.wall+.2,pieces=[s];for(const [a,b]of clips){const outer=own(C.circle(R,64)),hole=own(C.circle(r,64));let section=own(outer.subtract(hole));
 // 2.4 mm throat retains a 3 mm axle; flared mouth guides the snap. In print
 // coordinates the opening faces upwards (downwards after lid assembly).
 const mouth=own(new C([[[-1.2,0],[1.2,0],[1.2,2.1],[2.3,R+.1],[-2.3,R+.1],[-1.2,2.1]]],'NonZero'));section=own(section.subtract(mouth));
 pieces.push(along(section,b-a,a,-axisY,R),box(b-a,edge+axisY,p.wall,(a+b)/2,(edge-axisY)/2,0));}let result=own(M.union(pieces));for(const [a,b]of clips){result=own(result.subtract(along(own(C.circle(r,64)),b-a+.02,a-.01,-axisY,R)));}return result;}
 return {base,lid,axisY,axisZ,radius:R,axleDiameter:3,throat:2.4,boreDiameter:2*r,opening:110};
}
