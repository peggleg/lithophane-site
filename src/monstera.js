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
// Sweep through the curved lanes between the splits. Each secondary starts
// diagonally from the midrib, then curls towards its lobe tip instead of ending
// in a horizontal crossbar. Lower veins fan from the basal junction.
export const veinCurves=[
 [[.012,-.265],[-.045,-.06],[-.01,.24],[.02,.485]],
 [[.012,-.265],[.11,-.39],[.28,-.44],[.335,-.35]],
 [[.004,-.24],[.17,-.17],[.39,-.205],[.465,-.145]],
 [[.004,-.12],[.18,-.01],[.40,-.03],[.485,.025]],
 [[.008,-.005],[.17,.10],[.37,.105],[.445,.205]],
 [[.012,.10],[.14,.22],[.31,.215],[.35,.315]],
 [[.014,.24],[.095,.33],[.16,.37],[.16,.435]],
 [[.012,-.265],[-.11,-.39],[-.29,-.44],[-.345,-.34]],
 [[.004,-.225],[-.18,-.14],[-.40,-.205],[-.47,-.14]],
 [[.004,-.10],[-.18,.015],[-.40,-.015],[-.485,.04]],
 [[.008,.025],[-.17,.135],[-.36,.115],[-.44,.21]],
 [[.012,.125],[-.14,.22],[-.30,.23],[-.345,.32]],
 [[.014,.26],[-.09,.345],[-.155,.37],[-.155,.435]]
];
const midribPoints=[...cubicPoints([veinCurves[0]],128),veinCurves[0][3]];
function joinedVein(curve){const [a,b,c,d]=curve,index=midribPoints.findIndex(p=>p[1]>=a[1]),lo=midribPoints[Math.max(0,index-1)],hi=midribPoints[Math.max(0,index)],t=hi[1]===lo[1]?0:(a[1]-lo[1])/(hi[1]-lo[1]);return [[lo[0]+(hi[0]-lo[0])*t,a[1]],b,c,d];}
// Width varies smoothly along the curve. A round cap finishes the tip; using a
// constant-width polygon here creates the squared ends seen in the old leaf.
function stroke(points,startWidth,endWidth){const left=[],right=[];for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy),t=i/(points.length-1),r=(startWidth+(endWidth-startWidth)*(t*t*(3-2*t)))/2;left.push([points[i][0]-dy/length*r,points[i][1]+dx/length*r]);right.push([points[i][0]+dy/length*r,points[i][1]-dx/length*r]);}return [...left,...right.reverse()];}
// Keep anatomy in one coordinate system so every feature scales together.
const bladePoint=point=>point;
export function monsteraSections(module,own,width,depth){
 const {CrossSection:C}=module,envelope=own(new C([cubicPoints(edge).map(bladePoint)],'NonZero')),slits=splits.map(curve=>{const points=cubicPoints([curve],24);points.push(curve[3]);const slit=own(new C([splitStroke(points).map(bladePoint)],'NonZero'));return own(slit.add(own(C.circle(.005,24).translate(curve[3]))));}),raw=own(envelope.subtract(own(C.union(slits)))),b=raw.bounds(),cx=(b.min[0]+b.max[0])/2,cy=(b.min[1]+b.max[1])/2,sx=width/(b.max[0]-b.min[0]),sy=depth/(b.max[1]-b.min[1]);
 const transform=section=>own(section.translate([-cx,-cy]).scale([sx,sy]));
 const cutouts=holes.map(h=>{const a=h.angle*Math.PI/180,points=cubicPoints(aperture,12).map(([x,y])=>{const px=x*h.rx,py=y*h.ry;return [h.x+px*Math.cos(a)-py*Math.sin(a),h.y+px*Math.sin(a)+py*Math.cos(a)];});return own(new C([points.map(bladePoint)],'NonZero'));});
 const outline=transform(raw),veins=own(C.union(veinCurves.map((drawn,i)=>{const curve=i?joinedVein(drawn):drawn;const points=cubicPoints([curve],64);points.push(curve[3]);const scaled=points.map(bladePoint).map(([x,y])=>[(x-cx)*sx,(y-cy)*sy]),startWidth=i===0?1.15:[.92,.86,.98,.88,.82,.9][(i-1)%6],endWidth=i===0?.5:[.44,.48,.42,.46,.43,.45][(i-1)%6],strip=own(new C([stroke(scaled,startWidth,endWidth)],'NonZero')),tip=own(C.circle(endWidth/2,24).translate(scaled.at(-1)));return own(strip.add(tip));}))),safeVeins=own(veins.intersect(own(outline.offset(-1.2))));
 const bounds=outline.bounds(),tip=own(outline.intersect(own(C.square([width+2,.8],true).translate([0,bounds.min[1]+.4])))),tb=tip.bounds(),hanger={x:(tb.min[0]+tb.max[0])/2,y:bounds.min[1]+3.2,radius:1.6};
 const pad=own(C.circle(3.2,48).translate([hanger.x,hanger.y])),neckY=bounds.min[1]+Math.min(14,Math.max(6,depth*.1)),neckBand=own(outline.intersect(own(C.square([Math.max(12,width*.16),.5],true).translate([hanger.x,neckY])))),nb=neckBand.bounds(),neck=own(C.circle(1.6,40).translate([(nb.min[0]+nb.max[0])/2,neckY])),bridge=own(C.hull([pad,neck])),blade=own(outline.add(bridge)),hangingHole=own(C.circle(hanger.radius,48).translate([hanger.x,hanger.y]));
 return {outline:blade,holes:transform(own(C.union(cutouts))),veins:safeVeins,hanger,hangingHole};
}
