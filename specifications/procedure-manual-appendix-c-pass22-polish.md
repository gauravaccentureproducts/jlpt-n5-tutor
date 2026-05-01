# Procedure Manual Appendix C — Pass-22 Polish Specifications

**Companion to:** `procedure-manual-build-next-jlpt-level.md` and `procedure-manual-appendix-b-extracted-from-n5.md`
**Closes Pass-22 items:** F-22.1, F-22.2, F-22.3, F-22.4, F-22.6, F-22.8, F-22.9
**Prepared:** 2026-05-01

This appendix bundles the seven Pass-22 documentation-polish items into a single document so they're easy to find and reference. Two more Pass-22 items have their own homes:
- **F-22.5** LLM-audit prompt extraction → `tools/prompts/llm_audit.prompt.md`
- **F-22.7** TASKS.md template → `specifications/tasks-md-template.md`

---

## C.1 Distractor explanation rubric (closes F-22.1)

**Problem solved:** N5 originally shipped with auto-generated stub distractor explanations like `Wrong choice — see pattern detail.`, which taught nothing and were stripped in Pass-12. The procedure manual told future levels to "author all distractor explanations by hand" but didn't say HOW. This rubric fills that gap.

### C.1.1 Required structure (4 sentences)

Every distractor explanation MUST contain, in this order:

1. **Sentence 1: Role mismatch.** Name what the wrong option's role IS (one of: subject marker, direct object, recipient, source, location, time, instrument, conjunction, copula form, conjugation form, etc.) — and contrast it with the correct option's role.
2. **Sentence 2: Concrete consequence.** Show what would happen if the learner picked this option — what the sentence would mean (or fail to mean).
3. **Sentence 3 (optional): Pattern citation.** If the distinction maps to a documented pattern (e.g., "see n5-008 for direction-vs-companion particles"), cite it. Skip this sentence when the contrast is fully explained by sentences 1-2.
4. **Sentence 4 (optional): Pragmatic nuance.** A single bonus clause if the option is "grammatically possible but unidiomatic" — name the register / context that would make it work, and why it doesn't fit here. Skip this sentence when the option is flatly wrong (most cases).

### C.1.2 Length range

- **Minimum:** 60 characters (forces sentence 1 to be substantive).
- **Maximum:** 180 characters (forces sentence 4 to be optional, sentences 1-3 to be tight).
- **Typical:** 90-130 characters.

### C.1.3 Language register

- English, neutral declarative.
- No second-person ("you would..."), no first-person ("I think..."), no rhetorical questions.
- Use simple present tense for grammar facts ("に marks the destination") and simple past for what-would-happen ("コーヒーが would mean 'coffee likes [you]'").
- Quote Japanese fragments in `「…」` or unstyled when surrounded by English; never wrap in italics or bold.
- No emojis.

### C.1.4 Five worked examples

These are real distractors from the N5 corpus that pass the rubric:

**Example 1 — Particle (recipient):** Correct answer `に` for `わたしは ともだち（  ）プレゼントを あげました`.
- **Distractor を:** `を already marks プレゼント (the thing being given). あげる takes one を for the object, not two. The recipient slot uses に.` (151 chars; sentences 1+2)
- **Distractor から:** `から marks the SOURCE of an action ('from'). 'Friend から' would mean the friend gave something to me — the opposite direction of あげる. Use に for 'to whom'.` (170 chars; sentences 1+2+1 nuance)

**Example 2 — Verb form:** Correct answer `ききながら` for `ラジオを （  ）べんきょうします`.
- **Distractor きいて:** `きいて (te-form) connects sequential actions: 'listen, then study'. It does not express simultaneous action.` (105 chars; sentences 1+2)
- **Distractor きかない:** `きかない is the negative ('don't listen'), and gives the wrong meaning. It also doesn't form the simultaneous-action structure.` (122 chars; sentences 1+2)

**Example 3 — Demonstrative (deictic role):** Correct answer `これ` for `（じぶんの 手の中の 本を 友だちに みせて）　（  ）は ほんです`.
- **Distractor それ:** `それ is for things near the LISTENER. Here the speaker is holding the book in their own hand, so これ (near speaker) is correct.` (123 chars; sentences 1+2 with explicit scene reference)

**Example 4 — Adjective conjugation:** Correct answer `おもしろい` for `この 本は とても （  ）です`.
- **Distractor おもしろく:** `おもしろく is the adverbial / continuing form, used before another verb or adjective. It cannot stand alone before です.` (118 chars; sentences 1+2)

**Example 5 — Counter:** Correct answer `三にん` for `クラスに がくせいが （  ）います`.
- **Distractor 三こ:** `三こ (-ko) is the counter for small objects. People take 〜にん, so use 三にん to count three students.` (101 chars; sentences 1+2)

### C.1.5 What does NOT count as a real distractor explanation

- `Wrong choice — see pattern detail.` (stub; Pass-12 deleted)
- `This is grammatically incorrect.` (no contrast, no role naming)
- `に is the answer.` (restating the correct option, not explaining the wrong one)
- `Choose に instead.` (instructional, not contrastive)

### C.1.6 Process recommendation

For ~530 N4 questions × 3 distractors each = ~1600 distractor explanations:

1. **Author the correct answer's `explanation_en` first** (the "why this is right" prose).
2. **For each distractor, ask: what role does this option play, and why doesn't it fit here?** If you can't answer in one sentence, replace the distractor — it isn't tight enough.
3. **Run the rubric on each:** does it have role mismatch (S1) + concrete consequence (S2)? If not, rewrite.
4. **LLM-author then native-review** is acceptable when budget is tight; LLM produces the 4-sentence draft using this rubric, native teacher refines for naturalness.

---

## C.2 Ko-so-a-do scene-context formatting standard (closes F-22.2)

**Problem solved:** Pass-15 fixed 4 ko-so-a-do questions that had multi-correct answers (no spatial context). The fix was to add parenthetical scene-setting like `（じぶんの 手の中の 本を 友だちに みせて）` before the stem. The format wasn't formally specified; this standard formalizes it.

### C.2.1 Placement

The scene-setting parenthetical ALWAYS precedes the stem with the blank. Format: `（<scene>）　<stem with blank>`. The full-width space (U+3000) between `）` and the stem is mandatory — preserves the scene as a visually-distinct preface.

### C.2.2 Length

- **Minimum:** 8 characters (must establish at least one of: speaker, listener, referent location).
- **Maximum:** 30 characters (longer scenes belong in `prompt_ja` instead of `question_ja`).
- **Typical:** 12-20 characters.

### C.2.3 Kanji policy

The scene text is subject to **the same kanji-scope rule** as any other user-facing field. JA-13 invariant applies. Pass-15 caught three violations: 文 / 字 / 近 introduced inside scenes had to be converted to ぶん / じ / ちか.

For N<L> builds: every kanji in a scene must be in `data/n<L>_kanji_whitelist.json`. If forced to choose between (a) using the natural kanji and (b) keeping the scene short, **prefer kana** — clarity beats orthographic naturalness in scene-setting.

### C.2.4 Tense and grammatical mood

- **Use present tense or imperative** for relational scenes (e.g., 「みせて」 = imperative te-form, 「あんないして」 = imperative).
- **Use plain dictionary form or polite mass-form** for declarative scenes (e.g., 「友だちに 言います」).
- **Avoid past tense** unless the scene is a memory-narration (rare for ko-so-a-do questions).

### C.2.5 Canonical examples per quartet

The four ko-so-a-do quartets, with one canonical scene per correct-answer position (12 examples total — author and native-review these once, then reuse the structure for further questions):

#### これ / それ / あれ / どれ (object-pronouns)

| Correct | Canonical scene + stem | Why this scene forces the answer |
|---------|------------------------|---------------------------------|
| これ | `（じぶんの 手の中の 本を 友だちに みせて）　（ ）は ほんです。` | Speaker holds the referent → これ unique |
| それ | `（じぶんの ペンを みせて、それから 友だちの 手の中の ペンを ゆびさして）「これは わたしの ペンです。（ ）は あなたのですか。」` | Listener holds the referent → それ unique |
| あれ | `（とおくに ある かばんを ゆびさして 友だちに 聞きます）　（ ）は あなたのですか。` | Referent far from both → あれ unique |
| どれ | `（つくえの 上に かばんが いくつも あります）　（ ）が あなたの ですか。` | Referent is to-be-selected from many → どれ unique |

#### この / その / あの / どの (object-determiners)

| Correct | Canonical scene + stem |
|---------|------------------------|
| この | `（じぶんの 持っている ペンを みせて）　（ ）ペンは わたしのです。` |
| その | `（友だちの 手の中の ペンを ゆびさして）　（ ）ペンは あなたのですか。` |
| あの | `（とおくの 山を ゆびさして）　（ ）山は たかいですね。` |
| どの | `（たくさんの ペンの 中から 友だちに 聞きます）　（ ）ペンが あなたのですか。` |

#### ここ / そこ / あそこ / どこ (place-pronouns)

| Correct | Canonical scene + stem |
|---------|------------------------|
| ここ | `（としょかんの 中で 友だちに 言います）　（ ）は としょかんです。` |
| そこ | `（友だちが 立って いる 場所を さして）　（ ）は どんな ところですか。` |
| あそこ | `（とおくの たてものを ゆびさして）　（ ）が ぎんこうです。` |
| どこ | `（じぶんが いる 場所が わからない ときに 友だちに 聞きます）　（ ）に いますか。` |

#### こちら / そちら / あちら / どちら (polite-directions)

| Correct | Canonical scene + stem |
|---------|------------------------|
| こちら | `（おきゃくさんを じぶんの ちかくの せきへ あんないして）　（ ）へ どうぞ。` |
| そちら | `（電話で あいての ばしょの ことを たずねて）　（ ）の てんきは どうですか。` |
| あちら | `（とおくの たてものを ゆびさして）　（ ）が ぎんこうです。` |
| どちら | `（ふたつの コーヒーから えらんで もらいたい とき）　（ ）が いいですか。` |

### C.2.6 What does NOT count as scene context

- `（  ）に いれる ことばを えらんで ください。` — that's a generic instruction (`prompt_ja` material), not scene-setting.
- `みんなが いる ところで` — too vague; doesn't establish speaker / listener / referent positions.
- A title-style label like `【友だち との かいわ】` — that's a topic header, not a scene.

A valid scene establishes at least ONE of: where the speaker is, where the listener is, where the referent is — and the relationship among those three is unambiguous from the prose.

---

## C.3 JA-2 / JA-23 invariant interaction (closes F-22.3)

**Problem solved:** Two particle-related invariants overlap and were ambiguously specified. JA-2 ("particle distractors are valid") and JA-23 (multi-correct scanner). Whether a JA-23-flagged question fails JA-2 (hard gate) or just warns (advisory) was unclear.

### C.3.1 Decision (formalized)

- **JA-2 is a HARD gate.** A question whose particle distractors are not in the canonical particle set fails the integrity check; CI blocks the merge. Rationale: an invalid distractor is a content bug; ship-blocking is correct.
- **JA-23 is ADVISORY (`-W` mode).** A question whose particle choices contain BOTH members of a known interchangeable pair AND lacks scene context is flagged as a multi-correct candidate. CI does NOT block; the violation surfaces in audit reports for native-teacher review. Rationale: some flagged questions are legitimate (the pair test is the point), and false positives shouldn't ship-block.

### C.3.2 Interaction rule

If a question is flagged by JA-23 (multi-correct candidate) AND has a scene context that satisfies §C.2 (canonical scene establishes the answer uniquely), the JA-23 flag is **suppressed**. This is the per-Pass-15 / Pass-19 ground-truth: ko-so-a-do questions with proper scenes pass; without scenes they fail.

Implementation hint for the future code change to `tools/check_content_integrity.py` (NOT applied in this commit; the parallel session is active on that file):

```python
def check_ja_23_multi_correct_advisory(questions, kanji_whitelist):
    """JA-23: advisory check for multi-correct candidates. Returns warnings,
    not failures. Suppress when scene context (per §C.2 standard) is present."""
    INTERCHANGEABLE_PAIRS = [
        ("に", "へ"),         # motion destination
        ("から", "ので"),     # reason
        ("は", "が"),         # topic vs subject
        ("に", "と"),         # recipient vs companion
        ("まで", "から"),     # time-range endpoints
        # Future: extend per native-teacher input
    ]
    KOSOADO_QUARTETS = [
        {"これ", "それ", "あれ", "どれ"},
        {"この", "その", "あの", "どの"},
        {"ここ", "そこ", "あそこ", "どこ"},
        {"こちら", "そちら", "あちら", "どちら"},
    ]
    warnings = []
    for q in questions:
        if q.get("type") != "mcq":
            continue
        choices = set(q.get("choices", []))
        # Particle pair check
        flagged = False
        for a, b in INTERCHANGEABLE_PAIRS:
            if a in choices and b in choices:
                flagged = True
                break
        # Ko-so-a-do quartet check
        if not flagged:
            for quartet in KOSOADO_QUARTETS:
                if quartet <= choices:
                    flagged = True
                    break
        if not flagged:
            continue
        # Suppression: scene context present?
        stem = q.get("question_ja", "")
        if scene_context_pattern.match(stem):  # regex per §C.2.1 placement rule
            continue
        warnings.append(f"{q['id']}: multi-correct candidate (no scene context)")
    return warnings  # WARNINGS only; do not raise
```

### C.3.3 Invariant table update

Update Appendix B.8 row for JA-23:

> **JA-23 Multi-correct scanner advisory** | Same logic as JA-6 but emits as **WARN** (not FAIL). Suppressed when the question has scene context per §C.2.1 placement rule (parenthetical preceding the stem). Extends JA-6 to cover ko-so-a-do quartets and pair-based multi-correct cases that JA-6 doesn't catch.

JA-6 (no two-correct-answers) remains the hard gate for cases the scanner can prove unambiguous.

---

## C.4 Augmented-set escape-valve guard (closes F-22.4)

**Problem solved:** JA-13 / JA-1 / JA-16 invariants reference whitelist files (`n<L>_kanji_whitelist.json`, `n<L>_vocab_whitelist.json`). An agent or contributor could silently add an out-of-scope item to silence a violation. There's currently no enforcement that exceptions be justified.

### C.4.1 Convention

Every entry added to a whitelist file as an **exception** (i.e., an item that's not in the official JLPT level scope but allowed for documented reasons) MUST carry a per-line `# WHY: <reason>` comment. The reason should fit on one line and explain the inclusion.

JSON does not support comments natively, so the whitelist files MUST be authored as JSON-with-line-comments (JSONC) and parsed with a comment-stripping pre-processor, OR as YAML, OR each exception must be added to a parallel `<file>.exceptions.md` document.

**Recommended approach (lowest friction):** keep the whitelist as plain JSON, and maintain a parallel `data/n<L>_kanji_whitelist.exceptions.md` file that lists each exception with its `WHY:` justification. The integrity check tool reads BOTH files: the whitelist for membership, the exceptions doc for accountability.

### C.4.2 Exceptions doc format

`data/n<L>_kanji_whitelist.exceptions.md`:

```markdown
# N<L> kanji whitelist — exception register

Each line documents a kanji that is in the project whitelist but NOT in the
official JLPT N<L> kanji scope. Required for any exception:
  - The kanji glyph
  - WHY: a one-sentence reason
  - REVIEW_DATE: optional date for re-evaluation

## Exceptions

- 文  WHY: appears in two grammar examples that would otherwise need awkward kana phrasing; flagged for native review.  REVIEW_DATE: 2026-Q3
- 近  WHY: required for the standardized こちらへどうぞ scene template (§C.2); too disruptive to swap to ちかく.  REVIEW_DATE: 2026-Q3
```

### C.4.3 New invariant JA-25 (specification only — code not yet written)

Add to `tools/check_content_integrity.py`:

```python
def _check_ja_25_whitelist_exceptions_documented():
    """Every kanji in n<L>_kanji_whitelist.json that is NOT in the official
    JLPT N<L> scope (loaded from data/n<L>_official_scope.json) MUST appear
    in data/n<L>_kanji_whitelist.exceptions.md with a `WHY:` justification.
    Same rule applies to the vocab whitelist."""
    violations = []
    project_wl = set(json.load(open("data/n<L>_kanji_whitelist.json")))
    official_scope = set(json.load(open("data/n<L>_official_scope.json")))
    exceptions = parse_exceptions_md("data/n<L>_kanji_whitelist.exceptions.md")
    for kanji in project_wl - official_scope:
        if kanji not in exceptions:
            violations.append(f"{kanji} in whitelist but not justified in exceptions.md")
        elif "WHY:" not in exceptions[kanji]:
            violations.append(f"{kanji} in exceptions.md but lacks WHY: justification")
    return violations
```

This is documented as a Pass-22 specification; the actual code change to `check_content_integrity.py` is deferred to a future commit (the parallel session is active on that file).

### C.4.4 Why this matters

Without the WHY-comment guard, the scope-enforcement story is one-sided: the integrity check catches naive violations, but a contributor can defeat it by adding the violating item to the whitelist. The WHY-comment turns "silencing the check" into a deliberate, reviewable action with accountability. Every exception becomes a small audit-doc entry that quarterly review can re-evaluate.

---

## C.5 Auto-generation stop-condition formalization (closes F-22.6)

**Problem solved:** Procedure manual §3.2.1 prohibits agent-generated filler MCQs but doesn't define a hard stop condition. Appendix A.4 partially addresses this with the minimum-viable subset (per-layer targets), but a more explicit stop rule prevents over- or under-generation.

### C.5.1 STOP conditions for question generation

The agent stops generating questions in a Mondai/section when ANY of the following is true:

- **(a) Per-Mondai count target hit.** Reached the count from Appendix A.8 (e.g., ≥50 for moji M1, ≥30 for dokkai M5). This is the primary stop.
- **(b) Corpus-coverage threshold met.** Every grammar pattern in `data/grammar.json` has at least one question referencing its `id` via `grammarPatternId`. (For non-grammar Mondai, every kanji / vocab item targeted by the section has at least one question.)
- **(c) External-corpus distribution matched within 20%.** If the external triangulation corpus has X% of its questions targeting particles vs Y% targeting verbs etc., the project corpus matches that distribution within ±20%. Caps "drift toward easy authoring".

When all three conditions are met simultaneously: ship that Mondai. When (a) is met but (b) or (c) is not: continue authoring until at least 80% of (b) is met, then re-evaluate.

### C.5.2 ANTI-stop conditions (do NOT stop just because)

- The bank "looks small" relative to a previous level. Each level's count target is per Appendix A.8; do not pad to match an irrelevant baseline.
- A pattern has no obvious stem template. Author the question or document the pattern as "low-test-coverage" — do NOT generate stub-pattern questions to fill (Pass-14 deleted 38 such stubs at N5).
- The agent's output budget is unspent. Stop when (a)+(b) are met regardless of remaining budget.

### C.5.3 Pre-merge sanity check

Before declaring an authoring batch complete, run:

```python
# tools/_check_authoring_batch_done.py (sketch, not committed)
def is_batch_done(level, mondai):
    target = APPENDIX_A8_TARGETS[level][mondai]
    actual = count_questions_for(mondai)
    if actual < target:
        return False, f"need {target - actual} more questions"
    if not all_patterns_have_questions(level):
        return False, f"{n_uncovered_patterns()} patterns have zero coverage"
    if not external_corpus_distribution_within_20pct():
        return False, f"distribution skew detected"
    return True, "all stop conditions met"
```

Record the result in TASKS.md as `Pass-N <name> stop-condition check: PASS / NEED <items>` so future review knows the authoring stop was deliberate.

---

## C.6 PWA spec extraction (closes F-22.8)

**Problem solved:** Procedure manual §10 had one bullet about PWA. A complete spec follows so any next-level build can implement PWA support without re-discovering the convention.

### C.6.1 manifest.webmanifest

```json
{
  "name": "JLPT N<L> Tutor",
  "short_name": "N<L> Tutor",
  "description": "Learn. Test. Review. Master.",
  "theme_color": "#1F4D2E",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "any",
  "start_url": "/",
  "scope": "/",
  "lang": "en",
  "dir": "ltr",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-1024.png", "sizes": "1024x1024", "type": "image/png", "purpose": "any" }
  ],
  "categories": ["education", "languages"]
}
```

Required fields are `name`, `short_name`, `start_url`, `display`, `icons`. Everything else is recommended. The `theme_color` should match the design system's accent color (Zen Modern uses `#1F4D2E`).

### C.6.2 Icons

- **Master icon:** 1024×1024 PNG with the wordmark + accent rule. Source: `icons/source/icon-master.svg` if SVG-authored.
- **Downscaled:** 512×512 (Android home screen high-DPI), 192×192 (Android lower-DPI / PWA install prompt). Generated via ImageMagick or Squoosh from the master.
- **Maskable:** the 192/512 icons should be authored with safe-area padding (~10% margin) so Android can apply OS-shape masks without clipping. Mark these `"purpose": "any maskable"`.

### C.6.3 Service worker (sw.js)

Cache name versioning: `jlpt-n<L>-tutor-v<N>` where `<N>` increments on every shell change. The N5 ref is at v71 after 71 ship cycles.

Strategy per asset class:

| Asset class | Strategy | Rationale |
|-------------|----------|-----------|
| App shell (`/`, `index.html`, all `js/*.js`, all `css/*.css`) | stale-while-revalidate | Fast offline-friendly load; updates land via the next-page-load |
| Locales (`locales/*.json`) | stale-while-revalidate | Same as shell |
| Content (`data/*.json`) | cache-first with version key | Content rarely changes; cache hits dominate |
| Audio (`audio/**/*.mp3`) | cache-first, on-demand fetch | First-play caches; subsequent plays offline |
| Fonts (`fonts/*.woff2`) | cache-first, immutable | Fonts never change without a SW version bump |
| External (any URL not on this origin) | network-only | Don't cache external content |

### C.6.4 Update toast

When a new SW version activates, the runtime shows a non-blocking toast:

> "A new version of the app is ready. Tap to refresh."

Tap → `location.reload(true)`. Don't auto-reload (loses any in-progress test attempt).

### C.6.5 Offline fallback page

A minimal `offline.html` shipped at root, precached by the SW. Served when a navigation request fails because the network is unreachable. Content: app title, "you're offline" message, link to `/` (which the cached shell answers).

### C.6.6 Pre-cache list

The SW pre-caches at install time:
- `/`, `/index.html`, `/manifest.webmanifest`, `/offline.html`
- All shipped `js/*.js` and `css/*.css`
- `locales/en.json` (other locales lazy-cached on first use)
- All shipped icons
- All shipped fonts (`fonts/*.woff2`)

Do NOT pre-cache `data/*.json` or `audio/**/*.mp3` (too large; these are runtime-cached on first use).

### C.6.7 Smoke-test integration

The Playwright smoke suite includes:
1. SW registers and reaches `activated` state on first load.
2. Manifest is valid JSON and parses.
3. `start_url` resolves to a 200 response.
4. After offline simulation (`page.context().setOffline(true)`), the shell still loads.
5. Update flow: simulate a SW update → assert toast appears → assert reload.

---

## C.7 Same-pattern-string conflict resolution rule (closes F-22.9)

**Problem solved:** Pass-19 cleaned up 10 redundant grammar pattern entries that shared `pattern` strings. Pass-22 wants a rule for what the agent does the next time it considers adding a new pattern entry.

### C.7.1 Pre-add check

Before adding a new pattern entry to `data/grammar.json` (or `KnowledgeBank/grammar_n<L>.md`), the agent runs:

```python
candidate_pattern = "<the proposed `pattern` field>"
existing = [p for p in grammar["patterns"] if p["pattern"] == candidate_pattern]
if existing:
    apply_conflict_resolution(candidate_pattern, existing, candidate_meaning_en)
```

### C.7.2 Conflict resolution decision tree

If `existing` is non-empty (one or more entries already use the same `pattern` string):

1. **Compute meaning overlap.** Take the proposed `meaning_en` and each existing entry's `meaning_en`. Compute Jaccard similarity (set of lowercase words / set of lowercase words). The "overlap" is the maximum across all existing entries.
2. **Decision:**
   - If overlap ≥ 80%: **DO NOT add a parallel entry.** Either (a) enrich the existing entry with whatever the new candidate would have added (more examples, common_mistakes, etc.) and do not create a new entry, OR (b) retire the existing entry and replace with the new one if the new is strictly better. Document the choice in the commit message.
   - If 50% ≤ overlap < 80%: **The split is questionable.** Consult human. If proceeding, narrow each `meaning_en` to make the distinction explicit (e.g., subject-marker vs clause-connector for `が`).
   - If overlap < 50%: **Split is justified.** Add the new entry. Both stay; both have explicit `meaning_en` distinguishing them. The N5 examples (n5-003 が subject vs n5-126 が clause-connector) demonstrate this case.

### C.7.3 Documentation requirement

When a split is made (either of the lower two branches), the commit body MUST include:

```
Pattern split rationale:
- Existing: n<L>-NNN "<existing pattern>" — <existing meaning_en>
- New:      n<L>-MMM "<new pattern>" — <new meaning_en>
Overlap: <Jaccard score>%. Decision: split because <reason>.
```

This makes future audit (the equivalent of Pass-19) much easier — the rationale is in git history rather than reverse-engineered.

### C.7.4 Invariant JA-24 enforces this going forward

JA-24 (no duplicate `pattern` strings with overlapping `meaning_en`) catches violations. The invariant uses the same Jaccard-80% threshold.

---

## C.8 Cross-references

These polish items strengthen but don't replace the existing manual content:

- **F-22.1 distractor rubric** complements §3.2.3 (anti-pattern: "see pattern detail").
- **F-22.2 ko-so-a-do scene format** complements §3.2.4 (anti-pattern: context-less ko-so-a-do).
- **F-22.3 JA-2/JA-23 interaction** clarifies Appendix B.8 invariant table.
- **F-22.4 WHY-comment guard** strengthens Appendix B.8 augmented-set notes.
- **F-22.5 LLM-audit prompt extraction** lives at `tools/prompts/llm_audit.prompt.md`.
- **F-22.6 stop-condition formalization** complements Appendix A.4 minimum-viable subset.
- **F-22.7 TASKS.md template** lives at `specifications/tasks-md-template.md`.
- **F-22.8 PWA spec** complements §10 (the one-line PWA bullet).
- **F-22.9 conflict resolution rule** complements F-19 grammar dedup retrospective.

Together with Appendices A and B, the procedure manual now closes 36 of 40 Pass-20 review items + the 9 Pass-22 polish items. Remaining open: F-22.4 and F-22.5 code implementations (deferred to a future commit since the parallel session is active on `tools/check_content_integrity.py` and might also touch `tools/llm_audit.py`).

---

*End of Appendix C. Companion to procedure-manual-build-next-jlpt-level.md and procedure-manual-appendix-b-extracted-from-n5.md.*
*Prepared 2026-05-01.*
