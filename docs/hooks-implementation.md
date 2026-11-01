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
- [x] Woodland
- [x] Ocean
- [x] Dinosaurs & Dragons
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

## Pets usability correction

The original 20–30 mm projection left inadequate space between the character and hook tip. Hooks now default to 48 mm projection (44–56 mm control), with a deeper U-shaped cradle, broad root, tapered 11 mm rounded end and a release tab exposed 10 mm below the mount. Mechanical regression checks use a 10 mm hanging-loop insertion path and an 18 mm inside-diameter keyring at both character-height limits and minimum projection. These are geometry/access checks, not a load rating. Native slicing and desktop profile roundtrips cover both printer sizes and colour modes.

The release leaf now anchors above the catch, leaving 23 mm of flexing length rather than the original 6.5 mm. Its narrower 6 mm blade clears the male dovetail instead of touching its edge.

## Woodland release

Five independently authored designs: Fox Curl, Bear Hug, Night Owl, Mushroom Nook and Branch Buddy. Curled characters use a sampled 3D hook path that reaches the front clearance early, leaving an accessible throat instead of forming a blocked decorative loop. Character faces, ears and branch junctions use volumetric ellipsoid hulls. Mushroom caps and leaves have separate colour seats.

The access regression follows each real tip position from above to 6 mm below the tip, rather than assuming every design has the same vertical position. It checks a 10 mm hanging strand and 18 mm internal-diameter keyring at minimum projection and both height limits. Separate colour seats include a 0.02 mm adhesive space beneath and a 0.05 mm buffer around the fitted profile to survive float32 export without overlapping the core. Serialization retains nonzero enclosed voids while requiring one positive physical component. Pets passes the shared geometry regression.

Engraving cuts a 0.9 mm forward-facing skin from the actual curved surface rather than using a single maximum-height plane. Facial lines, feather marks and leaf veins therefore follow the printable sculpture.

Conforming engraving preserves the base and excludes the hook-root keepout. This prevents ornamental grooves from detaching thin edges or weakening the root.

Float32 export can leave paper-thin fragments: the 100 mm owl produced a 0.00027 mm³ skin after a conformal cut. Cleanup removes components below 0.001 mm³, less than 1/30 of a 0.4 × 0.4 × 0.2 mm print voxel; it still rejects larger detached solids. Nonzero enclosed voids above that threshold remain in the exported mesh.

## Rounded geometry and remaining collections

The shared receiver now has an ellipsoidal back and a rounded catch boss rather than an exposed rectangular spine. A continuous silhouette underlay joins the sculpture to the receiver; swept roots curve directly into the cradle. Bent decorative masses join adjacent ellipsoids rather than filling the entire bend with one convex hull. Finished part spans enforce a real 6 mm neighbour gap, including curls outside the artwork silhouette.

Engraving ignores sketches removed completely by the structural root keepout. Extruding those empty sketches produced invalid solids at smaller sizes. Single-colour mode retains the sculpted core and engraved lines without building the separate paint caps. Flat name lettering stays as embossed detail in that mode. The large City Arch extends its receiver to meet the arch crown continuously.

Collection and individual-design palettes follow the approved boards. A bounded 32 MiB / 12-model browser cache reuses identical settings while parameter changes still invalidate downloads. Personalised designs use the bundled font, with minimum lettering height, supported-character checks and fitted separate or AMS letters.

## Ocean release

Octo Curl, Whale Tail, Turtle Tide, Curling Wave and Seahorse Swirl include rounded sculptures, seated colour details and individual curled cradles. Seahorse details include a contrasting eye and segmented belly bands. The turtle starts with a green/cream palette.

Validation: eight geometry tests; individual and mixed-row browser exports in both colour modes and printer sizes; native profile imports for both printers; A1 mini native slicing with zero skipped objects (separate: 9 plates / 32 objects; AMS: see native audit artifact); four Bambu Studio 2.8.2.61 desktop Open/Save profile checks. Gallery regression retains all 56 seasonal pictures. Actual printable mesh previews were inspected against the Ocean board.

## Dinosaurs & Dragons release

Dino Tail, Tricera Hook, Dragon Curl, Stego Spike and T-Rex Grin use individual sculpted forms and swept tail/horn cradles. The revised Dino Tail leaves a clear hanging gap at both size limits. Geometry, browser exports, native imports/slicing and all four desktop roundtrips passed. Separate projects sliced all 24 objects across 10 plates; AMS also reported zero skipped objects. Actual mesh views were compared with the approved category board.
