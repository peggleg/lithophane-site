import {printLimit} from './printer-settings.js';
// Tapered planter with a rounded foot, rolled lip and a recessed removable deck.
export function plantPot(module,own,p,{decorate}){
 const {CrossSection:C,Manifold:M}=module,diameter=Math.min(printLimit(p)-4,Math.max(96,p.width*1.12)),height=Math.round(diameter*.78),wall=p.wall,gap=p.clearance,detail=['ribbed','scalloped','wave'].includes(p.finish)?p.detailDepth:p.finish==='fluted'?1:p.finish==='slatted'?.4:0,topR=diameter/2-Math.max(1.6,detail),bottomR=topR*.8,start=2.8,end=height-2.5,floor=Math.max(3.2,wall),plateFloor=2.4,socketHeight=12,postWidth=8,plateTop=height-5,plateBottom=plateTop-plateFloor;
 const radius=z=>bottomR+(topR-bottomR)*Math.max(0,Math.min(1,(z-start)/(end-start))),inner=z=>radius(z)-wall;
 const disk=r=>own(C.circle(r,128)),lathe=points=>own(own(new C([points],'NonZero')).revolve(128));
 const fluteCount=Math.max(32,Math.round(Math.PI*diameter/6.5)),fluted=own(new C([Array.from({length:fluteCount*12},(_,i)=>{const a=i*2*Math.PI/(fluteCount*12),r=topR+(1+Math.cos(fluteCount*a))*.5;return [r*Math.cos(a),r*Math.sin(a)];})],'NonZero'));
 let body=own((p.finish==='fluted'?own(fluted.extrude(end-start,12)):decorate(disk(topR),end-start)).warp(v=>{const f=radius(v[2]+start)/topR;v[0]*=f;v[1]*=f;v[2]+=start;}));
 const foot=[[0,0],[bottomR-1.5,0]];for(let i=1;i<=12;i++){const t=i/12;foot.push([bottomR-1.5*(1-t)**2,3*t]);}foot.push([bottomR,3.2],[0,3.2]);
 const lip=[[0,height-4.1],[topR,height-4.1],...Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return [topR-.2+1.8*Math.cos(a),height-1.8+1.8*Math.sin(a)];}),[0,height-1.8]];
 body=own(M.union([body,lathe(foot),lathe(lip)]));
 const cavity=lathe([[0,floor],[inner(floor),floor],[inner(end),end],[inner(end),height+1],[0,height+1]]);body=own(body.subtract(cavity));
 // An integral annular ledge supports the deck; the centre remains accessible.
 const ledge=lathe([[inner(plateBottom-1.8)+.1,plateBottom-1.8],[inner(plateBottom)+.1,plateBottom],[inner(plateBottom)-2.6,plateBottom],[inner(plateBottom-1.8)-2.6,plateBottom-1.8]]);body=own(body.add(ledge));
 const plateRadius=inner(plateBottom)-gap;let plate=own(disk(plateRadius).extrude(plateFloor));
 const collar=own(disk(8+gap+wall).extrude(socketHeight+.02).translate([0,0,plateFloor-.02]));plate=own(plate.add(collar));
 // Printed top-down: socket points up on the bed and down into the assembled pot.
 const socket=own(own(C.square([postWidth+2*gap,postWidth+2*gap],true)).extrude(12.2).translate([0,0,-.01]));plate=own(plate.subtract(socket));
 // Small shallow dimples suggest soil without separate loose pieces.
 const dimples=[];for(let i=0;i<90;i++){const a=i*2.399963,r=Math.sqrt((i+.5)/90)*(plateRadius-3);if(r<14)continue;dimples.push(own(own(C.circle(.65+(i%3)*.15,12)).translate([r*Math.cos(a),r*Math.sin(a)])));}if(dimples.length)plate=own(plate.subtract(own(own(C.union(dimples)).extrude(.26).translate([0,0,-.01]))));
 return {pot:body,plate,diameter,potHeight:height,baseDiameter:2*(bottomR-1.5),plateFloor,socketHeight,postWidth,plateTop,plateBottom,plateRadius,base:plateTop-12};
}
