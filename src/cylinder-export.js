import {solid3mf as writeSolid3mf} from './solid-export.js';
import {stlBytes} from './geometry.js';
import {zipParts,strToU8} from './zip.js';
import {profileSidecar,printerFiles,printerProfileImport,profileSummary} from './print-profile.js';
import {filamentReport} from './filament.js';
export function solid3mf(model){
 const hasCylinder=model.parts.some(part=>part.role==='cylinder');
 return writeSolid3mf(hasCylinder?model:{...model,settings:{...model.settings,kind:'cylinder-stand'}});
}
export function cylinderGuide(model){
 const p=model.settings;
 return `DESIGN STUDIO — LITHOPHANE CYLINDERS\n${p.designName||'Universal stand / fit test'}\n\n${model.note}\n\nUNIVERSAL FIT\nLED tealight: 38 mm diameter × 19 mm body height. Battery LED only.\nLocating recess: ${p.fitDiameter.toFixed(1)} mm diameter × 3 mm deep. Print the small fit cup first; change the clearance diameter if needed.\nCylinder: 90 mm maximum outer diameter, 84 mm clear internal diameter, ${p.height} mm tall. Outer locating lip: 90.6 mm internal diameter, 2 mm high. Cylinders lift straight off all eight stands.\n\nPRINTING\nPrint the open-top, open-bottom cylinder upright on its bottom band in white PLA. There is no roof or enclosed cavity. A brim may help bed adhesion; inspect the variable-thickness wall toolpaths. Print solid stands flat base down. The tripod deck prints flat underside down with short bridges over the leg sockets; legs print on their supplied broad sides. For the tripod, press the square ends fully into the sockets and secure with PLA-compatible glue.\n${profileSummary('cylinder')}\nStand / legs: ${profileSummary('cylinder-stand')}\n${printerProfileImport(p)}\n\n${model.parts.map(part=>`${part.name}: ${part.printSize.join(' × ')} mm`).join('\n')}\n\n${filamentReport(model.parts,'cylinder')}\nPANORAMA\nThe complete landscape wraps through 360 degrees without cropping. End strips are reconciled to a shared boundary; preview and exported mesh use the same periodic image. Rotation moves the image around the cylinder without changing its join. Lighting preview is illustrative.\nPlace on a level surface. Remove the cylinder to reach the LED switch.\n`;
}
export function cylinderZip(model){
 const files={...printerFiles(model.settings),'PRINT-GUIDE.txt':strToU8(cylinderGuide(model)),'PRINT-SETTINGS.json':profileSidecar('cylinder',model.settings)};
 for(const part of model.parts){files[part.name+'.stl']=stlBytes(part.mesh);files[part.name+'-settings.json']=profileSidecar(part.printKind||'cylinder',model.settings);}
 return zipParts(files);
}
