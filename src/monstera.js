// Original curved drawing of a mature Monstera deliciosa: a pointed, cordate
// blade, uneven rounded lobes, deep marginal splits and inner fenestrations.
// Coordinates share one transform so the outline, holes and fitted holder agree.
// Tip is +Y; petiole and the deep basal cleft are -Y. The two sides
// deliberately differ, as in the guide leaf, instead of repeating a hand shape.
const edge=[
 [[.015,.52],[.10,.40],[.32,.38],[.43,.22]],
 [[.43,.22],[.54,.06],[.54,-.18],[.41,-.34]],
 [[.41,-.34],[.30,-.48],[.10,-.48],[.025,-.32]],
 [[.025,-.32],[.045,-.37],[.055,-.43],[.055,-.48]],
 [[.055,-.48],[.055,-.51],[.005,-.52],[.005,-.48]],
 [[.005,-.48],[.005,-.42],[-.005,-.36],[-.025,-.32]],
 [[-.025,-.32],[-.10,-.47],[-.31,-.49],[-.43,-.32]],
 [[-.43,-.32],[-.55,-.17],[-.53,.06],[-.42,.22]],
 [[-.42,.22],[-.32,.36],[-.12,.40],[.015,.52]]
];
// Deep curved cuts point back towards the midrib. Secondary veins sit in the
// centres of the lobes BETWEEN these cuts, never running straight across them.
const splits=[
 [[.32,.42],[.28,.31],[.14,.29],[.085,.20]],
 [[.49,.28],[.37,.22],[.22,.15],[.095,.105]],
 [[.57,.12],[.40,.10],[.23,.02],[.10,-.015]],
 [[.58,-.065],[.40,-.055],[.25,-.10],[.105,-.13]],
 [[.50,-.26],[.36,-.23],[.22,-.23],[.10,-.25]],
 [[-.28,.43],[-.26,.31],[-.15,.29],[-.09,.22]],
 [[-.48,.29],[-.36,.24],[-.22,.16],[-.095,.125]],
 [[-.57,.12],[-.41,.11],[-.23,.055],[-.10,.01]],
 [[-.58,-.07],[-.42,-.06],[-.25,-.09],[-.105,-.11]],
 [[-.52,-.26],[-.38,-.24],[-.23,-.22],[-.10,-.235]]
];
function splitStroke(points){const left=[],right=[];for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),t=i/(points.length-1),r=(.045*(1-t)**.8+.010)/2;left.push([points[i][0]-dy/len*r,points[i][1]+dx/len*r]);right.push([points[i][0]+dy/len*r,points[i][1]-dx/len*r]);}return [...left,...right.reverse()];}

function cubicPoints(curves,steps=18){const points=[];for(const [a,b,c,d]of curves)for(let i=0;i<steps;i++){const t=i/steps,u=1-t;points.push([u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*d[0],u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*d[1]]);}return points;}
const aperture=[[[0,1],[.75,.85],[1,.2],[.6,-.5]],[[.6,-.5],[.3,-1],[-.2,-1],[-.6,-.6]],[[-.6,-.6],[-1,-.05],[-.7,.65],[0,1]]];
const holes=[
 {x:.061,y:.105,rx:.017,ry:.027,angle:-25},
 {x:.065,y:-.025,rx:.018,ry:.029,angle:-34},
 {x:.068,y:-.155,rx:.018,ry:.025,angle:-28},
 {x:.14,y:-.32,rx:.018,ry:.026,angle:-37},
 {x:-.060,y:.25,rx:.017,ry:.025,angle:26},
 {x:-.063,y:-.005,rx:.018,ry:.028,angle:35},
 {x:-.066,y:-.135,rx:.018,ry:.026,angle:29}
];
// A curved midrib and six slender, upward-sweeping veins per side. The lower
// veins fan out from the petiole, as in the supplied botanical guide.
export const veinCurves=[
 [[.012,-.265],[-.008,-.12],[.015,.19],[.015,.485]],
 [[.012,-.265],[.08,-.35],[.22,-.43],[.32,-.37]],
 [[.006,-.24],[.12,-.16],[.30,-.20],[.455,-.21]],
 [[.003,-.12],[.14,-.025],[.32,-.005],[.485,.005]],
 [[.005,.005],[.15,.08],[.31,.09],[.465,.14]],
 [[.01,.135],[.14,.185],[.26,.23],[.365,.29]],
 [[.014,.27],[.09,.32],[.14,.39],[.165,.425]],
 [[.012,-.265],[-.07,-.35],[-.23,-.43],[-.33,-.36]],
 [[.008,-.225],[-.12,-.145],[-.30,-.195],[-.46,-.21]],
 [[.003,-.10],[-.14,-.015],[-.32,-.005],[-.485,.005]],
 [[.005,.03],[-.14,.10],[-.31,.10],[-.46,.15]],
 [[.01,.155],[-.13,.205],[-.25,.25],[-.355,.30]],
 [[.014,.29],[-.075,.34],[-.13,.40],[-.16,.425]]
];
function stroke(points,width){const left=[],right=[];for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy),r=width/2;left.push([points[i][0]-dy/length*r,points[i][1]+dx/length*r]);right.push([points[i][0]+dy/length*r,points[i][1]-dx/length*r]);}return [...left,...right.reverse()];}
// Keep anatomy in one coordinate system so every feature scales together.
const bladePoint=point=>point;
export function monsteraSections(module,own,width,depth){
 const {CrossSection:C}=module,envelope=own(new C([cubicPoints(edge).map(bladePoint)],'NonZero')),slits=splits.map(curve=>{const points=cubicPoints([curve],24);points.push(curve[3]);const slit=own(new C([splitStroke(points).map(bladePoint)],'NonZero'));return own(slit.add(own(C.circle(.005,24).translate(curve[3]))));}),raw=own(envelope.subtract(own(C.union(slits)))),b=raw.bounds(),cx=(b.min[0]+b.max[0])/2,cy=(b.min[1]+b.max[1])/2,sx=width/(b.max[0]-b.min[0]),sy=depth/(b.max[1]-b.min[1]);
 const transform=section=>own(section.translate([-cx,-cy]).scale([sx,sy]));
 const cutouts=holes.map(h=>{const a=h.angle*Math.PI/180,points=cubicPoints(aperture,12).map(([x,y])=>{const px=x*h.rx,py=y*h.ry;return [h.x+px*Math.cos(a)-py*Math.sin(a),h.y+px*Math.sin(a)+py*Math.cos(a)];});return own(new C([points.map(bladePoint)],'NonZero'));});
 const outline=transform(raw),veins=own(C.union(veinCurves.map((curve,i)=>{const points=cubicPoints([curve],24);points.push(curve[3]);return own(new C([stroke(points.map(bladePoint).map(([x,y])=>[(x-cx)*sx,(y-cy)*sy]),i===0?1.25:.8)],'NonZero'));}))),safeVeins=own(veins.intersect(own(outline.offset(-1.2))));
 const bounds=outline.bounds(),tip=own(outline.intersect(own(C.square([width+2,.8],true).translate([0,bounds.min[1]+.4])))),tb=tip.bounds(),hanger={x:(tb.min[0]+tb.max[0])/2,y:bounds.min[1]+3.2,radius:1.6};
 const pad=own(C.circle(3.2,48).translate([hanger.x,hanger.y])),neckY=bounds.min[1]+Math.min(14,Math.max(6,depth*.1)),neckBand=own(outline.intersect(own(C.square([Math.max(12,width*.16),.5],true).translate([hanger.x,neckY])))),nb=neckBand.bounds(),neck=own(C.circle(1.6,40).translate([(nb.min[0]+nb.max[0])/2,neckY])),bridge=own(C.hull([pad,neck])),blade=own(outline.add(bridge)),hangingHole=own(C.circle(hanger.radius,48).translate([hanger.x,hanger.y]));
 return {outline:blade,holes:transform(own(C.union(cutouts))),veins:safeVeins,hanger,hangingHole};
}
