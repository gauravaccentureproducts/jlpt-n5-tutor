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
- **NEW (KB-only, not yet wired into app):** 5 KB question-bank files authored (589 questions total) covering all four JLPT N5 written-test sections:
  - `KnowledgeBank/moji_questions_n5.md` (100 Qs - 漢字読み 50 + 表記 50)
  - `KnowledgeBank/goi_questions_n5.md` (100 Qs - 文脈規定 50 + 言い換え類義 50)
  - `KnowledgeBank/bunpou_questions_n5.md` (100 Qs - 文法1 60 + 文法2 30 + 文章の文法 10)
  - `KnowledgeBank/dokkai_questions_n5.md` (100 Qs - 短文 60 + 中文 30 + 情報検索 10)
  - `KnowledgeBank/authentic_extracted_n5.md` (189 source-attributed authentic Qs from `learnjapaneseaz.com/jlpt/jlpt-n5` across 23 reading passages, 8 grammar tests, 3 kanji tests, 3 vocab tests)

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

### Phase 4.3.5 — Wire the new KB question banks into the app (NEW, 2026-04-29)

> 5 question-bank files were just authored in `KnowledgeBank/` (498 questions total: 4 original-adaptation files of 100 Qs each + 1 source-attributed file of 98 authentic extracted Qs). They are study-ready as reference material but are not consumed by the app's `data/questions.json` yet. Wiring them up is the bridge between "study reference" and "app-driven mock test".

- [ ] **W1 Schema decision**: Add a `category` field to `data/questions.json` entries: `"category": "moji" | "goi" | "bunpou" | "dokkai"`. Add a `subtype` field for the within-section type (e.g., `"subtype": "kanji_yomi" | "hyouki" | "bunmyaku" | "paraphrase" | "bunpou_1" | "bunpou_2" | "text_grammar" | "tanbun" | "chuubun" | "joho_kensaku"`). Optional `source_url` for attributed items.
- [ ] **W2 Build a Markdown→JSON converter** `tools/import_kb_questions.py` that:
  - Parses each `KnowledgeBank/*_questions_n5.md` (and `authentic_extracted_n5.md`) by H3/H4 question headers
  - Extracts stem (with passage if present), 4 options, correct answer number, optional rationale
  - Emits JSON entries matching the existing `questions.json` schema plus the new `category` / `subtype` / `source_url` fields
  - Idempotent (re-running re-syncs from md without duplicating)
- [ ] **W3 Test-engine UI: category / subtype filtering** in `js/test.js` setup screen. Add a "Mock test" mode that respects the actual JLPT N5 paper structure (Moji-Goi paper: 25 min; Bunpou + Dokkai paper: 50 min; correct question counts per subtype).
- [ ] **W4 Render passages** for dokkai questions. Dokkai entries have a longer `passage_ja` field; UI should show passage above questions for 短文/中文 and a separate "info-graphic" component for 情報検索. Update `tests.html` to assert passage rendering.
- [ ] **W5 Lint + coverage**: run `tools/lint_content.py` over the imported questions; the existing project rule allows non-N5 kanji in distractor options for question files (documented header note in `moji_questions_n5.md`). Document this exception in `lint_content.py` so it doesn't throw spurious failures.
- [ ] **W6 README + spec update**: bump pattern/question totals; add Mock-Test mode to README's status block; regenerate Functional Spec docx via `tools/build_spec.py`.
- [ ] **W7 SW cache version bump**: `jlpt-n5-tutor-v1` → `v2` since `questions.json` payload grows substantially. Add the new MD reference files to the cache list (or exclude them from app-shell cache since they are author-only).

### Phase 4.3.6 — Learn-tab content richness (NEW directive, 2026-04-29)

> User directive: *"the structure of learn tab of website should be as rich as `https://learnjapaneseaz.com/jlpt/jlpt-n5` content"*. Reference site analysis below feeds the gap list.

**Reference site structure (learnjapaneseaz.com/jlpt/jlpt-n5):**

- Top-level horizontal nav: JLPT levels (N1-N5), Kanji (N1-N5), Vocabulary (N1-N5), Grammar (N1-N5), Listening, Minna no Nihongo, Japanese Particles, Communication
- Per-N5 landing page lists: practice tests, kanji exercises, vocab exercises, grammar exercises, reading practice, listening scripts, mock papers with answers (7/2024, 7/2025, 12/2024, 12/2025)
- **Grammar list page**: 42 numbered grammar points, each with romaji reading and short English meaning, hyperlinked to dedicated lessons
- **Per-grammar-point lesson page**: title + reading; meaning (multiple definitions); usage patterns (Verb-dictionary + まえに, Noun + のまえに); explanation; 6 numbered example sentences with romaji + English; related-articles list. NO inline exercises (separate practice-test pages)
- **Practice tests**: 25 kanji tests, 17 grammar tests, 23 reading tests, 15+ vocab tests, all linked from category landing pages

**Gap analysis (current app vs reference site):**

| Dimension | Current app | Reference site | Gap |
|---|---|---|---|
| Grammar coverage | 187 patterns, 23 categories | 42 grammar points | App is **ahead** |
| Per-pattern detail | 7-block format (form/connection, meaning, explanation, examples, mistakes, simple JA, notes) | 6-section format (meaning, patterns, explanation, 6 examples, related) | App is **ahead** |
| Vocab section | None (vocab in `vocabulary_n5.md` reference only) | Vocab list + 15+ practice tests | **Gap** |
| Kanji section | Furigana toggle only | Kanji list + 25 practice tests + per-kanji pages | **Gap** |
| Reading section | None | 23 reading-passage practice tests | **Gap** (KB now has 100+ in `dokkai_questions_n5.md`) |
| Listening section | None | Listening + transcripts | **Gap** (out of scope per current brief) |
| Mock papers | None | 4 dated mock papers with answers | **Gap** |
| Browse-by-category UX | Single Learn tab with 23 grammar categories | Top nav: separate Grammar/Kanji/Vocab/Reading sections | **Gap** |

**Tasks:**

- [ ] **L1 Add a Vocab section to Learn tab**. Render `KnowledgeBank/vocabulary_n5.md` as a browsable list (40 thematic sections, ~933 entries). Each entry: kanji form (if N5), reading, English. Plus a per-section "Practice" link that runs `goi_questions_n5.md` items filtered to that section.
- [ ] **L2 Add a Kanji section to Learn tab**. Render `KnowledgeBank/kanji_n5.md` as a 101-card grid. Each card: character + on/kun + meanings + tap-to-flip flashcard mode + per-kanji example words. Practice link runs `moji_questions_n5.md` items filtered to that kanji.
- [ ] **L3 Add a Reading (Dokkai) section to Learn tab**. Render `KnowledgeBank/dokkai_questions_n5.md` passages as a graded-reader interface: difficulty filter (短文 / 中文 / 情報検索), passage view, comprehension questions inline, optional timer.
- [ ] **L4 Add a Mock-Test section**. Full-paper test mode that mirrors actual JLPT N5 paper structure: Moji-Goi paper (25 min, 35 questions sampled across 漢字読み / 表記 / 文脈規定 / 言い換え), Bunpou+Dokkai paper (50 min, ~30 questions). Use the 5 KB question-bank files as the source.
- [ ] **L5 Top-nav redesign**. Current nav: Learn / Test / Drill / Review / Summary / Diagnostic. Proposed: **Learn (Grammar / Vocab / Kanji / Reading)** + Test (with Mock-Test mode) + Drill + Review + Summary. Adds 4 sub-nav items under Learn.
- [ ] **L6 Per-grammar-point "Related" links**. Each pattern detail page should list patterns from same category + patterns frequently confused (the existing `contrasts[]` field already supports this; surface it in UI).
- [ ] **L7 N5-grammar list landing page**. A flat 1-screen list of all 187 patterns grouped by category, romaji-style readable for quick scanning. Mirrors the reference site's grammar-list page UX.
- [ ] **L8 Mark up vocab/kanji links from grammar examples**. Where a pattern's example sentence uses a vocab word or kanji from KB, link it to the vocab/kanji entry. Increases connectivity of the Learn experience.

### Phase 4.3.7 — Japanese-language accuracy audit (NEW directive, 2026-04-29)

> User directive: *"do a japanese language accuracy audit of the website all documents under N5 folder"*.

- [ ] **A1 Engage a fresh teacher-perspective audit pass** over all `KnowledgeBank/*.md` files (4 catalog + 5 question banks). Verify: kanji readings, vocab meanings, grammar form-rules, particle usage, honorific levels, transitive/intransitive pairs.
- [ ] **A2 Audit all `data/grammar.json` patterns** (187 entries) for: form-rule accuracy, example-sentence naturalness, common-mistake rationales, contrast-note correctness.
- [ ] **A3 Audit all `data/questions.json` items** (249 currently in app + the 589 in KB question banks) for: stem grammaticality, distractor plausibility, answer correctness, kanji-rule compliance.
- [ ] **A4 Audit `verification.md` and `README.md`** for any Japanese-language claims that may have drifted post-fixes.
- [ ] **A5 Audit Spec docx** for any Japanese examples - regenerate via `tools/build_spec.py` if any are stale.
- [ ] **A6 Audit `js/*.js` inline strings** for Japanese UI text correctness (e.g., "つぎの いみに あう パターンを えらんでください").
- [ ] **A7 Compile findings as Pass-N entries** in `verification.md` with severity (correctness / pedagogy / style) and apply fixes Pass-by-Pass until 0 findings.

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
