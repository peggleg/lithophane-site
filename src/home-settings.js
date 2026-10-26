import {printerKey} from './printer-settings.js';
export const homePresets={
 pill:{width:168,depth:65,height:26,columns:1,rows:1,openwork:'none'},
 soap:{width:130,depth:90,height:18,columns:1,rows:1,openwork:'honeycomb'},
 caddy:{width:150,depth:95,height:100,columns:2,rows:1,openwork:'honeycomb'},
 toothbrush:{width:90,depth:70,height:110,columns:2,rows:1,openwork:'slots'},
 roll:{width:150,depth:150,height:14,columns:1,rows:1,openwork:'none'},
 toothpick:{width:50,depth:50,height:85,columns:1,rows:1,openwork:'none'},
 spoon:{width:100,depth:140,height:16,columns:1,rows:1,openwork:'none'},
 cotton:{width:80,depth:80,height:130,columns:1,rows:1,openwork:'none'},
 vanity:{width:160,depth:140,height:90,columns:1,rows:1,openwork:'none'}
};
export const homeDefaults={pillLidStyle:'lift',soapRimHeight:5,segmentLength:150,shaftSections:2,weightedBase:true,dispenseSize:3.2,drainFloor:true,dripTray:true};
export const isHome=p=>Object.hasOwn(homePresets,p.kind);
export const isWet=p=>['soap','caddy','toothbrush'].includes(p.kind);
export const homeCollections={
 kitchen:[['roll','Kitchen-roll holder'],['toothpick','Cocktail-stick dispenser'],['caddy','Sink caddy'],['pot','Utensil pot'],['spoon','Spoon rest'],['tray','Drawer organiser'],['box','Small tray'],['screw','Lidded storage pot'],['bin','Swing-lid bin']],
 bathroom:[['soap','Soap dish'],['toothbrush','Toothbrush holder'],['pill','7-day pill box · Mon–Sun'],['vanity','Vanity organiser'],['cotton','Cotton-pad dispenser'],['box','Small tray'],['screw','Lidded storage pot'],['bin','Swing-lid bin']]
};
export function validateHome(p,inset=0){
 if(!isHome(p))return;
 if(['roll','toothpick','cotton'].includes(p.kind)){p.depth=p.width;p.shape='round';}
 else p.shape='square';
 if(!isWet(p))p.openwork='none';
 for(const id of ['drainFloor','dripTray','weightedBase'])if(typeof p[id]!=='boolean')throw Error('Choose a valid drainage or base option.');
 if(p.kind==='pill'){p.columns=p.rows=1;if(!['lift','hinged'].includes(p.pillLidStyle))throw Error('Choose lift-off or individually hinged pill lids.');if((p.width-2*inset-8*p.wall)/7<18||p.depth-2*inset-2*p.wall-(p.pillLidStyle==='hinged'?8:0)<20||p.height<18||p.height>60)throw Error('Pill boxes need at least 18 mm usable width per day, 20 mm depth and 18–60 mm overall height. Increase width or reduce wall/detail thickness.');}
 if(p.kind==='roll'){
  if(!Number.isInteger(p.shaftSections)||p.shaftSections<1||p.shaftSections>3)throw Error('Choose 1–3 shaft sections.');
  if(!Number.isFinite(p.segmentLength)||p.segmentLength<70||p.segmentLength>(printerKey(p)==='256'?256:150))throw Error(`Shaft sections must be 70–${printerKey(p)==='256'?256:150} mm, including the threaded connector.`);
  if(p.width<100||p.height<12||p.height>25)throw Error('Roll holders need a 100 mm or larger base and 12–25 mm base height.');
 }
 if(p.kind==='toothpick'&&(!Number.isFinite(p.dispenseSize)||p.dispenseSize<2.5||p.dispenseSize>5))throw Error('Use a 2.5–5 mm dispensing opening.');
 if(['toothpick','cotton','toothbrush','caddy'].includes(p.kind)&&p.height<45)throw Error('This item needs at least 45 mm height.');
 if(p.kind==='cotton'&&p.width<60)throw Error('Use at least 60 mm diameter for the cotton-pad dispenser.');
 if(p.kind==='vanity'&&(p.width<120||p.depth<100||p.height<40))throw Error('Vanity sets need at least 120 × 100 × 40 mm for three pots and a ring dish.');
 if(p.kind==='soap'&&(!Number.isFinite(p.soapRimHeight)||p.soapRimHeight<0||p.soapRimHeight>20))throw Error('Soap retaining sides must be 0–20 mm above the platform.');
 if(p.kind==='soap'&&(p.width<75||p.depth<55||p.height<14||p.height>35))throw Error('Soap dishes need at least 75 × 55 mm, with 14–35 mm height.');
 if(p.kind==='spoon'&&(p.width<60||p.depth<80||p.height>30))throw Error('Spoon rests need at least 60 × 80 mm and 12–30 mm height.');
 if(['caddy','toothbrush'].includes(p.kind)){const reserve=2*inset+2*p.wall+(p.dripTray?2*(p.wall+p.clearance+inset):0),iw=p.width-reserve,id=p.depth-reserve;if((iw-(p.columns-1)*p.wall)/p.columns<18||(id-(p.rows-1)*p.wall)/p.rows<18)throw Error('Each wet-use compartment needs at least 18 mm usable width and depth. Increase the size or reduce rows and columns.');}
}
