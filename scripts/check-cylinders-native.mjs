import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
import init from 'manifold-3d/manifold';import {generateCylinderStand} from '../src/cylinder-geometry.js';import {cylinderStands} from '../src/cylinder-settings.js';import {solid3mf} from '../src/cylinder-export.js';import {projectProfile} from '../src/print-profile.js';
const exe=process.env.BAMBU_STUDIO_PATH;if(!exe)throw Error('Set BAMBU_STUDIO_PATH.');
const dir=path.resolve('artifacts/cylinders/native');await fs.mkdir(dir,{recursive:true});const m=await init();m.setup();
const fixtures=[];
for(const printer of ['a1-mini','256']){
 const name='cylinder-'+printer,file=path.join(dir,name+'.3mf');await fs.copyFile(`artifacts/cylinders/${printer}-kit.3mf`,file);fixtures.push({name,file,printer,kind:'cylinder',slice:true});
 for(const stand of cylinderStands){const name=stand.id+'-'+printer,model=generateCylinderStand(m,{stand:stand.id,printer});const file=path.join(dir,name+'.3mf');await fs.writeFile(file,Buffer.concat(solid3mf(model).map(x=>Buffer.from(x))));fixtures.push({name,file,printer,kind:'cylinder-stand',slice:printer==='a1-mini'});}
 {const name='tealight-fit-'+printer,model=generateCylinderStand(m,{printer},true);const file=path.join(dir,name+'.3mf');await fs.writeFile(file,Buffer.concat(solid3mf(model).map(x=>Buffer.from(x))));fixtures.push({name,file,printer,kind:'cylinder-stand',slice:printer==='a1-mini'});}
}
for(const f of fixtures){
 const settings=path.join(dir,f.name+'-effective.json'),r=spawnSync(exe,['--datadir',path.join(dir,'cli'),'--export-settings',settings,f.file],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:20e6});await fs.writeFile(path.join(dir,f.name+'-import.log'),r.stdout+r.stderr);assert.equal(r.status,0,f.name+' native import');const actual=JSON.parse(await fs.readFile(settings,'utf8')),expected=projectProfile(f.kind,{printer:f.printer});for(const k of ['printer_settings_id','wall_loops','sparse_infill_density','top_shell_layers','bottom_shell_layers','top_shell_thickness','bottom_shell_thickness'])assert.equal(actual[k],expected[k],f.name+': '+k);console.log(f.name+': native import passed.');
 if(f.slice){const r=spawnSync(exe,['--datadir',path.join(dir,'cli'),'--slice','0','--arrange','0','--orient','0','--skip-useless-pick','--export-3mf',path.join(dir,f.name+'-sliced.3mf'),f.file],{cwd:dir,encoding:'utf8',timeout:180000,maxBuffer:30e6});await fs.writeFile(path.join(dir,f.name+'-slice.log'),r.stdout+r.stderr);assert.equal(r.status,0,f.name+': actual slicing failed; inspect log');console.log(f.name+': native slicing passed.');}
}
console.log('Both printers imported; cylinder kits, all eight stands and fit cup sliced.');
