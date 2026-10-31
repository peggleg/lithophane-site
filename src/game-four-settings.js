import {packStorage} from './game-storage.js';
export function fourPackedItems(boardSize,height){
 const diameter=(boardSize-40)/7-1.6;
 const mock=(size,min)=>({size,part:{bounds:{min,max:min.map((v,i)=>v+size[i])}}});
 // Stops lie on their 8 mm sides, ahead of the counters in the packing rows.
 return [mock([boardSize-35.2,17.7,2.4],[-(boardSize-35.2)/2,-17.7,0]),...Array.from({length:2},()=>mock([height+5,24,8],[0,-12,0])),...Array.from({length:42},()=>mock([diameter,diameter,2.4],[-diameter/2,-diameter/2,0]))];
}
export function fourStorageSpaces(p){const s=p.boardSize,ceiling=p.storageHeight-13;return [{width:s-30,depth:s-50,origin:[0,-10,0],floor:3,ceiling},{width:s-30,depth:20,origin:[0,s/2-25,0],floor:8.5,ceiling}];}
export function fourStorageMinimum(boardSize){
 if(!Number.isFinite(boardSize)||boardSize<120||boardSize>250)return 24;
 const diameter=(boardSize-40)/7-1.6,rampAtRear=3+5*(14+1.2+.6)/18,dropMinimum=Math.ceil(5+rampAtRear+Math.hypot(diameter,2.4)+1);
 for(let height=Math.max(24,dropMinimum);height<=90;height++)try{packStorage(fourPackedItems(boardSize,height),fourStorageSpaces({boardSize,storageHeight:height}),{apply:false});return height;}catch{}
 throw Error('Increase the box footprint to store the folded game.');
}
export const fourAutomaticHeight=boardSize=>fourStorageMinimum(boardSize);
