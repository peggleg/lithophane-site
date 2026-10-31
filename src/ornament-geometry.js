import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {productKernel} from './product-kernel.js';
import {ornamentMotifs} from './ornament-motifs.js';
import {validateOrnament,ornamentCollections} from './ornament-settings.js';
// Join nearest outline components with short round bridges. This connects dots,
// letters and motifs without leaving islands that would fall out of the frame.
function connectedSection(C,own,section){
 let result=section;
 for(let attempt=0;attempt<180;attempt++){
  const pieces=result.decompose().map(own);if(pieces.length===1)return result;
  const outlines=pieces.map(p=>p.toPolygons().flatMap(poly=>poly.filter((_,i)=>i%Math.max(1,Math.floor(poly.length/100))===0)));
  let best={d:Infinity};
  for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++)for(const a of outlines[i])for(const b of outlines[j]){const d=(a[0]-b[0])**2+(a[1]-b[1])**2;if(d<best.d)best={d,a,b};}
  if(!best.a)throw Error('Could not connect this lettering. Try shorter text.');
  const circles=[best.a,best.b].map(pt=>own(C.circle(.95,24).translate(pt)));
  result=own(result.add(own(C.hull(circles))));
 }
 throw Error('This wording creates too many separate shapes. Shorten the text.');
}
export function generateOrnament(module,fontBuffer,input){
 const p=validateOrnament(input),K=productKernel(module,p),{C,own}=K;
 try{
  const font=opentype.parse(fontBuffer),radius=p.diameter/2,scale=p.diameter/100;
  for(const char of p.line1+p.line2)if(char!==' '&&!font.charToGlyphIndex(char))throw Error(`The lettering font cannot print “${char}”. Choose another character.`);
  const circle=(r,x=0,y=0)=>own(C.circle(r,192).translate([x,y]));
  const frame=own(circle(radius).subtract(circle(radius-3.6*scale)));
  const eyelet=own(circle(5,0,radius+3).subtract(circle(2.2,0,radius+3)));
  const motifs=own(ornamentMotifs(C,own,p.design).scale([scale,scale]));
  const lines=[p.line1,p.line2].filter(Boolean),textSections=[];
  for(let i=0;i<lines.length;i++){
   const path=font.getPath(lines[i],0,0,40,{kerning:true}),contours=flattenPath(path.commands);
   if(!contours.length)throw Error('Enter visible lettering.');
   const raw=own(new C(contours,'NonZero')),b=raw.bounds(),w=b.max[0]-b.min[0],h=b.max[1]-b.min[1];
   const factor=Math.min((p.diameter*.78)/w,(lines.length===1?p.diameter*.25:p.diameter*.155)/h);
   if(h*factor<6)throw Error('Lettering is too small. Shorten the line or enlarge the ornament.');
   textSections.push(own(raw.translate([-(b.max[0]+b.min[0])/2,-(b.max[1]+b.min[1])/2]).scale([factor,factor]).offset(.5*scale,'Round',2,32).translate([0,lines.length===1?0:(.105*p.diameter)*(i===0?1:-1)])));
  }
  const text=own(C.union(textSections)),anchors=[];
  for(const line of textSections){const points=line.toPolygons().flat();for(const side of [-1,1]){const end=points.reduce((best,p)=>side*p[0]>side*best[0]?p:best,points[0]);const y=Math.max(-radius*.65,Math.min(radius*.65,end[1]));const target=[side*Math.sqrt((radius-1.5*scale)**2-y*y),y];anchors.push(own(C.hull([end,target].map(point=>own(C.circle(.95*scale,24).translate(point))))));}}

  // Keep botanical details out of the central lettering area: the cut-out name
  // remains readable, while a slim structural edge follows its silhouette.
  const decoration=own(motifs.subtract(own(text.offset(.75*scale,'Round',2,32))));
  const profile=connectedSection(C,own,own(C.union([frame,eyelet,decoration,text,...anchors])));
  const full=own(profile.extrude(p.thickness)),inlayDepth=p.inlayLayers*.2;
  let frontText=own(text.intersect(profile));
  const cap=own(frontText.extrude(inlayDepth).translate([0,0,p.thickness-inlayDepth]));
  if(p.ams){
   const base=own(full.subtract(cap));
   const body=K.add('ornament-frame','ornament-body',base,[180,0,0],p.frameColour);
   const lettering=K.add('ornament-lettering','ornament-lettering',cap,[180,0,0],p.textColour);
   for(const [part,extruder]of [[body,1],[lettering,2]]){part.colourGroup='personalised-ornament';part.extruder=extruder;}
  }else K.add('ornament','ornament-body',full,[180,0,0],p.frameColour);
  const pieces=full.decompose().map(own);if(pieces.length!==1)throw Error('Ornament must be a single connected print.');
  const mesh=full.getMesh(),vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);
  // Single-colour STL uses the same face-down pose as the 3MF assembly.
  for(let i=0;i<vertices.length/3;i++){vertices[i*3]=mesh.vertProperties[i*mesh.numProp];vertices[i*3+1]=-mesh.vertProperties[i*mesh.numProp+1];vertices[i*3+2]=p.thickness-mesh.vertProperties[i*mesh.numProp+2];}
  const model=K.finish({printPlates:true,filamentColours:[p.frameColour,p.textColour],productFit:{connected:true,inlayDepth:p.ams?inlayDepth:0},previewDirection:[0,-.15,1],note:`One connected openwork ornament. ${p.ams?`Flush lettering uses filament 2 in the first ${p.inlayLayers} layers (${inlayDepth.toFixed(1)} mm); the rest uses filament 1.`:'Single-colour lettering is part of the openwork silhouette.'} Hanging cord is supplied separately.`,guide:`${ornamentCollections[p.collection].name}: ${p.design}. Text: ${lines.join(' / ')}.\nPrint face-down as supplied on a clean plate. The front lettering and frame start together on the bed; no supports are needed. ${p.ams?`Open the 3MF as a project and assign frame to filament 1 and text to filament 2. The flush inlay occupies only the first ${p.inlayLayers} × 0.2 mm layers. Keep both components aligned as one object. AMS purge/waste is additional to the part estimate.`:'The single-colour STL and 3MF contain the complete connected ornament.'}\nSupply a cord or ribbon through the integral eyelet. Keep the delicate foliage and lettering free of heavy loads.\nUp to two text lines; font and all outlines are processed locally. Font: Dancing Script, SIL Open Font License.`});
  model.singleColourMesh={vertices,faces:new Uint32Array(mesh.triVerts)};
  model.outlineContours=own(profile.simplify(.04)).toPolygons();
  return model;
 }finally{K.dispose();}
}
