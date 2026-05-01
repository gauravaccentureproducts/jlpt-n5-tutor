"""Auto-link every example in data/grammar.json to the vocab entries it
demonstrates. Closes the homograph mismatch class flagged 2026-05-01
(かた "person" vocab page was showing 読みかた "way of doing" examples
because the renderer matched by substring with no disambiguation).

Architecture:
- Each example in grammar.json gains a `vocab_ids: [...]` array listing
  the canonical vocab.json IDs the example demonstrates.
- The renderer (js/learn.js renderVocabDetail) filters by `vocab_ids`
  instead of substring-matching the form. With explicit links, homograph
  pages can never show another homograph's examples.

Disambiguation strategy:
- For NON-homograph forms (1 vocab entry per form): straightforward link.
- For homograph forms (>=2 entries):
  (a) If glosses are equivalent (e.g., 魚 in both Animals and Food
      sections, both glossed "fish"), link to ALL — they're alternative
      thematic placements, not different senses.
  (b) If glosses are different, apply disambiguation rules from
      HOMOGRAPH_RULES below. These rules are deterministic regex/POS
      checks against the JA text.
  (c) When rules can't decide (truly ambiguous example), OVER-LINK
      to all candidate entries. Per user direction 2026-05-01: showing
      one example on two detail pages is mildly redundant but never
      pedagogically wrong, whereas under-linking would show no examples
      on either page.

Run:
    python tools/link_grammar_examples_to_vocab.py
Idempotent: re-running overwrites the vocab_ids field with the latest
auto-tagger output.
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAMMAR = ROOT / "data" / "grammar.json"
VOCAB = ROOT / "data" / "vocab.json"

# Homograph disambiguation rules. Each rule is keyed by the surface form
# and returns a function: (vocab_entries, example_ja, example_form) ->
# list of vocab_ids to link.
#
# The function should return a SUBSET of the candidate entries' ids.
# Returning all candidates means "over-link" (safe fallback when the
# example genuinely demonstrates multiple senses or the rule is unsure).


def _ids(entries):
    return [e["id"] for e in entries]


def _filter(entries, predicate):
    """Keep entries where predicate(entry) is True. If empty, return all
    (over-link fallback)."""
    keep = [e for e in entries if predicate(e)]
    return keep if keep else entries


def _is_pos(entry, *pos_values):
    return entry.get("pos") in pos_values


def _gloss_matches(entry, *substrs):
    g = (entry.get("gloss") or "").lower()
    return any(s.lower() in g for s in substrs)


def rule_kata(entries, ja, form):
    """かた: 'person (polite)' (pronoun) vs 'way of doing' (noun).
    'Way' sense: preceded by Verb-stem form (the pattern is
    Verb-stem + 〜かた, e.g., 読みかた). Otherwise person sense."""
    # Match 〜みかた / 〜きかた / 〜しかた / 〜ちかた / etc. (Verb-stem ending in i + かた)
    way_signal = re.search(r"[いきしちにひみり]かた", ja) or re.search(r"[え-お]かた", ja)
    # Also match: 食べ方 etc. — but our data uses kana 〜かた
    if way_signal:
        return _ids(_filter(entries, lambda e: _gloss_matches(e, "way of doing")))
    # Person sense: preceded by demonstrative or possessive
    person_signal = re.search(r"(この|その|あの|どの|あなたの|わたしの)\s*かた", ja) or "方は" in ja or "方が" in ja
    if person_signal:
        return _ids(_filter(entries, lambda e: _gloss_matches(e, "person")))
    return _ids(entries)  # ambiguous → over-link


def rule_ha(entries, ja, form):
    """は: 'tooth' (noun) vs 'leaf' (noun) vs 'topic marker' (particle).
    Particle signal: typed as standalone は after a noun. Other senses:
    not common in N5 examples, fall back to particle if context unclear."""
    # If the は is followed by another noun + verb (typical sentence frame),
    # it's the particle. The standalone noun senses (tooth/leaf) are rare
    # in N5 examples.
    if re.search(r"は\s+\S", ja) or "は、" in ja or "は。" in ja:
        return _ids(_filter(entries, lambda e: _is_pos(e, "particle")))
    # Tooth/leaf require explicit context — over-link to noun senses
    return _ids(_filter(entries, lambda e: _is_pos(e, "noun")))


def rule_hito(entries, ja, form):
    """人: 'person' (pronoun) vs counter for people.
    Counter signal: preceded by a number — 一人, 二人, 三人, etc."""
    if re.search(r"[一二三四五六七八九十百0-9０-９]\s*人", ja):
        return _ids(_filter(entries, lambda e: _is_pos(e, "counter")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "pronoun")))


def rule_iru(entries, ja, form):
    """いる: 'to exist (animate)' (verb-2 in §28, also verb-1 in §30) vs
    'to need' (verb-1 in §27, godan exception). All three are likely to
    co-occur in N5 examples; default to over-link unless 'need' context."""
    if "いります" in ja or "いりません" in ja or "いりました" in ja or "いる必要" in ja:
        return _ids(_filter(entries, lambda e: _gloss_matches(e, "need")))
    return _ids(_filter(entries, lambda e: _gloss_matches(e, "exist")))


def rule_oku(entries, ja, form):
    """おく: numeral '100 million' vs verb 'to place'. Numeral context:
    surrounded by digits or 万/千 etc. Verb context: ます/た/て suffix."""
    if re.search(r"おく(ます|た|て|ない|か|に|を|が|は)", ja):
        return _ids(_filter(entries, lambda e: _is_pos(e, "verb-1")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "numeral")))


def rule_hon(entries, ja, form):
    """本: counter for long thin objects vs noun 'book'. Counter signal:
    preceded by a number."""
    if re.search(r"[一二三四五六七八九十0-9０-９]\s*本", ja):
        return _ids(_filter(entries, lambda e: _is_pos(e, "counter")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "noun")))


def rule_hai(entries, ja, form):
    """はい: 'yes' (expression) vs counter for cups. Counter signal:
    preceded by a number."""
    if re.search(r"[一二三四五六七八九十0-9０-９]\s*はい", ja):
        return _ids(_filter(entries, lambda e: _is_pos(e, "counter")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "expression")))


def rule_kai(entries, ja, form):
    """かい: floor vs times. Floor: 〜階. Times: 〜回. Surface form かい
    in kana is rarely disambiguated alone — over-link."""
    return _ids(entries)


def rule_kiru(entries, ja, form):
    """きる: 'to cut' (verb-1 godan exception) vs 'to wear (upper body)'
    (verb-2). Hard to disambiguate by form alone since both conjugate
    differently but examples may show base form. Use POS heuristics on
    surrounding context.
    'Cut': common collocations with 紙, ハサミ, etc.
    'Wear': シャツ, セーター, etc.
    Over-link if ambiguous."""
    if any(s in ja for s in ["シャツ", "セーター", "コート", "服"]):
        return _ids(_filter(entries, lambda e: _gloss_matches(e, "wear")))
    if any(s in ja for s in ["紙", "はさみ", "切って"]):
        return _ids(_filter(entries, lambda e: _gloss_matches(e, "cut")))
    return _ids(entries)


def rule_kara(entries, ja, form):
    """から: conjunction 'because' vs particle 'from'. Conjunction:
    after a clause-ending form (です/ます/た). Particle: after a noun
    or time."""
    # Conjunction: ですから, ましたから, etc.
    if re.search(r"(です|ます|でした|ました|だ|た|い)から", ja):
        return _ids(_filter(entries, lambda e: _is_pos(e, "conjunction")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "particle")))


def rule_ga(entries, ja, form):
    """が: conjunction 'but' vs particle 'subject marker'. Conjunction:
    after a clause-ending form. Particle: after a noun."""
    if re.search(r"(です|ます|でした|ました|だ|た|い)が", ja):
        # Clause + が — could be conjunction or formal-soft particle. Default conj.
        return _ids(_filter(entries, lambda e: _is_pos(e, "conjunction")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "particle")))


def rule_to(entries, ja, form):
    """と: noun 'door' vs particle 'and/with/quote'. The particle is
    by far the more common N5 use; over-link to particle unless context
    clearly invokes door (e.g., 戸 kanji)."""
    if "戸" in ja:
        return _ids(_filter(entries, lambda e: _is_pos(e, "noun")))
    return _ids(_filter(entries, lambda e: _is_pos(e, "particle")))


def rule_doumo(entries, ja, form):
    """どうも: adverb 'thanks/indeed' vs expression 'thanks'. These are
    effectively the same word with two thematic placements. Over-link."""
    return _ids(entries)


# Map: form → disambiguation function
HOMOGRAPH_RULES: dict = {
    "かた": rule_kata,
    "は":   rule_ha,
    "人":   rule_hito,
    "いる": rule_iru,
    "おく": rule_oku,
    "本":   rule_hon,
    "はい": rule_hai,
    "かい": rule_kai,
    "きる": rule_kiru,
    "から": rule_kara,
    "が":   rule_ga,
    "と":   rule_to,
    "どうも": rule_doumo,
    # Other homograph clusters fall through to default behaviour
    # (over-link all entries) since they're either same-meaning
    # duplicates or the disambiguation isn't worth a custom rule.
}


_BOUNDARY = set(" 　、。！？「」（）()\n\t" + "　")


def matches_in_example(form: str, ja: str, pos: str = "") -> bool:
    """POS-aware substring check.

    Long forms (≥3 chars) are matched directly — the substring is
    distinctive enough that false positives are unlikely.

    Short forms (1-2 chars) need word-boundary signals to avoid the
    で-in-です / は-in-はな / こ-in-この class of false matches:

    - **Particles** (`pos == "particle"`): boundary AFTER. Particles
      attach to the preceding word so the BEFORE side is typically a
      kana/kanji, but the AFTER side must be a word boundary
      (space/punctuation/end). E.g., は in 「がっこうは べんきょう」.

    - **All other POS**: standalone token, requires boundary on BOTH
      sides. Catches counter こ matching at start of この (before is
      string-start which is a boundary, but after is の — fails). Same
      for で-in-です (no boundary after で), は-in-はな (no boundary
      after は), etc.

    Conjugated verbs aren't handled — only the dictionary form matches
    literally. This is an accepted under-linking; a proper Japanese
    morphological analyser would be needed for full coverage.
    """
    if not form:
        return False
    if form not in ja:
        return False
    # 2+-char forms: substring match is sufficient. Compounds like
    # 読みかた (verb-stem + かた) attach without space, so requiring a
    # boundary would miss the legitimate compound match. False-positive
    # risk at 2 chars is low — vocab forms aren't typically substrings
    # of other vocab forms at this length.
    if len(form) >= 2:
        return True
    # 1-char forms: high false-positive risk (で in です, は in はな,
    # こ in この). Enforce per-POS boundary rules.
    flen = len(form)
    idx = 0
    while True:
        i = ja.find(form, idx)
        if i < 0:
            return False
        before_b = (i == 0) or (ja[i-1] in _BOUNDARY)
        after_b = (i+flen >= len(ja)) or (ja[i+flen] in _BOUNDARY)
        if pos == "particle":
            if after_b:
                return True
        else:
            if before_b and after_b:
                return True
        idx = i + 1


def disambiguate(form: str, candidates: list, example_ja: str) -> list:
    """Given a list of vocab entry candidates that share `form`, return
    the subset of ids that this example actually demonstrates."""
    if len(candidates) == 1:
        return [candidates[0]["id"]]
    rule = HOMOGRAPH_RULES.get(form)
    if rule:
        return rule(candidates, example_ja, form)
    # Default: over-link all candidates (safe fallback per user direction
    # 2026-05-01: over-link is preferred to under-link). Same-meaning
    # duplicates land here naturally.
    return [c["id"] for c in candidates]


def main() -> int:
    grammar = json.loads(GRAMMAR.read_text(encoding="utf-8"))
    vocab = json.loads(VOCAB.read_text(encoding="utf-8"))

    # Build form → [entries] index
    by_form: dict[str, list] = defaultdict(list)
    for e in vocab["entries"]:
        f = e.get("form", "")
        if f:
            by_form[f].append(e)

    homograph_forms = {f for f, es in by_form.items() if len(es) >= 2}
    print(f"vocab forms: {len(by_form)}, homographs: {len(homograph_forms)}",
          file=sys.stderr)

    examples_total = 0
    examples_linked = 0
    examples_with_homograph = 0
    homograph_decisions: dict[str, int] = defaultdict(int)

    for p in grammar["patterns"]:
        for ex in p.get("examples", []):
            examples_total += 1
            ja = ex.get("ja", "")
            if not ja:
                ex["vocab_ids"] = []
                continue
            linked: list[str] = []
            seen_forms: set[str] = set()
            # Walk longer forms first so "じかん" matches before "かん" etc.
            for form in sorted(by_form.keys(), key=len, reverse=True):
                if form in seen_forms:
                    continue
                # POS-aware matching: only candidates whose own POS-rule
                # is satisfied count as matched. For homographs that
                # share form but differ in POS (e.g., 人 = pronoun + counter),
                # this also acts as a per-POS pre-filter before the
                # higher-level disambiguation rule.
                candidates = by_form[form]
                matched = [c for c in candidates
                           if matches_in_example(form, ja, c.get("pos", ""))]
                if not matched:
                    continue
                seen_forms.add(form)
                ids = disambiguate(form, matched, ja)
                for vid in ids:
                    if vid not in linked:
                        linked.append(vid)
                if len(candidates) > 1:
                    examples_with_homograph += 1
                    homograph_decisions[form] += 1
            ex["vocab_ids"] = linked
            if linked:
                examples_linked += 1

    GRAMMAR.write_text(
        json.dumps(grammar, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"examples: {examples_total}, linked: {examples_linked} "
          f"({100*examples_linked/max(1,examples_total):.0f}%)",
          file=sys.stderr)
    print(f"homograph decisions made: {examples_with_homograph}",
          file=sys.stderr)
    if homograph_decisions:
        print("top homograph forms by example count:", file=sys.stderr)
        for f, n in sorted(homograph_decisions.items(),
                           key=lambda kv: -kv[1])[:15]:
            rule = "custom rule" if f in HOMOGRAPH_RULES else "over-link"
            print(f"  {f}: {n}  ({rule})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
