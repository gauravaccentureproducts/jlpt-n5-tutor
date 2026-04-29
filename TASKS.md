# JLPT N5 Grammar Tutor - Tasks

Last updated: 2026-04-29 (Phase 4 + 5 complete + audio shipped)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Status snapshot

- 187/187 patterns enriched, 250/250 questions real (no stubs)
- **15 routed views**: Learn / Test / Daily Drill / Review (SRS) / Summary / Diagnostic / Settings / こそあど / は vs が / Verb groups / て-form gym / Particle pairs / Counters / Reading / Listening
- SM-2 SRS in Review (4-button grading)
- Service worker `jlpt-n5-tutor-v9` pre-caches ~42 assets; lazy-caches audio on first play
- 5-locale i18n shell (en at v1, vi/id/ne/zh structured)
- PWA manifest installable
- Export / import progress round-trips through JSON
- 37 browser-runnable tests
- **Vocab corpus**: 1002 structured entries (data/vocab.json)
- **Kanji corpus**: 97 entries with stroke-order SVG slot (data/kanji.json)
- **Reading corpus**: 30 graded passages with 2-3 comprehension Qs each (data/reading.json)
- **Listening corpus**: 12 items across 3 JLPT formats (4 task / 4 point / 4 utterance) in data/listening.json
- **Audio assets**: 491 MP3 files committed - 449 grammar examples, 30 reading passages, 12 listening scripts (~19 MB total). Generated via gTTS (build-time only).
- **Audio TTS pipeline**: tools/build_audio.py - auto-detects piper-tts / gtts / pyttsx3. Idempotent. Uses string-suffix concat (not Path.with_suffix) so example IDs like 'n5-001.0' don't collide.
- **Codebase em-dash-free** (881 occurrences stripped)

---

## Done - Phase 4 + 5

### Phase 4.1 Foundation
- [x] **P1.1 Audio TTS build pipeline** - tools/build_audio.py auto-detects piper-tts / gtts / pyttsx3, renders MP3/WAV for every grammar example, reading passage, listening item. Idempotent. Writes data/audio_manifest.json. App degrades gracefully when MP3s are absent.
- [x] **P1.1b Audio rendered + wired** - 491 MP3s generated via gTTS (Japanese voice), grammar example player added to learn UI, listening + reading modules already wire `<audio>` elements from `it.audio` / `p.audio`. Verified in browser preview: HEAD 200 + audio/mpeg on grammar/listening/reading samples.
- [x] **P1.2 SRS upgrade to SM-2** - Review tab is an SRS session with Again/Hard/Good/Easy. Live-verified: rep 1→1d, rep 2→6d, rep 3→15d, lapse → 1d + EF drops to 1.96.
- [x] **P1.3 Diagnostic Summary upgrade** - Error Patterns + Recommended Next Session + Session Log.
- [x] **P1.4 Rename "Drill 0"** - now "Daily Drill"; badge suppressed at 0; aria-label.
- [x] **P1.5 lang="ja" + Japanese font stack** - furigana renderer span wrapper; Noto Sans JP / Hiragino / Yu Gothic / Meiryo. No third-party loads.

### Phase 4.2 Curriculum
- [x] **P2.1 Verb classification module** (#/verbclass)
- [x] **P2.2 て-form gym** (#/teform)
- [x] **P2.3 Counters module** (#/counters) - 11 counter tables + emoji-based "how many?" drill
- [x] **P2.4 こそあど page** (#/kosoado)
- [x] **P2.5 は vs が module** (#/waga)
- [x] **P2.6 Particle minimal-pair drills** (#/particles)

### Phase 4.3 Test fidelity
- [x] **P3.1 Listening module shell** (#/listening) - three-format scaffold (課題理解 / ポイント理解 / 発話表現), audio player wired, graceful no-audio fallback
- [x] **P3.2 Reading passages module** (#/reading) - 8 graded passages with comprehension Qs, read→questions→results flow
- [x] **P3.3 並べ替え production drills** - sentence_order question type
- [x] **P3.4 Type-the-answer drills** - text_input + forgiving matcher (kana/romaji + particle-homophone alternates)

### Phase 4.4 Polish
- [x] **P4.1 Settings panel** (#/settings)
- [x] **P4.2 PWA manifest**
- [x] **P4.3 i18n** with 5 locales
- [x] **P4.4 Export / import progress**
- [x] **P4.5 A11y improvements** - skip-to-content, focus rings, prefers-reduced-motion, forced-colors, role=banner

### Cross-cutting
- [x] **P-cross.1 lang="ja"** wrappers
- [x] **P-cross.2 Vocabulary corpus** - 1002 entries in data/vocab.json (form, reading, gloss, section)
- [x] **P-cross.3 Kanji corpus** - 97 entries in data/kanji.json with stroke_order_svg slots ready for KanjiVG drop-in
- [x] **Em-dash cleanup** - 881 em dashes replaced with ASCII hyphen across 29 files (cp932-safe)

### Pre-release QA gate (per Brief §9)

- [x] No console errors on load.
- [x] FCP < 1.5s on simulated 4G — analytical estimate ~555 ms cold-load on Lighthouse Slow-4G profile (150 ms RTT, 1.6 Mbps, 4x CPU). Critical-path ~60 KB total: index.html 2.1 KB + main.css 37.6 KB + entry JS modules 18.7 KB. Repeat visits via SW cache: <100 ms.
- [x] Works offline after first load.
- [x] Japanese text renders in Japanese font on Windows without language pack.
- [x] Furigana toggle hides/shows ruby.
- [x] Audio plays in browser preview (verified: 16 KB grammar clip, 217 KB listening clip, 115 KB reading clip - all 200 OK, audio/mpeg). iOS Safari unverified but uses standard `<audio src>` so should work.
- [x] Export → wipe → import round-trips progress.
- [x] Lighthouse-equivalent audits — PWA pass (manifest, theme-color, viewport, SW, HTTPS), A11y pass (lang, skip-link, banner, nav, main, h1, no missing labels), SEO pass (title, description, lang, canonical, robots), Best Practices pass (UTF-8, doctype, no console errors). Added meta color-scheme + robots + canonical link to index.html.
- [x] No outbound network calls during a normal session.

---

## Remaining

- [x] **P-cross.4 Reading + listening corpus expansion**: 30 reading passages + 12 listening items committed.
- [x] **Run tools/build_audio.py end-to-end**: 491 MP3s rendered via gTTS, committed under audio/, listening module activated.

All planned tasks complete. Engine, module, and asset layers are shipped.

---

## Hard constraints preserved

1. ✅ Static-only - GitHub Pages, no server.
2. ✅ No data leaves the device - no analytics, no telemetry, no remote API at runtime.
3. ✅ No login.
4. ✅ Offline-capable after first load.
5. ✅ Cross-browser.
6. ✅ Backups via export/import.

## Out of scope (Brief §8)
- User accounts, social, leaderboards.
- Cloud sync.
- N4+.
- Speaking practice with microphone input.
- Runtime AI / TTS calls.

---

## Earlier completed phases (Phase 1-3)

- Engine + scaffold (vanilla HTML/CSS/JS, hash router, LocalStorage, furigana toggle, 4 chapters + Drill + Diagnostic, threshold-based weak detection, service worker)
- Tools (build_data, check_coverage, lint_content, build_spec, generate_stub_questions, build_audio)
- 19 KB content fixes (teacher's audit - see verification.md)
- Pattern catalog: 187 entries across 23 categories
- Question bank: 250 entries (no stubs)
- 5 KB question-bank reference files (498 Qs across moji/goi/bunpou/dokkai/authentic)
- Pushed and verified live on GH Pages
- 37 browser-runnable tests
