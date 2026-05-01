# Procedure Manual Appendix B — Extracted from N5 Codebase

**Companion to:** `procedure-manual-build-next-jlpt-level.md`
**Closes Pass-20 deferred items:** F-20.15 through F-20.26 (the "extract from N5" cluster)
**Prepared:** 2026-05-01 by reading N5 source files directly (build_data.py, check_content_integrity.py, js/*.js, locales/*.json, playwright.config.js, tools/*.py, data/*.json)

This appendix extracts schemas, rules, configurations, and conventions from the actual N5 codebase so a Mode-B agent can implement them without inferring from prose. Every section here corresponds to a specific deferred F-20 item.

---

## B.1 Vocab-ID slug derivation rule (closes F-20.20, P0)

**Source:** `tools/build_data.py` lines 285-293.

**Rule (extracted verbatim from build pipeline):**

```python
# Slug is the lowercase section title with non-alphanumerics collapsed
# to single hyphens, trimmed to 24 chars, with "misc" as the empty-section
# fallback.
slug = re.sub(r"[^a-z0-9]+", "-", section.lower()).strip("-")[:24] or "misc"

# Base ID:
base_id = f"n5.vocab.{slug}.{form}"

# Disambiguator on collision: append ".2", ".3", ... in insertion order
vid = base_id
i = 2
while vid in seen_ids:
    vid = f"{base_id}.{i}"
    i += 1
```

**Rules in plain English:**

1. The section slug is derived from the section heading text in `vocabulary_n5.md`. Lowercase, all non-`[a-z0-9]` characters → `-`, leading/trailing `-` stripped, capped at 24 characters. If the result is empty, use `misc`.
2. The vocab ID is `n<L>.vocab.{section-slug}.{form}` for any next level (replace `n5` → `n<L>`).
3. The `form` is the head-word as written in the catalog (could be kanji, kana, or katakana).
4. If a (section, form) pair recurs (i.e., the same vocab item is listed in multiple sections OR the section repeats a form), the second occurrence appends `.2`, third `.3`, etc.

**Examples (drawn from N5):**

| Section heading | Slug | Form | Resulting ID |
|---|---|---|---|
| `4. Body parts` | `4-body-parts` | あし | `n5.vocab.4-body-parts.あし` |
| `18. Drinks` | `18-drinks` | おちゃ | `n5.vocab.18-drinks.おちゃ` |
| `27. Verbs (Group 1)` | `27-verbs-group-1-verb` (truncated to 24) | おく | `n5.vocab.27-verbs-group-1-verb.おく` |
| (collision case) | (same as above) | きる (2nd occurrence) | `<same-prefix>.きる.2` |

**For any next level N<L>:**
- Replace `n5.` → `n<L>.` in the prefix.
- Section structure follows `vocabulary_n<L>.md` — the agent must NOT invent section names; they should be derived from the authored KB file.
- Cross-listings in multiple thematic sections are intentional (N5 has 10 such pairs); use the same slug-encoding strategy. Annotate the second-occurrence gloss with `(also in §X)` for human readability.

**CI invariant** that depends on this rule: JA-12 (Kanji KB / JSON consistency) implicitly checks the round-trip from MD section → JSON id; if the slug rule diverges, the consistency check fails.

---

## B.2 Audio manifest schema (closes F-20.18, P0)

**Source:** `data/audio_manifest.json` shape inspection.

**Top-level structure:**

```json
{
  "backend": "gtts",                    // string; one of "gtts" | "piper" | "pyttsx3" | "native"
  "voice_default": "synthetic-gtts",    // string; default voice tag for items that don't override
  "items": [ /* AudioItem[] */ ]
}
```

**`AudioItem` shape:**

```json
{
  "id": "grammar.n5-001.0",             // string; PK; pattern: "<corpus>.<entity-id>.<index>"
  "path": "audio/grammar/n5-001.0.mp3", // string; relative to repo root, forward-slash normalized
  "skipped": true,                      // boolean (optional, default false); true if file not generated
  "voice": "synthetic-gtts"             // string; voice tag (allows mixing native + synthetic)
}
```

**ID conventions per corpus:**
- Grammar examples: `grammar.<patternId>.<exampleIndex>` (e.g., `grammar.n<L>-042.2`)
- Reading passages: `reading.<passageId>` (e.g., `reading.n<L>.read.012`)
- Listening items: `listening.<itemId>` (e.g., `listening.n<L>.listen.005`)

**Voice tag enum (level-agnostic; same set used at every level):**
- `"synthetic-gtts"` — Google Translate TTS, web-synthesized
- `"synthetic-piper"` — Piper local TTS (ONNX models)
- `"synthetic-pyttsx3"` — pyttsx3 local fallback
- `"native"` — recorded by a native speaker (preferred for listening at any level lower than N5)
- `"native-{speaker-id}"` — when multiple native voices used (e.g., `"native-suiraku"`)

**JA-15 invariant rule (the audio-resolution check):**

For every `AudioItem` where `skipped !== true`:
- The `path` must resolve to an existing file on disk.
- The file size must be > 100 bytes (rejects empty placeholder files).
- The file extension must match `.mp3` or `.wav`.

For items where `skipped === true`:
- `path` is reserved (the file would be generated if `skipped` flipped to false). The path string is required but the file need not exist.

**Build pipeline behavior (`tools/build_audio.py`):**
- Auto-detects backend in priority order: piper > gtts > pyttsx3 > skip.
- Idempotent: if `path` exists with size > 100B, regeneration is skipped (re-running the script does nothing).
- For `voice: "native"` items, the script SKIPS generation (assumes externally provided).
- Manifest is rewritten on every run with current state.

**For any next-level transition:**
- The schema is identical. Just update `n5` → `n<L>` in IDs.
- Plan to mix `native` for listening items + `synthetic-gtts` for grammar/reading. Voice mixing is supported in the same manifest.

---

## B.3 JSON schemas for data/*.json (closes F-20.16)

Inferred from N5 `data/*.json` shapes. These should be formalized as `specifications/schemas/<file>.schema.json` files at next-level (N<L>) build time. The agent can run `python -c "import genson; ..."` to auto-generate JSON Schema from N5 files, or hand-author from these inventories.

### B.3.1 grammar.json

```
{
  "_meta": {
    "schema_version": str,            // e.g., "1.0"
    "pattern_count": int,
    "id_range": { "first": str, "last": str },
    "history": str[]                  // append-only log
  },
  "patterns": Pattern[]
}

Pattern = {
  "id": str (req)                     // "n<L>-NNN"
  "pattern": str (req)                // surface form, e.g., "～です／～ます"
  "meaning_en": str (req)
  "meaning_ja": str (req)             // やさしい にほんご
  "category": str (req)               // fine-grained, e.g., "Particles"
  "tier": "core_n<L>" | "late_n<L>" | "n<L-1>_borderline" (req)
  "patternOrder": int (req)           // for stable sort within category
  "form_rules": {
    "attaches_to": str[],             // e.g., ["noun", "verb_stem_i"]
    "conjugations": [{
      "label": str,                   // "Present affirmative" etc.
      "form": str,                    // form-tag e.g. "polite-aff"
      "example": str                  // ja
    }]
  },
  "examples": [{                      // 2-5 typical
    "form": str,                      // optional form-tag
    "ja": str (req),
    "translation_en": str (req),
    "furigana": [{ "reading": str, "indices": [int, int] }]?,
    "vocab_ids": str[]?               // populated by link_grammar_examples_to_vocab.py
  }],
  "common_mistakes": [{
    "wrong": str,                     // ja with the typical error
    "right": str,                     // ja correct form
    "why": str                        // English explanation
  }]?,
  "notes": str?,
  "explanation_en": str?              // longer-form prose
}
```

### B.3.2 questions.json

```
{
  "_meta": {
    "schema_version": str,
    "question_count": int,
    "type_distribution": { "mcq": int, "sentence_order": int, "text_input": int },
    "id_range": { "first": str, "last": str },
    "id_gap_policy": "documented" | "contiguous",
    "id_gap_explanation": str,
    "id_gaps": [{ "from": str, "to": str, "cause": str }]?,
    "history": str[]
  },
  "questions": Question[]
}

Question = MCQQuestion | SentenceOrderQuestion | TextInputQuestion

MCQQuestion = {
  "id": str (req)                     // "q-NNNN"
  "grammarPatternId": str (req),      // n<L>-NNN
  "type": "mcq" (req),
  "subtype": "paraphrase" | "kanji_writing" | null,  // optional MCQ flavor
  "direction": "j_to_e" | "e_to_j",
  "prompt_ja": str (req),             // instruction text
  "question_ja": str (req),           // stem with （  ） blank
  "choices": str[4] (req),
  "correctAnswer": str (req),         // must be a member of choices
  "explanation_en": str (req),
  "distractor_explanations": { [choice]: str },  // 3 entries (one per wrong choice)
  "high_confusion": bool?,
  "difficulty": int (req),            // 1..5
  "auto": bool (req)                  // true = template-generated; false = manually reviewed
}

SentenceOrderQuestion = {
  "id": str,
  "grammarPatternId": str,
  "type": "sentence_order",
  "direction": "j_to_e" | "e_to_j",
  "prompt_ja": str,
  "tiles": str[],                     // shuffled tokens
  "correctOrder": int[],              // indices into tiles, in correct order
  "explanation_en": str,
  "difficulty": int,
  "auto": bool
}

TextInputQuestion = {
  "id": str,
  "grammarPatternId": str,
  "type": "text_input",
  "direction": "j_to_e" | "e_to_j",
  "prompt_ja": str,
  "question_ja": str,                 // stem with ___ blank
  "acceptedAnswers": str[],           // all forms that count as correct
  "correctAnswer": str,               // canonical (shown in feedback)
  "explanation_en": str,
  "difficulty": int,
  "auto": bool
}
```

### B.3.3 vocab.json

```
{
  "entries": [{
    "id": str,                        // n<L>.vocab.{slug}.{form}[.disambiguator] — see B.1
    "form": str,                      // headword
    "reading": str,                   // kana reading; equals form for kana-only entries
    "gloss": str,                     // English meaning
    "section": str,                   // section heading text (the slug source)
    "pos": str?,                      // part-of-speech tag — see B.6 vocab POS values
    "tier"?: "core_n<L>" | "late_n<L>" | "prerequisite_n<P>"  // for any N<L>: include lower-level prerequisites with tier flag
  }],
  "_meta": { "vocab_count": int, "section_count": int, "history": str[] }
}
```

### B.3.4 kanji.json

```
{
  "entries": [{
    "kanji": str (req),               // single CJK character
    "on": str[],                      // on-yomi readings (katakana)
    "kun": str[],                     // kun-yomi readings (hiragana, with ( ) markers for okurigana)
    "meanings": str[],                // English meanings
    "stroke_order_svg": str?,         // path to SVG file
    "tier": "core_n<L>" | "late_n<L>" | "prerequisite_n<P>"  // see B.10
  }],
  "_meta": { "kanji_count": int, "history": str[] }
}
```

### B.3.5 reading.json

```
{
  "passages": [{
    "id": str,                        // "n<L>.read.NNN"
    "level": "easy" | "medium" | "hard",
    "topic": str,                     // e.g., "shopping"
    "title_en": str,
    "ja": str,                        // the passage text
    "translation_en": str,
    "audio": str?,                    // path; matches AudioItem.path
    "questions": [{
      "id": str,                      // "n<L>.read.NNN.qM"
      "prompt_ja": str,
      "choices": str[4],
      "correctAnswer": str,
      "explanation_en": str,
      "format_role": "primary" | "extra" | "info_search"  // mondai sub-format
    }],
    "tier": "core_n<L>" | "late_n<L>",
    "kanji_used": str[],              // populated by build pipeline
    "vocab_used": str[]               // populated by build pipeline
  }],
  "_meta": { "passage_count": int, "history": str[] }
}
```

### B.3.6 listening.json

```
{
  "items": [{
    "id": str,                        // "n<L>.listen.NNN"
    "format": "task" | "point" | "utterance",  // mondai-1 / 2 / 3-4
    "script_ja": str,                 // dialog or narration
    "translation_en": str,
    "audio": str,                     // path
    "questions": [{
      "id": str,
      "prompt_ja": str,
      "choices": str[4],
      "correctAnswer": str,
      "explanation_en": str
    }]
  }],
  "_meta": { "item_count": int, "history": str[] }
}
```

### B.3.7 audio_manifest.json

See B.2.

---

## B.4 i18n locale-file format (closes F-20.19)

**Source:** `locales/*.json` (5 files: en, vi, id, ne, zh).

**Convention:**
- One JSON file per locale at `locales/<lang-code>.json`
- Locale codes: ISO 639-1 (en, vi, id, ne, zh)
- All locales share the SAME nested-key structure; missing keys in non-English locales fall back to the English value at runtime
- The structure is hierarchical (objects, not flat dotted keys)

**Top-level shape (from N5 `locales/en.json`):**

```json
{
  "app": { "title": "...", "tagline": "..." },
  "nav": { "learn": "...", "test": "...", "drill": "...", "review": "...",
           "summary": "...", "settings": "...", "diagnostic": "..." },
  "drill": { "start": "...", "due_today": "...", "in_queue": "...", "graduated": "..." },
  "test": { "start_long": "...", "start_short": "...", "next": "...", "submit": "...", "results": "..." },
  "review": { ... },
  "summary": { ... },
  "settings": { ... },
  "errors": { "generic": "...", "audio_unavailable": "...", "offline": "..." }
}
```

**Source-locale-of-truth:** `locales/en.json` is canonical. When a new key is added at any N<L> build, add it to `en.json` first; other locales fall back to en until translated.

**Translation pipeline (N5 has no automation; translations are manually authored):**
- Translator reads `en.json`, produces a parallel `<lang>.json` keeping the SAME key structure.
- Missing keys → fall back to en (no warning at runtime; the string just renders in English).
- Extra keys → ignored.

**For any next level (recommendation):**
- Keep all 5 N5 locales for parity.
- N<L>-new content (grammar explanations, distractor reasons) is English-only at v1; translate in v2 if learner base justifies the cost.
- Add a `tools/extract_locale_keys.py` script (Pass-22) that diffs the en JSON against each non-en JSON and produces a TODO list of missing keys.

**Runtime contract (i18n.js):**
- Single global `T(key)` function: `T("nav.learn")` → "Learn" (en) or "学ぶ" (etc.).
- Locale selection: URL hash override (`#/?lang=vi`) > localStorage `lang` > browser `navigator.language` > `"en"`.

---

## B.5 Front-end test framework + Playwright config (closes F-20.23)

**Source:** `playwright.config.js` + `tests/p0-smoke.spec.js` + `package.json` scripts.

**Framework:** Playwright (`@playwright/test`). The 37-test claim from N5 status snapshot covers Playwright smoke tests + JS unit-style tests run inside the page (the front-end has no separate unit-test framework).

**Playwright config (verbatim from N5):**

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile',  use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'python -m http.server 8000',
    url: 'http://localhost:8000/',
    timeout: 15_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
```

**Why Python http.server as the test fixture:** the app is static HTML/CSS/JS with no Node server. Python's built-in `http.server` is available wherever Python 3 is, including CI.

**Smoke test categories (in `tests/p0-smoke.spec.js`):**
1. Home loads — title, nav, no console errors
2. Hash routes resolve — `#/learn`, `#/test`, `#/drill`, `#/review`, `#/summary`, `#/settings` each render expected heading
3. Learn TOC expands and contains pattern cards
4. Pattern detail page renders for a known ID — title, examples, prev/next nav
5. Test mode flow — start → answer → submit → results
6. Drill due-count badge updates after a session
7. Review SM-2 buttons — Again/Hard/Good/Easy each fire the correct interval
8. Summary tab renders without errors when state is empty
9. Settings — theme toggle, locale switch, reset progress
10. PWA — service worker registers, manifest is valid
11. Offline — second visit works without network

**Run:**
```
npm install
npm run test:install-browsers   # one-time: downloads Chromium
npm run test:smoke              # full suite headless
npm run test:smoke:headed       # watch the browser
```

**For any next level:**
- Copy `playwright.config.js` verbatim.
- Adapt smoke tests to N<L> routes/IDs (find/replace `n5` → `n<L>`; replace pattern IDs).
- Wire into `.github/workflows/playwright-p0-smoke.yml` as a CI gate.

---

## B.6 UI module list with descriptions (closes F-20.22)

**Source:** files in `js/` directory of N5 (25 files as of HEAD `7e82cc4`).

| File | Responsibility | Imports / depends on | Exports |
|------|----------------|----------------------|---------|
| `app.js` | Main entry point; routing, app shell, initial render | all chapter modules | (initializes on DOMContentLoaded) |
| `i18n.js` | Locale selection + `T(key)` translation function | `locales/<lang>.json` (fetched) | `T`, `setLocale` |
| `storage.js` | LocalStorage wrappers; SRS state, progress, settings | (none) | `getProgress`, `saveProgress`, `getPatternEntry`, `setManuallyKnown`, `recordAttempt`, ... |
| `furigana.js` | Renders Japanese with optional ruby annotations; 3-mode visibility | (none) | `renderJa(ja, furigana?)` |
| `home.js` | Home page: brief hero, nav cards | i18n | `renderHome` |
| `learn.js` | Chapter 1 — Learn hub + Grammar TOC + Pattern detail + Vocab list/detail | storage, furigana | `renderLearn` |
| `test.js` | Chapter 2 — Test mode (mock-test flow with hide-answer-until-commit) | storage, furigana | `renderTest` |
| `drill.js` | Chapter 3 — Daily Drill (random sample of weak/due items) | storage, furigana | `renderDrill` |
| `review.js` | Chapter 4 — SM-2 SRS Review session | storage, furigana | `renderReview` |
| `summary.js` | Chapter 4b — Summary (mastered/weak/untested + heatmap + error patterns + recommendation) | storage, furigana | `renderSummary` |
| `diagnostic.js` | First-run diagnostic placement test (~10 questions) | storage, furigana | `renderDiagnostic` |
| `settings.js` | Settings panel (theme, locale, font, reset, export/import) | storage, i18n | `renderSettings` |
| `kanji.js` | Kanji list + per-kanji detail page | storage, furigana | `renderKanji`, `renderKanjiDetail` |
| `kanji-popover.js` | Hover popover showing kanji on/kun + meaning when hovering kanji in body text | storage | `attachKanjiPopovers(container)` |
| `reading.js` | Dokkai mode: passage browser + comprehension | storage, furigana | `renderReading` |
| `listening.js` | Listening mode: chokai items with audio + comprehension | storage, furigana | `renderListening` |
| `kosoado.js` | こそあど interactive trainer (matching pairs by spatial relation) | storage | `renderKosoado` |
| `wa-vs-ga.js` | は vs が trainer | storage | `renderWaVsGa` |
| `verb-class.js` | Group-1 / Group-2 / Group-3 verb classifier trainer | storage | `renderVerbClass` |
| `te-form.js` | て-form gym (drilling all the rules) | storage | `renderTeForm` |
| `particle-pairs.js` | Interchangeable-particle pairs trainer (に/へ, は/が, etc.) | storage | `renderParticlePairs` |
| `counters.js` | Counter trainer (枚, 本, 個, 人, etc.) | storage | `renderCounters` |
| `search.js` | Cross-corpus search (grammar + vocab + kanji + reading) | (loads all corpora) | `renderSearch`, `searchAll(query)` |
| `pwa.js` | Service worker registration, update toast, install prompt | (none) | (auto-runs on load) |
| `shortcuts.js` | Keyboard shortcuts (j/k navigation, ?, /, etc.) | (none) | `attachShortcuts()` |
| `normalize.js` | Text normalization helpers (full-width → half-width, NFC, etc.) | (none) | `normalize(s)`, `normalizeAnswer(s)` |

**State contract:**
- All persistent state lives in `localStorage` under keys prefixed `jlpt-n5-tutor.*` (replace `n5` → `n<L>`).
- Read/write goes through `storage.js` only (no direct `localStorage.getItem` elsewhere).
- Export/import dumps all keys with the prefix as a single JSON blob.

**Routing contract:**
- Hash router in `app.js`; URL fragment after `#/` is the route.
- `#/learn`, `#/learn/grammar`, `#/learn/<patternId>`, `#/learn/vocab`, `#/learn/vocab/<form>`, `#/kanji`, `#/kanji/<glyph>`, `#/test`, `#/test/<n>`, `#/drill`, `#/review`, `#/summary`, `#/settings`, `#/diagnostic`, `#/reading`, `#/reading/<id>`, `#/listening`, `#/listening/<id>`, `#/kosoado`, `#/wa-ga`, `#/verbs`, `#/te-form`, `#/particle-pairs`, `#/counters`, `#/search`.

**For any next level:** copy the module list verbatim; adapt `n5` → `n<L>` references.

---

## B.7 KB markdown grammar / BNF (closes F-20.15)

**Source:** `tools/build_data.py` parsing rules + observed structure of `KnowledgeBank/*.md`.

### B.7.1 grammar_n<L>.md (catalog of grammar patterns)

```
File         := Header SectionList
Header       := "# JLPT N<L> Grammar Patterns" "\n" Preamble
Preamble     := free-form markdown until first "## "
SectionList  := Section+
Section      := "## " SectionTitle "\n" PatternEntry+
SectionTitle := plain text (e.g., "Particles", "Common Set Patterns")
PatternEntry := PatternHeader Body
PatternHeader:= "### " PatternId " — " PatternSurfaceForm "\n"
PatternId    := "n<L>-" 3*DIGIT
Body         := YamlFrontMatter? FreeForm Examples? CommonMistakes? Notes?
YamlFrontMatter := "```yaml" "\n" key-value-pairs "\n" "```"
                   // populates: meaning_en, meaning_ja, category, tier,
                   // attaches_to, conjugations
Examples     := "**Examples**" "\n" ExampleEntry+
ExampleEntry := "- " ja " — " translation_en "\n"
              | "- " "(" form_tag ")" " " ja " — " translation_en "\n"
CommonMistakes := "**Common mistakes**" "\n" MistakeEntry+
MistakeEntry := "- ❌ " wrong_ja "\n" "  ✅ " right_ja "\n" "  Why: " why "\n"
Notes        := "**Notes**" "\n" free-form
```

**Parser rules (from `tools/build_data.py`):**
- Pattern ID detection: `^### (n<L>-\d{3}) — (.+)$`
- Example detection: `^- ` (with optional `\(form\)\s+` prefix)
- The em-dash separator in examples is U+2014; X-6.5 forbids it. **N5 used a hyphen** ` - ` instead. **At any next level, use hyphen too** to keep X-6.5 invariant green.

### B.7.2 vocabulary_n<L>.md (catalog of vocab)

```
File        := Header SectionList
Section     := "## " N "." " " SectionTitle "\n" VocabEntry+
VocabEntry  := "- " form (" (" reading ")")? " - " gloss tags?
tags        := " **[Ext]**" | " **[Cul]**" | " **[Adv]**"
              // [Ext] = extension (out of strict N<L> but commonly in materials)
              // [Cul] = cultural item
              // [Adv] = advanced (N3-borderline)
```

**Parser rules:**
- Section number prefix `N.` is preserved in the section heading and used for slug derivation (B.1).
- The reading is in parentheses immediately after the form. For kana-only words, the reading is the form itself (the parser auto-fills it).
- Tags `[Ext]` / `[Cul]` / `[Adv]` are stripped from the gloss before output but stored as `tier` metadata.

### B.7.3 kanji_n<L>.md (catalog of kanji)

```
File         := Header KanjiList
KanjiList    := KanjiEntry+
KanjiEntry   := "- **" KANJI "**" "\n"
                "  - On: " on_readings "\n"
                "  - Kun: " kun_readings "\n"
                "  - Meaning: " meanings ("\n")?
                ("  - " note_line "\n")*
on_readings  := katakana ("," " " katakana)*
kun_readings := hiragana_with_okurigana ("," " " hiragana_with_okurigana)*
hiragana_with_okurigana := hiragana ("(" hiragana ")")?
                          // e.g., あ(げる) where あ is the kanji-attached part
                          // and げる is the okurigana suffix
meanings     := plain English, comma-separated
```

**Parser rules:**
- Header regex (from N5 `build_data.py` after Pass-13 fix): `r"^\s*-\s+\*\*([一-鿿])\*\*"` — note the relaxed end (no `\s*$`) to allow `**[Ext]**`-tagged entries.
- Each kanji entry must have at least one reading on On OR Kun line; meaning is required.

### B.7.4 *_questions_n<L>.md (moji / goi / bunpou / dokkai / chokai)

```
File          := Header MondaiList
MondaiList    := Mondai+
Mondai        := "## Mondai " N " - " MondaiName ("\n" Description)? QuestionList
QuestionList  := QuestionEntry+
QuestionEntry := "### Q" N ("\n" "\n")? StemBlock ChoiceList AnswerLine
StemBlock     := free-form ja text (may include <u>...</u> for kanji-reading questions
                or __...__ for orthography questions)
ChoiceList    := ChoiceLine{4}
ChoiceLine    := N ". " text
AnswerLine    := "**Answer: " N "**" (" - " rationale)?
                // rationale is optional; required for HIGH-confusion questions
```

**Parser rules:**
- Question ID derived from file + Mondai number + Q number; e.g., `bunpou-Q94`. The build pipeline maps these to `q-NNNN` IDs in the unified `questions.json`.
- For `dokkai`: stems may reference passage IDs; the parser cross-references to `reading.json` IDs.

### B.7.5 reading_n<L>.md (passages with comprehension questions)

```
File         := Header MondaiList
Mondai       := "## Mondai " N " - " MondaiName "\n" PassageEntry+
PassageEntry := "### Passage " N " (Q" QStart "-Q" QEnd ")" "\n"
                "> " ja_passage "\n"
                "> " (continuation_lines)*
                QuestionList
QuestionList := QuestionEntry+
QuestionEntry:= "#### Q" N "\n" prompt_ja "\n" ChoiceList AnswerLine FormatRoleLine?
FormatRoleLine := "**Format role:** primary" | "**Format role:** extra"
                                                   | "**Format role:** info_search"
```

**Parser rules:**
- `> ` prefix on each passage line is the Markdown blockquote convention; the parser strips it before storing.
- `format_role` defaults to `primary` if absent; explicit value required for info_search (Mondai 6).

### B.7.6 chokai_n<L>.md (listening — same as reading_n<L> but with audio path required)

Same shape as reading_n<L> with these additions:
- `**Audio:** audio/listening/n<L>.listen.NNN.mp3` line per item (parser populates `audio` field)
- `**Format:** task | point | utterance` line (mondai-1 / 2 / 3-4)

---

## B.8 Invariant rule specifications (closes F-20.17)

**Source:** function-by-function extraction from `tools/check_content_integrity.py`. Each rule below is the actual logic — implementable from this spec without reading the N5 source.

### X-6 series (catalog-level invariants)

| Invariant | Rule | Violation message |
|---|---|---|
| X-6.1 Catalog completeness | Every grammar pattern has `examples.length >= 1` AND `form_rules.attaches_to.length >= 1` | "{patternId} missing {field}" |
| X-6.2 Year-form consistency | The forms 今年 / こんねん / ことし follow the per-file policy (catalog uses ことし; questions use ことし or kana). Specific rule: `今年` MUST be read as ことし in any furigana annotation. | "{file}:{line} reading mismatch: '今年' annotated as '{actual}' (must be 'ことし')" |
| X-6.3 No mixed kanji+kana words | Words must be wholly kanji+okurigana OR wholly kana, not mixed forms like 大さか, 図しょかん, 学こう. Detection: regex `[一-鿿]+[ぁ-ん]+[一-鿿]` in word-boundary contexts. | "{file}:{line} mixed-kana word: '{word}'" |
| X-6.4 Lint script present | `tools/check_content_integrity.py` exists and is executable. Bootstrap-only check. | "lint script missing" |
| X-6.5 No em-dashes | No file contains U+2014 (`—`) or U+2013 (`–`). | "{file}:{line} em-dash at column {col}" |
| X-6.6 Ru-verb exception flags | Group-1 verbs that LOOK like Group-2 (帰る, 入る, 切る, 知る, 走る, 要る, etc.) MUST be flagged in BOTH the section header AND on each individual entry. | "{file}: vocab entry '{form}' is a known Group-1 ru-verb exception but lacks the **(group 1)** flag" |
| X-6.7 No false synonymy | The strings `Direct synonym|directly equivalent|same as` in goi rationales — except for whitelisted true-synonym pairs. | "{file}:{line} synonym overclaim: '{snippet}'" |
| X-6.8 No ASCII digits in TTS source | The fields used as TTS source (grammar.examples[].ja, reading.passages[].ja, listening.items[].script_ja) must have all numbers as kanji (一二三...) or kana (いち, に, さん). ASCII digits 0-9 forbidden. | "{file}:{path} ASCII digit '{d}' in TTS source" |
| X-6.9 Primary-reading sanity | Each kanji's primary on-yomi (first in `on[]`) and kun-yomi (first in `kun[]`) must be the most-frequent reading per the Tanos N<L> (or appropriate level) data. | "{kanji} primary on/kun divergence from level authority" |

### JA series (Japanese-language-accuracy invariants)

| Invariant | Rule |
|---|---|
| JA-1 Stem-kanji scope | Every kanji in `questions[].question_ja` AND `questions[].prompt_ja` must be in `data/n<L>_kanji_whitelist.json` (the level-specific whitelist) |
| JA-2 Particle-set sanity | For MCQs where `correctAnswer` is a single particle (length ≤ 2 chars, all in the particle set), all distractors must also be valid particles from the set: `{は, が, を, に, で, と, も, へ, から, まで, より, の, ね, よ, か, や, ぐらい, ごろ, など, しか, だけ, ばかり, でも, ても}` |
| JA-3 Furigana / catalog match | Every `furigana[].reading` in grammar.examples MUST be a valid kana sequence (regex `^[ぁ-んー]+$`); `indices` MUST be in-bounds of the `ja` string |
| JA-4 Vocab reading uniqueness | Within a single section, no two entries may have the SAME (form, reading) pair (cross-section duplicates are allowed and intentional — see B.1) |
| JA-5 Answer-key sanity | For every MCQ: `correctAnswer in choices`. For sentence_order: `correctOrder` is a permutation of `range(len(tiles))`. For text_input: `correctAnswer in acceptedAnswers` |
| JA-6 No two-correct-answers | For every MCQ where `choices` contains both members of a known interchangeable pair AND `correctAnswer` is one of the pair members AND `question_ja` contains no scene-context parenthetical — flag as multi-correct. Pairs: `(に, へ)` for motion verbs, `(は, が)` for stative predicates, `(から, ので)` for reason clauses, `(に, と)` for でんわ-recipients, `(まで, から)` for time ranges, ko-so-a-do quartets without spatial scene |
| JA-7 No duplicate stems in file | No two questions share the same `question_ja` (or `prompt_ja + question_ja` if both are content-bearing). Exception: same stem in different `type` (mcq vs text_input parallel pair, like q-0001 / q-0418) is allowed |
| JA-8 Q-count integrity | `_meta.question_count == len(questions)` |
| JA-9 Engine display contract | The runtime test engine (test.js + drill.js + review.js) hides `**Answer:** N` and any rationale lines until `submit()` is called. CI test that loads a question and asserts the answer is NOT in the visible DOM before commit |
| JA-10 No "(see n<L>-)" redirect text | The strings `(see n<L>-` and `see pattern detail` and `Wrong choice - see` are forbidden in any user-facing field (`question_ja`, `prompt_ja`, `explanation_en`, `distractor_explanations.*`) |
| JA-11 No duplicate MCQ choices | For every MCQ, `len(set(choices)) == len(choices)` |
| JA-12 Kanji KB / JSON consistency | The set of kanji headers in `KnowledgeBank/kanji_n<L>.md` must equal the set of `kanji` fields in `data/kanji.json` |
| JA-13 No out-of-scope kanji | Every CJK character in `questions[].question_ja`, `questions[].prompt_ja`, `questions[].distractor_explanations.*`, `vocab.entries[].gloss`, `grammar.patterns[].notes`, `grammar.patterns[].explanation_en` must be in the N<L> whitelist |
| JA-14 No auto-ruby in renderer | The string `auto-ruby` or any code path that auto-applies furigana to whitelisted kanji must NOT exist in `js/furigana.js`. (Auto-furigana was removed in Pass-13; this guards regression.) |
| JA-15 Audio refs resolve | Every `audio_manifest.json` `items[].path` where `skipped !== true` must exist on disk with size > 100B. See B.2 |
| JA-16 Kanji example whitelist | For each kanji entry in `data/kanji.json`, every kanji in its example sentences must be either the target kanji itself OR in the N<L> whitelist OR in any prerequisite-level whitelist (i.e., the union of N5..N<L> per §11.2) |
| JA-17 Grammar examples have vocab_ids | Every `grammar.patterns[].examples[]` must have a `vocab_ids` field populated by `tools/link_grammar_examples_to_vocab.py` (homograph guard linkage) |
| JA-18 Reading explanation kanji ⊂ passage | Every kanji in `reading.passages[].questions[].explanation_en` must appear in the passage's `ja` text |
| JA-19 Reading info-search has format_type | Mondai-6 (情報検索) reading questions must have `format_role: "info_search"` |
| JA-20 Reading choices kanji ⊂ passage | Every kanji in `reading.passages[].questions[].correctAnswer` AND in the choices must appear in the passage's `ja` text |
| JA-21 Late-tier grammar markers require tier=late_n<L> | At any level N<L>, any pattern in `data/grammar.json` whose `pattern` string is in the late-N<L> set (per Bunpro vs Tanos contrast — see Appendix A.7) must have `tier: "late_n<L>"` or `tier: "n<L-1>_borderline"`. The level-parametric equivalent of N5's late_n5 check |
| JA-22 No "direct synonym" in goi rationales | Same as X-6.7 but specifically scoped to `KnowledgeBank/goi_questions_n<L>.md` (catches synonym-overclaim regressions; added Pass-15) |
| JA-23 Multi-correct scanner advisory | Same logic as JA-6 but emits as WARN (not FAIL) for native review. Wire as `--warn` mode of the integrity check |
| JA-24 No duplicate pattern strings | No two grammar entries with overlapping `meaning_en` may share the same `pattern` string (catches Pass-19 redundancy class) |

**Augmented sets:** rules JA-1 / JA-13 / JA-16 reference whitelist files. The whitelist files are augmentable per-level; agent-added exceptions MUST include a `# WHY: <reason>` comment justifying inclusion. Pass-22 candidate: enforce comment-presence check.

---

## B.9 Diagnostic Summary algorithm (closes F-20.24)

**Source:** `js/summary.js`.

### B.9.1 Error-pattern detection (renderErrorPatterns)

For each `result` in the test-results log:
1. Look up the pattern's category (`grammarPatternId` → `grammar.json[id].category`).
2. Bucket by category. Count failures vs successes per category.
3. For categories with `failure_rate >= 0.5 AND attempts >= 3`, surface as an "error pattern" with:
   - Category name
   - Failure count / total attempts (e.g., "4/5 = 80%")
   - 3 most-recent failed pattern IDs (linked to detail pages)

### B.9.2 Recommended next session (renderRecommendation)

Decision tree (from N5 `js/summary.js` lines 158-186):
1. If `weakIds.length >= 3`: recommend "Drill weak items (N candidates)" → routes to `#/drill`.
2. Else if there are due SRS items today (count from storage): recommend "Review N due items" → `#/review`.
3. Else if `untestedIds.length >= 5`: recommend "Test new patterns (N untested)" → `#/test`.
4. Else: recommend "Daily Drill — keep your streak going" → `#/drill`.

All recommendations carry an estimated time ("~5 min", "~15 min") computed as `weight * count` where weight is per-mode (drill=1min, review=0.5min, test=2min).

### B.9.3 Session log (renderSessionLog)

- Display the most-recent 20 test sessions with: date, mode (test/drill/review), score, duration.
- Sourced from `storage.getProgress().sessions[]`.
- Retention: localStorage stores all sessions indefinitely (~1KB each, so 1000 sessions = ~1MB; bounded by browser's 5-10MB limit).
- Export/import preserves session log.

### B.9.4 Heatmap (renderHeatmap)

- Per-pattern grid: each cell is a pattern colored by SRS state (`mastered` green, `weak` red, `seen` neutral, `untested` empty).
- Hover shows pattern title + last-seen date.
- Layout: super-category sections, patterns sorted by `patternOrder`.

### B.9.5 Implementation contract for any next level

- Storage shape (from `storage.js`; substitute the level number for `<L>`):
  ```
  jlpt-n<L>-tutor.progress = {
    "patterns": { [patternId]: { isMastered, isWeak, isManuallyKnown, lastAttemptIso, attempts, correctCount } },
    "sessions": [{ date, mode, score, duration, attemptedIds[] }],
    "srs": { [patternId]: { EF, rep, due, interval, lapses } }    // see A.10
  }
  ```
- All Summary tab features (error patterns, recommendation, session log, heatmap) read from this shape — no extra storage required.

---

## B.10 Kanji-tier vs grammar-tier interaction (closes F-20.21, F-20.25)

### B.10.1 Tier values per corpus

| Corpus | Tier values (N4 example; substitute `n<L>` for any other level) |
|---|---|
| Grammar | `core_n<L>` / `late_n<L>` / `n<L-1>_borderline` |
| Kanji   | `core_n<L>` / `late_n<L>` / `prerequisite_n<P>` |
| Vocab   | `core_n<L>` / `late_n<L>` / `prerequisite_n<P>` |

### B.10.2 Whitelist composition rule (recommended)

The `data/n<L>_kanji_whitelist.json` should be the UNION of N5 ∪ N4 ∪ ... ∪ N<L> kanji (level-cumulative; e.g., ~280 entries at N4, ~650 at N3, etc.). Each kanji entry in `data/kanji.json` carries a `tier` field distinguishing prerequisite vs new:

```json
[
  { "kanji": "人", "tier": "prerequisite_n<P>", "on": [...], "kun": [...] },
  { "kanji": "立", "tier": "prerequisite_n<P>", ... },
  { "kanji": "案", "tier": "core_n<L>", ... },
  { "kanji": "達", "tier": "late_n<L>", ... }
]
```

**Why UNION not strict-N<L>-only:**
- Reading passages at any level naturally use a mix of the target-level kanji AND prerequisite-level kanji.
- Forcing strict-N<L>-only would require either kana-only passages (unrealistic) OR prerequisite-level-kanji-as-violations (false positives).
- The `tier` field lets the UI optionally hide prerequisite-N5 from "new kanji" stats while still allowing them in passages.

### B.10.3 JA-13 invariant interaction

JA-13 ("no out-of-scope kanji in user-facing data") consults `data/n<L>_kanji_whitelist.json`. With the union approach, the whitelist contains both target-level and prerequisite-level kanji, so prerequisite use is allowed.

For mock-test mode: the engine should still highlight "this kanji is in your N<L> study list" (tier=core_n<L> or late_n<L>) vs "you should know this from N<P>" (tier=prerequisite_n<P>).

### B.10.4 Cross-level scaling (N3 / N2 / N1)

For each higher level X:
- Kanji whitelist = N5 ∪ N4 ∪ ... ∪ N<L> (the cumulative-down-to-target union)
- Each kanji entry gets `tier: prerequisite_<lower-level>` or `tier: core_X` / `tier: late_X`
- JA-13 invariant uses the union whitelist; no per-level strict mode.

This is the "recommended" composition. An alternative "strict-level-only" mode is possible (whitelist = NX only, JA-13 fails on prerequisites) but it doesn't match how learners actually progress. Stick with union.

---

## B.11 External-corpus URL list per level (closes F-20.26)

**Vetted authoritative sources** (used in N5; level-extensible):

### Per-level grammar references
- **N5:** https://jlptsensei.com/jlpt-n5-grammar-list/, https://www.tanos.co.uk/jlpt/jlpt5/grammar/, https://bunpro.jp/jlpt/n5
- **N4:** https://jlptsensei.com/jlpt-n4-grammar-list/, https://www.tanos.co.uk/jlpt/jlpt4/grammar/, https://bunpro.jp/jlpt/n4
- **N3:** https://jlptsensei.com/jlpt-n3-grammar-list/, https://www.tanos.co.uk/jlpt/jlpt3/grammar/, https://bunpro.jp/jlpt/n3
- **N2:** https://jlptsensei.com/jlpt-n2-grammar-list/, https://www.tanos.co.uk/jlpt/jlpt2/grammar/, https://bunpro.jp/jlpt/n2
- **N1:** https://jlptsensei.com/jlpt-n1-grammar-list/, https://www.tanos.co.uk/jlpt/jlpt1/grammar/, https://bunpro.jp/jlpt/n1

### Per-level kanji references
- **N5:** https://www.tanos.co.uk/jlpt/jlpt5/kanji/, https://jlptsensei.com/jlpt-n5-kanji-list/
- **N4:** https://www.tanos.co.uk/jlpt/jlpt4/kanji/, https://jlptsensei.com/jlpt-n4-kanji-list/
- **N3:** https://www.tanos.co.uk/jlpt/jlpt3/kanji/, https://jlptsensei.com/jlpt-n3-kanji-list/
- **N2:** https://www.tanos.co.uk/jlpt/jlpt2/kanji/, https://jlptsensei.com/jlpt-n2-kanji-list/
- **N1:** https://www.tanos.co.uk/jlpt/jlpt1/kanji/, https://jlptsensei.com/jlpt-n1-kanji-list/

### Per-level vocab references
- **All levels:** Tanos has CSV downloads at the corresponding `/vocab/` URL. Memrise community decks are an alternate source but with variable quality.

### Per-level practice-question references
- **N5:** https://learnjapaneseaz.com/jlpt-n5-grammar-practice.html (used for N5 cross-coverage; 17 tests)
- **N4:** https://learnjapaneseaz.com/jlpt-n4-grammar-practice.html
- **N3:** https://learnjapaneseaz.com/jlpt-n3-grammar-practice.html
- **N2/N1:** sparse on free sites; consider commercial sources (Try! N2, New Kanzen Master)

### Official JLPT samples (always check first)
- https://www.jlpt.jp/e/samples/n5/index.html
- https://www.jlpt.jp/e/samples/n4/index.html
- https://www.jlpt.jp/e/samples/n3/index.html
- https://www.jlpt.jp/e/samples/n2/index.html
- https://www.jlpt.jp/e/samples/n1/index.html

### Fair-use boundaries
- DO: extract for triangulation, coverage analysis, multi-correct-bug detection.
- DO: cite source in `feedback/external-questions-<source>.md` with extraction date.
- DO NOT: copy questions verbatim into the question bank.
- DO NOT: redistribute the source's content (read-only triangulation).
- The `feedback/external-questions-<source>.md` file in our repo is fair-use-acceptable as audit reference material (not learner-facing).

### Attribution requirement
Every external-corpus extract must have:
- Source URL at the top of the feedback doc
- Extraction date
- A note like "Reference material for triangulation only; not used in our question bank."

---

## B.12 Content-inventory extraction recipes (acknowledges F-20.12, F-20.13, F-20.14)

These three items require AUTHORITATIVE source data, not invention. The agent should NOT generate content without source attribution. Instead, use these extraction recipes:

### B.12.1 N<L> kanji whitelist (size per §0 table)

```python
# tools/extract_n<L>_kanji_from_tanos.py — substitute the level digit
import requests, json, re
from pathlib import Path

LEVEL = 4  # change per build: 4 for N4, 3 for N3, 2 for N2, 1 for N1
URL = f"https://www.tanos.co.uk/jlpt/jlpt{LEVEL}/kanji/"
html = requests.get(URL, timeout=30).text
# Tanos publishes a table; parse <td class="kanji">X</td> entries
kanji = re.findall(r'<td[^>]*class="[^"]*kanji[^"]*"[^>]*>([一-鿿])</td>', html)

# Cross-reference with JLPT Sensei (https://jlptsensei.com/jlpt-n{LEVEL}-kanji-list/)
# (script omitted; uses similar regex)

out = sorted(set(kanji))
Path(f"data/n{LEVEL}_kanji_whitelist.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"Wrote {len(out)} N{LEVEL} kanji to whitelist")
```

The agent runs this script as part of Day-1 bootstrap. The expected output count varies by level (per §0 size table); cross-reference with TWO sources to resolve discrepancies.

### B.12.2 N<L> vocab inventory (size per §0 table)

```python
# tools/extract_n<L>_vocab_from_tanos.py — substitute the level digit
import requests, csv
from pathlib import Path

LEVEL = 4  # change per build
URL = f"https://www.tanos.co.uk/jlpt/jlpt{LEVEL}/vocab/n{LEVEL}_vocab.csv"
csv_text = requests.get(URL, timeout=30).text
reader = csv.DictReader(csv_text.splitlines())
rows = list(reader)
# Each row has: kanji, hiragana, English, romaji, category

# Write to KnowledgeBank/vocabulary_n<L>.md per the format in B.7.2
# Group by category, then output entries
# (full script omitted)

print(f"Wrote {len(rows)} N{LEVEL} vocab entries to KB")
```

After running, the agent runs `tools/build_data.py` to derive `data/vocab.json` from the markdown.

### B.12.3 N<L> grammar pattern catalog (size per §0 table)

```python
# tools/extract_n<L>_grammar_from_bunpro.py — substitute level digit
# Bunpro's per-level grammar list is publicly accessible
import requests, re
from pathlib import Path

LEVEL = 4  # change per build
URL = f"https://bunpro.jp/jlpt/n{LEVEL}"
# Bunpro renders a list of grammar items; each links to a detail page
# with examples and meaning. Scrape the index, then per-item.

# (Full script involves WebFetch with structured prompt; ~30 min runtime
# for ~210 items at N4, scaling up at lower levels. Result is a markdown
# file matching B.7.1 grammar.md format.)

# Tier classification per A.7:
#   tier=core_n<L>          if also in Tanos N<L>
#   tier=late_n<L>          if only in Bunpro N<L> (typically borderline upper-N<L>)
#   tier=n<L-1>_borderline  if in Tanos N<L-1> + commonly N<L>-taught
```

### B.12.4 Why the agent must NOT invent content

- Inventing kanji / vocab / grammar items would produce a corpus the agent THINKS is N<L> but isn't authoritative.
- A learner studying with invented content would be tested on items not on the actual JLPT.
- This violates the "production-ready" expectation more than missing content.

The honest one-shot deliverable: run the extraction scripts as part of the build, halt-and-report if the source is unavailable. The agent's responsibility is to FETCH and STRUCTURE authoritative data, not to AUTHOR domain content.

---

## B.13 What this appendix does NOT cover

The remaining Pass-22 polish items (F-20.27 through F-20.35) are Pass-22 candidates and not addressed here:

- Distractor-explanation rubric / template (Pass-22)
- ko-so-a-do scene-context formatting standard (Pass-22)
- JA-2/JA-23 invariant interaction tightening (Pass-22)
- Augmented-set escape valve guard via `# WHY:` comment regex (Pass-22)
- LLM audit prompt template extraction (Pass-22)

Each is well-defined enough that it can be addressed in a focused future commit; the current state is "minimum acceptable, not strong" per the Pass-20 review's assessment.

---

*End of Appendix B. Companion to procedure-manual-build-next-jlpt-level.md.*
*Prepared 2026-05-01 by extraction from N5 codebase. Every section traceable to a specific N5 source file.*
