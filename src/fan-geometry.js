import {stlBytes} from './geometry.js';
import {zipParts,strToU8} from './zip.js';
function zipSync(files){const parts=zipParts(files),bytes=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return bytes;}
export const defaults={count:11,length:155,angle:150,stand:true};
export function validateFan(p){
 if(![9,11,13].includes(p.count)||!Number.isFinite(p.length)||p.length<100||p.length>180||!Number.isFinite(p.angle)||p.angle<120||p.angle>160)throw Error('Choose 9, 11 or 13 blades, 100–180 mm length and 120–160° opening.');
 return p;
}
export function stackHeight(p){return +(p.count*1.2+(p.count-1)*.1+.8).toFixed(1);}
export function bladeAngle(p,i){return (i/(p.count-1)-.5)*p.angle*Math.PI/180;}
export function outline(p){
 const w=Math.max(8,p.length*Math.tan(p.angle*Math.PI/180/(p.count-1)/2)),a=[];
 for(let i=0;i<=24;i++){const t=Math.PI-i*Math.PI/24;a.push([Math.cos(t)*w,p.length-w+Math.sin(t)*w]);}
 a.push([6,0]);
 for(let i=0;i<=24;i++){const t=-i*Math.PI/24;a.push([Math.cos(t)*6,Math.sin(t)*6]);}
 return a;
}
export function toneAt(photo,x,y){
 if(!photo)return 180;
 const ix=Math.round(x/photo.width*(photo.cols-1)),iy=Math.round((1-y/photo.height)*(photo.rows-1));
 return photo.tones[Math.max(0,Math.min(photo.rows-1,iy))*photo.cols+Math.max(0,Math.min(photo.cols-1,ix))];
}
function mesh(v,f){return {vertices:new Float32Array(v),faces:new Uint32Array(f)};}
export function bladeMesh(p,index,photo,guard=false){
 validateFan(p);const poly=outline(p),n=128,rings=80,v=[],f=[],angle=bladeAngle(p,index),width=2*p.length*Math.sin(p.angle*Math.PI/360);
 for(let side=0;side<2;side++)for(let r=0;r<=rings;r++)for(let j=0;j<n;j++){
  const t=2*Math.PI*j/n,dx=Math.cos(t),dy=Math.sin(t);let limit=Infinity;
  for(let k=0;k<poly.length;k++){
   const a=poly[k],b=poly[(k+1)%poly.length],ex=b[0]-a[0],ey=b[1]-a[1],den=dx*ey-dy*ex;
   if(Math.abs(den)<1e-9)continue;
   const d=(a[0]*ey-a[1]*ex)/den,u=(a[0]*dy-a[1]*dx)/den;
   if(d>0&&u>=0&&u<=1)limit=Math.min(limit,d);
  }
  const radius=3.3+(limit-3.3)*r/rings,x=dx*radius,y=dy*radius;
  const wx=x*Math.cos(angle)+y*Math.sin(angle)+width/2,wy=-x*Math.sin(angle)+y*Math.cos(angle);
  const border=r===rings||r===0||y<30;
  const z=guard?.4:border?1.2:.6+(1-toneAt(photo,wx,wy)/255)*.6;
  v.push(x,y,side===0?z:0);
 }
 const layer=(rings+1)*n;
 for(let r=0;r<rings;r++)for(let j=0;j<n;j++){
  const a=r*n+j,b=r*n+(j+1)%n,c=(r+1)*n+j,d=(r+1)*n+(j+1)%n;
  f.push(a,c,d,a,d,b,a+layer,d+layer,c+layer,a+layer,b+layer,d+layer);
 }
 for(const r of [0,rings])for(let j=0;j<n;j++){
  const a=r*n+j,b=r*n+(j+1)%n;
  if(r===rings)f.push(a,a+layer,b+layer,a,b+layer,b);else f.push(a,b,b+layer,a,b+layer,a+layer);
 }
 return mesh(v,f);
}
// Closed annular solids, with an optional helical radius profile for coarse printed threads.
export function ringMesh({height,outer,inner=0.01,steps=32,zsteps=1}){
 const v=[],f=[];
 for(let s=0;s<2;s++)for(let z=0;z<=zsteps;z++)for(let j=0;j<steps;j++){
  const t=j*2*Math.PI/steps,h=height*z/zsteps,r=typeof(s?inner:outer)==='function'?(s?inner:outer)(h,t):(s?inner:outer);
  v.push(r*Math.cos(t),r*Math.sin(t),h);
 }
 const layer=(zsteps+1)*steps;
 for(let z=0;z<zsteps;z++)for(let j=0;j<steps;j++){
  const a=z*steps+j,b=z*steps+(j+1)%steps,c=a+steps,d=b+steps;
  f.push(a,b,d,a,d,c,a+layer,d+layer,b+layer,a+layer,c+layer,d+layer);
 }
 for(const z of [0,zsteps])for(let j=0;j<steps;j++){
  const a=z*steps+j,b=z*steps+(j+1)%steps;
  if(z===0)f.push(a,b+layer,b,a,a+layer,b+layer);else f.push(a,b,b+layer,a,b+layer,a+layer);
 }
 return mesh(v,f);
}
const thread=(z,t)=>Math.max(0,1-Math.abs((((z/2-t/(2*Math.PI))%1+1)%1)*2-1));
export function pivotParts(p){
 const h=stackHeight(p)+1.2;
 return [
  {name:'pivot-pin',mesh:ringMesh({height:h+8,outer:(z,t)=>z<1.2?5:z<h+1.2?3:2.7+.3*thread(z-h-1.2,t),zsteps:Math.ceil((h+8)*10),steps:64})},
  {name:'retaining-nut',mesh:ringMesh({height:6,outer:5,inner:(z,t)=>2.85+.3*thread(z,t),zsteps:60,steps:64})},
  ...[1,2].map(i=>({name:`washer-${i}`,mesh:ringMesh({height:.4,outer:5,inner:3.35,steps:64})}))
 ];
}
function extrude(poly,depth){
 // For the concave cradle outline, ear clipping triangulates each cap.
 const n=poly.length,v=[...poly.flatMap(([x,y])=>[x,y,0]),...poly.flatMap(([x,y])=>[x,y,depth])],f=[],ids=poly.map((_,i)=>i);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 while(ids.length>2){let found=false;for(let k=0;k<ids.length;k++){
  const a=ids[(k+ids.length-1)%ids.length],b=ids[k],c=ids[(k+1)%ids.length];if(cross(poly[a],poly[b],poly[c])<=0)continue;
  if(ids.some(i=>i!==a&&i!==b&&i!==c&&cross(poly[a],poly[b],poly[i])>=0&&cross(poly[b],poly[c],poly[i])>=0&&cross(poly[c],poly[a],poly[i])>=0))continue;
  f.push(a,c,b,a+n,b+n,c+n);ids.splice(k,1);found=true;break;
 }if(!found)throw Error('Could not triangulate cradle.');}
 for(let i=0;i<n;i++){const j=(i+1)%n;f.push(i,j,j+n,i,j+n,i+n);}return mesh(v,f);
}
export function makeFan(p,photo){
 validateFan(p);const parts=[];
 for(let i=0;i<p.count;i++)parts.push({name:`blade-${String(i+1).padStart(2,'0')}`,mesh:bladeMesh(p,i,photo),angle:bladeAngle(p,i),z:.4+i*1.3});
 parts.push({name:'guard-front',mesh:bladeMesh(p,0,null,true),angle:bladeAngle(p,0),z:0},{name:'guard-back',mesh:bladeMesh(p,p.count-1,null,true),angle:bladeAngle(p,p.count-1),z:stackHeight(p)-.4});
 parts.push(...pivotParts(p));
 if(p.stand){const w=stackHeight(p)+.5;for(let i=1;i<=2;i++)parts.push({name:`stand-cradle-${i}`,mesh:extrude([[-18,0],[18,0],[18,20],[w/2,20],[w/2,5],[-w/2,5],[-w/2,20],[-18,20]],12)});}
 return parts;
}
export function instructions(p){return `FOLDING FAN — PROTOTYPE\nWhite PLA. Dimensions in millimetres.\n${p.count} blades; ${p.length} mm length; ${p.angle} degree opening.\nFrame 1.2 mm; image 0.6–1.2 mm. Closed stack ${stackHeight(p)} mm including guards and 0.1 mm nominal gaps; pivot heads and nut protrude beyond this stack. 13–15 mm is the default 11-blade design target, not a validated fit.\n\nPrint the pivot test first. Printed pin and coarse-thread nut require tolerance and durability testing. Two washers go outside the guards. Fit blades in numerical order; leave the nut loose enough to turn. The 0.1 mm gaps are nominal movement allowances, not supplied spacer parts.\n\nA separately supplied ribbon limits opening. With fan held at ${p.angle} degrees, bond ribbon to the BACK of each rib near 65% of blade length. Keep slack for folding, adhesive away from photo and moving joints. Verify attachment and opening by hand.\n\nPrint flat-backed blades face up, starting at 0.2 mm layers (six frame layers), solid white PLA. Preview toolpaths, especially the thin image regions. No printer profile included. Printed threads may need finer layers and cleanup.\n\nStand: two independent passive cradles; place beneath the lower ribs, adjust spacing to support the fan. No lighting hardware included.\n\nPrototype required: test 3 blades for interference, light transmission, stiffness and repeated folding before the full fan. Do not force the printed pivot.\nPhotos and models are processed locally, never uploaded.\n`;}
export function partsZip(parts,p){const files={'ASSEMBLY.txt':strToU8(instructions(p))};for(const part of parts)files[`${part.name}.stl`]=stlBytes(part.mesh);return zipSync(files);}
export function fan3mf(parts){
 const objects=parts.map((p,i)=>`<object id="${i+1}" name="${p.name}" type="model"><mesh><vertices>${Array.from({length:p.mesh.vertices.length/3},(_,j)=>`<vertex x="${p.mesh.vertices[j*3]}" y="${p.mesh.vertices[j*3+1]}" z="${p.mesh.vertices[j*3+2]}"/>`).join('')}</vertices><triangles>${Array.from({length:p.mesh.faces.length/3},(_,j)=>`<triangle v1="${p.mesh.faces[j*3]}" v2="${p.mesh.faces[j*3+1]}" v3="${p.mesh.faces[j*3+2]}"/>`).join('')}</triangles></mesh></object>`).join('');
 const build=parts.map((p,i)=>{const a=p.angle||0,c=Math.cos(a),s=Math.sin(a);return `<item objectid="${i+1}" transform="${c} ${-s} 0 ${s} ${c} 0 0 0 1 ${p.angle===undefined?40+(i%4)*20:0} ${p.angle===undefined?-35-Math.floor(i/4)*25:0} ${p.z||0}"/>`;}).join('');
 return zipSync({'[Content_Types].xml':strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),'_rels/.rels':strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),'3D/3dmodel.model':strToU8(`<?xml version="1.0"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>${objects}</resources><build>${build}</build></model>`)});
}
