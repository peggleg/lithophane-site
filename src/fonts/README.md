# Local fonts

- Noto Sans Bold and Noto Serif Bold: static TTF files from `notofonts/noto-fonts`, `hinted/ttf/NotoSans/NotoSans-Bold.ttf` and `hinted/ttf/NotoSerif/NotoSerif-Bold.ttf`.
- Nunito ExtraBold: instantiated from `google/fonts`, `ofl/nunito/Nunito[wght].ttf`, with FontTools at `wght=800`. This is bundled as a static TTF for reproducible glyph outlines.

The accompanying SIL Open Font Licences are also served under `font-licences/`. Fonts are fetched from the same origin by the text geometry worker, never from a third-party font service. Latin characters are mapped directly to glyph outlines after NFC normalization, with font kerning. Optional shaping/ligature substitutions are not used.

Nine additional static Noto faces (Sans/Serif Regular, Italic and BoldItalic, Sans/Serif Display Bold and Sans Mono Bold) are from the system Noto distribution, under the bundled Noto SIL OFL. All 12 choices use their actual font outlines in exports.

DancingScript.ttf — Dancing Script (Google Fonts), variable weight font used for connected ornament lettering. SIL Open Font License: DancingScript-OFL.txt.
