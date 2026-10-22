export const deskPresets={drawers:{width:140,depth:130,height:100,drawers:2,columns:1,rows:1},pot:{width:80,depth:80,height:100,drawers:2,columns:1,rows:1},tray:{width:150,depth:100,height:25,drawers:2,columns:2,rows:2}};
export const deskDefaults={kind:'drawers',finish:'fluted',palette:'sage',trayLayout:'boxes',penShare:50,wall:2.4,clearance:.4,...deskPresets.drawers};
export const deskPalettes={ivory:{body:'#eee6d7',detail:'#cbb798'},sage:{body:'#8c9b81',detail:'#eee5d3'},charcoal:{body:'#414441',detail:'#b38c62'}};
export function validateDeskSettings(input){
 const p={...deskDefaults,...input};
 if(!['boxes','pens','fixed','open'].includes(p.trayLayout))throw Error('Choose removable boxes, a pen layout, fixed dividers or an open tray.');
 if(!Object.hasOwn(deskPresets,p.kind)||!['smooth','fluted','slatted'].includes(p.finish)||!Object.hasOwn(deskPalettes,p.palette))throw Error('Choose an available desk item, finish and palette.');
 for(const [id,min,max]of [['width',40,170],['depth',40,170],['height',12,170],['wall',1.8,4],['clearance',.2,.8],['penShare',25,65]])if(!Number.isFinite(p[id])||p[id]<min||p[id]>max)throw Error(`Use ${min}–${max} mm for ${id}. Every part must fit within 170 × 170 × 170 mm.`);
 for(const [id,max]of [['drawers',4],['columns',4],['rows',3]])if(!Number.isInteger(p[id])||p[id]<1||p[id]>max)throw Error(`Choose 1–${max} for ${id}.`);
 if(p.kind==='drawers'&&((p.height-(p.drawers+1)*p.wall)/p.drawers-2*p.clearance<16||p.width<70||p.depth<65))throw Error('Drawers need at least 70 mm width, 65 mm depth and 16 mm of usable height per drawer. Increase the height or reduce the drawer count.');
 if(p.kind==='pot'&&p.height<40)throw Error('Pen pots need at least 40 mm height.');
 const inset=p.finish==='fluted'?.55:p.finish==='slatted'?.4:0;
 const innerWidth=p.kind==='drawers'?p.width-4*p.wall-2*p.clearance:p.width-2*p.wall-2*inset,innerDepth=p.kind==='drawers'?p.depth-3*p.wall-p.clearance-inset:p.depth-2*p.wall-2*inset;
 if(!(p.kind==='tray'&&['open','pens'].includes(p.trayLayout))&&((innerWidth-(p.columns-1)*p.wall)/p.columns<18||(innerDepth-(p.rows-1)*p.wall)/p.rows<18))throw Error('Each compartment needs at least 18 mm of width and depth. Increase the item size or reduce the divisions.');
 if(p.kind==='tray'&&['boxes','pens'].includes(p.trayLayout)&&(trayCells(p).some(cell=>cell.width-2*p.clearance-2*p.wall<18||cell.depth-2*p.clearance-2*p.wall<18)||p.height-2*p.wall-.8<6))throw Error('Each inner box needs at least 18 × 18 mm of usable space and 6 mm of usable depth. Increase the tray size or reduce the box count.');
 return p;
}

export function trayCells(p){
 const inset=p.finish==='fluted'?.55:p.finish==='slatted'?.4:0,w=p.width-2*inset-2*p.wall,d=p.depth-2*inset-2*p.wall,cells=[],pens=p.trayLayout==='pens',penDepth=pens?d*p.penShare/100:0,remaining=d-penDepth;
 if(pens)cells.push({name:'pen-box',x:0,y:-d/2+penDepth/2,width:w,depth:penDepth});
 for(let row=0;row<p.rows;row++)for(let col=0;col<p.columns;col++)cells.push({name:`inner-box-${row+1}-${col+1}`,x:(col-(p.columns-1)/2)*w/p.columns,y:-d/2+penDepth+(row+.5)*remaining/p.rows,width:w/p.columns,depth:remaining/p.rows});
 return cells;
}
