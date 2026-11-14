import {leafyWreath,ornamentEdge,ornamentEdges} from './ornament-wreath.js';
import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {productKernel} from './product-kernel.js';
import {ornamentArtwork} from './ornament-artwork.js';
import {validateOrnament,ornamentCollections} from './ornament-settings.js';
// Join nearest outline components with short round bridges. This connects dots,
// letters and motifs without leaving islands that would fall out of the frame.
function connectedSection(C,own,section){
 let result=section;
 for(let attempt=0;attempt<180;attempt++){
  const pieces=result.decompose().map(own);if(pieces.length===1)return result;
  const outlines=pieces.map(p=>{const points=p.toPolygons().flat(),step=Math.max(1,Math.ceil(points.length/180));return points.filter((_,i)=>i%step===0);}),bounds=pieces.map(p=>p.bounds());
  let best={d:Infinity};
  for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++){
   const dx=Math.max(0,bounds[i].min[0]-bounds[j].max[0],bounds[j].min[0]-bounds[i].max[0]),dy=Math.max(0,bounds[i].min[1]-bounds[j].max[1],bounds[j].min[1]-bounds[i].max[1]);if(dx*dx+dy*dy>best.d)continue;
   for(const a of outlines[i])for(const b of outlines[j]){const d=(a[0]-b[0])**2+(a[1]-b[1])**2;if(d<best.d)best={d,a,b};}
  }
  if(!best.a)throw Error('Could not connect this lettering. Try shorter text.');
  const circles=[best.a,best.b].map(pt=>own(C.circle(.6,24).translate(pt)));
  result=own(result.add(own(C.hull(circles))));
 }
 throw Error('This wording creates too many separate shapes. Shorten the text.');
}
export function generateOrnament(module,fontBuffer,input){
 const p=validateOrnament(input),K=productKernel(module,p),{C,own}=K;
 try{
  const font=opentype.parse(fontBuffer);font.variation?.set({wght:700});
  const radius=p.diameter/2,scale=p.diameter/100;
  for(const char of p.line1+p.line2)if(char!==' '&&!font.charToGlyphIndex(char))throw Error(`The lettering font cannot print “${char}”. Choose another character.`);
  const circle=(r,x=0,y=0)=>own(C.circle(r,192).translate([x,y]));
  const leafy=p.frameStyle==='leafy',frame=leafy?leafyWreath(C,own,scale,p):own(circle(radius).subtract(circle(radius-3.6*scale)));
  const trim=shape=>leafy?own(shape.intersect(circle(radius-6*scale))):shape;
  const eyelet=own(circle(5,0,radius+3).subtract(circle(2.2,0,radius+3)));
  const template=ornamentArtwork(p),traced=contours=>{if(!contours?.length)return own(C.square([0,0]));let shape=own(new C(contours,'EvenOdd'));for(const delta of (['approved-clean-stencil','original-clean-stencil'].includes(template?.source)?[.08]:[.48,-.28,-.16,.16]))shape=own(shape.offset(delta,'Round',2,24));return own(shape.scale([scale,scale]));};
  if(!template)throw Error('This design needs an approved artwork template.');
  const source={profile:own(trim(traced(template.frame)).add(traced(template.etching||[]))),etching:traced(template.etching||[])};
  const motifs=own(source.profile.intersect(circle(radius))),etching=source.etching;
  const lines=[p.line1,p.line2].filter(Boolean),textSections=[];
  for(let i=0;i<lines.length;i++){
   const path=font.getPath(lines[i],0,0,40,{kerning:true}),contours=flattenPath(path.commands);
   if(!contours.length)throw Error('Enter visible lettering.');
   const raw=own(new C(contours,'NonZero')),b=raw.bounds(),w=b.max[0]-b.min[0],h=b.max[1]-b.min[1];
   const factor=Math.min((p.diameter*.88)/w,(p.centrePlate?p.diameter*(lines.length===1?.18:.15):(lines.length===1?p.diameter*.35:p.diameter*.24))/h);
   if(h*factor<6)throw Error('Lettering is too small. Shorten the line or enlarge the ornament.');
   textSections.push(own(raw.translate([-(b.max[0]+b.min[0])/2,-(b.max[1]+b.min[1])/2]).scale([factor,factor]).offset(.25*scale,'Round',2,32).translate([0,lines.length===1?0:((p.centrePlate?.1:.14)*p.diameter)*(i===0?1:-1)])));
  }
  const exactWording=!p.centrePlate&&template&&p.line1===template.wording[0]&&p.line2===template.wording[1];
  let standardText=null;
  if(exactWording){
   // Recover the whole authored script. A text-shaped difference against the
   // separate frame avoids clipping ascenders and swashes with fixed boxes.
   const raw=own(traced(template.surface).subtract(own(traced(template.frame).offset(.35*scale,'Round',2,24))).intersect(circle(radius-3.8*scale)));
   const candidate=own(raw.offset(-.3*scale,'Round',2,24).offset(.3*scale,'Round',2,24).simplify(.03*scale));
   const centre=own(C.square([p.diameter*.86,p.diameter*.7],true)),pieces=candidate.decompose().map(own),letters=pieces.filter(piece=>own(piece.intersect(centre)).area()>.2*scale*scale);
   standardText=letters.length?own(C.union(letters)):candidate;
  }

  // Fit replacement lettering inside the preserved artwork, rather than
  // erasing portions of a moon, flower or animal to make a rectangular text box.
  if(!p.centrePlate&&!exactWording&&template.frame){
   const original=own(C.union(textSections)),keepout=own(motifs.offset(.7*scale,'Round',2,24));let best=null;
   for(let size=1;size>=.55;size-=.05){for(const dy of [0,3,-3,6,-6,9,-9]){
    const candidate=own(original.scale([size,size]).translate([0,dy*scale])),overlap=own(candidate.intersect(keepout)).area();
    if(!best||overlap<best.overlap)best={size,dy,overlap};if(overlap<.1*scale*scale)break;
   }if(best.overlap<.1*scale*scale)break;}
   const bounds=original.bounds();if((bounds.max[1]-bounds.min[1])*best.size<6)throw Error('Shorten the wording to preserve the decorative artwork.');
   for(let i=0;i<textSections.length;i++)textSections[i]=own(textSections[i].scale([best.size,best.size]).translate([0,best.dy*scale]));
  }
  const text=exactWording?standardText:own(C.union(textSections)),anchors=[];
  for(const line of (p.centrePlate?[]:textSections)){const points=line.toPolygons().flat();for(const side of [-1,1]){
   const end=points.reduce((best,p)=>side*p[0]>side*best[0]?p:best,points[0]),y=Math.max(-radius*.65,Math.min(radius*.65,end[1])),outer=[side*Math.sqrt((radius-1.5*scale)**2-y*y),y],target=motifs.toPolygons().flat().filter(point=>side*(point[0]-end[0])>0).reduce((best,point)=>(point[0]-end[0])**2+(point[1]-end[1])**2<(best[0]-end[0])**2+(best[1]-end[1])**2?point:best,outer),dx=target[0]-end[0],drop=Math.min(4*scale,Math.abs(dx)*.25),dots=[];
   for(let i=0;i<=24;i++){const t=i/24,u=1-t;dots.push([u*u*u*end[0]+3*u*u*t*(end[0]+dx*.35)+3*u*t*t*(target[0]-dx*.2)+t*t*t*target[0],u*u*u*end[1]+3*u*u*t*(end[1]-drop)+3*u*t*t*(target[1]-drop)+t*t*t*target[1]]);}
   const pieces=dots.slice(1).map((point,i)=>own(C.hull([dots[i],point].map(pt=>own(C.circle(.85*scale,24).translate(pt))))));anchors.push(own(C.union(pieces)));
  }}
  // Preserve the themed interior; short joins connect it to the selected edge.
  const decoration=motifs;
  const envelope=own(C.union([circle(radius),circle(5,0,radius+3)]));
  const plate=p.centrePlate?own(C.square([p.diameter,p.diameter*(lines.length>1?.46:.28)],true).intersect(circle(radius))):null;
  const profile=own(connectedSection(C,own,exactWording?own(C.union([frame,eyelet,own(trim(traced(template.surface)).intersect(circle(radius))),...(leafy?[text]:[]),traced(template.etching||[])])):own(C.union([frame,eyelet,decoration,...(plate?[plate]:[]),text,...anchors]))).intersect(envelope));
  const engravings=own(etching.subtract(own(text.offset(.7*scale,'Round',2,32))).intersect(profile));
  const blank=own(profile.extrude(p.thickness));let full=engravings.area()>.00001?own(blank.subtract(own(engravings.extrude(.24).translate([0,0,p.thickness-.24])))):blank,inlayDepth=p.inlayLayers*.2;
  let frontText=own(C.union([text,...(exactWording?[]:anchors)]).intersect(profile));
  const cap=frontText.isEmpty()?null:own(frontText.extrude(inlayDepth).translate([0,0,p.thickness-inlayDepth]).intersect(full));
  if(p.centrePlate&&!p.ams&&!text.isEmpty()){const recess=own(text.extrude(.4).translate([0,0,p.thickness-.4]));full=own(full.subtract(recess));}
  if(p.ams&&!text.isEmpty()){
   const base=own(full.subtract(cap));
   const body=K.add('ornament-frame','ornament-body',base,[180,0,0],p.frameColour);
   const lettering=K.add('ornament-lettering','ornament-lettering',cap,[180,0,0],p.textColour);
   for(const [part,extruder]of [[body,1],[lettering,2]]){part.colourGroup='personalised-ornament';part.extruder=extruder;}
  }else K.add('ornament','ornament-body',full,[180,0,0],p.frameColour);
  const pieces=full.decompose().map(own);if(pieces.length!==1)throw Error('Ornament must be a single connected print.');
  const mesh=full.getMesh(),vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);
  // Single-colour STL uses the same face-down pose as the 3MF assembly.
  for(let i=0;i<vertices.length/3;i++){vertices[i*3]=mesh.vertProperties[i*mesh.numProp];vertices[i*3+1]=-mesh.vertProperties[i*mesh.numProp+1];vertices[i*3+2]=p.thickness-mesh.vertProperties[i*mesh.numProp+2];}
  const model=K.finish({printPlates:true,filamentColours:[p.frameColour,p.textColour],productFit:{connected:true,centrePlate:p.centrePlate,plateHeight:p.centrePlate?p.diameter*(lines.length>1?.46:.28):0,inlayDepth:p.ams&&!text.isEmpty()?inlayDepth:0,colourOverlapArea:p.ams?own(profile.subtract(frontText).intersect(frontText)).area():0,colourCoverageError:p.ams?Math.abs(own(profile.subtract(frontText).add(frontText)).area()-profile.area()):0},previewDirection:[0,-.15,1],note:`One connected ${p.centrePlate?'ornament with a solid centre plate':'openwork ornament'}. ${p.ams&&lines.length?`Flush lettering uses filament 2 in the first ${p.inlayLayers} layers (${inlayDepth.toFixed(1)} mm); the rest uses filament 1.`:(p.centrePlate?(lines.length?'Single-colour lettering is engraved into the centre plate.':'The centre plate is blank.'):'Single-colour lettering is part of the openwork silhouette.')} Hanging cord is supplied separately.`,guide:`${ornamentCollections[p.collection].name}: ${p.design}. Frame: ${leafy?ornamentEdges[ornamentEdge(p)]:'solid ring'}. Text: ${lines.join(' / ')}.\nPrint face-down as supplied on a clean plate. The front lettering and frame start together on the bed; no supports are needed. ${p.ams&&lines.length?`Open the 3MF as a project and assign frame to filament 1 and text to filament 2. The flush inlay occupies only the first ${p.inlayLayers} × 0.2 mm layers. Keep both components aligned as one object. AMS purge/waste is additional to the part estimate.`:'The single-colour STL and 3MF contain the complete connected ornament.'}\nSupply a cord or ribbon through the integral eyelet. Keep the delicate foliage and lettering free of heavy loads.\nUp to two text lines; font and all outlines are processed locally. Custom-text font: Lobster, SIL Open Font License. Preset wording uses the matching ornament artwork outlines.`});
  if(p.ams&&!text.isEmpty())for(const part of model.parts){part.x=model.parts[0].x;part.y=model.parts[0].y;}
  model.singleColourMesh={vertices,faces:new Uint32Array(mesh.triVerts)};
  model.outlineContours=own(profile.simplify(.04)).toPolygons();
  return model;
 }finally{K.dispose();}
}
