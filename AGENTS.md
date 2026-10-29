# Print defaults for this site

User-facing copy policy: this is an internal site. Do not add prototype, untested, unvalidated or physical-testing disclaimers to pages, generated status messages or download guides. Keep useful assembly instructions, optional fit-test downloads, slicer guidance and factual material/use limits. Continue development checks and internal validation records; removing disclaimers does not establish a load rating.

Apply this policy to current generators and every future addition:
- Standard lightweight items: 8% gyroid sparse infill and 2 wall loops.
- User-requested load-bearing exception: desk clamps, mounted accessories and future pegboard panels/supports use 30% gyroid, 4 wall loops, 5 top and 5 bottom layers. Use `isLoadBearingPrint` in the shared profile source. This is a conservative starting profile, not a load rating; preserve safe print orientation and require physical load/creep and latch-fatigue tests.
- Keyrings and nameplates: 2 top layers and 2 bottom layers.
- Lithophanes and fans: preserve their existing 4 top and 4 bottom layers.
- Coasters: 5 top layers and 5 bottom layers (user-approved moisture-coverage exception). Coaster holders keep 3/3.
- The quick-move pegboard adapter retains 30% gyroid, 4 walls and 5/5 skins, with normal automatic supports enabled for its rear hooks and rail in its supplied side orientation. Other products retain their own support defaults. Its guide and exported project must agree.
- Every other non-load-bearing generator, including future additions: 3 top and 3 bottom layers.

Use `src/print-profile.js` as the shared source. Pass the generator kind to profile, export, filament estimate and display helpers; do not hard-code a universal skin-layer count. Keep UI, guides, 3MF settings, ZIP sidecars and estimates consistent. Confirm profile coverage in tests when adding a generator.

3MF must be a complete recognised Bambu Studio project, not a generic geometry archive with an ignored JSON attachment. Keep the selected printer/0.4 mm/PLA starting profile explicit in UI and guides (A1 mini by default; Bambu A1 for the optional 256 mm size). Set minimum shell thickness to zero so it does not silently increase the requested skin-layer count. For export changes, run `npm run test:bambu-import` against the actual slicer (set `BAMBU_STUDIO_PATH`); archive JSON assertions alone do not prove import compatibility. The CLI also bypasses desktop preset inheritance. Run `scripts/check-bambu-desktop.py` in an isolated Bambu GUI test session and verify a desktop Open Project / Save Project round trip; preserve intentional process keys in `different_settings_to_system`, including each generator's skin-layer policy.

# Printer size policy

Every generator defaults to `a1-mini`: a 180 mm build volume with the existing 170 mm per-part design allowance. Offer the optional `256` selection for a 256 × 256 × 256 mm build volume, exported as a matching Bambu A1 project. Use `src/printer-settings.js` for limits and validate finished parts in their printing orientation, rather than assembled dimensions. Keep mechanical fit constraints and the skin/infill/wall policy above. Picker changes must invalidate stale exports, and Reset returns to A1 mini. Guides, 3MF machine/bed/filament settings and ZIP printer sidecars must follow the selected size. Verify both printers through native import and desktop Open/Save checks.
