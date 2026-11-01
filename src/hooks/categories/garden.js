export const category={id:'garden',name:'Garden',colours:["#74876a", "#eee4ce", "#d4ac55", "#514635"],designs:[['tulip-turn','Tulip Turn'],['sunny-bloom','Sunny Bloom'],['cactus-curl','Cactus Curl'],['leaf-loop','Leaf Loop'],['vine-twist','Vine Twist']]};
function drawArt(id,A){const{e,r,poly,union,curve,leaf,petal,shape,insert}=A;switch(id){
case'tulip-turn':return shape('Tulip Turn',union(r(0,-1,12,50,5),leaf(-15,-6,18,37,-35),leaf(15,-6,18,37,35),e(-10,29,10,18),e(10,29,10,18),e(0,35,9,18)),[insert(union(e(-10,29,10,18),e(10,29,10,18),e(0,35,9,18)),2)],[],{x:6,width:20});
case'sunny-bloom':return shape('Sunny Bloom',union(r(0,-4,12,49,5),leaf(-14,-7,17,32,-45),leaf(14,-7,17,32,45),petal(0,25,24,10)),[insert(petal(0,25,21,10),2),insert(e(0,25,12),1)],[e(-5,28,1),e(4,28,1),e(0,22,1)],{width:22});
case'cactus-curl':return shape('Cactus Curl',union(r(0,3,19,70,9),curve([[-4,1],[-24,-4],[-25,9],[-25,22]],14),curve([[5,-10],[25,-11],[25,0],[25,12]],14)),[insert(r(0,9,8,45,4),1)],[curve([[-4,-19],[-4,-3],[-4,15],[-4,29]],1.1)],{x:7,width:21});
case'leaf-loop':return shape('Leaf Loop',union(leaf(0,6,49,77,-8),curve([[0,-31],[-3,-20],[-2,-10],[2,-2]],13)),[insert(curve([[-2,-24],[3,-6],[2,13],[-3,34]],3),1)],[-18,-7,6,19].flatMap(y=>[curve([[1,y],[-5,y+4],[-12,y+10],[-15,y+15]],1.1),curve([[1,y],[6,y+4],[13,y+8],[17,y+12]],1.1)]),{x:4,width:22});
case'vine-twist':return shape('Vine Twist',union(curve([[-7,-29],[-30,6],[26,-5],[10,22]],13),curve([[10,22],[6,35],[-6,37],[-11,23]],11),leaf(-18,24,19,31,-25),leaf(15,31,16,25,34)),[insert(leaf(-18,24,14,25,-25),1),insert(leaf(15,31,12,20,34),1)],[],{x:7,width:20});
default:throw Error('Choose a garden hook.');}}

export const palettes=[[0,1,2],[0,3,2],[0,1,2],[0,1,3],[0,1,2]];

const volumes={"tulip-turn":{"mass":[[-10,29,10,18,10],[10,29,10,18,10],[0,35,9,18,11],[0,-1,6,25,8]]},"sunny-bloom":{"mass":[[0,25,21,21,10],[0,-4,6,24.5,8]]},"cactus-curl":{"mass":[[0,3,9.5,35,10]],"massHulls":[[[-4,1,7,7,8],[-23,0,7,7,8],[-25,22,7,7,8]],[[5,-10,7,7,8],[25,-8,7,7,8],[25,12,7,7,8]]]}};
export function draw(id,A){const art=drawArt(id,A),{path,...body}=volumes[id]||{};return{...art,...body,hook:{...art.hook,...(path?{path}:{})}};}

export const designColours=[['#74876a','#eee4ce','#c9877d','#514635'],category.colours,category.colours,category.colours,category.colours];
