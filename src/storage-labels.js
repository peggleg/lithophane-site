import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {labelAt} from './cupboard-options.js';
export const labelHeight=12;
export const labelWidth=width=>Math.min(48,width-14);
export function textShape(module,own,text,width,height,fontBuffer,flip){
 if(!text)return null;if(!fontBuffer)throw Error('The label font could not be loaded. Retry or clear the text.');
 const font=opentype.parse(fontBuffer),commands=[];let pen=0;
 for(const ch of text){if(ch!==' '&&!font.charToGlyphIndex(ch))throw Error('A label contains a character this font cannot print.');const g=font.charToGlyph(ch);commands.push(...g.getPath(pen,0,12).commands);pen+=g.advanceWidth*12/font.unitsPerEm;}
 const curves=flattenPath(commands);if(!curves.length)return null;const section=own(new module.CrossSection(curves,'NonZero')),b=section.bounds(),scale=Math.min((width-4)/(b.max[0]-b.min[0]),(height-4)/(b.max[1]-b.min[1]));
 if((b.max[1]-b.min[1])*scale<4)throw Error('Label text would be smaller than 4 mm. Shorten the label or enlarge the item.');
 return own(section.translate([-(b.min[0]+b.max[0])/2,-(b.min[1]+b.max[1])/2]).scale([scale,flip?scale:-scale]));
}
export function makeStorageLabel(module,own,p,kind,index,width,fontBuffer){
 const mode=kind==='cupboard'?p.cupboardLabels:p.drawerLabels;if(mode==='none')return null;const {CrossSection:C}=module,w=labelWidth(width),h=labelHeight,text=labelAt(p,kind,index);
 if(w<22)throw Error('This front is too narrow for a label. Enlarge the cupboard or reduce drawer columns.');
 const face=own(own(C.square([w-2,h-2],true)).offset(1,'Round',2,24));
 if(mode==='engraved'){const lettering=textShape(module,own,text,w,h,fontBuffer,false);return {mode,width:w,height:h,keep:face,cut:lettering?own(lettering.extrude(.6)):null};}
 const insert=own(own(C.square([w-2*p.clearance-1,h-2*p.clearance-1],true)).offset(.5,'Round',2,24));let solid=own(insert.extrude(.8));const lettering=textShape(module,own,text,w-2*p.clearance,h-2*p.clearance,fontBuffer,true);
 if(lettering)solid=own(solid.subtract(own(lettering.extrude(.5).translate([0,0,.4]))));
 return {mode,width:w,height:h,keep:face,cut:own(face.extrude(1.02)),insert:solid,text};
}
