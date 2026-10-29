import {filamentReport} from './filament.js';
import {profileSidecar,printerFiles,printerProfileImport} from './print-profile.js';
import {printerSizeText} from './printer-settings.js';
import {stlBytes} from './geometry.js';
import {zipParts,strToU8} from './zip.js';
import {productItems} from './product-settings.js';
export {solid3mf} from './solid-export.js';
export function productGuide(model){return `${filamentReport(model.parts,model.settings.kind)}\nDESIGN STUDIO — ${productItems[model.settings.kind].name}\n${printerSizeText(model.settings)}\n\n${model.guide}\n\nPARTS\n${model.parts.map(p=>`${p.name}: ${p.printSize.join(' × ')} mm`).join('\n')}\n\nPRINT PROJECT\n${printerProfileImport(model.settings)}\nPreview desk surfaces and other context objects are not printable parts and are excluded from estimates. Nominal fit and closed geometry are checked digitally; inspect your printed fit before loading accessories.\n`;}
export function productZip(model){const files={...printerFiles(model.settings),'PRINT-SETTINGS.json':profileSidecar(model.settings.kind,model.settings),'PRINT-GUIDE.txt':strToU8(productGuide(model))};for(const p of model.parts)files[p.name+'.stl']=stlBytes(p.mesh);return zipParts(files);}
