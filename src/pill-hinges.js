// Seven independent pin hinges, with their axes parallel to the row of days.
export function pillHinges(module,own,p,f,{add}){
 const {CrossSection:C,Manifold:M}=module,R=3.2,r=1+p.clearance,axisY=f.d/2+4.4,axisZ=p.height-R,ends=[[-8.4,-5.2],[5.2,8.4]],centre=[-5.2+p.clearance,5.2-p.clearance];
 const box=(w,d,h,x,y,z)=>own(C.square([w,d],true).extrude(h).translate([x,y,z]));
 const bore=own(own(C.circle(r,48)).add(own(new C([[[-r/Math.SQRT2,r/Math.SQRT2],[r/Math.SQRT2,r/Math.SQRT2],[0,r*Math.SQRT2]]],'NonZero'))));
 const along=(section,length,x,y,z)=>own(section.extrude(length).rotate([90,0,90]).translate([x,y,z]));
 const barrel=(a,b,y,z)=>own(along(own(C.circle(R,64)),b-a,a,y,z).subtract(along(bore,b-a+.2,a-.1,y,z)));
 function base(x){const a=[];for(const [left,right]of ends){const cx=x+(left+right)/2,wide=right-left,arm=box(wide,axisY-f.d/2+p.wall,2.8,cx,(axisY+f.d/2-p.wall)/2,axisZ-R),root=box(wide,p.wall,2,cx,f.d/2-p.wall/2,Math.max(0,axisZ-R-(4.4+p.wall)));a.push(barrel(x+left,x+right,axisY,axisZ),own(M.hull([arm,root])));}const cut=box(f.w+20,f.d+20,p.height+1,0,-10,f.baseHeight);return own(own(own(M.union(a)).subtract(own(M.union(ends.map(([l,r])=>along(bore,r-l+.2,x+l-.1,axisY,axisZ)))))).subtract(cut));}
 function lid(s){const [a,b]=centre,edge=-f.d/2+p.wall+.2,arm=box(b-a,edge+axisY,p.wall,0,(edge-axisY)/2,0);return own(own(s.add(own(M.union([barrel(a,b,-axisY,R),arm])))).subtract(along(bore,b-a+.2,a-.1,-axisY,R)));}
 function pin(i,day,x){const shaft=own(C.circle(1,48).extrude(17)),head=own(C.circle(2.4,48).extrude(1.2)),s=own(head.add(own(shaft.translate([0,0,1.19]))));add(`pill-hinge-pin-${i+1}-${day.toLowerCase()}`,'pill-hinge-pin',s,[x-9.6,axisY+f.baseY,axisZ],[0,Math.PI/2,0]);}
 return {base,lid,pin,axisY,axisZ,radius:R,pinDiameter:2,boreDiameter:2*r,centre,opening:110};
}
