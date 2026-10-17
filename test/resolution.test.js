import test from 'node:test';
import assert from 'node:assert/strict';
import {planSampling,previewSize,exportEstimate,assertExportBudget,memoryBudget,MIB} from '../src/resolution.js';
import {photoLayout,adjustedTone,imageTones} from '../src/image-processing.js';

test('120 × 100 uses exact 0.2 mm and 0.1 mm grids without the old cap',()=>{
 for(const [detail,cols,rows,triangles] of [[.2,601,501,606600],[.1,1201,1001,2413200]]){
  const p=planSampling(120,100,detail);
  assert.equal(p.cols,cols);assert.equal(p.rows,rows);
  assert.equal(p.spacingX,detail);assert.equal(p.spacingY,detail);assert.equal(p.triangles,triangles);
  assert.equal(exportEstimate(p,'stl').outputBytes,84+50*triangles);
 }
 const p=planSampling(120.05,99.97,.1);
 assert.ok(p.spacingX<=.1&&p.spacingY<=.1);
 assert.equal(planSampling(100,120,.1).rows,1201);
 assert.throws(()=>planSampling(120,100,0));
});
test('memory failures are explicit and do not mutate the selected quality',()=>{
 const p=planSampling(300,300,.1),before={...p};
 assert.throws(()=>assertExportBudget(p,'3mf',memoryBudget(8)),/have not been reduced/);
 assert.deepEqual(p,before);
 assertExportBudget(planSampling(120,100,.1),'3mf',memoryBudget(8),1024*1024);
 assert.throws(()=>assertExportBudget(planSampling(120,100,.1),'stl',memoryBudget(1)),/memory/);
 assert.equal(memoryBudget(undefined),768*MIB);assert.equal(memoryBudget(2),192*MIB);
});
test('preview resolution uses display dimensions and DPR, independently of mesh spacing',()=>{
 assert.deepEqual(previewSize(600,500,1.2,2),{cssWidth:600,cssHeight:500,width:1200,height:1000});
 assert.deepEqual(previewSize(300,500,.5),{cssWidth:250,cssHeight:500,width:250,height:500});
 assert.throws(()=>previewSize(0,500,1));
});
test('crop and contain preserve framing at any raster resolution',()=>{
 assert.deepEqual(photoLayout(2000,1000,1,{crop:'cover',panx:100}),{sx:1000,sy:0,sw:1000,sh:1000,dx:0,dy:0,dw:1,dh:1});
 assert.deepEqual(photoLayout(1000,2000,1,{crop:'cover',pany:0}),{sx:0,sy:0,sw:1000,sh:1000,dx:0,dy:0,dw:1,dh:1});
 const fit=photoLayout(2000,1000,1,{crop:'contain'});
 assert.equal(fit.dy,.25);assert.equal(fit.dh,.5);assert.equal(fit.sw,2000);
});
test('brightness mapping retains fractional luminance, clamps and inverts',()=>{
 assert.equal(adjustedTone(0,0,0),0);assert.ok(Math.abs(adjustedTone(255,255,255)-255)<1e-10);
 assert.ok(Math.abs(adjustedTone(255,0,0)-54.213)<1e-6);
 assert.equal(adjustedTone(0,0,0,{invert:true}),255);
 assert.equal(adjustedTone(255,255,255,{brightness:100}),255);
 const tones=imageTones(new Uint8ClampedArray([1,2,3,255,255,255,255,255]),{});
 assert.ok(tones instanceof Float32Array);assert.notEqual(tones[0],Math.round(tones[0]));assert.equal(tones[1],255);
});
