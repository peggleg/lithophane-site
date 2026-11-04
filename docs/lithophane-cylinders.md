# Lithophane cylinders

The `/cylinders/` studio starts with two purpose-made panoramic designs each for Christmas, Easter, Halloween, Valentine’s Day, New Year, Mother’s Day, Father’s Day and Thanksgiving. Dated additions in `src/cylinder-additions.json` accumulate without replacing the original catalogue. Three more Christmas panoramas were added on 3 November 2026. Existing flat lithophane artwork and catalogue entries are unchanged. The scheduled gallery task also covers the cylinder collection; its timing is managed separately from the site.

The 90 mm cylinder is open at both ends. Its internal diameter is 84 mm; the image varies the outer wall from 0.8 to 3 mm by default. Height is 70–150 mm, with a 94 mm default. Explicit axial rings preserve the 3 mm bottom seating band and the tapered top rim at every mesh spacing. Angular indices wrap directly without a disconnected mesh boundary. All geometry uses millimetres.

Panoramas are landscape throughout. Each holiday source atlas contains two 3:1 scenes. `cylinder-texture.js` overlaps and crossfades the end strips without mirroring or stretching texture columns. The raster endpoints sample the same point in the overlap. The panorama download, seam inspection and mesh use this periodic processing. `cylinder-artwork-sources.json` records the new artwork's provenance and scene descriptions. Visitor data is not uploaded or stored.

## Universal stands

Four desktop stands: Everyday pedestal, Christmas woodland, Autumn leaves and Spring blossom. Four elevated stands: Stepped plinth, Classic pedestal, Three-leg stand and Winter woodland pedestal. Decoration is outside the common mating area.

All stands share a 90.6 mm internal locating lip, 2 mm high, around the 90 mm cylinder. The central battery LED tealight recess defaults to 39 mm diameter and 3 mm depth for the user's 38 mm diameter × 19 mm body height tealight. Recess diameter is adjustable from 38.2 to 40 mm and applies to the stand and fit cup together. The small cup is 5 mm high with a 2 mm floor. Default files are also saved in `models/cylinders/tealight-fit-39mm.stl` and `models/cylinders/tealight-fit-39mm.3mf` (A1 mini Bambu project).

Solid stands print flat base down. The tripod uses a separate deck and three broad-side-printed legs with tapered square pegs and the existing 10.4 mm underside sockets. The default peg is 10.4 mm at its shoulder, tapering to 10.0 mm at its tip. Pegs insert 3.8 mm into the 4 mm-deep sockets, leaving 0.2 mm roof clearance. The deck prints underside down; the socket roofs bridge 10.4 mm. Set Tripod peg width using the joint test, then seat the leg shoulders against the plate by hand. The open-bottom cylinder lifts off to access the LED switch.

## Exports and profiles

Downloads include a full STL ZIP, stand-only STL ZIP and Bambu 3MF, individual fit-cup STL and Bambu 3MF, panorama PNG, print guide and complete Bambu 3MF. A1 mini is the default; the optional 256 mm selection uses Bambu A1 settings. Parts are checked in their printing orientations and packed on non-overlapping plates. Cylinders use shared 8% gyroid / 2 walls / 4 top and bottom layers; stand parts override skins to the shared 3/3 policy. STL ZIPs carry individual settings sidecars. 3MF preserves the Bambu recognition markers, complete machine/PLA profile, zero minimum shell thickness, desktop inheritance delta and per-object stand settings.

## Validation

- `node --test test/cylinders.test.js` checks connected and manifold meshes, both printer sizes, the shared LED clearance, the fit cup dimensions, open annular cylinder sections, fixed seating band, periodic texture, rejected inputs and per-part export settings.
- `npm run test:cylinders` checks every catalogue panorama, all eight stands, ten downloads on both printers, lit/unlit and print-parts views, clearance changes, rotation, mobile themes, cancellation and reset. It saves wrapped previews and join close-ups under `artifacts/cylinders/`.
- `BAMBU_STUDIO_PATH=... npm run test:cylinders-native` imports both printers' cylinder and stand projects into the official slicer, then slices both cylinder kits, all eight A1 mini stands and the fit cup. Native outputs contain plate G-code.
- The existing shared profile import check, catalogue preservation tests, site navigation checks, preview checks and production/preview builds also run.
- Desktop Open Project / Save Project is checked with `scripts/check-bambu-desktop.py` against the native fixtures. Results are retained under `artifacts/cylinders/desktop/`.

Digital fit and toolpaths do not establish physical fit or light quality. Print the small cup with the intended filament and printer before committing to the complete stands. This internal validation note records that limit; the product UI provides fit-test and assembly instructions.

Stand-only and fit-cup Bambu projects use the shared lightweight 3/3 skin profile as the project default, retain the selected printer and contain only the requested parts. Full kits keep the cylinder 4/4 profile and stand object overrides.

## Additive cylinder artwork

Discover collections and entries in `src/cylinder-catalogue.js`, with dated additions appended to `src/cylinder-additions.json`. `src/cylinder-artwork.js` resolves assets and reconciles the wrap boundary. Each entry supplies its own asset, row and row count (1 for an individual panorama, 2 for the original two-row atlases). Never append extra names to an existing atlas or change its row count/crops. Use a new asset and entry instead. Preservation fixtures protect every original ID, image byte and the existing periodic texture implementation. The browser test derives its expected IDs from the catalogue and saves full panoramas, wrapped views and join close-ups for inspection.

## Stand presentation

Stand thumbnails are 640 × 480 WebP renders of the actual printable meshes, using the same room lighting, crease-aware surface normals and blurred contact shadows as the interactive preview. Regenerate them with `node scripts/render-cylinder-stand-thumbnails.mjs` while Vite runs on port 4176. Selecting a stand opens the stand-only preview; selecting a landscape returns to the assembled lamp. The Stand only checkbox also works with Print parts to inspect the tripod deck and legs. Preview shading and thumbnail generation do not change exported meshes.

## Tripod fit correction

A reported physical print had loose legs with the original 10 mm pegs in 10.4 mm sockets. The sockets, plate body, LED recess and cylinder seat are unchanged; Boolean comparison with the previous deck gives zero symmetric-difference volume. Replacement legs use an adjustable tapered peg (10.2–10.8 mm shoulder width, 0.4 mm narrower tip). Leg body thickness matches the peg shoulder so the main broad face sits flat on the print bed.

The tripod joint-test Bambu project contains the actual-size socket block and three short test pins in nearby sizes around the selected width (10.3, 10.4 and 10.5 mm by default, kept within the adjustment range). One, two and three raised ridges identify the pins and corresponding holes. Print at 100% scale in the supplied orientation, with the intended filament. Try the pins in the test block or existing plate, choose the smallest width that holds firmly and seats by hand, and use that value for the replacement-legs-only Bambu download. No physical retention measurement has been performed here; the fit test is the next print check.

The user measured 9.9 mm printed pegs and 10.2 mm printed holes on the original parts. The replacement default is therefore 10.4 mm nominal at the shoulder: assuming the same 0.1 mm peg undersizing, this targets approximately 10.3 mm printed width against the measured 10.2 mm hole. The test pins bracket this starting value; choose the fit from the physical test rather than treating the dimensional estimate as a retention measurement.

Validation for the measured-fit correction: `node --test test/tripod-fit.test.js`, `npm run test:tripod-fit`, and `BAMBU_STUDIO_PATH=... npm run test:tripod-fit-native`. Native fixtures are saved under `artifacts/cylinders/tripod-fit/native/` for desktop open/save checks. Default Bambu projects for both printers are also stored under `models/cylinders/tripod-joint-test-*.3mf` and `models/cylinders/tripod-replacement-legs-*.3mf`.
