import {profileFiles} from './print-profile.js';
import { zipParts, strToU8 } from './zip.js';
import { gridCounts } from './resolution.js';

export function makePanel({ width, height, min, max, cols, rows, tones }) {
  if (![width, height, min, max].every(Number.isFinite) || width <= 0 || height <= 0 || min <= 0 || max < min) throw Error('Invalid panel dimensions or thickness.');
  const counts = gridCounts(cols, rows);
  if (tones.length !== counts.samples) throw Error('Invalid image grid.');
  const count = cols * rows;
  const vertices = new Float32Array(counts.vertices * 3);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    // Photo pixels are top-down; model Y is bottom-up.
    const t = tones[(rows - 1 - y) * cols + x];
    if (!Number.isFinite(t) || t < 0 || t > 255) throw Error('Invalid photo tone.');
    const depth = min + (1 - t / 255) * (max - min);
    vertices.set([x * width / (cols - 1), y * height / (rows - 1), depth], i * 3);
  }
  const faces = new Uint32Array(counts.triangles * 3);
  let cursor = 0;
  const face = (a,b,c) => { faces[cursor++]=a; faces[cursor++]=b; faces[cursor++]=c; };
  for (let y = 0; y < rows - 1; y++) for (let x = 0; x < cols - 1; x++) {
    const a = y * cols + x, b = a + 1, c = a + cols, d = c + 1;
    face(a,b,d); face(a,d,c);
  }
  const boundary = [];
  for (let x=0;x<cols;x++) boundary.push(x);
  for (let y=1;y<rows;y++) boundary.push(y*cols+cols-1);
  for (let x=cols-2;x>=0;x--) boundary.push((rows-1)*cols+x);
  for (let y=rows-2;y>0;y--) boundary.push(y*cols);
  // The back is planar: only its perimeter and centre need vertices. Every
  // photo sample remains on the front; no relief detail is simplified.
  const centre=count+boundary.length;
  vertices.set([width/2,height/2,0],centre*3);
  for(let j=0;j<boundary.length;j++) {
    const p=boundary[j], q=boundary[(j+1)%boundary.length];
    const pb=count+j,qb=count+(j+1)%boundary.length;
    vertices.set([vertices[p*3],vertices[p*3+1],0],pb*3);
    face(centre,qb,pb); face(p,pb,qb); face(p,qb,q);
  }
  return {vertices, faces};
}
export function stlBytes({vertices:v,faces:f}) {
  const out=new Uint8Array(84+f.length/3*50), d=new DataView(out.buffer);
  out.set(new TextEncoder().encode('Lithophane; dimensions in mm'));
  d.setUint32(80,f.length/3,true);
  for(let i=0;i<f.length;i+=3) {
    const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3,o=84+i/3*50;
    const ux=v[b]-v[a],uy=v[b+1]-v[a+1],uz=v[b+2]-v[a+2],vx=v[c]-v[a],vy=v[c+1]-v[a+1],vz=v[c+2]-v[a+2];
    const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx], l=Math.hypot(...n)||1;
    for(let k=0;k<3;k++) d.setFloat32(o+k*4,n[k]/l,true);
    [a,b,c].forEach((p,j)=>{for(let k=0;k<3;k++)d.setFloat32(o+12+j*12+k*4,v[p+k],true);});
  }
  return out;
}
export function threeMfParts({vertices:v,faces:f}, progress=()=>{}) {
  const model=[];let chunk='';
  const write=text=>{chunk+=text;if(chunk.length>=65536){model.push(strToU8(chunk));chunk='';}};
  const coordinate=n=>Number(n.toFixed(6)).toString();
  write('<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">Lithophane panel</metadata><resources><object id="1" type="model"><mesh><vertices>');
  for(let i=0;i<v.length;i+=3){
    write(`<vertex x="${coordinate(v[i])}" y="${coordinate(v[i+1])}" z="${coordinate(v[i+2])}"/>`);
    if(i%300000===0)progress(55+15*i/v.length);
  }
  write('</vertices><triangles>');
  for(let i=0;i<f.length;i+=3){
    write(`<triangle v1="${f[i]}" v2="${f[i+1]}" v3="${f[i+2]}"/>`);
    if(i%300000===0)progress(70+20*i/f.length);
  }
  write('</triangles></mesh></object></resources><build><item objectid="1"/></build></model>');
  if(chunk)model.push(strToU8(chunk));
  return zipParts({...profileFiles(),
    '[Content_Types].xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="config" ContentType="application/json"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),
    '_rels/.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),
    '3D/3dmodel.model':model
  });
}
export function threeMfBytes(mesh) {
  const parts=threeMfParts(mesh), out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));
  let offset=0;for(const part of parts){out.set(part,offset);offset+=part.length;}return out;
}
