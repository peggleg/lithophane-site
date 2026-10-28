import {printerKey,printLimit} from './printer-settings.js';
import {cupboardOptionsDefaults,validateStorageOptions} from './cupboard-options.js';
import {validateDrawerStyles,drawerStyle} from './drawer-finishes.js';
import {cupboardDefaults,cupboardPreset,validateCupboard} from './cupboard-settings.js';
import {homePresets,homeDefaults,isHome,isWet,validateHome} from './home-settings.js';
import {isCoaster,validateCoaster} from './desk-coasters.js';
import {isStorage,storageLayout} from './desk-storage.js';
export const deskPresets={cupboard:cupboardPreset,...homePresets,'coaster-plant':{width:100,depth:125,height:4.4,columns:1,rows:1,coasterShape:'monstera',finish:'fluted',palette:'ivory'},coaster:{width:100,depth:100,height:4.4,columns:1,rows:1,finish:'smooth'},'coaster-tray':{width:100,depth:100,height:4.4,columns:1,rows:1,finish:'smooth'},'coaster-rack':{width:100,depth:100,height:4.4,columns:1,rows:1,finish:'smooth'},storage:{width:150,depth:110,height:40,columns:3,rows:2},'storage-pots':{width:150,depth:110,height:40,columns:3,rows:2},screw:{width:70,depth:70,height:65,columns:1,rows:1,finish:'fluted'},box:{width:60,depth:60,height:25,drawers:2,columns:1,rows:1,finish:'smooth'},'pen-tray':{width:160,depth:55,height:25,drawers:2,columns:1,rows:1,finish:'smooth'},bin:{width:110,depth:110,height:140,drawers:2,columns:1,rows:1,wall:1.8,finish:'smooth'},drawers:{width:140,depth:130,height:100,drawers:2,columns:1,rows:1},pot:{width:80,depth:80,height:100,drawers:2,columns:1,rows:1},tray:{width:150,depth:100,height:25,drawers:2,columns:2,rows:2}};
export const deskDefaults={printer:'a1-mini',...cupboardOptionsDefaults,drawerFinishMode:'same',drawerFinishes:[],...cupboardDefaults,...homeDefaults,kind:'drawers',coasterShape:'round',coasterSurface:'recessed',coasterRim:1.2,leafBacking:'backed',leafHanger:true,coasterCount:4,lidText:'',storageLid:'lift',columnShares:'',rowShares:'',openwork:'none',drawerInserts:'none',sheetColour:'#68bfc7',openworkFaces:'front',openingSize:10,drawerColumns:1,shape:'square',finish:'fluted',detailDepth:1.6,detailSpacing:8,palette:'sage',trayLayout:'boxes',penShare:50,stackTop:'pockets',wall:2.4,clearance:.4,...deskPresets.drawers};
export const deskPalettes={ivory:{body:'#eee6d7',detail:'#cbb798'},sage:{body:'#8c9b81',detail:'#eee5d3'},charcoal:{body:'#414441',detail:'#b38c62'},walnut:{body:'#72533e',detail:'#d7c4a5'},sand:{body:'#d9ccb4',detail:'#efe7d7'}};
export function validateDeskSettings(input){
 const p={...deskDefaults,...input};p.printer=printerKey(p);
 validateHome(p,finishInset(p));
 validateCupboard(p);
 validateDrawerStyles(p);
 if(!['none','honeycomb','diamond','slots','windows','arches','woven'].includes(p.openwork))throw Error('Choose an available openwork pattern.');
 if(p.kind==='cupboard')p.openworkFaces='front';
 if(!['front','front-sides'].includes(p.openworkFaces))throw Error('Choose front only or front and sides.');
 if(!openworkAvailable(p))p.openwork='none';
 if(p.kind!=='drawers'||p.openwork==='none')p.drawerInserts='none';else if(!['none','sheet'].includes(p.drawerInserts))throw Error('Choose plain cutouts or removable colour sheets.');
 if(!Number.isFinite(p.openingSize)||p.openingSize<4||p.openingSize>20){if(p.openwork!=='none')throw Error('Use 4–20 mm for opening size.');p.openingSize=10;}
 if(standaloneTray(p)){p.columns=1;p.rows=1;}
 if(!['square','round'].includes(p.shape))throw Error('Choose a square or round outline.');

 if(p.kind==='screw'){p.shape='round';p.columns=p.rows=1;p.lidText=String(p.lidText??'').trim();if(p.lidText.length>24||/[\u0000-\u001f<>]/.test(p.lidText))throw Error('Use up to 24 printable characters for the lid text.');if(p.height<30)throw Error('Screw containers need at least 30 mm height.');}
 if(p.kind==='screw'||p.kind==='bin'||p.kind==='pot'&&p.shape==='round')p.depth=p.width;
 if(p.kind==='bin'&&p.height<50)throw Error('Desk bins need at least 50 mm height.');
 if(!['pockets','smooth'].includes(p.stackTop))throw Error('Choose locating pockets or a smooth final top.');
 if(!['boxes','pens','fixed','open'].includes(p.trayLayout))throw Error('Choose removable boxes, a pen layout, fixed dividers or an open tray.');
 if(!Object.hasOwn(deskPresets,p.kind)||!['smooth','fluted','slatted','ribbed','scalloped','wave'].includes(p.finish)||!Object.hasOwn(deskPalettes,p.palette))throw Error('Choose an available desk item, surface style and palette.');
 for(const [id,min,max]of [['width',standaloneTray(p)?25:40,printLimit(p)],['depth',standaloneTray(p)?25:40,printLimit(p)],['height',isCoaster(p)?3:12,printLimit(p)],['wall',1.8,4],['clearance',.2,.8],['penShare',25,65],['detailDepth',.6,2.4],['detailSpacing',4,14]])if(!Number.isFinite(p[id])||p[id]<min||p[id]>max)throw Error(`Use ${min}–${max} mm for ${id}. Every part must fit within ${printLimit(p)} × ${printLimit(p)} × ${printLimit(p)} mm.`);
 for(const [id,max]of [['drawerColumns',4],['drawers',4],['columns',4],['rows',3]])if(!Number.isInteger(p[id])||p[id]<1||p[id]>max)throw Error(`Choose 1–${max} for ${id}.`);
 validateStorageOptions(p);
 if(isCoaster(p))validateCoaster(p);
 if(isStorage(p)){if(!['none','lift'].includes(p.storageLid))throw Error('Choose no lid or a lift-off lid.');const l=storageLayout(p),pot=p.kind==='storage-pots',extra=pot?2*p.wall+2*p.clearance:0;if(l.cells.some(c=>c.width-extra<18||c.depth-extra<18)||(pot?l.bodyHeight-2*p.wall-l.insertRecess:l.bodyHeight-p.wall-(p.storageLid==='lift'?3.4:0))<6)throw Error('Each storage compartment needs 18 × 18 mm usable space, and pots need 6 mm usable depth. Enlarge the box or adjust the row/column shares.');}
 if(p.kind==='drawers'&&p.wall<2.4)throw Error('Stackable drawer cases need at least 2.4 mm walls to retain material below the locating pockets.');
 if(p.kind==='drawers'&&((p.height-1.2-(p.drawers+1)*p.wall)/p.drawers-2*p.clearance<16||p.width<70||p.depth<65))throw Error('Drawers need at least 70 mm width, 65 mm depth and 16 mm of usable height per drawer. Increase the height or reduce the drawer count.');
 if(p.kind==='pot'&&p.height<40)throw Error('Pen pots need at least 40 mm height.');
 const inset=p.kind==='drawers'&&p.drawerFinishMode==='mixed'?Math.max(...Array.from({length:p.drawers*p.drawerColumns},(_,i)=>finishInset({...p,finish:drawerStyle(p,i)}))):finishInset(p);
 if(p.kind==='bin'&&p.height<binDimensions(p).minimumHeight)throw Error(`This bin needs at least ${binDimensions(p).minimumHeight} mm height for the lid to swing clear of its solid floor. Increase the height or reduce its width.`);
 const innerWidth=p.kind==='drawers'?(p.width-(p.drawerColumns+1)*p.wall)/p.drawerColumns-2*p.wall-2*p.clearance:p.width-2*p.wall-2*inset,innerDepth=p.kind==='drawers'?p.depth-3*p.wall-p.clearance-inset:p.depth-2*p.wall-2*inset;
 if(p.kind!=='cupboard'&&!isHome(p)&&!isCoaster(p)&&!isStorage(p)&&p.kind!=='bin'&&!(p.kind==='tray'&&['open','pens'].includes(p.trayLayout))&&((innerWidth-(p.columns-1)*p.wall)/p.columns<18||(innerDepth-(p.rows-1)*p.wall)/p.rows<18))throw Error('Each compartment needs at least 18 mm of width and depth. Increase the item size or reduce drawer columns or internal divisions.');
 if(p.kind==='tray'&&['boxes','pens'].includes(p.trayLayout)&&(trayCells(p).some(cell=>cell.width-2*p.clearance-2*p.wall<18||cell.depth-2*p.clearance-2*p.wall<18)||p.height-2*p.wall-.8<6))throw Error('Each inner box needs at least 18 × 18 mm of usable space and 6 mm of usable depth. Increase the tray size or reduce the box count.');
 return p;
}

export function trayCells(p){
 const inset=finishInset(p),w=p.width-2*inset-2*p.wall,d=p.depth-2*inset-2*p.wall,cells=[],pens=p.trayLayout==='pens',penDepth=pens?d*p.penShare/100:0,remaining=d-penDepth;
 if(pens)cells.push({name:'pen-box',x:0,y:-d/2+penDepth/2,width:w,depth:penDepth});
 for(let row=0;row<p.rows;row++)for(let col=0;col<p.columns;col++)cells.push({name:`inner-box-${row+1}-${col+1}`,x:(col-(p.columns-1)/2)*w/p.columns,y:-d/2+penDepth+(row+.5)*remaining/p.rows,width:w/p.columns,depth:remaining/p.rows});
 return cells;
}

export function drawerStacking(p){return {footHeight:1.2,pocketDepth:1.4,clearance:.3,footWidth:10,footDepth:12,positions:[-1,1].flatMap(x=>[-1,1].map(y=>[x*(p.width/2-14),y*(p.depth/2-16)]))};}

export const adjustableFinish=p=>['ribbed','scalloped','wave'].includes(p.finish);
export const finishInset=p=>Math.max(p.openwork==='woven'?.4:0,adjustableFinish(p)?p.detailDepth:p.finish==='fluted'?.55:p.finish==='slatted'?.4:0);

export const standaloneTray=p=>['box','pen-tray'].includes(p.kind);

export const openworkAvailable=p=>isHome(p)?isWet(p):!isCoaster(p)&&!['bin','screw','storage','storage-pots'].includes(p.kind)&&!(p.kind==='pot'&&p.shape==='round');

// Shared mating dimensions for the integral rim and captive clip-in lid.
export function binDimensions(p){const width=p.width-2*finishInset(p),rimWall=Math.max(4.8,p.wall+.6),opening=width-2*rimWall,pivot=4.5,lidGap=Math.max(.6,opening/2-Math.sqrt(Math.max(1,(opening/2-.2)**2-pivot**2))),lidPlate=opening-2*lidGap;return {width,rimWall,opening,lidPlate,lidThickness:2.5,lidGap,pinRadius:1.25,pinSpan:p.width-1.2,bearingRadius:1.55,bearingClearance:.3,bossRadius:2.8,rimHeight:8,pivot,maxAngle:90,minimumHeight:Math.max(50,Math.ceil(Math.hypot(lidPlate/2,pivot)+p.wall+pivot+.6))};}
