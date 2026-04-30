# Third-party content notices

This project bundles content from the following third-party sources. Each is
attributed below per its license.

## KanjiVG

- **What it is:** stroke-order SVG diagrams for the 106 N5-syllabus kanji.
- **Source:** <https://kanjivg.tagaini.net/>
- **Repository:** <https://github.com/KanjiVG/kanjivg>
- **Files:** `svg/kanji/<glyph>.svg` (106 files, one per N5 kanji)
- **License:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
- **License text:** <https://creativecommons.org/licenses/by-sa/3.0/>
- **Copyright:** © 2009–2011 Ulrich Apel
- **Modifications:** the SVG content is unmodified from upstream; only the file
  names are changed (codepoint-hex `<NNNNN>.svg` → literal-glyph `<漢>.svg`)
  to keep the on-disk filenames learner-readable. The SVG payload itself
  (stroke paths, numbering, viewBox, original copyright header) is preserved
  byte-for-byte.

Per CC BY-SA 3.0:
- You are free to share and adapt this content provided you give appropriate
  credit (which this file does), and any derivative work is distributed under
  the same or a compatible license.
- The KanjiVG SVG files in `svg/kanji/` retain their original CC BY-SA 3.0
  license. The rest of the project is governed by its own LICENSE.

---

*Last updated: 2026-04-30*
