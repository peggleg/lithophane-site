// Compare the old bin geometry with the new default using identical embedded settings.
// BAMBU_STUDIO_PATH=/path/to/bin/bambu-studio node scripts/benchmark-bin.mjs
// Requires the slicer's runtime libraries and display (Xvfb is sufficient).
import init from 'manifold-3d/manifold';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {generateDeskModel} from '../src/desk-geometry.js';
import {deskDefaults,deskPresets} from '../src/desk-settings.js';
import {solid3mf} from '../src/solid-export.js';
import {printProfile} from '../src/print-profile.js';
const executable=process.env.BAMBU_STUDIO_PATH;
if(!executable)throw Error('Set BAMBU_STUDIO_PATH to the official Bambu Studio executable.');
const mod=await init();mod.setup();
const dir=path.resolve(process.argv[2]||'artifacts/bin-benchmark');await fs.mkdir(dir,{recursive:true});
const report={size:[110,110,140],profile:'A1 mini / 0.4 mm / 0.2 mm / Generic PLA / textured PEI / no brim or supports',cases:[]};
for(const [name,override] of [['original-fluted-2.4',{finish:'fluted',wall:2.4}],['smooth-2.4',{finish:'smooth',wall:2.4}],['default-smooth-1.8',{}]]){
 const model=generateDeskModel(mod,{...deskDefaults,...deskPresets.bin,kind:'bin',shape:'square',...override});
 const file=path.join(dir,name+'.3mf'),output=path.join(dir,name),effective=path.join(dir,name+'-effective.json');
 await fs.mkdir(output,{recursive:true});
 await fs.writeFile(file,Buffer.concat(solid3mf(model).map(c=>Buffer.from(c))));
 const result=spawnSync(executable,['--debug','2','--export-settings',effective,'--slice','0','--arrange','1','--outputdir',output,file],{cwd:dir,encoding:'utf8',timeout:300000,maxBuffer:20*1024*1024});
 await fs.writeFile(path.join(dir,name+'.log'),(result.stdout||'')+(result.stderr||''));
 assert.equal(result.status,0,`${name}: slicer failed (${result.error||result.signal||result.stderr})`);
 const config=JSON.parse(await fs.readFile(effective,'utf8'));
 for(const [key,value] of Object.entries(printProfile('desk')))assert.equal(config[key],value,`${name}: ${key}`);
 const sliced=JSON.parse(await fs.readFile(path.join(output,'result.json'),'utf8'));assert.equal(sliced.return_code,0);
 const plates=sliced.sliced_plates.map(p=>({parts:p.objects.map(o=>o.name),seconds:p.total_predication,grams:p.filaments.reduce((sum,f)=>sum+f.total_used_g,0)}));
 const entry={name,finish:model.settings.finish,wall:model.settings.wall,plates,seconds:plates.reduce((n,p)=>n+p.seconds,0),grams:plates.reduce((n,p)=>n+p.grams,0)};
 report.cases.push(entry);console.log(`${name}: ${(entry.seconds/3600).toFixed(2)} h / ${entry.grams.toFixed(1)} g / ${plates.length} plates`);
}
await fs.writeFile(path.join(dir,'comparison.json'),JSON.stringify(report,null,2)+'\n');
