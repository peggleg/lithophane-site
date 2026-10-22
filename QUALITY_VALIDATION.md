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

## Mechanical clicker prototypes

`/clickers/` now offers nine designs: Letter Charms, Pocket Arcade, Daisy Chain, Christmas Clicks, Pocket Pebble, Name Bar, Symbol Strip, Number Pad and Cloud Cluster. Create 1–5 independently mounted full-height MX-style buttons with round, rounded-square or heart caps. Six collections provide 30 original symbols: everyday, cute/cosmic, sports, fruit, Halloween and Christmas. Christmas includes a tree, snowflake, present, bauble and gingerbread figure. There are 12 local lettering fonts, themed palettes, per-button preview colours and an optional 4.5 mm keychain eyelet.

Every housing has an integral solid floor and a separately printed press-in switch deck, replacing the first open-bottom prototype. Default floor thickness is 2 mm; the adjustable deck fit defaults to -0.05 mm per side (slight interference). A 0.8 mm perimeter ledge seats the deck, and a 7 mm upper rim encloses the switch housing. Cap footprints have at least 0.6 mm lateral clearance within the wells so caps can enter during a nominal press. Tray, deck and cap geometry is shared by preview, STL ZIP and multipart millimetre 3MF. All exports include a closed-tray fit coupon, matching deck coupon and socket-fit keycap. Print trays bottom-down and decks flat; caps still need underside supports that exclude the cross sockets. The preview offers underside, open-tray and separate-parts views. Grey switch proxies and preview colours are not exported as geometry/filament assignments.

Switch assumptions remain provisional: 14.1 mm opening, 1.5 mm plate, 16 mm internal depth, 2.4 mm lower walls, 23 mm pitch, 5.8 mm connector width, 4 mm insertion and 4.15 × 1.25 mm cross socket. Controls adjust fit dimensions. Test tray/deck retention, boxed-stem clearance, pin enclosure, full travel and eyelet strength on actual prints. The nominal digital cap/housing clearance checks do not establish compatibility with the photographed switch. Switches and chain are supplied separately; physical fit, feel and durability remain untested.

Automated checks inspect the serialized STL floor under every switch as well as closed, oriented positive-volume meshes, all preset/count combinations, all 30 motifs in three cap shapes, fit changes, named parts and nominal 4 mm cap travel. Browser validation covers presets, collections including Christmas, colours, controls, downloads, reset/cancellation, touch and 320/390/1280 px layouts. Use `npm run test:clickers` against `npm run preview:pages`, and `npm run test:browser` for the existing studio regression suite. Deploy only to `preview/lithophane`; production release and physical testing remain separate.

Closed-base checkpoint: all 62 automated tests, the clicker browser suite, the existing studio browser suite, production/preview builds and six-page CSP/indexing checks passed. Actual serialized base STLs were sliced to verify solid material under every switch, and nominal cap positions were checked against the tray/deck through 4 mm of travel. Reviewed assembly, tray and underside screenshots, including the Christmas set. Physical switch fit, printed deck retention, feel and eyelet durability remain untested.
