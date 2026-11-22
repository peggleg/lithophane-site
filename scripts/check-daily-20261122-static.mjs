import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';
import {cylinderCatalogue} from '../src/cylinder-catalogue.js';
import {periodicTones,seamMetrics} from '../src/cylinder-texture.js';
import flatBatch from '../src/fixtures/seasonal-additions-2026-11-22.json' with {type:'json'};

const width=1024,height=341;
const baseline=JSON.parse(fs.readFileSync('src/fixtures/gallery-baseline-daily-2026-11-22.json','utf8'));
const wraps=cylinderCatalogue.slice(baseline.cylinders.length,baseline.cylinders.length+flatBatch.length);
const output=process.argv[2];
if(output)fs.mkdirSync(output,{recursive:true});
const decode=`
from PIL import Image, ImageChops
import sys, struct
with Image.open(sys.argv[1]) as source:
    assert source.format == "WEBP" and source.n_frames == 1
    assert "A" not in source.getbands()
    rgb = source.convert("RGB")
    red, green, blue = rgb.split()
    assert ImageChops.difference(red, green).getbbox() is None, "Non-monochrome red and green"
    assert ImageChops.difference(red, blue).getbbox() is None, "Non-monochrome red and blue"
    sys.stdout.buffer.write(struct.pack("<II", *source.size))
    sys.stdout.buffer.write(source.convert("RGB").resize((1024,341), Image.Resampling.BILINEAR).tobytes())
`;

assert.equal(wraps.length,10);
for(const design of wraps){
 const sourcePath='src/assets/cylinders/'+design.asset;
 const result=spawnSync(process.env.PYTHON||'python3',['-c',decode,sourcePath],{maxBuffer:2*1024*1024});
 assert.equal(result.status,0,result.stderr?.toString()||String(result.error));
 assert.equal(result.stdout.length,8+width*height*3,design.id);
 const w=result.stdout.readUInt32LE(0),h=result.stdout.readUInt32LE(4);
 assert.ok(w>=1800&&h>=600&&w/h>=2.8&&w/h<=3.2,design.id);
 assert.deepEqual([design.row,design.rows],[0,1],design.id);
 const pixels=result.stdout.subarray(8);
 const source=Uint8Array.from({length:width*height},(_,i)=>Math.round(.2126*pixels[i*3]+.7152*pixels[i*3+1]+.0722*pixels[i*3+2]));
 const tones=periodicTones(source,width,height);
 assert.deepEqual(seamMetrics(tones,width,height),{maximum:0,mean:0},design.id);
 for(let quarter=0;quarter<4;quarter++){
  const values=new Set();
  for(let y=0;y<height;y++){
   const start=y*width+quarter*width/4;
   for(let x=start;x<start+width/4;x++)values.add(tones[x]);
  }
  assert.ok(values.size>=85,design.id+' tonal range in quarter '+(quarter+1));
 }
 let nearJoinTotal=0;
 for(let y=0;y<height;y++){
  const start=y*width,end=start+width-1;
  nearJoinTotal+=Math.abs(tones[start+1]-tones[end-1]);
 }
 const nearJoinMean=nearJoinTotal/height;
 assert.ok(nearJoinMean<22,design.id+' gradient across wrap');
 console.log(design.id,w+'×'+h,'raw seam mean',seamMetrics(source,width,height).mean.toFixed(2),'processed seam mean 0.00, near-join mean',nearJoinMean.toFixed(2));
 if(output){
  const stripWidth=384,strip=new PNG({width:stripWidth,height});
  for(let y=0;y<height;y++)for(let x=0;x<stripWidth;x++){
   const column=(x+width-stripWidth/2)%width;
   const at=(y*stripWidth+x)*4,tone=tones[y*width+column];
   strip.data.set([tone,tone,tone,255],at);
  }
  fs.writeFileSync(path.join(output,design.id+'-join.png'),PNG.sync.write(strip));
 }
}

const dist='dist-preview';
const digest=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function checkPage(page,entries){
 const html=fs.readFileSync(dist+'/'+page+'/index.html','utf8');
 const queue=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map(match=>match[1]);
 assert.ok(queue.length,page);
 const scripts=new Map();
 while(queue.length){
  const url=queue.pop();
  if(scripts.has(url))continue;
  const text=fs.readFileSync(dist+url,'utf8');
  scripts.set(url,text);
  for(const match of text.matchAll(/["'](\.\/[^/"']+\.js)["']/g)){
   const dependency=path.posix.resolve(path.posix.dirname(url),match[1]);
   if(fs.existsSync(dist+dependency))queue.push(dependency);
  }
 }
 const text=[...scripts.values()].join('\n');
 for(const {id,sourcePath} of entries){
  assert.ok(text.includes(id),id+' in built '+page+' JS');
  const sourceName=path.basename(sourcePath),prefix=path.basename(sourceName,path.extname(sourceName))+'-';
  const filename=fs.readdirSync(dist+'/assets').find(file=>file.startsWith(prefix)&&file.endsWith(path.extname(sourceName)));
  assert.ok(filename&&text.includes(filename),id+' referenced build asset');
  assert.equal(digest(dist+'/assets/'+filename),digest(sourcePath),id+' built asset bytes');
 }
}
checkPage('lithophane',flatBatch.map(({id})=>({id,sourcePath:'src/assets/seasonal-'+id+'.png'})));
checkPage('cylinders',wraps.map(({id,asset})=>({id,sourcePath:'src/assets/cylinders/'+asset})));
console.log('Both built pages reference all 20 byte-identical new assets.');
