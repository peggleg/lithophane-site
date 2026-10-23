# Bambu project import and bin slicing validation — 23 October 2026

The old exporter wrote a generic 3MF plus `Metadata/project_settings.config`. Bambu Studio skips that configuration unless it recognises a Bambu project and generator version (`src/libslic3r/Format/bbs_3mf.cpp`, importer checks around lines 1965–2030 and metadata handling around line 4214 in v02.08.02.61). Archive-level JSON tests did not exercise this importer and missed the fault.

The export now uses a complete, recognised project with an explicit A1 mini/0.4 mm, 0.2 mm Standard, Generic PLA, textured PEI starting profile. The Application field is a Bambu compatibility marker required by its importer; Generator/Designer identify Design Studio. No sliced G-code is exported. Users must open as a project, arrange all objects across plates and select their actual filament/plate. Geometry-only import or replacing a preset may discard these values. Minimum top/bottom thickness is zero so it cannot silently increase the requested skin-layer counts.

## Actual slicer results

Official Bambu Studio **02.08.02.61** Ubuntu 24.04 AppImage, A1 mini 0.4 mm nozzle, Generic PLA @BBL A1M, 0.20 mm layers, textured PEI plate, 8% gyroid, 2 wall loops, 3 top/3 bottom, no brim or supports. Imported the browser exporter’s 3MF directly, with **no machine, process or filament override**. CLI `--slice 0 --arrange 1`; three plates, one part each. Times include the slicer's per-plate preparation estimate; grams are the slicer's total filament. These are predictions, not measured physical prints.

| 110 × 110 × 140 mm square bin | Total time, all 3 parts | PLA |
| --- | --- | --- |
| Original: fluted, 2.4 mm walls | 7 h 51 min | 180.8 g |
| Smooth, 2.4 mm walls | 5 h 06 min | 178.9 g |
| New starting design: smooth, 1.8 mm walls | 4 h 31 min | 164.8 g |

The new body alone is 3 h 38 min; its rim is 14 min and lid 39 min. Most of the speed saving comes from removing decorative perimeter moves, not from infill. All rows in the comparison use the same embedded settings.

The new default keeps the closed floor, rounded footprint, bearing pads, three-part flush swing lid and fitting clearances. Other desk items keep their existing wall settings. Decorative bin finishes are still optional. Thinner walls require physical strength testing; lid/pivot fit and support needs remain prototypes. No claim is made that the MakerWorld comparator or the user's reported 11 hours was reproduced: the comparator model and exact presets were not supplied. No machine-speed increase was used to obtain this improvement.

## Reproduce

Set `BAMBU_STUDIO_PATH` to the official executable and provide its normal runtime libraries/display (Xvfb works for CLI). Run:

```
npm run test:bambu-import
node scripts/benchmark-bin.mjs
```

The import integration check launches Bambu Studio independently for lithophane, fan, keyring, nameplate, clicker, desk and future-generator exports, without preset overrides. It checks the **effective imported settings**, including 4/4 photo, 2/2 text and 3/3 other skin layers, minimum thickness, actual printer start instructions and bed/material selection. Artifacts/logs are written under `artifacts/` (ignored by Git). The bin benchmark generates the original geometry and two smooth variants, imports/slices all parts and saves effective settings, G-code and comparison JSON. The initial check exercised only the official CLI import/slicing engine. It did not exercise desktop preset inheritance; see the follow-up below. No physical printing was validated.

The site's filament figure remains an approximate surface-shell estimate, not a live slicer result. For the new bin it is about 157.3 g versus the slicer's 164.8 g; slicing, purge and other process choices can differ. Always use the actual sliced requirement before printing.

## Follow-up: desktop preset inheritance

The user supplied a newly exported bin that still opened as 15% grid and 5 top layers in **Bambu Studio 2.8.2.61**, using Open Project. Reproduced that exact outcome in the official desktop application, then saved the project through the GUI and inspected its effective settings. The source archive contained 8% gyroid and 3/3 skins; the desktop-saved project contained 15% grid and 5/3 skins.

`PresetBundle::load_config_file` splits `different_settings_to_system` by process/filament/printer, and `PresetCollection::load_external_preset` restores inherited system values for every key not listed as different. Our exported delta list was empty. The CLI bypasses this merge, so its successful import was insufficient evidence of desktop compatibility.

`projectProfile(kind)` now marks every intentional process override, including the per-generator skin-layer counts, zero minimum shell thickness, layer height, brim and support settings. The corrected uploaded file was opened and saved in the actual desktop GUI; its saved settings retained **8% gyroid, 2 walls, 3/3 skins and zero minimum shell thickness**, with the geometry unchanged.

To exercise this desktop-specific path, install Python `python-xlib` and Pillow, start an isolated Linux/X11 Bambu Studio GUI with a test `--datadir`, complete setup and select Prepare. Generate fixtures with `npm run test:bambu-import`, then run:

```
python scripts/check-bambu-desktop.py
```

The driver opens each exported fixture with Ctrl+O and saves it with Ctrl+Shift+S through the GUI, then checks the desktop-written project. It waits for project loading to finish and records screenshots and effective settings in `artifacts/bambu-desktop/`. Use an isolated test instance; this driver opens and saves projects in that instance.

Desktop verification passed for lithophane, fan, keyring, nameplate, clicker, desk and the future-generator fallback. A fresh bin 3MF downloaded through Chromium from the built preview also passed the desktop round trip: 8% gyroid, 2 wall loops, 3/3 skins and zero minimum shell thickness. All 96 unit tests passed.
