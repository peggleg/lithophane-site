import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {finishInset} from './desk-settings.js';

export function screwDimensions(p){const radius=p.width/2-finishInset(p),neckRadius=radius-3.5;return {radius,neckRadius,threadDepth:1,pitch:3.6,turns:1.75,shoulder:p.height-12,neckHeight:9.2,roof:2.4,radialClearance:p.clearance,axialClearance:p.clearance,threadStart:1.45};}

// Closed trapezoidal ridge swept around a right-handed helix. The broad root is
// seated into the neck; the coarse flanks rise at less than 45 degrees.
export function screwRidge(module,own,fit,{female=false}={}){
 const {Manifold:M,Mesh}=module,clear=female?fit.radialClearance:0,axial=female?fit.axialClearance:0;
 const from=female?-1:0,to=female?3:fit.turns,steps=Math.ceil((to-from)*128),vertices=[],faces=[];
 const section=[[fit.neckRadius-.15, -1.4-axial],[fit.neckRadius+fit.threadDepth+clear,-.2-axial],[fit.neckRadius+fit.threadDepth+clear,.2+axial],[fit.neckRadius-.15,1.4+axial]];
 for(let i=0;i<=steps;i++){const t=from+(to-from)*i/steps,a=t*2*Math.PI,z=fit.shoulder+fit.threadStart+t*fit.pitch;for(const [r,dz]of section)vertices.push(r*Math.cos(a),r*Math.sin(a),z+dz);}
 for(let i=0;i<steps;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+(j+1)%4,d=(i+1)*4+j;faces.push(a,b,c,a,c,d);}
 faces.push(0,2,1,0,3,2);const e=steps*4;faces.push(e,e+1,e+2,e,e+2,e+3);
 // The section is counter-clockwise in radial/height coordinates; reverse the
 // mesh so its signed volume is positive with the helix's angular direction.
 for(let i=0;i<faces.length;i+=3)[faces[i+1],faces[i+2]]=[faces[i+2],faces[i+1]];
 return own(new M(new Mesh({numProp:3,vertProperties:new Float32Array(vertices),triVerts:new Uint32Array(faces)})));
}
export function makeScrewContainer(module,own,p,ribs,add,fontBuffer){
 const {CrossSection:C,Manifold:M}=module,f=screwDimensions(p),cylinder=(r,h,z=0)=>own(C.circle(r,128).extrude(h).translate([0,0,z]));
 const neckTop=f.shoulder+f.neckHeight,inside=f.neckRadius-p.wall;
 let body=own(M.union([ribs(cylinder(f.radius,f.shoulder),2*f.radius,2*f.radius,f.shoulder),cylinder(f.neckRadius,f.neckHeight+.02,f.shoulder-.02),screwRidge(module,own,f)]));
 const cavity=own(M.union([cylinder(f.radius-p.wall,f.shoulder-3.5-p.wall+.02,p.wall),own(M.cylinder(3.5,f.radius-p.wall,inside,128).translate([0,0,f.shoulder-3.5])),cylinder(inside,f.neckHeight+.1,f.shoulder)]));
 body=own(body.subtract(cavity));add('screw-container','screw-body',body,[0,0,0]);
 let lid=ribs(cylinder(f.radius,12),2*f.radius,2*f.radius,12);
 // Work in the assembled coordinates to share precisely the same thread phase.
 const lidFit={...f,shoulder:0};
 const bore=cylinder(f.neckRadius+f.radialClearance,f.neckHeight+f.axialClearance+.1,-.1);
 // Stop the thread cutter at the cavity ceiling; the extended helix must
 // never cut a directional groove through the closed top of the lid.
 const threadLimit=cylinder(f.radius+2,f.neckHeight+f.axialClearance+.1,-.1);
 const thread=own(screwRidge(module,own,lidFit,{female:true}).intersect(threadLimit));
 lid=own(lid.subtract(own(bore.add(thread))));
 // Top-down prints a closed roof first and the open thread cavity above it.
 lid=own(lid.rotate([180,0,0]).translate([0,0,12]));
 if(p.lidText){
  if(!fontBuffer)throw Error('The lid lettering font could not be loaded. Retry or clear the lid text.');
  const font=opentype.parse(fontBuffer);for(const ch of p.lidText)if(!font.charToGlyphIndex(ch)&&ch!==' ')throw Error('Lid text contains a character this font cannot print.');
  const commands=[];let pen=0;for(const ch of p.lidText){const g=font.charToGlyph(ch);commands.push(...g.getPath(pen,0,12).commands);pen+=g.advanceWidth*12/font.unitsPerEm;}const contours=flattenPath(commands);if(!contours.length)throw Error('Enter visible lid text or leave the field empty.');
  const section=own(new C(contours,'NonZero')),b=section.bounds(),scale=Math.min(1,(2*f.radius-12)/(b.max[0]-b.min[0]),(f.radius*.8)/(b.max[1]-b.min[1]));
  if(12*scale<5)throw Error('Lid text would be too small. Shorten it or enlarge the diameter.');
  const centred=own(section.translate([-(b.min[0]+b.max[0])/2,-(b.min[1]+b.max[1])/2]).scale([scale,-scale]));
  // Engrave the top (bed side) so the lid retains its support-free orientation.
  lid=own(lid.subtract(own(centred.extrude(.6))));
 }
 add('screw-lid','screw-lid',lid,[0,0,p.height],[Math.PI,0,0]);
 return {...f,insideDiameter:2*inside,usableHeight:neckTop-p.wall};
}
