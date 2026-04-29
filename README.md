# JLPT N5 Grammar Tutor

Browser-based static web app for studying JLPT N5 grammar. **No build step. No server. No accounts.**

## Run locally

Open `index.html` in a modern browser (Chrome, Edge, Firefox).

> Some browsers block `file://` JSON fetches. If pages stay blank, serve over HTTP:
> ```
> python -m http.server 8000
> ```
> Then open http://localhost:8000.

## Deploy to GitHub Pages

1. Commit and push this folder (or its parent repo) to GitHub.
2. **Settings → Pages → Source** = `main` branch, root folder (or `/docs` if you nest the app under that).
3. After the first build (~30 seconds), visit `https://<your-user>.github.io/<repo>/JLPT/N5/` (or wherever the app lives in your repo).
4. Verify the four chapters load: Learn, Test, Drill, Summary. Take a quick test, miss something, and confirm the Drill badge updates and Chapter 3 / 4 reflect it.

The app uses **only relative paths** and **hash routing** (`#/learn`, `#/test`, …), so it works without any path-rewriting on GitHub Pages — no `404.html` fallback, no `gh-pages` action, nothing else needed.

A **service worker** (`sw.js`) is included and pre-caches the app shell + all data files. After your first online visit, the app continues to work offline. Bump `CACHE_VERSION` in `sw.js` when shipping a release so old caches get evicted.

## File map

```
/index.html                            entry point
/sw.js                                 service worker (offline cache)
/css/main.css                          styling
/js/                                   app logic (one module per chapter / mode)
  app.js storage.js furigana.js
  learn.js test.js review.js summary.js drill.js diagnostic.js
/data/                                 JSON consumed by the app
  grammar.json questions.json
  n5_kanji_whitelist.json n5_vocab_whitelist.json n5_kanji_readings.json
/tools/                                Python scripts run by the content author only
  build_data.py check_coverage.py lint_content.py
  build_spec.py generate_stub_questions.py
/KnowledgeBank/grammar_n5.md           canonical N5 pattern catalog (human source-of-truth)
/KnowledgeBank/kanji_n5.md             N5 kanji catalog with on/kun readings
/KnowledgeBank/vocabulary_n5.md        N5 vocab catalog
/KnowledgeBank/sources.md              reference / authority documentation
verification.md                        cross-source audit of KnowledgeBank content
TASKS.md                               task list (mirrors session TodoWrite)
JLPT N5 Grammar Tutor – Functional Spec.docx     full functional spec
```

## Content authoring workflow

1. Edit the markdown source-of-truth files in `KnowledgeBank/` (`grammar_n5.md`, `kanji_n5.md`, `vocabulary_n5.md`).
2. Edit rich content in `data/grammar.json` and `data/questions.json` (the app consumes these).
3. Regenerate whitelists + kanji-reading map from the markdown:
   ```
   python tools/build_data.py
   ```
4. Verify pattern coverage:
   ```
   python tools/check_coverage.py
   ```
5. Lint for out-of-scope kanji + vocab tokens:
   ```
   python tools/lint_content.py
   ```
6. (Optional) Generate stub MCQ questions for any patterns missing one:
   ```
   python tools/generate_stub_questions.py
   ```
7. (Optional) Regenerate the spec docx:
   ```
   python tools/build_spec.py
   ```

The learner never runs any of these scripts — they are author-side only.

## Spec

See [`JLPT N5 Grammar Tutor – Functional Spec.docx`](JLPT%20N5%20Grammar%20Tutor%20%E2%80%93%20Functional%20Spec.docx) for the full functional specification, including content rules, UX requirements, data model, and acceptance criteria.

## Status

All Phase 1 features implemented and verified end-to-end in a browser preview:
- Chapter 1 Learn (TOC + 7-block detail + Mark-as-known)
- Chapter 2 Test (MCQ + dropdown + sentence-ordering, visible-but-disabled Submit, instant scoring, per-distractor explanations)
- Chapter 3 Review (weak-pattern cards driven by rolling-history threshold)
- Chapter 4 Summary (stats + category heatmap + reset)
- Drill mode (SRS engine with 1d / 3d / 7d / 14d boxes + immediate feedback + graduation)
- First-run Diagnostic (10 questions across categories, seeds SRS without affecting test history)
- Furigana toggle with N5-kanji ruby annotation (pragmatic single-pick readings)
- Service worker for offline capability

Content: 187 patterns across 23 categories (grammar.json), 219 questions (51 fully authored + 168 stubs). See `TASKS.md` for what remains.
