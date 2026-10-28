import {plantPot} from './coaster-plant-pot.js';
// One modular trunk carries two tiers of branches. Leaves hang by their stem
// holes on upward pegs; no separate leaf posts extend down into the pot.
export function makeCoasterPlant(module,own,p,profile,hanger,{box,add,decorate}){
 const {CrossSection:C,Manifold:M}=module,wall=p.wall,gap=p.clearance,planter=plantPot(module,own,p,{decorate}),{pot,plate,diameter,potHeight,plateFloor,socketHeight,postWidth,base}=planter;
 add('plant-display-pot','plant-pot',pot,[0,0,0]);
 const angle=-60,radians=Math.PI/3,sag=p.depth*Math.sin(radians)+p.height,low=potHeight+sag+12-base,level=sag+12,high=low+level,reach=Math.max(34,p.width*.43),slots=[],references=[],levels=[Math.ceil(p.coasterCount/2),Math.floor(p.coasterCount/2)];
 let trunk=own(C.circle(8,64).extrude(high+2));trunk=own(trunk.subtract(box(30,30,12,0,0,0)));trunk=own(trunk.add(box(postWidth,postWidth,12)));
 for(const height of [low,high]){const a=own(C.circle(8,64).extrude(.1).translate([0,0,height-20])),b=own(C.circle(14,64).extrude(12).translate([0,0,height-14])),c=own(C.circle(8,64).extrude(.1).translate([0,0,height+1.9]));trunk=own(trunk.add(own(M.hull([a,b,c]))));}
 let index=0;
 function stroke(points,width){const left=[],right=[];for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),r=width/2;left.push([points[i][0]-dy/len*r,points[i][1]+dx/len*r]);right.push([points[i][0]+dy/len*r,points[i][1]-dx/len*r]);}return own(new C([[...left,...right.reverse()]],'NonZero'));}
 for(let tier=0;tier<2;tier++)for(let j=0;j<levels[tier];j++){
  const theta=j*360/levels[0]+tier*180/levels[0],a=theta*Math.PI/180,height=tier?high:low,n=[Math.sin(radians),Math.cos(radians)],back=p.height/2+gap+2.5,end=[reach-n[0]*back,-n[1]*back],points=[];
  for(let i=0;i<=24;i++){const t=i/24,u=1-t;points.push([u**3*17+3*u*u*t*23+3*u*t*t*(end[0]-8)+t**3*end[0],u**3*(-8)+3*u*u*t*(-8)+3*u*t*t*(end[1]-3)+t**3*end[1]]);}
  const rod=stroke(points,5),root=own(C.square([9,8],true).translate([12,-8])),stop=own(C.circle(2.5,40).translate(end));const rootRound=own(C.circle(2.5,40).translate([17,-8]));let branch=own(own(own(rod.add(root)).add(rootRound)).add(stop));
  const start=[reach-n[0]*(p.height/2+gap+3),-n[1]*(p.height/2+gap+3)],finish=[reach+n[0]*(p.height/2+3),n[1]*(p.height/2+3)],peg=stroke([start,finish],1.8);branch=own(branch.add(peg));
  const solid=own(branch.extrude(1.8)),name=`plant-branch-${++index}-${tier?'upper':'lower'}`;
  add(name,'plant-branch',solid,[-.9*Math.cos(a),-.9*Math.sin(a),base+height],[Math.PI/2,0,a+Math.PI/2]);
  // Exported branch meshes lie flat; assembled rotation is extrinsic X then Z.
  slots.push({name,x:-reach*Math.sin(a),y:reach*Math.cos(a),z:base+height,rotation:theta,angle,tier,hookNormal:[-n[0]*Math.sin(a),n[0]*Math.cos(a),n[1]],reach});
  const cut=own(box(1.8+2*gap,12,8+2*gap,0,12.5,height-12-gap).rotate([0,0,theta]));trunk=own(trunk.subtract(cut));
 }
 // Split only in the straight portions, keeping every hub and socket intact.
 const ranges=[];let at=0;
 for(const [end,hub]of [[low-20,false],[low+2,true],[high-20,false],[high+2,true]]){const count=hub?1:Math.max(1,Math.ceil((end-at)/150)),size=(end-at)/count;for(let k=0;k<count;k++)ranges.push([at+k*size,at+(k+1)*size]);at=end;}
 for(let i=0;i<ranges.length;i++){
  const [start,end]=ranges[i],clip=box(40,40,end-start,0,0,start);let segment=own(trunk.intersect(clip));
  if(i>0)segment=own(segment.subtract(box(postWidth+2*gap,postWidth+2*gap,10.2,0,0,start-.01)));
  if(i<ranges.length-1)segment=own(segment.add(box(postWidth,postWidth,10.02,0,0,end-.02)));
  segment=own(segment.translate([0,0,-start]));add(`plant-trunk-${i+1}-of-${ranges.length}`,'plant-trunk',segment,[0,0,base+start]);
 }
 add('plant-socket-plate','plant-plate',plate,[0,0,planter.plateTop],[Math.PI,0,0]);
 return {width:diameter,depth:diameter,height:base+high+2,plant:{potBounds:pot.boundingBox(),diameter,potHeight,baseDiameter:planter.baseDiameter,plateTop:planter.plateTop,plateFloor,socketHeight,postWidth,hanger,angle,slots,trunkSections:ranges.length},references};
}
