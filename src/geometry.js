import { zipSync, strToU8 } from './zip.js';

export function makePanel({ width, height, min, max, cols, rows, tones }) {
  if (![width, height, min, max].every(Number.isFinite) || width <= 0 || height <= 0 || min <= 0 || max < min) throw Error('Invalid panel dimensions or thickness.');
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 2 || rows < 2 || cols > 241 || rows > 241 || tones.length !== cols * rows) throw Error('Invalid image grid.');
  const count = cols * rows;
  const vertices = new Float32Array(count * 6);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    // Photo pixels are top-down; model Y is bottom-up.
    const t = tones[(rows - 1 - y) * cols + x];
    const depth = min + (1 - t / 255) * (max - min);
    vertices.set([x * width / (cols - 1), y * height / (rows - 1), depth], i * 3);
    vertices.set([x * width / (cols - 1), y * height / (rows - 1), 0], (count + i) * 3);
  }
  const faces = [];
  for (let y = 0; y < rows - 1; y++) for (let x = 0; x < cols - 1; x++) {
    const a = y * cols + x, b = a + 1, c = a + cols, d = c + 1;
    faces.push(a,b,d, a,d,c, a+count,d+count,b+count, a+count,c+count,d+count);
  }
  const boundary = [];
  for (let x=0;x<cols;x++) boundary.push(x);
  for (let y=1;y<rows;y++) boundary.push(y*cols+cols-1);
  for (let x=cols-2;x>=0;x--) boundary.push((rows-1)*cols+x);
  for (let y=rows-2;y>0;y--) boundary.push(y*cols);
  for(let j=0;j<boundary.length;j++) {
    const p=boundary[j], q=boundary[(j+1)%boundary.length];
    faces.push(p,p+count,q+count, p,q+count,q);
  }
  return {vertices, faces:new Uint32Array(faces)};
}
export function stlBytes({vertices:v,faces:f}) {
  const out=new Uint8Array(84+f.length/3*50), d=new DataView(out.buffer);
  out.set(new TextEncoder().encode('Peggleg lithophane; dimensions in mm'));
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
export function threeMfBytes({vertices:v,faces:f}) {
  const vertices=[],triangles=[];
  for(let i=0;i<v.length;i+=3)vertices.push(`<vertex x="${v[i]}" y="${v[i+1]}" z="${v[i+2]}"/>`);
  for(let i=0;i<f.length;i+=3)triangles.push(`<triangle v1="${f[i]}" v2="${f[i+1]}" v3="${f[i+2]}"/>`);
  const model=`<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">Peggleg lithophane panel</metadata><resources><object id="1" type="model"><mesh><vertices>${vertices.join('')}</vertices><triangles>${triangles.join('')}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`;
  return zipSync({
    '[Content_Types].xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),
    '_rels/.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),
    '3D/3dmodel.model':strToU8(model)
  });
}
