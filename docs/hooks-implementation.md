# Approved hooks implementation

Scope: 21 categories, five designs each, the approved compact render boards, 1–5 hooks, mixed designs, individual mounts and modular shared rails, screw fixings or optional adhesive-pad recesses, separate colour pieces by default and optional AMS. Hide and disable Pets/Reading/Photography pages. Preserve unrelated work and existing printer settings. Commit and push each category separately to preview/lithophane.

## Construction

A continuous structural core carries hook loads. Decorative fitted inserts locate in shallow recesses and glue in; AMS uses exact adjoining colour regions instead. Shared mount uses a broad closed-top dovetail and integral releasable retention leaf; no separate locking pins. Long rails use short individually wall-fixed modules and integral alignment laps. All parts fit the selected printer. Reinforced 30% gyroid, four walls, five top/bottom skins. A1 mini default; optional A1 256 mm. Rounded contact surfaces, short hook reach. No numerical load rating.

## Release checklist for each category

- Five distinct authored designs, rendered from actual printable meshes.
- Closed positive-volume physical parts, mating clearance, mount engagement, 1–5 mixed layouts and printer limits.
- Separate-colour and AMS exports; complete Bambu projects, native import/slicing and desktop profile roundtrip.
- Browser controls, downloads, stale-file prevention, responsive layout.
- Commit and publish category; check deployment.

## Categories

- [x] Pets + shared mounts/editor + hide retired sections
- [ ] Woodland
- [ ] Ocean
- [ ] Dinosaurs & Dragons
- [ ] Garden
- [ ] Space
- [ ] Transport
- [ ] Minimal & Sculptural
- [ ] Hobbies
- [ ] Safari
- [ ] Farmyard
- [ ] Birds
- [ ] Bugs & Little Creatures
- [ ] Fantasy & Fairytales
- [ ] Weather & Rainbows
- [ ] Mountains & Outdoors
- [ ] Seaside & Nautical
- [ ] Food & Sweet Treats
- [ ] Robots & Little Monsters
- [ ] Personalised Names
- [ ] Architecture

## Working validation notes

- All 21 category artwork modules have been drafted; only categories imported by `src/hooks/catalogue.js` are exposed in the site. Stage and commit category modules individually, not the entire draft directory.
- Pets uses sculpted ellipsoid faces, rounded silhouette profiles and seated colour inserts. These were refined after inspecting actual browser mesh screenshots, not substituted with the generated appearance renders.
- Floating face inserts are prevented with connected seat pedestals. The mounting dovetail is re-cut after adding those seats so added material cannot fill the clearance.
- Zero-volume float32 CSG shards are removed when serialising; substantive disconnected parts cause generation to fail. Every physical body and separate insert must remain connected.
- AMS packing reserves a full side strip for its variable-depth prime tower. Wider parts rotate in XY with inverse preview transforms. Tower coordinates must repeat for every prepared plate.
- Generic wall-mount-only and hook-only downloads retain excluded items as preview context. Non-AMS plates are separated by palette colour, including single-colour cores.
- Coats use screws; adhesive-pad recesses are a lighter-item alternative.
