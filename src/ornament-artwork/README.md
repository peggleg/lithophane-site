# Printable ornament artwork

Each JSON file stores two dimensioned, even-odd contour sets in a 100 mm circular coordinate system:

- `surface`: the complete approved-style stencil, including its original wording.
- `frame`: the matching text-free decorative frame used for replacement wording.

The artwork was developed from the user's approved ornament boards as clean monochrome manufacturing stencils, then converted to vector contours with curve cleanup. It is not a thresholded photograph. Original names/greetings are preserved as authored outlines; replacement wording uses the bundled OFL Lobster font. The generator adds the controlled circular frame/eyelet and short continuity bridges, clips to the finished envelope and extrudes the same contours for preview and download.

`node scripts/render-ornament-thumbnails.mjs` regenerates gallery images from actual generated cross-sections. `scripts/import-ornament-frames.py COLLECTION BOARD.png` imports a matching text-free 3 × 2 technical board; it requires OpenCV/NumPy for development only. The browser needs neither Python nor image tracing.

Do not replace these templates with generic icons, photo masks or concept images. Check complete and personalised geometry, actual preview screenshots, both printer sizes and native Bambu projects after changes. Artwork deliberately uses a separate frame layer so names cannot erase parts of the decorative motifs.
