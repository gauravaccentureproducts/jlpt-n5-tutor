# TASKS.md — Canonical Template

**Closes Pass-22 F-22.7.** This is the canonical structural template for the project's `TASKS.md` file. Reference from procedure manual §8.1 instead of "matches N5". Any next-level build (N4, N3, N2, N1) creates its `TASKS.md` from this skeleton.

---

## Required top-level structure

A valid `TASKS.md` has these sections **in this order**, each as a top-level `## ` heading:

1. **`## Live site`** — single-paragraph deployment status (URL, last deploy SHA, hosting provider).
2. **`## Status snapshot`** — bullet list of canonical project metrics (see §Required snapshot fields below). Updated on every significant change; staleness is a known regression risk per Pass-15 / Pass-17 retrospective.
3. **`## Remaining`** (optional) — short-term backlog visible at the top so contributors can see "what's next" without scrolling.
4. **`## External-blocked backlog`** — items that cannot close without external resources. Each item lists its blocker and unblock condition explicitly.
5. **`## Pass-N <name>` sections** — one per audit/work cycle, in **reverse-numeric order** (newest pass at top). Each Pass-N body follows the §Pass-N body structure below.
6. **`## Hard constraints preserved`** (optional) — invariants the project commits to upholding (e.g., "no telemetry").
7. **`## Out of scope`** (optional) — explicit non-goals, with rationale.

Each section is separated by `---` horizontal rules.

## Required snapshot fields

The `## Status snapshot` block MUST include bullet items for at least:

- Catalog state: `M/N patterns enriched, K real questions (no stubs)`
- Question type distribution: `mcq / sentence_order / text_input` counts
- Routes: list of every `#/route`, including sub-paths
- SRS: which algorithm, with verified intervals
- Service worker: cache name (e.g., `jlpt-n<L>-tutor-vN`)
- i18n: locales count
- PWA: installable status
- Tests: test count + framework
- Vocab corpus: entry count + whitelist size
- Kanji corpus: entry count
- Reading corpus: passage count
- Listening corpus: item count
- Audio assets: file count + total size
- Codebase invariants: e.g., "em-dash-free" if X-6.5 is enforced

When any of these change, update the snapshot in the same commit. Staleness in the snapshot has been a recurring regression class — Pass-19 and Pass-22 both registered cleanup work for stale snapshot entries.

## Pass-N body structure

Every `## Pass-N <name>` section follows this layout:

```markdown
## Pass-N <name> - YYYY-MM-DD (<status flag>)

<One-paragraph context: what triggered this pass, where the source / audit
doc lives, scope summary.>

#### Severity bucket headers — one or more of:
#### CRITICAL (N classes — N RESOLVED)
#### HIGH (N classes — N RESOLVED, N OPEN)
#### MEDIUM (N classes — ALL RESOLVED)
#### LOW / Schema (informational)

<Each finding under its severity bucket follows the F-N.K item format
described below.>

#### (Optional sub-sections)
- Recommended fix sequence
- Side-effects
- Tooling
- Cascade items
- Open structural concerns
```

**Status flags** at the top of each Pass section:
- `(REGISTERED, NOT YET FIXED)` — findings catalogued, fixes not started
- `(N of M ITEMS APPLIED)` — partial progress
- `(ALL FIXES APPLIED)` — closed
- `(N CLOSED, M DEFERRED)` — split status with explicit deferral
- `(SKIPPED — <reason>)` — pass was opened then closed without action

## F-N.K item format

Every actionable finding uses this format:

```markdown
- [<status>] **F-N.K** (SEVERITY) **<short title>** — <issue description>. <fix description>. <evidence pointer>.
```

Where:
- `[<status>]` is one of:
  - `[ ]` — open, not started
  - `[x]` — closed (fix applied; date + commit SHA in the description)
  - `[-]` — closed-by-pointer (defers to a different finding ID or external item)
- `F-N.K` is `F-<pass-number>.<within-pass-index>`. Within-pass indices start at 1 and never repeat. If a pass needs to add a finding mid-stream, append a new index — never reuse.
- `(SEVERITY)` is one of `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` per severity guide below.
- **Short title** in bold; one phrase, no period.
- **Issue description**: 1-2 sentences explaining what's wrong.
- **Fix description**: present-tense or "Applied YYYY-MM-DD:" past-tense.
- **Evidence pointer**: file path + line range, or commit SHA, or audit-doc ref.

## Severity guide

| Severity | Definition | Default ship-blocker? |
|----------|------------|------------------------|
| CRITICAL | Directly teaches wrong content; blocks release. | Yes |
| HIGH | Pedagogical error or structural bug; fix in next release. | Yes |
| MEDIUM | Inconsistency or minor inaccuracy; batch in next quarterly pass. | No |
| LOW | Polish / cosmetic; nice to have. | No |

## Update rules (testable)

- **R1** — Every code-changing commit updates either `TASKS.md` (a Pass-N entry's status, the snapshot, or both) or includes "no TASKS.md update needed" justification in the commit body.
- **R2** — A `[ ]` item that is fixed becomes `[x]` in the SAME commit as the fix. Never a follow-up commit.
- **R3** — When a finding cannot be addressed in the current cycle, mark `[ ]` with explicit deferral rationale (`Skipped Pass-N: <reason>`).
- **R4** — Open items per Pass should not exceed 30 in a single section; if more, split into Pass-N.a / Pass-N.b.
- **R5** — Pass-N sections, once closed, do not get re-edited except for typo fixes. New work on the same area opens a new Pass-(N+M) section that links back.

## Empty-skeleton starter

For a fresh next-level build, copy this skeleton:

```markdown
# JLPT N<L> Tutor — Tasks

Last update: YYYY-MM-DD

## Live site

(deployment URL, last SHA)

---

## Status snapshot

- TBD/TBD patterns enriched, 0 real questions
- 0 routed views
- SM-2 SRS in Review (4-button grading)
- Service worker `jlpt-n<L>-tutor-v1`
- 0-locale i18n shell
- (etc — fill as content lands)

---

## External-blocked backlog (YYYY-MM-DD)

(see procedure manual §9 — at minimum: native voice talent, native
teacher reviewer, brief translation, recommender ML)

---

## Pass-1 <first-pass-name> - YYYY-MM-DD (REGISTERED)

(first audit / authoring cycle goes here)
```

## Worked examples

The N5 `TASKS.md` at `<repo-root>/TASKS.md` is the live reference. Notable patterns to mirror:
- Pass-14 (questions.json comprehensive audit) demonstrates the full structure: severity buckets, fix sequence, side-effects, tooling.
- Pass-20 (procedure-manual review) demonstrates the closed/deferred/closed-by-pointer split for a 40-item review.
- Pass-22 (procedure-manual polish) demonstrates promoting closed-by-pointer items to actionable [ ] entries with concrete fix descriptions.

## Anti-patterns to avoid

These caused real pain in N5; do not repeat:

1. **Stale snapshot.** Updating data without updating the snapshot on the same commit. Caught in Pass-15, Pass-17, Pass-22 each — there is now a status-snapshot freshness invariant in `TASKS.md` rule R1.
2. **Sub-heading drift.** Sub-headings like "HIGH (3 classes — 1 RESOLVED, 2 OPEN)" left stale after items close. Caught in Pass-15. R5 says don't re-edit closed Passes; track sub-heading status in the bucket header instead.
3. **Re-using F-N.K indices.** Caught in Pass-15 / Pass-19. R4 / R5 forbid this. Add a new index instead.
4. **Implicit deferral.** Items disappearing without an `[x]` or `[-]` status flag. Caught in Pass-17 / Pass-19. R3 requires explicit closure.

---

*Canonical template prepared 2026-05-01 by extracting from the N5 `TASKS.md` and the Pass-22 retrospective. Update if the format itself evolves at any next level.*
