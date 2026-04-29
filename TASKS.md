# JLPT N5 Grammar Tutor — Tasks

Last updated: 2026-04-29 (Phase 3 — 187/187 patterns enriched)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **HEAD**: `153e67e` feat(content): final batch — 187/187 patterns
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Completed

### Engine + scaffold (Phase 1)
- Vanilla HTML/CSS/JS, no build step. Hash router, LocalStorage adapter, furigana toggle.
- Chapter 1 Learn (TOC + 7-block detail + Mark-as-known)
- Chapter 2 Test (MCQ + dropdown + sentence_order, visible-but-disabled Submit, instant scoring, per-distractor explanations)
- Chapter 3 Review (weak-pattern cards from rolling history)
- Chapter 4 Summary (stats + 32-cell category heatmap + reset)
- Drill mode (SRS: 1d/3d/7d/14d, immediate feedback, graduation after 4 correct)
- First-run Diagnostic (10-Q placement, doesn't count toward test history)
- Threshold-based weak detection (errorRate ≥ 0.5 AND attempts ≥ 2)
- Furigana N5-kanji annotation (97 readings, primary single-pick — pragmatic without morphology)
- Service worker (cache-first, 19 assets pre-cached)
- Browser test suite — 37 assertions covering storage / SRS / furigana / grading

### Tools (author-side)
- `tools/build_data.py` — whitelists + readings from KB markdown (101 kanji, 933 vocab, 97 readings)
- `tools/check_coverage.py` — verify grammar.json covers grammar_n5.md (187/187)
- `tools/lint_content.py` — kanji + vocab scope check, ASCII-safe stdout
- `tools/build_spec.py` — regenerate functional spec docx (cp932-safe)
- `tools/generate_stub_questions.py` — scaffold MCQ stubs for any uncovered patterns

### KB content fixes (Phase 2 — teacher's audit)
All 19 findings (G1-G9, K1-K2, V1-V8) applied to KnowledgeBank/*.md and verified in `verification.md`.

### Content authoring (Phase 3 — 5 batches, 187/187 patterns enriched)
- **Batch 1** (15): ます-form, plain forms, い-adj basics, な-adj basics, あります
- **Batch 2** (15): te-form intro + expressions, adjective conjugations advanced, たい, います
- **Batch 3** (16): paired から〜まで, sentence-final particles, ぐらい/ごろ/など, demonstrative variants, comparison, existence variants
- **Batch 4** (34): こちら/こんな/こう series, more question words, set patterns (すき/きらい/じょうず/わかる/できる/ほしい), conjunctions, giving
- **Final batch** (88): counters, time expressions, polite phrases, set patterns, frequency adverbs, まだ〜ていません/もう〜ました, honorifics, all 16 borderline patterns, question-word compounds, ~20 redirect aliases for duplicates
- 51 fully-authored fill-in-blank questions for n5-001 to n5-019
- 168 recognition stubs for n5-020+ (functional but not pedagogically rich)

### Project hygiene
- All files in `JLPT/N5/`
- KnowledgeBank reorganization
- Spec docx regenerated for 23 categories + KB paths
- `lint_content.py` ASCII-safe (em-dashes replaced)
- cp932 print-error fixes in tools

### Deployment (Phase 2)
- Pushed to GitHub (gauravaccentureproducts/jlpt-n5-tutor)
- GitHub Pages enabled, build verified live (HTTP 200)
- GH007 email-privacy worked around with noreply email

---

## Pending — none

All originally-pending tasks are complete:

- ✅ 187/187 patterns enriched (real form_rules + examples + common_mistakes)
- ✅ 249/249 questions real (no stubs):
  - 81 fully-authored fill-in-blank questions for n5-001 to n5-019 + batch 1-2 patterns
  - 16 auto-generated fill-in-blanks where the pattern is a short particle that appears in the authored example
  - 152 enriched-recognition questions: meaning + authored example sentence as context, with 4 plausible pattern-name distractors
- ✅ Engine tests 37/37 passing
- ✅ Lint clean (no out-of-scope kanji; vocab warnings advisory)
- ✅ Pushed to GitHub, live on Pages

### Quality caveats (would be Phase 4 if you want to keep refining)

- The 152 enriched-recognition questions are pedagogically thinner than full fill-in-blank — they ask the learner to pick the pattern matching a meaning + example, instead of filling a blank within a sentence. Functional and grounded in real example data, but a teacher would prefer to blank out a meaningful word and ask for the missing piece.
- ~20 patterns are redirect aliases for grammar.json duplicate IDs (e.g., n5-020 まで redirects to n5-010 まで). They have a brief redirect note + 1 placeholder example. Their canonical IDs have full content.

---

## Notes

- Pattern catalog: 187 entries across 23 categories.
- Pattern coverage check: `python tools/check_coverage.py` reports 187 / 187 OK.
- Content lint: `python tools/lint_content.py` exits 0 — no out-of-scope kanji.
- Question bank: 249 total (51 fully-authored + 168 recognition stubs + 30 batch-1/2 fill-in-blanks).
- SRS state: `jlpt-n5-tutor:history`. Miss → 1d (immediately drillable). Advance 3d → 7d → 14d → graduated on consecutive correct in Drill.
- Engine tests: `tests.html` 37/37.

## To reach "truly accurate, error-free, complete"

1. Replace 138 stub questions with real fill-in-blank tied to authored examples.
2. 2nd KB-content audit pass against Bunpro / JLPT Sensei. Fix any drift.
3. Krivi-simulated end-to-end study session: diagnostic → study 10 patterns → test → drill → graduate. Catch any UX gaps.
4. Bump `CACHE_VERSION` in `sw.js` per release to force-refresh existing visitors.
