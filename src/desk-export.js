import {zipParts,strToU8} from './zip.js';
import {stlBytes} from './geometry.js';
export {solid3mf} from './solid-export.js';
export function deskGuide(model){const p=model.settings;return `DESIGN STUDIO — JAPANDI DESK COLLECTION
${p.kind}; ${p.finish} finish; requested size ${p.width} × ${p.depth} × ${p.height} mm (width × depth × height).

A1 MINI PRINTING
Each finished part, including decorative ribs, fits within 170 × 170 × 170 mm. This reserves 10 mm across each axis against the A1 mini's 180 mm build volume. Check brim/support footprints and slicer keep-out areas. Multiple parts together may need separate plates; 3MF objects are laid alongside each other for arrangement, not pre-packed for your printer.
${model.parts.map(part=>`${part.name}: ${part.printSize.join(' × ')} mm in supplied printing orientation`).join('\n')}

ORIENTATION AND FIT
${p.kind==='drawers'?`Print drawer-case with its CLOSED BACK flat on the bed and its open front facing upward. The shelves print as vertical walls in this orientation; do not print the case upright with unsupported horizontal roofs. Print each drawer bottom-down, open-side-up. After printing, turn the case upright and slide drawers in from the front. A recessed finger notch is built into every front. Clearance is ${p.clearance} mm per side, including above/below; wall and shelf thickness is ${p.wall} mm. Dry-fit before finishing. Do not glue moving drawers. Print one drawer first; sliding fit, wear and tolerances require physical testing.`:p.kind==='tray'&&p.trayLayout==='boxes'?`Print the outer sorting-tray and each numbered inner-box bottom-down, open-side-up. Lift-out boxes have their own solid floors and walls. Place them in their matching row/column positions; corners are fitted to the rounded tray interior. Clearance is ${p.clearance} mm per side (twice this between adjacent boxes), with box tops 0.8 mm below the rim. Do not glue them in. Physical lift-out fit needs testing.`:p.kind==='tray'&&p.trayLayout==='open'?'Print bottom-down, open-side-up. This is an open tray without dividers or inner boxes.':'Print bottom-down, open-side-up. Internal dividers and the base are integral. No separate connectors or stand are required.'}
Use a 0.4 mm nozzle and start with 0.2 mm layers. Inspect toolpaths and supports in your slicer. Fluted/slatted detailing is solid printed geometry, not real wood. Palettes are preview colours only; choose filament yourself. For two-colour drawer sets, assign case and drawers separately in the slicer.

PROTOTYPE
Dimensions and closed meshes are checked digitally. Drawer and removable-box fit, surface finish, strength and stability have not been validated with physical prints.

FILES
One named STL per part and this guide in the ZIP. Millimetre 3MF contains the same parts in their printing orientations. No printer settings, supports or filament assignments are embedded.
All dimensions and models stay in your browser; the site saves only your theme preference.
`;}
export function deskStlZip(model){const files={'PRINT-GUIDE.txt':strToU8(deskGuide(model))};for(const p of model.parts)files[p.name+'.stl']=stlBytes(p.mesh);return zipParts(files);}
