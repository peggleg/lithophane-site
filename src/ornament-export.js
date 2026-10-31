import {solid3mf} from './solid-export.js';
import {stlBytes} from './geometry.js';
import {zipParts,strToU8} from './zip.js';
import {profileSidecar,printerFiles,printerProfileImport} from './print-profile.js';
import {filamentReport} from './filament.js';
export {solid3mf};
export function ornamentGuide(model){return `DESIGN STUDIO — PERSONALISED ORNAMENT\n${model.guide}\n\n${filamentReport(model.parts,'ornament')}\n${model.settings.ams?printerProfileImport(model.settings).replace('Preview colours do not assign colour changes. ',''):printerProfileImport(model.settings)}\n${model.settings.ams?'AMS colour assignments ARE stored in this ornament 3MF. The full ornament STL is single-colour; use the aligned AMS body/lettering files or the project for two colours.':''}\n${model.parts.map(p=>p.name+': '+p.printSize.join(' × ')+' mm').join('\n')}\n`;}
export function ornamentZip(model){const files={...printerFiles(model.settings),'PRINT-SETTINGS.json':profileSidecar('ornament',model.settings),'PRINT-GUIDE.txt':strToU8(ornamentGuide(model)),'ornament-single-colour.stl':stlBytes(model.singleColourMesh)};if(model.settings.ams)for(const p of model.parts)files['AMS-aligned/'+p.name+'.stl']=stlBytes(p.mesh);return zipParts(files);}
