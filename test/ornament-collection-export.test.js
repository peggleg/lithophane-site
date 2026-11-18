import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';import {unzipSync,strFromU8} from 'fflate';import {buildOrnamentCollectionZip} from '../src/ornament-collection-export.js';import {ornamentCollections} from '../src/ornament-settings.js';
const m=await init();m.setup();
for(const [collection,ams,printer,diameter] of [['gaming',false,'a1-mini',95],['steampunk',true,'256',110]])test(`${collection}: ZIP contains all 16 individual 3MF projects with current settings`,()=>{
 const progress=[];const chunks=buildOrnamentCollectionZip(m,null,{collection,design:`${collection}-1`,thickness:1.8,diameter,printer,ams},(done,total,label)=>progress.push({done,total,label}));assert.equal(new Set(chunks.map(c=>c.buffer)).size,chunks.length);
 const files=unzipSync(Buffer.concat(chunks.map(p=>Buffer.from(p)))),names=Object.keys(files);assert.equal(progress.length,16);assert.equal(progress.at(-1).done,16);assert.equal(names.length,16);assert.ok(names.every(n=>n.endsWith('.3mf')&&!n.includes('/')));
 for(const [index,[id]] of ornamentCollections[collection].designs.entries()){
  const name=`${String(index+1).padStart(2,'0')}-${id}.3mf`;assert.ok(files[name]);const project=unzipSync(files[name]);const settings=JSON.parse(strFromU8(project['Metadata/project_settings.config']));assert.match(settings.printer_settings_id,printer==='256'?/Bambu Lab A1 0.4/:/Bambu Lab A1 mini 0.4/);
 }
});
test('invalid settings reject the complete download',()=>assert.throws(()=>buildOrnamentCollectionZip(m,null,{collection:'gaming',design:'gaming-1',thickness:1.8,diameter:10}),/diameter/i));
test('personalised collection retains current wording and includes every 3MF',()=>{
 const file=fs.readFileSync('src/fonts/Lobster-Regular.ttf'),font=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);const chunks=buildOrnamentCollectionZip(m,font,{collection:'christmas',design:'bells',diameter:100,thickness:3,line1:'Alex',line2:'',wording:'name',ams:false});
 const files=unzipSync(Buffer.concat(chunks.map(p=>Buffer.from(p))));assert.equal(Object.keys(files).length,ornamentCollections.christmas.designs.length);assert.ok(Object.keys(files).every(n=>n.endsWith('.3mf')));
});
