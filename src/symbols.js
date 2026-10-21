const outlines=new Map(),holes=new Map(),radii=new Map();
function dimensions(p){
 const plate=p.kind==='nameplate',minWidth=plate?60:35,maxWidth=plate?240:100,minHeight=plate?25:20,maxHeight=plate?120:65;
 if(![p.width,p.height].every(Number.isFinite)||p.width<minWidth||p.width>maxWidth||p.height<minHeight||p.height>maxHeight)throw Error(`Use ${minWidth}–${maxWidth} mm width and ${minHeight}–${maxHeight} mm height.`);
 if(!plate&&(!Number.isFinite(p.hole)||p.hole<3||p.hole>8))throw Error('Use a 3–8 mm ring hole.');
}
function symbolRadius(s){const key=[s.type,s.size].join();if(!radii.has(key))radii.set(key,Math.max(...outline(s.type,s.size,s.size).map(([x,y])=>Math.hypot(x,y)))+3);return radii.get(key);}
export function outline(shape,width,height){
 const key=[shape,width,height].join();if(outlines.has(key))return outlines.get(key);
 const points=[];
 for(let i=0;i<120;i++){const t=i/120*Math.PI*2;let x,y;
 if(shape==='heart'){x=16*Math.sin(t)**3/18;y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/18;}
 else if(shape==='star'){const n=i/12|0,a=n*Math.PI/5+Math.PI/2,b=(n+1)*Math.PI/5+Math.PI/2,f=i/12-n,r=n%2?.48:1,q=(n+1)%2?.48:1;x=(Math.cos(a)*r*(1-f)+Math.cos(b)*q*f);y=(Math.sin(a)*r*(1-f)+Math.sin(b)*q*f);}
 else if(shape==='cloud'){
 const curves=[[[-.65,-.65],[-1.2,-.65],[-1.2,.35],[-.65,.35]],[[-.65,.35],[-.7,1.1],[.3,1.2],[.45,.45]],[[.45,.45],[1.15,.6],[1.3,-.65],[.65,-.65]],[[.65,-.65],[.3,-.65],[-.3,-.65],[-.65,-.65]]],segment=Math.floor(i/30),v=(i%30)/30,u=1-v,[a,b,c,d]=curves[segment];
 x=u**3*a[0]+3*u*u*v*b[0]+3*u*v*v*c[0]+v**3*d[0];y=u**3*a[1]+3*u*u*v*b[1]+3*u*v*v*c[1]+v**3*d[1];
 }
 else if(shape==='flower'){const radius=.75+.25*Math.cos(5*t);x=Math.cos(t)*radius;y=Math.sin(t)*radius;}
 else if(shape==='plus'){return [[-.2,-1],[.2,-1],[.2,-.2],[1,-.2],[1,.2],[.2,.2],[.2,1],[-.2,1],[-.2,.2],[-1,.2],[-1,-.2],[-.2,-.2]].map(([x,y])=>[x*width/2,y*height/2]);}
 else {x=Math.cos(t);y=Math.sin(t);}
 points.push([x*width/2,y*height/2]);}
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const fitted=points.map(([x,y])=>[(x-(minX+maxX)/2)*width/(maxX-minX),(y-(minY+maxY)/2)*height/(maxY-minY)]);
 outlines.set(key,fitted);return fitted;
}
function inside(x,y,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;}
function insideBody(x,y,p){
 if(['heart','star','cloud','circle'].includes(p.shape))return inside(x,y,outline(p.shape,p.width,p.height));
 if(p.shape==='capsule'){const core=(p.width-p.height)/2;return Math.hypot(Math.max(0,Math.abs(x)-core),y)<=p.height/2;}
 const r=Math.min(4,p.height/5);return Math.hypot(Math.max(0,Math.abs(x)-(p.width/2-r)),Math.max(0,Math.abs(y)-(p.height/2-r)))<=r;
}
export function symbolSafe(symbol,p){
 const radius=symbolRadius(symbol),x=symbol.x,y=symbol.y;
 if(p.kind!=='nameplate'){const hole=ringHole(p);if(Math.hypot(x-hole.x,y-hole.y)<radius+p.hole/2)return false;}
 for(let i=0;i<64;i++){const t=i/64*Math.PI*2;if(!insideBody(x+radius*Math.cos(t),y+radius*Math.sin(t),p))return false;}
 return true;
}
export function fitSymbol(input,p){
 dimensions(p);
 if(!['heart','star','cloud','flower','plus'].includes(input.type)||![input.x,input.y,input.size].every(Number.isFinite))throw Error('Choose a valid symbol and position.');
 const symbol={...input,size:Math.max(3,Math.min(18,input.size))};if(symbolSafe(symbol,p))return symbol;
 const candidates=[];
 for(let y=-p.height/2;y<=p.height/2;y+=.5)for(let x=-p.width/2;x<=p.width/2;x+=.5)candidates.push({x,y,d:(x-input.x)**2+(y-input.y)**2});
 candidates.sort((a,b)=>a.d-b.d);
 for(const {x,y}of candidates){const candidate={...symbol,x,y};if(symbolSafe(candidate,p))return candidate;}
 throw Error('This symbol needs more room. Reduce its size or enlarge the tag.');
}

// Search from the top downward; prefer the centre at each height. Hearts use
// an upper lobe where the central notch cannot provide the required material.
export function ringHole(p){
 dimensions(p);
 if(['rounded','capsule'].includes(p.shape))return {x:-p.width/2+3+p.hole/2,y:0};
 const key=[p.shape,p.width,p.height,p.hole].join();if(holes.has(key))return holes.get(key);
 const r=p.hole/2+3;
 for(let y=p.height/2-r;y>0;y-=.25)for(let step=0;step<=p.width;step++){
  const x=(step%2?-1:1)*Math.ceil(step/2)*.5;
  let safe=true;for(let i=0;i<96;i++){const t=i/96*Math.PI*2;if(!insideBody(x+r*Math.cos(t),y+r*Math.sin(t),p)){safe=false;break;}}
  if(safe){const hole={x,y};holes.set(key,hole);return hole;}
 }
 throw Error('Enlarge this outline to leave room for a hole at the top.');
}
