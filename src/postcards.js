export const FRAME_URL='https://makerworld.com/en/models/3456935-postcard-lithophane-frame#profileId-3944274';
export function postcardSize(orientation='portrait'){
 return orientation==='landscape'?{width:148,height:105,max:3}:{width:105,height:148,max:3};
}
export const seasonalDesigns=[
 ['cottage','Moonlit manor','Halloween',0,0,'A moonlit Victorian cottage with glowing porch pumpkins.'],
 ['harvest','Harvest lanterns','Halloween',0,1,'Carved pumpkins and an antique lantern among autumn leaves.'],
 ['ghost','Garden ghost','Halloween',0,2,'A friendly ghost drifting through a moonlit garden.'],
 ['witch-cat','Midnight magic','Halloween',0,3,'A black cat, witch hat and bubbling cauldron.'],
 ['village','Christmas village','Christmas',1,0,'Snowy cottages, a stone bridge and a decorated tree.'],
 ['woodland','Winter woodland','Christmas',1,1,'A deer and fawn among snowy firs and a woodland cabin.'],
 ['sleigh','Christmas Eve','Christmas',1,2,'Santa and his reindeer above a snowy village.'],
 ['wreath','Festive welcome','Christmas',1,3,'A wreath of holly, bells and candlelight.'],
 ['bunny','Easter bunny','Easter',2,0,'A rabbit nestled among daffodils and decorated eggs.'],
 ['basket','Easter basket','Easter',2,1,'Patterned eggs in a woven basket with spring flowers.'],
 ['chicks','Spring chicks','Easter',2,2,'Two fluffy chicks beside eggs and blooming tulips.'],
 ['spring-garden','Blossom garden','Easter',2,3,'A bunny family in a cottage garden beneath spring blossom.']
].map(([id,name,season,column,row,description])=>({id,name,season,column,row,description}));
