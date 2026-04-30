# JLPT N5 Functional Specification - v3.1 Supplement

**Companion to:** `specifications/JLPT N5 Grammar Tutor – Functional Spec.docx` (v3, amended 2026-04-30)
**Status:** Gap-fill addendum. Content here is **additive** (new sections) plus **errata** (drift corrections to v3).
**Date:** 2026-04-30
**Intended outcome:** When merged into the next .docx revision, the result is v4 — a complete, current functional specification.

---

## A. Gap analysis (what was missing or stale in v3)

This supplement was produced after a section-by-section review of the v3 .docx against the standard FSD checklist (Document control / Foundation / Audience / Functional / Non-Functional / Domain-specific / Quality-Governance / Appendices).

### A.1 Sections completely missing from v3

| Missing section | Why it matters here |
|---|---|
| Document control table (revision history, sign-off) | The doc has informal "Amended 2026-04-30" notes but no formal version table |
| Glossary | JLPT, N5, SRS, SM-2, furigana, dokkai, kun-yomi, on-yomi etc. are used but never defined |
| Stakeholders / RACI | Roles named loosely ("Tutor / Admin: You") but no decision-rights matrix |
| User stories (As a … I want … so that …) | FRs are functional but not traced back to user value |
| Success metrics / KPIs | Goals are qualitative; nothing measurable |
| Internationalization NFR | Site has 5 locales (en/vi/id/ne/zh); v3 doesn't mention i18n at all |
| PWA-specific NFRs | App is now a PWA (manifest, service worker v24, install banner); v3 lists this only as "Phase 1.5 optional" |
| Performance budgets (measurable) | v3 says "First load under 2s" - no FCP/LCP/TBT/CLS targets |
| Content audit protocol (Pass-N) | 10 audit passes have run (462 findings, 462 closed); the protocol that produced them is not documented |
| Test strategy | UI testing plan exists at `feedback/ui-testing-plan.md` but isn't referenced |
| Risks register | No risks documented |
| Open questions / decisions log | No log of in-flight design decisions |
| Maintenance / support model | Who fixes content errors, who triggers re-audits, SLA |
| Data dictionary | §7 has shape examples but no field-by-field reference |
| Accessibility conformance target | "WCAG AA" mentioned without specifying 2.0 / 2.1 / 2.2 or what specific criteria are committed to |

### A.2 Drift between v3 and current implementation

| v3 says | Reality (per CHANGELOG / TASKS.md / live site) | Action |
|---|---|---|
| §1 / §3 - "Audio / listening practice" is **out of scope** | 491 MP3s shipped (449 grammar + 30 reading + 12 listening) via `tools/build_audio.py` (gTTS) | Move from §3 Out-of-Scope to in-scope |
| §3 - "Drill mode (SRS-light)" with Leitner 1d/3d/7d/14d | App now uses **SM-2 SRS** with Again/Hard/Good/Easy 4-button grading | Update §5.8 + §6.7 to SM-2; keep Leitner as a deprecated note |
| §5.1 Global Navigation: **Learn / Test / Drill / Review / Summary** | Current nav: **Home / Learn (5-card hub) / Practice (renamed from Drill) / Review (SRS) / Test / Summary / Settings**; secondary: search + summary + settings; mobile bottom nav | Rewrite §5.1 to match |
| §5 UX/UI - no Home route, no Learn hub, no per-kanji/per-vocab detail | Routes shipped: `#/home`, `#/learn` (5-card hub: Grammar/Vocab/Kanji/Dokkai/Listening), `#/learn/grammar`, `#/learn/vocab`, `#/learn/vocab/<form>` (per-word page with 5 examples), `#/kanji`, `#/kanji/<glyph>`, `#/test/<n>` | Add new sub-sections in §5 |
| §11 NFR - "Mobile-friendly is non-goal (Phase 2)" | Brief 2 P4.4 shipped: bottom nav ≤480px, safe-area insets, 44px tap targets | Remove non-goal; add mobile NFR |
| §11 NFR - no i18n | 5 locales ship in `locales/*.json` | Add i18n NFR |
| §11 NFR - "Service worker (optional Phase 1.5)" | SW v24 with stale-while-revalidate, update toast, install banner | Promote to in-scope NFR |
| §7.5 Settings Object - has only 4 fields | Current schema has: `furiganaMode` (3-mode: always/hide-known/never), `audioSpeed` (0.75/1.0/1.25), `reduceMotion` (auto/on/off), `uiLang`, `theme`, `font`, `lastLearnId`, plus `knownKanji` (Set), `streak` ({current, longest, lastStudyDate, days[30]}) | Update §7.5 + add §7.6 (knownKanji), §7.7 (streak) |
| §9 Repository Structure | Current repo: `locales/`, `audio/`, `sw.js`, `manifest.webmanifest`, `tests.html`, plus 25+ JS modules (kanji-popover, search, shortcuts, pwa, kosoado, waga, verbclass, teform, particles, counters, listening, reading, normalize, home, settings, etc.) | Replace §9 with current tree |
| §13 Future Enhancements - "Service worker / installable PWA / Audio / Mobile responsive" | All shipped | Remove from Future; replace with current Future-list (analytics-respecting recommendation engine, listening-corpus expansion, etc.) |
| §13 Future Enhancements - "Multi-learner profiles" | Hard constraint #3 (no login); should be in Out-of-Scope, not Future | Move to Out-of-Scope |
| Spec version says "Predecessors: v1 ... and v2" stored as separate files | They exist; reference path in `not-required/` | Document the archive path |

---

## B. New sections to add to v4

### B.1 Document control

| Field | Value |
|---|---|
| Document title | JLPT N5 Grammar Tutor & Test - Functional Specification |
| Current version | v4 (post-Brief-2, post-Pass-10) |
| Previous versions | v1 (KnowledgeBank/sources.md era) - archived in `not-required/`; v2 (post-Brief-1) - archived; v3 (post-Brief-2 amendment 2026-04-30) - this docx |
| Status | Active |
| Owner | Project author / Tutor-Admin |
| Reviewers (recommended) | One native Japanese speaker (content); one accessibility reviewer (UI); one product reviewer (scope) |

#### B.1.1 Revision history (template - to be maintained going forward)

| Version | Date | Author | Summary | Approved by |
|---|---|---|---|---|
| v1 | 2026-?? | initial draft | Original scope (Phase 1, Brief 1) | - |
| v2 | 2026-?? | post Brief 1 | Audit Passes 1-7; engine + question banks shipped | - |
| v3 | 2026-04-30 | post Brief 2 + Pass 9 + Pass 10 | UX rebuild, audio, content corrections | - |
| v4 | (next) | post this supplement | Gap-fill, drift fixes | (to sign) |

#### B.1.2 Sign-off matrix

| Role | Name | Sign-off date | Notes |
|---|---|---|---|
| Product owner | **Gaurav Srivastava** | continuous | Confirms scope and goals |
| Content reviewer (JA) | **Suiraku San** (commissioned 2026-04-30 per `feedback/native-teacher-review-request.md`) | partial sign-off 2026-04-30 (~30% surface; full pass due 2026-07-30) | Confirms JA accuracy bar (§D); Pass-11A brief audit + Pass-11 sample audit logged in TASKS.md |
| Engineering owner | **Gaurav Srivastava** | continuous | Confirms architecture and feasibility; current architecture validated against §B.6.3 perf budgets via Lighthouse CI |
| Accessibility reviewer | **Gaurav Srivastava** (acting; backed by axe-core + Lighthouse CI gates) | continuous | Confirms WCAG 2.1 AA; automated axe-core gate on every release; recommend recruiting an external reviewer for a future formal release |
| Audit-trail keeper | **Gaurav Srivastava** (writes `verification.md`) | continuous | Records each audit pass with cumulative tally |

**Notes on the current state:**
- All five slots are now named. Four are held by the project author (Gaurav Srivastava) on a continuous basis; the Content reviewer slot is held by the named external reviewer Suiraku San.
- The Content reviewer slot has a partial sign-off recorded for the Pass-11 sample audit; full sign-off depends on completion of the remaining ~70% Pass-11 surface (deadline 2026-07-30).
- The Accessibility reviewer slot is held by the project author with backing from automated tooling (axe-core + Lighthouse CI in `.github/workflows/`). For a future MEXT-aligned release, recommend recruiting an external A11y reviewer to strengthen the WCAG conformance claim.
- For a future formal release, recommend dated, written sign-offs against each release tag.

### B.2 Glossary

| Term | Definition |
|---|---|
| **JLPT** | Japanese Language Proficiency Test (Japan Foundation / JEES). Five levels: N5 (easiest) to N1. |
| **N5** | Lowest JLPT level. ~80-100 kanji, ~600-800 vocab, ~80-100 grammar patterns (no canonical post-2010 list). |
| **Moji (文字)** | "Characters." JLPT subsection testing kanji recognition / orthography. |
| **Goi (語彙)** | "Vocabulary." JLPT subsection testing word meaning and paraphrase. |
| **Bunpou (文法)** | "Grammar." JLPT subsection testing particle usage and sentence form. |
| **Dokkai (読解)** | "Reading comprehension." JLPT subsection. |
| **Choukai (聴解)** | "Listening comprehension." JLPT subsection. |
| **Furigana** | Small kana written above kanji indicating reading. Rendered as `<ruby><rt>` in HTML. |
| **Kun-yomi** | Native Japanese reading of a kanji (e.g., 山 = やま). |
| **On-yomi** | Sino-Japanese (imported) reading of a kanji (e.g., 山 = サン in compounds). |
| **Bika-go (美化語)** | "Beautifying language" - the polite お/ご prefix on common nouns (お茶, お金). NOT honorifics (sonkei-go). |
| **Sonkei-go (尊敬語)** | True honorific language (いらっしゃる, おっしゃる). Out of N5 scope. |
| **Te-form (て形)** | Verb conjugation used for sequencing, requests, and many compound forms. |
| **Tara-form / Tari-form** | Conditional / non-exhaustive listing forms. |
| **SRS** | Spaced Repetition System. Algorithm-driven review scheduling. |
| **SM-2** | SuperMemo-2 algorithm (Wozniak). Adjusts interval based on a 4-button grade (Again/Hard/Good/Easy) and an "ease factor." |
| **Leitner** | Earlier SRS approach using fixed-interval boxes (1d / 3d / 7d / 14d). v3 spec referenced this; the app now uses SM-2. |
| **PWA** | Progressive Web App. Installable, offline-capable web application backed by a service worker + manifest. |
| **Service worker (SW)** | Browser-side script that intercepts fetches, caches assets, and enables offline. Current version: `jlpt-n5-tutor-v24`. |
| **Stale-while-revalidate** | Caching strategy: serve cached content immediately; refetch in background; update on next request. |
| **WCAG 2.1 AA** | Web Content Accessibility Guidelines, level AA. The conformance target for this app. |
| **Pass-N audit** | The project's content-review protocol. Each pass applies a chosen audit lens (paper-maker, native-teacher, external 日本語教師, etc.). 10 passes have run; 462 findings; 0 open. Documented in `verification.md`. |
| **KB** | KnowledgeBank - the `KnowledgeBank/` directory holding the source-of-truth catalog files (grammar, vocabulary, kanji, sources). |
| **CP932** | Microsoft's superset of Shift-JIS used by Windows JP terminals. The codebase is em-dash-free for cp932 console safety. |
| **gTTS** | Google Text-to-Speech (Python library). Used at build time only to render the 491 MP3 audio files. |

### B.3 Stakeholders

| Role | Responsibilities | Decision rights |
|---|---|---|
| **Project author / Tutor-Admin** | Owns scope, content correctness, releases | Final say on scope; content edits |
| **Content reviewer (Japanese)** | Validates JA accuracy across audit passes | Veto on JA-incorrect content |
| **Engineering implementer** | Implements features per spec; maintains tests | Veto on infeasible scope |
| **Accessibility reviewer** | Audits WCAG conformance | Veto on a11y regressions |
| **End learners** | Use the app | Provide feedback (no formal seat) |
| **Hosting (GitHub Pages)** | Serves static assets | Out of project control |

### B.4 User stories (derived from existing FRs)

The v3 FRs describe what the system shall do. User stories add the **why**.

| Story ID | As a … | I want … | So that … | Maps to FRs |
|---|---|---|---|---|
| US-1 | First-time visitor | a single primary CTA on the home page | I know where to start without reading | (UX Brief 2 §1.1) |
| US-2 | Returning learner | a "Continue" card showing my last lesson | I can resume in one click | (UX Brief 2 §1.2) |
| US-3 | Self-studier | structured grammar lessons with form rules and examples | I can build a model, not memorize | FR-L1 to FR-L5 |
| US-4 | Late-N5 learner | furigana off by default on N5 kanji | I practice reading, not crutches | §4.2 |
| US-5 | Late-N5 learner | a "I know this kanji" toggle to suppress furigana per kanji | I can hide furigana on the kanji I've mastered while keeping it on the rest | (Brief 2 §4.2) |
| US-6 | Test-taker | mock exams with timed, randomized, balanced sampling | the app feels like a real exam, not memorizable | FR-T1, FR-T7 |
| US-7 | Learner | weak-pattern detection over rolling history (not single test) | one bad day doesn't mislabel my mastery | FR-W1, FR-W2 |
| US-8 | Learner | SRS review queue surfacing items at the right interval | I retain what I learn long-term | FR-S1 to FR-S4 |
| US-9 | Learner | offline access on subway/flight | I can study anywhere | (NFR offline) |
| US-10 | Privacy-conscious user | no login, no telemetry, all progress local | my study habits stay private | (Hard constraint #2, #3) |
| US-11 | Mobile user | bottom nav and 44px tap targets | I can study on a phone with one thumb | (Brief 2 §9) |
| US-12 | Non-English speaker | UI in my locale (vi/id/ne/zh) | I can use the app without English | (i18n NFR) |
| US-13 | Power user | keyboard shortcuts (1-4 / Space / Enter / ? / /) | I move at the speed of thought | (Brief 2 §7.2) |
| US-14 | Cross-device user | export progress to JSON, import on another device | I'm not locked to one machine | FR-P1, §3 |
| US-15 | Content author | a content lint that fails commit on out-of-scope vocab/kanji | I can't ship N4 content into N5 by accident | §4.7, §4.8 |
| US-16 | Content author | a Pass-N audit protocol with re-audit cadence | content quality stays raised over time | (NEW §D below) |
| US-17 | Returning user post-update | a non-blocking "Update available" toast | I get fresh content without interruption | (Brief 2 §12.1) |

### B.5 Success metrics (KPIs)

These should be measured after each major release. Without them "done" cannot be defined.

| Metric | Target | How measured |
|---|---|---|
| **Lesson completion rate** | ≥ 60% of started lessons reach the end | LocalStorage progress events |
| **D1 / D7 / D30 retention** | D1 ≥ 40%, D7 ≥ 25%, D30 ≥ 15% | LocalStorage `streak.days[]` cohort analysis (privacy-respecting; no remote telemetry) |
| **Mock-test mean score (after ≥ 5 sessions)** | ≥ 70% | Test history average |
| **Time-to-first-action (first-time visitor)** | ≤ 5 seconds (Lighthouse) | Lighthouse / RUM (if added later under privacy constraint) |
| **Lighthouse Performance** | ≥ 90 mobile, ≥ 95 desktop | Lighthouse CI per release |
| **Lighthouse Accessibility** | ≥ 95 | Lighthouse CI |
| **Lighthouse PWA** | 100 | Lighthouse CI |
| **Content audit cumulative findings closed** | ≥ 99% (currently 462/462 = 100%) | `verification.md` |
| **JA-accuracy CI invariants passing** | 100% (release blocker) | `tools/check_content_integrity.py` (per ui-testing-plan §12.1) |

### B.6 Non-functional requirements - additions

#### B.6.1 Internationalization

- **NFR-I1** UI shall be available in 5 locales: en (v1 reference), vi, id, ne, zh.
- **NFR-I2** All translatable strings shall live in `locales/*.json`; no hardcoded UI strings in JS modules.
- **NFR-I3** Locale files shall share an identical key tree; missing keys fall back to English with a console warning.
- **NFR-I4** Japanese content (lessons, examples, questions) is **never** translated. Furigana, kanji, and example sentences remain Japanese regardless of UI locale. Only chrome / explanations / glosses translate.
- **NFR-I5** Locale preference persists in `localStorage.uiLang` and survives reload.
- **NFR-I6** Locale switch shall not require a page reload.

#### B.6.2 PWA

- **NFR-W1** Installable PWA via manifest at `manifest.webmanifest`; Lighthouse PWA score = 100.
- **NFR-W2** Service worker `jlpt-n5-tutor-v<N>` (current: v24) uses **stale-while-revalidate** for the shell (HTML/CSS/JS) and **cache-first** for content (data/audio/locales).
- **NFR-W3** When new shell bytes are detected, SW shall post `SW_UPDATE_AVAILABLE` to clients; UI shall surface a non-blocking "Update available" toast.
- **NFR-W4** App shall remain functional offline after first load; offline indicator chip in top-right toggles with `navigator.onLine`.
- **NFR-W5** App icons (192px, 512px) shall render on mobile home screen; iOS shows the icon on splash (not white screen).
- **NFR-W6** Install banner via `beforeinstallprompt`; one-time, dismissible, persists in localStorage.

#### B.6.3 Performance (measurable budgets)

| Metric | Target | Measured on |
|---|---|---|
| **FCP** (First Contentful Paint) | < 1.8 s | Slow-4G profile (150 ms RTT, 1.6 Mbps, 4× CPU throttle) |
| **LCP** (Largest Contentful Paint) | < 2.5 s | Slow-4G |
| **TTI** (Time to Interactive) | < 3.5 s | Slow-4G |
| **TBT** (Total Blocking Time) | < 200 ms | Slow-4G |
| **CLS** (Cumulative Layout Shift) | < 0.1 | All viewports |
| **Critical-path JS+CSS+HTML** (gzipped) | < 100 KB | Network panel |
| **Total first-load (excl. audio)** | < 300 KB | Network panel |
| **Audio**: lazy-loaded | First lesson page loads without fetching MP3s | Network panel |
| **Repeat visit (warm SW cache)** | < 100 ms FCP | DevTools |

These supersede v3's vague "First load under 2s."

#### B.6.4 Accessibility (specific targets)

- **NFR-A1** Conformance target: **WCAG 2.1 Level AA**.
- **NFR-A2** axe-core shall report zero `serious` or `critical` violations on Home, Learn, Test, Review, Settings (per ui-testing-plan §5).
- **NFR-A3** All interactive elements have a visible focus ring on keyboard focus.
- **NFR-A4** Skip-to-content link shall work from keyboard.
- **NFR-A5** `prefers-reduced-motion` shall disable non-essential animations; user override available in Settings.
- **NFR-A6** Forced-colors / Windows High Contrast mode: all visible text remains visible; no information conveyed by color alone.
- **NFR-A7** Furigana ruby is announced correctly by NVDA + Japanese voice (e.g., 学校 reads as がっこう, not がく-こう).
- **NFR-A8** Tap targets ≥ 44×44 px (WCAG 2.5.5).

### B.7 Test strategy

- **TS-1** Engine-layer tests in `tests.html` (currently 37/37 passing) cover SM-2 SRS math, storage round-trip, furigana renderer, grading.
- **TS-2** UI-level testing follows the catalog at `feedback/ui-testing-plan.md` (22 perspectives, three execution tiers: P0 smoke 5 min / P1 gate 60 min / P2 regression 4 hours).
- **TS-3** Japanese language accuracy is the foundational concern - testing-plan §12 is the highest-priority section. CI invariants (§12.1) are release blockers.
- **TS-4** Content audit cadence: every quarter or after any 10+ KB-edit batch, run a Pass-N re-audit per §D below.
- **TS-5** No release ships if any of: (a) `tests.html` failing, (b) §12.1 invariants failing, (c) Lighthouse Performance/Accessibility below target, (d) any open CRITICAL audit finding.

### B.8 Risks register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Content edit silently introduces unnatural Japanese | Med | High | §12.1 CI invariants + quarterly Pass-N re-audit |
| Service worker caches stale shell after a release | Low | Med | Stale-while-revalidate + update toast + cache versioning (`v<N>`) |
| Browser autoplay policy blocks audio on first play | Med | Low | Only play audio on user gesture; documented in §14 implementation notes |
| Content drifts from KnowledgeBank as JSON edits go in | Med | High | `tools/check_coverage.py` + lint scripts; coverage check enforced pre-commit |
| Locale file falls behind English (missing keys) | Med | Med | Fall back to English with console warning (NFR-I3); periodic key-tree diff check |
| GitHub Pages deprecates /docs deployment path | Low | Med | Switch to gh-pages branch; both are supported |
| Vendor lock-in on gTTS (audio pipeline) | Low | Low | `tools/build_audio.py` already supports piper-tts and pyttsx3 fallbacks |
| Author becomes unavailable; no continuity plan | Low | High | Document everything in spec + verification.md; KnowledgeBank is human-readable; can be picked up by any maintainer |
| Misclassified Group-1 ru-verbs (入る etc.) regress | Med | High | NFR-A: ru-verb exception flags enforced in CI (X-6.6) |

### B.9 Open questions / decisions log (triaged 2026-04-30)

| ID | Question | Status | Owner | Target decision date | Triage notes |
|---|---|---|---|---|---|
| OQ-1 | Should we add a recommendation engine that runs on-device (privacy-preserving)? | **Closed (minimal): shipped in v1.6** | Project author + Engineering | 2026-04-30 (decided) | Decision 2026-04-30: ship option (d) — a minimal "What should I study next?" widget on Home that reads `getStreak()` + `getDueCount()` + `lastLearnId` from LocalStorage and routes to one of Learn / Review / Drill. No telemetry, pure on-device, satisfies Hard constraint #2. Implemented in `js/home.js` (`pickRecommendation()` + `renderRecommendation()`) and `css/main.css` (`.home-recommend`). A richer ML-backed recommender remains deferred to v2.0; revisit if learner-base data justifies it. |
| OQ-2 | Should listening corpus expand from 12 → 30+ items? | **Approved for v1.6 (native-voice constraint)** | Content owner | **2026-07-30** (target authoring date) | Decision 2026-04-30: expand to 30+ items, **but new items MUST use a native Japanese voice talent (not gTTS)**. Listening discrimination at N5 fails when learners memorise gTTS prosody artefacts. Implementation gate: cannot ship without procuring or recording native voice; logged in `TASKS.md` as a content-authoring backlog item. Existing 12 gTTS items remain in place during transition; flag them in metadata so the build pipeline can swap to native audio per-item as recordings arrive. |
| OQ-3 | Should we add a CSP meta tag for additional XSS hardening? | **Closed: shipped in v1.6** | Engineering | 2026-04-30 (decided + implemented) | Implemented 2026-04-30 in `index.html` with the directive set: `default-src 'self'; img-src 'self' data:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none';`. `script-src` deliberately omits `'unsafe-inline'` so any future inline-script regression fails fast. `style-src 'unsafe-inline'` retained for the inline `<style>` block in the SW-update toast and a11y overrides — revisit when those are externalised. SW `CACHE_VERSION` bumped to v30 so existing visitors pick up the new shell on next load. |
| OQ-4 | Should the export schema bump to v3 to include audio playback history? | **Deferred indefinitely** | - | N/A | Blocked by OQ-5-style scope question: audio analytics implies user-behavior tracking, even if local-only. Conflicts with the project's privacy-first framing. Revisit only if a recommender (OQ-1) needs it. |
| OQ-5 | Should we offer N4 expansion in this repo or a sibling? | **Closed: out-of-scope (Brief 1)** | - | N/A | Brief 1 explicitly excludes N4+. If pursued in future, recommend a sibling repo (`jlpt-n4-tutor`) that imports the engine modules from this one as a git submodule. Not in scope for v1.x or v2.0. |
| OQ-6 (NEW) | Should we publish a Japanese-language version of the brief / app? | **Closed (split decision)** | Project author + Content reviewer | 2026-04-30 (decided) | Decision 2026-04-30: **App UI and instructions stay in English** — the app *teaches* Japanese, but the chrome (nav labels, button text, microcopy, error messages, headings) remains English so the learner is never blocked by chrome they cannot read. Japanese-language teaching content (vocab, grammar examples, listening prompts, reading passages) of course remains in Japanese. Brief translation: still **deferred to 2026-07-30** as a separate optional task, owned by Project author + Content reviewer; revisit only if a Japan-based reviewer is engaged. The five existing UI locales (`en`, `vi`, `id`, `ne`, `zh`) remain — they translate the *English* chrome for non-English-native learners; no `ja` locale will be added. |
| OQ-7 (NEW) | Should `data/grammar.json` `furigana[]` field be removed (currently empty in 586/586 examples)? | **Closed: keep** | Engineering | 2026-04-30 | Verified `js/furigana.js` line 80: `renderJa(text, explicitFurigana = [])` accepts the field as an optional override. Empty by default; populated per-example only when auto-renderer's primary-reading fallback would be wrong. Schema-correct; not dead code. Document as optional override in next FSD revision. |

### B.10 Maintenance and support model

- **Content errors** (typos, wrong readings, ungrammatical sentences): Fix in `KnowledgeBank/*.md` first (source of truth); regenerate `data/*.json` via `tools/build_data.py`; log as a Pass-N audit entry in `verification.md`. Severity CRITICAL → block release; HIGH → next release; MEDIUM/LOW → batch into next quarterly Pass.
- **Engine bugs**: File in repo issues; reproduce in `tests.html`; fix; add regression test.
- **A11y regressions**: Treat as P1 (block release).
- **Cadences:**
  - Daily: nothing required; static site
  - Per release: P0 smoke + P1 gate from ui-testing-plan §17
  - Quarterly: Pass-N re-audit (§D below)
  - Annually: full FSD review and amendment

### B.11 Release process

- Each release advances the SW version (`jlpt-n5-tutor-v<N>`) so update toast fires for clients on older shells.
- `CHANGELOG.md` is appended with a new entry describing user-visible changes.
- Tag the commit as `content-v<N>` if KB content changed; `app-v<N>` if engine/UI changed.
- No release ships with TS-5 conditions failing.

---

## C. Updates to existing v3 sections (errata)

### C.1 §3 Scope - move out of "Out of Scope"

These were listed as out-of-scope in v3 but have shipped:

- ✅ Audio / listening practice → now **In Scope** (491 MP3s; listening module with 3 JLPT formats)
- ✅ Service worker / PWA → now **In Scope** (NFR-W1 to NFR-W6)
- ✅ Mobile-friendly responsive layout → now **In Scope** (Brief 2 §9)
- ✅ Adaptive testing with ease factors → now **In Scope** (SM-2 SRS replaces Leitner)

These remain **Out of Scope** (binding):

- User accounts / login (Hard constraint #3)
- Server-side analytics / telemetry (Hard constraint #2)
- Cloud sync (Brief 1 Out-of-Scope)
- Multi-learner profiles (was in §13 Future; promote to permanent Out-of-Scope per #3)
- Open-ended writing or essay evaluation
- Speaking practice with microphone input
- Runtime AI / TTS calls
- N4+ content

### C.2 §5.1 Global Navigation - rewrite

**Replace** the old "Learn / Test / Drill / Review / Summary" with:

| Tier | Items | Notes |
|---|---|---|
| Primary nav | Home / Learn / Practice / Review / Test | "Practice" replaces "Drill"; "Daily Drill" renamed |
| Secondary nav | Search input + Summary + Settings + Help (?) | Search has `/` shortcut |
| Mobile (≤480 px) | Primary nav becomes fixed bottom bar with safe-area inset | per Brief 2 §9 |
| Persistent | Streak chip + offline indicator (top-right) + location chip (under header) | per Brief 2 §2.4 / §12.4 |

### C.3 §5 UX/UI - new sub-sections needed

Add to v3 §5:

- **§5.0 Home** (`#/home`) - first-time vs returning state; CTA + 3 pillar cards (first-time); Continue card + Today's queue + Streak heatmap (returning).
- **§5.2.5 Learn hub** (`#/learn`) - 5-card hub: Reference (Grammar / Vocabulary / Kanji), Practice (Dokkai / Listening). 3+2 semantic split.
- **§5.2.6 Vocabulary index + per-word detail** (`#/learn/vocab` and `#/learn/vocab/<form>`) - 1002 vocab cards in 40 sections; per-word detail with 5 example sentences sourced from grammar.json.
- **§5.2.7 Kanji index + per-kanji detail** (`#/kanji` and `#/kanji/<glyph>`) - 97 cards (glyph + meaning + first kun/on); per-kanji detail with prev/next nav.
- **§5.9 Settings** - explicit panel: UI lang / theme / font / 3-mode furigana (Always / Hide-on-known-kanji / Never) / live furigana preview / audio speed (0.75/1.0/1.25) / reduce motion (auto/on/off) / typed-phrase reset / export / import.
- **§5.10 Reading module** (`#/reading`) - 30 graded passages with 2-3 comprehension questions each.
- **§5.11 Listening module** (`#/listening`) - 12 items across 3 JLPT formats (4 task / 4 point / 4 utterance).
- **§5.12 Topic deep-dives** - こそあど / は vs が / Verb groups / て-form gym / Particle pairs / Counters.

### C.4 §5.8 Drill / SRS - replace Leitner with SM-2

v3 says "Leitner-light, 1d / 3d / 7d / 14d intervals." **Reality:** the app uses **SM-2** with Again / Hard / Good / Easy 4-button grading and a per-item ease factor (verified in `tests.html`).

Replacement text:

> Drill / Review uses **SuperMemo-2 (SM-2)** spaced repetition. Each item carries an ease factor (default 2.5, floor 1.3) and a current interval. Grade buttons:
> - **Again** (lapse): interval = 1 day; ease drops by 0.2; repetition counter resets to 0.
> - **Hard**: interval = max(1d, current × 1.2); ease drops by 0.15.
> - **Good**: per SM-2 schedule (rep 1 → 1d, rep 2 → 6d, rep 3+ → previous × ease).
> - **Easy**: interval = current × ease × 1.3; ease rises by 0.15.
>
> Verified in `tests.html`: rep 1 → 1d, rep 2 → 6d, rep 3 → 15d; lapse drops EF to 1.96.

### C.5 §7 Data Model - add new schemas

Add:

#### §7.6 knownKanji set

```json
{
  "knownKanji": ["学", "校", "本"]
}
```

Stored in `localStorage.knownKanji`. Feeds the "hide-on-known-kanji" furigana mode.

#### §7.7 Streak

```json
{
  "streak": {
    "current": 7,
    "longest": 23,
    "lastStudyDate": "2026-04-30",
    "days": ["2026-04-24", "2026-04-25", "..."]
  }
}
```

`days[]` is a rolling 30-day array used by the heatmap.

#### §7.8 Audio manifest

`data/audio_manifest.json` enumerates the rendered MP3s. Format:

```json
{
  "n5-001.0": "audio/n5-001.0.mp3",
  "reading-001": "audio/reading-001.mp3"
}
```

If a key is absent, the app degrades gracefully (no audio button).

#### §7.9 Updated Settings Object

Replace v3 §7.5 with the current schema:

```json
{
  "uiLang": "en",
  "theme": "auto",
  "font": "default",
  "furiganaMode": "hide-known",
  "audioSpeed": 1.0,
  "reduceMotion": "auto",
  "lastTestLength": 20,
  "lastLearnId": "n5-042",
  "diagnosticCompleted": true,
  "lastDiagnosticDate": "2026-04-29T19:00:00+09:00",
  "exportSchemaVersion": 2
}
```

### C.6 §9 Repository Structure - replace tree

Replace the v3 tree with the current state. The diff is large; here is the canonical current tree:

```
/JLPT/N5/
  index.html
  manifest.webmanifest
  sw.js
  tests.html
  README.md
  CHANGELOG.md
  /css/
    main.css
  /js/
    app.js
    home.js
    learn.js
    test.js
    drill.js
    review.js
    summary.js
    diagnostic.js
    settings.js
    storage.js
    furigana.js
    i18n.js
    pwa.js
    search.js
    shortcuts.js
    kanji.js
    kanji-popover.js
    kosoado.js
    waga.js
    verb-class.js
    te-form.js
    particles.js
    counters.js
    listening.js
    reading.js
    normalize.js
  /data/
    grammar.json
    questions.json
    vocab.json
    kanji.json
    reading.json
    listening.json
    audio_manifest.json
    n5_kanji_readings.json
    n5_vocab_whitelist.json
    n5_kanji_whitelist.json
  /locales/
    en.json
    vi.json
    id.json
    ne.json
    zh.json
  /audio/
    n5-001.0.mp3
    ... (491 MP3s)
  /tools/
    build_data.py
    build_audio.py
    check_coverage.py
    lint_content.py
    check_content_integrity.py   # to be added per ui-testing-plan §12.1
  /KnowledgeBank/
    grammar_n5.md
    kanji_n5.md
    vocabulary_n5.md
    sources.md
    moji_questions_n5.md
    goi_questions_n5.md
    bunpou_questions_n5.md
    dokkai_questions_n5.md
    authentic_extracted_n5.md
  /specifications/
    JLPT N5 Grammar Tutor – Functional Spec.docx       # v3
    JLPT-N5-Functional-Spec-v3.1-supplement.md         # this file
  /feedback/
    jlpt-n5-tutor-developer-brief.md                   # Brief 1
    jlpt-n5-tutor-ux-developer-brief2.md               # Brief 2
    jlpt-n5-content-correction-brief.md                # Pass 9 source
    ui-testing-plan.md                                 # 22-perspective UI testing plan
  /not-required/
    (archived earlier spec versions and transient artifacts)
  TASKS.md
  verification.md                                      # Pass 1-10 audit log
```

### C.7 §11 NFR - replace with full set

Replace v3 §11 with the consolidated NFR table (Performance §B.6.3, Accessibility §B.6.4, i18n §B.6.1, PWA §B.6.2, plus the remaining items below):

| Category | Requirement |
|---|---|
| Compatibility | Latest 2 versions of Chrome, Firefox, Edge, Safari (desktop + mobile). Samsung Internet supported. |
| Reliability | No data loss without explicit "Type RESET" confirmation. Export → wipe → import round-trips. |
| Content integrity | `tools/lint_content.py` + `tools/check_coverage.py` + `tools/check_content_integrity.py` must all exit 0 before release. |
| Offline | After first load, app continues to work offline; service worker caches shell + content. |
| Telemetry | None. No analytics, no third-party scripts, no remote API at runtime. (Hard constraint #2.) |
| Security | HTTPS only (GitHub Pages). All `target="_blank"` links carry `rel="noopener noreferrer"`. CSP meta tag shipped in v1.6 (OQ-3 closed 2026-04-30). |
| Storage | LocalStorage only. No IndexedDB, no cookies, no remote storage. Namespace `jlpt-n5-tutor:*`. |

### C.8 §13 Future Enhancements - rewrite

Drop shipped items (audio, mobile responsive, PWA / SW, adaptive SRS). Replace with:

- **F-1** Listening corpus expansion (12 → 30+ items). OQ-2 approved 2026-04-30; native voice talent required (no gTTS for new items). Authoring backlog in `TASKS.md`.
- **F-2** Privacy-preserving on-device recommendation engine (no telemetry). OQ-1 minimal version shipped in v1.6 (Home recommender); richer ML-backed engine still deferred to v2.0.
- **F-3** ~~Optional~~ CSP meta tag for additional XSS hardening. OQ-3 closed; shipped in v1.6.
- **F-4** Audio analytics in the export schema (when scope expands). OQ-4.
- **F-5** N4 expansion in a sibling repo (not this one). Out of scope but flagged for ecosystem planning.
- **F-6** Native mobile wrapper (Capacitor / React Native) - **out of scope**; PWA satisfies the use case.
- **F-7** Speaking practice with microphone input - **permanent out of scope** (Brief 1).

---

## D. Content audit protocol (Pass-N) - normative

This section formalizes the Pass-N protocol that produced the 462 closed findings in `verification.md`.

### D.1 Audit lenses (used so far)

| Pass | Lens | Findings raised | Closed |
|---|---|---|---|
| 1-4 | Initial KB content checks | 24 | 24 |
| 5 | First batch corrections | 11 | 11 |
| 6 | JLPT paper-maker perspective | 39 | 39 (across 6 / 6.5 / 7) |
| 8 | Native Japanese teacher perspective | 52 | 52 |
| 9 | External 日本語教師 (content correction brief) | 38 | 38 |
| 10 | Audio + auto-furigana correctness (TTS / rendering) | 309 | 309 |
| **Total** | - | **462** | **462** |

### D.2 Pass-N triggers

- Calendar: every quarter (next: 2026-07-30).
- Event: any batch of 10+ KB edits between releases.
- Event: any new audit lens proposed (e.g., "child-learner readability", "JLPT N4 readiness").
- Event: any externally-supplied audit brief (like the Pass-9 source).

### D.3 Pass-N execution

1. Pick the lens; document it in the new pass entry header.
2. Read all 5 question files + 4 catalog files (or the affected subset).
3. Log findings with severity (CRITICAL / HIGH / MEDIUM / LOW); register in `TASKS.md`.
4. Fix in priority order; update `verification.md` per finding.
5. Re-run §B.7 / §12.1 invariants; all must pass.
6. Mark the Pass closed; update cumulative tally in `verification.md`.

### D.4 Severity definitions

| Severity | Definition | Release impact |
|---|---|---|
| **CRITICAL** | Factual error, internal contradiction, or content that would teach **wrong Japanese** | Blocks release; hotfix |
| **HIGH** | Unidiomatic phrasing, register clash, or policy violation | Fix in next release |
| **MEDIUM** | Pedagogical clarity improvement | Batch into next quarterly pass |
| **LOW** | Polish item | Batch into next quarterly pass |

### D.5 The bar (non-negotiable)

- Zero CRITICAL findings open at release.
- 100% of cumulative findings closed (currently 462/462).
- Pass-N protocol followed for every cadence event.

---

## E. Acceptance criteria for v4

When this supplement is merged into the .docx, the resulting v4 is acceptable when:

1. All §A.1 missing sections are present.
2. All §A.2 drift items are corrected.
3. The glossary (§B.2) is complete; every term used in the spec is defined.
4. The success metrics (§B.5) are measurable, not goals.
5. The risks register (§B.8) has at least 8 entries; every High-impact risk has a documented mitigation.
6. The test strategy (§B.7) references `feedback/ui-testing-plan.md` and `tests.html`.
7. The content audit protocol (§D) is normative and binding.
8. The sign-off matrix (§B.1.2) is filled in (signed by named reviewers, not blank).
9. All references to "Drill" / "Leitner" / "Phase 1.5 optional PWA" / "Audio out of scope" are removed.
10. The repository tree (§C.6) matches the live repository as of merge date.

---

*End of supplement. Merge into the next .docx revision and tag it v4.*
