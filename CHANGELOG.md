# Changelog

All user-visible changes to the JLPT N5 Grammar Tutor.

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
