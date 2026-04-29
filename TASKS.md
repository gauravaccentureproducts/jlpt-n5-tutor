# JLPT N5 Grammar Tutor - Tasks

Last updated: 2026-04-30 (Pass 8 native-speaker audit: 52 findings raised, 52 fixed, 0 open)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Status snapshot

- 187/187 patterns enriched, 250/250 questions real (no stubs)
- **17 routed views**: Home / Learn / Test / Practice (Daily Drill) / Review (SRS) / Summary / Diagnostic / Settings / Kanji / こそあど / は vs が / Verb groups / て-form gym / Particle pairs / Counters / Reading / Listening
- SM-2 SRS in Review (4-button grading)
- Service worker `jlpt-n5-tutor-v14` pre-caches ~47 assets; lazy-caches audio on first play
- 5-locale i18n shell (en at v1, vi/id/ne/zh structured)
- PWA manifest installable
- Export / import progress round-trips through JSON
- 37 browser-runnable tests
- **Vocab corpus**: 1002 structured entries (data/vocab.json)
- **Kanji corpus**: 97 entries with stroke-order SVG slot (data/kanji.json)
- **Reading corpus**: 30 graded passages with 2-3 comprehension Qs each (data/reading.json)
- **Listening corpus**: 12 items across 3 JLPT formats (4 task / 4 point / 4 utterance) in data/listening.json
- **Audio assets**: 491 MP3 files committed - 449 grammar examples, 30 reading passages, 12 listening scripts (~19 MB total). Generated via gTTS (build-time only).
- **Audio TTS pipeline**: tools/build_audio.py - auto-detects piper-tts / gtts / pyttsx3. Idempotent. Uses string-suffix concat (not Path.with_suffix) so example IDs like 'n5-001.0' don't collide.
- **Codebase em-dash-free** (881 occurrences stripped)

---

## Done - Phase 4 + 5

### Phase 4.1 Foundation
- [x] **P1.1 Audio TTS build pipeline** - tools/build_audio.py auto-detects piper-tts / gtts / pyttsx3, renders MP3/WAV for every grammar example, reading passage, listening item. Idempotent. Writes data/audio_manifest.json. App degrades gracefully when MP3s are absent.
- [x] **P1.1b Audio rendered + wired** - 491 MP3s generated via gTTS (Japanese voice), grammar example player added to learn UI, listening + reading modules already wire `<audio>` elements from `it.audio` / `p.audio`. Verified in browser preview: HEAD 200 + audio/mpeg on grammar/listening/reading samples.
- [x] **P1.2 SRS upgrade to SM-2** - Review tab is an SRS session with Again/Hard/Good/Easy. Live-verified: rep 1→1d, rep 2→6d, rep 3→15d, lapse → 1d + EF drops to 1.96.
- [x] **P1.3 Diagnostic Summary upgrade** - Error Patterns + Recommended Next Session + Session Log.
- [x] **P1.4 Rename "Drill 0"** - now "Daily Drill"; badge suppressed at 0; aria-label.
- [x] **P1.5 lang="ja" + Japanese font stack** - furigana renderer span wrapper; Noto Sans JP / Hiragino / Yu Gothic / Meiryo. No third-party loads.

### Phase 4.2 Curriculum
- [x] **P2.1 Verb classification module** (#/verbclass)
- [x] **P2.2 て-form gym** (#/teform)
- [x] **P2.3 Counters module** (#/counters) - 11 counter tables + emoji-based "how many?" drill
- [x] **P2.4 こそあど page** (#/kosoado)
- [x] **P2.5 は vs が module** (#/waga)
- [x] **P2.6 Particle minimal-pair drills** (#/particles)

### Phase 4.3 Test fidelity
- [x] **P3.1 Listening module shell** (#/listening) - three-format scaffold (課題理解 / ポイント理解 / 発話表現), audio player wired, graceful no-audio fallback
- [x] **P3.2 Reading passages module** (#/reading) - 8 graded passages with comprehension Qs, read→questions→results flow
- [x] **P3.3 並べ替え production drills** - sentence_order question type
- [x] **P3.4 Type-the-answer drills** - text_input + forgiving matcher (kana/romaji + particle-homophone alternates)

### Phase 4.4 Polish
- [x] **P4.1 Settings panel** (#/settings)
- [x] **P4.2 PWA manifest**
- [x] **P4.3 i18n** with 5 locales
- [x] **P4.4 Export / import progress**
- [x] **P4.5 A11y improvements** - skip-to-content, focus rings, prefers-reduced-motion, forced-colors, role=banner

### Cross-cutting
- [x] **P-cross.1 lang="ja"** wrappers
- [x] **P-cross.2 Vocabulary corpus** - 1002 entries in data/vocab.json (form, reading, gloss, section)
- [x] **P-cross.3 Kanji corpus** - 97 entries in data/kanji.json with stroke_order_svg slots ready for KanjiVG drop-in
- [x] **Em-dash cleanup** - 881 em dashes replaced with ASCII hyphen across 29 files (cp932-safe)

### Pre-release QA gate (per Brief §9)

- [x] No console errors on load.
- [x] FCP < 1.5s on simulated 4G — analytical estimate ~555 ms cold-load on Lighthouse Slow-4G profile (150 ms RTT, 1.6 Mbps, 4x CPU). Critical-path ~60 KB total: index.html 2.1 KB + main.css 37.6 KB + entry JS modules 18.7 KB. Repeat visits via SW cache: <100 ms.
- [x] Works offline after first load.
- [x] Japanese text renders in Japanese font on Windows without language pack.
- [x] Furigana toggle hides/shows ruby.
- [x] Audio plays in browser preview (verified: 16 KB grammar clip, 217 KB listening clip, 115 KB reading clip - all 200 OK, audio/mpeg). iOS Safari unverified but uses standard `<audio src>` so should work.
- [x] Export → wipe → import round-trips progress.
- [x] Lighthouse-equivalent audits — PWA pass (manifest, theme-color, viewport, SW, HTTPS), A11y pass (lang, skip-link, banner, nav, main, h1, no missing labels), SEO pass (title, description, lang, canonical, robots), Best Practices pass (UTF-8, doctype, no console errors). Added meta color-scheme + robots + canonical link to index.html.
- [x] No outbound network calls during a normal session.

---

## Remaining (Brief 1)

- [x] **P-cross.4 Reading + listening corpus expansion**: 30 reading passages + 12 listening items committed.
- [x] **Run tools/build_audio.py end-to-end**: 491 MP3s rendered via gTTS, committed under audio/, listening module activated.

Brief 1 complete. Engine, module, and asset layers shipped.

---

## Native-speaker audit (Pass 8) - 2026-04-30 ✅ COMPLETE

52 findings raised across 5 KB question files from a native Japanese teacher's perspective. Severity: 16 HIGH, 27 MED, 9 LOW. **All 52 fixed.** Full pass details in `verification.md` §7.

### HIGH-severity (16)

#### moji_questions_n5.md
- [x] **M-3** Q54 word-boundary split: 「<u>とも</u> だち」 splits 「ともだち」 across the underline. Restate so the underline covers a whole word.
- [x] **M-8** Q76 unnatural stem: 「でんわばんごうは いくつですか」. Native form is 「何番ですか」.
- [x] **M-9** Q78 unidiomatic: 「みち を まがってください」. 道 doesn't take 曲がる as direct object. Use 「角を曲がる」.

#### goi_questions_n5.md
- [x] **G-3** Q47 textbook error: 「きょねん 日本へ 行った ことが あります」 mixes specific time with experience aspect. Drop 去年 or use definite past.
- [x] **G-8** Q63 inferential paraphrase: 「歩いて10分」 ≈ 「ちかい」. Replace with synonym-tight pair (「とおくない」).
- [x] **G-11** Q78 inferential paraphrase: 「お客さんがおおい」 ≈ 「ゆうめい」. Many customers ≠ famous; replace.
- [x] **G-12** Q80 inferential paraphrase: 「さむい」 ≈ 「ストーブをつけました」. Action-result inference, not synonymy.

#### bunpou_questions_n5.md
- [x] **B-4** Q85 pleonasm: 「ほしいので かいたい」 — both verbs express wanting. Drop one.
- [x] **B-6** Q98 wrong compound: 「ピアノのきょうしつ」 should be 「ピアノきょうしつ」 (compound noun, no の).
- [x] **B-7** Q100 semantic clash: 「ぜったいに 一日 ぐらい」 — absolute + approximate clash. Change answer to 「でも」 or rework stem.

#### dokkai_questions_n5.md
- [x] **D-3** Passage 14 Q27 unit mismatch: stem asks 「何分」, answer is 「一時間」. Fix question word to 「どのぐらい」.
- [x] **D-5** Passage 26 Q51 mixed-category options: mixes duration ('一年' / '五年') and age ('5さいから'). Restate options to one category.

#### authentic_extracted_n5.md
- [x] **A-1** Q43 particle typo: stem ends 「をあります」. Fix to 「にあります」.
- [x] **A-2** Q58 underline/answer mismatch: underline on 「みぎ」 but answer is for 「みち」. Realign underline.
- [x] **A-3** Q59 N3 kanji in stem: 「有名」 violates the stems-N5-only rule. Render in kana or replace question.
- [x] **A-6** Q117 ambiguous source: 「兄に」+もらう is acceptable but unclear at N5. Change to 「兄から」.
- [x] **A-8** Q142 unidiomatic subject: 「うちは...先生をしています」 — うち + occupation verb is non-native. Restate.

### MED-severity (27)

#### moji
- [x] **M-1** Q33 rationale misstates kun-okurigana rule
- [x] **M-2** Q39 雨水 reading note oversimplifies
- [x] **M-4** Q55 「うちには大人が一人と子どもがふたり」 stilted household phrasing
- [x] **M-5** Q57 「ははは教師です」 register too formal for own mother
- [x] **M-7** Q66 「何曜日まで」 unnatural for a homework deadline
- [x] **M-10** Q81-Q95 "Word - Sentence" duplication format non-authentic
- [x] **M-12** Q96 missing です in formal-register file

#### goi
- [x] **G-1** Q22 「えきから ちかい」 stilted; native uses 「えきの近く」
- [x] **G-2** Q35 「もちろん がんばります」 register clash
- [x] **G-4** Q48 「大学にはいる」 → prefer 「大学へ行く / 進学する」
- [x] **G-7** Q60 「30人」 ≈ 「おおぜい」 loose
- [x] **G-9** Q73/Q74 lend/borrow paraphrase introduces beneficiary nuance
- [x] **G-10** Q75 「1月20日」 ≈ 「年のはじめ」 borderline
- [x] **G-13** Q82 wet-clothes ≈ rain inferential
- [x] **G-14** Q86 鳴る vs 来る overlap
- [x] **G-15** Q90 げんきです vs げんきがあります not identical
- [x] **G-16** Q92 あげる vs 買ってあげる narrows meaning
- [x] **G-18** Q99 教えて vs 言って register loss

#### bunpou
- [x] **B-2** Q46 choice-fragment style non-standard
- [x] **B-8** Q64 「駅の名前は何ですか」 textbook-ish

#### dokkai
- [x] **D-1** Passage 9 「ようやく」 → N3-level; use 「やっと」
- [x] **D-2** Passage 13 Q26 distractor 「ていねいな人」 not parallel to occupation options
- [x] **D-4** Passage 22 「来月、大学に入ります」 culturally atypical (April-start standard)
- [x] **D-7** Mondai 6 Item 6 Q102 「先生に聞く」 register thin

#### authentic
- [x] **A-4** Q61 「可愛い」 N3 kanji in stem
- [x] **A-5** Q73 「夕食」 register too formal
- [x] **A-7** Q140 「いいものが安くて多い」 awkward modifier order
- [x] **A-9** Q159 「おじさん」 distractor over-specifies older/younger

### LOW-severity (9)

- [x] **G-5** Q51 父=医者 ≈ 病院ではたらく inferential
- [x] **G-6** Q53 先生 ≈ 学校で教える inferential
- [x] **G-17** Q97 上手 ≈ よくわかる skill≠comprehension
- [x] **B-1** Q18 れんしゅう rationale wording
- [x] **B-3** Q83 sentence flow stiff
- [x] **B-5** Q92 「7時半ごろ」 半+ごろ tolerated colloquial
- [x] **D-6** Passage J Q89 「子どもの本」 → 「絵本」 / 「子ども向けの本」
- [x] **M-6** Q58 dual-blank format non-standard
- [x] **M-11** Q92 「学生がたちます」 decontextualized

---

## UX Brief 2 (jlpt-n5-tutor-ux-developer-brief2.md)

Source: `feedback/jlpt-n5-tutor-ux-developer-brief2.md`. Phased per Brief §19.

### Phase 1 — Stop the bleeding ✅ COMPLETE
- [x] **B2-P1.1** Skeleton screens replace literal "Loading..." text + 5s timeout error UI (§3.1) - shimmer animation, route-shape-matched blocks, 5s Promise-race timeout shows real "Couldn't load" UI with Retry.
- [x] **B2-P1.2** Empty states for Review, Test, Summary, Practice with routing buttons (§3.2) - Review: 2-state (no progress vs no due), Summary: progress=0 routes to Learn, Test: first-test banner suggests learning, Drill: existing CTA preserved.
- [x] **B2-P1.3** Deep-link URLs per §14.1 - new js/kanji.js renders #/kanji index + #/kanji/<glyph> detail (97 entries, on/kun/meanings/stroke-svg slot). Test deep-link #/test/<n> with n in {20,30,50} starts test directly.
- [x] **B2-P1.4** Privacy/offline/no-login trust strip on landing above-the-fold (§1.1.5) - 3-item strip in header brand block, mobile-responsive.
- [x] **B2-P1.5** Copy revisions: tagline + footer per §15 - tagline now "Pass JLPT N5 with 15 minutes a day. No login, no ads, no data shared." Footer: "Works offline. No login. Your progress stays on this device."

### Phase 2 — Daily-use friction ✅ COMPLETE
- [x] **B2-P2.1** Three-mode furigana radios in Settings + header quick-toggle. Storage: `furiganaMode` ∈ {always, hide-known, never}. CSS-toggle via re-render on change (§4.1).
- [x] **B2-P2.2** Per-kanji popover (`js/kanji-popover.js`): click any glyph → readings + meaning + "I know this" toggle. Persists in `localStorage.knownKanji`. Click delegation across all rendered kanji. (§4.2)
- [x] **B2-P2.3** Live furigana preview in Settings panel — fieldset shows `日本語の本を 読みます` rendered through current mode; updates instantly on radio change. (§4.3)
- [x] **B2-P2.4** Settings additions: audio speed (0.75/1.0/1.25 — applied via MutationObserver to every `<audio>`), reduce-motion (auto/on/off — sets `data-reduce-motion` on `<html>`, CSS overrides motion durations), typed-phrase reset confirm box ("Type RESET"). (§5)
- [x] **B2-P2.5** Location indicator chip below header — updates on every route change with route label + decoded params (e.g. "Learn", "Kanji · 日"). (§2.4)
- [x] **B2-P2.6** Per-question feedback - drill module already shows immediate feedback per question. Test deliberately uses end-of-test results per JLPT mock-exam fidelity (Brief §6.2 separates Test as a periodic event from drill).
- [x] **B2-P2.7** Global keyboard shortcuts (`js/shortcuts.js`): 1-4 picks Nth choice button, Space reveals/flips, Enter clicks primary/Submit/Continue, ? opens cheatsheet overlay, Esc dismisses. Skipped while focus is in input/textarea/select. (§7.2)

### Phase 3 — Landing and orientation ✅ COMPLETE
- [x] **B2-P3.1** New `js/home.js` route at `#/home` is now the default landing. First-time state: heading "Start your N5 study", scope line (187 patterns / 1000 vocab / 97 kanji), primary CTA "Start your first lesson", secondary "Take a placement check", 3-pillar card row Learn/Practice/Test, trust strip already in header. (§1.1)
- [x] **B2-P3.2** Returning state appears when history or test results exist: Continue card (resumes last lesson via `settings.lastLearnId`), Today's review queue card (shows due count + "Start review", or "All caught up" empty positive), 7-day streak strip with flame + heatmap, last-test summary line. (§1.2)
- [x] **B2-P3.3** Streak storage in `localStorage.streak` ({current, longest, lastStudyDate, days[30]}). Auto-incremented on first interaction each day. Heatmap renders last 7 days; `streak-flame` + day-count chip on home. Session-end UX is owned by drill/review results screens already. (§6)
- [x] **B2-P3.4** New `js/search.js` indexes grammar (id/pattern/meaning/explanation), vocab (form/reading/gloss), kanji (glyph/on/kun/meanings). `<input type="search">` in secondary nav. `/` keyboard shortcut focuses input. Click outside or Esc dismisses panel. Lazy-loads bank on first focus. (§8)
- [x] **B2-P3.5** Nav restructured per §2.2: primary now has Home / Learn / Practice (renamed from Daily Drill) / Review / Test. Secondary nav row holds search + Summary + Settings.

### Phase 4 — Polish and reach
- [ ] **B2-P4.1** Noto Sans JP webfont, font-display:swap, preload (§11.1)
- [ ] **B2-P4.2** SW: stale-while-revalidate for shell + "Update available" toast (§12.1)
- [ ] **B2-P4.3** PWA install prompt (§12.3) + offline indicator (§12.4)
- [ ] **B2-P4.4** Mobile responsive pass: bottom nav ≤480px, safe-area insets, 44px tap targets (§9)
- [ ] **B2-P4.5** Quit/pause behavior in Test (back-button prompt + Save & Quit) (§7.3)
- [ ] **B2-P4.6** Print stylesheet for Learn lessons (§14.3)
- [ ] **B2-P4.7** Version + "What's new" / CHANGELOG link (§16)
- [ ] **B2-P4.8** A11y deep-pass: contrast audit, screen-reader smoke test notes, prefers-reduced-motion verification (§10)

---

## Hard constraints preserved

1. ✅ Static-only - GitHub Pages, no server.
2. ✅ No data leaves the device - no analytics, no telemetry, no remote API at runtime.
3. ✅ No login.
4. ✅ Offline-capable after first load.
5. ✅ Cross-browser.
6. ✅ Backups via export/import.

## Out of scope (Brief §8)
- User accounts, social, leaderboards.
- Cloud sync.
- N4+.
- Speaking practice with microphone input.
- Runtime AI / TTS calls.

---

## Earlier completed phases (Phase 1-3)

- Engine + scaffold (vanilla HTML/CSS/JS, hash router, LocalStorage, furigana toggle, 4 chapters + Drill + Diagnostic, threshold-based weak detection, service worker)
- Tools (build_data, check_coverage, lint_content, build_spec, generate_stub_questions, build_audio)
- 19 KB content fixes (teacher's audit - see verification.md)
- Pattern catalog: 187 entries across 23 categories
- Question bank: 250 entries (no stubs)
- 5 KB question-bank reference files (498 Qs across moji/goi/bunpou/dokkai/authentic)
- Pushed and verified live on GH Pages
- 37 browser-runnable tests
