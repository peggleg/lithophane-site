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

Automated regression suite: 49 passing tests, including outline solids, raised/recessed decorations, symbol-only tags, safe symbol placement across all six outlines, 12 font choices and Light/Dark persistence. Existing photo/fan/sample/export regressions remain green. Production and preview builds, preview CSP/indexing checks and full-resolution STL/3MF geometry checks pass.

Browser validation uses `npm run test:browser` against `npm run preview:pages` (or set `STUDIO_URL` to a deployed preview). Install Playwright Chromium with `npx playwright install chromium`, or set `CHROMIUM_PATH` to a system Chromium executable. It checks all 12 actual font workers, mouse and real CDP touch dragging, keyboard movement, resizing, heart/star/cloud geometry, STL and 3MF downloads, theme persistence and all five routes at desktop/mobile widths. The tests use software WebGL when needed. Physical print quality remains unverified.

### Keyring outline correction
Shape selection now starts with suitable dimensions: rounded/capsule 70 × 25, circle 50 × 50, heart 60 × 55, star 60 × 60 and cloud 70 × 45 mm. The previous shape selection retained the thin rectangular dimensions, squashing the heart and preventing other outlines from fitting the default text. Regression coverage now selects every outline directly from a fresh page with unchanged EXPLORE text, adds a symbol and downloads both STL and 3MF. Individual desktop and mobile top-view screenshots support visual review.
