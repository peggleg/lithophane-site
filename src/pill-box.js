import {pillHinges} from './pill-hinges.js';
import {finishInset} from './desk-settings.js';
import {textShape} from './storage-labels.js';
export const pillDays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export function pillBoxDimensions(p){const inset=finishInset(p),w=p.width-2*inset,hinged=p.pillLidStyle==='hinged',d=p.depth-2*inset-(hinged?8:0),t=p.wall,cell=(w-8*t)/7;return {w,d,t,cell,hinged,baseY:hinged?-4:0,insideDepth:d-2*t,baseHeight:p.height-t,usableHeight:p.height-2*t-(hinged?0:2.5)};}
export function makePillBox(module,own,p,{round,ribs,add,fontBuffer}){
 const {CrossSection:C,Manifold:M}=module,f=pillBoxDimensions(p),{w,d,t,cell,baseHeight}=f,outer=round(w,d,Math.min(6,w/8,d/5)),safe=own(outer.offset(-t)),wells=[];
 const hinge=f.hinged?pillHinges(module,own,p,f,{add}):null;
 let base=own(outer.extrude(baseHeight));const records=[];
 for(const [i,day]of pillDays.entries()){
  const x=-w/2+t+cell/2+i*(cell+t),profile=own(round(cell,d-2*t,1.2).translate([x,0]).intersect(safe)),local=own(profile.translate([-x,0])),tongue=own(local.offset(-p.clearance)),inner=own(tongue.offset(-1.2));
  if(inner.isEmpty())throw Error('The lid guide is too small. Increase the pill-box dimensions.');
  wells.push(own(profile.extrude(baseHeight+.1).translate([0,0,t])));
  // A small open-top finger scallop exposes each lid edge without a protruding tab.
  wells.push(own(C.circle(3,40).extrude(3).translate([x,-d/2+t/2,baseHeight-2.5])));
  const plate=own(local.offset(Math.min(t*.35,(t-2*p.clearance)/2))),ring=own(tongue.subtract(inner));let lid=own(plate.extrude(t));if(hinge)lid=hinge.lid(lid);else lid=own(lid.add(own(ring.extrude(2.51).translate([0,0,t-.01]))));
  const letters=textShape(module,own,day.toUpperCase(),cell,16,fontBuffer,false);if(letters)lid=own(lid.subtract(own(letters.extrude(.61).translate([0,0,-.01]))));
  add(`pill-lid-${i+1}-${day.toLowerCase()}`,'pill-lid',lid,[x,f.baseY,p.height],[Math.PI,0,0]);add.pill(i,hinge?[x,hinge.axisY+f.baseY,hinge.axisZ]:null);if(hinge)hinge.pin(i,day,x);
  records.push({day,x,width:cell,depth:d-2*t,usableHeight:f.usableHeight});
 }
 base=ribs(own(base.subtract(own(M.union(wells)))),w,d,baseHeight);if(hinge){const clip=own(C.square([w+10,10],true).extrude(p.height+1).translate([0,d/2+5.001,hinge.axisZ-hinge.radius-1]));base=own(base.subtract(clip));for(const day of records)base=own(base.add(hinge.base(day.x)));}add('weekly-pill-box-mon-sun','pill-base',base,[0,f.baseY,0]);
 return {...f,hinge:hinge?{axisY:hinge.axisY+f.baseY,axisZ:hinge.axisZ,pinDiameter:hinge.pinDiameter,boreDiameter:hinge.boreDiameter,opening:hinge.opening}:null,days:records,note:`Seven separate compartments, Monday to Sunday, with individual labelled ${hinge?'hinged lids and one printed pin per day':'lift-off lids'}. Usable space ${hinge?'under each lid':'beneath each lid guide'} is about ${cell.toFixed(1)} × ${(d-2*t).toFixed(1)} × ${f.usableHeight.toFixed(1)} mm; rounded corners reduce space locally. Finger scallops expose the lid edges. ${hinge?'Each lid opens independently. Secure each pin head to its stationary outer barrel with a small dab of adhesive; keep glue out of the moving joint. Hinged lids rest on the rim without locking catches.':'Lids use clearance guides, not locking catches.'} Not airtight or child-resistant: follow the medicine packaging storage instructions and keep out of children's reach.`};
}
