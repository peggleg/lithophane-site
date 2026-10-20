export const FRAME_URL='https://makerworld.com/en/models/3456935-postcard-lithophane-frame#profileId-3944274';
export function postcardSize(orientation='portrait'){
 return orientation==='landscape'?{width:148,height:105,max:3}:{width:105,height:148,max:3};
}
const originalDesigns=[
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

const newPortraits=[
 ['valentine','Valentine’s Day',[
  ['swan-heart','Swan hearts','Two swans form a heart on a quiet lily pond.'],
  ['rose-heart','Heart of roses','A heart-shaped wreath of roses and trailing ivy.'],
  ['lovebirds','Blossom lovebirds','Two lovebirds nestled together beneath spring blossom.'],
  ['love-letter','Sealed with love','A heart-sealed envelope with roses and ribbon.']]],
 ['newyear','New Year 2027',[
  ['midnight-clock','Midnight wishes','An ornate clock welcomes midnight amid stars and festive ribbons.'],
  ['newyear-door','Welcome, 2027','A snowy cottage doorway with a festive wreath and a 2027 plaque.'],
  ['celebration-glasses','A sparkling toast','Two engraved celebration glasses with bubbles and curling ribbons.'],
  ['newyear-lantern','Light up 2027','A candlelit lantern with evergreen sprigs and a 2027 medallion.']]],
 ['mother','Mother’s Day',[
  ['mother-bouquet','Flowers for Mum','Peonies and tulips in a patterned ceramic vase.'],
  ['mother-nest','Under her wing','A mother bird shelters her chicks in a blossom-framed nest.'],
  ['mother-teacup','A moment for Mum','A delicate teacup beside a letter, roses and ribbon.'],
  ['mother-rabbits','Garden cuddles','A mother rabbit nestled with her young among wildflowers.']]],
 ['father','Father’s Day',[
  ['father-watch','Timeless moments','A vintage pocket watch beside oak leaves and acorns.'],
  ['father-bears','Following Dad','A father bear and cub on a woodland trail.'],
  ['father-fishing','Gone fishing','Fishing rods and a tackle basket beside a reed-lined lake.'],
  ['father-workshop','Made with care','A hand plane, chisel and curled shavings on a wooden workbench.']]],
 ['thanksgiving','Thanksgiving',[
  ['harvest-horn','Harvest abundance','A cornucopia filled with pumpkins, apples, grapes and wheat.'],
  ['thankful-turkey','Autumn turkey','A turkey with a magnificent fanned tail among autumn leaves.'],
  ['harvest-light','Harvest glow','A lantern surrounded by pumpkins, corn and maple leaves.'],
  ['harvest-pie','Fresh from the oven','A lattice pie beside apples on a farmhouse table.']]]
];
const landscapeGroups=[
 ['land-existing',[
  ['christmas-bridge','Christmas','Snowfall village','A snowy village and decorated tree beside a stone bridge.'],
  ['christmas-flight','Christmas','Across the winter sky','Santa and his reindeer above a panoramic snowy forest.'],
  ['easter-cottage','Easter','Easter garden','A rabbit family and decorated eggs in a flowering cottage garden.'],
  ['easter-meadow','Easter','Springtime meadow','Chicks, tulips and daffodils around a basket of decorated eggs.']]],
 ['land-autumn-love',[
  ['halloween-hill','Halloween','Manor by moonlight','A haunted hilltop manor, winding path and pumpkins under the moon.'],
  ['halloween-patch','Halloween','The pumpkin patch','A scarecrow watches over pumpkins and an old lantern beside a barn.'],
  ['valentine-lake','Valentine’s Day','Lake of roses','Two swans on a tranquil lake beneath an arch of roses.'],
  ['valentine-garden','Valentine’s Day','Our quiet corner','Lovebirds, a garden bench and trailing roses.']]],
 ['land-newyear-mother',[
  ['newyear-fireworks','New Year 2027','Hello, 2027','Fireworks and 2027 numerals over a river and old-town skyline.'],
  ['newyear-mantel','New Year 2027','The midnight mantel','An ornate clock, candles and ribbons welcome 2027.'],
  ['mother-ducks','Mother’s Day','Together on the pond','A mother duck leads her ducklings across a flower-lined pond.'],
  ['mother-tea','Mother’s Day','Tea in the garden','A welcoming garden table with flowers, a teapot and two cups.']]],
 ['land-father-thanks',[
  ['father-lake','Father’s Day','Adventure together','A father bear and cub beside a pine-lined mountain lake.'],
  ['father-rowboat','Father’s Day','A day by the lake','Two fishing rods, a rowboat and a tackle basket at the lakeside.'],
  ['thanksgiving-table','Thanksgiving','Gather the harvest','A cornucopia, pumpkins, fruit and wheat on a rustic table.'],
  ['thanksgiving-farm','Thanksgiving','Home for the harvest','A welcoming farmhouse and barn among autumn trees and pumpkins.']]]
];
export const seasonalDesigns=[
 ...originalDesigns.map(d=>({...d,atlas:'original',orientation:'portrait'})),
 ...newPortraits.flatMap(([atlas,season,designs])=>designs.map(([id,name,description],i)=>({id,name,description,season,atlas,column:i%2,row:Math.floor(i/2),orientation:'portrait'}))),
 ...landscapeGroups.flatMap(([atlas,designs])=>designs.map(([id,season,name,description],i)=>({id,name,description,season,atlas,column:i%2,row:Math.floor(i/2),orientation:'landscape'})))
];
export function sampleSize(design){return postcardSize(design.orientation);}

export function artworkCell(design,imageWidth,imageHeight){
 const columns=design.atlas==='original'?3:2;
 const rows=design.atlas==='original'?4:2;
 return {x:design.column*imageWidth/columns,y:design.row*imageHeight/rows,width:imageWidth/columns,height:imageHeight/rows};
}
