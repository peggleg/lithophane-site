import test from 'node:test';
import assert from 'node:assert/strict';
const strFromU8=b=>new TextDecoder().decode(b);
function unzipSync(bytes){
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),files={};let o=0;
 while(d.getUint32(o,true)===0x04034b50){
  assert.equal(d.getUint16(o+8,true),0);
  const size=d.getUint32(o+18,true),nameLen=d.getUint16(o+26,true),extraLen=d.getUint16(o+28,true);
  const start=o+30+nameLen+extraLen;
  files[strFromU8(bytes.slice(o+30,o+30+nameLen))]=bytes.slice(start,start+size);o=start+size;
 }
 assert.equal(d.getUint32(o,true),0x02014b50);assert.equal(d.getUint32(bytes.length-22,true),0x06054b50);
 assert.equal(d.getUint16(bytes.length-12,true),Object.keys(files).length);return files;
}
import {makePanel,stlBytes,threeMfBytes} from '../src/geometry.js';
const panel={width:20,height:30,min:1,max:3,cols:3,rows:2,tones:new Uint8Array([0,128,255,255,128,0])};
test('mesh is closed, consistently oriented, and preserves photo direction and dimensions',()=>{
 const {vertices:v,faces:f}=makePanel(panel),edges=new Map();
 let volume=0;
 for(let i=0;i<f.length;i+=3){
  const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3;
  volume+=(v[a]*(v[b+1]*v[c+2]-v[b+2]*v[c+1])+v[a+1]*(v[b+2]*v[c]-v[b]*v[c+2])+v[a+2]*(v[b]*v[c+1]-v[b+1]*v[c]))/6;
  for(let k=0;k<3;k++){
   const x=f[i+k],y=f[i+(k+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(',');
   const e=edges.get(key)||{count:0,balance:0};e.count++;e.balance+=x<y?1:-1;edges.set(key,e);
  }
 }
 for(const e of edges.values()){assert.equal(e.count,2);assert.equal(e.balance,0);}
 assert.ok(volume>0);
 const depths=[1, 3-128/255*2, 3, 3, 3-128/255*2, 1];
 const expected=150*((depths[0]+depths[1]+depths[4])/3+(depths[0]+depths[4]+depths[3])/3+(depths[1]+depths[2]+depths[5])/3+(depths[1]+depths[5]+depths[4])/3);
 assert.ok(Math.abs(volume-expected)<0.001);
 assert.equal(v[2],1);assert.equal(v[11],3);assert.equal(Math.max(...v.filter((_,i)=>i%3===0)),20);assert.equal(Math.max(...v.filter((_,i)=>i%3===1)),30);
});
test('binary STL declares the exact number of triangles and bytes',()=>{
 const mesh=makePanel(panel),bytes=stlBytes(mesh),d=new DataView(bytes.buffer);
 assert.equal(d.getUint32(80,true),mesh.faces.length/3);assert.equal(bytes.length,84+mesh.faces.length/3*50);
 for(let i=84;i<bytes.length;i+=50){const len=Math.hypot(d.getFloat32(i,true),d.getFloat32(i+4,true),d.getFloat32(i+8,true));assert.ok(Math.abs(len-1)<1e-5);}
});
test('3MF contains a millimetre model with geometry and a build item',()=>{
 const mesh=makePanel(panel),files=unzipSync(threeMfBytes(mesh)),xml=strFromU8(files['3D/3dmodel.model']);
 assert.ok(files['[Content_Types].xml']);assert.match(strFromU8(files['_rels/.rels']),/3D\/3dmodel.model/);assert.match(xml,/unit="millimeter"/);assert.match(xml,/<item objectid="1"/);
 assert.equal((xml.match(/<vertex /g)||[]).length,mesh.vertices.length/3);assert.equal((xml.match(/<triangle /g)||[]).length,mesh.faces.length/3);
});
test('invalid sizes and grids are rejected',()=>{
 assert.throws(()=>makePanel({...panel,min:4}));assert.throws(()=>makePanel({...panel,cols:1}));assert.throws(()=>makePanel({...panel,width:NaN}));
});
