// CLI archive-import check, without process overrides.
// This bypasses desktop preset inheritance: also run check-bambu-desktop.py.
// BAMBU_STUDIO_PATH=/path/to/bin/bambu-studio npm run test:bambu-import
// A GUI-capable runtime (e.g. DISPLAY=:99 under Xvfb) and its shared libraries are required.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {makePanel,threeMfBytes} from '../src/geometry.js';
import {solid3mf} from '../src/solid-export.js';
import {fan3mf,makeFan,defaults} from '../src/fan-geometry.js';
import {printProfile} from '../src/print-profile.js';
const executable=process.env.BAMBU_STUDIO_PATH;
if(!executable)throw Error('Set BAMBU_STUDIO_PATH to the official Bambu Studio executable. This check does not substitute a JSON parser for the slicer.');
const dir=path.resolve('artifacts/bambu-import');await fs.mkdir(dir,{recursive:true});
const mesh=makePanel({width:20,height:20,min:3,max:3,cols:2,rows:2,tones:new Float32Array(4)});
const fixtures=[['lithophane',threeMfBytes(mesh)],['fan',fan3mf(makeFan(defaults))],...['keyring','nameplate','clicker','desk','coaster','coaster-tray','coaster-rack','lantern','future-tool'].map(kind=>[kind,solid3mf({settings:{kind},parts:[{name:kind,mesh}]})])];
for(const [kind,chunks] of fixtures){
 const file=path.join(dir,kind+'.3mf'),output=path.join(dir,kind+'-effective.json');
 await fs.writeFile(file,chunks instanceof Uint8Array?chunks:Buffer.concat(chunks.map(c=>Buffer.from(c))));
 // Do not load a machine, process or filament preset here: they could hide an ignored project.
 const result=spawnSync(executable,['--debug','2','--export-settings',output,file],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:10*1024*1024});
 await fs.writeFile(path.join(dir,kind+'.log'),(result.stdout||'')+(result.stderr||''));
 assert.equal(result.status,0,`${kind}: Bambu Studio failed (${result.error||result.signal||result.stderr}); see artifacts/bambu-import`);
 const actual=JSON.parse(await fs.readFile(output,'utf8'));
 for(const [key,value] of Object.entries(printProfile(kind)))assert.equal(actual[key],value,`${kind}: imported ${key}`);
 assert.equal(actual.printer_settings_id,'Bambu Lab A1 mini 0.4 nozzle');
 assert.equal(actual.filament_settings_id[0],'Generic PLA @BBL A1M');
 assert.equal(actual.curr_bed_type,'Textured PEI Plate');
 assert.match(actual.machine_start_gcode,/machine: A1 mini/,'must retain real machine instructions, not generic G28 defaults');
 console.log(`${kind}: CLI read retained the A1 mini project and ${actual.top_shell_layers}/${actual.bottom_shell_layers} skin layers.`);
}
