import {printerSizeText} from './printer-settings.js';
import {filamentReport} from './filament.js';
import {printerProfileImport} from './print-profile.js';
export function homeGuide(model){const p=model.settings,f=model.homeFit;return `${filamentReport(model.parts,p.kind)}
DESIGN STUDIO — ${(p.collection||'HOME & LIVING').toUpperCase()}
${p.kind}; ${p.finish} surface. Requested dimensions ${p.width} × ${p.depth} × ${p.height} mm${p.kind==='roll'?' (base dimensions; the shaft is additional)':p.kind==='soap'?' (catch-tray dimensions; retaining sides are additional)':''}.
Assembled size ${[model.width,model.depth,model.height].map(n=>n.toFixed(1)).join(' × ')} mm.

PRINTER SIZE
${printerSizeText(p)} Parts may need several plates. Arrange before slicing.
${model.parts.map(s=>`${s.name}: ${s.printSize.join(' × ')} mm`).join('\n')}

ASSEMBLY
${f.note}
${p.kind==='pill'?`Print the base bottom-down and each lid TOP-DOWN as supplied, with its guide ring upward. Labels are engraved into the top face. Day order is MON, TUE, WED, THU, FRI, SAT, SUN from left to right. ${p.pillLidStyle==='hinged'?`Each day has its own integral base/lid hinge barrels and a separate 2 mm printed pin, with ${p.clearance} mm radial clearance. Print pins HEAD-DOWN. Align one lid's central knuckle between its two base knuckles and insert that day's pin from the side. Secure only the pin head to the stationary outer base barrel with a tiny dab of adhesive; do not glue the shaft or moving central barrel. Test one hinge before printing the full set. Lids rest on the rim without locking catches; hinged lids omit the deep guide rings so they clear the rim while swinging. The preview opens lids to 110 degrees; there is no mechanical travel stop. The rear hinge allowance uses 8 mm of the requested overall depth, so the wells become shallower. Each day opens independently.`:`All guide rings enter 2.5 mm, with ${p.clearance} mm nominal clearance per side. Lift a lid at the matching finger scallop. No glue or separate hinge pins are needed. Test one lid before printing all seven. Guide rings are clearance fits, not locking or travel catches.`} These parts are not airtight or child-resistant. Follow medicine packaging storage instructions; keep away from children and bathroom moisture.`:p.kind==='roll'?`Print the base and shaft sections upright; print the top cap top-down, as supplied. Each male connector and female bore uses the same coarse 3.6 mm-pitch thread, with ${p.clearance} mm nominal clearance. Usable shaft span ${f.usableRollHeight.toFixed(1)} mm, excluding the base and cap. Roll and ballast are not supplied. Base stability is not established by digital fit checks.`:p.kind==='toothpick'?`Print the body bottom-down and lid TOP-DOWN. The opening is ${p.dispenseSize} mm in diameter. Right-hand threads use ${p.clearance} mm nominal clearance. Do not force them; test a short body first. Match the opening to the diameter of your cocktail sticks. The refill lid is not child-resistant.`:p.kind==='cotton'?`Usable pad diameter approximately ${f.insideDiameter.toFixed(1)} mm before local opening details. Lid clearance ${p.clearance} mm per side.`:'Print all parts bottom-down, open-side-up, as supplied. Separate containers and platforms lift straight out; do not glue them.'}

DRAINAGE & OPENWORK
${['soap','caddy','toothbrush'].includes(p.kind)?`${p.kind==='soap'?'The pattern applies to the removable platform. Its catch tray remains solid.':'The pattern applies to all four holder walls; the separate drip tray stays solid.'} Pattern: ${p.openwork}. Opening target ${p.openingSize} mm; floor openings are capped at 12 mm, with at least 2.4 mm webs and a solid edge frame. ${p.drainFloor?'Floor/platform drainage is enabled.':'Floor/platform is solid; water will not drain through it.'} ${p.kind!=='soap'?(p.dripTray?'A removable catch tray is included.':'No catch tray: use only where drips can drain away.') :''} Openwork may require local supports or bridging adjustments; inspect toolpaths. Empty, rinse and dry parts regularly. Solid catch-tray geometry and skin settings do not guarantee a watertight print; test on a protected surface.`:'Solid walls. These accessories do not have a water-tight seal.'}

PRINT SETTINGS
${printerProfileImport(p)}
The agreed profile remains 8% gyroid sparse infill, 2 wall loops, 3 top and 3 bottom layers. Thin walls may print solid. Palettes are preview colours only. Choose your actual material in the slicer; use suitable material for the intended temperature and cleaning conditions. These are organisers, not certified food-contact or hot-cookware products.

FIT CHECK
Geometry, connections and individual print sizes are checked digitally. Physical thread fit, drainage, strength, stability and cleaning performance require a test print. Start with one accessory or one joint before printing a set.

FILES
One STL per printable part, PRINT-SETTINGS.json and this guide in the ZIP. The 3MF contains the same parts in printing orientations with the shared profile. All dimensions and models are processed locally; only theme preference is saved.
`;}
