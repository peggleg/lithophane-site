import {mountShoe,mountInterface} from './mount-products.js';
import {pegboardRailFrame} from './pegboard-accessories.js';
export function makePegboardHolder(K,p){const {C,own,round,soft}=K,f=pegboardRailFrame,shoe=mountShoe(K,p,f,28),top=shoe.bottom+44;let body,note,guide;
 if(p.kind==='pegboard-cup'){
  const r=p.diameter/2,y=shoe.front-r+3.2,bottom=top-p.height,outer=own(soft(own(C.circle(r,128)),p.height,.6).translate([0,y,bottom])),inner=own(C.circle(r-3.2,128).extrude(p.height+.2).translate([0,y,bottom+3.2]));
  const cup=own(outer.subtract(inner)),web=own(new C([[[shoe.front-.5,shoe.bottom-9.5],[shoe.front+9,shoe.bottom],[shoe.front-.5,shoe.bottom+.2]]],'NonZero'));
  const supports=[-13,7].map(x=>own(web.extrude(6).rotate([90,0,90]).translate([x,0,0])));
  const stopClearance=K.box(21,7,110,0,f.railY-2,f.railZ-129,.5);
  body=own(own(cup.add(supports[0]).add(supports[1])).subtract(stopClearance).subtract(K.box(14,10,34.5,0,shoe.front-1,f.railZ-10,.6)).subtract(shoe.releaseRelief).add(shoe.body));
  note=`Round pen/tool cup: ${(p.diameter-6.4).toFixed(1)} mm internal diameter and ${(p.height-3.2).toFixed(1)} mm usable height. The rear notch keeps the release tab accessible and locally reduces storage space.`;
  guide='Print the cup BOTTOM-DOWN as supplied. The floor and curved wall are integral; small angled webs support the rail shoe. The softened rim has a rear access notch for the release tab. Empty the cup before releasing it. No separate liner or glue is required.';
 }else throw Error('Choose an available pegboard holder.');
 K.add(p.kind,'pegboard-accessory',body,[0,0,0]);
 return {previewDirection:[1,-1.8,1.15],fit:{interface:mountInterface,latch:shoe.latch},note:note+' Slide down until the integral catch engages. Pull the tab outward and lift to remove. The same connector fits the desk clamp; the board and adapter are preview references only.',guide};
}
