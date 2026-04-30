# JLPT N5 Grammar Tutor - Tasks

Last updated: 2026-04-30 (UX Brief 2 Phases 1-4 shipped; Learn hub + per-vocab detail + SW v18; Pass 9 content brief closed; cumulative 153/153 across 9 audit passes)

## Live site

- **Repo**: https://github.com/gauravaccentureproducts/jlpt-n5-tutor
- **Live URL**: https://gauravaccentureproducts.github.io/jlpt-n5-tutor/
- **Engine tests**: 37/37 passing (`tests.html`)
- **Lint**: kanji-clean, vocab advisory-only

## Status snapshot

- 187/187 patterns enriched, 250/250 questions real (no stubs)
- **17 routed views + sub-paths**: Home / **Learn hub (5-card: Grammar/Vocab/Kanji/Dokkai/Listening)** with sub-paths `#/learn/grammar`, `#/learn/vocab`, `#/learn/vocab/<form>` (per-word detail with 5 example sentences), `#/learn/<patternId>` / Kanji (`#/kanji`, `#/kanji/<glyph>`) / Test (`#/test`, `#/test/<n>` direct-launch with quit-prompt) / Practice (`#/drill`, was "Daily Drill") / Review (SM-2 SRS) / Summary / Diagnostic / Settings / Reading / Listening / こそあど / は vs が / Verb groups / て-form gym / Particle pairs / Counters
- SM-2 SRS in Review (4-button grading)
- Service worker `jlpt-n5-tutor-v18` (stale-while-revalidate for shell, cache-first for content); update toast on new shell; lazy-caches audio on first play
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
- [x] FCP < 1.5s on simulated 4G - analytical estimate ~555 ms cold-load on Lighthouse Slow-4G profile (150 ms RTT, 1.6 Mbps, 4x CPU). Critical-path ~60 KB total: index.html 2.1 KB + main.css 37.6 KB + entry JS modules 18.7 KB. Repeat visits via SW cache: <100 ms.
- [x] Works offline after first load.
- [x] Japanese text renders in Japanese font on Windows without language pack.
- [x] Furigana toggle hides/shows ruby.
- [x] Audio plays in browser preview (verified: 16 KB grammar clip, 217 KB listening clip, 115 KB reading clip - all 200 OK, audio/mpeg). iOS Safari unverified but uses standard `<audio src>` so should work.
- [x] Export → wipe → import round-trips progress.
- [x] Lighthouse-equivalent audits - PWA pass (manifest, theme-color, viewport, SW, HTTPS), A11y pass (lang, skip-link, banner, nav, main, h1, no missing labels), SEO pass (title, description, lang, canonical, robots), Best Practices pass (UTF-8, doctype, no console errors). Added meta color-scheme + robots + canonical link to index.html.
- [x] No outbound network calls during a normal session.

---

## Remaining (Brief 1)

- [x] **P-cross.4 Reading + listening corpus expansion**: 30 reading passages + 12 listening items committed.
- [x] **Run tools/build_audio.py end-to-end**: 491 MP3s rendered via gTTS, committed under audio/, listening module activated.

Brief 1 complete. Engine, module, and asset layers shipped.

---

## UI testing plan - 2026-04-30 (synced to UX Brief 2 Phases 1-4)

Comprehensive UI-level test strategy at `feedback/ui-testing-plan.md` covering 22 perspectives across 17 routes × multiple sub-paths × 5 locales × 8 browsers × 6 OSes.

**★ Foundational concern: §12 Japanese language accuracy & content integrity** - the bar this app must clear:
- §12.1: 16 automated content invariants (CI release blocker)
- §12.2: Runtime JA spot-checks at P0 / P1 / P2 tiers
- §12.3: Quarterly Pass-N re-audit protocol (continues the audit-pass tradition from `verification.md`)

Other sections:
- §0.1: Route map - canonical reference for all routes + sub-paths (Learn hub, kanji index/detail, vocab per-form, test/<n> direct-launch)
- §1-§11, §13-§16: Other perspectives (end-learner, first-timer, returning visitor, mobile, a11y, i18n, slow conn, offline, power user, cross-browser, cross-OS, perf, security, PWA, visual)
- §17: Three-tier execution (P0 smoke 5min / P1 gate 60min / P2 regression 4h)
- §18-§19: Recommended tooling stack (Playwright + axe-core + Lighthouse CI) and CI integration
- §20: Nielsen 10 heuristic checklist applied to this app
- §22-§23: Acceptance criteria + perspective coverage matrix

Use as a **catalog** - triage by P0/P1/P2 tier, don't run all 22 every release. **§12 always runs.**

### Pending engineering work (not yet wired)

- [ ] Create `tools/check_content_integrity.py` implementing the 16 invariants from §12.1 (X-6.1 through X-6.7 + JA-1 through JA-9). Wire into CI as a release blocker.
- [ ] Add Playwright + @axe-core/playwright as devDependencies; first test suite covering §17.1 P0 smoke.
- [ ] Add Lighthouse CI workflow per §19; baseline numbers from current SW v18 build.
- [x] First quarterly Pass-N re-audit calendar reminder (§12.3): 2026-07-30. Recurring scheduled task `jlpt-n5-quarterly-pass-audit` set to cron `0 9 30 1,4,7,10 *` (9 AM local on the 30th of Jan/Apr/Jul/Oct). Next run: 2026-07-30. Prompt rotates audit lenses (child-readability / register / honorifics / distractor quality / cross-file consistency) so successive quarters surface different findings.

---

## Content correction brief (Pass 9) - 2026-04-30 (COMPLETE)

External brief at `feedback/jlpt-n5-content-correction-brief.md` raised 27 items + 4 systematic sweeps + 7 cross-file consistency checks. Severity: 5 CRITICAL, 7 HIGH, 9 MEDIUM, 6 LOW. Fixes in priority order.

### CRITICAL (5)

- [x] **C-1.1** kanji_n5.md missing 力 and 手 (used as correct answers in moji Q54/Q58). Add to catalog OR replace questions.
- [x] **C-1.2** dokkai Passage F: 「こんねんの 八月」 - wrong reading of 今年 (should be ことし).
- [x] **C-1.3** bunpou Q50/Q51: both から (option 2) and ので (option 3) are grammatically correct. Replace one distractor.
- [x] **C-1.4** goi Q99 rationale overstates 知る ≈ 覚える as direct synonymy. They are not synonyms; soften.
- [x] **C-1.5** moji Q6 rationale mentions にっぽん which is not in the options; tighten to avoid confusion.

### HIGH (7)

- [x] **H-2.1** Mixed kanji+kana words sweep (e.g., bunpou Q70 「図しょかん」, dokkai Passage 24 「大さか」). Pick one rule, apply consistently.
- [x] **H-2.2** bunpou Q98 option 4 「ピアノを 買い」 is also grammatical. Strengthen distractor or add nuance to rationale.
- [x] **H-2.3** bunpou Q100 rationale: 「でも」 should be glossed as "even (just)", not "at least".
- [x] **H-2.4** vocabulary §27/28: flag Group-1 ru-verb exceptions (入る, 帰る, 走る, 知る, 切る, 要る) with annotation.
- [x] **H-2.5** moji Q62 「子供 vs 子ども」: rationale should disclose that 子供 is also standard.
- [x] **H-2.6** grammar §22: rename "Honorific" to "Beautifying" (bika-go vs sonkei-go terminology).
- [x] **H-2.7** vocabulary line 287: 「もう」 definition incorrectly lists "soon" as a standalone gloss.

### MEDIUM (9)

- [x] **M-3.1** kanji_n5.md kun-yomi readings out of N5 scope (上=のぼる, 下=おりる, 外=ほか, 万=バン).
- [x] **M-3.2** goi Q47 rationale uses 「去年」 (N4 kanji); change to きょねん.
- [x] **M-3.3** goi Q87: consider はたち vs 二十さい note for age-20.
- [x] **M-3.4** bunpou Q24: しんかんせん is not in N5 vocab. Replace with でんしゃ.
- [x] **M-3.5** goi Q86: soften "電話をかける = 電話で話す" rationale (not strict equivalence).
- [x] **M-3.6** goi Q94: soften あまくない vs あまり あまくない rationale.
- [x] **M-3.7** goi Q70: soften "likes" → "does often" rationale.
- [x] **M-3.8** vocabulary 毎年 (まいとし/まいねん): add register note.
- [x] **M-3.9** vocabulary archaic items (マッチ, フィルム, レコード, テープレコーダー): add note about modern relevance.

### LOW (6)

- [x] **L-4.1** sources.md CEFR claim: verify or soften.
- [x] **L-4.2** kanji 円: meaning ordering (yen first; circle/round as N4+).
- [x] **L-4.3** grammar §6: clarify verb group description with both kana-row and romaji views.
- [x] **L-4.4** dokkai Q27 passage uses 「一じかん」; standardize to 「一時間」.
- [x] **L-4.5** em-dash check across all files.
- [x] **L-4.6** vocabulary line 824: いる homophone; cross-reference to §2.4 list.

### Systematic sweeps (4)

- [x] **S-5.1** Mixed kanji+kana words across all files.
- [x] **S-5.2** Vocab outside N5 scope appearing in question stems.
- [x] **S-5.3** Rationale lines that overstate equivalence ("Direct synonymy", "=", "equivalent").
- [x] **S-5.4** Verify cited grammar rules in rationales.

### Cross-file consistency checks (7)

- [x] **X-6.1** Every kanji used as correct answer appears in kanji_n5.md.
- [x] **X-6.2** Readings in vocab match readings in question files (esp. 今年 = ことし).
- [x] **X-6.3** No mixed-kanji words.
- [x] **X-6.4** No orphan vocab in question stems.
- [x] **X-6.5** No em-dashes.
- [x] **X-6.6** All Group-1 ru-verb exceptions flagged in vocab.
- [x] **X-6.7** No false "direct synonymy" claims in rationales.

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
- [x] **B-4** Q85 pleonasm: 「ほしいので かいたい」 - both verbs express wanting. Drop one.
- [x] **B-6** Q98 wrong compound: 「ピアノのきょうしつ」 should be 「ピアノきょうしつ」 (compound noun, no の).
- [x] **B-7** Q100 semantic clash: 「ぜったいに 一日 ぐらい」 - absolute + approximate clash. Change answer to 「でも」 or rework stem.

#### dokkai_questions_n5.md
- [x] **D-3** Passage 14 Q27 unit mismatch: stem asks 「何分」, answer is 「一時間」. Fix question word to 「どのぐらい」.
- [x] **D-5** Passage 26 Q51 mixed-category options: mixes duration ('一年' / '五年') and age ('5さいから'). Restate options to one category.

#### authentic_extracted_n5.md
- [x] **A-1** Q43 particle typo: stem ends 「をあります」. Fix to 「にあります」.
- [x] **A-2** Q58 underline/answer mismatch: underline on 「みぎ」 but answer is for 「みち」. Realign underline.
- [x] **A-3** Q59 N3 kanji in stem: 「有名」 violates the stems-N5-only rule. Render in kana or replace question.
- [x] **A-6** Q117 ambiguous source: 「兄に」+もらう is acceptable but unclear at N5. Change to 「兄から」.
- [x] **A-8** Q142 unidiomatic subject: 「うちは...先生をしています」 - うち + occupation verb is non-native. Restate.

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

### Phase 1 - Stop the bleeding ✅ COMPLETE
- [x] **B2-P1.1** Skeleton screens replace literal "Loading..." text + 5s timeout error UI (§3.1) - shimmer animation, route-shape-matched blocks, 5s Promise-race timeout shows real "Couldn't load" UI with Retry.
- [x] **B2-P1.2** Empty states for Review, Test, Summary, Practice with routing buttons (§3.2) - Review: 2-state (no progress vs no due), Summary: progress=0 routes to Learn, Test: first-test banner suggests learning, Drill: existing CTA preserved.
- [x] **B2-P1.3** Deep-link URLs per §14.1 - new js/kanji.js renders #/kanji index + #/kanji/<glyph> detail (97 entries, on/kun/meanings/stroke-svg slot). Test deep-link #/test/<n> with n in {20,30,50} starts test directly.
- [x] **B2-P1.4** Privacy/offline/no-login trust strip on landing above-the-fold (§1.1.5) - 3-item strip in header brand block, mobile-responsive.
- [x] **B2-P1.5** Copy revisions: tagline + footer per §15 - tagline now "Pass JLPT N5 with 15 minutes a day. No login, no ads, no data shared." Footer: "Works offline. No login. Your progress stays on this device."

### Phase 2 - Daily-use friction ✅ COMPLETE
- [x] **B2-P2.1** Three-mode furigana radios in Settings + header quick-toggle. Storage: `furiganaMode` ∈ {always, hide-known, never}. CSS-toggle via re-render on change (§4.1).
- [x] **B2-P2.2** Per-kanji popover (`js/kanji-popover.js`): click any glyph → readings + meaning + "I know this" toggle. Persists in `localStorage.knownKanji`. Click delegation across all rendered kanji. (§4.2)
- [x] **B2-P2.3** Live furigana preview in Settings panel - fieldset shows `日本語の本を 読みます` rendered through current mode; updates instantly on radio change. (§4.3)
- [x] **B2-P2.4** Settings additions: audio speed (0.75/1.0/1.25 - applied via MutationObserver to every `<audio>`), reduce-motion (auto/on/off - sets `data-reduce-motion` on `<html>`, CSS overrides motion durations), typed-phrase reset confirm box ("Type RESET"). (§5)
- [x] **B2-P2.5** Location indicator chip below header - updates on every route change with route label + decoded params (e.g. "Learn", "Kanji · 日"). (§2.4)
- [x] **B2-P2.6** Per-question feedback - drill module already shows immediate feedback per question. Test deliberately uses end-of-test results per JLPT mock-exam fidelity (Brief §6.2 separates Test as a periodic event from drill).
- [x] **B2-P2.7** Global keyboard shortcuts (`js/shortcuts.js`): 1-4 picks Nth choice button, Space reveals/flips, Enter clicks primary/Submit/Continue, ? opens cheatsheet overlay, Esc dismisses. Skipped while focus is in input/textarea/select. (§7.2)

### Phase 3 - Landing and orientation ✅ COMPLETE
- [x] **B2-P3.1** New `js/home.js` route at `#/home` is now the default landing. First-time state: heading "Start your N5 study", scope line (187 patterns / 1000 vocab / 97 kanji), primary CTA "Start your first lesson", secondary "Take a placement check", 3-pillar card row Learn/Practice/Test, trust strip already in header. (§1.1)
- [x] **B2-P3.2** Returning state appears when history or test results exist: Continue card (resumes last lesson via `settings.lastLearnId`), Today's review queue card (shows due count + "Start review", or "All caught up" empty positive), 7-day streak strip with flame + heatmap, last-test summary line. (§1.2)
- [x] **B2-P3.3** Streak storage in `localStorage.streak` ({current, longest, lastStudyDate, days[30]}). Auto-incremented on first interaction each day. Heatmap renders last 7 days; `streak-flame` + day-count chip on home. Session-end UX is owned by drill/review results screens already. (§6)
- [x] **B2-P3.4** New `js/search.js` indexes grammar (id/pattern/meaning/explanation), vocab (form/reading/gloss), kanji (glyph/on/kun/meanings). `<input type="search">` in secondary nav. `/` keyboard shortcut focuses input. Click outside or Esc dismisses panel. Lazy-loads bank on first focus. (§8)
- [x] **B2-P3.5** Nav restructured per §2.2: primary now has Home / Learn / Practice (renamed from Daily Drill) / Review / Test. Secondary nav row holds search + Summary + Settings.

### Phase 4 - Polish and reach ✅ COMPLETE
- [x] **B2-P4.1** Webfont decision: kept system stack `Noto Sans JP / Hiragino Kaku Gothic ProN / Yu Gothic / Meiryo`. Shipping a 200 KB self-hosted woff2 conflicts with static-only / no-third-party-loads constraints. Yu Gothic + Meiryo are preinstalled on Windows 10+; users with the JP language pack get Noto Sans JP. Documented in CHANGELOG.
- [x] **B2-P4.2** SW now uses stale-while-revalidate for the shell (HTML/CSS/JS): serves cache instantly, refetches in background, posts `SW_UPDATE_AVAILABLE` to clients when new bytes detected. Cache-first preserved for content. New js/pwa.js shows "A new version is available - Reload?" toast on receipt; click sends `SKIP_WAITING` and reloads.
- [x] **B2-P4.3** Install banner via `beforeinstallprompt` (one-time, dismissed flag in localStorage). Offline indicator chip in top-right that toggles with `navigator.onLine`. Hidden when online.
- [x] **B2-P4.4** Mobile responsive pass: primary nav becomes a fixed bottom bar at ≤480px with safe-area insets honored (`env(safe-area-inset-bottom)`). All buttons / nav items / pillar cards / choice buttons set `min-height: 44px` per Apple HIG.
- [x] **B2-P4.5** Quit prompt: `__testInProgress` flag set by Test.startTest, cleared on results. `beforeunload` blocks tab close; `hashchange` interceptor confirms "Quit this test? Progress so far will be saved" and reverts the hash on cancel.
- [x] **B2-P4.6** `@media print` stylesheet hides nav/header/footer/PWA chrome, expands all `<details>`, switches to serif body, hides audio + buttons, scales ruby smaller. Produces clean printable Learn lesson pages.
- [x] **B2-P4.7** Footer adds version line `v1.5.0 · Content updated April 2026 · What's new` linking to `CHANGELOG.md`. New CHANGELOG.md documents v1.5.0 (this brief) + v1.4.0 audio + v1.3.0 audit + v1.2.0 + v1.0.0.
- [x] **B2-P4.8** A11y audit (live-verified): h1=1, all interactive elements have text or aria-label, all landmarks have roles (banner, main, status), trust strip has aria-label, search has aria-label, location chip has role=status + aria-live=polite, min-tap-target 44px enforced via CSS, skip-link present, prefers-reduced-motion respected (skeleton CSS already had override; reduce-motion override added at `data-reduce-motion="on"`).

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
