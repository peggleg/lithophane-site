import {filamentReport} from './filament.js';
import {printProfileImport} from './print-profile.js';
export function homeGuide(model){const p=model.settings,f=model.homeFit;return `${filamentReport(model.parts,p.kind)}
DESIGN STUDIO — ${(p.collection||'HOME & LIVING').toUpperCase()}
${p.kind}; ${p.finish} surface. Requested dimensions ${p.width} × ${p.depth} × ${p.height} mm${p.kind==='roll'?' (base dimensions; the shaft is additional)':p.kind==='soap'?' (catch-tray dimensions; retaining sides are additional)':''}.
Assembled size ${[model.width,model.depth,model.height].map(n=>n.toFixed(1)).join(' × ')} mm.

A1 MINI
Every printable part is checked within 170 × 170 × 170 mm, including surface detail. This leaves allowance within the 180 mm build volume; brim, supports and keep-out areas must still fit. Parts may need several plates. Arrange before slicing.
${model.parts.map(s=>`${s.name}: ${s.printSize.join(' × ')} mm`).join('\n')}

ASSEMBLY
${f.note}
${p.kind==='roll'?`Print the base and shaft sections upright; print the top cap top-down, as supplied. Each male connector and female bore uses the same coarse 3.6 mm-pitch thread, with ${p.clearance} mm nominal clearance. Usable shaft span ${f.usableRollHeight.toFixed(1)} mm, excluding the base and cap. Roll and ballast are not supplied. Base stability is not established by digital fit checks.`:p.kind==='toothpick'?`Print the body bottom-down and lid TOP-DOWN. The opening is ${p.dispenseSize} mm in diameter. Right-hand threads use ${p.clearance} mm nominal clearance. Do not force them; test a short body first. Match the opening to the diameter of your cocktail sticks. The refill lid is not child-resistant.`:p.kind==='cotton'?`Usable pad diameter approximately ${f.insideDiameter.toFixed(1)} mm before local opening details. Lid clearance ${p.clearance} mm per side.`:'Print all parts bottom-down, open-side-up, as supplied. Separate containers and platforms lift straight out; do not glue them.'}

DRAINAGE & OPENWORK
${['soap','caddy','toothbrush'].includes(p.kind)?`${p.kind==='soap'?'The pattern applies to the removable platform. Its catch tray remains solid.':'The pattern applies to all four holder walls; the separate drip tray stays solid.'} Pattern: ${p.openwork}. Opening target ${p.openingSize} mm; floor openings are capped at 12 mm, with at least 2.4 mm webs and a solid edge frame. ${p.drainFloor?'Floor/platform drainage is enabled.':'Floor/platform is solid; water will not drain through it.'} ${p.kind!=='soap'?(p.dripTray?'A removable catch tray is included.':'No catch tray: use only where drips can drain away.') :''} Openwork may require local supports or bridging adjustments; inspect toolpaths. Empty, rinse and dry parts regularly. Solid catch-tray geometry and skin settings do not guarantee a watertight print; test on a protected surface.`:'Solid walls. These accessories do not have a water-tight seal.'}

PRINT SETTINGS
${printProfileImport}
The agreed profile remains 8% gyroid sparse infill, 2 wall loops, 3 top and 3 bottom layers. Thin walls may print solid. Palettes are preview colours only. Choose your actual material in the slicer; use suitable material for the intended temperature and cleaning conditions. These are organisers, not certified food-contact or hot-cookware products.

FIT CHECK
Geometry, connections and individual print sizes are checked digitally. Physical thread fit, drainage, strength, stability and cleaning performance require a test print. Start with one accessory or one joint before printing a set.

FILES
One STL per printable part, PRINT-SETTINGS.json and this guide in the ZIP. The 3MF contains the same parts in printing orientations with the shared profile. All dimensions and models are processed locally; only theme preference is saved.
`;}
