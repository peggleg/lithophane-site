import {printerSizeText} from './printer-settings.js';
import {profileSidecar,printerProfileImport,printerFiles} from './print-profile.js';
import {filamentReport} from './filament.js';
import {zipParts,strToU8} from './zip.js';
import {stlBytes} from './geometry.js';
export {solid3mf} from './solid-export.js';
export function clickerGuide(model){const p=model.settings;return `${filamentReport(model.parts,'clicker')}\nDESIGN STUDIO — GLUE-IN MECHANICAL CLICKER
${printerSizeText(p)}
${model.batchCount?`BATCH: ${model.batchCount} separate Pocket Pebbles (${model.parts.length} printed pieces).\nCharacters: ${model.batchCharacters.join(' ')}\nEach named folder contains one base and one cap. Duplicate characters are preserved. Arrange the 3MF objects or split them across print plates in your slicer.\n`:''}PRINTED PARTS
${model.batchCount?`Each pebble has one base and one cap; this batch contains ${model.parts.length} printed pieces.`:`One base plus one cap per button (${p.count+1} printed pieces).`} No separate deck, insert or fit-test pieces.
Base height ${model.baseHeight} mm. Closed floor ${p.floor} mm. Blind switch pockets ${p.cutout} mm square and ${p.cavity} mm deep. Individual upper wells hide the switch sides.

GLUE AND ASSEMBLY
Dry-fit your full-height MX-style switch in the square recess at the bottom of each well. The switch flange rests on the flat ledge surrounding this recess. Check body and pin clearance before gluing; pins must not bottom out.
Remove the switch. Put small dabs of plastic-compatible adhesive on the fixed lower housing sides where they contact the square pocket walls, or under its stationary flange where it meets the ledge. Refit it upright and let the adhesive fully cure according to its instructions.
Do not put glue on the moving stem, upper housing seams, cap socket, metal contacts or pocket floor. Do not glue the cap. Press the cap gently onto the cross stem after curing and confirm 4 mm of free travel. No electronics, wiring or PCB are required.

CAPS AND PRINTING
Square caps taper from 21.5 mm to 18.8 mm with rounded corners, a hollow skirt and a cross-stem socket. Print the base bottom-down and the caps open-side-down. Support the cap roofs as needed; keep the sockets clear. Start with 0.2 mm layers and inspect sliced toolpaths.
Socket cross length ${4+p.socketClearance} mm; cross thickness ${1.1+p.socketClearance} mm; insertion ${p.stemHeight} mm. Switch bodies, pins and boxed stems vary. Start with a single-button design and check your actual switch before committing to a longer base.

FILES
STL ZIP: ${model.batchCount?'one numbered folder per pebble, each containing base.stl and cap.stl, plus this guide and PRINT-SETTINGS.json':'clicker-base.stl, one named keycap STL per button, this guide and PRINT-SETTINGS.json'}. Millimetre 3MF contains the same printable objects. Preview switches are excluded. Colours are illustrative and do not assign filament. No switch or chain is included.
${printerProfileImport(p)}
Your lettering and models stay in your browser.
`;}
export function clickerStlZip(model){const files={...printerFiles(model.settings),'PRINT-SETTINGS.json':profileSidecar('clicker'),'PRINT-GUIDE.txt':strToU8(clickerGuide(model))};for(const part of model.parts)files[part.name+'.stl']=stlBytes(part.mesh);return zipParts(files);}
