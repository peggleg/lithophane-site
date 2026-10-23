# Print defaults for this site

Apply this policy to current generators and every future addition:
- 8% gyroid sparse infill and 2 wall loops.
- Keyrings and nameplates: 2 top layers and 2 bottom layers.
- Lithophanes and fans: preserve their existing 4 top and 4 bottom layers.
- Every other generator, including future additions: 3 top and 3 bottom layers.

Use `src/print-profile.js` as the shared source. Pass the generator kind to profile, export, filament estimate and display helpers; do not hard-code a universal skin-layer count. Keep UI, guides, 3MF settings, ZIP sidecars and estimates consistent. Confirm profile coverage in tests when adding a generator.
