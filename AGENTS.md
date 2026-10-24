# Print defaults for this site

Apply this policy to current generators and every future addition:
- 8% gyroid sparse infill and 2 wall loops.
- Keyrings and nameplates: 2 top layers and 2 bottom layers.
- Lithophanes and fans: preserve their existing 4 top and 4 bottom layers.
- Coasters: 5 top layers and 5 bottom layers (user-approved moisture-coverage exception). Coaster holders keep 3/3.
- Every other generator, including future additions: 3 top and 3 bottom layers.

Use `src/print-profile.js` as the shared source. Pass the generator kind to profile, export, filament estimate and display helpers; do not hard-code a universal skin-layer count. Keep UI, guides, 3MF settings, ZIP sidecars and estimates consistent. Confirm profile coverage in tests when adding a generator.

3MF must be a complete recognised Bambu Studio project, not a generic geometry archive with an ignored JSON attachment. Keep the A1 mini/0.4 mm/PLA starting profile explicit in UI and guides. Set minimum shell thickness to zero so it does not silently increase the requested skin-layer count. For export changes, run `npm run test:bambu-import` against the actual slicer (set `BAMBU_STUDIO_PATH`); archive JSON assertions alone do not prove import compatibility. The CLI also bypasses desktop preset inheritance. Run `scripts/check-bambu-desktop.py` in an isolated Bambu GUI test session and verify a desktop Open Project / Save Project round trip; preserve intentional process keys in `different_settings_to_system`, including each generator's skin-layer policy.
