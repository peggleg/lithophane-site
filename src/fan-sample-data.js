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
 ['snowy-river','Winter hush','wildlife',3,'A quiet river winds through snowy firs towards distant peaks.']
].map(([id,name,atlas,cell,description])=>({id,name,atlas,cell,description}));

export function sampleCell(design,width,height){
 if(!design||!Number.isInteger(design.cell)||design.cell<0||design.cell>3)throw Error('Unknown fan artwork cell.');
 return {x:(design.cell%2)*width/2,y:Math.floor(design.cell/2)*height/2,width:width/2,height:height/2};
}
