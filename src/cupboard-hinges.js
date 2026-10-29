// Replaceable printed M5-sized fasteners: custom 2 mm pitch, not ISO M5.
export const cupboardHingeSpec=Object.freeze({radius:5.5,bore:2.8,axisInset:8,axisForward:6,casePad:7,leaf:6,total:28,outer:14,middle:14,pitch:2,major:5,nutAF:9,nutHeight:3.8});
export const cupboardHingeStarts=H=>(H>=150?[H*.25,H*.75]:[H/2]).map(z=>z-14);
export function cupboardHinges(module,own,p,{box,round}){
 const {Manifold:M,CrossSection:C}=module,S=cupboardHingeSpec,side=p.hingeSide==='left'?-1:1,inward=-side;
 const cylinder=(r,h,z=0)=>own(C.circle(r,64).extrude(h).translate([0,0,z]));
 const hex=(af)=>own(new C([Array.from({length:6},(_,i)=>{const a=(30+60*i)*Math.PI/180;return[af/Math.sqrt(3)*Math.cos(a),af/Math.sqrt(3)*Math.sin(a)];})]));
 const teardrop=r=>own(own(C.circle(r,48)).add(own(new C([[[-r/Math.SQRT2,r/Math.SQRT2],[r/Math.SQRT2,r/Math.SQRT2],[0,r*Math.SQRT2]]],'NonZero'))));
 function thread(start,end,clear=0){const pitch=S.pitch,steps=Math.ceil((end-start)/pitch*48),section=[[1.85+clear,-.85-clear*.3],[2.5+clear,-.15-clear*.3],[2.5+clear,.15+clear*.3],[1.85+clear,.85+clear*.3]],v=[],f=[];for(let i=0;i<=steps;i++){const z=start+(end-start)*i/steps,a=z/pitch*2*Math.PI;for(const[r,dz]of section)v.push(r*Math.cos(a),r*Math.sin(a),z+dz);}for(let i=0;i<steps;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+(j+1)%4,d=(i+1)*4+j;f.push(a,c,b,a,d,c);}f.push(0,1,2,0,2,3);const e=steps*4;f.push(e,e+2,e+1,e,e+3,e+2);return own(new M(new module.Mesh({numProp:3,vertProperties:new Float32Array(v),triVerts:new Uint32Array(f)})));}
 function bolt(smooth){const head=own(M.union([own(M.cylinder(.5,5,5.5,64)),cylinder(5.5,2,.5),own(M.cylinder(.5,5.5,5,64).translate([0,0,2.5]))])),shaft=cylinder(2.45,smooth+.03,2.99),root=cylinder(1.9,8.1,3+smooth-.05),ridge=own(thread(3+smooth-.8,3+smooth+8.8).intersect(cylinder(2.6,8,3+smooth)));return own(own(M.union([head,shaft,root,ridge])).subtract(box(7,2,1.5,0,0,-.01)));}
 function nut(offset){const blank=own(hex(9).extrude(S.nutHeight)),tool=own(M.union([cylinder(2.07,S.nutHeight+.2,-.1),own(thread(offset-1,offset+S.nutHeight+1,.2).translate([0,0,-offset]))]));return own(blank.subtract(tool));}
 const driver=own(own(round(16,24,4).extrude(3)).add(own(round(6.4,18,1).extrude(1.8).translate([0,16,0])))),mountBolt=bolt(6),mountNut=nut(9.2),pivotBolt=bolt(28.2),pivotNut=nut(31.6);
 // Coordinates local to hinge axis; x positive points into the cupboard.
 const casePlate=own(round(6,30,1).translate([2,31])),caseStem=own(C.square([2,37],true).translate([0,18])),caseCross=own(C.union([own(C.circle(S.radius,64)),caseStem,casePlate]));
 const doorPlate=own(round(39,6,1).translate([19.5,16])),doorStem=own(C.square([3,16],true).translate([0,8])),doorCross=own(C.union([own(C.circle(S.radius,64)),doorStem,doorPlate]));
 const caseHole=(y)=>own(teardrop(2.8).extrude(20).rotate([90,0,90]).translate([-8,y,7]));
 const caseNut=(y)=>own(hex(9+2*Math.min(.25,p.clearance)).rotate(90).extrude(4.2).rotate([90,0,90]).translate([1,y,7]));
 const doorHole=x=>own(teardrop(2.8).extrude(20).rotate([90,0,0]).translate([x,20,7-p.clearance]));
 const doorNut=x=>own(hex(9+2*Math.min(.25,p.clearance)).extrude(4.2).rotate([90,0,0]).translate([x,19.2,7-p.clearance]));
 // Both knuckles stand directly on the bed, with no raised barrel.
 function caseHalf(lower){let s=own(caseCross.extrude(14));s=own(s.subtract(cylinder(2.8,14.2,-.1)).subtract(caseHole(23)).subtract(caseNut(23)).subtract(caseHole(35)).subtract(caseNut(35)));if(lower){const sweeps=[],panels=[],W=p.width/p.cupboardColumns,margin=Math.max(8+p.wall+p.clearance,11+p.clearance),panel=own(C.square([W-2*margin,7.2],true).translate([W/2-8,9.5]));for(let a=0;a<=110;a+=2){const d=own(own(doorCross.offset(.3,'Round',2,24)).rotate(-a)),v=own(own(panel.offset(.3,'Round',2,24)).rotate(-a));sweeps.push(d,v);panels.push(v);}const next=own(doorCross.rotate(-125)),ring=own(C.circle(12,64).subtract(own(C.circle(6,64)))),stop=own(own(next.subtract(own(C.union(sweeps)))).intersect(ring));if(!stop.isEmpty()){const foot=own(own(own(C.hull([own(C.circle(5.5,64)),stop])).subtract(own(C.union(panels)))).extrude(14));s=own(s.add(foot).add(own(stop.extrude(24))).subtract(cylinder(2.8,25,-.1)));}}return s;}
 let lower=caseHalf(true),door=own(doorCross.extrude(14-2*p.clearance));door=own(door.subtract(cylinder(2.8,14,-.1)));for(const x of [20,32])door=own(door.subtract(doorHole(x)).subtract(doorNut(x)));
 // Mirror printed geometry rather than reversing the bed-facing orientation.
 const mirror=s=>inward===1?s:own(s.mirror([1,0,0]));
 return {spec:S,side,inward,lower:mirror(lower),door:mirror(door),driver,mountBolt,mountNut,pivotBolt,pivotNut,caseCross:inward===1?caseCross:own(caseCross.mirror([1,0])),doorCross:inward===1?doorCross:own(doorCross.mirror([1,0])),teardrop,hex};
}
