import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {releasedOrnamentCollections} from '../src/ornament-settings.js';
const collections=process.env.COLLECTIONS?.split(',')||releasedOrnamentCollections,slicer=process.env.BAMBU_STUDIO_PATH||'/workspace/slicer-validation/bambu';
for(const collection of collections){const dir=path.resolve(`artifacts/ornaments/${collection}`),r=spawnSync(slicer,['--slice','0','--arrange','0','--orient','0','--skip-useless-pick','--export-3mf','ornament-standard-sliced.3mf','ornament-standard.3mf'],{cwd:dir,encoding:'utf8',timeout:240000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,'standard-final-slice.log'),(r.stdout||'')+(r.stderr||''));assert.equal(r.status,0,collection);
const audit=spawnSync('python3',['-c',`import zipfile,xml.etree.ElementTree as E,sys
with zipfile.ZipFile(sys.argv[1]) as z: r=E.fromstring(z.read('Metadata/slice_info.config'))
objects=r.findall('.//object');assert len(objects)==1 and objects[0].get('skipped')=='false'
for key in ['outside','support_used']: assert all(v.get('value')=='false' for v in r.findall(".//metadata[@key='%s']"%key))
assert len(r.findall('.//filament'))==2
assert r.find(".//layer_filament_list[@filament_list='0 1']").get('layer_ranges')=='0 2'
assert r.find(".//layer_filament_list[@filament_list='0']").get('layer_ranges').split()[0]=='3'
`,path.join(dir,'ornament-standard-sliced.3mf')],{encoding:'utf8'});assert.equal(audit.status,0,audit.stderr);console.log(collection+': complete-script AMS project slices on the bed without supports, colour 2 only in the first three layers');}
