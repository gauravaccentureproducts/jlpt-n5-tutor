# JLPT N5 Grammar Tutor — Tasks

Last updated: 2026-04-29 (Phase 3 → Phase 4 transition; Developer Brief absorbed)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Status snapshot

- 187/187 patterns enriched, 249/249 questions real (no stubs)
- Engine: hash router, LocalStorage adapter, 4 chapters + Drill + Diagnostic
- Service worker active (`jlpt-n5-tutor-v1`, 19 assets pre-cached)
- 37 browser-runnable tests passing

---

## Phase 4 — Developer Brief tasks (extracted from `feedback/jlpt-n5-tutor-developer-brief.md`)

### Phase 4.1 — Foundation (highest pedagogical leverage)

- [ ] **P1.1 Audio for every example sentence + reading passage**. Build-time TTS pipeline (Azure / Google Cloud / Coqui / piper-tts). Cache outputs as MP3/Ogg. No runtime TTS calls.
- [ ] **P1.2 Replace Review with real SRS (FSRS or SM-2)**. Per-item state: stability, difficulty, due-date, lapses, reps. 4-button grading (Again/Hard/Good/Easy). Mixed grammar+vocab+kanji+conjugation queue.
- [ ] **P1.3 Rebuild Summary as diagnostic dashboard**: mastery map (new/learning/young/mature/burned), error patterns ("particle を accuracy 62%"), recommended next session, session log.
- [ ] **P1.4 Rename "Drill 0"** to a clearer label (likely "Daily Drill" / "Mixed Review" / "Today's Practice"). The `0` is just a count badge; suppress when 0.
- [ ] **P1.5 Migrate furigana to semantic `<ruby>` + `lang="ja"` + Noto Sans JP webfont** (subset to N5+N4 charset, ~200KB woff2). Furigana toggle hides `<rt>` via CSS, not re-render.

### Phase 4.2 — Curriculum completeness

- [ ] **P2.1 Verb classification module + drill** (group 1/2/3 + high-frequency exceptions: 帰る・入る・走る・知る・切る・要る etc.). 90% threshold gates conjugation gym.
- [ ] **P2.2 Dedicated te-form gym** with full rule table, kana/romaji input, rule-aware mistake feedback, per-ending accuracy tracking surfaced in Summary.
- [ ] **P2.3 Counters module** with image-based "how many?" drills + counter-noun matching. Cover ~つ・人・本・枚・匹・冊・回・歳・階・個・台・杯・分・時・時間・年・か月・日・週間・円 with all rendaku/irregular readings.
- [ ] **P2.4 こそあど systems page**: 4×4 grid + speaker/listener proximity diagram + drill.
- [ ] **P2.5 は vs が module**: minimal-pair examples covering topic vs exhaustive vs neutral-description vs stative-predicate uses; double-blank fill-in drills.
- [ ] **P2.6 Particle minimal-pair drills** (に/で, に/へ, を/が, と/に, か/や) — both choices grammatical, meaning differs; show both translations after.

### Phase 4.3 — Test fidelity

- [ ] **P3.1 Listening module** with three JLPT N5 formats: 課題理解 (task), ポイント理解 (point), 発話表現 (utterance). Speed control 0.75/1.0/1.25×, replay limits.
- [ ] **P3.2 Reading passages module** (~30 short passages 80-200 chars, JLPT-format comprehension questions, optional timer in test mode).
- [ ] **P3.3 並べ替え production drills** — already partially live as `sentence_order` question type; verify it covers the brief's intent (5-7 word/phrase chips, drag-to-order).
- [ ] **P3.4 Type-the-answer drills** with forgiving matcher (kana/romaji input, ignore punctuation, normalize half/full-width).

### Phase 4.4 — Polish

- [ ] **P4.1 Settings panel**: UI language, furigana mode (always-on / always-off / unknown-kanji-only), theme (light/dark/system), font size (S/M/L/XL), audio speed default, daily new-card limit, daily review cap, reset progress (double confirm), export, import.
- [ ] **P4.2 PWA manifest** + service-worker upgrade. `display: standalone`, proper icons, install-to-home-screen on mobile.
- [ ] **P4.3 i18n layer** with `/locales/{en,vi,id,ne,zh}.json`. Ship en at v1; structure ready for the other 4 languages.
- [ ] **P4.4 Export / import progress** to `progress.json`. Round-trip without loss.
- [ ] **P4.5 Accessibility audit** (WCAG 2.1 AA): keyboard navigation, visible focus, contrast ≥ 4.5:1 text / ≥ 3:1 UI, audio transcripts, no color-only signaling, NVDA/VoiceOver/TalkBack tested.

### Cross-cutting / corpus

- [ ] **P-cross.1 lang="ja"** wrappers on every Japanese text node (or container).
- [ ] **P-cross.2 Vocabulary corpus to ~800 N5 words** with kanji, kana, romaji, English, POS, audio, lesson tag.
- [ ] **P-cross.3 Kanji corpus to ~100 N5** with on'yomi, kun'yomi, meanings, stroke count, stroke-order SVG, 3-5 example words.
- [ ] **P-cross.4 Reading + listening corpus** of ~30 graded passages with audio.

### Pre-release QA gate

- [ ] No console errors on load.
- [ ] FCP < 1.5s on simulated 4G.
- [ ] Works fully offline after first load.
- [ ] Japanese text renders in Japanese font on a clean Windows machine without JP language pack.
- [ ] Furigana toggle hides/shows ruby across the whole app.
- [ ] Audio plays on iOS Safari (verify autoplay policies).
- [ ] Export → wipe → import round-trips progress.
- [ ] Lighthouse: Perf ≥ 90, A11y ≥ 95, Best-Practices ≥ 95, SEO ≥ 90, PWA installable.
- [ ] Screen reader announces "に, particle" not "ni" or silence.
- [ ] No outbound network calls during a normal learning session.

---

## Hard constraints to preserve (from §0 of the brief)

1. Static-only — GitHub Pages, no server.
2. No data leaves the device — no analytics, no telemetry, no remote API at runtime.
3. No login.
4. Offline-capable after first load.
5. Cross-browser: Chrome, Firefox, Safari, Edge (last 2 versions); Mobile Safari + Chrome Android first-class.
6. Backups via export/import (no cloud sync).

## Out of scope (per §8 of the brief)

- User accounts, social features, leaderboards.
- Cloud sync (export/import covers this).
- Anything beyond N5 in this codebase.
- Speaking practice with microphone input.
- Runtime AI / TTS calls. Any AI must happen at build time.

---

## Earlier completed phases

### Phase 1 + 2 + 3 (now done — see git history)
- Engine + scaffold (vanilla HTML/CSS/JS, hash router, LocalStorage, furigana toggle, 4 chapters + Drill + Diagnostic, threshold-based weak detection, service worker)
- Tools (`build_data.py`, `check_coverage.py`, `lint_content.py`, `build_spec.py`, `generate_stub_questions.py`)
- 19 KB content fixes (teacher's audit — verification.md)
- Pattern catalog: 187 entries across 23 categories
- Question bank: 249 entries (no stubs)
- Pushed + verified live on Pages
- Browser tests 37/37
