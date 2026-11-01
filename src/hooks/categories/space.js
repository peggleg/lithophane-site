export const category={id:'space',name:'Space',colours:["#82a3ae", "#eee5d1", "#b76c4b", "#354850"],designs:[['rocket-rest','Rocket Rest'],['saturn-loop','Saturn Loop'],['moon-cradle','Moon Cradle'],['space-buddy','Space Buddy'],['comet-curl','Comet Curl']]};
function drawArt(id,A){const{e,r,poly,union,cut,curve,face,star,shape,insert}=A;switch(id){
case'rocket-rest':return shape('Rocket Rest',union(e(0,16,18,32),poly([[-15,10],[-29,-7],[-13,-4]]),poly([[15,10],[29,-7],[13,-4]]),r(0,-13,14,24,6)),[insert(poly([[-15,10],[-29,-7],[-13,-4]]),2),insert(poly([[15,10],[29,-7],[13,-4]]),2),insert(poly([[-12,32],[0,48],[12,32]]),2),insert(e(0,20,10),1),insert(poly([[-12,0],[12,0],[12,-7],[-12,-7]]),2)],[e(0,20,6)],{x:4,width:21});
case'saturn-loop':{const planet=e(0,10,27),ring=cut(ownEllipse(A,0,8,37,12,-18),ownEllipse(A,0,8,27,5,-18));return shape('Saturn Loop',union(planet,ring),[insert(ring,1),insert(curve([[-20,21],[-4,31],[9,25],[21,21]],7),2)],[],{x:7,width:23});}
case'moon-cradle':{const moon=cut(e(0,5,31,37),e(15,16,27,31));return shape('Moon Cradle',moon,[insert(e(-18,12,5),1),insert(e(-13,-5,4),1),insert(e(-14,27,3),1)],[],{x:4,width:22});}
case'space-buddy':return shape('Space Buddy',union(e(0,24,27,25),r(0,-8,39,38,9),e(-23,-10,9,18),e(23,-10,9,18)),[insert(e(0,25,21,18),2),insert(r(0,-4,20,14,3),1),insert(e(-23,-11,6,11),1),insert(e(23,-11,6,11),1)],[r(-5,-4,4,7,1),r(5,-4,4,7,1)],{width:24});
case'comet-curl':return shape('Comet Curl',union(star(-15,25,18),curve([[-9,29],[36,37],[30,-15],[1,-23]],24)),[insert(star(-15,25,16),2),insert(curve([[-3,26],[25,27],[28,-7],[8,-18]],10),1)],[],{x:9,width:21});
default:throw Error('Choose a space hook.');}}
function ownEllipse(A,x,y,rx,ry,angle){return A.turn(A.e(x,y,rx,ry),angle);}

export const palettes=[[1,0,2],[0,1,3],[1,0,3],[1,0,3],[1,0,2]];

const volumes={"saturn-loop":{"mass":[[0,10,27,27,13]]},"space-buddy":{"mass":[[0,24,27,25,12],[0,-8,19.5,19,10],[-23,-10,9,18,9],[23,-10,9,18,9]]}};
export function draw(id,A){const art=drawArt(id,A),{path,...body}=volumes[id]||{};return{...art,...body,hook:{...art.hook,...(path?{path}:{})}};}
