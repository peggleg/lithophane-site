// A narrow winding branch with pointed leaves forms the perimeter, rather than
// a flat annular border. Everything is extruded flat with the ornament.
export function leafyWreath(C,own,scale){
 const pieces=[],stem=[];
 for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,r=43.2+Math.sin(a*5)*.65;stem.push([Math.cos(a)*r*scale,Math.sin(a)*r*scale]);}
 for(let i=1;i<stem.length;i++)pieces.push(own(C.hull([stem[i-1],stem[i]].map(p=>own(C.circle(.75*scale,16).translate(p))))));
 for(let i=0;i<24;i++){
  const a=i/24*Math.PI*2,r=43.2+Math.sin(a*5)*.65,base=[Math.cos(a)*r,Math.sin(a)*r];
  const tip=[Math.cos(a+.14)*49.6,Math.sin(a+.14)*49.6],mid=[(base[0]+tip[0])/2,(base[1]+tip[1])/2],dx=tip[0]-base[0],dy=tip[1]-base[1],length=Math.hypot(dx,dy),normal=[-dy/length*4,dx/length*4],points=[];
  for(const side of [1,-1])for(let j=0;j<=16;j++){const t=side===1?j/16:1-j/16,u=1-t;points.push([(u*u*base[0]+2*u*t*(mid[0]+normal[0]*side)+t*t*tip[0])*scale,(u*u*base[1]+2*u*t*(mid[1]+normal[1]*side)+t*t*tip[1])*scale]);}
  pieces.push(own(new C([points],'NonZero')));
 }
 // The hanging loop meets the upper branch through a short organic stalk.
 pieces.push(own(C.hull([[0,43],[0,49]].map(p=>own(C.circle(1.1*scale,20).translate(p.map(v=>v*scale)))))));
 return own(C.union(pieces));
}
