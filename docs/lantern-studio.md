# Four-postcard lantern studio

Choose **Four-postcard lantern · Bambu LED kit** in the lithophane page's Fit menu, or use its lantern card. The existing single-panel studio remains available. Each of four portrait 105 × 148 mm panels has an independent image, crop, zoom, pan, brightness, contrast and invert setting. Mouse, touch and keyboard cropping use the same image-processing functions as single-panel exports. Existing seasonal artwork is also available per face. Switching modes retains photos; Reset session releases all images, invalidates pending decodes and cancels exports.

The rotating preview uses the actual existing lantern STL geometry and flat reference photo surfaces. It is an image-placement/assembly preview, not a relief or optical simulation. The LED reference is not a printable part. Frame-colour choices are preview-only.

## Models and profiles

The frame reuses `models/bambu-led-frames/exports/lantern_*.stl` without resizing. It has four side frames, four top retainers, one 145 × 145 mm base and one top ring. All parts fit within the 170 mm A1 mini design limit. The assembled height is 177.8 mm. A recorded 59 × 8 mm LED envelope sits in a 59.6 × 8.4 mm recess with an open 5 mm cable exit; physical hardware fit, wire clearance, illumination and temperature need testing.

STL kit ZIP: four panel STLs, four unique frame STL designs (quantities in filenames), separate panel/frame settings JSON and a guide. 3MF kit ZIP: four photo projects at 4/4 skin layers and a ten-instance frame project at 3/3 layers, plus the same guide and settings. Both profiles retain 8% gyroid, 2 walls, 0.4 mm nozzle, Generic PLA, 0.2 mm layers and textured PEI. Extract the ZIP and open each 3MF separately as a Bambu project. Arrange parts across multiple plates. A separate frame-only ZIP works before any photos are supplied.

Each panel is generated at the selected physical mesh spacing. The worker builds panels sequentially and keeps chunked archive entries; a four-image memory estimate rejects oversized jobs without reducing quality. Frame and panel filament estimates use their respective shell-layer policies and exclude supports, brim and purge/waste.

## Verification

- Closed and connected meshes for ten frame instances; actual part dimensions ≤170 mm.
- Nominal assembly clearances, four panel insertion paths, upright/non-mirrored panel placement and recorded LED-seat clearance.
- Four independent photo/crop states; seasonal/current-photo reuse; actual STL and nested 3MF downloads and settings.
- Mobile overflow, touch/mouse/keyboard crop, cancellation, memory rejection and stale-image reset.
- Bambu CLI import plus desktop Open Project / Save Project checks on the actual downloaded frame and photo projects.

These are digital and slicer checks; they do not establish printed fit, strength, lighting or temperature. Test one side and the LED base first.
