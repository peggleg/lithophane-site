import test from 'node:test';
import assert from 'node:assert/strict';
import {exportFilename,chooseSaveTarget} from './export-save.js';
const panel={width:148,height:105,max:3};
test('descriptive filenames include current custom dimensions and maximum thickness',()=>{
 assert.equal(exportFilename('Christmas village',panel,'stl'),'Christmas-village-148x105x3mm.stl');
 assert.equal(exportFilename('My cat.JPG',{width:123.5,height:87,max:2.8},'3mf'),'My-cat-123.5x87x2.8mm.3mf');
 assert.equal(exportFilename('../bad:name?.png',panel,'stl'),'..badname-148x105x3mm.stl');
 assert.equal(exportFilename('',panel,'stl'),'My-lithophane-148x105x3mm.stl');
});
test('custom photo offers the native picker before generation with dimensioned suggestion',async()=>{
 const handle={};let options;
 const result=await chooseSaveTarget({name:'Pet.png',panel,format:'3mf',custom:true,picker:async o=>{options=o;return handle;}});
 assert.equal(result.handle,handle);assert.equal(options.suggestedName,'Pet-148x105x3mm.3mf');
 assert.deepEqual(options.types[0].accept,{'application/octet-stream':['.3mf']});
});
test('fallback asks for name, appends dimensions and respects cancellation',async()=>{
 const args={name:'Pet.png',panel,format:'stl',custom:true};
 assert.equal((await chooseSaveTarget({...args,askName:async()=> 'Holiday photo'})).filename,'Holiday-photo-148x105x3mm.stl');
 assert.equal(await chooseSaveTarget({...args,askName:async()=>null}),null);
 await assert.rejects(chooseSaveTarget({...args,picker:async()=>{throw new DOMException('Cancelled','AbortError');}}),{name:'AbortError'});
});
test('samples use their proper names without asking for an uploaded-photo save destination',async()=>{
 const result=await chooseSaveTarget({name:'Easter bunny',panel,format:'stl',custom:false,picker:()=>{throw Error('Unexpected picker');}});
 assert.deepEqual(result,{filename:'Easter-bunny-148x105x3mm.stl',handle:null});
});
