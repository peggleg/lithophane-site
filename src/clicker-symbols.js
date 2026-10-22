import {outline} from './symbols.js';
export const symbolCollections={
 basics:{label:'Everyday favourites',palette:'candy',symbols:['heart','star','cloud','flower','plus']},
 cute:{label:'Cute & cosmic',palette:'pastel',symbols:['paw','cat','moon','bolt','music']},
 sports:{label:'Sports club',palette:'arcade',symbols:['basketball','tennis','football','skateboard','trophy']},
 fruit:{label:'Fruit salad',palette:'candy',symbols:['strawberry','cherries','apple','watermelon','lemon']},
 halloween:{label:'Halloween',palette:'spooky',symbols:['pumpkin','ghost','bat','skull','hat']},
 christmas:{label:'Christmas',palette:'christmas',symbols:['tree','snowflake','present','bauble','gingerbread']}
};
export const symbolNames={heart:'Heart',star:'Star',cloud:'Cloud',flower:'Flower',plus:'Plus',paw:'Paw print',cat:'Cat',moon:'Crescent moon',bolt:'Lightning bolt',music:'Music notes',basketball:'Basketball',tennis:'Tennis ball',football:'Football',skateboard:'Skateboard',trophy:'Trophy',strawberry:'Strawberry',cherries:'Cherries',apple:'Apple',watermelon:'Watermelon',lemon:'Lemon',pumpkin:'Pumpkin',ghost:'Ghost',bat:'Bat',skull:'Skull',hat:'Witch hat',tree:'Christmas tree',snowflake:'Snowflake',present:'Present',bauble:'Bauble',gingerbread:'Gingerbread figure'};
export function makeClickerSymbol(C,own,type){
 const circle=(x,y,r,sx=1,sy=1)=>own(own(own(C.circle(r,48)).scale([sx,sy])).translate([x,y]));
 const rect=(x,y,w,h)=>own(own(C.square([w,h],true)).translate([x,y]));
 const poly=points=>own(new C([points],'EvenOdd'));
 const union=(...parts)=>own(C.union(parts));
 const subtract=(shape,...holes)=>own(shape.subtract(union(...holes)));
 const line=(x,y,u,v,w=.8)=>{const dx=u-x,dy=v-y,d=Math.hypot(dx,dy),a=-dy/d*w/2,b=dx/d*w/2;return union(poly([[x+a,y+b],[u+a,v+b],[u-a,v-b],[x-a,y-b]]),circle(x,y,w/2),circle(u,v,w/2));};
 let shape;
 if(['heart','star','cloud','flower','plus'].includes(type))return poly(outline(type,10,10));
 if(type==='paw')shape=union(circle(0,-1.5,2.8,1,.8),...[[ -3,1.5],[-1.2,3],[1.2,3],[3,1.5]].map(([x,y])=>circle(x,y,1, .85,1.2)));
 else if(type==='cat')shape=subtract(union(circle(0,-.4,3.6),poly([[-3.5,1],[-3.3,4.7],[-.8,2.3]]),poly([[3.5,1],[3.3,4.7],[.8,2.3]])),circle(-1.3,.2,.55),circle(1.3,.2,.55));
 else if(type==='moon')shape=subtract(circle(0,0,4.6),circle(2.4,1.4,4.2));
 else if(type==='bolt')shape=poly([[-.2,5],[-3.8,-.4],[-.5,-.4],[-1,-5],[4,1.2],[.8,1.2]]);
 else if(type==='music')shape=union(circle(-2.7,-3,1.3,1.2,.8),circle(2,-2,1.3,1.2,.8),rect(-1.7,0,.85,6),rect(3,1,.85,6),poly([[-2.1,2.2],[3.4,3.2],[3.4,4.4],[-2.1,3.4]]));
 else if(type==='basketball'||type==='tennis'){
  const seams=[subtract(circle(-5.3,0,5),circle(-5.3,0,4.25)),subtract(circle(5.3,0,5),circle(5.3,0,4.25))];
  if(type==='basketball')seams.push(rect(0,0,.7,10),rect(0,0,10,.7));shape=subtract(circle(0,0,4.7),...seams);
 }
 else if(type==='football'){
  const pentagon=Array.from({length:5},(_,i)=>[Math.cos(i*Math.PI*2/5+Math.PI/2)*1.55,Math.sin(i*Math.PI*2/5+Math.PI/2)*1.55]);
  shape=subtract(circle(0,0,4.7),poly(pentagon),...pentagon.map(([x,y])=>line(x*1.3,y*1.3,x*3.3,y*3.3,.65)));
 }
 else if(type==='skateboard')shape=union(rect(0,1,6,2.8),circle(-3,1,1.4),circle(3,1,1.4),line(-3,-.3,-3,-1.5,1),line(3,-.3,3,-1.5,1),circle(-3,-2,.9),circle(3,-2,.9));
 else if(type==='trophy')shape=union(poly([[-3,4],[3,4],[2,-.5],[-2,-.5]]),rect(0,-1.8,1.3,3),rect(0,-3.7,4.5,1.2),subtract(circle(-3,2,2),circle(-3,2,1.1)),subtract(circle(3,2,2),circle(3,2,1.1)));
 else if(type==='strawberry')shape=subtract(union(poly(outline('heart',8,9)),poly([[-3,3.7],[-1,3.3],[0,5],[1,3.3],[3,3.7],[1.8,2.1],[-1.8,2.1]])),...[[ -1.5,1],[1.5,1],[0,-1],[-.8,-2.4],[.8,-2.4]].map(([x,y])=>circle(x,y,.32,1,1.4)));
 else if(type==='cherries')shape=union(circle(-2.2,-2.1,2.1),circle(2.2,-2.1,2.1),line(-2.2,-.4,0,4,.65),line(2.2,-.4,0,4,.65),circle(1.6,3.5,1.4,1.3,.55));
 else if(type==='apple')shape=union(circle(-1.5,-.8,3),circle(1.5,-.8,3),circle(0,-2,2.3),rect(0,3,1,2),circle(1.7,3.6,1.4,1.3,.65));
 else if(type==='watermelon')shape=subtract(own(circle(0,0,4.7).intersect(rect(0,-2.5,10,5))),circle(-2,-1.2,.35,1,1.5),circle(2,-1.2,.35,1,1.5),circle(0,-3,.35,1,1.5),rect(0,-.6,8,.65));
 else if(type==='lemon')shape=union(circle(0,0,4,1,.7),circle(-3.8,0,.7),circle(3.8,0,.7));
 else if(type==='pumpkin')shape=subtract(union(circle(-1.6,-.6,3.2),circle(1.6,-.6,3.2),rect(0,3.2,1.4,2)),poly([[-2.6,.3],[-1.2,.3],[-1.9,1.5]]),poly([[2.6,.3],[1.2,.3],[1.9,1.5]]),rect(0,-1.5,2.5,.8));
 else if(type==='ghost')shape=subtract(union(circle(0,1,3.3),rect(0,-.7,6.6,3.5),poly([[-3.3,-1],[-3.3,-4],[-1.7,-3.1],[0,-4],[1.7,-3.1],[3.3,-4],[3.3,-1]])),circle(-1.1,1,.55),circle(1.1,1,.55),circle(0,-.6,.5));
 else if(type==='bat')shape=union(poly([[-5,2],[-3.9,-1.2],[-2.4,-.4],[-1.8,-2],[0,-1.1],[1.8,-2],[2.4,-.4],[3.9,-1.2],[5,2],[2,1],[0,2],[-2,1]]),circle(0,1.4,1.2),poly([[-1,1.7],[-1,3.3],[0,2.3],[1,3.3],[1,1.7]]));
 else if(type==='skull')shape=subtract(union(circle(0,1,3.7),rect(0,-2.1,4.8,3.2)),circle(-1.5,1,.85),circle(1.5,1,.85),poly([[-.55,-1.1],[.55,-1.1],[0,-.2]]),...[-1.5,0,1.5].map(x=>rect(x,-3.4,.5,1.3)));
 else if(type==='hat')shape=subtract(union(poly([[-3,0],[.2,5],[2,2.8],[2.9,0]]),circle(0,-.5,4.7,1,.26)),rect(0,.8,5,.7));
 else if(type==='tree')shape=union(poly([[-2,1],[0,5],[2,1]]),poly([[-3,-1.5],[0,2.5],[3,-1.5]]),poly([[-4,-3.6],[0,.2],[4,-3.6]]),rect(0,-4.1,1.6,2));
 else if(type==='snowflake'){
  const branches=[];for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a),y=Math.sin(a);branches.push(line(0,0,x*4.6,y*4.6,.75));for(const side of [-1,1]){const b=a+side*Math.PI/3;branches.push(line(x*2.8,y*2.8,x*2.8+Math.cos(b)*1.45,y*2.8+Math.sin(b)*1.45,.7));}}shape=union(...branches);
 }
 else if(type==='present')shape=union(subtract(rect(0,-.7,7.5,6),rect(0,-.7,.8,6.2),rect(0,-.2,7.7,.7)),subtract(circle(-1.3,3.3,1.5),circle(-1.3,3.3,.65)),subtract(circle(1.3,3.3,1.5),circle(1.3,3.3,.65)),circle(0,2.7,.8));
 else if(type==='bauble')shape=subtract(union(circle(0,-.7,3.6),rect(0,3,2,1.4),subtract(circle(0,4.2,1),circle(0,4.2,.4))),rect(0,-.7,8,.75));
 else if(type==='gingerbread')shape=subtract(union(circle(0,3.3,1.4),rect(0,.1,2.3,3),line(-3,1.2,3,1.2,1.5),line(-.5,-.8,-1.9,-3.9,1.6),line(.5,-.8,1.9,-3.9,1.6)),circle(0,.6,.35),circle(0,-.5,.35));
 else throw Error('Choose a symbol from the collection.');
 const bounds=shape.bounds(),w=bounds.max[0]-bounds.min[0],h=bounds.max[1]-bounds.min[1];return own(own(shape.translate([-(bounds.min[0]+bounds.max[0])/2,-(bounds.min[1]+bounds.max[1])/2])).scale(10/Math.max(w,h)));
}
