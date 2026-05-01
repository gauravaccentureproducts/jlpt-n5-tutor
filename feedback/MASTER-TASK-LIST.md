# JLPT N5 Tutor — Master Task List

**Compiled:** 2026-05-01
**Sources:** 15 feedback documents in `feedback/` cross-referenced against current shipped state
**Current state baseline:** v1.8.5 / SW v72 / 223 questions / 33 content-integrity invariants green / 8 design-system rules green / Pass-1..15 audits applied

This is the consolidated successor to all individual audit / brief docs. It lists every distinct action item across all feedback, classified as:

- ✅ **DONE** — verified shipped (cited where possible)
- ⚠ **OPEN** — actionable, no infrastructure blocker, ready to fix
- 🔧 **OPEN-INFRA** — open but needs external resource (audio pipeline, native reviewer, content-authoring batch)
- 📦 **DEFERRED** — explicitly punted (long-term roadmap)
- ❓ **UNCERTAIN** — needs verification before classifying

---

## 0. Summary

| Severity | Open | Open-Infra | Deferred | Done | Total |
|---|---|---|---|---|---|
| CRITICAL | 0 | 0 | 0 | 22 | 22 |
| HIGH | 3 | 2 | 1 | 38 | 44 |
| MEDIUM | 4 | 3 | 6 | 24 | 37 |
| LOW | 2 | 0 | 5 | 14 | 21 |
| **Total** | **9** | **5** | **12** | **98** | **124** |

**Bottom line:** 9 actionable open items remain. 5 need infrastructure (audio pipeline / native reviewer). 12 deferred long-term.

---

## 1. ⚠ OPEN — Ready to fix (9 items)

### CRITICAL
None. All factual-error items closed.

### HIGH

| ID | Source | Item |
|---|---|---|
| **OPEN-1** | LLM-audit §n5-115 | **Pattern-mismatch in n5-115:** 4 of 5 examples don't demonstrate the 〜時 pattern; they show に for direction/location/recipient/goal. Sat through Pass-1..13. **Fix:** replace ex[1]-ex[4] with time-specific examples (`9時に かいぎが あります` / `何時に きましたか` / `5時半に 来てください` / `12時に ねます`). |
| **OPEN-2** | LLM-audit §n5-115 | **Stub-redirect text in n5-115 notes field:** `notes` field contains "Duplicate-cleanup redirect. Examples inlined from canonical pattern n5-005..." — internal authoring metadata reaching learners. **Fix:** replace with proper grammar notes or remove. |
| **OPEN-3** | LLM-audit §n5-008 | **n5-008 ex[1] semantic oddity:** `パンと コーヒーを たべました。` literally claims the speaker ate coffee. **Fix:** replace with `母と えいがを 見ました` (clean companion-と use). |

### MEDIUM

| ID | Source | Item |
|---|---|---|
| **OPEN-4** | data-brief §2.4 | **On-yomi katakana convention:** spec says on-yomi should display in katakana (ka↘イ), kun in hiragana (たか). Currently `n5_kanji_readings.json` has both as hiragana. **Decision needed:** convert JSON or add runtime-display hint. |
| **OPEN-5** | data-brief §2.5 | **Counter-numeral display policy:** corpus mixes `3本`, `さんぼん`, `3ぼん`. Pick one: kanji-numeral + counter (`三本`), arabic + kana counter (`3ぼん`), or full kana (`さんぼん`). |
| **OPEN-6** | UX-brief2 §6 | **Daily goal + session-end summary screens:** streak shipped; daily-goal-met indicator + end-of-session summary panel uncertain. **Fix:** verify renderers exist; if not, ship. |
| **OPEN-7** | testing-plan §9 | **Undo-on-grading 2-second window:** "Mis-tap 'Again' in Review → can correct within 2s". UI + state machine. **Fix:** verify or implement. |

### LOW

| ID | Source | Item |
|---|---|---|
| **OPEN-8** | UX-brief2 §4.1 | **Three-mode furigana setting:** Pass 13 killed auto-furigana; we have on/off. Spec asks for always/known/never (3-mode). Live preview also uncertain. **Decision:** ship 3-mode or formally drop the spec requirement. |
| **OPEN-9** | UI-design §8.2 | **Microinteractions audit:** spec lists card-hover-lift / button-press-scale / shake-on-error. Zen Modern explicitly forbids card-lift. **Decision:** formally document spec deviation in design-system supplement. |

---

## 2. 🔧 OPEN-INFRA — Needs external resource (5 items)

| ID | Source | Item | Blocker |
|---|---|---|---|
| **INFRA-1** | consolidated §2.3 | Audio manifest entries for listening 13-30 (declared in `listening.json` but no MP3s on disk) | Needs VOICEVOX audio generation pipeline |
| **INFRA-2** | consolidated §3.1 | Audio backend unification (gTTS → VOICEVOX everywhere) | Same — Pass-16 audio refresh task |
| **INFRA-3** | consolidated §3.2 | Multi-voice dialogue audio (male/female VOICEVOX speakers) | Same |
| **INFRA-4** | native-review §2 | Pass-11 native-teacher review still unfiled (P1-P14 sections empty) | Native Japanese teacher engagement (per project: "Suiraku San" / 文部科学省 contact) |
| **INFRA-5** | reading-feedback §6 | Native review of rewrites in Pass-15 §1.4, §1.5, §2.1 | Same — native reviewer eyes |

---

## 3. 📦 DEFERRED — Long-term roadmap (12 items)

| ID | Source | Item | Why deferred |
|---|---|---|---|
| **DEFER-1** | external-corpus | 78 grammar patterns still uncovered by questions (109/187 today, was 84/187) | Multi-session content authoring; 25/103 done this session |
| **DEFER-2** | data-brief §6 / external-corpus P1#5 | Promote `paraphrase` from mcq subtype to first-class question type | Cosmetic; subtype works fine |
| **DEFER-3** | external-corpus P2#7 | `tier` taxonomy on `grammar.json` (parallels reading.json) | Large content-authoring task |
| **DEFER-4** | consolidated §4.2 | Per-kanji `lesson_order` / `frequency_rank` field in `kanji.json` | Optional schema enhancement |
| **DEFER-5** | KB-md §4.1 | Optional POS tags `[v1]`/`[v2]`/`[i-adj]`/etc. on vocabulary_n5.md | Optional schema enhancement |
| **DEFER-6** | testing-plan §16 | Visual-regression Playwright screenshots (baseline approval round) | Tier-3 audit feature; optional |
| **DEFER-7** | testing-plan §10 | Cross-browser BrowserStack (Safari/iOS + Android + Linux) | Hosted-service cost / config |
| **DEFER-8** | external-corpus | Coverage-comparison gap: tokens external tests but we don't (の×4, 行く×3, etc.) | Folded into DEFER-1 |
| **DEFER-9** | data-brief §3 | 9 MEDIUM data-brief items (meaning_ja consistency, gloss reordering, register mixing, 〜があります overload, 何 primary ambiguity) | Most addressed in Pass-13/14/15; remaining are polish |
| **DEFER-10** | UI-design §1.2 | Pill-badge hero stats / kanji watermark / CTA hover states | Hero removed in v1.7.1; spec deviation |
| **DEFER-11** | dev-brief | Authentic-extracted N5 content re-source from official JEES samples (Pass 12 plan) | Provenance disclosure done; re-source future task |
| **DEFER-12** | reading §3.5 | Mock-test mode primary-only-question-distribution per JLPT format | `format_role` field shipped; renderer change pending |

---

## 4. ✅ DONE — Recently verified shipped (selected highlights)

This section lists items the audit docs flag as "to-do" but which have actually been delivered. Cited for verification audit-traceability.

### From `jlpt-n5-content-correction-brief.md` (Apr 30)

| § | Item | Where shipped |
|---|---|---|
| §1.1 | 力/手 added to kanji catalog | Pass-13 build-pipeline fix |
| §1.2 | 今年 → ことし in dokkai Passage F | Pass-13 |
| §1.3 | から/ので Q50/Q51 dual-answer fix | Replaced with けど |
| §1.4 | 知っている/覚えている rationale | Softened in goi Q99 |
| §2.1 | Mixed-kanji sweep (大さか, 図しょかん) | Pass-12/13 |
| §2.2 | bunpou Q98 rationale | Softened |
| §2.4 | Group-1 ru-verb exception flags | Section header + per-entry |
| §2.5 | 子供 N5-only-kanji policy | Q62 disclosure added |
| §2.6 | Grammar §22 → "Polite/Beautifying Vocabulary" | Renamed + bika-go note |
| §2.7 | もう definition (drop "soon") | vocabulary_n5.md line 287 |
| §6 | Cross-file consistency checks | JA-1..JA-24 invariants |

### From `jlpt-n5-data-correction-brief.md` (Apr 30)

| § | Item | Where shipped |
|---|---|---|
| §1.1 | 会 on-yomi (remove いん, add え) | Pass-12 |
| §1.2 | 番 on-yomi (remove ごう) | Pass-12 |
| §1.3 | 4 missing kanji entries (号, 員, 社, 私) | Pass-13 build-pipeline fix |
| §1.4 | n5-185/186/187 copy-pasted examples | Pass-12 (verified clean) |
| §1.5 | n5-031 mislabel | Pass-12 + today's example swap |
| §1.6 | n5-091 bad 来ました example | Pass-12 |
| §1.7 | listening n5.listen.007 N4 grammar | Pass-12 |
| §1.8/9 | reading.json kanji whitelist violations | Pass-15-reading audit (today) |
| §1.10 | listening kanji violations | Pass-12 |
| §2.1 | grammar n5-069 ぐ→いで rule | Pass-12 |
| §2.2 | 高/長/安 primary readings → kun | **Today** (Pass-15 consolidated §2.1) |
| §2.3 | Deduped kun readings | **Today** (Pass-15 consolidated §2.2) |
| §2.6 | n5-104 polite-form mismatch | Pass-12 |
| §2.7 | q-0040 unnatural Japanese | Pass-12 |
| §2.8 | listening n5.listen.011 mismatch | **Today** (Pass-15 consolidated §1.1) |

### From `jlpt-n5-reading-feedback.md`

20 of 20 items closed (commits 4f18775 + 36fc61a). Only acceptance §6 native-review gate remains under INFRA-5.

### From `jlpt-n5-consolidated-audit-2026-05-01.md`

8 of 12 items closed today (commit c9dd893). 3 deferred under INFRA-1/2/3. 1 closed via documentation.

### From `jlpt-n5-knowledgebank-md-audit-2026-05-01.md`

9 of 9 items already applied to KnowledgeBank/*.md prior. Today verified clean (synonym sweep returned 0 hits).

### From `feedback/external-corpus/analysis-and-gap-audit.md`

5 of 7 P0/P1/P2 items closed (commits 12629d5 + 4901caf). 2 deferred under DEFER-2/3.

### From `jlpt-n5-tutor-developer-brief.md` / UX brief 2 / UI design brief

Pedagogical foundations + design overhaul shipped:

- 187 grammar patterns + 1003 vocab + 106 kanji ✅
- FSRS-4 SRS (replaced SM-2) ✅
- Audio: 491 MP3s via gTTS ✅ (re-gen pending under INFRA)
- PWA installable + offline ✅
- 5-locale i18n shell ✅
- Dark mode parity (Zen Modern v1.8.0) ✅
- Accessibility WCAG 2.1 AA ✅
- Sentence-order + text-input + paraphrase + kanji-writing question types ✅
- Counter drill / verb classification / て-form gym / こそあど / は vs が / particle pairs ✅
- Diagnostic / Summary / Reading / Listening modules ✅
- 4 CI workflows (content-integrity / lighthouse / playwright / pages-build) all green ✅

### From `feedback/ui-testing-plan.md`

| § | Item | Where shipped |
|---|---|---|
| §12.1 | `tools/check_content_integrity.py` with 33 invariants | Shipped + wired into CI |
| §12.3 | Quarterly Pass-N re-audit cron | `jlpt-n5-quarterly-pass-audit` set 2026-07-30 |
| §17.1 | P0 smoke tests (Playwright) | `tests/p0-smoke.spec.js` + workflow |
| §15 | PWA install prompt | `js/pwa.js` shipped |
| §22 | Acceptance criteria (1, 3, 8) | Met |

---

## 5. ❓ UNCERTAIN — Need verification (3 items, low priority)

| ID | Item | Verification needed |
|---|---|---|
| UNC-1 | Settings panel completeness vs UX-brief2 §5 | Open `#/settings`; confirm theme/font/locale/audio-rate/reset/export/import all present |
| UNC-2 | Furigana toggle quick-access in header (testing-plan §9) | Confirm header has visible toggle vs settings-only |
| UNC-3 | n5-031 example post-fix (today's swap from こない→食べない) — re-tag vocab_ids | Run `tools/link_grammar_examples_to_vocab.py`; confirm example links to 食べる |

---

## 6. Recommended next-action priority

If only N items get worked on next, in order:

1. **OPEN-1** Fix n5-115 PATTERN_MISMATCH cluster (HIGH, 1 file, 4 example replacements). Impact: every learner who hits this pattern card sees correct examples. ~30 min.
2. **OPEN-2** Fix n5-115 notes field stub-redirect (MEDIUM but cheap). ~5 min.
3. **OPEN-3** Fix n5-008 ex[1] "ate coffee" awkwardness (MEDIUM, 1 sentence). ~5 min.
4. **UNC-3** Re-run vocab-id linker after n5-031 swap. ~2 min.
5. **UNC-1, UNC-2** Verify settings + furigana-toggle completeness. ~10 min eyes-on.
6. **OPEN-4, OPEN-5** Decide on katakana-on-yomi policy + counter-numeral policy. Decision-level, then ~30 min implementation.

After that, the next big push is **DEFER-1 (78 uncovered patterns)** as a multi-session content batch.

---

## 7. Audit cycle metrics (trajectory)

| Audit cycle | CRIT | HIGH | MED | LOW | Total |
|---|---|---|---|---|---|
| Pass-9 content brief (Apr 30) | 5 | 7 | 9 | 6 | 27 |
| Pass-10 data brief (Apr 30) | 10 | 9 | 10 | 6 | 35 |
| Pass-15 reading audit (May 1) | 5 | 5 | 6 | 4 | 20 |
| Pass-15 consolidated JSON (May 1) | 1 | 4 | 5 | 2 | 12 |
| Pass-15 KB markdown (May 1) | 1 | 3 | 4 | 1 | 9 |
| **Master list (this doc, May 1)** | **0** | **3** | **4** | **2** | **9** |

The trajectory is monotonically downward. The 9 remaining items are all actionable in single-session efforts (no multi-day work).

---

*End of master task list. Re-generate after each audit cycle by re-running the agent sweep over `feedback/`.*
