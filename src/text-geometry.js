import {outline,ringHole} from './symbols.js';
import opentype from 'opentype.js';

import {textDefaults,validateTextSettings} from './text-settings.js';
export {textDefaults,validateTextSettings} from './text-settings.js';
export function flattenPath(commands){
 const contours=[];let path=[],pos=[0,0];
 const put=(x,y)=>{path.push([x,-y]);pos=[x,y];};
 for(const c of commands){
  if(c.type==='M'){if(path.length>2)contours.push(path);path=[];put(c.x,c.y);}
  else if(c.type==='L')put(c.x,c.y);
  else if(c.type==='Q'||c.type==='C'){
   const start=pos.slice(),controlLength=Math.hypot(c.x1-start[0],c.y1-start[1])+Math.hypot(c.x-(c.x2??c.x1),c.y-(c.y2??c.y1))+(c.type==='C'?Math.hypot(c.x2-c.x1,c.y2-c.y1):0),steps=Math.max(4,Math.min(100,Math.ceil(controlLength/.18)));
   for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;if(c.type==='Q')put(u*u*start[0]+2*u*t*c.x1+t*t*c.x,u*u*start[1]+2*u*t*c.y1+t*t*c.y);else put(u**3*start[0]+3*u*u*t*c.x1+3*u*t*t*c.x2+t**3*c.x,u**3*start[1]+3*u*u*t*c.y1+3*u*t*t*c.y2+t**3*c.y);}
  }else if(c.type==='Z'){if(path.length>2)contours.push(path);path=[];}
 }
 if(path.length>2)contours.push(path);return contours.map(c=>c.filter((p,i)=>i===0||Math.hypot(p[0]-c[i-1][0],p[1]-c[i-1][1])>1e-7));
}
function bounds(contours){const ps=contours.flat();return {minX:Math.min(...ps.map(p=>p[0])),maxX:Math.max(...ps.map(p=>p[0])),minY:Math.min(...ps.map(p=>p[1])),maxY:Math.max(...ps.map(p=>p[1]))};}
export function generateTextModel(module,fontBuffer,input){
 const p=validateTextSettings(input),font=opentype.parse(fontBuffer),{CrossSection:C,Manifold:M}=module,owned=[];
 const own=o=>{owned.push(o);return o;};
 try{
  const text=[p.line1,p.line2].filter(Boolean).join(' '),bad=[...new Set([...text].filter(c=>c!==' '&&(!/^[\u0020-\u024F\u1E00-\u1EFF\u2000-\u206F]$/.test(c)||font.charToGlyphIndex(c)===0)))];
  if(bad.length)throw Error('This font does not support: '+bad.join(' ')+'. Use Latin letters, numbers and available punctuation.');
  let region;
  if(p.kind==='keyring'&&['heart','star','cloud'].includes(p.shape))region=own(new C([outline(p.shape,p.width,p.height)],'EvenOdd'));
  else if(p.kind==='keyring'&&p.shape==='circle')region=own(C.circle(p.width/2,96));
  else if(p.kind==='keyring'&&p.shape==='capsule'){
   const r=p.height/2,core=own(C.square([Math.max(.01,p.width-p.height),p.height],true));
   if(p.width<p.height)throw Error('Capsule width must be at least its height.');
   region=own(C.union([core,own(C.circle(r,64).translate([-(p.width-p.height)/2,0])),own(C.circle(r,64).translate([(p.width-p.height)/2,0]))]));
  }else{const r=Math.min(4,p.height/5);const core=own(C.square([p.width-2*r,p.height-2*r],true));region=own(core.offset(r,'Round',2,48));}
  let holeX=null,holeY=null,available=own(region.offset(-3,'Round'));
  if(p.kind==='keyring'){
   ({x:holeX,y:holeY}=ringHole(p));const hole=own(C.circle(p.hole/2,64).translate([holeX,holeY]));region=own(region.subtract(hole));
   available=own(available.subtract(own(C.circle(p.hole/2+3,64).translate([holeX,holeY]))));
  }
  const raw=[],lines=[p.line1,p.line2].filter(Boolean);
  for(let i=0;i<lines.length;i++){
   const commands=[];let pen=0;const glyphs=[...lines[i]].map(c=>font.charToGlyph(c));
   for(let j=0;j<glyphs.length;j++){const g=glyphs[j];commands.push(...g.getPath(pen,i*p.size*1.4,p.size,{hinting:false},font).commands);pen+=(g.advanceWidth+(glyphs[j+1]?font.getKerningValue(g,glyphs[j+1]):0))*p.size/font.unitsPerEm;}
   const contours=flattenPath(commands);
   if(!contours.length)throw Error('Text must contain printable letter shapes.');
   const b=bounds(contours),shift=p.align==='left'?0:p.align==='right'?-(b.maxX-b.minX):-(b.maxX-b.minX)/2;
   raw.push(...contours.map(c=>c.map(([x,y])=>[x-b.minX+shift,y])));
  }
  let lettering=null,scale=1;
  if(raw.length){
  const b=bounds(raw),baseText=own(new C(raw,'NonZero')),centred=own(baseText.translate([-(b.minX+b.maxX)/2,-(b.minY+b.maxY)/2]));
  for(let attempt=0;attempt<70;attempt++){
   const candidate=own(centred.scale(scale));const shifted=own(candidate.translate(p.kind==='keyring'?(['rounded','capsule'].includes(p.shape)?[(p.hole+3)/2,0]:[0,-2]):[0,0]));const outside=own(shifted.subtract(available));
   if(outside.area()<.00001){lettering=shifted;break;}scale*=.94;
  }
  if(!lettering||p.size*scale<5)throw Error('Text would be too small. Shorten it, use one line or enlarge the design. Minimum fitted font size is 5 mm.');
  const details=lettering.decompose();for(const part of details){own(part);const core=own(part.offset(-.2));if(core.isEmpty())throw Error('A text feature is thinner than the 0.4 mm starting assumption. Increase the size or choose a bolder font.');}
  }else lettering=own(region.subtract(region));
  for(const symbol of p.symbols){const decoration=own(new C([outline(symbol.type,symbol.size,symbol.size)],'EvenOdd').translate([symbol.x,symbol.y]));if(own(decoration.subtract(available)).area()>.00001)throw Error('Move the symbol further inside the tag.');lettering=own(lettering.add(decoration));}
  const plate=own(region.extrude(p.base)),relief=own(lettering.extrude(p.relief+.02).translate([0,0,p.mode==='raised'?p.base-.02:p.base-p.relief]));
  const combined=own(p.mode==='raised'?plate.add(relief):plate.subtract(relief));
  // Remove sub-micron slivers where draggable symbols meet letter outlines before Float32 export.
  const solid=p.symbols.length?own(combined.simplify(.0001)):combined;
  const toMesh=m=>{if(m.isEmpty()||m.status()!=='NoError'||m.volume()<=0)throw Error('Could not create a valid solid. Adjust the text or dimensions.');const mesh=m.getMesh(),v=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let i=0;i<v.length/3;i++)for(let j=0;j<3;j++)v[i*3+j]=mesh.vertProperties[i*mesh.numProp+j];return {vertices:v,faces:new Uint32Array(mesh.triVerts)};};
  const parts=[{name:p.kind,mesh:toMesh(solid),x:0}];
  if(p.kind==='nameplate'&&p.stand){
   const stand=(width)=>{const gap=p.base+.3,base=own(M.cube([width,30,6],true).translate([0,0,3])),back=own(M.cube([width,8,18],true).translate([0,gap/2+4,15])),front=own(M.cube([width,5,2],true).translate([0,-gap/2-2.5,7]));return own(M.union([base,back,front]));};
   parts.push({name:'desk-stand',mesh:toMesh(stand(p.width*.7)),x:p.width/2+p.width*.35+15});
   parts.push({name:'stand-fit-test',mesh:toMesh(stand(20)),x:p.width/2+p.width*.7+45});
  }
  return {parts,settings:p,fontSize:+(p.size*scale).toFixed(2),width:p.width,height:p.height,holeX,holeY,warnings:['Start with a 0.4 mm nozzle and 0.2 mm layers; inspect small details in your slicer.',p.kind==='nameplate'&&p.stand?'Stand fit and small-letter quality require physical testing.':'Small-letter quality and tag strength require physical testing.']};
 }finally{for(let i=owned.length-1;i>=0;i--)owned[i].delete();}
}
