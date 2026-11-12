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
// Original daily additions are appended; existing atlas cells remain unchanged.
const additions20261101=[
  {
    "id": "christmas-carousel-2026-11-01",
    "name": "The Christmas Carousel",
    "season": "Christmas",
    "description": "Carved carousel horses, festive lights and a family watching beneath snow-laden firs.",
    "orientation": "landscape",
    "atlas": "christmas-carousel-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-orchard-lambs-2026-11-01",
    "name": "Lambs in the Blossom Orchard",
    "season": "Easter",
    "description": "A ewe and two lambs beneath apple blossom, with decorated Easter eggs beside a brook.",
    "orientation": "portrait",
    "atlas": "easter-orchard-lambs-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-owl-apothecary-2026-11-01",
    "name": "The Owl’s Apothecary",
    "season": "Halloween",
    "description": "A barn owl, botanical books and glowing mushrooms in a moonlit gothic apothecary.",
    "orientation": "portrait",
    "atlas": "halloween-owl-apothecary-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-heartwood-foxes-2026-11-01",
    "name": "Foxes beneath the Heartwood Tree",
    "season": "Valentine’s Day",
    "description": "Two affectionate foxes beneath heart-shaped branches in a tranquil moonlit forest.",
    "orientation": "portrait",
    "atlas": "valentine-heartwood-foxes-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-harbour-first-light-2026-11-01",
    "name": "First Light of 2027",
    "season": "New Year 2027",
    "description": "A brass compass and 2027 ribbon greet sunrise over a harbour beneath fading fireworks.",
    "orientation": "landscape",
    "atlas": "newyear-harbour-first-light-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-elephant-trunk-2026-11-01",
    "name": "A Gentle Trunk to Hold",
    "season": "Mother’s Day",
    "description": "A mother elephant and her calf touch trunks beside a reflective, lily-lined waterhole.",
    "orientation": "portrait",
    "atlas": "mother-elephant-trunk-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-stargazing-2026-11-01",
    "name": "Stargazing with Dad",
    "season": "Father’s Day",
    "description": "A father and child explore the Milky Way with a brass telescope above a mountain lake.",
    "orientation": "landscape",
    "atlas": "father-stargazing-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-cider-press-2026-11-01",
    "name": "The Cider Press Gathering",
    "season": "Thanksgiving",
    "description": "A family shares the apple harvest around an oak cider press in an autumn orchard.",
    "orientation": "landscape",
    "atlas": "thanksgiving-cider-press-2026-11-01",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261102=[
  {
    "id": "christmas-snowbound-toymaker-2026-11-02",
    "name": "The Snowbound Toymaker",
    "season": "Christmas",
    "description": "An artisan carves a rocking horse in a lantern-lit Christmas workshop while snow falls outside.",
    "orientation": "landscape",
    "atlas": "christmas-snowbound-toymaker-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-watermill-2026-11-02",
    "name": "The Easter Watermill",
    "season": "Easter",
    "description": "Painted Easter eggs and a chick beside a blossom-framed stone watermill and spring brook.",
    "orientation": "portrait",
    "atlas": "easter-watermill-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-raven-belltower-2026-11-02",
    "name": "The Raven’s Bell Tower",
    "season": "Halloween",
    "description": "A raven rests on a stone gargoyle beside an engraved bell above a moonlit Gothic town.",
    "orientation": "portrait",
    "atlas": "halloween-raven-belltower-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-tandem-canal-2026-11-02",
    "name": "A Tandem Ride for Two",
    "season": "Valentine’s Day",
    "description": "A rose-filled tandem bicycle and two straw hats beside a peaceful canal and stone bridge.",
    "orientation": "landscape",
    "atlas": "valentine-tandem-canal-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-midnight-station-2026-11-02",
    "name": "The Midnight Departure",
    "season": "New Year 2027",
    "description": "A steam train, waving travellers and fireworks at a festive winter station as the clock strikes midnight.",
    "orientation": "landscape",
    "atlas": "newyear-midnight-station-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-otter-iris-pool-2026-11-02",
    "name": "Otters in the Iris Pool",
    "season": "Mother’s Day",
    "description": "A mother otter cradles her pup on a mossy log beside irises, water lilies and a tranquil woodland pool.",
    "orientation": "portrait",
    "atlas": "mother-otter-iris-pool-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-kite-afternoon-2026-11-02",
    "name": "The Kite-Making Afternoon",
    "season": "Father’s Day",
    "description": "A father helps his daughter finish a patterned kite on a dune-side bench overlooking sailing boats.",
    "orientation": "landscape",
    "atlas": "father-kite-afternoon-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-covered-bridge-2026-11-02",
    "name": "The Covered Bridge Homecoming",
    "season": "Thanksgiving",
    "description": "A harvest wagon crosses a timber bridge with pumpkins, apples and wheat as family welcomes it home.",
    "orientation": "landscape",
    "atlas": "thanksgiving-covered-bridge-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261102Nature=[
  {
    "id": "christmas-squirrel-post-2026-11-02",
    "name": "Woodland Christmas Post",
    "season": "Christmas",
    "description": "Two squirrels deliver Christmas letters to a holly-draped postbox among snowy firs.",
    "orientation": "landscape",
    "atlas": "christmas-squirrel-post-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-hedgehog-greenhouse-2026-11-02",
    "name": "The Easter Greenhouse",
    "season": "Easter",
    "description": "A hedgehog discovers patterned Easter eggs and spring flowers in an ornate greenhouse wheelbarrow.",
    "orientation": "portrait",
    "atlas": "easter-hedgehog-greenhouse-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-deserted-observatory-2026-11-02",
    "name": "The Moonlit Observatory",
    "season": "Halloween",
    "description": "Bats circle an ivy-covered observatory above glowing toadstools and misty stone steps.",
    "orientation": "portrait",
    "atlas": "halloween-deserted-observatory-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-seahorse-embrace-2026-11-02",
    "name": "An Ocean Embrace",
    "season": "Valentine’s Day",
    "description": "Two seahorses entwine their tails beneath heart-shaped bubbles and sunlit sea grasses.",
    "orientation": "landscape",
    "atlas": "valentine-seahorse-embrace-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-lighthouse-bell-2026-11-02",
    "name": "Ringing in the Coastal New Year",
    "season": "New Year 2027",
    "description": "Midnight fireworks illuminate a lighthouse, silver waves and a ribbon-draped ship bell.",
    "orientation": "landscape",
    "atlas": "newyear-lighthouse-bell-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-red-panda-magnolia-2026-11-02",
    "name": "Magnolia Cuddles",
    "season": "Mother’s Day",
    "description": "A mother red panda shelters her cub on a mossy magnolia branch above a misty bamboo forest.",
    "orientation": "portrait",
    "atlas": "mother-red-panda-magnolia-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-stag-dawn-ridge-2026-11-02",
    "name": "Together at Dawn",
    "season": "Father’s Day",
    "description": "A stag and fawn greet sunrise on a fern-lined ridge overlooking a pine forest and mountain lake.",
    "orientation": "landscape",
    "atlas": "father-stag-dawn-ridge-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-quail-harvest-gate-2026-11-02",
    "name": "The Harvest Gate",
    "season": "Thanksgiving",
    "description": "Two quail rest beside a harvest wreath, wheat, squash and chestnuts at an orchard gate.",
    "orientation": "landscape",
    "atlas": "thanksgiving-quail-harvest-gate-2026-11-02",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261103=[
  {
    "id": "christmas-glasshouse-2026-11-03",
    "name": "Christmas in the Glasshouse",
    "season": "Christmas",
    "description": "Robins visit a snow-covered glasshouse filled with festive greenery and a Christmas tree.",
    "orientation": "landscape",
    "atlas": "christmas-glasshouse-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-duckling-bridge-2026-11-03",
    "name": "Ducklings by the Spring Bridge",
    "season": "Easter",
    "description": "Ducklings nest beside decorated eggs, daffodils and a stone bridge over a spring stream.",
    "orientation": "portrait",
    "atlas": "easter-duckling-bridge-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-moonlit-conservatory-2026-11-03",
    "name": "The Moonlit Conservatory",
    "season": "Halloween",
    "description": "Bats circle an ivy-covered conservatory among pumpkins under a bright autumn moon.",
    "orientation": "landscape",
    "atlas": "halloween-moonlit-conservatory-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-rose-locket-2026-11-03",
    "name": "The Rose Locket",
    "season": "Valentine’s Day",
    "description": "An ornate heart-shaped locket rests among roses, lace, antique keys and candlelight.",
    "orientation": "portrait",
    "atlas": "valentine-rose-locket-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-mountain-bell-2026-11-03",
    "name": "A Bell for Midnight",
    "season": "New Year 2027",
    "description": "Fireworks illuminate a mountain observatory beside an engraved antique bell.",
    "orientation": "landscape",
    "atlas": "newyear-mountain-bell-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-hedgehog-family-2026-11-03",
    "name": "Hedgehogs beneath the Blossom",
    "season": "Mother’s Day",
    "description": "A mother hedgehog nestles with her young beneath an apple tree in blossom.",
    "orientation": "portrait",
    "atlas": "mother-hedgehog-family-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-canoe-adventure-2026-11-03",
    "name": "The Riverside Canoe",
    "season": "Father’s Day",
    "description": "A wooden canoe, compass and walking boots await an adventure beside a mountain river.",
    "orientation": "landscape",
    "atlas": "father-canoe-adventure-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-harvest-windmill-2026-11-03",
    "name": "The Harvest Windmill",
    "season": "Thanksgiving",
    "description": "A windmill overlooks a cornfield with heirloom squash, corn and autumn leaves.",
    "orientation": "landscape",
    "atlas": "thanksgiving-harvest-windmill-2026-11-03",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261104=[
  {
    "id": "christmas-gingerbread-christmas-village-2026-11-04",
    "name": "Gingerbread Christmas Village",
    "season": "Christmas",
    "description": "A miniature gingerbread village glows on a festive windowsill.",
    "orientation": "portrait",
    "atlas": "christmas-gingerbread-christmas-village-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-the-easter-lily-window-2026-11-04",
    "name": "The Easter Lily Window",
    "season": "Easter",
    "description": "Sunlight shines through an Easter lily stained-glass window.",
    "orientation": "portrait",
    "atlas": "easter-the-easter-lily-window-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-the-midnight-cemetery-gate-2026-11-04",
    "name": "The Midnight Cemetery Gate",
    "season": "Halloween",
    "description": "A gothic clock tower rises beyond a misty cemetery gate.",
    "orientation": "landscape",
    "atlas": "halloween-the-midnight-cemetery-gate-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-the-heart-garden-maze-2026-11-04",
    "name": "The Heart Garden Maze",
    "season": "Valentine’s Day",
    "description": "Heart-shaped hedges and lanterns surround an elegant garden maze.",
    "orientation": "landscape",
    "atlas": "valentine-the-heart-garden-maze-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-fireworks-over-the-mountain-lake-2026-11-04",
    "name": "Fireworks over the Mountain Lake",
    "season": "New Year 2027",
    "description": "Fireworks and lanterns illuminate a snowy mountain lake.",
    "orientation": "landscape",
    "atlas": "newyear-fireworks-over-the-mountain-lake-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-the-butterfly-music-box-2026-11-04",
    "name": "The Butterfly Music Box",
    "season": "Mother’s Day",
    "description": "An enamelled music box rests among embroidery and a patchwork quilt.",
    "orientation": "portrait",
    "atlas": "mother-the-butterfly-music-box-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-the-bicycle-workshop-2026-11-04",
    "name": "The Bicycle Workshop",
    "season": "Father’s Day",
    "description": "An antique bicycle stands in a sunlit workshop among tools.",
    "orientation": "portrait",
    "atlas": "father-the-bicycle-workshop-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-the-harvest-bread-oven-2026-11-04",
    "name": "The Harvest Bread Oven",
    "season": "Thanksgiving",
    "description": "Fresh loaves, wheat and squash surround a rustic outdoor oven.",
    "orientation": "portrait",
    "atlas": "thanksgiving-the-harvest-bread-oven-2026-11-04",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261105=[
  {
    "id": "christmas-the-christmas-mantel-clock-2026-11-05",
    "name": "The Christmas Mantel Clock",
    "season": "Christmas",
    "description": "A festive antique clock with gifts and frosted decorations.",
    "orientation": "portrait",
    "atlas": "christmas-the-christmas-mantel-clock-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-the-iris-sundial-2026-11-05",
    "name": "The Iris Sundial",
    "season": "Easter",
    "description": "A decorated Easter egg and irises beside a stone sundial.",
    "orientation": "landscape",
    "atlas": "easter-the-iris-sundial-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-the-midnight-library-2026-11-05",
    "name": "The Midnight Library",
    "season": "Halloween",
    "description": "A bubbling cauldron in a moonlit gothic library.",
    "orientation": "portrait",
    "atlas": "halloween-the-midnight-library-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-the-heart-keys-2026-11-05",
    "name": "The Heart Keys",
    "season": "Valentine’s Day",
    "description": "Two ornamental heart-shaped keys among flowers.",
    "orientation": "landscape",
    "atlas": "valentine-the-heart-keys-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-the-midnight-pocket-watch-2026-11-05",
    "name": "The Midnight Pocket Watch",
    "season": "New Year 2027",
    "description": "A pocket watch and champagne glasses beneath fireworks.",
    "orientation": "portrait",
    "atlas": "newyear-the-midnight-pocket-watch-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-the-embroidered-bouquet-2026-11-05",
    "name": "The Embroidered Bouquet",
    "season": "Mother’s Day",
    "description": "A floral embroidery hoop with ribbons and sewing tools.",
    "orientation": "landscape",
    "atlas": "mother-the-embroidered-bouquet-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-the-stargazer-s-map-2026-11-05",
    "name": "The Stargazer’s Map",
    "season": "Father’s Day",
    "description": "A telescope and star chart on a mountain at night.",
    "orientation": "landscape",
    "atlas": "father-the-stargazer-s-map-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-the-autumn-cornucopia-2026-11-05",
    "name": "The Autumn Cornucopia",
    "season": "Thanksgiving",
    "description": "A woven cornucopia overflows with autumn produce.",
    "orientation": "landscape",
    "atlas": "thanksgiving-the-autumn-cornucopia-2026-11-05",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261106=[
  {
    "id": "christmas-the-citrus-christmas-wreath-2026-11-06",
    "name": "The Citrus Christmas Wreath",
    "season": "Christmas",
    "description": "A festive wreath with citrus, cinnamon and a brass bell.",
    "orientation": "landscape",
    "atlas": "christmas-the-citrus-christmas-wreath-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-the-porcelain-easter-egg-2026-11-06",
    "name": "The Porcelain Easter Egg",
    "season": "Easter",
    "description": "A decorated egg and tulips on a spring windowsill.",
    "orientation": "portrait",
    "atlas": "easter-the-porcelain-easter-egg-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-the-haunted-pipe-organ-2026-11-06",
    "name": "The Haunted Pipe Organ",
    "season": "Halloween",
    "description": "A pipe organ in a candlelit abandoned hall.",
    "orientation": "landscape",
    "atlas": "halloween-the-haunted-pipe-organ-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-the-chocolate-heart-box-2026-11-06",
    "name": "The Chocolate Heart Box",
    "season": "Valentine’s Day",
    "description": "A heart-shaped box of chocolates and strawberries.",
    "orientation": "landscape",
    "atlas": "valentine-the-chocolate-heart-box-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-the-midnight-astrolabe-2026-11-06",
    "name": "The Midnight Astrolabe",
    "season": "New Year 2027",
    "description": "A brass astrolabe, glasses and confetti beneath the stars.",
    "orientation": "landscape",
    "atlas": "newyear-the-midnight-astrolabe-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-the-gardener-s-watering-can-2026-11-06",
    "name": "The Gardener’s Watering Can",
    "season": "Mother’s Day",
    "description": "Flowering herbs beside a decorated watering can and gloves.",
    "orientation": "portrait",
    "atlas": "mother-the-gardener-s-watering-can-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-the-woodworker-s-bench-2026-11-06",
    "name": "The Woodworker’s Bench",
    "season": "Father’s Day",
    "description": "Hand tools and curled shavings on a wooden workbench.",
    "orientation": "landscape",
    "atlas": "father-the-woodworker-s-bench-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-the-harvest-table-2026-11-06",
    "name": "The Harvest Table",
    "season": "Thanksgiving",
    "description": "A braided loaf, apples and wheat on a harvest table.",
    "orientation": "portrait",
    "atlas": "thanksgiving-the-harvest-table-2026-11-06",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261111=[
  {
    "id": "advent-cottage-2026-11-11",
    "name": "Advent Cottage",
    "season": "Christmas",
    "description": "Advent Cottage seasonal lithophane artwork.",
    "orientation": "landscape",
    "atlas": "advent-cottage-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-bread-wreath-2026-11-11",
    "name": "Easter Bread Wreath",
    "season": "Easter",
    "description": "Easter Bread Wreath seasonal lithophane artwork.",
    "orientation": "landscape",
    "atlas": "easter-bread-wreath-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "lantern-and-spellbooks-2026-11-11",
    "name": "The Lantern and Spellbooks",
    "season": "Halloween",
    "description": "The Lantern and Spellbooks seasonal lithophane artwork.",
    "orientation": "landscape",
    "atlas": "lantern-and-spellbooks-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "stained-glass-heart-2026-11-11",
    "name": "Stained Glass Heart",
    "season": "Valentine’s Day",
    "description": "Stained Glass Heart seasonal lithophane artwork.",
    "orientation": "portrait",
    "atlas": "stained-glass-heart-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "midnight-toast-2026-11-11",
    "name": "A Midnight Toast",
    "season": "New Year 2027",
    "description": "A Midnight Toast seasonal lithophane artwork.",
    "orientation": "landscape",
    "atlas": "midnight-toast-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "peonies-sewing-basket-2026-11-11",
    "name": "Peonies and Sewing Basket",
    "season": "Mother’s Day",
    "description": "Peonies and Sewing Basket seasonal lithophane artwork.",
    "orientation": "portrait",
    "atlas": "peonies-sewing-basket-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "camera-and-tools-2026-11-11",
    "name": "Camera and Tools",
    "season": "Father’s Day",
    "description": "Camera and Tools seasonal lithophane artwork.",
    "orientation": "landscape",
    "atlas": "camera-and-tools-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "pears-lantern-light-2026-11-11",
    "name": "Pears by Lantern Light",
    "season": "Thanksgiving",
    "description": "Pears by Lantern Light seasonal lithophane artwork.",
    "orientation": "portrait",
    "atlas": "pears-lantern-light-2026-11-11",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

const additions20261112=[
  {
    "id": "christmas-christmas-handbells-2026-11-12",
    "name": "Christmas Handbells",
    "season": "Christmas",
    "description": "Christmas Handbells lithophane artwork.",
    "orientation": "portrait",
    "atlas": "christmas-christmas-handbells-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "easter-chocolate-easter-egg-2026-11-12",
    "name": "The Chocolate Easter Egg",
    "season": "Easter",
    "description": "The Chocolate Easter Egg lithophane artwork.",
    "orientation": "landscape",
    "atlas": "easter-chocolate-easter-egg-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "halloween-witchs-broom-2026-11-12",
    "name": "The Witch’s Broom",
    "season": "Halloween",
    "description": "The Witch’s Broom lithophane artwork.",
    "orientation": "portrait",
    "atlas": "halloween-witchs-broom-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "valentine-locks-of-love-2026-11-12",
    "name": "Locks of Love",
    "season": "Valentine’s Day",
    "description": "Locks of Love lithophane artwork.",
    "orientation": "portrait",
    "atlas": "valentine-locks-of-love-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "newyear-midnight-hourglass-2026-11-12",
    "name": "The Midnight Hourglass",
    "season": "New Year 2027",
    "description": "The Midnight Hourglass lithophane artwork.",
    "orientation": "portrait",
    "atlas": "newyear-midnight-hourglass-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "mother-lilac-embroidery-2026-11-12",
    "name": "Lilac and Embroidery",
    "season": "Mother’s Day",
    "description": "Lilac and Embroidery lithophane artwork.",
    "orientation": "portrait",
    "atlas": "mother-lilac-embroidery-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "father-mountain-radio-2026-11-12",
    "name": "The Mountain Radio",
    "season": "Father’s Day",
    "description": "The Mountain Radio lithophane artwork.",
    "orientation": "portrait",
    "atlas": "father-mountain-radio-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "thanksgiving-bread-autumn-apples-2026-11-12",
    "name": "Bread and Autumn Apples",
    "season": "Thanksgiving",
    "description": "Bread and Autumn Apples lithophane artwork.",
    "orientation": "landscape",
    "atlas": "thanksgiving-bread-autumn-apples-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  },
  {
    "id": "gonk-fishing-gonk-2026-11-12",
    "name": "The Fishing Gonk",
    "season": "Gonk",
    "description": "The Fishing Gonk lithophane artwork.",
    "orientation": "portrait",
    "atlas": "gonk-fishing-gonk-2026-11-12",
    "column": 0,
    "row": 0,
    "columns": 1,
    "rows": 1,
    "cropToPostcard": true
  }
];

export const seasonalDesigns=[
 ...originalDesigns.map(d=>({...d,atlas:'original',orientation:'portrait'})),
 ...newPortraits.flatMap(([atlas,season,designs])=>designs.map(([id,name,description],i)=>({id,name,description,season,atlas,column:i%2,row:Math.floor(i/2),orientation:'portrait'}))),
 ...landscapeGroups.flatMap(([atlas,designs])=>designs.map(([id,season,name,description],i)=>({id,name,description,season,atlas,column:i%2,row:Math.floor(i/2),orientation:'landscape'}))),
 ...additions20261101,
 ...additions20261102,
 ...additions20261102Nature,
 ...additions20261103,
 ...additions20261104,
 ...additions20261105,
 ...additions20261106,
 ...additions20261111,
 {id:'gonk-spring-gardener-2026-11-12',name:'The Spring Gardener Gonk',season:'Gonk',description:'A cheerful gonk tends spring flowers at a garden potting bench.',orientation:'portrait',atlas:'gonk-spring-gardener-2026-11-12',column:0,row:0,columns:1,rows:1,cropToPostcard:true},
 ...additions20261112
];
export function sampleSize(design){return postcardSize(design.orientation);}

export function artworkCell(design,imageWidth,imageHeight){
 const columns=design.columns??(design.atlas==='original'?3:2);
 const rows=design.rows??(design.atlas==='original'?4:2);
 const cell={x:design.column*imageWidth/columns,y:design.row*imageHeight/rows,width:imageWidth/columns,height:imageHeight/rows};
 // Only new standalone artwork opts in; historical atlas crops stay identical.
 if(design.cropToPostcard){
  const size=sampleSize(design),aspect=size.width/size.height;
  const width=Math.min(cell.width,cell.height*aspect),height=width/aspect;
  return {x:cell.x+(cell.width-width)/2,y:cell.y+(cell.height-height)/2,width,height};
 }
 return cell;
}
