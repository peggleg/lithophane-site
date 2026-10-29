import fs from'node:fs/promises';import path from'node:path';import{spawnSync}from'node:child_process';import assert from'node:assert/strict';import{printProfile}from'../src/print-profile.js';import{printerSpec}from'../src/printer-settings.js';
const kind=process.env.ITEM||'desk-clamp',dir=path.resolve('artifacts/products',kind),slicer=process.env.BAMBU_STUDIO_PATH;if(!slicer)throw Error('Set BAMBU_STUDIO_PATH. Run check-product-browser first to generate actual downloaded fixtures.');
for(const printer of ['a1-mini','256']){const file=path.join(dir,`${kind}-${printer}.3mf`),output=path.join(dir,`effective-${printer}.json`),r=spawnSync(slicer,['--export-settings',output,file],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,`import-${printer}.log`),(r.stdout||'')+(r.stderr||''));assert.equal(r.status,0);const values=JSON.parse(await fs.readFile(output,'utf8'));for(const [key,value]of Object.entries(printProfile(process.env.PROFILE_KIND||kind)))assert.equal(values[key],value,`${kind}: ${key}`);assert.equal(values.printer_settings_id,printerSpec(printer).machine);console.log(`${kind}: native ${printer} project retains agreed profile`);}
const fixture=await fs.readFile(path.join(dir,`${kind}-a1-mini.3mf`));const explicitPlates=fixture.includes(Buffer.from('plater_id'));
const result=spawnSync(slicer,['--slice','0','--arrange',explicitPlates?'0':'1','--orient','0','--skip-useless-pick','--export-3mf',path.join(dir,'sliced.3mf'),path.join(dir,`${kind}-a1-mini.3mf`)],{cwd:dir,encoding:'utf8',timeout:240000,maxBuffer:10*1024*1024});await fs.writeFile(path.join(dir,'slice.log'),(result.stdout||'')+(result.stderr||''));assert.equal(result.status,0,`${kind}: native slice failed; inspect ${dir}/slice.log`);console.log(`${kind}: all parts sliced in supplied orientations`);

const audit=spawnSync('python3',['-c',`import sys,json,zipfile,xml.etree.ElementTree as E
with zipfile.ZipFile(sys.argv[1]) as z: root=E.fromstring(z.read('3D/3dmodel.model'))
ns={'m':'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'}
expected=len(root.findall('m:build/m:item',ns))
with zipfile.ZipFile(sys.argv[2]) as z:
 sliced=E.fromstring(z.read('Metadata/slice_info.config'))
 settings=E.fromstring(z.read('Metadata/model_settings.config'))
objects=sliced.findall('.//object')
instances=settings.findall('.//model_instance')
assert len(instances)==expected,(len(instances),expected)
assert len(objects)==expected,(len(objects),expected)
assert all(o.get('skipped')=='false' for o in objects)
assert all(v.get('value')=='false' for v in sliced.findall(".//metadata[@key='outside']"))
print(json.dumps({'plates':len(sliced.findall('plate')),'objects':len(objects),'skipped':0}))`,path.join(dir,`${kind}-a1-mini.3mf`),path.join(dir,'sliced.3mf')],{cwd:dir,encoding:'utf8'});assert.equal(audit.status,0,audit.stderr);console.log(`${kind}: sliced-object audit ${audit.stdout.trim()}`);
