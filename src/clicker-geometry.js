import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {outline} from './symbols.js';
import {fonts} from './font-catalogue.js';
import {validateClickerSettings,clickerPositions} from './clicker-settings.js';
export function generateClickerModel(module,fontBuffer,input){
 const p=validateClickerSettings(input);if(!Object.hasOwn(fonts,p.font))throw Error('Choose an available font.');
 const font=opentype.parse(fontBuffer),{CrossSection:C}=module,owned=[];const own=value=>{owned.push(value);return value;};
 const rounded=(width,height,r=4)=>own(own(C.square([width-2*r,height-2*r],true)).offset(r,'Round',2,48));
 const mesh=solid=>{if(solid.isEmpty()||solid.status()!=='NoError'||solid.volume()<=0)throw Error('Could not generate a closed clicker part. Adjust the fit settings.');const m=solid.getMesh(),vertices=new Float32Array(m.vertProperties.length/m.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let j=0;j<3;j++)vertices[i*3+j]=m.vertProperties[i*m.numProp+j];return {vertices,faces:new Uint32Array(m.triVerts)};};
 try{
 const positions=clickerPositions(p),xs=positions.map(v=>v[0]),ys=positions.map(v=>v[1]),spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys),height=p.cavity+p.plate;
 let width=spanX+30,depth=spanY+30,region=null;
 for(let attempt=0;attempt<20;attempt++){
  region=p.design==='cloud'?own(new C([outline('cloud',width,depth)],'EvenOdd')):p.design==='pebble'&&p.capShape!=='rounded'?own(C.circle(width/2,96)):rounded(width,depth);
  const inside=own(region.offset(-p.wall)),safe=positions.every(([x,y])=>own(own(C.square([p.cutout,p.cutout],true).translate([x,y])).subtract(inside)).area()<1e-6);
  if(safe)break;if(attempt===19)throw Error('The switch layout needs more room.');width*=1.08;depth*=1.08;
 }
 const inner=own(region.offset(-p.wall)),body=own(region.extrude(height)),cavity=own(inner.extrude(p.cavity));let base=own(body.subtract(cavity));
 for(const position of positions){const opening=own(own(C.square([p.cutout,p.cutout],true)).extrude(p.plate+.02).translate([...position,p.cavity-.01]));base=own(base.subtract(opening));}
 const parts=[{name:'clicker-base',role:'base',mesh:mesh(base),x:0,assembly:[0,0,0]}];
 const makeCap=(key,shape)=>{
  const face=shape==='circle'?own(C.circle(9,96)):shape==='heart'?own(new C([outline('heart',18,18)],'EvenOdd')):rounded(18,18,3);
  const cap=own(face.extrude(2.4).translate([0,0,p.stemHeight])),connector=own(C.square([p.stemWidth,p.stemWidth],true).extrude(p.stemHeight+.01));
  const length=4+p.socketClearance,thickness=1.1+p.socketClearance,cross=own(C.union([own(C.square([length,thickness],true)),own(C.square([thickness,length],true))]));
  const socket=own(cross.extrude(p.stemHeight+.1).translate([0,0,-.01]));let solid=own(own(cap.add(connector)).subtract(socket));
  if(key.type!=='blank'){
   let marking;
   if(key.type==='symbol')marking=own(new C([outline(key.value,10,10)],'EvenOdd'));
   else{
    if(!font.charToGlyphIndex(key.value))throw Error(`This font does not support ${key.value}. Choose another letter or font.`);
    const contours=flattenPath(font.charToGlyph(key.value).getPath(0,0,11).commands),points=contours.flat(),xs=points.map(v=>v[0]),ys=points.map(v=>v[1]);
    if(!points.length)throw Error('Choose a printable letter or number.');
    marking=own(own(new C(contours,'NonZero')).translate([-(Math.min(...xs)+Math.max(...xs))/2,-(Math.min(...ys)+Math.max(...ys))/2]));
   }
   const safe=own(face.offset(-2));let fitted=null;
   for(let scale=1;scale>.3;scale*=.94){const candidate=own(marking.scale(scale));if(own(candidate.subtract(safe)).area()<1e-6){fitted=candidate;break;}}
   if(!fitted)throw Error('This marking does not fit this keycap.');
   solid=own(solid.add(own(fitted.extrude(.82).translate([0,0,p.stemHeight+2.38]))));
  }
  return own(solid.simplify(.0001));
 };
 let nextX=width/2+16;
 p.keys.forEach((key,i)=>{parts.push({name:`keycap-${i+1}-${key.type==='symbol'?key.value:key.type==='blank'?'blank':'letter'}`,role:'cap',key:i,mesh:mesh(makeCap(key,p.capShape)),x:nextX,assembly:[...positions[i],height+4.5]});nextX+=25;});
 const coupon=own(own(rounded(26,26,3).extrude(p.plate)).subtract(own(C.square([p.cutout,p.cutout],true).extrude(p.plate+.02).translate([0,0,-.01]))));
 parts.push({name:'switch-plate-fit-test',role:'test',mesh:mesh(coupon),x:nextX,assembly:null});nextX+=30;
 parts.push({name:'keycap-socket-fit-test',role:'test',mesh:mesh(makeCap({type:'blank',value:''},'rounded')),x:nextX,assembly:null});
 return {parts,settings:p,width:+width.toFixed(2),height:+depth.toFixed(2),baseHeight:height,positions,capTop:p.stemHeight+2.4,prototype:true};
 }finally{for(let i=owned.length-1;i>=0;i--)owned[i].delete();}
}
