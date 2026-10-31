import {packGamePieces} from './game-board-box.js';
export function fourPackedItems(boardSize,height){
 const diameter=(boardSize-40)/7-1.6;
 const mock=(size,min)=>({size,part:{bounds:{min,max:min.map((v,i)=>v+size[i])}}});
 // Stops lie on their 8 mm sides, ahead of the counters in the packing rows.
 return [...Array.from({length:2},()=>mock([height,24,8],[0,-12,0])),...Array.from({length:42},()=>mock([diameter,diameter,2.4],[-diameter/2,-diameter/2,0]))];
}
export function fourStorageMinimum(boardSize){
 if(!Number.isFinite(boardSize)||boardSize<120||boardSize>250)return 30;
 for(let height=30;height<=90;height++)try{packGamePieces({boardSize,storageHeight:height},fourPackedItems(boardSize,height),{ceiling:height-18,inset:15});return height;}catch{}
 throw Error('Increase the box footprint to store the folded game.');
}
export const fourAutomaticHeight=boardSize=>Math.max(fourStorageMinimum(boardSize),Math.round(35*boardSize/150));
