# Mounted-load strength review

The lightweight 8% gyroid / 2-wall / 3-skin policy was carried over to new desk mounts without a separate structural assessment. That is not a defensible basis for a hanging-load claim. Existing releases had no load rating, but the default needs to be more conservative.

## Revised starting profile

Desk clamps, headphone/controller/remote/cable accessories and future pegboard panels/supports use **30% gyroid, 4 walls, 5 top and 5 bottom layers**, 0.4 mm nozzle and 0.2 mm layers. Minimum skin thickness remains zero so the requested skin count is explicit. Other categories keep their existing profile exceptions and lightweight defaults. The shared source is `src/print-profile.js`; project overrides, guides, ZIP sidecars, metadata, estimates and desktop preset deltas must agree. New mount filenames carry `30pct-4walls-5skins` to distinguish older files.

## Why infill alone is not the answer

The C-frame jaws carry cantilever bending from screw pressure and accessory loads. The rail sees bending/torsion, and the roots and threaded bore concentrate stress. Perimeters at the outside of these sections matter more than a density number alone. At a 0.4 mm line width, four loops budget roughly 1.6 mm of perimeter material versus 0.8 mm for two. Five skin layers budget 1.0 mm versus 0.6 mm at three layers. Additional infill supports the wall system and spreads load locally; it is not equivalent to a solid section.

As an illustrative geometric comparison only, a 38 × 12 mm rectangular jaw section has a perimeter/skin-shell second moment of area of about 2,022 mm4 with the earlier settings versus 3,428 mm4 with the revised settings. This ignores local geometry, voids, toolpaths, anisotropy, bonding, creep, defects and material properties. It is NOT a strength prediction or a permissible-load calculation. The actual frame has rounded roots, a thread bore and other departures from a rectangular beam. Inner jaw-root rounding is increased to 4.5 mm without changing the standard rail.

The 1.3 mm latch is already thinner than the wall budget and should be essentially solid. More sparse infill does not solve latch fatigue. The 29 mm broad cantilever uses small release travel, prints in the supplied side orientation so bending is in the layer plane, and has a PLA/PETG test coupon. The guide recommends PETG for repeated flexing and requires choosing the actual filament profile; the project remains an explicit Generic PLA starting project rather than silently selecting a different material.

## Remaining physical evidence

Native slicing and desktop project round trips check that settings and supplied orientations survive import. Mesh tests check thread travel, interference, catch engagement and release. They cannot establish a load rating, fatigue life or desk-surface protection. Printed tests must cover the maximum-reach/minimum-width clamp, screw over-tightening, accessory leverage, rail/catch pull-off, repeated latch cycling, and sustained clamping/hanging loads over time at expected room temperatures. Both PLA and PETG can creep. Broad soft contact pads are still required. No kilograms or safe load are advertised before these tests.

Filament estimates now obtain both wall thickness and core density from the selected profile rather than assuming 0.8 mm and 8% universally. They remain conservative surface-shell estimates; final mass comes from the slicer.

## Native validation evidence

Both downloaded printer projects retain 30% gyroid, 4 walls, 5/5 skins and zero minimum shell thickness after native import and desktop Open/Save. Default clamp parts and the integral-latch hook slice in their supplied orientations. The archived earlier default clamp slice reports 30.29 g at 8%/2 walls/3 skins; the revised default, including larger jaw-root rounding, reports 60.67 g at 30%/4 walls/5 skins. These are slicer predictions, not measured mass or strength. Other generators retain their original profile policies in regression checks.
