import {printLimit} from './printer-settings.js';
export function nurseryLayout(p){const gap=1.2,wall=2.4,floor=3,cellFloor=2,stand=2,innerWidth=p.columns*p.cellWidth+(p.columns-1)*gap+2*p.clearance,innerDepth=p.rows*p.cellDepth+(p.rows-1)*gap+2*p.clearance,width=innerWidth+2*wall,depth=innerDepth+2*wall;
 const cells=Array.from({length:p.rows},(_,row)=>Array.from({length:p.columns},(_,col)=>({row,col,x:(col-(p.columns-1)/2)*(p.cellWidth+gap),y:(row-(p.rows-1)/2)*(p.cellDepth+gap)}))).flat();
 return {gap,wall,floor,cellFloor,stand,innerWidth,innerDepth,width,depth,finishedWidth:width+1.1,finishedDepth:depth+1.1,baseWidth:p.cellWidth-6,baseDepth:p.cellDepth-6,cellZ:floor+stand,cells};
}
export function validateSeed(p){if(p.kind==='seed-labels'){if(!Number.isInteger(p.quantity))throw Error('Choose a whole number of labels.');if(p.markerWidth>printLimit(p)||p.markerHeight+p.stakeLength>printLimit(p))throw Error('Reduce the label dimensions to fit the selected printer.');return p;}const l=p.kind==='seed-reservoir'?reservoirLayout(p):p.kind==='seed-grow-row'?growRowLayout(p):nurseryLayout(p),limit=printLimit(p);if(l.finishedWidth>limit||l.finishedDepth>limit)throw Error(`The tray would be ${l.finishedWidth.toFixed(1)} × ${l.finishedDepth.toFixed(1)} mm. Reduce the cell size or rows/columns to fit the ${limit} mm design limit.`);if(p.kind==='seed-grow-row'&&!Number.isInteger(p.units))throw Error('Choose a whole number of grow-row modules.');return p;}

export function reservoirLayout(p){const gap=4,wall=2.4,floor=3,margin=3,fillStrip=20,innerWidth=p.columns*p.cellWidth+(p.columns-1)*gap+2*margin+fillStrip,innerDepth=p.rows*p.cellDepth+(p.rows-1)*gap+2*margin,width=innerWidth+2*wall,depth=innerDepth+2*wall,bodyHeight=p.waterDepth+17,deckThickness=3,seatHeight=12,cellZ=bodyHeight+deckThickness-seatHeight;
 const cells=Array.from({length:p.rows},(_,row)=>Array.from({length:p.columns},(_,col)=>({row,col,x:(col-(p.columns-1)/2)*(p.cellWidth+gap)-fillStrip/2,y:(row-(p.rows-1)/2)*(p.cellDepth+gap)}))).flat();
 return {gap,wall,floor,innerWidth,innerDepth,width,depth,finishedWidth:width+1.1,finishedDepth:depth+1.1,bodyHeight,deckThickness,seatHeight,cellZ,waterline:floor+p.waterDepth,waterGap:5,fillX:innerWidth/2-fillStrip/2,fillY:-innerDepth/2+11,cells};
}

export function growRowLayout(p){const l=nurseryLayout({...p,columns:1,rows:2});return {...l,finishedWidth:l.width+11.9,pitch:l.width+6.8,jointYs:[-l.depth/2+12,l.depth/2-12],units:p.units};}
