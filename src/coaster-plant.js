import {plantPot} from './coaster-plant-pot.js';
// Leaves and rounded branches circle the complete trunk in staggered tiers.
export function makeCoasterPlant(module,own,p,profile,hanger,{box,add,decorate}){
 const {CrossSection:C,Manifold:M}=module,gap=p.clearance,planter=plantPot(module,own,p,{decorate}),{pot,plate,diameter,potHeight,plateFloor,socketHeight,postWidth,base}=planter;
 add('plant-display-pot','plant-pot',pot,[0,0,0]);
 const rodRadius=3+Math.max(0,p.width-120)*.015,branchThickness=rodRadius,keyHeight=Math.max(8,2*rodRadius+1),pegOffset=rodRadius-3;
 const angle=-70,sin=Math.sin(70*Math.PI/180),cos=Math.cos(70*Math.PI/180),back=p.height/2+gap+2.5,sag=p.depth*sin+p.height,low=potHeight+sag-base-cos*back,level=sag+12,high=low+level,slots=[],references=[],configs=[];
 for(let i=0;i<p.coasterCount;i++){const tier=i%2===0?1:0;configs.push({tier,side:1,beta:(-60+i*360/p.coasterCount)*Math.PI/180,end:Math.max(36,p.width*.7),height:(tier?high:low)+i*6/(p.coasterCount-1)});}
 configs.sort((a,b)=>a.tier-b.tier||a.height-b.height);
 const nodes=[...new Set(configs.map(c=>c.height))].sort((a,b)=>a-b),total=nodes.at(-1)+3,stemR=z=>7.5-.8*Math.max(0,Math.min(1,z/total));
 let trunk=own(M.cylinder(total,7.5,6.7,64));trunk=own(trunk.subtract(box(30,30,12,0,0,0)));trunk=own(trunk.add(box(postWidth,postWidth,12)));
 for(const height of nodes){const sections=[[height-18,stemR(height-18)],[height-10,10.5],[height-3,10.5],[height+3,stemR(height+3)]].map(([z,r])=>own(own(C.circle(r,64)).extrude(.1).translate([0,0,z])));trunk=own(trunk.add(own(M.hull(sections))));}
 function roundedTube(points){const spheres=points.map(([x,y])=>own(M.sphere(rodRadius,24).translate([x,y,0]))),links=[];for(let i=1;i<spheres.length;i++)links.push(own(M.hull([spheres[i-1],spheres[i]])));return own(M.union(links));}
 let index=0;
 for(const c of configs){
  const {side,sign=side,height,end}=c,B=[Math.cos(c.beta),Math.sin(c.beta)],Q=[Math.sin(c.beta),-Math.cos(c.beta)],normal=[B[0]*sin,B[1]*sin,cos],leafRotation=c.beta*180/Math.PI-90,points=[];
  for(let i=0;i<=16;i++){const t=i/16,u=1-t;points.push([u**3*sign*13.5+3*u*u*t*sign*28+3*u*t*t*(end-sign*18)+t**3*end,u**3*(-8)+3*u*u*t*(-7)+3*u*t*t*6+t**3*10]);}
  const keyProfile=own(own(C.square([7.4,keyHeight-1.6],true)).offset(.8,'Round',2,16).translate([sign*9.5,-8])),key=own(keyProfile.extrude(branchThickness));let branch=own(roundedTube(points).add(key));
  const n=[normal[0]*B[0]+normal[1]*B[1],normal[2],Math.max(0,normal[0]*Q[0]+normal[1]*Q[1])],pegLength=p.height+gap+7,peg=own(M.cylinder(pegLength,.9,.9,24).rotate([0,Math.acos(Math.min(1,n[2]))*180/Math.PI,Math.atan2(n[1],n[0])*180/Math.PI]).translate([end+n[0]*pegOffset,10+n[1]*pegOffset,.9+n[2]*pegOffset]));
  const stop=own(M.sphere(2.3,20).translate([end+n[0]*pegOffset,10+n[1]*pegOffset,.9+n[2]*pegOffset]));branch=own(M.union([branch,peg,stop]));
  // Flat back and rounded front: these are real curved meshes with bed support.
  const bounds=branch.boundingBox();branch=own(branch.intersect(box(bounds.max[0]-bounds.min[0]+2,bounds.max[1]-bounds.min[1]+2,30,(bounds.max[0]+bounds.min[0])/2,(bounds.max[1]+bounds.min[1])/2,0)));
  const assembly=[-branchThickness/2*Q[0],-branchThickness/2*Q[1],base+height],name=`plant-branch-${++index}-${c.tier?'upper':'lower'}`;add(name,'plant-branch',branch,assembly,[Math.PI/2,0,c.beta]);
  const x=B[0]*end+Q[0]*(.9-branchThickness/2)+normal[0]*(back+pegOffset),y=B[1]*end+Q[1]*(.9-branchThickness/2)+normal[1]*(back+pegOffset),z=base+height+10+normal[2]*(back+pegOffset);
  slots.push({name,x,y,z,rotation:leafRotation,angle,tier:c.tier,hookNormal:normal,insertion:[sign*B[0],sign*B[1],0],reach:Math.hypot(x,y)});
  const cut=own(box(10,branchThickness+2*gap,keyHeight+2*gap,sign*9.5,0,height-8-keyHeight/2-gap).rotate([0,0,c.beta*180/Math.PI]));trunk=own(trunk.subtract(cut));
 }
 // Merge nearby forks, and put section joints only in straight stem spans.
 const hubs=[];for(const h of nodes){const a=h-28,b=h+3,last=hubs.at(-1);if(last&&a<=last[1])last[1]=Math.max(last[1],b);else hubs.push([a,b]);}
 const ranges=[];let at=0;for(const [a,b]of hubs){const count=Math.max(1,Math.ceil((a-at)/150));if(a>at)for(let i=0;i<count;i++)ranges.push([at+(a-at)*i/count,at+(a-at)*(i+1)/count]);ranges.push([a,b]);at=b;}
 for(let i=0;i<ranges.length;i++){const [start,end]=ranges[i];let segment=own(trunk.intersect(box(40,40,end-start,0,0,start)));if(i>0)segment=own(segment.subtract(box(6+2*gap,6+2*gap,10.2,0,0,start-.01)));if(i<ranges.length-1)segment=own(segment.add(box(6,6,10.02,0,0,end-.02)));segment=own(segment.translate([0,0,-start]));add(`plant-trunk-${i+1}-of-${ranges.length}`,'plant-trunk',segment,[0,0,base+start]);}
 add('plant-socket-plate','plant-plate',plate,[0,0,planter.plateTop],[Math.PI,0,0]);
 return {width:diameter,depth:diameter,height:base+total,plant:{branchThickness,potBounds:pot.boundingBox(),diameter,potHeight,baseDiameter:planter.baseDiameter,plateTop:planter.plateTop,plateFloor,socketHeight,postWidth,hanger,angle,slots,trunkSections:ranges.length},references};
}
