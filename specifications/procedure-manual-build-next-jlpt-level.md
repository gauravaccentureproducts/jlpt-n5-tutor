# Procedure Manual — Building the Next JLPT Level App

**Source project:** JLPT N5 Tutor (this repo)
**Target audience:** any future JLPT level app (N4, N3, N2, N1) using the same architecture
**Prepared:** 2026-05-01 from accumulated N5 build experience (Phases 1-5 + Passes 1-19)
**Status:** Living document — update as the N4 build adds new lessons

This manual is written prescriptively. Where N5 hit a problem, the manual tells the next level how to avoid it. Generic best-practice advice has been omitted; only N5-specific learnings are included.

---

## ⚠ Operating modes — read this first

This document supports **two execution modes**. The bulk of the manual (§§0–16) was written for **Mode A**. **Appendix A (§17+)** carries the supplements required for **Mode B**.

### Mode A — human team + N5 repo as co-resident reference (default)
- Reader: a human + AI assistant (Claude Code) working together over weeks-to-months.
- Required inputs: this manual **and** the N5 source repo at a known path (so "copy from N5" instructions resolve to actual files).
- The manual reads as a prescriptive playbook; "see N5", "copy from N5", "port verbatim" are concrete actions with files to read.
- Estimated effort: 17-25 weeks (per §13).

### Mode B — zero-interaction one-shot agent (limited)
- Reader: a single coding-agent run with no human in the loop.
- Required inputs: this manual **plus the entire N5 repo as a tarball or directory** that the agent can read.
- **Without the N5 repo**, this manual is approximately a table of contents — most "copy from N5" / "port" instructions are unresolvable, schemas and content inventories are not embedded, and one-shot completion is **not feasible**.
- Even WITH the N5 repo: a one-shot agent should use **Appendix A** — it provides default decisions for the §15 open questions, fallback procedures for external-blocked items, a definition-of-done, and a minimum-viable subset to ship if the full scope can't fit in one run.
- Honest expectation: a zero-interaction agent producing a *complete* N4 app in one run is unrealistic. Realistic one-shot deliverable = scaffolded skeleton (build pipeline, schemas, CI, UI shell, ~20% of content) that a human team finishes in subsequent passes.

This split is a direct response to the Pass-20 manual review (`feedback/procedure-manual-review-issues.md`, 40 issues across 6 risk categories). The review's core finding stands: this manual is a *playbook*, not a *self-contained build spec*. Closing that gap fully requires embedding ~5000+ lines of content inventories, schemas, and executable rules — work that is registered as Pass-21 candidate but not yet done.

---

## 0. Scope of "next level"

The same playbook scales N5 → N4 → N3 → N2 → N1, but each transition adds:

| | N5 → N4 | N4 → N3 | N3 → N2 | N2 → N1 |
|---|---|---|---|---|
| Kanji whitelist | 106 → ~280 (+~170) | ~280 → ~650 | ~650 → ~1000 | ~1000 → ~2000 |
| Vocab corpus | ~1000 → ~1500 | ~1500 → ~3700 | ~3700 → ~6000 | ~6000 → ~10000 |
| Grammar patterns | ~187 → ~210 | ~210 → ~250 | ~250 → ~280 | ~280 → ~300 |
| Reading passage length | 80-150 / 250-300 chars | +long-form essays | +newspaper articles | +academic texts |
| Listening pace | slow / clear | natural-but-paced | natural | rapid + dialect |
| Borderline tier | `late_n5` | `late_n4` + `n3_borderline` | etc. | etc. |

The N4 transition is the smallest content jump but introduces the most architectural decisions (tier taxonomy, kanji-policy contention, borderline-grammar handling). N3+ is mostly content scaling.

---

## 1. Day 0 — Repo bootstrap (1-2 hours)

### 1.1 Directory structure (copy from N5)

```
.
├── .claude/
│   ├── CLAUDE.md           # binding rule for Claude Code automation
│   └── settings.local.json # personal permission overrides (gitignored)
├── .github/
│   └── workflows/
│       └── content-integrity.yml
├── KnowledgeBank/          # source-of-truth Markdown
│   ├── grammar_n4.md
│   ├── kanji_n4.md
│   ├── vocabulary_n4.md
│   ├── sources.md
│   ├── moji_questions_n4.md
│   ├── goi_questions_n4.md
│   ├── bunpou_questions_n4.md
│   ├── dokkai_questions_n4.md
│   ├── chokai_questions_n4.md   # NEW: listening was inline at N5; promote to its own file at N4+
│   └── authentic_extracted_n4.md
├── data/                   # JSON derived from KB by build_data.py
│   ├── grammar.json
│   ├── kanji.json
│   ├── vocab.json
│   ├── reading.json
│   ├── listening.json
│   ├── questions.json
│   ├── n4_kanji_whitelist.json
│   ├── n4_vocab_whitelist.json
│   ├── n4_kanji_readings.json
│   └── audio_manifest.json
├── tools/
│   ├── build_data.py
│   ├── check_content_integrity.py
│   ├── test_build_data.py
│   ├── link_grammar_examples_to_vocab.py
│   ├── scan_multi_correct.py     # PORT FROM N5 — paid off for Pass-15
│   ├── heuristic_audit.py        # PORT FROM N5
│   ├── llm_audit.py              # PORT FROM N5 — Anthropic API integration
│   ├── build_audio.py
│   └── tag_vocab_pos.py
├── feedback/                # audit reports, native-teacher reviews
├── specifications/          # spec docs, design system, this manual
├── js/, css/, locales/      # vanilla static front-end
├── index.html
├── sw.js
├── manifest.webmanifest
├── package.json             # only for Playwright + tooling
├── README.md
├── TASKS.md                 # SINGLE SOURCE OF TRUTH for project state
└── MEMORY.md                # session-to-session continuity (Claude Code)
```

### 1.2 Files to create on Day 0 (no content yet, just structure)

- **`.claude/CLAUDE.md`** with the binding-rule statement: blanket autonomous-operation authorization for routine git/file operations in this repo, with explicit deny list (force-push, --hard, rm -rf, etc.). Copy from N5's version verbatim and update level references.
- **`TASKS.md`** with these top-level sections: `Live site`, `Status snapshot`, `External-blocked backlog`, plus a `Pass-1` placeholder. Status snapshot starts empty; populate as content lands.
- **`MEMORY.md`** ≤200 lines, listing project location, key files, current state, branch, HEAD. Update on every session.
- **`tools/check_content_integrity.py`** with the day-1 invariants pre-wired (see §3).
- **`.github/workflows/content-integrity.yml`** running the integrity check on every push/PR. **Make it a hard gate from day 1**, not "warn-only" — once warnings are tolerated they accumulate forever.

### 1.3 Schema decisions to lock in NOW

These are expensive to change later. N5 paid for several of these via mid-project migrations.

- **Question IDs:** `q-NNNN` (4-digit zero-pad, opaque string, never re-numbered). N5 has gaps from deletions; that's fine — document the gap policy in `_meta.id_gap_policy` and treat IDs as opaque keys.
- **Pattern IDs:** `n4-NNN` (3-digit zero-pad). Reserve a numeric range up front for each thematic cluster (e.g., n4-001..n4-050 for Sentence Basics) so insertions don't force renumbering.
- **Vocab IDs:** `n4.vocab.<section-slug>.<form>[.<disambiguator>]`. The section-slug encoding allows the same word to be cross-listed in multiple thematic sections, which the runtime UI uses (do NOT collapse cross-listings — N5 has 10 such pairs, all intentional).
- **Reading IDs:** `n4.read.NNN`. Listening: `n4.listen.NNN`.
- **Universal `_meta` block** in every data/*.json: `schema_version`, `entity_count`, `id_range`, `id_gap_policy`, `history` (append-only log of cumulative changes).
- **Tier taxonomy on grammar entries:** `core_n4`, `late_n4`, `n3_borderline`. **Add this from day 1.** N5 paid for tier-taxonomy retrofit in Pass-13/14.
- **`auto: bool`** flag on every authored entry. `false` = human-reviewed; `true` = template-generated. Used for prioritized native review.

### 1.4 Permissions / automation setup (10 min)

If using Claude Code:

- Copy `.claude/CLAUDE.md` from N5; replace "N5" → "N4".
- `defaultMode: bypassPermissions` in `.claude/settings.local.json`. Add gitignore for `*.local.json`.
- Allow lists for `Bash(git *)`, `Bash(cd *)`, `Edit(**)`, `Write(**)`, plus the `gh pr/release/issue` flavors.
- Deny list for destructive ops: `git push --force`, `git reset --hard`, `rm -rf`, `git branch -D`, etc.

The N5 build wasted ~2 hours iterating on permission patterns because the binding rule wasn't established up front. Skip that pain.

---

## 2. Phase 1 — Foundation (week 1)

### 2.1 Build pipeline first, content second

**Build `tools/build_data.py` BEFORE authoring KB content.** The pipeline is what catches structural errors early; without it you'll hand-edit JSON for weeks before discovering schema drift.

Required parsing:
- Grammar: `^- \*\*([一-鿿]+)\*\*` for kanji headers (allow `[Ext]` suffix tags — N5 had a regex bug here that lost 9 entries).
- Vocab: section headers + entry lines.
- Question files: `### Q\d+` headers, choices as numbered lists, `**Answer: N**` markers.

Required output:
- Each entity gets an `auto: false` flag if hand-authored, `auto: true` if template-generated.
- `_meta` block populated with counts and history.
- Idempotent — re-running on unchanged input = no diff. (N5's build was idempotent; that paid off across 13 Pass cycles.)

Test the pipeline IMMEDIATELY with `tools/test_build_data.py` covering the regression cases that bit N5:
- `[Ext]`-tagged kanji headers parse correctly.
- Parenthetical glosses don't get split on commas (N5 had a bug where `(see, n5-XXX)` fragments split on the comma).
- Plain headers still parse after both fixes.
- E2E: real KB produces N entries with no warnings.

### 2.2 Content integrity invariants (Day 1)

These were added piecewise in N5 (across X-6.1..X-6.9 and JA-1..JA-21). Pre-wire ALL of them on N4 day 1.

| Invariant | What it checks | Lesson |
|---|---|---|
| `X-6.1` Catalog completeness | Every grammar pattern has examples + form_rules | N5 had stubs that shipped before this check |
| `X-6.2` Year-form consistency | 今年 / こんねん / ことし usage matches policy | Had a Pass-14 incident |
| `X-6.3` No mixed kanji+kana words | Don't write 大さか for おおさか | Pass-13 |
| `X-6.4` Lint script present | The lint pipeline exists and runs | Bootstrap |
| `X-6.5` No em-dashes | U+2014 banned project-wide | We stripped 881 in Pass-7 |
| `X-6.6` Ru-verb exception flags | Group-1 ru-verb exceptions flagged BOTH at section header AND per-entry | Pass-9 |
| `X-6.7` No false synonymy | "Direct synonym" rationales flagged for review | Pass-11 |
| `X-6.8` No ASCII digits in TTS source | Numbers must be in kanji or kana for TTS | Pass-8 |
| `X-6.9` Primary-reading sanity | Each kanji's primary on/kun reading is most-frequent | Pass-12 |
| `JA-1` Stem-kanji scope | Question stems use only N4 kanji | Pass-12 |
| `JA-2` Particle-set sanity | Particle MCQs have valid particle distractors | Pass-13 |
| `JA-3` Furigana / catalog match | Furigana annotations match catalog entries | Pass-9 |
| `JA-4` Vocab reading uniqueness | Watch for accidental duplicate readings | Pass-13 |
| `JA-5` Answer-key sanity | `correctAnswer` is in `choices` for MCQ | Pass-9 |
| `JA-6` No two-correct-answers | Auto-detect duplicate stems with same answer | Pass-15 |
| `JA-7` No duplicate stems in file | Even with different answers, dedupe stems | Pass-19 |
| `JA-8` Q-count integrity | `_meta.question_count` matches `len(questions)` | Pass-14 |
| `JA-9` Engine display contract | UI hides `**Answer:**` until commit (test passes) | Pass-2 |
| `JA-10` No "(see n4-)" redirect text | Auto-gen stub redirects forbidden in user-facing fields | Pass-12 |
| `JA-11` No duplicate MCQ choices | All 4 choices distinct per question | Pass-9 |
| `JA-12` Kanji KB / JSON consistency | KB markdown and JSON have same kanji set | Pass-13 |
| `JA-13` No out-of-scope kanji | Anything user-facing limited to N4 whitelist | Pass-13 |
| `JA-14` No auto-ruby in renderer | UI never auto-applies furigana to whitelisted kanji | Pass-13 (regression of Pass-7) |
| `JA-15` Audio refs resolve | Every audio path in JSON has a file on disk | Pass-7 |
| `JA-16` Kanji example whitelist | Example sentences use only target+whitelist kanji | Pass-13 |
| `JA-17` Grammar examples have vocab_ids | Homograph guard linkage populated | Pass-13 |
| `JA-18` Reading explanation kanji ⊂ passage | Question explanation can't introduce new kanji | Pass-15 |
| `JA-19` Reading info-search has format_type | Mondai-6 format tagged for UI rendering | Pass-15 |
| `JA-20` Reading choices kanji ⊂ passage | MCQ correctAnswer matches passage's kanji form | Pass-15 |
| `JA-21` N4-grammar markers require tier=late_n4 | Mid-tier patterns properly tagged (rename for N4) | Pass-15 |

**Add 3 more on N4 from Pass-15/Pass-19 lessons:**
- `JA-22` No "direct synonym / directly equivalent / same as" in goi rationales (catches synonym-overclaim regression).
- `JA-23` Multi-correct scanner: every MCQ where choices include known-interchangeable particle pairs (`に`/`へ` for direction, `から`/`ので` for reason, `は`/`が` for topic-or-subject) is flagged for native review.
- `JA-24` No duplicate `pattern` strings in grammar.json across entries with overlapping `meaning_en` (catches the Pass-19 redundancy class).

### 2.3 Test directly with cp932-aware Python

If contributors are on Japanese Windows: set `PYTHONIOENCODING=utf-8` before any script that prints Japanese, OR pipe through `Out-File -Encoding utf8` and read the file. N5 wasted hours on cp932 mojibake before this was standard. Document it in `MEMORY.md`.

---

## 3. Phase 2 — Content authoring strategy (weeks 2-8)

### 3.1 KB-first, JSON-derived

**Always edit `KnowledgeBank/*.md`, never `data/*.json` directly.** The MD file is the source of truth; JSON is regenerated by `build_data.py`. N5 had Pass-13 disasters when contributors edited JSON directly and the build pipeline overwrote their changes.

Exception: post-build refinements to JSON metadata (vocab_ids, audio paths) that the MD doesn't carry. Those are added by separate enrichment scripts (e.g., `link_grammar_examples_to_vocab.py`).

### 3.2 Anti-patterns from N5 — DO NOT REPEAT

#### 3.2.1 Don't auto-generate filler questions (CRITICAL — N5 Pass-14)

N5 had **38 "pattern-meta" stub MCQs** that asked "What does pattern X mean?" with the answer literally quoted in the stem. They were generated by `generate_stub_questions.py` to inflate the bank to 250. They taught nothing. Pass-14 deleted all 38.

If you find yourself wanting to generate filler MCQs because the bank looks small: **the bank is small for a reason — author real questions, or accept fewer.**

The shape of the failed pattern was: stem `つぎの いみに あう パターン：「X」`, choices = 4 random pattern strings including the correct one. This format CANNOT be saved by any audit; the answer is literally in the stem.

#### 3.2.2 Don't put both interchangeable-pair particles in MCQ choices without scene context (HIGH — N5 Pass-15)

The class of bug: any MCQ stem with a destination-of-motion verb that has BOTH `に` AND `へ` in the choice set is multi-correct. Same for `から`/`ので` (because), `は`/`が` (topic vs subject in many sentences), `に`/`と` (recipient vs companion with でんわをする), `まで`/`から` (until vs from).

Pass-15 fixed 6 such cases in N5 questions. Avoid the class by:
- Keeping only ONE of each interchangeable pair in distractors, OR
- Adding scene-setting context that disambiguates.

The multi-correct scanner (`tools/scan_multi_correct.py`) catches the class automatically; wire it as `JA-23`.

#### 3.2.3 Don't ship "see pattern detail" as a distractor explanation (MEDIUM — N5 Pass-15)

Auto-generated distractor explanations like `Wrong choice - see pattern detail.` are useless. Real distractor explanations contrast the WRONG option's role with the correct one. Example for `に` vs `を` for the recipient of giving:

> 'を already marks プレゼント (the thing being given). あげる takes one を for the object, not two. The recipient slot uses に.'

Author all distractor explanations by hand (or LLM-author then native-review). N5 has ~600 questions; budget ~2-3 minutes per question for proper distractor authoring = ~25-30 hours total.

#### 3.2.4 Don't use ko-so-a-do questions without spatial context (CRITICAL — N5 Pass-15)

The stem `（  ）は ほんです。` with choices これ/それ/あれ/どれ has THREE valid answers (これ, それ, あれ all complete to a grammatical "X is a book"). Only どれ is wrong because it's interrogative.

Always prefix ko-so-a-do questions with scene-setting in parentheses: `(じぶんの 手の中の 本を 友だちに みせて)　（  ）は ほんです。` → only これ fits.

#### 3.2.5 Don't run two parallel Claude Code sessions on the same data file (HIGH — N5 Pass-19 cascade)

If you must, **partition by ID range up front**. N5 had two sessions independently author at q-0454..q-0463, causing a 10-question collision that needed a dedup commit. Lock per-pass ID ranges in TASKS.md before any session starts.

#### 3.2.6 Don't introduce new grammar pattern entries with the same `pattern` string as an existing one (MEDIUM — N5 Pass-19)

The N5 catalog has 9 redundant pattern entries (n5-128 ⊂ n5-009, n5-141 ⊂ n5-094, etc.) created by Pass-15-era splits that didn't retire the merged entries. **Before adding a pattern entry, grep grammar.json for the same pattern string.** If found, decide: split intentionally (different IDs, narrowed meanings, both kept) OR retire-and-replace (one canonical ID).

JA-24 invariant catches this going forward.

### 3.3 Authoring cadence

Roughly the N5 trajectory by week:

| Week | Activity | Deliverable |
|------|----------|-------------|
| 1 | Bootstrap + pipeline | Empty corpus, all CI invariants green on empty content |
| 2-3 | Grammar catalog (KB + build) | grammar.json with N4 patterns, no examples yet |
| 3-4 | Examples + furigana | Each pattern has 2-5 example sentences |
| 4-5 | Vocab catalog | vocab.json with ~1500 entries, sectionalized |
| 5-6 | Kanji catalog | kanji.json with ~280 entries, on/kun trimmed to N4 scope |
| 6-7 | Reading passages | reading.json with ~30 passages |
| 7-8 | Listening items | listening.json with ~30 items |
| 8-10 | Questions (moji + goi + bunpou + dokkai) | 100 each = 400+ questions |
| 10-12 | Native review (Pass-1) | First teacher review of corpus |

Plan ~12 weeks of full-time content work for N4. This was the N5 timeline; N4 is similar.

### 3.4 External corpus extraction (1-2 days)

Pull questions from learnjapaneseaz.com or similar third-party JLPT N4 practice sites for **triangulation only** (do NOT copy verbatim into your bank — copyright). Use them to:
- Cross-check your coverage (do you test the same patterns?).
- Spot multi-correct bugs in their bank that you might inherit.
- Anchor distractor styles.

N5 extracted 175 questions across 17 tests in ~30 minutes via WebFetch. Saved as `feedback/external-questions-<source>.md`. Run a coverage-comparison script (`tools/coverage_compare.py`) afterwards.

---

## 4. Phase 3 — UI / Front-end (weeks 4-9, parallel with content)

### 4.1 Stay vanilla static

**No framework. No build step for runtime.** N5 ships HTML + JS modules + CSS. Everything works offline (PWA). Hash router (`#/learn/...`) means no server. This was the right call; the entire UI is ~3000 lines of JS across ~25 modules and loads instantly.

If you need a build step, limit it to:
- Font subsetting (woff2 + N4 kanji range only — keeps assets small)
- Service worker version bump
- Locale extraction (if i18n)

### 4.2 Day-1 features (port from N5)

- 5-card Learn hub: Grammar / Vocab / Kanji / Dokkai / Listening
- TOC (collapsible by super-category)
- Pattern detail page with **prev/next nav** at top corners (small font, peripheral) + back link + Mark-as-known checkbox + status badge
- SM-2 SRS in Review tab (Again/Hard/Good/Easy 4-button)
- Test mode (mock-test flow, hides answer/rationale until commit)
- Practice / Daily Drill (random sample from weak items)
- Diagnostic Summary (error patterns + recommended next session + session log)
- 5-locale i18n (en at v1, others structured for later)
- PWA manifest + service worker stale-while-revalidate
- Export/import progress as JSON
- Settings: theme, locale, font size, reset progress
- こそあど / は vs が / Verb groups / て-form gym / Particle pairs / Counters (interactive trainers)

### 4.3 Service worker version

N5 is on `jlpt-n5-tutor-v71` after 71 ship cycles. Bump on every shell change. The runtime shows an update toast when a new SW lands. Don't skip this — without versioning, stale shells silently haunt users.

### 4.4 Audio

Use `tools/build_audio.py` from N5 (auto-detects piper-tts / gtts / pyttsx3, idempotent, writes `data/audio_manifest.json`). At N4, **at least listening items SHOULD be native-recorded** — synthetic prosody artifacts at N5 level are tolerable; at N4 they teach learners to discriminate against synthesis artifacts rather than against real Japanese.

This was N5's EB-1 external-blocked item: listening corpus expansion 12 → 30 was approved but blocked on native voice talent. Plan for native recording from the start at N4.

---

## 5. Phase 4 — Audit cadence (continuous, weeks 6+)

### 5.1 Pass-N protocol

Every audit cycle is a "Pass" with:
- A doc at `feedback/<audit-name>-<date>.md` listing findings by severity (CRITICAL / HIGH / MEDIUM / LOW)
- A TASKS.md `## Pass-N <name>` section with `[ ]` checkboxes per finding
- Findings IDs: `F-N.K` where N is pass, K is finding number
- A fix-application phase with explicit "Applied YYYY-MM-DD" markers
- A close-out: "ALL ITEMS APPLIED" or "X of Y APPLIED" + deferred-item rationale

N5 ran 13+ passes. Each was 1-3 days of audit + 1-3 days of fix application.

### 5.2 Recommended pass schedule for N4

| Pass | Focus | Trigger |
|------|-------|---------|
| Pass-1 | First native-teacher review | Once content is ~50% authored |
| Pass-2 | Distractor quality | After all questions authored |
| Pass-3 | Multi-correct sweep (using scan_multi_correct.py) | Pre-launch |
| Pass-4 | Reading passage native review | Pre-launch |
| Pass-5 | Listening native review | When native-recorded audio is in |
| Pass-6 | Cross-coverage vs external corpus | Anytime post-launch |
| Pass-7+ | Quarterly maintenance | Cron'd 90-day cycle |

### 5.3 Native teacher review window

Schedule the first native review BEFORE 100% content authoring, around 50-70%. It's much cheaper to apply structural feedback at 70% than at 100%. N5 paid for this lesson — the early Pass-9 native review caught structural issues that would have been ~5x more work at 100%.

### 5.4 LLM audit as a multiplier

The N5 `tools/llm_audit.py` is a Claude API integration that cost ~$11.50 per full pattern-corpus pass and caught 1.0 finding/pattern (comparable to native density). Use it BETWEEN native-review windows to triage cheap wins.

Validation: 5 patterns sampled before going wide. Native-density baseline = 0.28 - 1.12 findings/pattern (varies by pass). If LLM density is comparable or higher with manageable false-positive rate, ship it.

### 5.5 Quarterly cron

Set up a cron / scheduled job that fires every 90 days to surface external-blocked items and trigger a fresh quarterly audit. N5's is `jlpt-n5-quarterly-pass-audit` — see `.github/workflows/quarterly-audit.yml` (port to N4).

---

## 6. Phase 5 — Quality gates (continuous)

### 6.1 Run the integrity check on every commit

GitHub Actions workflow `.github/workflows/content-integrity.yml`:
- Triggers: `push: [main]` + `pull_request: [main]` + `workflow_dispatch`
- Runs `python tools/check_content_integrity.py -v`
- Runs `python tools/test_build_data.py`
- Hard fail on any violation. **Never `continue-on-error: true`.**

If a fix introduces a violation, fix the data OR add the kanji/particle/construct to the appropriate augmented set in the integrity check tool with a comment explaining why it's legitimately in N4 scope. Never silence by removing the check.

### 6.2 Add new invariants when bugs recur

The N5 invariants (X-6.x + JA-x) accumulated organically — each one was added after a real bug class was caught. When a bug repeats, write the invariant. Examples:
- 38 stub questions across 9 passes → finally added stub-redirect-text invariant (`JA-10`)
- Multi-correct ko-so-a-do bug → added context-presence regex
- Synonym overclaim → grep regex for `irect synonym|directly equivalent`

### 6.3 Status snapshot must reflect current state

The first ~25 lines of TASKS.md are the canonical state-of-the-project. Update them on every significant change (corpus size, SW version, vocab/kanji counts, route list). N5 drifted multiple times and required catch-up commits to refresh.

If your workflow runs scripts that change corpus size, add a post-script step that regenerates the snapshot's numeric fields (extract them from `_meta` blocks).

---

## 7. Tooling that paid off — port these scripts

In rough priority order:

1. **`tools/build_data.py`** — KB markdown → JSON. The single most important script. Port + adapt.
2. **`tools/check_content_integrity.py`** — all invariants. Port the framework + the X-6.x ones; add JA-x as you author content.
3. **`tools/test_build_data.py`** — regression tests for the build pipeline. Port the structure; write new tests as N4-specific bugs surface.
4. **`tools/link_grammar_examples_to_vocab.py`** — homograph-aware vocab linking. Has a sophisticated boundary-check + HOMOGRAPH_RULES system. Port verbatim and extend the rules as new homograph clusters appear at N4 (e.g., 込 readings).
5. **`tools/scan_multi_correct.py`** — 5-category multi-correct candidate scanner. Wire as advisory CI gate.
6. **`tools/heuristic_audit.py`** — cheap mass-scan with deterministic findings (precision ~75% per N5 Pass-15a). Use for first-pass triage.
7. **`tools/llm_audit.py`** — Claude API for deep semantic review. Production-ready in N5; just update prompt template for N4 scope.
8. **`tools/build_audio.py`** — TTS pipeline. Idempotent. Port + add native-recording skip-flag for N4.
9. **`tools/tag_vocab_pos.py`** — POS tagging for vocab. Adapt rules.
10. **`tools/coverage_compare.py`** — external-corpus gap analysis. Port + update for N4 corpus.

Skip these (one-shot diagnostics from N5):
- `_inspect_*.py`, `_check_*.py`, `_dup_*.py` — N5-specific debugging.
- `fix_kosoado_basic.py`, `fix_particle_basic.py`, `fix_pass15_tier2.py` — one-shot Pass-15 fix appliers; useful as audit-trail in N5 but not as code to port.

---

## 8. Process discipline

### 8.1 TASKS.md is the single source of truth

- Every change updates TASKS.md.
- New work goes into a `## Pass-N` section.
- `[ ]` items remain until applied.
- `[x]` items keep "Applied YYYY-MM-DD" markers.
- Status snapshot at top reflects current corpus counts + SW version.
- Externalblocked items get explicit unblock conditions.

### 8.2 Commit discipline

- One logical change per commit. Bundle related fixes into a Pass-N commit; don't mix concerns.
- Commit message format: `type(scope): description`. Body explains the why.
- Co-author trailer for AI-assisted work: `Co-Authored-By: Claude Opus X.Y <noreply@anthropic.com>`.
- Push immediately; don't accumulate local commits.

### 8.3 Backup commits before risky operations

Per N5's CLAUDE.md guidance:
- Git commit before starting ANY batch of fixes
- Git commit after EVERY 2-3 completed fixes
- Tag backup commits clearly: `chore(backup): checkpoint before/after <description>`

This pays off when a fix unexpectedly breaks 5 questions and you need to revert just that batch.

### 8.4 Session continuity

`MEMORY.md` ≤200 lines, refreshed every 1-2 weeks, captures:
- Project location + key paths
- Current branch + HEAD SHA
- File inventory (what's where)
- Test counts
- What's broken / WIP
- Recent decisions

The next Claude session reads this on startup. Without it, every session re-discovers the project structure.

---

## 9. External-blocked items — anticipate up front

N5 has 4 EB items, all foreseeable from the start. Plan for these in N4:

1. **Listening corpus needs native voice talent.** Synthetic TTS is unacceptable at N4. Identify a recording channel (paid voice actor / volunteer / licensed audio) by month 3.
2. **Native teacher reviewer.** ~10-12 hours per full pass. Identify reviewer + budget by month 1. The Suiraku San (N5) reviewer model worked.
3. **Translation of brief / supplement to Japanese.** Only if outreach is in progress; otherwise defer.
4. **Recommender ML.** Defer to v2.0 unless you have a privacy-respecting input source and >10k learners.

Register all 4 in TASKS.md `External-blocked backlog` from week 1 with explicit unblock conditions.

---

## 10. N5-specific wins to keep

These are the things that genuinely worked and should carry forward verbatim:

- **Zen Modern (Muji-inspired) design system** — hairlines not borders, no shadows, no gradients, weights 300/400/500 only. Source of truth at `specifications/jlpt-n5-design-system-zen-modern.md`. Port the spec, replace level references.
- **5-locale i18n shell** (en/vi/id/ne/zh) — the en at v1 + others structured pattern works.
- **Hash-based routing** (`#/learn/...`) — no server, full PWA.
- **Self-hosted fonts** — Inter (300/400/500) + Noto Sans JP 400 subset to N5 kanji range. ~500KB total. Replace subset with N4 kanji range for next level.
- **Diagnostic Summary** with error patterns + recommended next session + session log.
- **SM-2 SRS** with 4-button grading (Again/Hard/Good/Easy) and verified reps (rep 1→1d, rep 2→6d, rep 3→15d, lapse → 1d + EF drops).
- **Export/import** for cross-device portability without telemetry.
- **No telemetry** as a hard constraint. Privacy-first. Don't break this.
- **Em-dash-free codebase** — strip them all (881 in N5). They break round-trips.
- **Browser-runnable test suite** (37 tests in N5) — JS + Playwright smoke tests. CI gate.

---

## 11. Migration considerations N5 → N4

Beyond the obvious content scaling, three architectural decisions:

### 11.1 Tier taxonomy

At N5 we had `core_n5` and `late_n5` (borderline). At N4, plan for THREE tiers from day 1:
- `core_n4` — solidly N4 scope
- `late_n4` — N4 scope but only typically taught at end of N4
- `n3_borderline` — appears in N4 materials but is N3 nuance

JA-21 invariant enforces tier=late_n5 for N4 grammar in N5 content. At N4, the equivalent invariant should enforce tier=n3_borderline for N3 grammar that appears in N4 materials.

### 11.2 Kanji policy escalation

N5 has ~106 kanji in the whitelist, with strict scope enforcement. N4 adds ~170, taking the whitelist to ~280.

**Decision to make on day 1:** does the N4 app re-use N5 kanji (yes — they're prerequisites) or only test the N4-additional 170? Recommended: include all N5+N4 in the whitelist (~280 total) and use the `tier` field on each kanji entry to distinguish prerequisite vs new.

### 11.3 Borderline grammar promotion

Patterns like `んです` / `のです` (N5 borderline per F-15.23) become **core N4**. The grammar.json migration:
- Each former-borderline N5 pattern becomes a core_n4 pattern at the new level.
- Existing N5 examples get re-tagged as N4-prerequisite.
- New questions can be authored at full N4 scope.

Plan ~30-40 such promotions. The N5 pattern catalog `late_n5` tier is your migration manifest — copy it, retag, expand.

---

## 12. What we learned about working with Claude Code

If using Claude Code (or similar AI assistant) for content authoring + audit:

1. **Establish the binding rule first.** N5 wasted ~2 hours iterating on permission patterns. Drop a `.claude/CLAUDE.md` with blanket autonomous-operation authorization on day 1. Use `defaultMode: bypassPermissions` in `settings.local.json`.

2. **Skills (slash commands) > one-off prompts.** Skills like `update-config`, `keybindings-help` are pre-built. Use them. The `update-config` skill saved hours when the user wanted permission changes.

3. **TodoWrite is for big multi-step tasks.** Single-file edits don't need it. Multi-pass audits with 10+ items do.

4. **WebFetch in parallel.** For external corpus extraction across 17 URLs, fire all 17 WebFetch calls in one message. N5 did 9 in parallel + 8 in parallel = 30 minutes total instead of ~3 hours sequentially.

5. **Don't run two parallel sessions on the same data file.** If you must, partition by ID range up front. N5 paid for this with a 10-question dedup commit.

6. **Read whole sections before editing.** Edit tool requires having read the file. Plan to read 50-100 lines around the edit site, not just 5.

7. **Trust but verify.** Claude can claim a fix landed when it didn't (e.g., when the matcher pattern was wrong). Always re-run the integrity check after any data change.

8. **Don't delegate understanding.** Phrases like "based on your findings, fix the bug" push synthesis onto the agent. Be prescriptive: include file paths, line numbers, exact strings to change.

---

## 13. Estimated total effort

Based on N5 actuals:

| Phase | Solo + AI | With native reviewer (parallel) |
|-------|-----------|--------------------------------|
| Bootstrap + foundation (1) | 1-2 weeks | same |
| Content authoring (2-8) | 8-10 weeks | 6-8 weeks |
| UI (parallel, 4-9) | 4-6 weeks | same |
| Audit cycles (continuous, 6+) | 2-3 weeks | 2-3 weeks |
| Polish + native review | 2-4 weeks | 1-2 weeks |
| **Total** | **17-25 weeks** | **13-19 weeks** |

The native reviewer parallelism only saves time if review windows are scheduled BEFORE 100% authoring (per §5.3). Otherwise the native reviewer is a sequential bottleneck.

For N3+, multiply by ~1.5x per level due to vocab/kanji growth and reading-passage complexity.

---

## 14. Anti-patterns from N5 — the bumper-sticker list

Print these and tape them above your monitor:

1. Don't auto-generate filler MCQs.
2. Don't put both interchangeable particles (に/へ, は/が, から/ので) in MCQ choices without scene context.
3. Don't ship "see pattern detail" as a distractor explanation.
4. Don't write context-less ko-so-a-do questions.
5. Don't run two parallel sessions on the same data file without ID partitioning.
6. Don't introduce a grammar pattern entry with the same `pattern` string as an existing one without retiring the old.
7. Don't ship em-dashes (U+2014).
8. Don't use ASCII digits in TTS source.
9. Don't edit `data/*.json` directly; edit `KnowledgeBank/*.md` and rebuild.
10. Don't skip native review before declaring "done".

---

## 15. Open questions / decisions to make for N4

Known unknowns from N5 experience:

- **Native voice for listening:** budget? (answer affects content-authoring schedule)
- **Whether to support handwriting** (kanji writing practice) — N5 didn't; N4 might benefit
- **Whether to add IME-typing input** for text_input questions — N5 used kana-strict input; N4 with kanji could use IME mode
- **Reading-comprehension speed test mode** — N4 introduces timed reading; UI affordance?
- **Mock test mode timing** — N4 mock tests have stricter time limits than N5
- **Subscription / monetization** — N5 is free; if monetizing, it changes a lot architecturally

Each of these blocks ~1-2 weeks of architecture work. Decide before week 4 of the build.

---

## 16. References

- N5 source repo: this directory
- N5 functional spec: `specifications/JLPT-N5-Functional-Spec-v3.1-supplement.md`
- N5 design system: `specifications/jlpt-n5-design-system-zen-modern.md`
- N5 audit reports: `feedback/jlpt-n5-*.md`
- N5 native-teacher review brief: `feedback/native-teacher-review-request.md`
- N5 UI testing plan: `feedback/ui-testing-plan.md`

For N4 development, copy these as starting templates and update level references.

---

## 17. Appendix A — One-Shot Mode supplements

This appendix addresses the highest-impact gaps identified in the Pass-20 review (`feedback/procedure-manual-review-issues.md`). It does NOT close every gap — full closure requires embedding ~5000+ lines of content inventories and schemas (registered as Pass-21). It DOES close the most actionable ones:

- A.1 Required-inputs precondition (Issue 4, 16, 33, 36)
- A.2 Default decisions for §15 open questions (Issue 25)
- A.3 Fallback procedures for external-blocked items (Issues 19, 21, 39)
- A.4 Minimum-viable subset / what to ship if running out of run time (Issue 20)
- A.5 Definition of done (Issue 40)
- A.6 JSON schemas (Issue 3) — pointer + extraction recipe
- A.7 Source authorities for content inventories (Issues 1, 8)
- A.8 Question-count budget per Mondai (Issue 37)
- A.9 JLPT exam structure tables (Issue 38)
- A.10 SM-2 exact parameters (Issue 29)
- A.11 Furigana generation procedure (Issue 26)

### A.1 Required inputs (precondition for both modes)

The N4 (or any next-level) build agent MUST have read access to:

1. **This manual** (`specifications/procedure-manual-build-next-jlpt-level.md`).
2. **The N5 source repository in full**, at a known absolute path. Specifically the agent must be able to read:
   - `KnowledgeBank/*.md` (all 9 KB files — these are the markdown grammar reference)
   - `data/*.json` (all corpora — these are the JSON schema reference)
   - `tools/build_data.py`, `tools/check_content_integrity.py`, `tools/test_build_data.py`, `tools/link_grammar_examples_to_vocab.py`, `tools/scan_multi_correct.py`, `tools/llm_audit.py`, `tools/heuristic_audit.py`, `tools/build_audio.py`, `tools/tag_vocab_pos.py`, `tools/coverage_compare.py` (the 10 scripts to port from §7)
   - `specifications/jlpt-n5-design-system-zen-modern.md` (full design system spec — see A.6.5)
   - `js/` (all front-end modules — UI module list per A.6.4)
   - `css/main.css` (design tokens implementation)
   - `index.html`, `sw.js`, `manifest.webmanifest`
   - `locales/*.json` (i18n message catalogs)
   - `.claude/CLAUDE.md` (binding rule template)
   - `TASKS.md` and `MEMORY.md` (state-tracking templates)
3. **Network access** for: external corpus extraction (WebFetch), Anthropic API (LLM audit, optional), font CDN downloads (one-time, replaceable).

If any of these inputs is unavailable, the agent MUST halt and report what is missing rather than proceed with invented content.

### A.2 Default decisions for §15 open questions (zero-interaction defaults)

A zero-interaction agent has no human decider. Use these defaults:

| §15 question | Default for one-shot mode | Rationale |
|---|---|---|
| Native voice budget | **Skip native recording. Use synthetic TTS via `gtts`.** Mark all listening items with `voice: "synthetic"` so the JA-15 invariant doesn't fail and a future native-recording pass can identify them. | Native recording requires human resource the agent doesn't have. Synthetic ships; native upgrades later. |
| Handwriting kanji practice | **Defer.** Don't include in v1. | Requires a stroke-order canvas component and SVG kanji data. Out of one-shot scope. |
| IME-typing input | **Defer.** Use the N5 kana-strict text_input flow; do not introduce IME mode. | IME state management is non-trivial; kana-strict works for N4 vocab questions. |
| Reading-comprehension speed test | **Defer.** Ship dokkai mode without timer for v1. | Speed mode is a UI affordance, not a content blocker. |
| Mock test mode timing | **Use the JLPT N4 official time table** (see A.9). Hardcode at component level; expose as setting in v2. | Time per section is a known quantity per JLPT.jp specs. |
| Subscription / monetization | **Free, no monetization.** Match N5 architectural posture. | Adding payment changes hosting, telemetry, and privacy posture; out of scope. |

Mark each as a one-shot default in TASKS.md `Pass-1` so a follow-up human pass knows to reconsider.

### A.3 Fallback procedures for external-blocked items

If the agent encounters an EB item with no resource available:

| EB item | Synthetic fallback | Quality marker |
|---|---|---|
| Native voice talent | Synthetic TTS via gtts; flag `voice: "synthetic"` per item | Listening invariant relaxed for synthetic; ship with banner "Audio: synthetic; native v2" |
| Native teacher reviewer | Run `tools/llm_audit.py` instead, flag every item with `auto: true` and `review_status: "llm_only"` | A subsequent human pass filters by `review_status: "llm_only"` for review |
| Translation to Japanese (brief) | English-only brief shipped; create translation task in TASKS.md EB-3 | Don't block ship on translation |
| Recommender ML | Use the minimal state-driven recommender from N5 (no ML). Mark `recommender_version: 1` | Ship with v1 recommender; v2 ML deferred |

### A.4 Minimum-viable subset (one-shot deliverable)

If the agent runs out of execution time or cannot finish all 17 weeks worth of work in one pass, ship in this priority order. Stop at any layer; the layers below it are non-blocking for a working v0.

1. **Layer 0 — Build pipeline + CI (must ship).** `tools/build_data.py`, `tools/check_content_integrity.py`, `tools/test_build_data.py`, `.github/workflows/content-integrity.yml`. Empty content is acceptable here; the pipeline must be runnable.
2. **Layer 1 — Schemas + skeleton corpora (must ship).** All `data/*.json` files exist with empty arrays + populated `_meta` blocks. All `KnowledgeBank/*.md` files exist with the section structure but minimal content.
3. **Layer 2 — UI shell (must ship).** `index.html`, hash router, 5-card hub, empty Learn views, settings. Service worker registered. PWA manifest valid.
4. **Layer 3 — Grammar catalog (~50% of patterns).** Author the core_n4 patterns; defer late_n4 + n3_borderline.
5. **Layer 4 — Vocab catalog (~50%).** Author the most-frequent N4 vocabulary.
6. **Layer 5 — Kanji catalog (full).** All ~280 N4 kanji must be authored; this is non-negotiable for the kanji whitelist invariants.
7. **Layer 6 — Reading + listening passages (~30% / ~30%).** ~10 passages each with synthetic audio.
8. **Layer 7 — Question banks (~25% per section).** ~25 questions per moji/goi/bunpou/dokkai.
9. **Layer 8 — Translation, advanced UI features, native audio.** Defer all to v2.

A truly minimal deliverable that satisfies layers 0-2 + skeleton content for 3-7 produces a runnable app shell that a human team can flesh out. Roughly **20-30% of the full N4 deliverable** in one shot.

### A.5 Definition of done

The build is **complete for v1 release** when ALL of the following are true (a one-shot agent should self-check against this list):

1. **CI green:** `python tools/check_content_integrity.py` exits 0 with all invariants passing.
2. **Build pipeline regression:** `python tools/test_build_data.py` exits 0.
3. **JSON schema valid:** every `data/*.json` parses, has the required `_meta` block, and `_meta.entity_count == len(entries)`.
4. **No duplicate IDs:** across questions / patterns / vocab / kanji / reading / listening corpora.
5. **No empty user-facing fields:** every authored question has `question_ja`, `correctAnswer`, `choices` (if MCQ), and `distractor_explanations` populated.
6. **No "see pattern" stubs:** zero matches for `see n4-` / `see pattern detail` in user-facing fields.
7. **No out-of-scope kanji:** all user-facing text uses only N4-whitelist kanji (JA-13).
8. **Browser smoke test:** `index.html` loads in a clean browser, hash routes resolve, no console errors, service worker registers.
9. **Question count meets layer-7 minimum:** ≥25 questions per Mondai section per A.4 layer 7.
10. **PWA installable:** manifest valid, icons present, offline shell works.
11. **TASKS.md current:** status snapshot reflects current corpus counts; no `[ ]` items in the active Pass section without "deferred" rationale.
12. **No em-dashes:** zero matches for `—` or `–` in any committed file (X-6.5).

A one-shot agent that can mark items 1-8 + 10-12 GREEN and item 9 at "≥25" has shipped a defensible v1.

### A.6 JSON schemas — extraction recipe

Rather than embedding all schemas (~1500 lines of JSON Schema), the agent should DERIVE them from the N5 reference files in this order:

1. Read `data/grammar.json` — observe top-level shape: `{"patterns": [...], "_meta": {...}}`. Each pattern entry has: `id`, `pattern`, `meaning_en`, `meaning_ja`, `category`, `tier`, `form_rules` (with `attaches_to`, `conjugations`), `examples` (each with `form`, `ja`, `translation_en`, `furigana?`, `vocab_ids?`), `common_mistakes`, `notes?`.
2. Read `data/questions.json` — top-level: `{"questions": [...], "_meta": {...}}`. Each question has: `id`, `grammarPatternId`, `type` (mcq/sentence_order/text_input), `subtype?`, `direction`, `prompt_ja`, `question_ja` OR `tiles`, `choices?`, `correctAnswer?`, `correctOrder?`, `acceptedAnswers?`, `explanation_en`, `distractor_explanations?`, `high_confusion?`, `difficulty`, `auto`.
3. Read `data/vocab.json`, `data/kanji.json`, `data/reading.json`, `data/listening.json`, `data/audio_manifest.json` similarly.
4. Generate JSON Schema files with `python -c "import genson; ..."` or hand-derive from observed shapes.

Save derived schemas at `specifications/schemas/*.schema.json`. Validate every JSON build against them in CI.

### A.7 Source authorities for content inventories

The agent must NOT invent N4 content. Use these published sources as authority:

- **Kanji whitelist (~280 entries):** JLPT N4 kanji list at https://jlptsensei.com/jlpt-n4-kanji-list/ + cross-reference https://www.tanos.co.uk/jlpt/jlpt4/kanji/
- **Vocabulary (~1500 entries):** https://www.tanos.co.uk/jlpt/jlpt4/vocab/ (CSV download available)
- **Grammar patterns (~210):** https://bunpro.jp/jlpt/n4 + https://www.tanos.co.uk/jlpt/jlpt4/grammar/
- **Reading passages:** authentic sample at https://www.jlpt.jp/e/samples/n4/index.html
- **Listening scripts:** same official samples

Cross-reference at least TWO sources per item before adding to the catalog. Discrepancies between sources should be resolved in favor of the most-recent JLPT.jp official spec.

For tier classification (`core_n4` / `late_n4` / `n3_borderline`):
- `core_n4` = appears in both Bunpro N4 AND Tanos N4
- `late_n4` = appears in Bunpro N4 only (Bunpro tends to include borderline upper-N4)
- `n3_borderline` = appears in Tanos N3 but commonly taught in N4 textbooks

### A.8 Question-count budget per Mondai per file

JLPT N4 question section structure (mirror this in question count targets):

| File | Mondai | Subtype | Target count |
|------|--------|---------|--------------|
| moji_questions_n4.md | Mondai 1 (kanji reading) | 漢字読み | 50 |
| moji_questions_n4.md | Mondai 2 (orthography) | 表記 | 50 |
| moji_questions_n4.md | (alt) Mondai 3 (word formation) | 語形成 | 50 (N4-specific) |
| goi_questions_n4.md | Mondai 4 (context) | 文脈規定 | 50 |
| goi_questions_n4.md | Mondai 5 (paraphrase) | 言い換え類義 | 50 |
| goi_questions_n4.md | Mondai 6 (usage) | 用法 | 50 (N4-specific) |
| bunpou_questions_n4.md | Mondai 1 (sentence grammar 1) | 文の文法1 | 50 |
| bunpou_questions_n4.md | Mondai 2 (sentence grammar 2) | 文の文法2 | 30 |
| bunpou_questions_n4.md | Mondai 3 (text grammar) | 文章の文法 | 20 |
| dokkai_questions_n4.md | Mondai 4 (short) | 内容理解 短文 | 30 |
| dokkai_questions_n4.md | Mondai 5 (medium) | 内容理解 中文 | 30 |
| dokkai_questions_n4.md | Mondai 6 (info retrieval) | 情報検索 | 12 |
| chokai_questions_n4.md | Mondai 1-4 | (multiple) | 60 |

**Total target N4: ~530 questions across 4 question files + 1 listening file.** This is larger than N5's ~400 due to N4's expanded grammar/vocab scope.

### A.9 JLPT exam structure tables

Per official JLPT.jp:

| Level | Total time | Sections | Section times | Pass score | Section thresholds |
|-------|-----------|----------|---------------|------------|-------------------|
| N5 | 105 min | 文字・語彙 / 文法・読解 / 聴解 | 25 / 50 / 30 | 80/180 | 38/120 + 19/60 |
| N4 | 125 min | 文字・語彙 / 文法・読解 / 聴解 | 30 / 60 / 35 | 90/180 | 38/120 + 19/60 |
| N3 | 140 min | 文字・語彙 / 文法・読解 / 聴解 | 30 / 70 / 40 | 95/180 | 19/60 each |
| N2 | 155 min | 言語知識・読解 / 聴解 | 105 / 50 | 90/180 | 19/60 each |
| N1 | 170 min | 言語知識・読解 / 聴解 | 110 / 60 | 100/180 | 19/60 each |

Embed this table in mock-test mode timing config.

### A.10 SM-2 SRS exact parameters

From N5's verified implementation:

```
Initial easiness factor (EF) = 2.5
EF formula on Good/Easy: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q)*0.02))
  where q = quality (Easy=5, Good=4, Hard=3, Again=2)
EF clamped to [1.3, ∞]

Interval after rep N (rep counter increments on Good/Easy only):
  rep 1 (first success after Again or fresh): 1 day
  rep 2: 6 days
  rep 3+: previous_interval * EF (rounded to integer days)

On Again:
  rep counter resets to 0
  EF drops by 0.20 (e.g., 2.50 → 2.30)
  next interval = 1 day
  item goes to "Lapses" bucket for tracking

On Hard (q=3):
  rep counter does NOT advance
  EF drops slightly (~0.15)
  next interval = previous_interval * 1.2 (instead of * EF)

LocalStorage key: `jlpt-{level}-tutor.srs.{itemId}` storing JSON
  { "EF": float, "rep": int, "due": ISO8601-date, "interval": int, "lapses": int }

Cross-device merge on import: take MAX of (rep, interval) per item;
  prefer most-recent EF; sum lapses.
```

This is the N5-verified spec. Reuse verbatim for N4.

### A.11 Furigana generation procedure

For each example sentence in `grammar.json` and each passage in `reading.json`:

1. Run a Japanese tokenizer (mecab via `mecab-python3` OR Yahoo morphological API OR client-side kuromoji.js) over the Japanese text.
2. For each kanji-containing token, output `{"reading": <hiragana>, "indices": [start, end]}` annotations.
3. Filter: only include annotations where the kanji is NOT in the level's prerequisite tier (i.e., for N4 content, annotate kanji that are N4-new but not the N5-prerequisite ones — by default; settings allow toggling).
4. Store as `furigana` field on the example/passage entry.

UI render: wrap annotated spans in `<ruby><rb>kanji</rb><rt>reading</rt></ruby>`. CSS controls visibility (3-mode: always-show / show-on-hover / never). Default for N4 = show-on-hover.

**One-shot fallback:** if a tokenizer is unavailable in the agent's runtime, ship without furigana. The UI gracefully degrades to plain kanji rendering. Mark this in TASKS.md as Pass-2 candidate.

---

## 18. Pass-20 review findings — disposition

The Pass-20 manual review (`feedback/procedure-manual-review-issues.md`) identified 40 issues. Their disposition in this revision:

**Closed in this pass (15 of 40):**
- Issue 1, 8, 33: source authorities for content inventories (A.7)
- Issue 4, 16: required inputs precondition (A.1) + design-system file pointer
- Issue 19, 21, 39: fallback procedures for external-blocked items (A.3)
- Issue 20: minimum-viable subset (A.4)
- Issue 25: default decisions for §15 (A.2)
- Issue 29: SM-2 exact parameters (A.10)
- Issue 26: furigana generation procedure (A.11)
- Issue 37: question-count budget (A.8)
- Issue 38: JLPT exam structure (A.9)
- Issue 40: definition of done (A.5)
- Issue 3: schema extraction recipe (A.6)

**Deferred to Pass-21 — embedding ~5000 lines of inventories (15 of 40):**
- Issues 2, 7, 9, 11: full executable invariant specs, level-cross-cutting scaling
- Issue 5, 30, 31, 32: complete UI module list, SM-2 schema, test framework, PWA spec
- Issue 6, 35: audio manifest schema, i18n locale convention
- Issue 10: external-corpus URL list per level
- Issue 14, 15, 17, 18: i18n translation pipeline, kanji-tier convention, KB markdown grammar, vocab-ID slug rules

**Closed-by-pointer (8 of 40):**
- Issue 12, 13, 22, 23, 24, 27, 28, 34, 36: each refers to a section that already exists in the manual but the reviewer judged it underspecified. The closed-in-this-pass items strengthen these enough that they're now "minimum acceptable, not strong" — registered as Pass-22 polish candidates.

**Open structural concern (2 of 40):**
- Issue 6 (audio manifest), Issue 18 (vocab-ID slug rule): these touch data integrity and need explicit schemas embedded, not just pointers. Must be closed before any Mode-B agent run produces shippable content. Tagged P0 in Pass-21.

---

*Living document. Update on every fresh learning at N4 (or beyond).*
*Prepared 2026-05-01. Pass-20 review ingested 2026-05-01. JLPT N5 Tutor v1.x at HEAD `1f91400`.*
