// Removable leaf display: a pot, lift-out socket plate and one keyed stem per
// coaster. The coasters are reference meshes in this holder project, not extra
// printable objects: they keep their separate 5/5-layer project.
export function makeCoasterPlant(module,own,p,profile,{box,add,decorate}){
 const {CrossSection:C,Manifold:M}=module,wall=p.wall,gap=p.clearance,diameter=Math.min(140,Math.max(80,p.width*1.05)),potHeight=45,postWidth=6.4,plateFloor=2.4,socketHeight=10,ring=diameter/2-wall-11;
 const circle=own(C.circle(diameter/2,128)),cavity=own(C.circle(diameter/2-wall,128));
 const pot=own(decorate(circle,potHeight).subtract(own(cavity.extrude(potHeight).translate([0,0,wall]))));
 add('plant-display-pot','plant-pot',pot,[0,0,0]);
 const plateRadius=diameter/2-wall-gap,plateProfile=own(C.circle(plateRadius,128));let plate=own(plateProfile.extrude(plateFloor));
 const grip=Math.max(6,Math.min(10,p.depth*.075)),b=profile.bounds(),bottom=b.min[1],tip=own(profile.intersect(own(C.square([p.width+2,grip],true).translate([0,bottom+grip/2])))),tb=tip.bounds(),tipCentre=(tb.min[0]+tb.max[0])/2,tipWidth=tb.max[0]-tb.min[0],slotWidth=tipWidth+2*gap,slotThickness=p.height+2*gap,clipWidth=slotWidth+2*wall;
 // Separate height levels keep the wide leaves from crossing each other. Lower
 // tilt automatically for deep leaves so every long stem stays under 170 mm.
 let angle=60,low=potHeight+5,level;
 while(angle>=30){level=p.depth*Math.sin(angle*Math.PI/180)+p.height+12;if(low+level+grip*Math.sin(angle*Math.PI/180)+slotThickness+wall<168)break;angle-=5;}
 if(angle<30)throw Error('Reduce leaf depth or coaster thickness so the display stems fit the A1 mini.');
 const radians=angle*Math.PI/180,slots=[],references=[];
 const levels=[Math.ceil(p.coasterCount/2),Math.floor(p.coasterCount/2)];let index=0;
 for(let tier=0;tier<2;tier++)for(let j=0;j<levels[tier];j++){
  const theta=j*360/levels[0]+tier*180/levels[0],a=theta*Math.PI/180,x=-ring*Math.sin(a),y=ring*Math.cos(a),length=low+tier*level;
  // Rotate at origin, then position: square keys follow each leaf's heading.
  const outer=own(box(postWidth+2*gap+2*wall,postWidth+2*gap+2*wall,socketHeight,0,0,plateFloor).rotate([0,0,theta]).translate([x,y,0]));
  const hole=own(box(postWidth+2*gap,postWidth+2*gap,socketHeight+.02,0,0,plateFloor).rotate([0,0,theta]).translate([x,y,0]));plate=own(plate.add(own(outer.subtract(hole))));
  const head=own(box(clipWidth,grip+wall,slotThickness+wall,0,(grip-wall)/2,-slotThickness/2-wall).rotate([angle,0,0]).translate([0,0,length]));
  const stemTop=box(postWidth,postWidth,.1,0,0,length-12),headFloor=own(box(clipWidth,wall,.1,0,-wall/2,-slotThickness/2-wall).rotate([angle,0,0]).translate([0,0,length]));
  const transition=own(M.hull([stemTop,headFloor]));let stem=own(box(postWidth,postWidth,length-11.9).add(transition).add(head));
  const mouth=own(box(slotWidth,grip+.2,slotThickness+wall+1,0,(grip+.2)/2,-slotThickness/2).rotate([angle,0,0]).translate([0,0,length]));stem=own(stem.subtract(mouth));
  const name=`plant-stem-${++index}-${tier?'upper':'lower'}`;add(name,'plant-stem',stem,[x,y,wall+plateFloor],[0,0,a]);
  slots.push({name,x,y,rotation:theta,angle,length,tipCentre,bottom,grip,slotWidth,slotThickness,base:wall+plateFloor});
 }
 plate=own(plate.subtract(box(3,4,plateFloor+.1,0,plateRadius,0)));
 add('plant-socket-plate','plant-plate',plate,[0,0,wall]);
 return {width:diameter,depth:diameter,height:wall+plateFloor+low+level+p.depth*Math.sin(radians)+p.height,plant:{potBounds:pot.boundingBox(),diameter,potHeight,plateFloor,socketHeight,postWidth,tipWidth,tipCentre,bottom,grip,angle,slots},references};
}
