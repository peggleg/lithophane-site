// Shared accessory front plane, with two upper lift-off hooks and lower
// locating pegs. No wall-side nut, release pin or screw is removed to move it.
export function quickPegboardBack(K,p,width=58){const {C,M,own,box}=K,T=p.boardThickness??5,W=Math.max(50,width),features=[box(W,7,47,0,-3.5,-27,4)];
 for(const x of [-20,20]){
  features.push(own(K.soft(own(C.circle(3.2,48)),4,.5).translate([x,-3.5,16])));
  features.push(own(C.circle(1.7,48).extrude(T+6.1).rotate([-90,0,0]).translate([x,-3.5,20])));
  features.push(own(M.sphere(1.7,32).translate([x,T+2.6,20])),K.cyl(1.7,2.3,x,T+2.6,20),own(M.sphere(1.7,32).translate([x,T+2.6,22.3])));
  features.push(own(M.cylinder(T-.6,2.2,2.2,48).rotate([-90,0,0]).translate([x,-.2,-20])),own(M.cylinder(1.2,2.2,1.2,48).rotate([-90,0,0]).translate([x,T-.8,-20])));
 }
 return own(M.union(features));
}
