// Artwork is authored in a 70 mm design square. Curves form real solid profiles.
export function hookArt(K){const{C,own}=K;
 const e=(x,y,rx,ry=rx)=>own(C.circle(1,64).scale([rx,ry]).translate([x,y]));
 const r=(x,y,w,h,rad=4)=>own(K.round(w,h,rad).translate([x,y]));
 const poly=points=>{const raw=own(new C([points],'NonZero')),inner=own(raw.offset(-.6));return inner.isEmpty()?raw:own(inner.offset(.6));};
 const union=(...s)=>own(C.union(s.flat()));
 const cut=(a,...b)=>own(a.subtract(union(...b)));
 const line=(points,width)=>union(...points.slice(1).map((p,i)=>own(C.hull([e(...points[i],width/2),e(...p,width/2)]))));
 const curve=(points,width)=>{const out=[];for(let i=0;i<=32;i++){const t=i/32,u=1-t;out.push([u*u*u*points[0][0]+3*u*u*t*points[1][0]+3*u*t*t*points[2][0]+t*t*t*points[3][0],u*u*u*points[0][1]+3*u*u*t*points[1][1]+3*u*t*t*points[2][1]+t*t*t*points[3][1]]);}return line(out,width);};
 const leaf=(x,y,w,h,angle=0)=>own(union(poly([[0,-h/2],[-w*.48,-h*.12],[-w*.33,h*.3],[0,h/2],[w*.33,h*.3],[w*.48,-h*.12]]),e(0,0,w*.28,h*.32)).rotate(angle).translate([x,y]));
 const eye=(x,y)=>e(x,y,1.2,1.6);
 const smile=(x,y,w=8)=>curve([[x-w/2,y+1],[x-w/3,y-3],[x+w/3,y-3],[x+w/2,y+1]],1.1);
 const face=(x=0,y=7)=>[eye(x-7,y+3),eye(x+7,y+3),smile(x,y-4)];
 const star=(x,y,R=6)=>poly(Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5,t=i%2?R*.48:R;return[x+Math.cos(a)*t,y+Math.sin(a)*t];}));
 const petal=(x,y,R,n=8)=>union(...Array.from({length:n},(_,i)=>{const a=i*2*Math.PI/n;return e(x+Math.cos(a)*R*.7,y+Math.sin(a)*R*.7,R*.46);}));
 const shape=(name,body,inlays=[],engrave=[],hook={})=>({name,body:own(body),inlays,engrave:engrave.map(own),hook});
 const insert=(profile,colour=1)=>({profile:own(profile),colour});
 const turn=(profile,angle)=>own(profile.rotate(angle));
 return{e,r,turn,poly,union,cut,line,curve,leaf,eye,smile,face,star,petal,shape,insert};
}
