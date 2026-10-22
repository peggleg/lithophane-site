import {outline} from './symbols.js';
export const symbolCollections={
 basics:{"label":"Everyday favourites","palette":"candy","symbols":["heart","star","cloud","flower","plus","smile","diamond","check","infinity","peace","crown","ribbon"]},
 cute:{"label":"Cute & cosmic","palette":"pastel","symbols":["paw","cat","moon","bolt","music","rocket","planet","ufo","comet","sparkle","alien","astronaut"]},
 sports:{"label":"Sports club","palette":"arcade","symbols":["basketball","tennis","football","skateboard","trophy","rugby","baseball","volleyball","bowling","golf","badminton","medal"]},
 fruit:{"label":"Fruit salad","palette":"candy","symbols":["strawberry","cherries","apple","watermelon","lemon","pear","banana","pineapple","orange","grapes","peach","kiwi"]},
 halloween:{"label":"Halloween","palette":"spooky","symbols":["pumpkin","ghost","bat","skull","hat","spider","web","candy","cauldron","coffin","candle","tombstone"]},
 christmas:{"label":"Christmas","palette":"christmas","symbols":["tree","snowflake","present","bauble","gingerbread","bell","stocking","candycane","holly","santa","mitten","wreath"]},
 animals:{"label":"Animal friends","palette":"pastel","symbols":["dog","rabbit","bear","fox","butterfly","fish","turtle","bird","elephant","bee","penguin","ladybird"]},
 nature:{"label":"Great outdoors","palette":"forest","symbols":["leaf","fern","mushroom","cactus","mountain","wave","raindrop","tulip","rose","sprout","acorn","seashell"]},
 food:{"label":"Snack time","palette":"candy","symbols":["pizza","burger","icecream","cupcake","donut","coffee","biscuit","cheese","carrot","sushi","popcorn","pretzel"]},
 hobbies:{"label":"Hobbies & adventures","palette":"arcade","symbols":["gamecontroller","headphones","camera","book","paintbrush","palette","dice","puzzle","plane","anchor","bicycle","balloon"]}
};
export const symbolNames={"heart":"Heart","star":"Star","cloud":"Cloud","flower":"Flower","plus":"Plus","smile":"Smiley face","diamond":"Diamond","check":"Tick","infinity":"Infinity","peace":"Peace sign","crown":"Crown","ribbon":"Ribbon","paw":"Paw print","cat":"Cat","moon":"Crescent moon","bolt":"Lightning bolt","music":"Music notes","rocket":"Rocket","planet":"Planet","ufo":"Flying saucer","comet":"Comet","sparkle":"Sparkle","alien":"Alien","astronaut":"Astronaut","basketball":"Basketball","tennis":"Tennis ball","football":"Football","skateboard":"Skateboard","trophy":"Trophy","rugby":"Rugby ball","baseball":"Baseball","volleyball":"Volleyball","bowling":"Bowling ball","golf":"Golf flag","badminton":"Shuttlecock","medal":"Medal","strawberry":"Strawberry","cherries":"Cherries","apple":"Apple","watermelon":"Watermelon","lemon":"Lemon","pear":"Pear","banana":"Banana","pineapple":"Pineapple","orange":"Orange","grapes":"Grapes","peach":"Peach","kiwi":"Kiwi","pumpkin":"Pumpkin","ghost":"Ghost","bat":"Bat","skull":"Skull","hat":"Witch hat","spider":"Spider","web":"Spider web","candy":"Wrapped sweet","cauldron":"Cauldron","coffin":"Coffin","candle":"Candle","tombstone":"Gravestone","tree":"Christmas tree","snowflake":"Snowflake","present":"Present","bauble":"Bauble","gingerbread":"Gingerbread figure","bell":"Bell","stocking":"Stocking","candycane":"Candy cane","holly":"Holly","santa":"Santa hat","mitten":"Mitten","wreath":"Wreath","dog":"Dog","rabbit":"Rabbit","bear":"Bear","fox":"Fox","butterfly":"Butterfly","fish":"Fish","turtle":"Turtle","bird":"Bird","elephant":"Elephant","bee":"Bee","penguin":"Penguin","ladybird":"Ladybird","leaf":"Leaf","fern":"Fern","mushroom":"Mushroom","cactus":"Cactus","mountain":"Mountain","wave":"Wave","raindrop":"Raindrop","tulip":"Tulip","rose":"Rose","sprout":"Sprout","acorn":"Acorn","seashell":"Seashell","pizza":"Pizza","burger":"Burger","icecream":"Ice cream","cupcake":"Cupcake","donut":"Donut","coffee":"Coffee cup","biscuit":"Biscuit","cheese":"Cheese","carrot":"Carrot","sushi":"Sushi","popcorn":"Popcorn","pretzel":"Pretzel","gamecontroller":"Game controller","headphones":"Headphones","camera":"Camera","book":"Book","paintbrush":"Paintbrush","palette":"Palette","dice":"Dice","puzzle":"Puzzle","plane":"Plane","anchor":"Anchor","bicycle":"Bicycle","balloon":"Balloon"};
export function makeClickerSymbol(C,own,type){
 const circle=(x,y,r,sx=1,sy=1)=>own(own(own(C.circle(r,48)).scale([sx,sy])).translate([x,y]));
 const rect=(x,y,w,h)=>own(own(C.square([w,h],true)).translate([x,y]));
 const poly=points=>own(new C([points],'EvenOdd'));
 const union=(...parts)=>own(C.union(parts));
 const subtract=(shape,...holes)=>own(shape.subtract(union(...holes)));
 const line=(x,y,u,v,w=.8)=>{const dx=u-x,dy=v-y,d=Math.hypot(dx,dy),a=-dy/d*w/2,b=dx/d*w/2;return union(poly([[x+a,y+b],[u+a,v+b],[u-a,v-b],[x-a,y-b]]),circle(x,y,w/2),circle(u,v,w/2));};

 const ring=(x,y,r,width=.85)=>subtract(circle(x,y,r),circle(x,y,r-width));
 const rotated=(shape,angle)=>own(shape.rotate(angle));
 const spokes=(count,r,inner=0,width=.8)=>union(...Array.from({length:count},(_,i)=>{const a=i*Math.PI*2/count;return line(Math.cos(a)*inner,Math.sin(a)*inner,Math.cos(a)*r,Math.sin(a)*r,width);}));
 const drop=()=>union(circle(0,-1.5,3),poly([[-2.7,0],[0,5],[2.7,0]]));
 const eyePair=(y=1,r=.6)=>[circle(-1.4,y,r),circle(1.4,y,r)];
 const recipes={
 smile:()=>subtract(circle(0,0,4.7),...eyePair(1.4),own(ring(0,.2,2.8,.8).intersect(rect(0,-1.6,7,2.8)))),
 diamond:()=>poly([[0,5],[4,0],[0,-5],[-4,0]]),
 check:()=>union(line(-4,0,-1.1,-3,1.5),line(-1.1,-3,4.3,3.7,1.5)),
 infinity:()=>union(ring(-2.3,0,2.7,1),ring(2.3,0,2.7,1)),
 peace:()=>union(ring(0,0,4.6),line(0,-4.4,0,4.4),line(0,0,-3.2,-3.2),line(0,0,3.2,-3.2)),
 crown:()=>union(poly([[-4,-2],[-5,3],[-2,1],[0,4],[2,1],[5,3],[4,-2]]),rect(0,-3.1,8,1.1)),
 ribbon:()=>union(ring(0,1.6,2.8,1.2),poly([[-2.1,-.2],[-3.5,-4.8],[-1.6,-3.9],[-.5,-4.7],[0,-.2]]),poly([[2.1,-.2],[3.5,-4.8],[1.6,-3.9],[.5,-4.7],[0,-.2]])),
 rocket:()=>subtract(union(poly([[-2,-2],[-2,1],[0,5],[2,1],[2,-2]]),poly([[-2,0],[-4,-3],[-1,-2]]),poly([[2,0],[4,-3],[1,-2]]),poly([[-1,-2],[0,-5],[1,-2]])),circle(0,1.5,.8)),
 planet:()=>union(circle(0,0,3.3),rotated(subtract(circle(0,0,4.8,1,.4),circle(0,0,3.4,1,.32)),25)),
 ufo:()=>union(circle(0,1.5,2.6,1,.9),circle(0,-.4,4.8,1,.38),...[-2,0,2].map(x=>line(x,-2,x,-3.4,.8))),
 comet:()=>union(circle(-2,-1.5,2.7),line(-1,0,4,4,1.2),line(-.8,-1,4,1.8,1),line(-2,0,1.2,4,1)),
 sparkle:()=>poly([[0,5],[1.3,1.3],[5,0],[1.3,-1.3],[0,-5],[-1.3,-1.3],[-5,0],[-1.3,1.3]]),
 alien:()=>subtract(union(circle(0,1,4.2,1,.9),poly([[-3.5,-.5],[0,-4.7],[3.5,-.5]])),rotated(circle(-1.7,.6,1.1,1,.6),-25),rotated(circle(1.7,.6,1.1,1,.6),25)),
 astronaut:()=>subtract(union(circle(0,.8,3.8),rect(0,-3.3,5,2),rect(-4,0,1.3,3),rect(4,0,1.3,3)),circle(0,1,2.8,1,.7)),
 rugby:()=>subtract(circle(0,0,4.8,1,.62),rect(0,0,5,.8),...[-1.5,0,1.5].map(x=>rect(x,0,.65,2.4))),
 baseball:()=>subtract(circle(0,0,4.7),...[-1,1].flatMap(side=>[own(ring(side*5.2,0,4.8).intersect(rect(0,0,9,9))),...[-2,0,2].map(y=>line(side*1,y-.4,side*2.3,y+.4,.65))])),
 volleyball:()=>subtract(circle(0,0,4.7),...Array.from({length:3},(_,i)=>rotated(union(line(0,0,4.6,0,.7),line(1,1,3.5,2.5,.7)),i*120))),
 bowling:()=>subtract(circle(0,0,4.7),circle(0,1.8,.65),circle(-1,0,.65),circle(1,0,.65)),
 golf:()=>union(line(-2,-4,-2,4,1),poly([[-2,4],[3,2.5],[-2,1]]),circle(0,-4,4,1,.2),circle(3,-2.5,.9)),
 badminton:()=>union(circle(0,-3,1.8),subtract(poly([[-4,4],[4,4],[1.6,-2],[-1.6,-2]]),line(-2.5,4,-.7,-1,.7),line(2.5,4,.7,-1,.7),line(0,4,0,-1,.7))),
 medal:()=>union(ring(0,-1.6,2.7,1.2),poly([[-2,-.2],[-4,4],[-1.4,4],[.8,.2]]),poly([[2,-.2],[4,4],[1.4,4],[-.8,.2]])),
 pear:()=>union(circle(0,-1.6,3.5),circle(0,1.2,2.1),line(0,2.7,.7,4.8,1),circle(2,3.7,1.2,1,.55)),
 banana:()=>subtract(circle(-.5,1,4.8),circle(-2,3,4.4),rect(0,4.5,12,3)),
 pineapple:()=>subtract(union(circle(0,-1,3.1,1,1.2),poly([[-1,2],[-3,4],[-.8,3.4],[0,5],[1,3.4],[3,4],[1,2]])),line(-2,-2,2,1,.65),line(-2,0,1,-3,.65),line(-1,1,2,-2,.65)),
 orange:()=>subtract(union(circle(0,-.5,4),circle(1.3,3.8,1.5,1,.5)),...[[0,1.5],[-1.6,-1],[1.6,-1]].map(([x,y])=>circle(x,y,.45))),
 grapes:()=>union(...[[-2,1],[1,1],[3,-1],[-.8,-1.5],[1,-3],[-2.8,-1]].map(([x,y])=>circle(x,y,1.55)),line(0,2.1,.5,4.4,.9),circle(2,3.7,1.5,1,.6)),
 peach:()=>subtract(union(circle(-1.3,-.6,3.3),circle(1.3,-.6,3.3),circle(1.5,3.8,1.6,1,.5)),line(.3,1.7,-.3,-2.6,.7)),
 kiwi:()=>union(ring(0,0,4.6,1),circle(0,0,1),spokes(8,3.2,2.3,.7)),
 spider:()=>union(circle(0,-.6,2.2),circle(0,2,1.2),...[-1,1].flatMap(side=>[-2,-.5,1,2.5].map((y,i)=>union(line(side*1.2,y*.5,side*3.2,y,.8),line(side*3.2,y,side*4.7,y+(i<2?-1:1),.8))))),
 web:()=>union(ring(0,0,4.6,.7),ring(0,0,2.8,.7),spokes(8,4.6)),
 candy:()=>union(circle(0,0,2.7),poly([[-2,1.5],[-5,3],[-4.2,0],[-5,-3],[-2,-1.5]]),poly([[2,1.5],[5,3],[4.2,0],[5,-3],[2,-1.5]])),
 cauldron:()=>subtract(union(circle(0,-.5,3.7,1,.9),rect(0,2.3,8,1.2),rect(-2,-3.5,1,2),rect(2,-3.5,1,2),circle(-2,4,.65),circle(1,4.3,.8)),rect(0,1.6,5,.7)),
 coffin:()=>subtract(poly([[-2,5],[2,5],[3.5,2],[2,-5],[-2,-5],[-3.5,2]]),rect(0,.8,.8,5),rect(0,1.6,3,.8)),
 candle:()=>union(rect(0,-1,3.5,6),circle(0,-4.1,3,1,.2),circle(0,3.4,1.2,.8,1.2),poly([[-.8,3.8],[.5,5.5],[1,3.6]])),
 tombstone:()=>subtract(union(circle(0,1.5,3),rect(0,-1,6,5),rect(0,-4,8,1)),rect(0,0,.85,4),rect(0,.8,3,.85)),
 bell:()=>union(poly([[-3,-1],[-2.5,2],[0,3.5],[2.5,2],[3,-1]]),circle(0,-1.2,4,1,.27),circle(0,-3,.9),ring(0,4,.9,.55)),
 stocking:()=>union(rect(-1,1.3,3,6),rect(-1,4.2,4.5,1.2),circle(.7,-2.3,2.3,1.5,.8)),
 candycane:()=>union(own(ring(0,2,2.8,1.3).intersect(rect(0,3.2,7,3.2))),rect(-2.15,-1,1.3,6)),
 holly:()=>union(poly([[-.5,0],[-4,0],[-3.1,1.5],[-4,3],[-2.3,3],[-1.5,4.7],[0,2]]),poly([[.5,0],[4,0],[3.1,1.5],[4,3],[2.3,3],[1.5,4.7],[0,2]]),circle(-.8,-1,1.2),circle(1,-1.1,1.2),circle(0,-2.8,1.2)),
 santa:()=>union(poly([[-3,-1],[-1,4],[1.8,4.5],[3,1.6],[1.5,2.2],[1,-1]]),rect(-.7,-1.5,7,1.5),circle(3,1.3,1.2)),
 mitten:()=>union(rect(.5,-1,5,5),circle(.5,1.5,2.5),circle(-2.6,-.5,1.7),rect(.5,-4,5.8,1.2)),
 wreath:()=>union(ring(0,0,3.7,1.5),...Array.from({length:10},(_,i)=>circle(Math.cos(i*Math.PI/5)*3.5,Math.sin(i*Math.PI/5)*3.5,.9)),poly([[-.2,-3],[-3,-5],[-3,-2]]),poly([[.2,-3],[3,-5],[3,-2]])),
 dog:()=>subtract(union(circle(0,0,3.3),circle(-3,1,1.7,.75,1.6),circle(3,1,1.7,.75,1.6)),...eyePair(.7,.5),circle(0,-1.2,.7)),
 rabbit:()=>subtract(union(circle(0,-1.4,3),circle(-1.5,2.2,1.2,.8,2.4),circle(1.5,2.2,1.2,.8,2.4)),...eyePair(-.6,.5),circle(0,-2,.5)),
 bear:()=>subtract(union(circle(0,-.5,3.6),circle(-2.8,2.5,1.6),circle(2.8,2.5,1.6)),...eyePair(.3,.5),circle(0,-1.4,.65)),
 fox:()=>subtract(poly([[-4.5,4.5],[-.8,2.5],[.8,2.5],[4.5,4.5],[3.5,-1],[0,-4],[-3.5,-1]]),...eyePair(.5,.55)),
 butterfly:()=>union(circle(-2.2,1.6,2.3),circle(2.2,1.6,2.3),circle(-1.8,-1.9,1.9),circle(1.8,-1.9,1.9),line(0,-3,0,3,.9),line(0,2,-1,4,.7),line(0,2,1,4,.7)),
 fish:()=>subtract(union(circle(-.5,0,3.2,1.25,.8),poly([[2,0],[5,3],[5,-3]])),circle(-2,1,.55)),
 turtle:()=>union(subtract(circle(0,0,3.2,1,1.15),rect(0,0,.7,5),rect(0,0,5,.7)),circle(0,4,1.2),...[-1,1].flatMap(x=>[-1,1].map(y=>circle(x*3,y*2,1)))),
 bird:()=>subtract(union(circle(-.5,-.5,3.2,1.2,.8),circle(1.7,2,1.6),poly([[2.7,2.5],[5,1.7],[2.7,1]]),poly([[-2,-.2],[-5,2],[-4,-1.5]])),circle(2,2.3,.45)),
 elephant:()=>subtract(union(circle(-.7,0,3.5,1.15,1),circle(2.3,.8,2),line(3.3,0,3.3,-3.2,1.5),line(3.3,-3.2,4.5,-2.6,1.5),rect(-2.5,-3,1.5,3),rect(.8,-3,1.5,3)),circle(2.4,1.4,.5)),
 bee:()=>subtract(union(circle(0,-.5,3,1,.8),circle(-1.7,2.2,1.7),circle(1.7,2.2,1.7)),rect(-1,-.7,.7,4),rect(1,-.7,.7,4)),
 penguin:()=>subtract(union(circle(0,-.3,3.2,.9,1.4),circle(-3,-.5,1,.8,2),circle(3,-.5,1,.8,2)),circle(0,-1,1.8,.9,1.1),...eyePair(2,.45)),
 ladybird:()=>subtract(union(circle(0,-.4,3.7,.9,1),circle(0,3.4,1.4)),rect(0,-.7,.7,7),...[-1,1].flatMap(x=>[-1,1].map(y=>circle(x*1.7,y*1.3,.6)))),
 leaf:()=>subtract(union(circle(-.6,.6,3.7,.75,1),poly([[0,5],[2,1],[0,-3],[-2,1]]),line(-.3,-2,-1.4,-4.7,.9)),line(-1,-2,1,3.5,.75)),
 fern:()=>union(line(0,-5,0,4.7,.8),...[-2.8,-1.2,.5,2.2].flatMap(y=>[-1,1].map(side=>line(0,y,side*(3.8-y*.35),y+1.8,1)))),
 mushroom:()=>union(own(circle(0,.4,4.7).intersect(rect(0,2.4,10,4.2))),rect(0,-2.2,2.5,4.5)),
 cactus:()=>union(line(0,-4,0,3.7,2),line(-3,-.8,-3,2,1.6),line(-3,-.8,0,-.8,1.6),line(3,.5,3,3,1.6),line(3,.5,0,.5,1.6),rect(0,-4.5,5,1)),
 mountain:()=>subtract(union(poly([[-5,-4],[0,4.7],[5,-4]]),poly([[-5,-4],[-2,2],[1,-4]])),poly([[-1.3,1],[0,3.2],[1.3,1],[0,1.7]])),
 wave:()=>union(own(subtract(circle(0,0,4.7),circle(1.6,1.5,3.7)).intersect(rect(0,-.8,11,7))),rect(0,-3.8,9,1.2),poly([[-4.4,-3.8],[-4.4,0],[-1.7,-1.5],[1,-3.8]])),
 raindrop:drop,
 tulip:()=>union(poly([[-3,4],[-1,2.5],[0,4],[1,2.5],[3,4],[2,-.2],[-2,-.2]]),line(0,0,0,-4.5,.9),circle(-1.8,-2.2,1.7,1,.4),circle(1.8,-3,1.7,1,.4)),
 rose:()=>union(ring(0,1.4,2.7,1.1),circle(0,1.4,1),line(0,-1,0,-4.5,.9),circle(-1.7,-2.5,1.6,1,.4),circle(1.7,-3.4,1.6,1,.4)),
 sprout:()=>union(line(0,-4.5,0,1,.9),poly([[0,0],[-3.5,.8],[-4,3.5],[-1,2.8],[0,1]]),poly([[0,1],[1,3.5],[4.2,4],[3.5,1.5]])),
 acorn:()=>union(circle(0,-.8,3,1,1.2),rect(0,1.7,7,1.5),circle(0,2.1,3.4,1,.5),line(0,3,1,4.6,1)),
 seashell:()=>subtract(union(circle(0,1,4.5,1,.8),poly([[-4,0],[0,-4],[4,0]])),...[-2.5,0,2.5].map(x=>line(0,-2.7,x,3,.65))),
 pizza:()=>subtract(union(poly([[-4.4,3.6],[4.4,3.6],[0,-4.7]]),line(-4.2,3.8,4.2,3.8,1.2)),circle(-1.2,1.5,.7),circle(1.4,1.3,.7),circle(0,-1.3,.7)),
 burger:()=>union(own(circle(0,.7,4.7,1,.65).intersect(rect(0,2,10,3))),rect(0,-.7,9,1.3),rect(0,-2.5,8.5,1.3)),
 icecream:()=>union(poly([[-2.8,0],[2.8,0],[0,-5]]),circle(0,2,3),circle(-2,1,1.5),circle(2,1,1.5)),
 cupcake:()=>union(poly([[-3,-.4],[3,-.4],[2,-4],[-2,-4]]),circle(0,1.7,2.6),circle(-2,1,1.8),circle(2,1,1.8),circle(0,4.4,.7)),
 donut:()=>subtract(circle(0,0,4.6),circle(0,0,1.6),...[[0,3],[-3,0],[2.1,-2.1]].map(([x,y])=>rect(x,y,.65,1.1))),
 coffee:()=>union(poly([[-3,3],[3,3],[2,-3],[-2,-3]]),subtract(circle(3,1,2),circle(3,1,1)),rect(0,-4,7,1)),
 biscuit:()=>subtract(circle(0,0,4.5),...[[0,0],[-2,2],[2,2],[-2,-2],[2,-2]].map(([x,y])=>circle(x,y,.65))),
 cheese:()=>subtract(poly([[-4.5,-3],[4.5,-3],[4.5,3],[-4.5,1]]),circle(-1,0,.9),circle(2,-1,.8),circle(3,2,.6)),
 carrot:()=>union(poly([[-2.5,1],[2.5,1],[-1,-5]]),line(0,1,-2,4,1),line(0,1,0,4.8,1),line(0,1,2,4,1)),
 sushi:()=>union(subtract(circle(0,0,4.5,1,.75),circle(0,0,3.2,1,.7)),rect(0,0,3,2),circle(-1.8,0,.6),circle(1.8,0,.6)),
 popcorn:()=>union(poly([[-3,0],[3,0],[2.3,-4],[-2.3,-4]]),...[-2,0,2].map(x=>circle(x,1.2,1.6)),circle(-1,3.3,1.4),circle(1,3.3,1.4)),
 pretzel:()=>union(ring(-1.9,1,2.7,1),ring(1.9,1,2.7,1),line(-3,1,1.8,-3.5,1),line(3,1,-1.8,-3.5,1)),
 gamecontroller:()=>subtract(union(rect(0,0,6,5),circle(-3,0,2.6,1,.95),circle(3,0,2.6,1,.95)),rect(-2,0,2.5,.7),rect(-2,0,.7,2.5),circle(2,1,.55),circle(3,-.6,.55)),
 headphones:()=>union(own(ring(0,0,4.2,1.1).intersect(rect(0,2,10,5))),rect(-3.8,-1.4,2,3.8),rect(3.8,-1.4,2,3.8)),
 camera:()=>subtract(union(rect(0,-.6,9,6),rect(-1,3,4,1.7)),circle(0,-.6,2),rect(3,1.3,1,.7)),
 book:()=>union(subtract(rect(0,0,9,7),rect(0,0,.75,7.2)),poly([[-4.5,3.5],[-.5,4.5],[-.5,3.4]]),poly([[4.5,3.5],[.5,4.5],[.5,3.4]])),
 paintbrush:()=>union(rotated(rect(0,-1.4,1.6,6),-25),poly([[0,1],[0,4.7],[3.5,4],[2,1]])),
 palette:()=>subtract(circle(0,0,4.7,1,.85),circle(2,-2,1.7),...[[ -2,1.5],[0,2.3],[2,1.2],[-2,-1]].map(([x,y])=>circle(x,y,.65))),
 dice:()=>subtract(rect(0,0,8,8),...[[ -2,2],[2,2],[0,0],[-2,-2],[2,-2]].map(([x,y])=>circle(x,y,.7))),
 puzzle:()=>union(subtract(rect(0,0,6,6),circle(0,-3,1.4),circle(3,0,1.4)),circle(-3,0,1.3),circle(0,3,1.3)),
 plane:()=>union(poly([[0,5],[1,1],[4.7,-1],[4.7,-2],[1,-1],[.8,-3],[2.3,-4],[2.3,-4.8],[0,-4],[-2.3,-4.8],[-2.3,-4],[-.8,-3],[-1,-1],[-4.7,-2],[-4.7,-1],[-1,1]])),
 anchor:()=>union(ring(0,3.3,1.2,.7),line(0,2.5,0,-3.5,1),line(-2,1,2,1,.9),own(ring(0,-.5,3.7,1).intersect(rect(0,-2.5,9,4))),poly([[-4,0],[-2.5,-1],[-4.5,-2]]),poly([[4,0],[2.5,-1],[4.5,-2]])),
 bicycle:()=>union(ring(-3,-2,2, .75),ring(3,-2,2,.75),line(-3,-2,-1,1,.8),line(-1,1,1,-2,.8),line(-3,-2,1,-2,.8),line(1,-2,2,1.5,.8),line(-1,1,2,1.5,.8),line(2,1.5,3,-2,.8),line(2,1.5,2,3,.8),line(2,3,3.2,3,.8),line(-1.8,1.7,-.5,1.7,.8)),
 balloon:()=>union(circle(0,1.4,3.3,1,1.1),poly([[-.8,-2],[.8,-2],[0,-3]]),line(0,-2.5,-1,-4,.75),line(-1,-4,0,-5,.75))
 };
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
 else if(Object.hasOwn(recipes,type))shape=recipes[type]();
 else throw Error('Choose a symbol from the collection.');
 const bounds=shape.bounds(),w=bounds.max[0]-bounds.min[0],h=bounds.max[1]-bounds.min[1];return own(own(shape.translate([-(bounds.min[0]+bounds.max[0])/2,-(bounds.min[1]+bounds.max[1])/2])).scale(10/Math.max(w,h)));
}
