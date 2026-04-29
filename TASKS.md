# JLPT N5 Grammar Tutor — Tasks

Last updated: 2026-04-29 (Phase 1 complete)

Mirrors the in-session TodoWrite list. If updated in either place, sync the other.

## Completed (47)

### Spec & content
- [x] Read & analyze original Functional Spec v1
- [x] Pedagogical review identifying 13 improvements
- [x] Capture 5 design decisions for v2 (furigana default, stack, Submit UX, pattern source, `meaning_ja` rule)
- [x] Author Spec v2 with all amendments folded in (changelog + 14 sections)
- [x] Back up Spec v1 as separate `.docx`
- [x] Update `tools/build_spec.py` 22 → 23 categories and regenerate `.docx`

### Scaffold
- [x] Folder structure (`.claude`, `css`, `js`, `data`, `tools`, `KnowledgeBank`)
- [x] Vanilla HTML/CSS/JS shell, no build step
- [x] Hash router and chapter coordinator (`js/app.js`)
- [x] LocalStorage adapter with rolling pattern history + SRS state (`js/storage.js`)
- [x] Furigana toggle + ruby renderer (`js/furigana.js`)
- [x] N5 kanji whitelist generated from `KnowledgeBank/kanji_n5.md` (**101 chars**)
- [x] N5 vocab whitelist generated from `KnowledgeBank/vocabulary_n5.md` (**933 tokens**)
- [x] N5 kanji readings map generated (**97 entries** — primary single-pick reading per kanji)
- [x] Content tools (`build_data`, `check_coverage`, `lint_content`, `build_spec`, `generate_stub_questions`)
- [x] README with run + deploy instructions

### Chapters
- [x] Chapter 1 Learn — TOC + 7-block pattern detail + status badge
- [x] Chapter 2 Test — setup / attempting / results
- [x] Chapter 3 Review — weak-pattern cards
- [x] Chapter 4 Summary — stats + listings + heatmap + next-step + reset
- [x] Drill mode — SRS engine, 1d/3d/7d/14d boxes, immediate feedback, due-today badge, graduation verified
- [x] Diagnostic test — 10-question placement check, seeds SRS without affecting test history, banner on first-run TOC, re-runnable from Summary

### Behaviors
- [x] Question types — MCQ, dropdown, sentence_order
- [x] Visible-but-disabled Submit with remaining-count tooltip
- [x] Per-distractor explanations on results (only for picked answer)
- [x] Threshold-based weak detection (`errorRate ≥ 0.5 AND attempts ≥ 2`)
- [x] SRS state transitions: wrong → 1d (immediately due), correct in drill → next box, 4 consecutive → graduated
- [x] Mark-as-known checkbox (FR-W4 manual mastery override; cleared on next miss)
- [x] Furigana N5-kanji annotation with toggle (pragmatic single-pick readings)
- [x] Service worker — pre-caches 19 app-shell + data assets, cache-first strategy, scope=origin

### Content authored
- [x] **Pattern catalog: 187 entries across 23 categories** (matches `KnowledgeBank/grammar_n5.md` bullet count). Lint clean for kanji + vocab scope. Coverage 187 / 187.
- [x] **51 fully-authored questions** covering 19 patterns (n5-001 through n5-019: copula + 12 particles + 3 demonstratives + 3 question words). 7-block spec template with form variety.
- [x] **168 stub questions** (recognition-style "match meaning to pattern") for n5-020 through n5-187. Total: 219 questions.
- [x] Dedupe Demonstratives category labels

### Project hygiene & verification
- [x] Relocate all project files into `JLPT/N5/`
- [x] Spec builder reproducible via `tools/build_spec.py` + cp932 print fix
- [x] Audit KnowledgeBank reorganization — all path references prefixed correctly
- [x] Wire `tools/lint_content.py` to check vocab whitelist too (kanji-bearing token check with inflection tolerance)
- [x] `lint_content.py` ASCII-safe stdout
- [x] End-to-end browser preview verified (setup → attempt → submit → results → review → summary → drill → diagnostic → mark-as-known → furigana toggle → SW caching)
- [x] GitHub Pages deployment audit: all paths relative, hash routing, service worker self-scoped, no path-rewriting needed. Ready to deploy. Final verification (clicking through on actual GH Pages URL) is pending the user's push.

---

## Pending — Phase 2.5 KB → derived-data sync (NEW, 2026-04-29)

> After 4 KB audit passes (24 fixes total), derived files were partially regenerated. The grammar.json skeletons (n5-020 through n5-187) carry stale `meaning_en` text from before the Pass 1/2/3 markdown edits. The detailed entries (n5-001 to n5-019) are independent of md text and are fine.

- [ ] **S1**: Regenerate `data/grammar.json` skeleton entries (n5-020 through n5-187) from the current `KnowledgeBank/grammar_n5.md`. Keep the 19 detailed entries (n5-001 to n5-019) intact. Picks up all Pass 1/2/3 pattern-text changes — most importantly:
  - もの/もん gloss expansion (G7)
  - Verb-てから correction (G2)
  - Object + counter + Verb relabel (G3)
  - ～も → ～も～です clarification (P2-1)
  - ～は～ですが、～は～です contrastive expansion (P2-2)
  - Verb-stem + たいです i-adj note (G9)
  - なんがつ / なんにち slash separator (G8)
  - Verb-う notation (G1)
  - Question word + か / も compounds (Genki gap fix)
- [ ] **S2**: Update `verification.md` to fold in Pass 2 (P2-1, P2-2, P2-6) and Pass 3 (P3-1, P3-2) findings. Currently the report only documents Pass 1 (the original 19 G/K/V findings).
- [ ] **S3**: Regenerate `JLPT N5 Grammar Tutor – Functional Spec.docx` via `python tools/build_spec.py`. The build_spec.py already had its 22→23 category fix; this is just to re-emit the docx so the user-facing spec reflects current state.
- [ ] **S4**: Sanity-check `data/questions.json` stub text for the 168 skeleton questions — verify each `prompt_ja` and `correctAnswer` still references a pattern name that exists in the current `KnowledgeBank/grammar_n5.md`. Stubs key on `grammarPatternId` so most should be fine, but spot-check 5–10 to confirm.

---

## Pending — Phase 2.6 Stub-question UX fixes (NEW, from in-app screenshot review)

> A user-visible stub question revealed three layered defects. Captured screenshot: prompt asks "choose the pattern that matches the meaning", question text is the dev-side placeholder `(stub) — pattern needs authoring. See KnowledgeBank/grammar_n5.md for source`, and two of the four MCQ choices are generation artifacts: bare `～` and bare `Verb`.

- [ ] **Q1**: Fix the skeleton-generator regex bug that produced bare `Verb` and bare `～` pattern strings in `data/grammar.json`. Root cause: the original regex `^([^(]+?)\s*\(([^)]+)\)\s*(.*)$` non-greedy-matched at the first `(`, mis-splitting:
  - `Verb (plain) + Noun (relative clauses — basic)` → pattern became `Verb`
  - `Verb (plain) + まえに (before doing)` → also `Verb`
  - `Verb (plain past) + あとで (after doing)` → also `Verb`
  - `～(の中)で～がいちばん～です` → pattern became `～`
  
  Fix: either skip parenthetical extraction entirely (store full bullet as `pattern`) or use a smarter heuristic (only treat parenthetical as meaning if it looks like English description, e.g., contains a space or is at the end of the line). Subsumed by **S1** if the regenerator is rewritten — call out explicitly.
- [ ] **Q2**: Replace the user-visible stub placeholder text in `data/questions.json`. Current value: `question_ja: "(stub) — pattern needs authoring. See KnowledgeBank/grammar_n5.md for source"` — this dev-side text is being shown directly to learners. **Interim fix**: substitute a polite "this pattern is still being authored — please come back later" message in Japanese, OR hide the question entirely from `Test` setup until the corresponding `grammarPatternId` has a fully-authored entry in `grammar.json`. **Real fix**: Q4 below (Phase 3 authoring).
- [ ] **Q3**: Improve distractor selection for stub MCQ questions. Currently the four choices are sampled from completely different categories (existential / demonstrative / particle-with-negative / verb-modifier appearing together), so the question tests *nothing* even when the choices are valid. Either (a) constrain distractors to the same `category` as the correct pattern, or (b) drop recognition-style MCQ entirely once Phase 3 fill-in-blank authoring catches up.
- [ ] **Q4** (= Phase 3 priority): **Replace all 168 stub questions with real fill-in-blank questions** tied to the example sentences in each pattern's `examples[]` array. This is the only fix that makes the questions pedagogically meaningful. Already tracked under Phase 3 below; called out here so Q1–Q3 are understood as interim mitigations until Q4 lands.

---

## Pending — Phase 2.7 Project-wide em-dash purge (NEW directive, 2026-04-29)

> User directive: *"there are no em dashes in the complete website or any of the documents"*. Em dash = `—` (U+2014). The Japanese long-sound mark `ー` (U+30FC) is a different character used in Japanese phonology (コーヒー, ラーメン) and must NOT be touched.

- [ ] **E1**: Sweep all KB markdown files (`KnowledgeBank/sources.md`, `grammar_n5.md`, `kanji_n5.md`, `vocabulary_n5.md`) and replace every `—` (U+2014) with a context-appropriate substitute: hyphen `-`, colon `:`, comma `,`, or rephrase. Do NOT touch `ー` (U+30FC).
- [ ] **E2**: Sweep `data/grammar.json` — em dashes appear in `meaning_en`, `explanation_en`, `notes`, `common_mistakes`, and within example sentences. Replace each per E1's rules.
- [ ] **E3**: Sweep `data/questions.json` — em dashes appear in stub placeholder text and many `question_ja` / `prompt_ja` / explanation strings. Replace per E1.
- [ ] **E4**: Sweep all top-level docs (`README.md`, `TASKS.md`, `verification.md`) — replace em dashes consistently. (This file's own em dashes count.)
- [ ] **E5**: Sweep `tools/build_spec.py` source strings — replace any em dashes in spec text so the regenerated `.docx` has no em dashes. Then regenerate the spec docx.
- [ ] **E6**: Sweep `js/*.js` and `index.html` for any inline UI strings with em dashes (e.g., button labels, status text).
- [ ] **E7**: Add a `tools/lint_em_dash.py` script (or add to `lint_content.py`) that fails CI / grep returns no matches for `—` across the project. Becomes a permanent guard.

---

## Pending — Phase 2.8 MCQ stub-question correctness fixes (NEW, from screenshot batch review, 2026-04-29)

> Five additional screenshots reviewed beyond the original `(stub)` one. Together they reveal that the recognition-MCQ stubs ship choices that are dev-side category descriptors and verbose labels, not actual Japanese grammar pattern strings. The 168 stub questions need a structural fix beyond Q1's regex bug. Q5–Q9 are the new findings.

- [ ] **Q5**: Eliminate meta-description strings as MCQ choices in `data/questions.json` and `data/grammar.json`. Examples seen: `possessive / noun-modifier` (the consolidated `の` sub-bullet from grammar_n5.md §2 leaked into a pattern field), `い-Adjective negative: ～くないです / ～くありません` (verbose label rather than a single pattern). Each MCQ choice must be a clean Japanese pattern string or pedagogical label, not a category descriptor.
- [ ] **Q6**: Tighten generic English meaning prompts. Current stubs use too-broad glosses like `because` (matches から / ので / んです) and `but — clause connector` (matches でも / しかし / が / けれど). Replace each with a disambiguating phrase that uniquely identifies one pattern (e.g., `because (formal / written)` for ので, `because (spoken, listing reasons)` for から).
- [ ] **Q7**: Strip `etc.` and similar abbreviation markers from choice text. Seen: `いくつ / いくら / なんにん / なんまい etc.` — choices should be self-contained, not partial enumerations.
- [ ] **Q8**: Standardize MCQ choice format across the entire stub bank. Pick ONE convention and apply project-wide:
  - Option A — pure Japanese pattern strings only (e.g., `～たり〜たりする`, `～んです`, `〜が好きです`)
  - Option B — Japanese pattern + structural English hint (e.g., `Verb-stem + たいです (want to)`, `い-Adj + です`)
  - Currently stubs mix both; some have neither. Pick A or B and rewrite.
- [ ] **Q9**: Add a content-validation script (`tools/validate_questions.py`) that fails when any question's `correctAnswer` or `choices[]` contains: a meta-description (no Japanese characters AND no `Verb`/`Adj`/`Noun` keyword), an em dash, an `etc.` token, or a string longer than ~30 characters (heuristic for verbose labels). Run this as part of the lint pipeline.

---

## Pending — Phase 3 content enrichment (for "truly accurate" v1)

> Phase 1 (engine + scaffold) and Phase 2 (KB-content fixes + push) are done.
> The live site has 19 fully-authored patterns with rich examples / common
> mistakes / form rules, plus 168 skeleton patterns where the parallel-authored
> grammar.json entries are placeholders (`meaning_en: "TBD"`, empty examples).
> The 168 stub questions are recognition-only — they work in the engine but
> don't teach with example sentences. Closing those gaps is Phase 3.

### Phase 3 priorities (in batches of ~15 patterns)

- [ ] **Batch 1**: ます-form basics (ます / ません / ました / ませんでした / ましょう / ましょうか / ませんか), い-adj basics, な-adj basics, plain forms
- [ ] **Batch 2**: te-form intro + expressions (ています / てください / てもいいです / てはいけません), comparison, たい (want to)
- [ ] **Batch 3**: existence (あります/います), counters, giving/receiving, time expressions
- [ ] **Batch 4**: conjunctions, から/ので causation, set patterns (すき/きらい/じょうず/わかる/できる/ほしい)
- [ ] **Continue** until all 187 patterns have real form_rules + examples + common_mistakes
- [ ] **Replace stub questions** with real fill-in-blank tied to the authored examples
- [ ] **Final audit**: zero TBD patterns, zero stub-only questions, all 37+ tests passing, lint clean, coverage 187/187

---

## Pending (legacy — already addressed)

### Phase 2: KB content accuracy fixes (NEW — teacher's audit, 2026-04-29)

> 19 findings from a thorough re-read of the KnowledgeBank files from the perspective of a seasoned Japanese teacher. Categorized by type. See `verification.md` for cross-source justification of each.

#### Kanji-rule violations (3)
- [x] **G4**: `KnowledgeBank/grammar_n5.md` §23.2 example — `日よう日は` → `日曜日は` (曜 is in N5 syllabus) ✅
- [x] **G5**: `KnowledgeBank/grammar_n5.md` §23.4 example — `日よう日は` → `日曜日は` ✅
- [x] **G6**: `KnowledgeBank/grammar_n5.md` §23.4 example — `まい日` → `毎日` (both 毎 and 日 are N5) ✅

#### Mislabels / wrong pattern names (2)
- [x] **G2**: `KnowledgeBank/grammar_n5.md` §7 — `Verb-から (after doing — Verb-てから)` is wrong; Verb-から alone means "from / because". Simplify to `Verb-てから (after doing)`. ✅
- [x] **G3**: `KnowledgeBank/grammar_n5.md` §12 — `Verb + counter + Verb (e.g., りんごを ふたつ かいました)` is mislabeled; the example is **Object + counter + Verb**. ✅

#### Semantic errors / homophone handling (5)
- [x] **V1**: `KnowledgeBank/vocabulary_n5.md` §27 — `ひく "to pull"` labeled as "variant of" `ひく "to play instrument"`. They're separate verbs (引く vs 弾く). Relabel as homophones. ✅
- [x] **V2**: `KnowledgeBank/vocabulary_n5.md` §31 — three `あつい` entries (hot weather / hot to touch / thick) labeled as "variants". They're three separate adjectives (暑い / 熱い / 厚い). Relabel as homophones. ✅
- [x] **V3**: `KnowledgeBank/vocabulary_n5.md` §31 — `はやい "early / fast"` glossed as "one reading covers both senses". They're two separate adjectives (早い / 速い). ✅
- [x] **V4**: `KnowledgeBank/vocabulary_n5.md` §31 — `やさしい "easy / kind"` lumped together. Two separate adjectives (易しい / 優しい). ✅
- [x] **V5**: `KnowledgeBank/vocabulary_n5.md` §28 — `けす` is misclassified as Group 2 (る-verb). It's Group 1 (godan, ends in す). Move to §27. ✅

#### Notation inconsistencies (2)
- [x] **G1**: `KnowledgeBank/grammar_n5.md` §6 — `Verb-u` mixes romaji with kana `Verb-る`. Replace with `Verb-う`. ✅
- [x] **G8**: `KnowledgeBank/grammar_n5.md` §4 — `なんがつ なんにち` missing slash separator (others use `A / B`). Use `なんがつ / なんにち`. ✅

#### Pedagogical improvements (6)
- [x] **G7**: `KnowledgeBank/grammar_n5.md` §1 — `～もの / もん (informal contraction)` gloss is too terse. Should describe as a sentence-final particle giving reasons (with もん as the casual contraction of もの). ✅
- [x] **G9**: `KnowledgeBank/grammar_n5.md` §11 — `Verb-stem + たいです` should note that たい inflects as an い-adjective (たくない, たかった, etc.). ✅
- [x] **K1**: `KnowledgeBank/kanji_n5.md` — 道 lists rare on-yomi トウ. Per the file's own "primary N5 use" rule, simplify to ドウ only. ✅
- [x] **K2**: `KnowledgeBank/kanji_n5.md` — 読 lists rare on-yomi トク, トウ. Simplify to ドク only. ✅
- [x] **V6**: `KnowledgeBank/vocabulary_n5.md` §11 — Add `一日 (いちにち) — one day, all day` (distinct from `一日 (ついたち) — 1st of the month`; JLPT Sensei lists both). ✅
- [x] **V7**: `KnowledgeBank/vocabulary_n5.md` §9 — `かい` listed twice for "floor (of building)" and "occurrences" with no disambiguation. Disambiguated via example syntax instead of kanji (kanji 階/回 are not in N5 syllabus). ✅

#### Style consistency (1)
- [x] **V8**: KB-wide — mixed kanji-vs-kana convention in examples (e.g., grammar examples use kana for 休 / 行 / 来 even though those kanji are in N5). Convention adopted: **use N5 kanji whenever the syllabus permits**, kana only for okurigana and out-of-scope kanji. Applied to all Section 23 examples (来 / 読 / 見 / 行 / 休 / 食 / 今日 / 食べかた / 読みかた). ✅

### Phase 2 Audit — Pass 2 (after Pass 1 fixes, 2026-04-29)

> Re-reading Pass 1 results in case fixes introduced new issues, plus a careful re-scan for items missed in Pass 1.

- [x] **P2-1**: `KnowledgeBank/grammar_n5.md` §1 line 20 — `～も` is too terse. Expand to clarify the pattern is "X も Y です" (X is also Y). ✅
- [x] **P2-2**: `KnowledgeBank/grammar_n5.md` §1 line 21 — `～は～が、～は～` is truncated and ambiguous. Clarify it's a contrastive pattern where `が` here is the conjunction (but), not the subject particle. ✅
- [x] **P2-6**: `KnowledgeBank/vocabulary_n5.md` §30 — `いる "to exist (animate)"` is duplicated between §28 (Group 2 verbs) and §30 (Existence) without the cross-listing annotation that the file's variant policy requires. ✅

### Phase 2 Audit — Pass 3 (2026-04-29)

- [x] **P3-1**: `KnowledgeBank/vocabulary_n5.md` §27 line 708 — `とる "(variant of above)"` labeling for とる "to take a photo" is inconsistent with V1-V4. Relabel as homophone (取る vs 撮る, separate verbs sharing the kana). ✅
- [x] **P3-2**: `KnowledgeBank/vocabulary_n5.md` §27 — `つとめる "to work for / be employed"` is **misclassified as Group 1** (godan). 勤める is actually Group 2 (ichidan): conjugates 勤めます / 勤めて / 勤めない. Move to §28. ✅

---

### Phase 2: Deployment

- [x] **Push to GitHub and verify deployment on actual GitHub Pages**
  - Repo: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
  - Live URL: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
  - HEAD: `ecb27e8` (initial Phase 1 commit)
  - Pages status: built · HTTP 200 verified on `/` and `/data/grammar.json`
  - GH007 email-privacy worked around via noreply email `243459266+gauravaccentureproducts@users.noreply.github.com`
- [x] Browser test suite (`tests.html`) — **37/37 passing** (storage, SRS transitions, weak detection, mark-as-known, furigana, grading)

---

## Notes

- Spec is canonical: `JLPT N5 Grammar Tutor – Functional Spec.docx` (v1 backup preserved alongside).
- Pattern coverage source-of-truth: `KnowledgeBank/grammar_n5.md` (187 bullet entries, ~86 conceptual patterns per `verification.md`).
- Pattern coverage check: `python tools/check_coverage.py` reports 187 / 187 OK.
- Content lint: `python tools/lint_content.py` clean (kanji + vocab in scope).
- Question bank: 219 total (51 real + 168 stubs).
- SRS state: stored in LocalStorage under `jlpt-n5-tutor:history`. Patterns enter at 1d (immediately drillable) on miss, advance 3d → 7d → 14d → graduated on consecutive correct in Drill.
- Service worker: caches `index.html`, all `js/`, `css/main.css`, all `data/*.json`, and the `README.md` / `TASKS.md`. Bump `CACHE_VERSION` in `sw.js` per release.
