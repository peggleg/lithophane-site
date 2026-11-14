export const ornamentEdges={auto:'Match the design',laurel:'Swept leaves',pine:'Pine sprigs',holly:'Holly leaves',blossom:'Flower garland',berries:'Berry branches',stars:'Star garland',thorns:'Twisting thorn branches',scallop:'Soft scalloped clouds'};
export function ornamentEdge(p){if(p.edgePattern&&p.edgePattern!=='auto')return p.edgePattern;const maps={christmas:{bells:'pine',bow:'holly',forest:'pine',poinsettia:'blossom',reindeer:'berries',snowflake:'stars'},pets:{dog:'laurel',paw:'berries',cat:'stars',memorial:'blossom',bone:'scallop'},birthday:{cake:'stars',candles:'blossom',present:'laurel',crown:'scallop',badge:'stars',balloons:'berries'},baby:{moon:'scallop',teddy:'blossom',feet:'berries',dreams:'stars',stork:'laurel'},wedding:{rings:'blossom',hearts:'laurel',roses:'blossom','linked-hearts':'berries',bells:'holly'},easter:{bunny:'blossom',eggs:'berries','bunny-hearts':'laurel',butterfly:'blossom',chick:'scallop'},halloween:{pumpkin:'thorns',ghost:'scallop',boo:'stars',forest:'thorns',house:'pine'},thanksgiving:{maple:'laurel',pumpkin:'berries',cornucopia:'holly',turkey:'laurel',apples:'berries',sunflower:'blossom'}};return maps[p.collection]?.[p.design]||'laurel';}
// All edge details share the ornament's flat printing face and size envelope.
export function leafyWreath(C,own,scale,p={}){
 const style=ornamentEdge(p),pieces=[],stem=[],phase=[...p.design||''].reduce((n,c)=>n+c.charCodeAt(0),0)*.01;
 const polar=(r,a)=>[r*Math.cos(a),r*Math.sin(a)],radius=a=>42.6+Math.sin(a*(style==='thorns'?7:5)+phase)*(style==='thorns'?1.5:.75);
 const disc=(r,point)=>own(C.circle(r*scale,24).translate(point.map(v=>v*scale)));
 const twig=(a,b,r=.75)=>own(C.hull([disc(r,a),disc(r,b)]));
 const leaf=(a,b,width)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],normal=[-dy/l*width,dx/l*width],points=[];for(const side of [1,-1])for(let j=0;j<=16;j++){const t=side===1?j/16:1-j/16,u=1-t;points.push([(u*u*a[0]+2*u*t*(mid[0]+normal[0]*side)+t*t*b[0])*scale,(u*u*a[1]+2*u*t*(mid[1]+normal[1]*side)+t*t*b[1])*scale]);}return own(new C([points],'NonZero'));};
 for(let i=0;i<=240;i++){const a=i/240*Math.PI*2;stem.push(polar(radius(a),a));}for(let i=1;i<stem.length;i++)pieces.push(twig(stem[i-1],stem[i]));
 const counts={laurel:24,pine:16,holly:12,blossom:13,berries:16,stars:14,thorns:18,scallop:14},count=counts[style];
 for(let i=0;i<count;i++){
  const a=i/count*Math.PI*2,base=polar(radius(a),a),tip=polar(49,a+.12),centre=polar(46,a+.055);
  if(style==='laurel')pieces.push(leaf(base,tip,4));
  if(style==='pine'){pieces.push(twig(base,tip,.65));for(let j=1;j<=3;j++){const t=j/4,at=[base[0]*(1-t)+tip[0]*t,base[1]*(1-t)+tip[1]*t];for(const side of [-1,1])pieces.push(twig(at,polar(43.5+j*1.55,a+.12*t+side*.052),.5));}}
  if(style==='holly'){const dx=tip[0]-base[0],dy=tip[1]-base[1],length=Math.hypot(dx,dy),points=[];for(const side of [1,-1])for(let j=0;j<=10;j++){const t=side===1?j/10:1-j/10,width=Math.sin(Math.PI*t)*(j%2?1.25:2.9)*side;points.push([(base[0]+dx*t-dy/length*width)*scale,(base[1]+dy*t+dx/length*width)*scale]);}pieces.push(own(new C([points],'NonZero')),disc(1.3,polar(43.5,a+.075)),disc(1.1,polar(43.5,a-.035)));}
  if(style==='blossom'){pieces.push(twig(base,centre),disc(1.6,centre));for(let j=0;j<5;j++){const t=j/5*Math.PI*2;pieces.push(disc(1.7,[centre[0]+Math.cos(t)*2,centre[1]+Math.sin(t)*2]));}}
  if(style==='berries'){pieces.push(twig(base,centre,.65));for(const [r,angle]of [[47.5,a],[46.3,a+.06],[44.8,a-.04]])pieces.push(twig(centre,polar(r,angle),.55),disc(1.5,polar(r,angle)));if(i%2===0)pieces.push(leaf(base,polar(48.8,a-.1),2.8));}
  if(style==='stars'){const points=[];for(let j=0;j<10;j++){const t=j/10*Math.PI*2+a,rr=j%2?1.7:3.7;points.push([(centre[0]+Math.cos(t)*rr)*scale,(centre[1]+Math.sin(t)*rr)*scale]);}pieces.push(twig(base,centre),own(new C([points],'NonZero')));}
  if(style==='thorns'){pieces.push(twig(base,polar(46.5,a+.08),.75));const points=[base,polar(49,a+.105),polar(44,a+.04)].map(pt=>pt.map(v=>v*scale));pieces.push(own(new C([points],'NonZero')));if(i%2===0)pieces.push(twig(polar(44,a+.045),polar(46,a-.035),.55));}
  if(style==='scallop'){pieces.push(twig(base,centre),disc(2.5,centre),disc(1.9,polar(45.3,a-.045)),disc(1.9,polar(45.3,a+.15)));}
 }
 pieces.push(twig([0,42],[0,49],1.1));return own(C.union(pieces));
}
