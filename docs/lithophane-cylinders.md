# Lithophane cylinders

The `/cylinders/` studio adds 16 purpose-made panoramic designs: two each for Christmas, Easter, Halloween, Valentine’s Day, New Year, Mother’s Day, Father’s Day and Thanksgiving. Existing flat lithophane artwork and catalogue entries are unchanged. The schedule has not been modified.

The 90 mm cylinder is open at both ends. Its internal diameter is 84 mm; the image varies the outer wall from 0.8 to 3 mm by default. Height is 70–150 mm, with a 94 mm default. Explicit axial rings preserve the 3 mm bottom seating band and the tapered top rim at every mesh spacing. Angular indices wrap directly without a disconnected mesh boundary. All geometry uses millimetres.

Panoramas are landscape throughout. Each holiday source atlas contains two 3:1 scenes. `cylinder-texture.js` overlaps and crossfades the end strips without mirroring or stretching texture columns. The raster endpoints sample the same point in the overlap. The panorama download, seam inspection and mesh use this periodic processing. `cylinder-artwork-sources.json` records the new artwork's provenance and scene descriptions. Visitor data is not uploaded or stored.

## Universal stands

Four desktop stands: Everyday pedestal, Christmas woodland, Autumn leaves and Spring blossom. Four elevated stands: Stepped plinth, Classic pedestal, Three-leg stand and Winter woodland pedestal. Decoration is outside the common mating area.

All stands share a 90.6 mm internal locating lip, 2 mm high, around the 90 mm cylinder. The central battery LED tealight recess defaults to 39 mm diameter and 3 mm depth for the user's 38 mm diameter × 19 mm body height tealight. Recess diameter is adjustable from 38.2 to 40 mm and applies to the stand and fit cup together. The small cup is 5 mm high with a 2 mm floor. A default STL is also saved in `models/cylinders/tealight-fit-39mm.stl`.

Solid stands print flat base down. The tripod uses a separate deck and three broad-side-printed legs with 10 mm square end pegs and 10.4 mm underside sockets. The deck prints underside down; the socket roofs bridge 10.4 mm. Legs seat 4 mm deep and are secured with PLA-compatible glue. The open-bottom cylinder lifts off to access the LED switch.

## Exports and profiles

Downloads include a full STL ZIP, stand-only STL ZIP, individual fit-cup STL, panorama PNG, print guide and complete Bambu 3MF. A1 mini is the default; the optional 256 mm selection uses Bambu A1 settings. Parts are checked in their printing orientations and packed on non-overlapping plates. Cylinders use shared 8% gyroid / 2 walls / 4 top and bottom layers; stand parts override skins to the shared 3/3 policy. STL ZIPs carry individual settings sidecars. 3MF preserves the Bambu recognition markers, complete machine/PLA profile, zero minimum shell thickness, desktop inheritance delta and per-object stand settings.

## Validation

- `node --test test/cylinders.test.js` checks connected and manifold meshes, both printer sizes, the shared LED clearance, the fit cup dimensions, open annular cylinder sections, fixed seating band, periodic texture, rejected inputs and per-part export settings.
- `npm run test:cylinders` checks all 16 panoramas, all eight stands, six downloads on both printers, lit/unlit and print-parts views, clearance changes, rotation, mobile themes, cancellation and reset. It saves wrapped previews and join close-ups under `artifacts/cylinders/`.
- `BAMBU_STUDIO_PATH=... npm run test:cylinders-native` imports both printers' cylinder and stand projects into the official slicer, then slices both cylinder kits, all eight A1 mini stands and the fit cup. Native outputs contain plate G-code.
- The existing shared profile import check, catalogue preservation tests, site navigation checks, preview checks and production/preview builds also run.
- Desktop Open Project / Save Project is checked with `scripts/check-bambu-desktop.py` against the native fixtures. Results are retained under `artifacts/cylinders/desktop/`.

Digital fit and toolpaths do not establish physical fit or light quality. Print the small cup with the intended filament and printer before committing to the complete stands. This internal validation note records that limit; the product UI provides fit-test and assembly instructions.
