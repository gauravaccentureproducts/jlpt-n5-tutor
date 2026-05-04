# n5_vocab_whitelist.json — Design

This whitelist is **generated** from `KnowledgeBank/vocabulary_n5.md` by
`tools/build_data.py`. It is NOT a hand-curated mirror of `data/vocab.json`.

## Purpose

The whitelist serves as the **recognition allowlist** consumed by
`tools/lint_content.py` when checking that no out-of-N5-scope vocabulary
appears in `data/grammar.json` or `data/questions.json`. A token in the
whitelist means "in-scope at N5"; a token absent from the whitelist
triggers a lint warning when it appears in user-facing content.

## Relationship to data/vocab.json

The whitelist is **intentionally a superset** of vocab.json's form / reading
fields. As of 2026-05-04:

  - **vocab.json**:  1003 structured catalog entries (form, reading, gloss,
                     section, pos, examples).
  - **whitelist**:    969 forms = 929 that match vocab.json + 40 deliberate
                     "extras" (see below).

The 40 extras fall into two categories.

### Multi-form aliases (10 — by design)

`vocabulary_n5.md` lists certain words under a single multi-form entry like
`- いい / よい - [i-adj] good`. `tools/build_data.py` extracts BOTH
forms (いい AND よい) into the whitelist. `data/vocab.json` carries only
the canonical form (よい). This is correct and expected:

| Whitelist form | vocab.json canonical | Multi-form entry in vocabulary_n5.md |
|---|---|---|
| いい | よい | `いい / よい - [i-adj] good` |
| いえ | うち | `いえ / うち - [n.] house, home` |
| ぐらい | くらい | `ぐらい / くらい - [part.] about` |
| けれど | けど | `けれど / けれども / けど - [conj.] but` |
| ござる | ございます | `ござる / ございます - [v1] to be (very polite)` |
| じゃあ | では | `じゃあ / では - [exp.] well then` |
| では | じゃ | `では / じゃ - [exp.] well then` |
| みんな | みな | `みんな / みな - [n.] everyone` |
| やはり | やっぱり | `やはり / やっぱり - [adv.] as expected` |
| ゼロ | れい | `ゼロ / れい - [num.] zero` |

### Recognition-only items (30 — pending vocab.json authoring)

These tokens appear in `vocabulary_n5.md` (extracted by build_data.py) and
are recognized as in-scope by `tools/lint_content.py`, but do not have full
structured `vocab.json` entries yet. They are valid N5 vocabulary that
learners may encounter in passages or reading material:

  いっぱい, おくれる, おしらせ, おじゃまします, おてら, おもちゃ,
  こうこうせい, さくら, じゅんび, ぜひ, ただ, ためる, たんご, はらう,
  べつべつ, アルバイト, カフェ, コンサート, コンビニ, スペイン人, セール,
  フロント, ベンチ, 倍, 出口, 国籍, 後, 聞こえる, 週末, 高校生

These will be promoted to full `vocab.json` entries (with example sentences
+ POS tags + section assignment) in a future authoring pass. Until then,
the whitelist's recognition-allowlist role keeps lint passes green.

## Why this is not "drift"

An audit that reports "X tokens in whitelist but not in vocab.json" is
finding a **deliberate superset relationship**, not a defect. The two
files have distinct roles:

  - vocab.json:  structured catalog (what the app teaches)
  - whitelist:    recognition allowlist (what the app accepts as in-scope)

The whitelist exists precisely so that the lint script can permit forms
that aren't (yet) full catalog entries. Trimming the whitelist to match
vocab.json would tighten the lint to false-positive on legitimate N5 forms
that happen to lack a full structured entry.

## Maintenance

  - **Adding a new word to N5 scope**: edit `vocabulary_n5.md`, then run
    `python tools/build_data.py` to regenerate `n5_vocab_whitelist.json`.
  - **Promoting a recognition-only item to a full catalog entry**: add the
    structured entry to `vocab.json` (form, reading, gloss, section, pos,
    examples). The whitelist already contains the form; no further action.
  - **Removing a deprecated form**: edit `vocabulary_n5.md` to remove the
    line, then re-run `tools/build_data.py`.

The whitelist is a **derived artifact** — never edit it by hand.
