// Run with BAMBU_STUDIO_PATH pointing to the official slicer. Also run the
// browser download check and check-bambu-desktop.py for project inheritance.
import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync}from'node:child_process';import assert from'node:assert/strict';import init from'manifold-3d/manifold';import{generateDeskModel}from'../src/desk-geometry.js';import{deskDefaults,deskPresets}from'../src/desk-settings.js';import{solid3mf}from'../src/solid-export.js';
const slicer=process.env.BAMBU_STUDIO_PATH;if(!slicer)throw Error('Set BAMBU_STUDIO_PATH to the official Bambu Studio executable.');
const dir=path.resolve('artifacts/leaf-ams');await fs.mkdir(dir,{recursive:true});const m=await init();m.setup();
for(const veinLayers of [2,3]){
 const model=generateDeskModel(m,{...deskDefaults,...deskPresets.coaster,kind:'coaster',coasterShape:'monstera',coasterSurface:'flat',leafVeins:'ams',width:100,depth:125,veinLayers});model.parts=model.parts.slice(0,2);for(const p of model.parts){p.x=60;p.y=72.5;}
 const file=path.join(dir,`sample-${veinLayers}.3mf`),sliced=path.join(dir,`sample-${veinLayers}-sliced.3mf`);await fs.writeFile(file,Buffer.concat(solid3mf(model).map(x=>Buffer.from(x))));
 const result=spawnSync(slicer,['--slice','0','--arrange','1','--orient','0','--skip-useless-pick','--export-3mf',sliced,file],{cwd:dir,encoding:'utf8',timeout:180000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,`slice-${veinLayers}.log`),(result.stdout||'')+(result.stderr||''));assert.equal(result.status,0,`Native ${veinLayers}-layer slice failed: see slice log`);
 const read=spawnSync('python',['-c','import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.read("Metadata/plate_1.gcode").decode())',sliced],{encoding:'utf8',maxBuffer:20*1024*1024});assert.equal(read.status,0);let height=0,tool=0,feature='Custom';const heights=new Set();
 for(const line of read.stdout.split('\n')){if(line.startsWith('; Z_HEIGHT:'))height=Number(line.split(':')[1]);if(line.startsWith('; FEATURE:'))feature=line.split(':')[1].trim();if(/^T[01]$/.test(line))tool=Number(line.slice(1));if(height&&tool===1&&!['Custom','Prime tower'].includes(feature)&&/^G[123] /.test(line)&&/ E([0-9.]+)/.test(line)&&/ [XY]/.test(line))heights.add(height);}
 assert.deepEqual([...heights].sort(),Array.from({length:veinLayers},(_,i)=>Number(((i+1)*.2).toFixed(1))));console.log(`Native slice: vein filament only at ${[...heights].join(', ')} mm.`);
}
