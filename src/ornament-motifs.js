// All motifs are real 2D cross-sections, in a shared 100 mm drawing space.
// Curved stems and rounded strokes join silhouettes into the surrounding ring.
export function ornamentMotifs(C,own,design){
 const shapes=[],put=s=>(shapes.push(s),s),circle=(r,x=0,y=0)=>own(C.circle(r,48).translate([x,y]));
 const poly=points=>own(new C([points],'NonZero'));
 const oval=(rx,ry,x,y,a=0)=>own(C.circle(1,48).scale([rx,ry]).rotate(a).translate([x,y]));
 const union=ss=>own(C.union(ss));
 const stroke=(pts,w=1.8)=>union(pts.slice(1).map((b,i)=>own(C.hull([circle(w/2,...pts[i]),circle(w/2,...b)]))));
 const curve=(a,b,c,d,w=1.8)=>{const pts=[];for(let i=0;i<=24;i++){const t=i/24,u=1-t;pts.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]);}return stroke(pts,w);};
 const star=(x,y,r=6)=>poly(Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5,k=i%2?r*.43:r;return[x+Math.cos(a)*k,y+Math.sin(a)*k];}));
 const heart=(x,y,s=1)=>union([circle(4*s,x-3*s,y+2*s),circle(4*s,x+3*s,y+2*s),poly([[x-6.6*s,y+1.6*s],[x,y-7*s],[x+6.6*s,y+1.6*s]])]);
 const leaf=(x,y,a,s=1)=>oval(2.3*s,5.8*s,x,y,a);
 function sprig(side=1,flowers=false){
  put(curve([side*43,-17],[side*55,12],[side*31,39],[side*8,44],2));
  for(let i=0;i<7;i++){const a=(-20+i*14)*Math.PI/180,x=side*43*Math.cos(a),y=43*Math.sin(a);put(leaf(x-side*3,y+2,side*(-35+i*8),.8));if(i<5)put(leaf(x+side*3,y+5,side*(50+i*8),.7));}
  if(flowers)for(const [x,y]of [[side*30,28],[side*17,39]])flower(x,y,4.5);
 }
 function flower(x,y,r=6){for(let i=0;i<5;i++){const a=i*2*Math.PI/5;put(oval(r*.48,r*.72,x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,a*180/Math.PI-90));}put(circle(r*.4,x,y));}
 function pine(x,y,s=1){put(poly([[x,y+15*s],[x-6*s,y+4*s],[x-3*s,y+4*s],[x-9*s,y-4*s],[x-5*s,y-4*s],[x-11*s,y-13*s],[x+11*s,y-13*s],[x+5*s,y-4*s],[x+9*s,y-4*s],[x+3*s,y+4*s],[x+6*s,y+4*s]]));put(stroke([[x,y-16*s],[x,y+5*s]],2.4*s));}
 function snow(x,y,r=7){for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a),dy=Math.sin(a);put(stroke([[x,y],[x+dx*r,y+dy*r]],1.5));for(const sign of [-1,1])put(stroke([[x+dx*r*.57,y+dy*r*.57],[x+dx*r*.78-dy*sign*r*.22,y+dy*r*.78+dx*sign*r*.22]],1.25));}}
 function bow(x,y){put(oval(8,4.5,x-6,y+2,-25));put(oval(8,4.5,x+6,y+2,25));put(poly([[x-2,y],[x-12,y-13],[x-5,y-11],[x,y-3],[x+5,y-11],[x+12,y-13],[x+2,y]]));put(circle(3.3,x,y+1));}
 function bell(x,y,s=1){put(poly([[x-4*s,y+6*s],[x+4*s,y+6*s],[x+5*s,y-1*s],[x+8*s,y-6*s],[x-8*s,y-6*s],[x-5*s,y-1*s]]));put(circle(2.3*s,x,y-7*s));put(stroke([[x-7*s,y-4*s],[x+7*s,y-4*s]],2*s));}
 function paws(x,y,s=1){put(oval(5*s,4*s,x,y-2*s));for(const [dx,dy]of [[-5,3],[-2,6],[2,6],[5,3]])put(oval(1.8*s,2.3*s,x+dx*s,y+dy*s));}
 const stems=()=>sprig(1);const blossoms=()=>{sprig(1,true);sprig(-1,true);};
 switch(design){
 case 'bells':sprig(-1);bell(-17,29,.9);bell(-2,30,.8);bow(-10,40);pine(23,-32,.7);put(star(27,29,7));break;
 case 'bow':sprig(-1);bow(0,38);flower(22,-30,10);put(curve([40,-20],[28,-23],[21,-35],[6,-44],2));put(heart(29,21,.7));break;
 case 'forest':put(poly([[-39,20],[-23,39],[-10,24],[0,42],[17,22],[28,34],[41,18],[26,24],[17,13],[0,32],[-10,16],[-23,29]]));pine(-25,-31,.8);pine(24,-30,.9);pine(-8,-38,.5);break;
 case 'poinsettia':blossoms();flower(0,-32,11);bow(0,38);break;
 case 'reindeer':sprig(-1);put(oval(8,6,1,-34));put(oval(3.5,9,6,-27,20));put(oval(4,3,9,-21));put(stroke([[7,-20],[5,-13],[2,-11]],1.9));put(stroke([[5,-16],[10,-12],[11,-8]],1.8));for(const x of [-4,5])put(stroke([[x,-35],[x-1,-44]],2.4));pine(-25,-35,.55);pine(27,-34,.65);put(star(20,30,8));break;
 case 'snowflake':sprig(-1);snow(15,30,11);snow(23,-29,8);snow(-15,-36,6);break;
 case 'dog':sprig(-1);put(union([oval(9,9,8,-31),oval(7,5,15,-28),oval(3.8,8,0,-27,-25),poly([[2,-34],[0,-45],[17,-45],[13,-33]])]));paws(24,28,.8);break;
 case 'bone':blossoms();put(union([poly([[-14,-35],[14,-35],[14,-29],[-14,-29]]),...[-1,1].flatMap(side=>[circle(4,side*14,-29),circle(4,side*14,-35)])]));paws(0,33,1);break;
 case 'cat':sprig(-1);put(union([oval(7,11,5,-34),circle(5,5,-22),poly([[0,-20],[0,-14],[5,-18],[10,-14],[10,-20]]),curve([9,-43],[28,-43],[29,-29],[19,-31],3)]));put(own(circle(10,13,30).subtract(circle(9,17,33))));break;
 case 'memorial':blossoms();put(heart(0,-30,1.55));paws(0,-29,.65);put(heart(21,29,.85));break;
 case 'cake':sprig(-1);put(poly([[-17,-40],[17,-40],[17,-25],[-17,-25]]));put(stroke([[-18,-24],[18,-24]],2.4));put(stroke([[-16,-32],[16,-32]],2));for(const x of [-10,0,10]){put(stroke([[x,-24],[x,-15]],2.6));put(oval(1.8,3,x,-12));}put(star(19,31,7));break;
 case 'balloons':sprig(-1);for(const [x,y]of [[-12,30],[2,36],[15,29]]){put(oval(6,8,x,y));put(curve([x,y-7],[x+5,y-13],[x-5,y-18],[x,y-21],1.6));}bow(2,-34);break;
 case 'present':blossoms();put(poly([[-16,-44],[16,-44],[16,-24],[-16,-24]]));bow(0,-23);put(stroke([[0,-44],[0,-23]],3));put(star(10,32,7));break;
 case 'crown':sprig(-1);put(poly([[-21,-30],[-17,-43],[17,-43],[21,-30],[10,-35],[0,-23],[-10,-35]]));for(const [x,y]of [[-21,-30],[0,-23],[21,-30]])put(circle(2.5,x,y));put(star(18,31,8));break;
 case 'badge':blossoms();put(star(0,-31,12));put(star(0,34,8));break;
 case 'confetti':bow(0,37);for(const [x,y]of [[-30,26],[31,24],[-25,-31],[24,-32]]){put(star(x,y,6));put(curve([x,y],[x-8,y+4],[x+6,y+10],[x+4,y+13],1.6));}break;
 case 'moon':sprig(-1);put(own(circle(12,3,31).subtract(circle(10,8,35))));for(const [x,y]of [[-22,31],[26,28],[21,-30]])put(star(x,y,5));put(union([oval(12,4,0,-38),circle(6,-6,-34),circle(7,3,-32)]));break;
 case 'teddy':blossoms();put(union([oval(9,10,0,-34),circle(8,0,-22),circle(4,-7,-16),circle(4,7,-16),circle(4,-10,-39),circle(4,10,-39),oval(4,7,-9,-29,-25),oval(4,7,9,-29,25)]));put(heart(14,31,.8));break;
 case 'feet':blossoms();for(const sign of [-1,1]){const x=sign*7;put(oval(4,7,x,-34,sign*-18));for(let i=0;i<4;i++)put(circle(1.7,x+sign*(i-1)*2.5,-25+i*.6));}break;
 case 'stork':sprig(-1);put(union([oval(9,4,-6,29,-15),curve([0,30],[8,28],[4,40],[13,37],2.8),circle(3,13,37),poly([[15,38],[27,36],[16,35]]),poly([[-8,30],[-24,40],[-16,25]]),heart(25,27,.6)]));put(stroke([[23,36],[25,31]],1.6));put(union([oval(13,4,0,-38),circle(6,-6,-34),circle(7,3,-32)]));break;
 case 'rings':blossoms();for(const x of [-6,6])put(own(circle(9,x,-32).subtract(circle(6.5,x,-32))));break;
 case 'hearts':blossoms();put(heart(-7,-30,1.2));put(heart(8,32,1));break;
 case 'roses':blossoms();flower(-14,-31,8);flower(12,-33,8);put(heart(0,33,1));break;
 case 'wedding-bells':blossoms();bell(-8,-30);bell(9,-31);bow(0,-19);break;
 case 'bunny':sprig(-1,true);put(union([oval(8,9,2,-36),circle(6,3,-25),oval(2.8,10,-1,-15,-12),oval(2.8,10,6,-15,12),circle(4,-7,-37)]));flower(25,29,6);break;
 case 'eggs':blossoms();for(const [x,y]of [[-14,-35],[0,-30],[14,-35]])put(oval(6,9,x,y));break;
 case 'chick':blossoms();put(union([oval(10,8,0,-35),circle(6,5,-26),poly([[10,-25],[17,-27],[10,-29]]),poly([[-9,-32],[-16,-27],[-11,-37]])]));put(stroke([[-2,-40],[-2,-45]],2));put(stroke([[5,-40],[5,-45]],2));break;
 case 'butterfly':blossoms();for(const sign of [-1,1]){put(oval(6,9,sign*6,-26,sign*-22));put(oval(5,6,sign*5,-36,sign*20));}put(stroke([[0,-40],[0,-20]],2.6));break;
 case 'pumpkin':sprig(-1);put(union([oval(13,10,0,-33),oval(7,11,0,-33),curve([0,-23],[-3,-18],[8,-15],[6,-22],2.6)]));put(star(24,30,7));break;
 case 'ghost':sprig(-1);put(union([circle(10,0,-26),poly([[-10,-26],[-10,-41],[-5,-38],[0,-42],[5,-38],[10,-41],[10,-26]]),oval(6,3,-12,-29,30),oval(6,3,12,-29,-30)]));put(star(18,31,7));break;
 case 'bat':sprig(-1);put(poly([[-28,33],[-19,36],[-11,31],[-4,34],[-3,40],[0,37],[3,40],[4,34],[11,31],[19,36],[28,33],[22,25],[15,28],[9,23],[4,26],[0,20],[-4,26],[-9,23],[-15,28],[-22,25]]));put(own(circle(9,19,-30).subtract(circle(8,23,-26))));break;
 case 'house':sprig(-1);put(poly([[-19,-44],[-19,-29],[-23,-29],[-11,-15],[-1,-27],[5,-20],[20,-34],[17,-34],[17,-44]]));put(stroke([[27,-44],[26,-20],[21,-13]],2.1));put(stroke([[26,-29],[35,-23],[34,-15]],1.8));put(star(19,31,6));break;
 default:throw Error('Unknown ornament motif.');
 }
 return union(shapes);
}
