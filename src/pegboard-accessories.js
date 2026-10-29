import {quickPegboardBack} from './pegboard-quick-mount.js';
import {makePegboardSpindle} from './pegboard-spindle.js';
import {makePegboardHolder} from './pegboard-holders.js';
import {makePegboard} from './pegboard-products.js';
import {mountRail,mountShoe,mountInterface,makeMountAccessory} from './mount-products.js';
export const pegboardRailFrame=Object.freeze({railY:-7,railZ:0});
export function pegboardAdapterSolid(K,p){const {C,M,own}=K,W=p.adapterWidth??58,H=p.adapterHeight??54,T=7;
 let plate=K.box(W,T,H,0,-T/2,-H/2,5);
 for(const x of [-20,20]){
  const bore=own(M.cylinder(8,2.3,2.3,48).rotate([90,0,0]).translate([x,.5,0]));
  const sink=own(M.cylinder(2.6,2.3,4.9,48).rotate([90,0,0]).translate([x,-4.4,0]));
  plate=own(plate.subtract(own(bore.add(sink))));
 }
 return own(plate.add(mountRail(K,pegboardRailFrame)));
}
export function quickAdapterSolid(K,p){return K.own(quickPegboardBack(K,p,58).add(mountRail(K,pegboardRailFrame)));}
export function pegboardAccessoryContext(K,p,{adapter=true}={}){
 makePegboard({...K,add:(name,role,solid,rotation,colour)=>K.ref('context-'+name,solid,colour)}, {...p,width:150,height:150,thickness:p.boardThickness??5,rows:1,columns:1});
 if(adapter)K.ref('context-universal-adapter',p.mountType==='quick'?quickAdapterSolid(K,p):pegboardAdapterSolid(K,p),'#eee5d3');
 if(p.mountType!=='quick'&&p.kind!=='pegboard-quick-adapter')for(const x of [-20,20]){const t=p.boardThickness??5,shaft=K.own(K.M.cylinder(20,2,2,40).rotate([-90,0,0]).translate([x,-6.78,0])),head=K.own(K.M.cylinder(2.48,2,4.48,48).rotate([90,0,0]).translate([x,-4.3,0])),washerProfile=K.own(K.C.circle(4.5,48).subtract(K.own(K.C.circle(2.25,40)))),nutProfile=K.own(K.C.circle(4.62,6).subtract(K.own(K.C.circle(2,40)))),washer=K.own(washerProfile.extrude(.8).rotate([-90,0,0]).translate([x,t,0])),nut=K.own(nutProfile.extrude(3.2).rotate([-90,0,0]).translate([x,t+.8,0]));K.ref('M4-hardware-not-for-printing-'+x,K.own(shaft.add(head).add(washer).add(nut)),'#777a73');}

}
const quickGuide=p=>`The lift-off mount uses two upper hooks and two lower locating pegs in 6 mm board holes: 40 mm horizontally and 40 mm vertically. Match the ${p.boardThickness??5} mm board thickness when downloading. Insert the upper hooks with the bottom tilted toward you about 16 degrees, then lower the bottom so the locating pegs seat. To move it, empty the accessory, tilt the bottom toward you and lift slightly, then withdraw the upper hooks. Leave the accessory clipped to its mount when moving the pair; no nut, screw or loose pin is removed. Keep 10 mm behind the board. The front rail is identical to the desk clamp: pull the accessory's broad release tab and lift it off to transfer it between the pegboard and clamp. The mount is downloaded separately from accessories.`;
const adapterGuide=p=>p.mountType==='quick'?quickGuide(p):`The adapter fits two 6 mm board holes 40 mm apart horizontally, leaving one grid hole between them. Fit it before mounting the panel on the wall. Supply two M4 × 20 mm, 90-degree countersunk machine screws with heads no wider than 9 mm, two washers and two nuts. The selected board is ${p.boardThickness??5} mm thick. Seat each screw head in the front recess, with the washer and nut behind the board. Keep the panel's 10 mm wall spacers. Hardware and the panel are preview references, excluded from this accessory download. The 40 mm slide-on rail matches the desk clamp: slide an accessory down to the stop until its integral catch engages. Pull the broad tab outward and lift to remove the accessory. No loose locking pin. Unload accessories before removal.`;
export function makePegboardAccessory(K,p){
 pegboardAccessoryContext(K,p,{adapter:!['pegboard-adapter','pegboard-quick-adapter'].includes(p.kind)});
 if(p.kind==='pegboard-quick-adapter'){
  K.add('lift-off-pegboard-adapter','pegboard-adapter',quickAdapterSolid(K,p),[0,-90,0]);
  return {previewDirection:[1,-1.8,.6],fit:{interface:mountInterface,wallGap:10,holePitch:40,boardThickness:p.boardThickness},note:'Lift off and reposition the whole mount and accessory without tools. Two upper hooks carry the mount; two lower pegs locate it. Accessories also detach via the shared release catch.',guide:'Print this mount on its SIDE as supplied. Supports are enabled in this project for the rear hooks and projecting rail; remove them carefully and clear the hooks, locating pegs and rail faces. Keep the reinforced process values. '+quickGuide(p)};
 }
 if(p.kind==='pegboard-adapter'){
  K.add('pegboard-universal-adapter','pegboard-adapter',pegboardAdapterSolid(K,p),[-90,0,0]);
  return {previewDirection:[1,-1.8,.6],fit:{interface:mountInterface,wallGap:10,boltPitch:40,boardThickness:p.boardThickness},note:'One removable slide-on interface for pegboard and desk accessories. Attach with two M4 screws, washers and nuts; download accessories separately.',guide:`Print the adapter BACK-DOWN as supplied, with the rail and countersinks facing up. ${adapterGuide(p)}`};
 }
 const mapped={'pegboard-short-hook':'headphone-hook','pegboard-long-hook':'headphone-hook','pegboard-bin':'remote-pocket','pegboard-headphones':'headphone-hook','pegboard-controller':'controller-cradle'}[p.kind];
 if(mapped){const info=makeMountAccessory({...K,add:(name,role,solid,rotation,colour)=>K.add(name===mapped?p.kind:name,role,solid,rotation,colour)}, {...p,kind:mapped},pegboardRailFrame);
  info.guide=info.guide.replaceAll('clamp','universal adapter').replace('The universal adapter, example desk and pads are excluded from this accessory download. Download the universal adapter separately.','The panel and adapter are preview references only; download the adapter separately.');
  info.note='Slide down onto the universal adapter until the integral catch clicks. Pull the broad tab outward and lift to remove. This same accessory also fits the desk clamp. The board and adapter are preview references only.';
  if(p.kind==='pegboard-bin'){info.note=`Nominal usable bin: ${(p.width-6.4).toFixed(1)} × ${(p.depth-6.4).toFixed(1)} × ${(p.height-3.2).toFixed(1)} mm, with rounded corners. Empty it before removal. `+info.note;info.guide=info.guide.replaceAll('pocket','bin').replaceAll('Remote bins','Storage bins');}
  info.guide+=' '+adapterGuide(p);info.previewDirection=[1,-1.8,.7];return info;
 }
 if(['pegboard-cup','pegboard-shelf'].includes(p.kind)){const info=makePegboardHolder(K,p);info.guide+=' '+adapterGuide(p);return info;}
 if(['pegboard-spool','pegboard-tape'].includes(p.kind)){const info=makePegboardSpindle(K,p);info.guide+=' '+adapterGuide(p);return info;}
 throw Error('Choose an available pegboard accessory.');
}
