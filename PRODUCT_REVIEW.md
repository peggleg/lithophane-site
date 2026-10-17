# Product and implementation review

Historical review of the pre-correction prototype. The October 2026 resolution correction now removes the sample cap, reports effective detail and file sizes, separates screen rendering, blocks downloads during replacement loading, and validates Bambu Studio imports. See QUALITY_VALIDATION.md for current evidence. The findings below describe the earlier checkpoint; calibrated lighting, physical testing, cross-browser CI and the other feature proposals remain outstanding.

## Overall assessment

The static, browser-local architecture fits the privacy and low-cost goals. Option 03 provides a coherent visual direction, the collection artwork is more detailed, and the separate preview build is useful. The current app is a working prototype: successful file export does not establish slicer compatibility, physical print quality or frame fit. Prioritise a reliable image-to-print result before expanding the catalogue.

## Evidence checked

- Re-ran all seven geometry/SEO tests, the preview build and `check:preview`: passed.
- Inspected image processing, mesh/export code, seasonal assets, SEO/build config and deployment documentation.
- Chromium reproduction: changing maximum panel thickness from 3 to 6 mm left preview pixels identical. `src/main.js` derives preview brightness from image tone rather than panel thickness. A thickness-aware approximation should still be labelled approximate until calibrated.
- Chromium reproduction: a 300 mm panel with fine detail uses 1.25 mm horizontal sampling because each axis is capped at 241 samples. This limits the detailed artwork delivered by the mesh. The app currently reports the cap, but the Fine label alone does not communicate the resulting quality.
- Chromium reproduction with delayed photo decode: export remains enabled for the previous model while the UI says “Opening photo locally…”. Suspend exports until replacement finishes, or clearly identify the active image and require an explicit switch.
- Fit clearance currently changes planning text only; the fit coupon is a 20 × 20 mm solid square at maximum thickness. Those capabilities are described accurately, but they do not validate complete frame fit.
- Browser smoke scripts used during development are outside the repository. The repository has seven Node tests and a preview checker, but no committed browser suite or CI workflow. Prior browser results are evidence for those runs, not repeatable clean-checkout coverage.
- 3MF is geometry-only and uses uncompressed ZIP entries. Archive validity does not prove actual import behaviour in Bambu Studio, OrcaSlicer or PrusaSlicer.

## Priority 1: improve reliability before public launch

1. **Fix image-replacement state.** Prevent stale exports while a replacement photo/template loads. Cover failures, reset during decode and browser back/forward restoration.
2. **Show effective detail.** Display actual sample spacing, triangles and estimated output size before export. Offer a tested device-appropriate quality budget; improve memory use before simply increasing the cap. A smaller exported image cannot retain all fine source detail.
3. **Make preview useful for printing.** Add original/adjusted/backlit comparisons and an interactive mesh view showing thickness, flat back and relief side. Make illumination respond to thickness with a clear approximation label and calibration path.
4. **Define the frame interface.** Finalise the exact Bambu light kit and LED tealight envelope, panel opening, overlap, slot depth, cable slit and whether 0.2 mm is total/per side. Prefer a constant-thickness mounting rim rather than depending on varying photo relief at the panel edge.
5. **Validate the manufacturing result.** Import both formats into target slicers, verify units/orientation/dimensions and inspect toolpaths. Print representative dark/light/portrait/seasonal samples and test lighting/fit. Keep physical readiness distinct from digital export readiness.
6. **Make verification reproducible.** Commit browser tests and a preview-only CI workflow. Include Chromium/WebKit/Firefox, mobile dimensions, no-upload assertions, loading races, download checks and reset. Add keyboard/focus/contrast checks; test actual phones where available.

## Priority 2: product experience improvements

- Give visitors two clear entry points: “Use my photo” and “Choose a ready-made design”. Put advanced mesh/thickness controls behind an expandable section.
- Add aspect-ratio lock, rotate, mirror, drag-to-crop and pinch/zoom. Offer undo/redo in memory and a reversible auto-adjust action.
- Add gamma/midtone control and shadow/highlight clipping feedback. A calibrated tone-to-thickness curve is more valuable than arbitrary sharpening.
- Keep seasonal preview text short; show printing requirements and compatibility next to the relevant action. Move internal design rationale into docs and concise help.
- Give public seasonal artwork a clear usage licence, artwork version and print-validation status. Use a lossless master for production exports if compression artefacts become visible in relief; small WebP previews can remain separate.
- Improve maintainability: readable HTML/CSS formatting, small image-processing/export/state modules, and one catalogue data source rather than duplicated card text and JS metadata.

## Additional features not already delivered

| Feature | Benefit | Suggested timing |
| --- | --- | --- |
| Filament/light calibration ladder | Print several known thicknesses, compare against the intended LED and choose a tonal range before a full panel. Complements the existing corner coupon. | Before validated presets |
| Mechanical tolerance ladder | Compare several candidate fit clearances in one small print; keep the requested 0.2 mm as the target until testing establishes the right allowance. | With frame prototypes |
| Interchangeable panel system | One standard panel interface fits both lighting bases; seasonal panels can be swapped without reprinting the whole frame. | During frame design |
| Printer build-area check | Warn when a selected panel plus brim will exceed the chosen printer's usable area; display the proposed orientation. | Next software release |
| Settings-only recipe export/import | Reuse dimensions, tone controls and a frame version through a local JSON download; never include the photo or auto-save it. | Next software release |
| Personalised border | Add a short name/date/message outside the visible photo and mounting area, with minimum feature-size checks. | After frame interface |
| Versioned print pack | Bundle the panel, settings summary, frame version/link, assembly instructions and licence; make it clear whether frames are separate MakerWorld downloads. | After validated frames |
| Later panel shapes | Curved panels, ornaments and multi-panel lamps need geometry-specific print and light testing. | Later, not a preview blocker |

These features can generally remain client-side/static. Private preview access and account-level bot protection are separate Cloudflare configuration concerns.

## Deployment recommendations

- Keep the dedicated preview mode and production domain separate; noindex does not provide access control.
- Confirm the hosting of imgdrop.app before promising a completely Worker-free integration at /lithophane/. Static integration needs no Worker; a separate site's subpath routing may need an existing reverse proxy or Worker route. A subdomain is an alternative only if the owner chooses it.
- Verify current Cloudflare limits and available bot controls in the actual account. Public JS/artwork can be copied; robot directives are advisory.
- Keep analytics and session replay off by default to preserve the stated privacy behaviour. Treat shared recipe links as settings-only; never encode photos into URLs.

## Recommended next sequence

1. Fix loading/export state and commit browser coverage.
2. Improve effective detail reporting and calibratable preview.
3. Finalise one standard panel interface and prototype both lighting bases.
4. Validate slicer imports and a small set of physical prints.
5. Add photo/library entry points, crop essentials and calibration downloads.
6. Deploy and test a protected Pages preview, then decide public launch scope.
