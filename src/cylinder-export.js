import {solid3mf as writeSolid3mf} from './solid-export.js';
import {stlBytes} from './geometry.js';
import {zipParts,strToU8} from './zip.js';
import {profileSidecar,printerFiles,printerProfileImport,profileSummary} from './print-profile.js';
import {filamentReport} from './filament.js';
export function cylinderOnly(model){
 const parts=model.parts.filter(part=>part.role==='cylinder');
 if(parts.length!==1)throw Error('The cylinder is not available for download.');
 return {...model,parts};
}
export function solid3mf(model){
 const hasCylinder=model.parts.some(part=>part.role==='cylinder');
 return writeSolid3mf(hasCylinder?model:{...model,settings:{...model.settings,kind:'cylinder-stand'}});
}
export function cylinderGuide(model){
 const p=model.settings,kit=p.lightSource==='bambu001';
 return `DESIGN STUDIO — LITHOPHANE CYLINDERS\n${p.designName||'Universal stand / fit test'}\n\n${model.note}\n\nUNIVERSAL FIT\n${kit?'Bambu LED Kit 001: 59 mm diameter × 8 mm high. Recess: '+p.fitDiameter.toFixed(1)+' mm diameter × 5 mm deep; the light projects 3 mm above the deck. Route the cable through the open 5 mm radial channel.':'LED tealight: 38 mm diameter × 19 mm body height. Battery LED only. Locating recess: '+p.fitDiameter.toFixed(1)+' mm diameter × 3 mm deep.'} Print the small fit cup first; change the clearance diameter if needed.\nCylinder: 90 mm maximum outer diameter, 84 mm clear internal diameter, ${p.height} mm tall. Outer locating lip: 90.6 mm internal diameter, 2 mm high. Cylinders lift straight off all eight stands.\n\nPRINTING\nPrint the open-top, open-bottom cylinder upright on its bottom band in white PLA. There is no roof or enclosed cavity. A brim may help bed adhesion; inspect the variable-thickness wall toolpaths. Print solid stands flat base down. The tripod deck prints flat underside down with short bridges over the leg sockets; legs print on their supplied broad sides. For the tripod, print the joint test first and choose the smallest tapered peg that holds firmly and seats by hand. Set Tripod peg width to the chosen value. Replacement legs fit the existing 10.4 mm nominal sockets. Seat the leg shoulders against the underside of the deck; do not force a tight fit. Keep 100% scale and the supplied broad-side leg orientation.\n${profileSummary('cylinder')}\nStand / legs: ${profileSummary('cylinder-stand')}\n${printerProfileImport(p)}\n\n${model.parts.map(part=>`${part.name}: ${part.printSize.join(' × ')} mm`).join('\n')}\n\n${filamentReport(model.parts,'cylinder')}\nPANORAMA\nThe complete landscape wraps through 360 degrees without cropping. End strips are reconciled to a shared boundary; preview and exported mesh use the same periodic image. Rotation moves the image around the cylinder without changing its join. Lighting preview is illustrative.\nPlace on a level surface. ${kit?'Route the cable without pinching and follow the LED kit manufacturer’s guidance.':'Remove the cylinder to reach the LED switch.'}\n`;
}
export function cylinderZip(model){
 const files={...printerFiles(model.settings),'PRINT-GUIDE.txt':strToU8(cylinderGuide(model)),'PRINT-SETTINGS.json':profileSidecar('cylinder',model.settings)};
 for(const part of model.parts){files[part.name+'.stl']=stlBytes(part.mesh);files[part.name+'-settings.json']=profileSidecar(part.printKind||'cylinder',model.settings);}
 return zipParts(files);
}
