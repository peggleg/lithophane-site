// Original curved drawing of a mature Monstera deliciosa: a pointed, cordate
// blade, uneven rounded lobes, deep marginal splits and inner fenestrations.
// Coordinates share one transform so the outline, holes and fitted holder agree.
const edge=[
 [[.02,.5],[.17,.40],[.43,.25],[.49,.02]],
 [[.49,.02],[.55,-.17],[.43,-.40],[.23,-.405]],
 [[.23,-.405],[.12,-.42],[.065,-.32],[.025,-.285]],
 [[.025,-.285],[.07,-.32],[.08,-.4],[.12,-.46]],
 [[.12,-.46],[.14,-.49],[.08,-.52],[.06,-.49]],
 [[.06,-.49],[.025,-.43],[.015,-.35],[-.025,-.295]],
 [[-.025,-.295],[-.075,-.32],[-.12,-.43],[-.25,-.405]],
 [[-.25,-.405],[-.44,-.39],[-.55,-.16],[-.49,.035]],
 [[-.49,.035],[-.43,.25],[-.17,.42],[.02,.5]]
];
const splits=[
 [[.47,.27],[.35,.28],[.25,.14],[.15,.17]],
 [[.57,.08],[.42,.12],[.30,.0],[.15,.025]],
 [[.57,-.10],[.40,-.06],[.29,-.17],[.15,-.14]],
 [[.47,-.31],[.32,-.32],[.23,-.27],[.15,-.27]],
 [[-.43,.30],[-.28,.28],[-.21,.20],[-.15,.22]],
 [[-.55,.12],[-.40,.14],[-.25,.055],[-.15,.065]],
 [[-.57,-.08],[-.40,-.05],[-.25,-.12],[-.15,-.11]],
 [[-.49,-.29],[-.32,-.31],[-.22,-.22],[-.15,-.235]]
];
function splitStroke(points){const left=[],right=[];for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),r=(.038-(.038-.015)*i/(points.length-1))/2;left.push([points[i][0]-dy/len*r,points[i][1]+dx/len*r]);right.push([points[i][0]+dy/len*r,points[i][1]-dx/len*r]);}return [...left,...right.reverse()];}

function cubicPoints(curves,steps=18){const points=[];for(const [a,b,c,d]of curves)for(let i=0;i<steps;i++){const t=i/steps,u=1-t;points.push([u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*d[0],u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*d[1]]);}return points;}
const aperture=[[[0,1],[.75,.85],[1,.2],[.6,-.5]],[[.6,-.5],[.3,-1],[-.2,-1],[-.6,-.6]],[[-.6,-.6],[-1,-.05],[-.7,.65],[0,1]]];
const holes=[
 {x:.065,y:.29,rx:.022,ry:.043,angle:-25},
 {x:.070,y:.125,rx:.024,ry:.055,angle:-34},
 {x:.075,y:-.045,rx:.025,ry:.060,angle:-28},
 {x:.065,y:-.235,rx:.022,ry:.044,angle:-37},
 {x:-.060,y:.205,rx:.021,ry:.042,angle:26},
 {x:-.070,y:.035,rx:.025,ry:.057,angle:35},
 {x:-.070,y:-.145,rx:.023,ry:.051,angle:29}
];
// Curved midrib and secondary veins, drawn in the blade's shared coordinates.
const veinCurves=[
 [[.02,-.31],[-.015,-.12],[.015,.17],[.02,.43]],
 [[-.002,-.22],[-.055,-.30],[-.16,-.35],[-.29,-.31]],
 [[.002,-.19],[.08,-.29],[.20,-.34],[.29,-.31]],
 [[-.003,-.12],[-.10,-.16],[-.26,-.12],[-.40,-.07]],
 [[.002,-.09],[.11,-.15],[.27,-.12],[.41,-.08]],
 [[.002,.025],[-.10,-.015],[-.28,.025],[-.41,.065]],
 [[.007,.055],[.12,.005],[.30,.065],[.435,.12]],
 [[.013,.18],[-.08,.14],[-.23,.20],[-.31,.28]],
 [[.014,.21],[.10,.18],[.24,.25],[.32,.30]]
];
function stroke(points,width){const left=[],right=[];for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy),r=width/2;left.push([points[i][0]-dy/length*r,points[i][1]+dx/length*r]);right.push([points[i][0]+dy/length*r,points[i][1]-dx/length*r]);}return [...left,...right.reverse()];}
// A fuller cordate base and a longer tapered tip avoid a round, hand-like
// silhouette. Apply the same gentle drawing transform to every leaf detail.
function bladePoint([x,y]){const edgeWeight=Math.max(0,Math.min(1,(Math.abs(x)-.15)/.15)),fullness=Math.max(-.22,Math.min(.25,-y*.7-.03));return [x*(1+edgeWeight*fullness),y>.27?.27+(y-.27)*1.45:y];}
export function monsteraSections(module,own,width,depth){
 const {CrossSection:C}=module,envelope=own(new C([cubicPoints(edge).map(bladePoint)],'NonZero')),slits=splits.map(curve=>{const points=cubicPoints([curve],24);points.push(curve[3]);return own(new C([splitStroke(points).map(bladePoint)],'NonZero'));}),raw=own(envelope.subtract(own(C.union(slits)))),b=raw.bounds(),cx=(b.min[0]+b.max[0])/2,cy=(b.min[1]+b.max[1])/2,sx=width/(b.max[0]-b.min[0]),sy=depth/(b.max[1]-b.min[1]);
 const transform=section=>own(section.translate([-cx,-cy]).scale([sx,sy]));
 const cutouts=holes.map(h=>{const a=h.angle*Math.PI/180,points=cubicPoints(aperture,12).map(([x,y])=>{const px=x*h.rx,py=y*h.ry;return [h.x+px*Math.cos(a)-py*Math.sin(a),h.y+px*Math.sin(a)+py*Math.cos(a)];});return own(new C([points.map(bladePoint)],'NonZero'));});
 const outline=transform(raw),veins=own(C.union(veinCurves.map((curve,i)=>{const points=cubicPoints([curve],24);points.push(curve[3]);return own(new C([stroke(points.map(bladePoint).map(([x,y])=>[(x-cx)*sx,(y-cy)*sy]),i===0?1.1:.8)],'NonZero'));}))),safeVeins=own(veins.intersect(own(outline.offset(-1.2))));
 const bounds=outline.bounds(),tip=own(outline.intersect(own(C.square([width+2,.8],true).translate([0,bounds.min[1]+.4])))),tb=tip.bounds(),hanger={x:(tb.min[0]+tb.max[0])/2,y:bounds.min[1]+3.2,radius:1.6};
 const pad=own(C.circle(3.2,48).translate([hanger.x,hanger.y])),neckY=bounds.min[1]+Math.min(14,Math.max(6,depth*.1)),neckBand=own(outline.intersect(own(C.square([Math.max(12,width*.16),.5],true).translate([hanger.x,neckY])))),nb=neckBand.bounds(),neck=own(C.circle(1.6,40).translate([(nb.min[0]+nb.max[0])/2,neckY])),bridge=own(C.hull([pad,neck])),blade=own(outline.add(bridge)),hangingHole=own(C.circle(hanger.radius,48).translate([hanger.x,hanger.y]));
 return {outline:blade,holes:transform(own(C.union(cutouts))),veins:safeVeins,hanger,hangingHole};
}
