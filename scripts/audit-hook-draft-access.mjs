import init from 'manifold-3d/manifold';
import {generateHooks} from '../src/hooks/geometry.js';
import fs from 'node:fs/promises';

const m=await init();m.setup();
const selected=process.env.HOOK_CATEGORIES?.split(',');
const files=(await fs.readdir('src/hooks/categories')).filter(file=>file.endsWith('.js')&&(!selected||selected.includes(file.slice(0,-3))));
const fontBytes=await fs.readFile('src/fonts/NotoSans-Bold.ttf'),fontBuffer=fontBytes.buffer.slice(fontBytes.byteOffset,fontBytes.byteOffset+fontBytes.byteLength);
const results=[];
for(const file of files){
 const mod=await import('../src/hooks/categories/'+file);
 for(const[id,name]of mod.category.designs){
  try{
   for(const height of[65,100]){
    const model=generateHooks(m,{designs:[id],height,pitch:160,reach:44,colourMode:'single'},{fontBuffer,lookup:key=>key===id?{id,name,category:mod.category.id,draw:A=>({...mod.draw(id,A),faceStyle:mod.category.faceStyle})}:undefined});
    const part=model.parts[0],base=new m.Manifold(new m.Mesh({numProp:3,vertProperties:part.mesh.vertices,triVerts:part.mesh.faces})),core=base.translate([0,0,-part.assembly[1]]),tip=model.productFit.hooks[0].tipCentre;
    for(const y of Array.from({length:8},(_,i)=>tip[1]+20-26*i/7)){
     const probe=m.Manifold.cylinder(30,5,5,48).rotate([0,90,0]).translate([tip[0]-15,y,27.5]),hit=core.intersect(probe),blocked=Math.abs(hit.volume())>.005;
     probe.delete();hit.delete();
     if(blocked)throw Error('10 mm hanging loop obstructed at '+y.toFixed(2));
    }
    for(const y of[tip[1]+12,tip[1]+6,tip[1],tip[1]-5]){
     const outer=m.Manifold.cylinder(3,12,12,64),inner=m.Manifold.cylinder(5,9,9,64).translate([0,0,-1]),annulus=outer.subtract(inner),ring=annulus.rotate([90,0,0]).translate([tip[0],y+1.5,tip[2]]),hit=core.intersect(ring),blocked=Math.abs(hit.volume())>.005;
     [outer,inner,annulus,ring,hit].forEach(s=>s.delete());
     if(blocked)throw Error('18 mm keyring obstructed');
    }
    base.delete();core.delete();
   }
   results.push({category:mod.category.id,id,pass:true});console.log('PASS',mod.category.id,id);
  }catch(error){results.push({category:mod.category.id,id,pass:false,error:error.message});console.log('FAIL',mod.category.id,id,error.message);}
 }
}
await fs.mkdir('artifacts/hooks',{recursive:true});
await fs.writeFile('artifacts/hooks/draft-access-audit'+(selected?'-'+selected.join('-'):'')+'.json',JSON.stringify(results,null,2));
if(results.some(result=>!result.pass))process.exitCode=1;
