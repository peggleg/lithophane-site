import test from 'node:test';
import assert from 'node:assert/strict';
import {photoLayout,drawPhoto,imageTones} from '../src/image-processing.js';
import {makePanel} from '../src/geometry.js';

test('zoom out retains the full matching photo with positionable margins',()=>{
 assert.deepEqual(photoLayout(1200,1000,1.2,{zoom:50}),{sx:0,sy:0,sw:1200,sh:1000,dx:.25,dy:.25,dw:.5,dh:.5});
 const left=photoLayout(1200,1000,1.2,{zoom:50,panx:0,pany:0});
 const right=photoLayout(1200,1000,1.2,{zoom:50,panx:100,pany:100});
 assert.equal(left.dx,0);assert.equal(left.dy,0);assert.equal(right.dx,.5);assert.equal(right.dy,.5);
 const wide=photoLayout(2000,1000,1,{zoom:50});
 assert.deepEqual(wide,{sx:0,sy:0,sw:2000,sh:1000,dx:0,dy:.25,dw:1,dh:.5});
});

test('zoom-out clipping preserves proportions and valid source/destination bounds',()=>{
 for(const [w,h,ratio]of [[2400,1000,1.2],[1000,2400,1.2],[1200,1000,1.2]]){
  for(const zoom of [25,50,75,95,100])for(const panx of [0,50,100])for(const pany of [0,50,100]){
   const r=photoLayout(w,h,ratio,{zoom,panx,pany});
   assert.ok(r.sx>=0&&r.sy>=0&&r.sx+r.sw<=w+1e-8&&r.sy+r.sh<=h+1e-8);
   assert.ok(r.dx>=0&&r.dy>=0&&r.dx+r.dw<=1+1e-8&&r.dy+r.dh<=1+1e-8);
   assert.ok(Math.abs(r.sw/r.sh-ratio*r.dw/r.dh)<1e-8);
  }
 }
 const calls=[],context={fillRect(){},drawImage(...args){calls.push(args);}},image={width:1200,height:1000};
 drawPhoto(context,image,720,600,1.2,{zoom:50});drawPhoto(context,image,601,501,1.2,{zoom:50});
 assert.deepEqual(calls[0].slice(1,5),calls[1].slice(1,5));
 assert.deepEqual(calls[0].slice(5),[180,150,360,300]);assert.deepEqual(calls[1].slice(5),[150.25,125.25,300.5,250.5]);
});

test('matching proportions can pan horizontally and vertically after zooming',()=>{
 const left=photoLayout(1200,1000,1.2,{zoom:200,panx:0,pany:0});
 const right=photoLayout(1200,1000,1.2,{zoom:200,panx:100,pany:100});
 assert.equal(left.sx,0);assert.equal(left.sy,0);
 assert.equal(right.sx,600);assert.equal(right.sy,500);
 for(const rect of [left,right]){assert.equal(rect.sw,600);assert.equal(rect.sh,500);}
 const fitted=photoLayout(1200,1000,1.2,{zoom:100,panx:100,pany:0});
 assert.equal(fitted.sx,0);assert.equal(fitted.sy,0);
});

test('crop stays inside landscape, portrait and matching photos at every position',()=>{
 for(const [w,h,ratio]of [[2400,1000,1.2],[1000,2400,1.2],[1200,1000,1.2]]){
  for(const zoom of [100,105,200,400])for(const panx of [0,50,100])for(const pany of [0,50,100]){
   const r=photoLayout(w,h,ratio,{zoom,panx,pany});
   assert.ok(r.sx>=0&&r.sy>=0&&r.sx+r.sw<=w+1e-8&&r.sy+r.sh<=h+1e-8);
   assert.ok(Math.abs(r.sw/r.sh-ratio)<1e-8);
   assert.ok(Math.abs(r.dw-1)<1e-12);assert.ok(Math.abs(r.dh-1)<1e-12);
  }
 }
});

test('whole-photo fit ignores crop-only settings and keeps centred margins',()=>{
 assert.deepEqual(photoLayout(2000,1000,1,{crop:'contain',zoom:400,panx:0,pany:100}),photoLayout(2000,1000,1,{crop:'contain'}));
});

test('preview and export draw exactly the same source crop at different raster sizes',()=>{
 const calls=[];
 const context={fillRect(){},drawImage(...args){calls.push(args);}};
 const image={width:1200,height:1000},adjustments={zoom:200,panx:100,pany:25};
 drawPhoto(context,image,720,600,1.2,adjustments);
 drawPhoto(context,image,601,501,1.2,adjustments);
 assert.deepEqual(calls[0].slice(1,5),[600,125,600,500]);
 assert.deepEqual(calls[1].slice(1,5),calls[0].slice(1,5));
 assert.deepEqual(calls[0].slice(5),[0,0,720,600]);
 assert.deepEqual(calls[1].slice(5),[0,0,601,501]);
});

test('moving a crop across a horizontal gradient changes exported relief',()=>{
 // Analytic gradient isolates crop math from browser interpolation and STL encoding.
 const heights=[];
 for(const panx of [0,100]){
  const rect=photoLayout(1200,1000,1.2,{zoom:200,panx});
  const pixels=new Uint8ClampedArray(3*2*4);
  for(let y=0;y<2;y++)for(let x=0;x<3;x++){
   const tone=(rect.sx+x*rect.sw/2)/1200*255,i=(y*3+x)*4;
   pixels.set([tone,tone,tone,255],i);
  }
  const mesh=makePanel({width:120,height:100,min:.8,max:3,cols:3,rows:2,tones:imageTones(pixels)});
  heights.push(mesh.vertices[2]);
 }
 assert.ok(heights[0]>heights[1]+1,'moving right selects brighter pixels and thinner plastic');
});
