import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {printProfile} from '../src/print-profile.js';import {printerSpec} from '../src/printer-settings.js';
const collection=process.env.COLLECTION||'christmas',dir=path.resolve(`artifacts/ornaments/${collection}`),slicer=process.env.BAMBU_STUDIO_PATH||'/workspace/slicer-validation/bambu';
for(const printer of ['a1-mini','256']){const file=path.join(dir,`ornament-${printer}.3mf`),effective=path.join(dir,`effective-${printer}.json`),result=spawnSync(slicer,['--export-settings',effective,file],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,`import-${printer}.log`),(result.stdout||'')+(result.stderr||''));assert.equal(result.status,0);const actual=JSON.parse(await fs.readFile(effective,'utf8'));for(const [k,v]of Object.entries(printProfile('ornament')))assert.equal(actual[k],v);assert.equal(actual.printer_settings_id,printerSpec(printer).machine);assert.equal(actual.filament_colour.length,2);console.log(collection+': native '+printer+' retains 8% gyroid, 2 walls, 3/3 skins and two filaments');}
for(const name of ['ornament-a1-mini','ornament-single']){const result=spawnSync(slicer,['--slice','0','--arrange','0','--orient','0','--skip-useless-pick','--export-3mf',path.join(dir,name+'-sliced.3mf'),path.join(dir,name+'.3mf')],{cwd:dir,encoding:'utf8',timeout:240000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,name+'-slice.log'),(result.stdout||'')+(result.stderr||''));assert.equal(result.status,0,`${name}: native slicing failed`);console.log(collection+': '+name+' sliced face-down');}
const audit=spawnSync('python3',['-c',`import zipfile,xml.etree.ElementTree as E,sys
from pathlib import Path
base=Path(sys.argv[1])
for name in ['ornament-a1-mini','ornament-single']:
 with zipfile.ZipFile(base/(name+'-sliced.3mf')) as z: root=E.fromstring(z.read('Metadata/slice_info.config'))
 objects=root.findall('.//object');assert len(objects)==1 and objects[0].get('skipped')=='false'
 assert all(v.get('value')=='false' for v in root.findall(".//metadata[@key='outside']"))
 assert all(v.get('value')=='false' for v in root.findall(".//metadata[@key='support_used']"))
 if name=='ornament-a1-mini':
  assert len(root.findall('.//filament'))==2
  first=root.find(".//layer_filament_list[@filament_list='0 1']");assert first is not None and first.get('layer_ranges')=='0 2'
  rest=root.find(".//layer_filament_list[@filament_list='0']");assert rest is not None and rest.get('layer_ranges').split()[0]=='3'
print('All geometry sliced on the bed without supports; second filament is confined to the first three layers.')`,dir],{encoding:'utf8'});assert.equal(audit.status,0,audit.stderr);console.log(audit.stdout.trim());
