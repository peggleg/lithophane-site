# Postcard Frame V2 — screwless top rail

Separate version; V1, the base and the LED holder are preserved.

- Image panel remains A6 105 × 148 mm, maximum 3 mm thick.
- Image channel is identical to the actual V1 CAD solid: 105.4 mm wide and 3.4 mm deep, with the same mask, side/bottom lips and Y=157.4 mm upper panel stop.
- Front border remains 11 mm. Assembled outline 123.4 × 166.4 × 8.8 mm.
- No screws, screw holes or long locating tabs. A fixed front lip conceals the dovetail entries, keeping the display face uninterrupted.

The top rail slides **from the rear towards the front** on two short dovetails at the outer top corners. This direction avoids cutting through either image channel and avoids forcing the panel through a side opening. The central keeper passes between the existing rear lips and stops above the panel exactly as V1 did. The rear wall of each rail groove is the insertion end stop. Dovetails prevent the rail lifting away; slide rearward to remove it. The slide direction is horizontal in both portrait and landscape, so gravity does not pull it off. There is no fragile snap catch.

Print only postcard_frame_v2.stl and postcard_top_rail_v2.stl. Use the existing base and LED holder. Before full printing, try fit_test_frame_v2.stl and fit_test_rail_v2.stl together. The dovetail has 0.3 mm nominal lateral clearance per side; actual sliding friction remains printer-dependent. Do not force the parts together.

Assembly: slide the picture down from the top, then slide the rail forward from behind until the end stops seat. To change the image, slide the rail rearward and lift the panel out.

STLs are oriented for printing. The rail rests on its outer top face with the keeper pointing up. Inspect the short groove bridges in the slicer. STEP and FCStd files are included; preview STL files illustrate assembly and are excluded from the ZIP.

Validation compares the protected image-channel region against the existing V1 FCStd solid, checks panel insertion and the rail sliding path, verifies mechanical capture against upward movement, and validates closed single-solid meshes. SHA-256 checks confirm the existing base and LED-holder files are unchanged. Physical sliding fit still needs the small test print.
