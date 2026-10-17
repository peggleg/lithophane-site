// Full-size export regression, including every edge, STL coordinate and 3MF record.
// Generated files stay under ignored artifacts/ for independent slicer import.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {makePanel,stlBytes,threeMfParts} from '../src/geometry.js';
import {planSampling,exportEstimate} from '../src/resolution.js';
await mkdir('artifacts/resolution',{recursive:true});
for(const detail of [.2,.1]){
 const p={...planSampling(120,100,detail),min:.8,max:3};
 p.tones=Float32Array.from({length:p.samples},(_,i)=>i%p.cols/(p.cols-1)*255);
 const mesh=makePanel(p),v=mesh.vertices,f=mesh.faces,vertexCount=v.length/3;
 assert.equal(vertexCount,p.vertices);assert.equal(f.length/3,p.triangles);
 const edges=new Float64Array(f.length);let volume=0;
 for(let i=0;i<f.length;i+=3){
  const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3;
  const ux=v[b]-v[a],uy=v[b+1]-v[a+1],uz=v[b+2]-v[a+2],vx=v[c]-v[a],vy=v[c+1]-v[a+1],vz=v[c+2]-v[a+2];
  assert.ok(Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)>0,'non-degenerate triangle');
  volume+=(v[a]*(v[b+1]*v[c+2]-v[b+2]*v[c+1])+v[a+1]*(v[b+2]*v[c]-v[b]*v[c+2])+v[a+2]*(v[b]*v[c+1]-v[b+1]*v[c]))/6;
  for(let k=0;k<3;k++){
   const x=f[i+k],y=f[i+(k+1)%3];
   edges[i+k]=2*(Math.min(x,y)*vertexCount+Math.max(x,y))+(x<y?0:1);
  }
 }
 edges.sort();
 for(let i=0;i<edges.length;i+=2){assert.equal(edges[i]%2,0);assert.equal(edges[i+1],edges[i]+1);if(i+2<edges.length)assert.notEqual(Math.floor(edges[i+2]/2),Math.floor(edges[i]/2));}
 assert.ok(Math.abs(volume-120*100*1.9)<.01,'linear-ramp volume');
 const stl=stlBytes(mesh),d=new DataView(stl.buffer);
 assert.equal(stl.length,exportEstimate(p,'stl').outputBytes);assert.equal(d.getUint32(80,true),p.triangles);
 for(let i=0;i<f.length;i+=3)for(let j=0;j<3;j++)for(let k=0;k<3;k++)assert.equal(d.getFloat32(84+i/3*50+12+j*12+k*4,true),v[f[i+j]*3+k]);
 await writeFile(`artifacts/resolution/panel-${detail}mm.stl`,stl);
 const parts=threeMfParts(mesh);let xml=false,tail='',vertices=0,triangles=0;
 for(const part of parts){
  const chunk=new TextDecoder().decode(part);
  if(chunk.startsWith('<?xml')&&chunk.includes('<model unit='))xml=true;
  if(!xml)continue;
  tail+=chunk;const end=tail.lastIndexOf('>');const complete=tail.slice(0,end+1);tail=tail.slice(end+1);
  for(const match of complete.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)){
   for(let k=0;k<3;k++)assert.ok(Math.abs(Number(match[k+1])-v[vertices*3+k])<=.000001);vertices++;
  }
  for(const match of complete.matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"\/>/g)){
   for(let k=0;k<3;k++)assert.equal(Number(match[k+1]),f[triangles*3+k]);triangles++;
  }
  if(complete.includes('</model>')){xml=false;tail='';}
 }
 assert.equal(vertices,p.vertices);assert.equal(triangles,p.triangles);
 const blob=new Blob(parts);assert.ok(blob.size<exportEstimate(p,'3mf').outputBytes);
 await writeFile(`artifacts/resolution/panel-${detail}mm.3mf`,new Uint8Array(await blob.arrayBuffer()));
 console.log(JSON.stringify({detail,cols:p.cols,rows:p.rows,vertices,triangles,volume,stlBytes:stl.length,threeMfBytes:blob.size,closed:true}));
}
