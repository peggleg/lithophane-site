# Bambu LED A6 frame prototypes

Two mechanical prototypes for the owner's 59 mm diameter × 8 mm high LED kit. These have not been physically printed or optically/thermally validated. Dimensions are millimetres. No files operate a printer.

## Common panel interface

- A6 postcard panel: **105 × 148 mm**, maximum thickness **3.0 mm** recommended.
- Front border: **11 mm**; visible aperture **101.4 × 144.4 mm**.
- Panel cavity: 105.4 mm wide, 148.4 mm high, 3.4 mm deep. About 2 mm of each image edge is hidden.
- Slide the panel into the open top of the U channel. Fit the removable top retainer behind the front mask. The postcard frame has a separate top rail secured by two M3 × 6 mm screws into 2.6 mm pilot holes; the lantern uses its existing loose retainer captured by the top ring.
- Retainer and sliding fits are deliberately loose prototypes. Actual printer tolerances vary; test a short channel/retainer section before committing to full parts. Do not force or glue the LED into its pocket.
- LED recess: **Ø59.6 × 8.4 mm**, with finger access and a 5 mm open cable escape. No screw positions or connector size have been assumed.

## Frame 1 — slim postcard frame (revised)

Print one each of postcard_frame, postcard_top_retainer, postcard_base and postcard_led_holder. The earlier deep reflector hood, roof, port cover and portrait spacers are superseded and excluded from the updated model pack.

The frame is **8.8 mm deep** with **11 mm assembled front borders**. Its finished outline including the removable top rail is 123.4 × 166.4 mm. The open back has no enclosure or roof. The removable stand is **110 × 90 mm**, with an 8 mm base plate and a raised LED cradle reaching approximately 79 mm above the table.

1. From the rear, remove the top rail’s two M3 × 6 mm screws (additional hardware, not assumed to be included with the LED kit).
2. Slide a 105 × 148 mm lithophane, at most 3 mm thick, straight down from the top into the side channels. The image faces the front mask; the relief can face the rear LED.
3. Refit the stepped top rail and insert both screws from the rear into the printed pilot holes. Use 6 mm screws only; the rear clearance bores lead to blind pilots that leave a continuous 2.4 mm front skin. The rail prevents the panel sliding out when the frame is used in landscape orientation. Repeated disassembly may wear printed threads; test the fit before repeated use.
4. Seat the frame's lower edge in the stand's open-ended slot, centred over the base. The same slot accepts the long edge for landscape placement; the frame overhangs the stand at its ends.
5. With the LED holder separate from the base, seat the LED in its angled recess. Lay its wire into the open cradle notch and the base groove, then press the keyed holder down into the base socket until its shoulder rests on the base. Keep the cable in the central bypass, away from the side gripping ribs. Its emitting face points forward and 30 degrees upward. Route the wire through the cradle's lower 5 mm notch and the base's rear cable groove. The kit itself is gravity-seated; verify retention before moving the assembly.

The cradle directs light towards the image without enclosing it. Even illumination and comfortable viewing still require a physical test with the actual kit and filament. No calibrated brightness or operating-temperature claim is made. The separate LED holder needs supports beneath the angled cradle; the base plate prints flat. The top rail is exported resting on its wide outer top edge, with its locating tongues growing upward, to avoid unsupported tongues.

The assembled front and the partial-insertion front/rear renders show the actual CAD geometry. The artwork is illustrative; the panel shown in renders is a flat dimensional placeholder, not a newly generated relief or a physical print photograph.

## Frame 2 — four-sided lantern

Print four lantern_side_frame parts, four lantern_top_retainer parts, one lantern_base and one lantern_top_ring.

1. Insert a 105 × 148 mm portrait panel and retainer into each side frame.
2. Seat the LED in the central base recess, route its cable through the open channel, and test the cable clearance before assembly.
3. Stand each side in its corresponding base slot, fronts facing out. Adjacent ends meet at the corners; the base locates them independently.
4. Lower the top ring over all four side frames. Its underside slots hold their tops and capture the retainers. The centre remains open for ventilation.

The lantern base/top are approximately 145 × 145 mm. Finished height is approximately 178 mm. The base and top ring slide over the side frames with 0.4 mm total clearance. Do not carry the assembled lantern by the top ring; it is a removable slip fit. Disassemble by lifting the ring and then each side. No glue, printed hinges, snaps or unverified screw pattern are required.

## Files and printing

- STL: one part per file, already placed in the suggested print orientation.
- STEP: editable solids for each part and assembled views for each design.
- FCStd: both assemblies with nominal LED envelopes clearly labelled REFERENCE ONLY. The LED envelopes are excluded from printable part files.
- dimensions.json: exact part bounds, quantities and closed-solid validation results.
- ZIP: complete model pack and these notes.

Print frame masks face-down, bases flat and retainers/covers/spacers flat. The lantern top ring is exported upside-down so its receiving slots face up. The postcard LED holder needs supports beneath its angled cradle; inspect the frame retaining-lip overhangs as well. Inspect supports and fit in the slicer. White material is useful for internal reflection; choose an appropriate material after checking the LED's actual operating temperatures. Keep ventilation open and follow the kit manufacturer's guidance. Never use a flame.

The CAD generator uses FreeCAD 1.1's bundled Python:

```powershell
& 'C:\Program Files\FreeCAD 1.1\bin\python.exe' .\build_frames.py
```

Generated outputs go into exports/. All part solids and tessellated meshes are validated as closed before export. Digital validity is not evidence of successful assembly, heat resistance or illumination quality. Start with fit tests, then one postcard frame and a single lantern-side/base corner test before printing all four lantern sides.

## Start with these fit tests

Print fit_test_led_socket first and check the actual LED housing and wire exit. Print fit_test_channel and fit_test_retainer to check the revised postcard channel, top-rail tongue and screw pilot. These are optional small test pieces, not additional frame assembly parts.

Both portrait and landscape postcard assemblies, and the lantern assembly, are checked for solid intersections by the generator. STL mesh closure is checked for each of the 13 unique printable/test parts. Assembly STEP/FCStd files contain reference panels and nominal LEDs; print individual part STLs only. The renders use artwork on flat dimensional placeholder panels; they are CAD assembly illustrations, not photographs or predictions of lit print quality.

Rear-fastener checks verify uninterrupted front material, a clear screw path, 0.4 mm screw-tip clearance to the blind-hole end, and screwdriver access in portrait and landscape. There are no holes or screw heads on the front display face.

## Lantern assembly renders

1. `exports/lantern-1-panel-insertion.png`: slide each A6 panel down through the open top of its side frame, then insert the small retainer. Repeat for all four sides.
2. `exports/lantern-2-exploded-assembly.png`: place the LED in the central base recess and route its cable through the rear channel; lower each loaded frame into its matching base slot; lower the top ring over their upper edges. Exploded parts remain vertically aligned with their receiving slots. The LED is lifted for visibility.
3. `exports/lantern-3-assembled.png`: the completed lantern retains its open, ventilated top. The ring captures the loose panel retainers and locates the sides; it is not a carrying handle.

These renders use the existing CAD without changing any printable geometry. Artwork on the flat reference panels illustrates assembly only. Orange arrows are diagram guides, not model parts. Physical fit and lighting remain untested.


## Two-piece postcard stand

The base and the LED holder are separate STL/STEP parts. The 18 × 13 × 4.8 mm locating key fits an 18.3 × 13.3 × 5 mm pocket. Four shallow gripping ribs provide 0.05 mm nominal interference per side; the lower plain section guides insertion. The rib interference is intentional and accounted for separately from assembly collisions. Physical press-fit force depends on printer/material tolerances.

A 5.8 mm-wide central bypass remains clear under the key and mast. The CAD checks verify an uninterrupted 5 × 3 mm cable envelope in the base route, a clear key-body insertion path, closed part meshes and the existing rear-only frame screw access. Fit-test socket/key STLs are supplied: print these together first before the full holder. They are optional calibration pieces, not extra assembly components. Connectors do not need threading through a closed hole: position the wire while the holder is separate, then press the holder into the base.

`postcard-stand-two-piece.png` shows the holder raised above its socket with an illustrative cable laid into the groove. Orange arrows indicate pressing down; do not print the diagram arrows or reference LED/cable.


The holder cable relief now breaks fully through the underside of the locating key: it is an open-bottom U-shaped notch, not a closed eyelet. The base retains its groove floor. A dedicated CAD check verifies the entire underside opening is free of material, alongside the assembled cable-clearance test. Updated holder and fit-test-key files supersede the earlier closed-bottom key.
