import {printLimit} from './printer-settings.js';
export function nurseryLayout(p){const gap=1.2,wall=2.4,floor=3,cellFloor=2,stand=2,innerWidth=p.columns*p.cellWidth+(p.columns-1)*gap+2*p.clearance,innerDepth=p.rows*p.cellDepth+(p.rows-1)*gap+2*p.clearance,width=innerWidth+2*wall,depth=innerDepth+2*wall;
 const cells=Array.from({length:p.rows},(_,row)=>Array.from({length:p.columns},(_,col)=>({row,col,x:(col-(p.columns-1)/2)*(p.cellWidth+gap),y:(row-(p.rows-1)/2)*(p.cellDepth+gap)}))).flat();
 return {gap,wall,floor,cellFloor,stand,innerWidth,innerDepth,width,depth,finishedWidth:width+1.1,finishedDepth:depth+1.1,baseWidth:p.cellWidth-6,baseDepth:p.cellDepth-6,cellZ:floor+stand,cells};
}
export function validateSeed(p){const l=nurseryLayout(p),limit=printLimit(p);if(l.finishedWidth>limit||l.finishedDepth>limit)throw Error(`The tray would be ${l.finishedWidth.toFixed(1)} × ${l.finishedDepth.toFixed(1)} mm. Reduce the cell size or rows/columns to fit the ${limit} mm design limit.`);return p;}
