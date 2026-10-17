// Stored ZIP entries in bounded chunks, without a second contiguous archive.
const table=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
function crc32(parts){let crc=0xffffffff;for(const bytes of parts)for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export const strToU8=text=>new TextEncoder().encode(text);
export function zipParts(files){
 const entries=Object.entries(files).map(([name,data])=>{
  const parts=Array.isArray(data)?data:[data];
  return {name:strToU8(name),parts,size:parts.reduce((n,p)=>n+p.length,0),crc:crc32(parts)};
 });
 const size=22+entries.reduce((n,e)=>n+76+2*e.name.length+e.size,0);
 if(size>=0xffffffff||entries.length>65535)throw Error('Archive is too large.');
 const result=[];let offset=0;
 for(const e of entries){
  const header=new Uint8Array(30+e.name.length),d=new DataView(header.buffer);
  e.offset=offset;d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x0800,true);d.setUint16(12,33,true);
  d.setUint32(14,e.crc,true);d.setUint32(18,e.size,true);d.setUint32(22,e.size,true);d.setUint16(26,e.name.length,true);header.set(e.name,30);
  result.push(header,...e.parts);offset+=header.length+e.size;
 }
 const central=offset;
 for(const e of entries){
  const header=new Uint8Array(46+e.name.length),d=new DataView(header.buffer);
  d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(14,33,true);
  d.setUint32(16,e.crc,true);d.setUint32(20,e.size,true);d.setUint32(24,e.size,true);d.setUint16(28,e.name.length,true);d.setUint32(42,e.offset,true);header.set(e.name,46);
  result.push(header);offset+=header.length;
 }
 const end=new Uint8Array(22),d=new DataView(end.buffer);
 d.setUint32(0,0x06054b50,true);d.setUint16(8,entries.length,true);d.setUint16(10,entries.length,true);d.setUint32(12,offset-central,true);d.setUint32(16,central,true);result.push(end);
 return result;
}
