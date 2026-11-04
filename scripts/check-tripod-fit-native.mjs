import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {projectProfile} from '../src/print-profile.js';
const executable=process.env.BAMBU_STUDIO_PATH;if(!executable)throw Error('Set BAMBU_STUDIO_PATH. Run check-tripod-fit-browser.mjs first.');
const dir=path.resolve('artifacts/cylinders/tripod-fit/native');fs.mkdirSync(dir,{recursive:true});
function files(b){const out={};for(let i=0;i+4<b.length&&b.readUInt32LE(i)===0x04034b50;){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),at=i+30+n+extra;out[b.subarray(i+30,i+30+n).toString()]=b.subarray(at,at+size);i=at+size;}return out;}
for(const printer of ['a1-mini','256'])for(const item of ['tripod-joint','tripod-legs']){
 const name=item+'-'+printer,file=path.join(dir,name+'.3mf');fs.copyFileSync(`artifacts/cylinders/${printer}-${item}.3mf`,file);
 const archive=files(fs.readFileSync(file)),xml=archive['3D/3dmodel.model'].toString();
 assert.equal((xml.match(/<mesh>/g)||[]).length,item==='tripod-joint'?4:3);assert.doesNotMatch(xml,/lithophane-cylinder|name="tripod-deck"/);
 if(item==='tripod-joint')assert.match(xml,/tripod-test-pin-2-10p40mm/);
 else{const z=Array.from(xml.matchAll(/<vertex[^>]* z="([^"]+)"/g),m=>Number(m[1]));assert.ok(Math.abs(Math.max(...z)-10.4)<.002);}
 const settings=path.join(dir,name+'-effective.json');
 const imported=spawnSync(executable,['--datadir',path.join(dir,'cli'),'--export-settings',settings,file],{cwd:dir,encoding:'utf8',timeout:60000,maxBuffer:10e6});
 fs.writeFileSync(path.join(dir,name+'-import.log'),imported.stdout+imported.stderr);assert.equal(imported.status,0,name+' import');
 const actual=JSON.parse(fs.readFileSync(settings)),expected=projectProfile('cylinder-stand',{printer});
 for(const key of ['printer_settings_id','sparse_infill_density','wall_loops','top_shell_layers','bottom_shell_layers','top_shell_thickness','bottom_shell_thickness'])assert.equal(actual[key],expected[key],name+': '+key);
 const output=path.join(dir,name+'-sliced.3mf');
 const sliced=spawnSync(executable,['--datadir',path.join(dir,'cli'),'--slice','0','--arrange','0','--orient','0','--skip-useless-pick','--export-3mf',output,file],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:20e6});
 fs.writeFileSync(path.join(dir,name+'-slice.log'),sliced.stdout+sliced.stderr);assert.equal(sliced.status,0,name+' slicing');
 assert.match(spawnSync('unzip',['-Z1',output],{encoding:'utf8'}).stdout,/Metadata\/plate_1.gcode/);
 console.log(name+': measured-fit parts, complete printer profile, native import and G-code passed.');
}
