import {makePillBox} from './pill-box.js';
import {finishInset} from './desk-settings.js';
import {carveOpenwork} from './desk-openwork.js';
import {makeScrewContainer,screwRidge,screwDimensions} from './desk-screw.js';

// A clipped field preserves the perimeter and at least 2.4 mm between openings.
export function drainageSection(module,own,profile,p){
 const {CrossSection:C}=module,frame=Math.max(4,p.wall+1),safe=own(profile.offset(-frame));
 if(safe.isEmpty())return own(C.square([0,0]));
 const b=safe.bounds(),size=Math.min(p.openingSize,12),pitch=size+3.2,cells=[];
 for(let y=b.min[1];y<=b.max[1]+pitch;y+=pitch)for(let x=b.min[0];x<=b.max[0]+pitch;x+=pitch){
  let cell;
  if(p.openwork==='honeycomb')cell=new C([Array.from({length:6},(_,i)=>{const a=(30+60*i)*Math.PI/180;return [size/2*Math.cos(a),size/2*Math.sin(a)];})]);
  else if(p.openwork==='diamond')cell=new C([[[0,-size/2],[size/2,0],[0,size/2],[-size/2,0]]]);
  else {const w=['slots','windows'].includes(p.openwork)?Math.max(3,size*.4):size,r=Math.min(1.5,w/2-.01);cell=own(C.square([w-2*r,size-2*r],true)).offset(r,'Round',2,20);}
  cells.push(own(own(cell).translate([x,y])));
 }
 return own(own(C.union(cells)).intersect(safe));
}

export function makeHomeItems(module,own,p,{round,ribs,box,add,fontBuffer}){
 const {CrossSection:C,Manifold:M}=module,inset=finishInset(p),w=p.width-2*inset,d=p.depth-2*inset;
 const cylinder=(r,h,z=0)=>own(C.circle(r,96).extrude(h).translate([0,0,z]));
 const hollow=(profile,h)=>own(own(profile.extrude(h)).subtract(own(own(profile.offset(-p.wall)).extrude(h).translate([0,0,p.wall]))));
 const rounded=(w,d)=>round(w,d,Math.min(9,w/5,d/5));
 function perforate(solid,bw,bd,h){
  if(p.openwork==='none')return solid;
  solid=carveOpenwork(module,own,solid,bw,bd,h,{...p,openworkFaces:'front-sides'});
  return own(carveOpenwork(module,own,own(solid.rotate([0,0,180])),bw,bd,h,{...p,openworkFaces:'front'}).rotate([0,0,180]));
 }
 function supports(profile,h,z){
  const b=profile.bounds(),features=[];
  for(const x of [-1,1])for(const y of [-1,1])features.push(box(7,7,h,x*(b.max[0]-5),y*(b.max[1]-5),z));
  return own(own(M.union(features)).intersect(own(profile.extrude(h+.02).translate([0,0,z-.01]))));
 }
 if(p.kind==='pill')return makePillBox(module,own,p,{round,ribs,add,fontBuffer});
 if(p.kind==='soap'){
  const outer=rounded(w,d),inner=own(outer.offset(-p.wall)),insert=own(inner.offset(-p.clearance)),z=p.height-p.wall;
  let tray=ribs(hollow(outer,p.height),w,d,p.height);
  tray=own(tray.add(supports(inner,z-p.wall,p.wall)));
  let plate=own(insert.extrude(p.wall));
  const holes=p.drainFloor?drainageSection(module,own,insert,p):null;
  if(holes&&!holes.isEmpty())plate=own(plate.subtract(own(holes.extrude(p.wall+.2).translate([0,0,-.1]))));
  if(p.soapRimHeight>0){const rim=own(own(insert.extrude(p.soapRimHeight+.02)).subtract(own(own(insert.offset(-p.wall)).extrude(p.soapRimHeight+.2).translate([0,0,-.1]))).translate([0,0,p.wall-.02]));plate=own(plate.add(rim));}
  add('soap-catch-tray','catch-tray',tray,[0,0,0]);add('removable-soap-platform','draining-platform',plate,[0,0,z]);
  return {height:p.height+p.soapRimHeight,note:`${p.soapRimHeight} mm retaining sides above the soap platform help keep the bar in place. The retaining sides form a continuous rim. Remove the platform to empty and clean the solid tray.`,drainage:p.drainFloor,waterGap:z-p.wall,soapRimHeight:p.soapRimHeight};
 }
 if(['caddy','toothbrush'].includes(p.kind)){
  const trayH=9,z=p.dripTray?p.wall+2:0,bw=p.dripTray?w-2*(p.wall+p.clearance+inset):w,bd=p.dripTray?d-2*(p.wall+p.clearance+inset):d,h=p.height-z,profile=rounded(bw,bd),inside=own(profile.offset(-p.wall));
  let body=hollow(profile,h),dividers=[];
  for(let c=1;c<p.columns;c++)dividers.push(own(own(C.square([p.wall,bd],true).translate([(c/p.columns-.5)*(bw-2*p.wall),0])).intersect(inside)));
  for(let r=1;r<p.rows;r++)dividers.push(own(own(C.square([bw,p.wall],true).translate([0,(r/p.rows-.5)*(bd-2*p.wall)])).intersect(inside)));
  if(dividers.length)body=own(body.add(own(own(C.union(dividers)).extrude(h-p.wall+.01).translate([0,0,p.wall-.01]))));
  body=ribs(body,bw,bd,h);body=perforate(body,bw,bd,h);
  if(p.drainFloor){const holes=drainageSection(module,own,profile,p);body=own(body.subtract(own(holes.extrude(p.wall+.2).translate([0,0,-.1]))));}
  add(p.kind==='caddy'?'draining-sink-caddy':'draining-toothbrush-holder','wet-body',body,[0,0,z]);
  if(p.dripTray){const outer=rounded(w,d),inner=own(outer.offset(-p.wall));let tray=ribs(hollow(outer,trayH),w,d,trayH);tray=own(tray.add(supports(inner,2,p.wall)));add('removable-solid-drip-tray','catch-tray',tray,[0,0,0]);}
  return {note:p.dripTray?'Lift the holder straight out to empty its solid drip tray.':'No drip tray: water drains onto the surface below.',drainage:p.drainFloor,waterGap:p.dripTray?2:0};
 }
 if(p.kind==='toothpick'){
  const f=makeScrewContainer(module,own,{...p,lidText:''},ribs,(name,role,solid,assembly,rotation)=>{
   if(role==='screw-lid'){const f=screwDimensions(p),fit={...f,shoulder:0},tool=own(own(cylinder(f.neckRadius+p.clearance,f.neckHeight+p.clearance+.1,-.1).add(screwRidge(module,own,fit,{female:true}))).intersect(cylinder(f.radius,f.neckHeight+p.clearance+.1,-.1)));solid=ribs(cylinder(f.radius,12),2*f.radius,2*f.radius,12);solid=own(own(solid.subtract(tool)).rotate([180,0,0]).translate([0,0,12]));solid=own(solid.subtract(cylinder(p.dispenseSize/2,14,-.1)));}
   add(role==='screw-lid'?'dispensing-screw-lid':'cocktail-stick-container',role,solid,assembly,rotation);
  });
  return {...f,note:`Refill by unscrewing the lid. Invert and gently shake to dispense through the ${p.dispenseSize} mm opening; adjust for your sticks. This is a simple gravity dispenser, without an automatic feed mechanism.`,dispenseSize:p.dispenseSize};
 }
 if(p.kind==='cotton'){
  const radius=w/2,profile=own(C.circle(radius,128)),bodyH=p.height-p.wall;
  let body=ribs(hollow(profile,bodyH),w,w,bodyH);
  const cutWidth=(w-2*p.wall)*.65,window=own(round(cutWidth,bodyH-p.wall,Math.min(8,cutWidth/4)).extrude(w).rotate([90,0,0]).translate([0,0,(bodyH+p.wall)/2+2]));
  body=own(body.subtract(window));
  const lidRadius=radius,lipRadius=radius-p.wall-p.clearance,lip=own(cylinder(lipRadius,3,p.wall).subtract(cylinder(lipRadius-p.wall,3.2,p.wall-.1)));
  const lid=own(cylinder(lidRadius,p.wall).add(lip));
  add('cotton-pad-dispenser','cotton-body',body,[0,0,0]);add('lift-off-cotton-lid','home-lid',lid,[0,0,p.height],[Math.PI,0,0]);
  return {insideDiameter:2*(radius-p.wall),note:'Load cotton rounds from above. Lift off the lid; take pads through the front opening. Print the lid top-down as supplied.'};
 }
 if(p.kind==='spoon'){
  const profile=rounded(w,d);let body=ribs(hollow(profile,p.height),w,d,p.height);
  body=own(body.subtract(box(Math.min(24,w*.3),20,p.height,0,-d/2+4,p.wall+2)));
  add('spoon-rest','spoon-rest',body,[0,0,0]);return {note:'The shallow dish catches drips; the lowered front supports a utensil handle. Let hot cookware cool before resting it here.'};
 }
 if(p.kind==='vanity'){
  const profile=rounded(w,d),trayH=14;
  add('vanity-catchall-tray','vanity-tray',ribs(hollow(profile,trayH),w,d,trayH),[0,0,0]);
  const cell=(w-2*p.wall-8)/3,diameter=cell-4,back=d/2-p.wall-cell/2-2;
  for(let i=0;i<3;i++){
   const h=p.height-p.wall-i*12,outerD=diameter-2*inset,r=outerD/2;
   const cup=ribs(hollow(own(C.circle(r,96)),h),outerD,outerD,h,false,true);
   add(`vanity-pot-${i+1}`,'inner-box',cup,[(i-1)*cell,back,p.wall]);
  }
  const frontSpace=d-2*p.wall-cell-6,rd=Math.min(36,frontSpace-4),rr=rd/2;
  add('vanity-ring-dish','inner-box',ribs(hollow(own(C.circle(rr,80)),10),rd,rd,10,false,true),[0,-d/2+p.wall+frontSpace/2,p.wall]);
  return {note:'Three separate pots and a ring dish lift out of the matching tray. All positions resize with the tray.'};
 }
 if(p.kind==='roll'){
  const radius=w/2,baseH=p.height,f={neckRadius:9,threadDepth:1,pitch:3.6,turns:1.75,shoulder:0,neckHeight:9.2,threadStart:1.45,radialClearance:p.clearance,axialClearance:p.clearance},bodyH=p.segmentLength-f.neckHeight;
  const male=(z)=>own(cylinder(f.neckRadius,f.neckHeight+.01,z-.01).add(screwRidge(module,own,{...f,shoulder:z})));
  const female=()=>own(own(cylinder(f.neckRadius+p.clearance,f.neckHeight+p.clearance+.1,-.1).add(screwRidge(module,own,f,{female:true}))).intersect(cylinder(14,f.neckHeight+p.clearance+.1,-.1)));
  let base=ribs(cylinder(radius,baseH),w,w,baseH);
  if(p.weightedBase){
   const pocket=own(cylinder(radius-p.wall,baseH,p.wall).subtract(cylinder(14,baseH+.2,p.wall-.1)));
   base=own(base.subtract(pocket));
   // A continuous annular ledge supports the loose cover without bridging.
   const ledge=own(cylinder(radius-p.wall+.01,2,baseH-p.wall-2).subtract(cylinder(radius-p.wall-1.6,2.2,baseH-p.wall-2.1)));
   base=own(base.add(ledge));
   const cover=own(cylinder(radius-p.wall-p.clearance,p.wall).subtract(cylinder(14+p.clearance,p.wall+.2,-.1)));
   add('ballast-chamber-cover','base-cover',cover,[0,0,baseH-p.wall]);
  }
  base=own(base.add(male(baseH)));add('roll-holder-base','roll-base',base,[0,0,0]);
  for(let i=0;i<p.shaftSections;i++){
   const section=own(own(cylinder(14,bodyH).add(male(bodyH))).subtract(female()));
   add(`screw-shaft-section-${i+1}`,'roll-shaft',section,[0,0,baseH+i*bodyH]);
  }
  let cap=own(cylinder(16,12).subtract(female()));cap=own(cap.rotate([180,0,0]).translate([0,0,12]));
  const top=baseH+p.shaftSections*bodyH;
  add('roll-holder-top-cap','home-lid',cap,[0,0,top+12],[Math.PI,0,0]);
  return {width:p.width,depth:p.width,height:top+12,shaftAdvance:bodyH,segmentLength:p.segmentLength,usableRollHeight:p.shaftSections*bodyH,note:`${p.shaftSections} shaft sections, ${p.segmentLength} mm each INCLUDING the connector. Screw clockwise onto the base, then add the removable top cap. ${p.weightedBase?'Fill the open annular base chamber with dry ballast before seating its loose cover. Ballast is separately supplied; the cover is not sealed.':'This is a solid-model base without a ballast chamber.'} The 28 mm shaft needs a roll core larger than 28 mm.`};
 }
 throw Error('Unknown home accessory.');
}
