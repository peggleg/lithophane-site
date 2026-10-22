# Resolution validation — October 2026

## Automated checks

`npm test`: 12 passing tests covering mesh closure/orientation/volume, thickness mapping and photo direction, STL normals/header/size, 3MF package structure, invalid inputs, exact sampling, explicit memory refusal, screen/DPR sizing, shared crop layout, fractional luminance and SEO.

`npm run check:resolution` generates these 120 × 100 × 3 mm ramp fixtures (minimum thickness 0.8 mm):

| Spacing | Front grid | Total vertices | Triangles | STL bytes | 3MF bytes |
| --- | --- | --- | --- | --- | --- |
| 0.2 mm | 601 × 501 | 303,302 | 606,600 | 30,330,084 | 41,276,874 |
| 0.1 mm | 1201 × 1001 | 1,206,602 | 2,413,200 | 120,660,084 | 168,194,195 |

Every triangle is non-degenerate; each edge has exactly two opposite directed uses. Ramp volume matches 22,800 mm³ within 0.01 mm³. Every STL coordinate matches its mesh coordinate; every 3MF vertex matches within 0.000001 mm and every triangle index matches exactly. Both formats retain the same geometry. Files are written under ignored `artifacts/resolution/`.

Production and preview builds pass. `npm run check:preview` passes root asset references, noindex policy, absent sitemap/canonical and JSON-LD CSP hash checks.

## Interactive browser checks

Chromium in the local app browser, desktop 1365 × 1000 and mobile 390 × 844 viewport overrides:

- Harvest artwork loads; default spacing is 0.2 mm. Switching to 0.1 mm reports 1201 × 1001 samples and 2,413,200 triangles. Desktop canvas backing size stays 645 × 538 across those settings and responds independently to viewport changes.
- Browser downloads of harvest STL and 3MF at 0.1 mm complete; a valid WebP upload and STL download at 0.2 mm complete at mobile size.
- 100 × 120 mm portrait dimensions report 501 × 601 samples at 0.2 mm. Crop/contain and inversion controls work.
- Cancel stops an active 3MF export. A 300 × 300 mm, 0.1 mm 3MF request reports its estimated 4301 MiB working memory against the 768 MiB browser budget and preserves the requested 3001 × 3001 grid.
- Corrupt PNG and a generated 5001 × 5000 PNG are rejected. Downloads are disabled while replacement decoding is pending. Rapid replacements followed by reset do not restore the old job; reset disables exports and restores 0.2 mm defaults.
- Narrow-screen inspection found an intrinsic aspect-ratio overflow. Explicit lightbox width fixes it: studio/workspace scroll width now equals client width, and the preview fits within the mobile viewport.
- No captured console warnings or errors in these checks. This is not a full cross-browser or physical-phone test.

To repeat: build/serve the preview, load Harvest Lanterns, switch spacing, export each format, cancel an export, request an oversized fine grid, test valid/corrupt/oversized files, then reset. Repeat at narrow width and inspect overflow and export controls. Local screenshots and fixtures are kept under ignored `artifacts/resolution/`.

## Independent slicer import

Installed Bambu Studio CLI imported and re-exported:

- 0.2 mm ramp STL and 3MF;
- 0.1 mm ramp 3MF;
- browser-generated 0.1 mm Harvest Lanterns STL and 3MF.

All returned code 0 and `Success.`. Re-exported triangle counts remain 606,600 or 2,413,200 as appropriate. Bounds remain 120 × 100 × 3 mm (STL round-trip width differs by approximately 0.000004 mm from floating-point centring). Bambu centres objects on its plate, so absolute XY positions change without resizing the model.

These are import/geometry checks, not sliced-toolpath or physical-print validation. No printer was operated. The user's 0.4 mm nozzle and 0.12 mm layer setup still needs a fresh test print; source pixels, filament, lighting and slicing can limit detail even when mesh sampling is correct. The bundled artwork's native resolution is unchanged, and the UI warns when it is below the requested export grid. The backlit preview remains an uncalibrated illustration.

## Crop correction

The previous position sliders only selected the excess source area after aspect-ratio fill. A matching photo had no movable excess, and a near-matching photo could have too little horizontal travel to notice. The new 100–400% enlargement creates a bounded source rectangle and allows both directions. Unavailable axes are disabled with an explanation rather than appearing to do nothing. Whole-photo fit disables crop-only controls; crop reset and new images restore 100% zoom and centred positions.

Five additional regression tests pass (17 total): matching-aspect panning, in-bounds source rectangles for portrait/landscape/matching photos at all tested zooms and positions, whole-photo-fit invariance, identical source crop arguments in screen/export drawing, and changed relief across a horizontal gradient. Preview/production builds and preview-policy checks pass.

Interactive Chromium checks confirm a 1200 × 1000 photo on a 120 × 100 mm panel disables both axes at 100% zoom with an explanation, enables both at 200%, retains positions while switching between fit/fill, and resets zoom/positions on Reset crop. Harvest Lanterns STL downloads at 200% zoom with horizontal positions 0% and 100% keep all XY coordinates identical while changing 1,806,444 relief coordinates (606,600 triangles each). Thus horizontal movement reaches the exported geometry as well as the preview. Narrow-screen checks cover controls and canvas overflow. Screenshots and gradient fixture remain in ignored artifacts/resolution/.


## Direct crop dragging

Drag the image directly in the preview to choose the crop. Mouse and pointer/touch input use bounded crop positions, synchronised with the sliders and worker export. Arrow keys provide keyboard positioning. At 100% the panel stays filled; optional enlargement up to 400% creates more movement room. Shrinking below the fill size has been removed so dragging cannot create blank strips. Fit whole photo remains an explicit mode with margins when aspect ratios differ.

All 19 Node tests pass, including drag direction, edge clamping, no movement on a fitted axis and no blank source edges. Chromium checks verify actual pointer dragging (50/50 to 16/25), release outside the canvas clamping to 100/100, arrow-key movement, STL download, reset to 100%, and mouse drag at a 390 × 844 responsive viewport without page overflow. Touch-event handlers are implemented; a physical phone has not been tested. Production/preview builds and preview-policy checks pass.

## Design Studio redesign

Automated regression suite: 52 passing tests, including outline solids, raised/recessed decorations, symbol-only tags, safe symbol placement across all six outlines, 12 font choices and Light/Dark persistence. Existing photo/fan/sample/export regressions remain green. Production and preview builds, preview CSP/indexing checks and full-resolution STL/3MF geometry checks pass.

Browser validation uses `npm run test:browser` against `npm run preview:pages` (or set `STUDIO_URL` to a deployed preview). Install Playwright Chromium with `npx playwright install chromium`, or set `CHROMIUM_PATH` to a system Chromium executable. It checks all 12 actual font workers, mouse and real CDP touch dragging, keyboard movement, resizing, heart/star/cloud geometry, STL and 3MF downloads, theme persistence and all five routes at desktop/mobile widths. The tests use software WebGL when needed. Physical print quality remains unverified.

### Keyring outline correction
Shape selection now starts with suitable dimensions: rounded/capsule 70 × 25, circle 50 × 50, heart 60 × 55, star 60 × 60 and cloud 70 × 45 mm. The previous shape selection retained the thin rectangular dimensions, squashing the heart and preventing other outlines from fitting the default text. Regression coverage now selects every outline directly from a fresh page with unchanged EXPLORE text, adds a symbol and downloads both STL and 3MF. Individual desktop and mobile top-view screenshots support visual review.

### Top ring holes and shared symbol editor
Ring holes have 3 mm of surrounding material: left-side holes for rounded rectangles and capsules, top holes for circles, hearts, stars and clouds. Top holes are centred where possible; the heart uses an upper lobe so it clears the notch. Lettering and symbols avoid the actual two-dimensional hole position. Both keyrings and nameplates have a symbol dropdown (heart, star, cloud, flower, plus), with mouse/touch dragging, arrow-key positioning, resizing and removal. Nameplates have edge clearance without a ring-hole exclusion. Tests cover each actual top through-hole, all motifs in raised/recessed nameplates with and without stands, and both browser export formats.

Overlapping symbol/letter combinations are simplified at 0.0001 mm before export to remove microscopic Boolean slivers; mesh checks cover all five motifs in both relief modes.

Updated the home-page keyring illustration to show top holes; removed the misplaced decorative metal ring. The illustration remains separate from generated models.

### Shape-specific ring-hole placement
Rounded rectangles and capsules use a left-side ring hole. Circles, hearts, stars and clouds retain a top hole. Text fitting, draggable symbol clearance, the editor, model exports and home-page rectangle illustrations use the same placement rule. Regression checks verify the actual through-hole position and desktop/mobile editor position for every shape.

## Mechanical clickers

Seven presets offer up to 12 buttons, 12 fonts and ten symbol collections with twelve choices each, including Christmas. Each download contains only one closed base and one cap per button, plus a text guide. There are no separate decks, inserts or fit-test models.

The default base is 15.8 mm high with a 1.8 mm floor, 9 mm blind square pockets and 5 mm upper wells. Dry-fit switches first. Glue the fixed lower housing sides to the pocket walls, or its stationary flange to the surrounding ledge. Keep adhesive off moving stems, seams, contacts and caps. Let it cure before adding the caps. Actual switch fit needs physical verification.

Caps taper from 21.5 mm to 18.8 mm with rounded corners and hollow skirts. Automated tests check closed meshes, switch-pocket floors and glue ledges, cap taper and coverage, nominal 4 mm travel, every symbol and export part counts. `npm run test:clickers` checks the complete browser flow, downloads, all presets, touch and responsive layouts.

### Fan photo positioning

The open fan preview supports bounded mouse/touch dragging, arrow-key positioning (Shift for larger steps), 100–400% zoom and a photo-position reset. Fit whole photo remains centered. Preview and exported blade relief share the same cropped image. Samples reset the crop. Run `CHROMIUM_PATH=/usr/bin/chromium npm run test:fan` to check mouse, touch, keyboard, crop modes, reset and STL export.

Clicker symbols: 120 distinct choices across Everyday Favourites, Cute & Cosmic, Sports Club, Fruit Salad, Halloween, Christmas, Animal Friends, Great Outdoors, Snack Time, and Hobbies & Adventures. Every collection contains 12 symbols. A starter set uses its first five choices; each button can then use any symbol from the collection. Catalogue integrity and closed-cap geometry are covered by automated tests.

Clicker design limits: Letter Charms accepts 1–12 buttons, Number Pad 1–9, Daisy Chain exactly 5, and Pocket Pebble exactly 1. Name Bar and Symbol Strip have been removed. Lettering accepts individual printable letters, numbers and punctuation, including `!"£$%`; whitespace and unsupported font glyphs remain explicit errors. Count limits apply to both UI controls and generated exports. Punctuation geometry is checked in all 12 bundled fonts.

Pocket Pebble batches: select Pocket Pebble to reveal A–Z, a–z, 0–9 and custom batch lettering (1–64 characters; whitespace separates entries and duplicates are retained). Each entry exports its own base and cap in a numbered STL folder. Batch 3MF contains the same independent objects in a grid; arrange or split plates in the slicer. The single-pebble preview stays separate. Font, keyring and switch-fit settings apply to every item. Batch creation runs in a cancellable worker. `npm run test:pebble-batch` checks alphabet ZIP/3MF contents, custom duplicates, presets, limits, cancellation and mobile layout.

## Resizable Japandi desk collection

`/desk/` generates storage drawers, pen pots and sorting trays locally. Width, depth, height, wall/floor thickness, compartments, drawer count (1–4) and per-side drawer clearance are adjustable. Smooth, Soft Fluted and Slatted finishes change the exported solids; Ivory/Sand, Sage/Cream and Charcoal/Wood palettes affect the preview only.

Each finished part is measured in its supplied printing orientation and must remain within 170 × 170 × 170 mm for the A1 mini’s 180 mm build volume. Invalid or oversized settings block generation and downloads. Brims, supports and slicer exclusions still need checking. Parts may require multiple plates; 3MF is not printer-bed packing.

Print the drawer case on its closed back, open front upwards, so its shelves print vertically. Print drawers, pots and trays bottom-down and open-side-up. STL ZIP and millimetre 3MF contain separate named parts; the guide lists their print sizes and orientation. The assembled preview includes an open-drawer view and a view of printing orientations. Physical fit, strength and surface quality are untested.

Validation: 73 unit tests pass, including eight desk geometry tests for connected/closed/oriented meshes, actual part sizes at the 170 mm limit, resized geometry, dividers, floors, finish changes, assembly dimensions and case/drawer collision checks at 0.2 mm clearance. `npm run test:desk` covers all three items and finishes, resizing, all downloads, invalid settings, palettes, reset/cancellation, mobile and touch. `npm run test:navigation` checks all seven pages at desktop/tablet/mobile sizes in both themes. Production and preview builds plus seven-page CSP/indexing checks pass.

Sorting trays now default to removable inner boxes in a 2 × 2 layout. Rows (1–3), columns (1–4) and per-side clearance (0.2–0.8 mm) are adjustable; fixed dividers and open trays remain optional. Every lift-out box has a separate solid floor and walls, a smooth interior, and a top 0.8 mm below the tray rim. Profiles are clipped to the rounded tray interior with physical clearance. Preview, print-size checks, ZIP and 3MF include each numbered box as an independent part. Digital tests cover all finishes, corner and neighbor collisions, closed floors and export counts; physical fit remains untested.

The sorting tray also offers “Full-width pen box + smaller boxes”. One lift-out pen box spans the tray width and defaults to 50% of its interior depth (adjustable 25–65%). Columns and rows apply to the remaining area. All insert dimensions derive from tray size, finish, wall thickness and clearance; internal spans are listed in the UI and print guide. Selecting this layout starts with one row of smaller boxes. Dimensions that cannot provide the minimum usable space are rejected. Geometry checks cover auto-sizing, part-size limits, collision clearance and separate pen-box STL/3MF exports.
