import additions from './cylinder-additions.json' with {type:'json'};

const collections=[
 ['christmas','Christmas','Christmas Mountains','Christmas Village'],
 ['easter','Easter','Daffodil Stream','Blossom Bridge'],
 ['halloween','Halloween','Moonlit Manor','Pumpkin Woodland'],
 ['valentine','Valentine’s Day','The Rose Garden','Swans at Dusk'],
 ['newyear','New Year','Midnight by the Lake','The Hilltop Observatory'],
 ['mother','Mother’s Day','The Cottage Garden','Blossom Meadow'],
 ['father','Father’s Day','The Lakeside Canoe','The Mountain Railway'],
 ['thanksgiving','Thanksgiving','Harvest Farm','The Autumn Watermill'],
];
export const cylinderCollections=collections.map(([id,name])=>({id,name}));
export const cylinderCatalogue=[
 ...collections.flatMap(([collection,season,...names])=>names.map((name,row)=>({id:collection+'-'+(row+1),collection,season,name,row,rows:2,orientation:'landscape',asset:collection+'.webp'}))),
 ...additions,
];
