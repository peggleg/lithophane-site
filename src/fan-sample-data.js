export const fanSamples = [
 ['alpine-lake','Alpine reflections','mountains',0,'Snow-capped peaks and fir trees reflected in a quiet alpine lake.'],
 ['waterfall-gorge','Hidden waterfall','mountains',1,'Cascading water, mossy rocks and ferns in a secluded gorge.'],
 ['wildflower-meadow','Wildflower valley','mountains',2,'A rolling meadow of wildflowers beneath distant mountains.'],
 ['redwood-forest','Among the redwoods','mountains',3,'Sunbeams filter through an ancient forest beside a winding stream.'],
 ['sea-cliffs','Wild coastline','coast',0,'Ocean waves and seabirds beneath rugged coastal cliffs.'],
 ['tropical-lagoon','Island stillness','coast',1,'Palms frame a tranquil lagoon and a distant tropical island.'],
 ['desert-dunes','Desert light','coast',2,'Sweeping sand dunes lead towards a distant rocky mesa.'],
 ['river-canyon','River of stone','coast',3,'A winding river cuts through a dramatic layered canyon.'],
 ['woodland-deer','Lakeside deer','wildlife',0,'Deer pause beside a woodland lake with hills beyond.'],
 ['wetland-cranes','Morning on the marsh','wildlife',1,'Cranes stand among reeds beneath misty mountains.'],
 ['butterfly-meadow','Butterfly garden','wildlife',2,'Butterflies drift over a lush meadow at the forest edge.'],
 ['snowy-river','Winter hush','wildlife',3,'A quiet river winds through snowy firs towards distant peaks.'],
 ['snoopy-beach','Snoopy’s beach day','snoopy-beach',null,'Snoopy and friends enjoy a sunny day by the sea.'],
 ['snoopy-gingerbread','Snoopy’s gingerbread village','snoopy-gingerbread',null,'Snoopy and Woodstock make a gingerbread village.'],
 ['christmas-tree-farm','Christmas tree farm','christmas-tree-farm',null,'A snowy Christmas tree farm with a sleigh and glowing barn.'],
 ['christmas-market','Snowy Christmas market','christmas-market',null,'A festive mountain village and market in the snow.'],
 ['cartoon-dragon-baker','Dragon’s pastry shop','cartoon-dragon-baker',null,'A friendly cartoon dragon bakes treats for woodland friends.'],
 ['cartoon-fox-astronaut','Fox astronaut','cartoon-fox-astronaut',null,'A cartoon fox explores a moonlit world.'],
 ['capybara-snowy-springs','Capybara hot springs','capybara-snowy-springs',null,'Capybaras relax in warm springs among snowy trees.'],
 ['capybara-picnic','Capybara garden picnic','capybara-picnic',null,'A family of capybaras enjoys a garden picnic.'],
 ['highland-loch','Highland calves by the loch','highland-loch',null,'Cartoon Highland calves sit beside a scenic loch.'],
 ['highland-bakers','Highland cow bakers','highland-bakers',null,'Cartoon Highland cows bake shortbread together.']
].map(([id,name,atlas,cell,description])=>({id,name,atlas,cell,description}));

export function sampleCell(design,width,height){
 if(!design||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Unknown fan artwork cell.');
 if(design.cell===null){const w=Math.min(width,height*2),h=w/2;return {x:(width-w)/2,y:(height-h)/2,width:w,height:h};}
 if(!Number.isInteger(design.cell)||design.cell<0||design.cell>3)throw Error('Unknown fan artwork cell.');
 return {x:(design.cell%2)*width/2,y:Math.floor(design.cell/2)*height/2,width:width/2,height:height/2};
}
