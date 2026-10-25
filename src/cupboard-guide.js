import {filamentReport} from './filament.js';import {printProfileImport} from './print-profile.js';
export function cupboardGuide(model){const p=model.settings,f=model.cupboardFit;return `${filamentReport(model.parts,p.kind)}
DESIGN STUDIO — MODULAR CUPBOARD
Closed width ${p.width} mm including hinges; ${p.cupboardColumns} columns × ${p.cupboardRows} modules high. Each module is ${p.height} mm high; connected height ${f.height} mm. Requested depth ${p.depth} mm; rear clips add 2.4 mm. Each module column is ${f.caseWidth.toFixed(1)} mm wide.
Single door, ${p.hingeSide} hinges. Surface ${p.finish}; openwork ${p.openwork}, target opening size ${p.openingSize} mm.

PRINTABLE PARTS / A1 MINI
Every part, including integral hinge barrels, fits within 170 × 170 × 170 mm. The assembled cupboard can be taller than the printer. Multiple plates are needed; arrange parts in your slicer.
${model.parts.map(s=>`${s.name}: ${s.printSize.join(' × ')} mm${s.assemblyHidden?' (spare connector; shown only in printing-orientations view)':''}`).join('\n')}

CASE ASSEMBLY
Print each case on its CLOSED BACK, open front upward, as supplied. Side walls and any floor/top print vertically in this orientation. Integral hinge barrels print with small horizontal bores; inspect bridges and local supports.
Floors: ${p.cupboardFloor}; tops: ${p.cupboardTop}. Automatic gives one floor at the bottom and one top at the top of each connected column, with no intermediate horizontal shelves. Every-module overrides add that face to each module; none removes it everywhere. Actual faces: ${f.modules.map(v=>`r${v.row+1}/c${v.col+1} floor=${v.floor} top=${v.top}`).join('; ')}.
Each cupboard column has a single door and a full-width interior without a centre divider. Front stiles and magnet mounts have tapered support webs for the supplied back-down orientation.
Match width per column, depth, wall thickness, module height, door layout and clearance across files. Align the labelled modules before installing rear snap clips. Each clip has two split studs on long in-plane spring arms, one through each adjoining case's rear hole. Push from the back until both shoulders seat inside. To release, support the modules, open the doors, squeeze the split studs from inside and push them back out. Clips require printed flex; do not force brittle material. Internal vertical/side joins include clips automatically. Extra ports (${p.cupboardPorts}) and spare keys allow later additions. These are small desktop storage modules, not load-rated furniture; do not lift a loaded stack by its doors or clips. Check stability and securing needs for a tall arrangement.

DOORS / HINGES
Door barrels are integral with each door panel; case barrels are integral with the case. Pins are separate replaceable printed parts: ${f.pinDiameter} mm round shafts, ${f.boreDiameter.toFixed(1)} mm nominal circular clearance with a print-friendly teardrop roof. Print pins head-down and panels in their supplied flat orientation. Small face grooves, enclosed splice channels and horizontal hinge bores need toolpath/bridge inspection. Supports start off; enable them locally only when required.
For each column/leaf, assemble ALL labelled door panels flat before fitting to the cases. Put the two dovetail splice keys halfway into the closed-ended rear tunnels of the lower panel, then slide the next panel onto the exposed halves. Keys join the panels behind the face, so the complete tall door moves as one. Keys cannot slide through the closed inner ends. Keep all splice joints aligned and do not glue the hinges.
Present the complete door to the matching case barrels, align the alternating knuckles, then insert each printed pin HEAD UP from above. The head rests above the upper case knuckle. Pins are gravity retained and can be removed upward; keep access to them. Fit each printed pull with its T-head aligned to the rectangular door slot, then turn it a quarter-turn so the face groove is vertical. The T-head retains it behind the door without forcing a short snap stem. Turn back to horizontal to remove. Flex catches and receivers are integral, with a release slot behind each catch beam. Gently press the free edge to close. Doors stop at approximately 110 degrees. Do not force any door past its stop. The preview uses the same hinge axes and opening angle.
${p.doorMagnets?'OPTIONAL MAGNETS: paired 6.2 mm pockets accept separately supplied nominal 6 × 2 mm discs. Check printed pocket fit and opposing polarity before gluing. Recesses are on the inside of the door and matching case pad. Keep magnets secured and inaccessible to children.':'No magnet pockets are included. Printed catches hold the doors closed.'}

PRINT SETTINGS
${printProfileImport}
All cupboard parts retain 8% gyroid sparse infill, 2 wall loops, 3 top and 3 bottom layers. No profile exception is required. Preview colours do not assign filament. The estimate excludes ballast, magnets, supports, brim, purge and waste.

FIT AND USE
Closed meshes, nominal assembled clearances, hinge travel and size limits are checked digitally. Physical snap retention, catch flex, pin fit, splice stiffness, strength and stack stability need printed tests. Print one module, one hinge and one connector before committing to a large set. Openwork can release small contents and reduces stiffness; floors and tops selected above stay solid.

FILES
STL ZIP contains every named printable part, this guide and PRINT-SETTINGS.json. The 3MF contains the same meshes in printing orientations with the shared Bambu profile. Models remain in your browser.
`;}
export const drawerConnectorGuide=p=>p.kind==='drawers'&&p.drawerConnectors!=='none'?`REAR LOCKING CONNECTORS: ${p.drawerConnectors}. Holes and split-stud snap clips supplement the locating feet and pockets. Print clips flat, bridge on the bed, studs upward. Drawers are 2.4 mm shorter to clear the internal stud heads. Remove drawers before pressing clips from the rear or squeezing studs from inside to release. Match width, depth, drawer-row count, wall and connector settings between units. For vertical connections retain locating-pocket tops below; the existing feet seat 1.2 mm into the unit below, giving unit pitch height minus 1.2 mm. Side-by-side units sit at the same height. Spare clips appear only in the printing-orientations preview, but are included in downloads and gram estimates. Printed retention and stack stability require physical testing.\n`:'';
