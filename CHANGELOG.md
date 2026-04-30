# Changelog

All user-visible changes to the JLPT N5 study material site.

## v1.6.2 - 2026-04-30 (Stroke-order SVGs)

### Added
- **Stroke-order diagrams on every kanji card.** Drop-in of all 106 KanjiVG SVGs (CC BY-SA 3.0) at `svg/kanji/<glyph>.svg`. The placeholder text "Stroke-order SVG not yet shipped." that was visible on every one of the 106 kanji detail cards is gone. Each kanji card now shows the actual stroke-by-stroke diagram with stroke numbers.
- **`NOTICES.md`** at the repo root: third-party content attributions. KanjiVG entry includes source, license, copyright, and a note on the only modification made (codepoint-hex filenames renamed to literal-glyph filenames to keep on-disk names learner-readable; SVG payload byte-for-byte preserved).
- **`tools/fetch_kanjivg.py`** build script: fetches the 106 SVGs from KanjiVG's GitHub raw URLs. Idempotent (skips files already present). Used at build time only.

### Changed
- **Service worker precache** now derives the 106 SVG URLs at install time from `data/n5_kanji_whitelist.json` rather than hand-listing them. Avoids drift between data and precache.
- **Kanji card fallback message** rewritten: `Stroke-order SVG not yet shipped. Drop-in target: ...` → `Stroke-order diagram could not load.` (only visible when an SVG is missing or `<object>` fails to render).
- **CC BY-SA 3.0 attribution line** added under the stroke-order diagram on every kanji card, linking to <https://kanjivg.tagaini.net/>.

### Note
- This is a content-only addition. Zero changes to grammar/vocab/listening/reading data. All 23 content-integrity invariants remain green.
- SVG payload size: ~496 KB total across 106 files (avg ~4.7 KB each).

---

## v1.6.1 - 2026-04-30 (Copy audit: voice consistency)

### Changed
- **Hero copy rewritten** to remove sales-promo voice. Headline `Pass JLPT N5 with 15 minutes a day` → `JLPT N5 study material`; first-time CTA `Start your first lesson` → `Start a lesson`; returning-visitor h2 `Continue your N5 study` → `Continue`. No factual changes; voice now matches an institutional reference site (think MIT OpenCourseWare) rather than a SaaS landing page.
- **Hero trust strip removed** from the page body. The same facts (offline, no account, local storage) are now reachable via the `Privacy` link in the footer; on-page repetition was the marker of marketing voice.
- **Hero stats** reverted from pill badges to a flat dot-separated list — pills read as a stat-card scoreboard; flat reads as a table of contents.
- **Recommender widget** copy rewritten: `What should I study next?` → `Suggested next`; `Keep your 5-day streak alive` → `Continue (5-day streak)`; `Clear today's review queue` / `Run today's review` → `N reviews due today`; `Try a quick mixed drill` → `Mixed drill`; `Pick up the next lesson` → `Next lesson`. Numbers are the motivator; imperatives removed.
- **Returning resume cards** copy rewritten: `Continue where you left off` → `Resume`; `Today's review queue` → `Reviews due today`; `All caught up - come back tomorrow.` → `No reviews due.`; `Learn something new` → `Open Learn`.
- **Streak label** simplified: `5 day streak` → `5 days`; the heading-style "streak" word removed.
- **Site title** `JLPT N5 Grammar Tutor` → `JLPT N5 — study material`. Per UI brief §1.1 #1: "Grammar Tutor" undersells (vocab, kanji, reading, listening are also part of the corpus).
- **Meta description** rewritten in plain English (`Free JLPT N5 study material covering grammar, vocabulary, kanji, reading and listening. Works offline; no account.`) — replaces developer jargon (`Static, on-device, privacy-preserving tutor for JLPT N5 grammar.`) which a non-developer searcher couldn't parse.
- **Drill answer feedback** glyphs dropped: `✓ Correct` / `✗ Not quite` → `Correct` / `Wrong`. Color + label is enough; the glyphs rendered inconsistently across platforms (Windows plain text vs mobile emoji).
- **Drill graduation message** `★ Graduated! This pattern is mastered.` → `Graduated. Pattern mastered.`
- **Counter-drill feedback** glyphs dropped (same rationale as above).
- **Summary empty state** copy rewritten: `Your dashboard fills in as you study.` → `Stats appear here once you've studied.`; `Start your first lesson` → `Start a lesson`.

### Note
- These are voice-only changes. No grammar/vocab/kanji content was modified. All 23 content-integrity invariants remain green.
- Voice contract recorded in `TASKS.md` under "Copy audit" so future copy doesn't drift back into marketing register.

---

## v1.5.0 - 2026-04-30 (UX Brief 2 - Phase 1-4)

### Added
- **Home screen** (#/home) is now the default landing page. First-time visitors see a CTA "Start your first lesson" + placement check link + 3-card pillars (Learn / Practice / Test). Returning visitors see a Continue card, Today's review queue, and a 7-day streak heatmap.
- **Search** across grammar / vocab / kanji from the header. Press `/` to focus. Works offline.
- **Three-mode furigana** (Always / Hide on known kanji / Never) in Settings, with a live preview.
- **Per-kanji popover**: click any kanji glyph to see on/kun-yomi + meanings + an "I know this" toggle that persists.
- **Single-kanji pages** (#/kanji/<glyph>) and the kanji index (#/kanji) showing all 97 N5 entries.
- **Keyboard shortcuts** (1-4 / Space / Enter / ? / Esc / /) with a `?` cheatsheet overlay.
- **Settings additions**: audio playback speed (0.75 / 1.0 / 1.25x), reduce-motion toggle, typed-phrase reset confirm ("Type RESET").
- **Skeleton placeholders** replace the legacy "Loading..." text on every route. 5-second timeout shows a real "Couldn't load this view" UI with Retry.
- **Empty states** for Review (no progress / no due), Summary (no progress), and Test (no completed tests).
- **Trust strip** on the landing screen ("Works offline / No login required / Your progress stays on this device") above the fold.
- **PWA install prompt** (one-time, dismissible).
- **Offline indicator** in the corner when the network drops.
- **"Update available" toast** when a new shell version is detected (stale-while-revalidate).
- **Streak tracking**: current + longest day-streak in localStorage, 7-day heatmap on home.
- **Mobile bottom-nav** at viewports ≤ 480px with iOS safe-area insets honored.
- **Print stylesheet** (`@media print`) for clean handouts of any Learn lesson.
- **Persistent location indicator** chip below the header showing the active route.
- **Deep links**: #/test/<n> for n ∈ {20, 30, 50} starts a test directly. #/kanji/<glyph> jumps to a kanji page.

### Changed
- **Tagline** updated to "Pass JLPT N5 with 15 minutes a day. No login, no ads, no data shared."
- **Footer** updated to "Works offline. No login. Your progress stays on this device."
- **Primary nav** restructured: Home / Learn / Practice (renamed from Daily Drill) / Review / Test. Summary + Settings moved to a secondary nav row.
- **Service worker** now uses stale-while-revalidate for the shell (HTML/CSS/JS) and cache-first for content (data/audio/locales). Posts an update message to clients when new shell bytes are detected.

## v1.4.0 - 2026-04-29 (Brief 1 - final assets)

### Added
- **491 audio files** for all grammar examples, reading passages, and listening scripts (gTTS Japanese voice, ~19 MB).
- **30 reading passages** (expanded from 8) with 2-3 comprehension questions each.
- **12 listening items** across the three JLPT N5 formats (4 task / 4 point / 4 utterance) with audio.
- Grammar example audio player in the Learn UI.

### Fixed
- `tools/build_audio.py`: `Path.with_suffix` was stripping the example index for IDs like `n5-001.0`. Switched to manual string concat so all 449 grammar example files render uniquely.

## v1.3.0 - 2026-04-30 (native-speaker audit Pass 8)

52 findings raised, 52 fixed. Severity: 16 HIGH, 27 MED, 9 LOW. Touched `moji_questions_n5.md`, `bunpou_questions_n5.md`, `goi_questions_n5.md`, `dokkai_questions_n5.md`, `authentic_extracted_n5.md`. See `verification.md` §7.

## v1.2.0 - 2026-04 (UX Brief 1 / Phase 4 + 5)

- 187 patterns enriched, 250 questions written (no stubs).
- 1002 vocab entries + 97 kanji entries.
- Verb classification, て-form gym, counters, こそあど, は vs が, particle pairs modules.
- Reading + Listening shells.
- Settings panel + 5-locale i18n + PWA manifest + export/import progress.
- SM-2 SRS in Review with Again/Hard/Good/Easy grading.
- 37 browser-runnable tests.

## v1.0.0 - 2026 initial release

- Vanilla HTML/CSS/JS scaffold, hash router, LocalStorage adapter.
- 4 chapters + Drill + Diagnostic.
- Threshold-based weak detection.
- Service worker, offline-capable.

---

*This changelog only records changes visible to users. For commit-level history, see git log.*
