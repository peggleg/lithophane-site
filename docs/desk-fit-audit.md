# Desk fit audit after a printed bin failed to assemble

The user reported that a printed rim did not accept the lid for a 110 × 110 × 140 mm bin. This exposed a gap in the earlier tests: they tested closed meshes and final assembly/swing, not the path used to assemble the parts. The audit cannot establish physical print fit or strength; it tests exact exported geometry and real slicer imports.

## Confirmed faults and fixes

- The old underside pin-entry slot ended 0.1 mm short of the inner rim opening at the default 1.8 mm wall setting. The pin cleared the circular seat when fully inserted but collided with that lip during insertion. A 1.5 mm offset produced approximately 0.333 mm³ intersection in the default square model. Channels now extend through the complete rim wall with 0.4 mm end overrun.
- Entry slots also lacked clearance for the existing 3 mm bearing pads on the body. New entries are 3.8 mm wide (0.4 mm per side around the pads); circular bearing seats have 0.4 mm radial clearance around the unchanged 1 mm radius pins. The rim remains 4 mm high.
- Short, wide bins previously allowed the lid to hit the floor while swinging. A shared dimensional calculation now rejects insufficient height using the swept corner radius, floor thickness and a 0.6 mm floor-clearance reserve. For smooth 1.8 mm-wall bins, the minimum is 57 mm at 110 mm width and 87 mm at 170 mm width. Existing valid dimensions are not silently resized.

For 110 × 110 × 140 mm bins, old and new body/lid solids were compared by symmetric-difference volume for all six styles and both outlines: unchanged to the 0.0001 mm³ numerical tolerance. Only the rim needs replacing **when size, style and wall thickness match the original parts**. This does not establish which settings the user's printed parts used.

## Measured nominal dimensions — smooth, square, 1.8 mm walls

| Feature | Dimension |
| --- | --- |
| Rim exterior | 110 × 110 × 4 mm |
| Central rim opening | 105.2 mm |
| Flat lid plate | 104.0 mm |
| Lid including both pins | 109.4 mm |
| Pin diameter | 2.0 mm |
| Circular bearing diameter | 2.8 mm |
| Underside entry width | 3.8 mm |

The pin span intentionally exceeds the central opening: pins enter the underside channels, not the central hole. Print the rim slots-up and dry-fit the lid from that side. Place the pair on the bin slots-down over the pads, check full seating and movement, then glue only the stationary rim/body seam. Updated UI and print guides show these dimensions and the assembly order. Bin download filenames now include wall thickness and surface style to help keep matching parts together.

## Digital audit coverage

`test/desk-assembly.test.js` checks actual generated solids, not just dimensions:

| Item | Checks |
| --- | --- |
| Bin assembly | 108 configurations: both outlines, six styles, three wall thicknesses, widths 40/110/170 mm. Lid/rim/body final fit and rim lowering in 0.25 mm steps through a 5 mm insertion path. |
| Bin swing | 72 configurations at the minimum permitted height; −90° to +90° in 5° steps against body and rim, plus rejection just below minimum height. |
| Storage drawers | All styles, solid/honeycomb/woven fronts, one/four columns, two rows, minimum 0.2 mm clearance; travel from closed to fully withdrawn in 10% steps, checking both outer columns. Existing tests also cover the other openwork patterns and mesh integrity. |
| Sorting trays and pen layouts | All styles, both layouts, 0.2/0.8 mm clearance; every insert checked at five lift heights against the outer tray and every neighbour. Existing tests cover denser 4 × 3 box layouts and variable pen shares. |
| Stacking | Minimum/default/maximum footprints, pocket and smooth final-top variants; vertical insertion of feet into locating pockets. Existing tests verify pocket depth, retained roof skin, feet, lateral restraint and drawer movement. |
| Pots and standalone trays | Existing six-style, square/round, min/max-dimension and resizable-container tests check closed floors, connected meshes, interior spans, divisions and the 170 mm A1 mini design limit. These parts have no mating lid/insert mechanism. |

Browser checks cover real downloads, the measured fit display, corrected assembly guide, filename matching and shallow-bin rejection. All print settings remain sourced from `print-profile.js`; the shared 8% gyroid / 2 wall / desk 3+3 skin policy and desktop override metadata are unchanged. A fresh corrected bin project is checked through Bambu's desktop Open/Save route and the actual slicing engine.

These checks do not measure printer dimensional error, elephant foot, pin sag, material shrinkage, glue thickness, friction, durability or strength. A physical dry-fit is still required before committing to a collection or gluing moving parts. Print and test the small rim/lid pair first; do not reprint an unchanged full bin or lid without checking matching settings.
