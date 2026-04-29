# JLPT N5 Grammar Tutor — Tasks

Last updated: 2026-04-30 (Phase 4 — Developer Brief executed)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Status snapshot

- 187/187 patterns enriched, 250/250 questions real (no stubs)
- 13 routed views: Learn / Test / Daily Drill / Review (SRS) / Summary / Diagnostic / Settings / こそあど / は vs が / Verb groups / て-form gym / Particle pairs
- SM-2 SRS in Review (4-button grading)
- Service worker `jlpt-n5-tutor-v6` pre-caches ~30 assets
- 5-locale i18n shell (en at v1, vi/id/ne/zh structured)
- PWA manifest installable
- Export / import progress round-trips through JSON
- 37 browser-runnable tests

---

## Done — Phase 4 (Developer Brief tasks)

### Phase 4.1 Foundation
- [x] **P1.2 SRS upgrade to SM-2** — Review tab is now an SRS session with Again/Hard/Good/Easy. Per-item state: easeFactor, interval, reps, lapses, due. Live-verified: rep 1→1d, rep 2→6d, rep 3→15d, lapse → 1d + EF drops to 1.96.
- [x] **P1.3 Diagnostic Summary upgrade** — Error Patterns (per-pattern accuracy ranked), Recommended Next Session (5 weak/foundational items), Session Log (last 10 tests).
- [x] **P1.4 Rename "Drill 0"** — now "Daily Drill"; badge suppressed at 0; aria-label.
- [x] **P1.5 lang="ja" + Japanese font stack** — furigana renderer wraps in `<span lang="ja">`; CSS targets `[lang=ja]/.ja/ruby` with Noto Sans JP / Hiragino / Yu Gothic / Meiryo. No third-party font loads.

### Phase 4.2 Curriculum
- [x] **P2.1 Verb classification module** (#/verbclass) — teach + drill, 40% over-sample of the 8 famous Group-1 exceptions, 90% pass threshold.
- [x] **P2.2 て-form gym** (#/teform) — 7-rule transformation table with per-rule lifetime accuracy, drill with rule-aware mistake feedback, adaptive over-sampling on weak rules.
- [x] **P2.4 こそあど page** (#/kosoado) — 4×4 grid + speaker/listener/far proximity diagram + drill.
- [x] **P2.5 は vs が module** (#/waga) — 5 minimal pairs (topic/new-info, stative, existence, neutral description, XはYが) + double-blank drill.
- [x] **P2.6 Particle minimal-pair drills** (#/particles) — に/で, に/へ, を/が, と/に, か/や, は/が. Both choices grammatical; both translations shown.

### Phase 4.3 Test fidelity
- [x] **P3.4 Type-the-answer drills** — `text_input` question type with forgiving matcher: kana, romaji (Hepburn), katakana, NFKC, half/full-width, particle-homophone alternates (wa↔は, o↔を, e↔へ via per-position bitmask enumeration).
- [x] **P3.3 並べ替え production drills** — `sentence_order` question type already in place.

### Phase 4.4 Polish
- [x] **P4.1 Settings panel** (#/settings) — UI language, furigana mode, theme, font size, daily limits, export, import, reset.
- [x] **P4.2 PWA manifest** — `display: standalone`, maskable SVG icons, theme color.
- [x] **P4.3 i18n** — `js/i18n.js` `t(key)` lookup. Five locale files: en/vi/id/ne/zh. Auto-detects browser language; selectable in Settings.
- [x] **P4.4 Export / import progress** — schema-versioned `progress.json` round-trip.
- [x] **P4.5 A11y** — Skip-to-content link, universal `:focus-visible` rings, prefers-reduced-motion + forced-colors media queries, role=banner.

### Cross-cutting
- [x] **P-cross.1 lang="ja"** — applied via furigana renderer span wrapper.

---

## Remaining (need external infrastructure)

- [ ] **P1.1 Audio for every example sentence + reading passage**. Needs a TTS pipeline (Azure / Google Cloud Japanese neural voices or piper-tts / Coqui run at build time) and ~10MB of MP3 assets committed.
- [ ] **P3.1 Listening module** (課題理解 / ポイント理解 / 発話表現) — depends on P1.1.
- [ ] **P3.2 Reading passages module** — needs ~30 graded passages authored by hand + comprehension questions.
- [ ] **P2.3 Counters module with image drills** — needs object images.
- [ ] **P-cross.2 Vocabulary corpus to ~800 N5 words** with audio + tags. Audio depends on P1.1.
- [ ] **P-cross.3 Kanji corpus to ~100** with stroke-order SVGs (KanjiVG is freely available — quick win).
- [ ] **P-cross.4 Reading + listening corpus** of ~30 graded passages. Same as P3.2.

### Pre-release QA gate (per Brief §9)

- [x] No console errors on load.
- [ ] FCP < 1.5s on simulated 4G (unmeasured).
- [x] Works offline after first load.
- [x] Japanese text renders in Japanese font on Windows without language pack (Yu Gothic / Meiryo fallback).
- [x] Furigana toggle hides/shows ruby.
- [ ] Audio plays on iOS Safari (pending P1.1).
- [x] Export → wipe → import round-trips progress.
- [ ] Lighthouse audits (unmeasured; manifest + SW + a11y should put scores in range).
- [x] No outbound network calls during a normal session.

---

## Hard constraints preserved

1. ✅ Static-only — GitHub Pages, no server.
2. ✅ No data leaves the device.
3. ✅ No login.
4. ✅ Offline-capable after first load.
5. ✅ Cross-browser.
6. ✅ Backups via export/import.

## Out of scope (Brief §8)
- User accounts, social, leaderboards.
- Cloud sync.
- N4+.
- Speaking practice with microphone.
- Runtime AI / TTS.

---

## Earlier completed phases (Phase 1–3)

- Engine + scaffold (vanilla HTML/CSS/JS, hash router, LocalStorage, furigana toggle, 4 chapters + Drill + Diagnostic, threshold-based weak detection, service worker)
- Tools (build_data, check_coverage, lint_content, build_spec, generate_stub_questions)
- 19 KB content fixes (teacher's audit — see `verification.md`)
- Pattern catalog: 187 entries across 23 categories
- Question bank: 250 entries (no stubs)
- 5 KB question-bank reference files (498 Qs across moji/goi/bunpou/dokkai/authentic)
- Pushed and verified live on GH Pages
- 37 browser-runnable tests
