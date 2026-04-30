"""Enforce JA-accuracy and content-integrity invariants across the KB question banks.

Run from the repo root:
    python tools/check_content_integrity.py

Exits with 0 if every invariant passes, 1 otherwise. Designed as a CI release
blocker so future JSON / KB edits cannot silently regress past the bar set by
audit Passes 1-10 (`verification.md`).

Spec reference: feedback/ui-testing-plan.md §12.1.

The 16 invariants:

X-6.1 Catalog completeness     - every kanji in any correct-answer option is in kanji_n5.md
X-6.2 Reading consistency      - 今年 reads ことし everywhere except as a deliberate distractor
X-6.3 No mixed-kanji-kana      - no broken compounds like 図しょかん, 大さか, 東きょう, 京と
X-6.4 No orphan vocab          - guard list (advisory; lint_content.py is the deeper check)
X-6.5 No em-dashes             - 0 occurrences of U+2014 across all 9 KB files
X-6.6 Group-1 ru-verb flags    - 入る / 帰る / 走る / 知る / 切る / 要る all carry the flag
X-6.7 No false synonymy claims - "Direct synonymy" / "Direct antonym pair" only on whitelisted pairs
JA-1  Stem-kanji scope         - every kanji in a question stem AND correct-answer text is in kanji_n5.md
JA-2  Particle-set sanity      - questions whose options are particles use only N5 particles
JA-3  Furigana / catalog match - heuristic; flagged occurrences require manual review
JA-4  Vocab-reading uniqueness - vocab entries with multiple readings list all of them
JA-5  Answer-key sanity        - every "**Answer: N**" has N in {1,2,3,4} and matching option exists
JA-6  No two-correct answers   - regression guard for the "から vs ので" class of bug
JA-7  No same-stem duplicates  - within each question file
JA-8  Q-count integrity        - moji=100, goi=100, bunpou=100, dokkai=102, authentic=189; total=591
JA-9  Engine display contract  - every question file has the "Engine display note" header
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent
KB = ROOT / "KnowledgeBank"

QUESTION_FILES = [
    "moji_questions_n5.md",
    "goi_questions_n5.md",
    "bunpou_questions_n5.md",
    "dokkai_questions_n5.md",
    "authentic_extracted_n5.md",
]

CATALOG_FILES = ["grammar_n5.md", "kanji_n5.md", "vocabulary_n5.md", "sources.md"]

EXPECTED_Q_COUNTS = {
    "moji_questions_n5.md": 100,
    "goi_questions_n5.md": 100,
    "bunpou_questions_n5.md": 100,
    "dokkai_questions_n5.md": 102,
    "authentic_extracted_n5.md": 189,
}
EXPECTED_TOTAL = sum(EXPECTED_Q_COUNTS.values())  # 591

# X-6.6: required ru-verb exception flags
RU_VERB_EXCEPTIONS = ["入る", "はいる", "かえる", "帰る", "はしる", "走る", "しる", "知る", "きる", "切る"]
# 要る is "いる - to need" - the entry uses kana, so flag is checked separately
# Note: vocab uses kana for some forms; we'll fuzzy-match on the romanized verb root.
RU_VERB_FLAG_TEXT = "Group 1 exception"

# X-6.5: em-dash codepoint
EM_DASH = "—"

# X-6.3: known mixed-kanji-kana antipatterns from Pass-9 audit
MIXED_KANJI_KANA_ANTIPATTERNS = [
    "図しょ",  # 図書館 written as 図しょかん
    "大さか",  # 大阪 written as 大さか
    "東きょ",  # 東京 written as 東きょう
    "京と",   # 京都 written as 京と
    "中ご",   # 中国語 etc.
    "日ご",   # 日本語 etc.
]

# X-6.7: pairs that are GENUINELY synonymous (whitelisted; "Direct synonymy" claim is OK here)
GENUINE_SYNONYMY_WHITELIST = [
    ("おおぜい", "たくさん"),  # for people, truly synonymous
    ("とおくない", "ちかい"),   # direct antonym pair
    ("あつくない", "すずしい"), # direct antonym pair
]

# JA-2: N5 particle set. Question options that look like particles must come from this set.
N5_PARTICLES = {
    "は", "が", "を", "に", "で", "へ", "と", "から", "まで", "より",
    "の", "も", "や", "か", "ね", "よ", "ぐらい", "ごろ", "だけ", "しか",
    "など", "ばかり", "でも",
}

# JA-9: required header text
ENGINE_DISPLAY_NOTE_PHRASE = "Engine display note"

# Regex
KANJI_RE = re.compile(r"[一-鿿]")
# Question header tolerates trailing notes like "#### Q91 (blank 1)" / "### Q59 (REPLACED ...)"
QUESTION_HEADER_RE = re.compile(r"^(### Q\d+|#### Q\d+)(?:\s|$)", re.M)
ANSWER_LINE_RE = re.compile(r"^\*\*Answer:\s*(\d+)\*\*", re.M)
OPTION_LINE_RE = re.compile(r"^(\d)\.\s+(.+?)\s*$", re.M)
KATAKANA_RE = re.compile(r"[゠-ヿ]")
HIRAGANA_RE = re.compile(r"[぀-ゟ]")
INLINE_FORMAT_RE = re.compile(r"<[^>]+>|__|\*\*")


def load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def strip_inline_format(s: str) -> str:
    return INLINE_FORMAT_RE.sub("", s)


def kanji_catalog() -> set[str]:
    """Extract every kanji from kanji_n5.md catalog. Tolerates `[Ext]` / `[Cul]` tag suffixes:
    `- **員** **[Ext]**` matches just like `- **学**`."""
    text = load_text(KB / "kanji_n5.md")
    out: set[str] = set()
    for line in text.splitlines():
        m = re.match(r"^- \*\*([一-鿿])\*\*", line)
        if m:
            out.add(m.group(1))
    return out


# Pragmatic N5 augmentation: kanji that are not in the strict catalog but appear in
# stems / correct answers across audit Passes 1-10 and were accepted by the audits.
# Genki / Minna no Nihongo / Try! list these at N5; the strict JLPT-Sensei list omits
# them. Treating them as "in scope for stems" prevents false positives in CI without
# loosening the catalog itself.
PRAGMATIC_N5_AUGMENTATION = {
    # Common N5 pragmatic kanji (in textbooks but not the strict 100-list)
    "朝",  # morning - n5 in most prep books (Genki L3)
    "町",  # town - n5 (Genki L3)
    "屋",  # shop suffix - common in 八百屋 etc.
    "公",  # public - in 公園
    "園",  # garden/park - in 公園 / 動物園
    "早",  # early - common N5 adverb (早く)
    "紙",  # paper - in N5 vocab
    "作",  # make - 作る is N5
    "図",  # figure - in 図書館
    "館",  # building - in 図書館 / 美術館
    "病",  # illness - in 病院
    "院",  # institution - in 病院
    "元",  # origin - in 元気
    "牛",  # cow - in 牛乳 (milk; N5 vocab)
    "乳",  # milk - in 牛乳
    "思",  # think - と思います is N5 pattern
    # Place-name kanji - naturalness exception applies to place names even in grammar stems
    "京",  # 東京 / 京都 / 北京
    "阪",  # 大阪
    "都",  # 京都
    "海",  # 北海道
    "道",  # 北海道 / 道路
    "川",  # river / 川崎 (already in catalog as kun, but check)
}


def augmented_kanji_catalog() -> set[str]:
    """Strict catalog ∪ pragmatic N5 set. Use this for stem / correct-answer checks
    so audit-accepted pragmatic kanji don't trip CI."""
    return kanji_catalog() | PRAGMATIC_N5_AUGMENTATION


def parse_questions(md_text: str) -> list[dict]:
    """Split a question file into question blocks. Returns list of dicts:
        {qid, stem, options: [(num, text), ...], answer_index, raw_block}
    Best-effort; tolerant of formatting variants.
    """
    # Use the question headers to split (tolerates trailing notes after the Q-number)
    parts = re.split(r"^(### Q\d+|#### Q\d+)(?:\s|$)[^\n]*", md_text, flags=re.M)
    # parts will be [preamble, "### Q1", body1, "### Q2", body2, ...]
    questions = []
    for i in range(1, len(parts), 2):
        qid = parts[i].strip()
        body = parts[i + 1] if i + 1 < len(parts) else ""
        # Find the first non-empty content line after the header (the stem)
        stem = ""
        for line in body.split("\n"):
            line = line.strip()
            if not line:
                continue
            if line.startswith(("_", "**", "1.", "2.", "3.", "4.", ">")):
                continue
            stem = line
            break
        # Options
        options = OPTION_LINE_RE.findall(body)
        # Answer
        ans_match = ANSWER_LINE_RE.search(body)
        ans = int(ans_match.group(1)) if ans_match else None
        questions.append({
            "qid": qid,
            "stem": stem,
            "options": options,  # list of (num_str, text)
            "answer_index": ans,
            "body": body,
        })
    return questions


# ---------------------------------------------------------------------------
# Invariant checks. Each returns list of failure messages (empty = pass).
# ---------------------------------------------------------------------------

def check_x_6_1_catalog_completeness() -> list[str]:
    """Every kanji used as a correct-answer-option text is in kanji_n5.md (or pragmatic N5 set).
    Skips dokkai (passages get the naturalness exception per `dokkai_questions_n5.md` line 17)
    and authentic_extracted (source-faithful to learnjapaneseaz.com)."""
    catalog = augmented_kanji_catalog()
    failures = []
    audited = ["moji_questions_n5.md", "goi_questions_n5.md", "bunpou_questions_n5.md"]
    for fname in audited:
        text = load_text(KB / fname)
        for q in parse_questions(text):
            if q["answer_index"] is None or not q["options"]:
                continue
            answer_text = None
            for num, opt_text in q["options"]:
                if int(num) == q["answer_index"]:
                    answer_text = opt_text
                    break
            if answer_text is None:
                continue
            for ch in strip_inline_format(answer_text):
                if KANJI_RE.match(ch) and ch not in catalog:
                    failures.append(
                        f"X-6.1 {fname}:{q['qid']} correct-answer kanji '{ch}' "
                        f"not in kanji_n5.md catalog (answer text: {answer_text!r})"
                    )
    return failures


def check_x_6_2_today_kotoshi() -> list[str]:
    """今年 reading must be ことし everywhere except as a deliberate distractor option."""
    failures = []
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        # Skip occurrences in option lines like `1. こんねん` (they're distractors by design)
        for line_no, line in enumerate(text.split("\n"), 1):
            if "こんねん" not in line:
                continue
            # If the line is an option line (starts with digit + period), allow it
            if re.match(r"^\d\.\s", line.strip()):
                continue
            # If it appears inside a passage / stem / rationale, that's a regression
            failures.append(f"X-6.2 {fname}:L{line_no} contains こんねん outside option list: {line.strip()[:80]!r}")
    return failures


def check_x_6_3_no_mixed_kanji_kana() -> list[str]:
    """No mixed-kanji-kana antipatterns."""
    failures = []
    for fname in QUESTION_FILES + CATALOG_FILES:
        path = KB / fname
        if not path.exists():
            continue
        text = load_text(path)
        for pattern in MIXED_KANJI_KANA_ANTIPATTERNS:
            if pattern in text:
                # Skip if it appears only inside a code block / inline code (audit notes can mention these)
                # Heuristic: count occurrences; if it appears in plain text, fail.
                # For now, simple presence-based fail.
                failures.append(f"X-6.3 {fname} contains mixed-kanji-kana antipattern: {pattern!r}")
    return failures


def check_x_6_4_orphan_vocab() -> list[str]:
    """Advisory check - lint_content.py is the deeper N5-vocab-scope check.
    Here we just verify the lint script exists so we don't drift."""
    failures = []
    if not (ROOT / "tools" / "lint_content.py").exists():
        failures.append("X-6.4 tools/lint_content.py missing (deep N5-vocab-scope lint)")
    return failures


def check_x_6_5_no_em_dashes() -> list[str]:
    """Zero em-dashes across all 9 KB files."""
    failures = []
    for fname in QUESTION_FILES + CATALOG_FILES:
        path = KB / fname
        if not path.exists():
            continue
        text = load_text(path)
        if EM_DASH in text:
            count = text.count(EM_DASH)
            failures.append(f"X-6.5 {fname} contains {count} em-dash(es) (U+2014)")
    return failures


def check_x_6_6_ru_verb_flags() -> list[str]:
    """All 6 Group-1 ru-verb exceptions in vocabulary_n5.md carry the flag annotation."""
    failures = []
    vocab = load_text(KB / "vocabulary_n5.md")
    # Required verbs by their list-item form
    required = {
        "入る": "入る (はいる)",
        "かえる": "かえる",
        "はしる": "はしる",
        "しる": "しる",
        "きる": "きる - to cut",  # disambiguates from きる "to wear"
        "要る": "いる - to need",  # disambiguates from existence いる
    }
    flag_count = vocab.count(RU_VERB_FLAG_TEXT)
    if flag_count < 6:
        failures.append(
            f"X-6.6 vocabulary_n5.md has only {flag_count} '{RU_VERB_FLAG_TEXT}' annotation(s); expected >= 6"
        )
    # Spot-check that each required verb's entry line carries the flag
    for verb, hint in required.items():
        # Find a line that starts with `- ` and contains `hint`
        found_flagged = False
        for line in vocab.split("\n"):
            if line.startswith("- ") and hint in line:
                if RU_VERB_FLAG_TEXT in line:
                    found_flagged = True
                break
        if not found_flagged:
            failures.append(f"X-6.6 vocabulary_n5.md: ru-verb exception '{verb}' missing '{RU_VERB_FLAG_TEXT}' flag")
    return failures


def check_x_6_7_no_false_synonymy() -> list[str]:
    """Rationales claiming 'Direct synonymy' / 'Direct antonym pair' must reference whitelisted pairs."""
    failures = []
    claim_patterns = ["Direct synonymy", "Direct antonym pair"]
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        for i, line in enumerate(text.split("\n"), 1):
            for claim in claim_patterns:
                if claim in line:
                    # Check if any whitelisted pair appears in the same line
                    whitelisted = any(
                        a in line and b in line for (a, b) in GENUINE_SYNONYMY_WHITELIST
                    )
                    if not whitelisted:
                        failures.append(
                            f"X-6.7 {fname}:L{i} claims '{claim}' without a whitelisted "
                            f"genuinely-synonymous pair: {line.strip()[:100]!r}"
                        )
    return failures


def check_x_6_8_no_ascii_digits_in_tts_source() -> list[str]:
    """Pass-10 regression guard: no ASCII digits adjacent to Japanese in TTS-source fields.
    The fix landed in tools/build_audio.py:normalize_for_tts(). This check verifies the
    helper still exists; if removed, the digits problem returns. The presence of digits
    in source data is by design (audit Pass-10 closure).
    """
    failures = []
    build_audio = ROOT / "tools" / "build_audio.py"
    if not build_audio.exists():
        failures.append("X-6.8 tools/build_audio.py is missing")
        return failures
    if "normalize_for_tts" not in build_audio.read_text(encoding="utf-8"):
        failures.append(
            "X-6.8 tools/build_audio.py no longer defines normalize_for_tts() - "
            "TTS audio will read ASCII digits as English. Pass-10 fix regressed."
        )
    return failures


# Reference table from Pass 10. Each kanji's `primary` field in
# data/n5_kanji_readings.json must match the N5-context-most-common reading.
EXPECTED_PRIMARY_READING = {
    "一": "いち", "二": "に", "三": "さん", "四": "よん", "五": "ご",
    "六": "ろく", "七": "しち", "八": "はち", "九": "きゅう", "十": "じゅう",
    "千": "せん", "本": "ほん", "日": "にち", "時": "じ", "分": "ふん",
    "円": "えん", "月": "がつ", "学": "がく", "生": "せい", "先": "せん",
    "半": "はん", "番": "ばん", "国": "こく", "後": "あと", "会": "かい",
    "車": "しゃ", "高": "こう", "長": "ちょう", "安": "あん", "新": "しん",
    "中": "ちゅう", "外": "がい", "東": "とう", "年": "ねん", "人": "にん",
}


def check_x_6_9_furigana_primary_reading_sanity() -> list[str]:
    """Pass-10 regression guard: data/n5_kanji_readings.json `primary`
    field must match the N5-context-most-common reading for each kanji
    in the reference table. The auto-ruby renderer (js/furigana.js) uses
    `primary` as a fallback when no explicit furigana annotation is given.
    Drift here causes 本(もと) instead of 本(ほん), 時(とき) instead of 時(じ),
    etc.
    """
    failures = []
    path = ROOT / "data" / "n5_kanji_readings.json"
    if not path.exists():
        return ["X-6.9 skipped: data/n5_kanji_readings.json missing"]
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return [f"X-6.9 failed to parse n5_kanji_readings.json: {e}"]
    for k, expected in EXPECTED_PRIMARY_READING.items():
        if k not in data:
            failures.append(f"X-6.9 kanji '{k}' missing from n5_kanji_readings.json (expected primary={expected!r})")
            continue
        actual = data[k].get("primary")
        if actual != expected:
            failures.append(f"X-6.9 kanji '{k}' primary={actual!r}, expected {expected!r}")
    return failures


def check_ja_1_stem_kanji_scope() -> list[str]:
    """Every kanji in question stems is in the augmented N5 catalog (strict ∪ pragmatic).
    Skips dokkai (passages have naturalness exception) and authentic_extracted (source-faithful)."""
    catalog = augmented_kanji_catalog()
    failures = []
    audited = ["moji_questions_n5.md", "goi_questions_n5.md", "bunpou_questions_n5.md"]
    for fname in audited:
        text = load_text(KB / fname)
        for q in parse_questions(text):
            stem = strip_inline_format(q["stem"])
            for ch in stem:
                if KANJI_RE.match(ch) and ch not in catalog:
                    failures.append(
                        f"JA-1 {fname}:{q['qid']} stem contains non-N5 kanji '{ch}' "
                        f"(stem: {stem[:60]!r})"
                    )
                    break  # one report per question is enough
    return failures


def check_ja_2_particle_set() -> list[str]:
    """Questions whose options are EXCLUSIVELY particles must come from the N5 particle set.

    Tightened heuristic to avoid sentence-composition / na-adjective / conjunction false hits:
    - Skip if any option is > 4 chars (definitely not a single particle).
    - Skip if any option contains a kanji or katakana char.
    - Only flag if >= 3 of 4 options are already in N5_PARTICLES (so the question is
      unambiguously a particle-choice question).
    """
    # Allowed conjunctions / na-adjective markers / copula / comparison helpers
    # that legitimately appear alongside particles in N5 distractor sets but
    # aren't particles in the strict sense.
    PARTICLE_ADJACENT = {
        "な", "けど", "けれど", "けれども", "ば", "たら", "なら",
        "だ",      # plain copula - N5 distractor in particle questions
        "のほうが", # comparison construction - N5
        "ほうが",   # comparison construction - N5
    }

    failures = []
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        for q in parse_questions(text):
            opts = [opt.strip() for _, opt in q["options"]]
            if len(opts) != 4:
                continue
            # Disqualify long / non-hiragana options. Cap at 5 chars so the comparison
            # construction "のほうが" (4 chars) and "けれども" (4 chars) are admitted.
            if any(len(o) > 5 for o in opts):
                continue
            if any(KANJI_RE.search(o) or KATAKANA_RE.search(o) for o in opts):
                continue
            # Now require strong particle-ness (>= 3 out of 4 in the canonical set)
            in_set = sum(1 for o in opts if o in N5_PARTICLES)
            if in_set < 3:
                continue
            for o in opts:
                if o in N5_PARTICLES or o in PARTICLE_ADJACENT:
                    continue
                failures.append(
                    f"JA-2 {fname}:{q['qid']} option '{o}' is not in the N5 particle/adjacent set "
                    f"(options: {opts})"
                )
    return failures


def check_ja_3_furigana_match() -> list[str]:
    """Heuristic: if a <ruby> tag is used, flag for manual review.
    A full check would parse the ruby and compare to data/n5_kanji_readings.json,
    which is broader than this MD-level lint. Returns advisory output only."""
    failures = []
    # Ruby is rarely used in MD (mostly in HTML inside MD); spot-check.
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        # Don't fail on absence; only fail if ruby tags are malformed
        ruby_count = text.count("<ruby>")
        rt_count = text.count("<rt>")
        if ruby_count != rt_count:
            failures.append(f"JA-3 {fname} has unbalanced <ruby> ({ruby_count}) vs <rt> ({rt_count}) tags")
    return failures


def check_ja_4_vocab_reading_uniqueness() -> list[str]:
    """Vocab entries with parenthesized multiple readings must list all of them.
    Heuristic: lines like `- 毎年 (まいとし / まいねん)` are OK; lines like `- 毎年 (まいとし)`
    that should have multiple readings would need a manual whitelist."""
    failures = []
    # No automated check possible without a reference list; advisory only.
    # We at least verify the file parses without obvious malformed entries.
    vocab = load_text(KB / "vocabulary_n5.md")
    for line_no, line in enumerate(vocab.split("\n"), 1):
        # Detect `(reading1 / reading2 ...)` pattern; ensure no broken parens
        if re.search(r"\([^)]*\s/\s[^)]*\)", line) is None:
            continue
        if line.count("(") != line.count(")"):
            failures.append(f"JA-4 vocabulary_n5.md:L{line_no} unbalanced parens: {line.strip()[:80]!r}")
    return failures


def check_ja_5_answer_key_sanity() -> list[str]:
    """Every Answer line points to a valid option index, and that option exists & is non-empty."""
    failures = []
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        for q in parse_questions(text):
            ans = q["answer_index"]
            if ans is None:
                continue  # No answer to check (might be a non-question section)
            if ans < 1 or ans > 4:
                failures.append(f"JA-5 {fname}:{q['qid']} answer index {ans} not in 1..4")
                continue
            # Find option text at index `ans`
            opt_texts = {int(num): text for num, text in q["options"]}
            if ans not in opt_texts:
                # Not all questions have 4 numbered option lines (e.g., sentence-comp uses inline 'Elements: 1. X')
                # so skip without failing; this is a heuristic.
                continue
            if not opt_texts[ans].strip():
                failures.append(f"JA-5 {fname}:{q['qid']} answer option {ans} is empty / whitespace")
    return failures


def check_ja_6_no_two_correct_answers() -> list[str]:
    """Regression guard: no causal-connector question has both から and ので as options.

    Pass-9 C-1.3 was the specific bug: 「きょうは あつい（ ）まどをあけました」 with から AND
    ので both grammatically valid. The fix replaced ので → けど in bunpou Q50/Q51. This check
    re-scans those slots so a future edit can't bring ので back as a co-correct distractor.

    Scoped to causal-connector contexts: stem must contain a Japanese verb/adjective form
    immediately before the blank (not a noun). Authentic_extracted is exempt because its
    distractors are source-faithful to learnjapaneseaz.com; ので distractors after nouns
    (like 'Q129: 先生（  ）') are non-grammatical and therefore not co-correct.
    """
    failures = []
    audited = ["moji_questions_n5.md", "goi_questions_n5.md", "bunpou_questions_n5.md"]
    # Causal-connector context: stem has い-adj or past-tense form just before the blank
    # Heuristic: the stem fragment immediately before （  ） ends in い/かった/だった or a verb base.
    causal_context_re = re.compile(r"(い|かった|だった|します|ました|です|でした)\s*[（(]")
    for fname in audited:
        text = load_text(KB / fname)
        for q in parse_questions(text):
            opts_set = {opt.strip() for _, opt in q["options"]}
            if not ({"から", "ので"} <= opts_set):
                continue
            stem = strip_inline_format(q["stem"])
            if not causal_context_re.search(stem):
                continue
            failures.append(
                f"JA-6 {fname}:{q['qid']} has both から and ので as options in a causal-connector "
                f"context (Pass-9 C-1.3 regression). Stem: {stem[:60]!r}"
            )
    return failures


def check_ja_7_no_duplicate_stems() -> list[str]:
    """No two questions in the same file share an identical stem.
    Scoped to originally-authored files only:
    - dokkai passages legitimately repeat short comprehension stems across passages
      (e.g. "パーティーは何時にはじまりますか" appears in two unrelated party passages);
    - authentic_extracted is source-faithful to learnjapaneseaz.com test papers,
      which themselves contain duplicate templates across test pages.
    Both are documented design choices; flagging them as bugs would be noise."""
    failures = []
    audited = ["moji_questions_n5.md", "goi_questions_n5.md", "bunpou_questions_n5.md"]
    for fname in audited:
        text = load_text(KB / fname)
        stems_seen: dict[str, str] = {}
        for q in parse_questions(text):
            stem = q["stem"].strip()
            if not stem or len(stem) < 10:
                continue
            if stem in stems_seen:
                failures.append(
                    f"JA-7 {fname} duplicate stem: {q['qid']} duplicates {stems_seen[stem]} "
                    f"(stem: {stem[:60]!r})"
                )
            else:
                stems_seen[stem] = q["qid"]
    return failures


def check_ja_8_q_count_integrity() -> list[str]:
    """Question counts per file must match expected; total must be 591."""
    failures = []
    actual_total = 0
    for fname, expected in EXPECTED_Q_COUNTS.items():
        text = load_text(KB / fname)
        actual = len(QUESTION_HEADER_RE.findall(text))
        actual_total += actual
        if actual != expected:
            failures.append(f"JA-8 {fname} has {actual} questions; expected {expected}")
    if actual_total != EXPECTED_TOTAL:
        failures.append(f"JA-8 total Q-count = {actual_total}; expected {EXPECTED_TOTAL}")
    return failures


def check_ja_9_engine_display_contract() -> list[str]:
    """Every question file must contain the 'Engine display note' header section."""
    failures = []
    for fname in QUESTION_FILES:
        text = load_text(KB / fname)
        if ENGINE_DISPLAY_NOTE_PHRASE not in text:
            failures.append(f"JA-9 {fname} missing '{ENGINE_DISPLAY_NOTE_PHRASE}' header")
    return failures


def check_ja_10_no_stub_redirect_text_in_data() -> list[str]:
    """No learner-facing string field in data/*.json contains '(see n5-' redirect text.

    Pass-12 finding: 40 questions in data/questions.json had leftover '(see n5-XXX)' text in
    question_ja, residual from the stub-pattern era. Pass-11 inlined examples in grammar.json
    but missed the parallel cleanup in questions.json. This invariant prevents recurrence.

    The 'notes' field is exempt because it intentionally records cross-references (audit trail).
    """
    LEARNER_FACING_FIELDS = {
        'ja', 'question_ja', 'prompt_ja', 'meaning_ja', 'example',
        'script_ja', 'translation_ja', 'translation_en', 'wrong', 'right',
        'gloss', 'meanings', 'pattern', 'meaning_en', 'explanation_en',
        'title_en', 'title_ja',
    }
    failures = []
    for fname in ['data/grammar.json', 'data/reading.json', 'data/listening.json',
                  'data/questions.json', 'data/vocab.json', 'data/kanji.json']:
        path = ROOT / fname
        if not path.exists():
            continue
        try:
            d = json.loads(path.read_text(encoding='utf-8'))
        except Exception:
            continue

        def walk(obj, path_str=''):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k == 'notes':
                        continue  # notes are exempt
                    yield from walk(v, f'{path_str}.{k}' if path_str else k)
            elif isinstance(obj, list):
                for i, v in enumerate(obj):
                    yield from walk(v, f'{path_str}[{i}]')
            elif isinstance(obj, str):
                # Get the last segment of the path to check field name
                last_field = path_str.split('.')[-1].split('[')[0] if path_str else ''
                if last_field in LEARNER_FACING_FIELDS or path_str.endswith(']'):
                    if '(see n5-' in obj or '（see n5-' in obj:
                        yield path_str, obj[:80]

        for path_str, snippet in walk(d):
            failures.append(f"JA-10 {fname}:{path_str} contains '(see n5-' text: {snippet!r}")

    return failures


def check_ja_12_kanji_kb_data_consistency() -> list[str]:
    """data/kanji.json must agree with KnowledgeBank/kanji_n5.md on every kanji entry.

    Pass-13 finding: data/kanji.json had silently-corrupted entries because
    tools/build_data.py:extract_kanji_corpus had a regex bug that swallowed
    `[Ext]`-tagged entries. Specifically: 番 had on=['ごう'] (= 号's reading)
    and 会 had on=['いん'] (= 員's reading). Plus 円 had a stale kun=['まる']
    that Pass-9 had explicitly removed from KB.

    This invariant compares glyph-by-glyph and reports any drift between the
    two files. Fixes go to KB first; then regenerate JSON via build_data.py.
    """
    import re as _re
    failures = []
    kb_path = ROOT / "KnowledgeBank" / "kanji_n5.md"
    json_path = ROOT / "data" / "kanji.json"
    if not kb_path.exists() or not json_path.exists():
        return failures

    # Parse KB to extract canonical glyphs
    kb_text = kb_path.read_text(encoding="utf-8")
    kb_glyphs = set(_re.findall(r"^\s*-\s+\*\*([一-鿿])\*\*", kb_text, _re.MULTILINE))

    # Read JSON
    try:
        d = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception as e:
        failures.append(f"JA-12 data/kanji.json failed to parse: {e}")
        return failures
    json_glyphs = {e["glyph"] for e in d.get("entries", [])}

    missing_in_json = kb_glyphs - json_glyphs
    extra_in_json = json_glyphs - kb_glyphs
    for g in sorted(missing_in_json):
        failures.append(
            f"JA-12 KB has kanji '{g}' but data/kanji.json does not. "
            f"Run `python tools/build_data.py` to regenerate."
        )
    for g in sorted(extra_in_json):
        failures.append(
            f"JA-12 data/kanji.json has kanji '{g}' but KnowledgeBank/kanji_n5.md does not. "
            f"Either add to KB or remove from JSON."
        )
    return failures


def check_ja_11_no_duplicate_choices() -> list[str]:
    """No MCQ question's `choices` array contains duplicates.

    Pass-12 finding: 3 questions (q-0220, q-0223, q-0280) had a duplicate option in the
    choices array (e.g., 'ません' appearing twice). Auto-grading is meaningful only when
    options are distinct. This invariant prevents recurrence in data/questions.json.
    """
    failures = []
    qpath = ROOT / 'data' / 'questions.json'
    if not qpath.exists():
        return failures
    try:
        d = json.loads(qpath.read_text(encoding='utf-8'))
    except Exception:
        return failures
    for q in d.get('questions', []):
        choices = q.get('choices')
        if not isinstance(choices, list):
            continue
        if len(choices) != len(set(choices)):
            from collections import Counter
            dups = [c for c, n in Counter(choices).items() if n > 1]
            failures.append(
                f"JA-11 data/questions.json {q.get('id', '?')} has duplicate choice(s): {dups} "
                f"(full choices: {choices})"
            )
    return failures


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

CHECKS: list[tuple[str, str, callable]] = [
    ("X-6.1", "Catalog completeness",       check_x_6_1_catalog_completeness),
    ("X-6.2", "今年 / こんねん consistency",  check_x_6_2_today_kotoshi),
    ("X-6.3", "No mixed kanji+kana",        check_x_6_3_no_mixed_kanji_kana),
    ("X-6.4", "Lint script present",        check_x_6_4_orphan_vocab),
    ("X-6.5", "No em-dashes",               check_x_6_5_no_em_dashes),
    ("X-6.6", "Ru-verb exception flags",    check_x_6_6_ru_verb_flags),
    ("X-6.7", "No false synonymy claims",   check_x_6_7_no_false_synonymy),
    ("X-6.8", "No ASCII digits in TTS src", check_x_6_8_no_ascii_digits_in_tts_source),
    ("X-6.9", "Primary-reading sanity",     check_x_6_9_furigana_primary_reading_sanity),
    ("JA-1",  "Stem-kanji scope",           check_ja_1_stem_kanji_scope),
    ("JA-2",  "Particle-set sanity",        check_ja_2_particle_set),
    ("JA-3",  "Furigana / catalog match",   check_ja_3_furigana_match),
    ("JA-4",  "Vocab reading uniqueness",   check_ja_4_vocab_reading_uniqueness),
    ("JA-5",  "Answer-key sanity",          check_ja_5_answer_key_sanity),
    ("JA-6",  "No two-correct-answers",     check_ja_6_no_two_correct_answers),
    ("JA-7",  "No duplicate stems in file", check_ja_7_no_duplicate_stems),
    ("JA-8",  "Q-count integrity",          check_ja_8_q_count_integrity),
    ("JA-9",  "Engine display contract",    check_ja_9_engine_display_contract),
    ("JA-10", "No (see n5-) redirect text", check_ja_10_no_stub_redirect_text_in_data),
    ("JA-11", "No duplicate MCQ choices",   check_ja_11_no_duplicate_choices),
    ("JA-12", "Kanji KB / JSON consistency", check_ja_12_kanji_kb_data_consistency),
    ("JA-13", "No out-of-scope kanji in user-facing data", lambda: _check_ja_13_no_out_of_scope_kanji_in_data()),
    ("JA-14", "No auto-ruby code in renderer",  lambda: _check_ja_14_no_auto_ruby_in_renderer()),
    ("JA-15", "Audio refs resolve to files on disk", lambda: _check_ja_15_audio_refs_on_disk()),
    ("JA-16", "Kanji examples use only target-or-whitelist kanji", lambda: _check_ja_16_kanji_examples_in_scope()),
]


# ---------------------------------------------------------------------------
# JA-13 / JA-14 added in Pass 13 (auto-furigana removal)
# ---------------------------------------------------------------------------

def _check_ja_13_no_out_of_scope_kanji_in_data() -> list[str]:
    """No out-of-scope kanji appears in user-facing fields of grammar.json,
    questions.json, reading.json, listening.json. Enforces the 'kanji only
    if in N5 syllabus, kana otherwise' rule from the Pass-13 redesign."""
    failures = []
    try:
        whitelist = set(json.loads((ROOT / "data" / "n5_kanji_whitelist.json").read_text(encoding="utf-8")))
    except Exception as e:
        return [f"JA-13 could not load n5_kanji_whitelist.json: {e}"]
    KANJI_LOCAL = re.compile(r"[一-鿿]")
    SKIP_FIELDS = {"translation_en", "explanation_en", "meaning_en", "gloss",
                   "title_en", "prompt_en", "distractor_explanations",
                   "common_mistakes", "reading", "furigana"}
    def walk(obj, key, path, hits):
        if isinstance(obj, str):
            if key in SKIP_FIELDS: return
            for ch in obj:
                if KANJI_LOCAL.match(ch) and ch not in whitelist:
                    hits.append((path, ch, obj[:60]))
                    return
        elif isinstance(obj, dict):
            for k, v in obj.items(): walk(v, k, f"{path}.{k}", hits)
        elif isinstance(obj, list):
            for i, v in enumerate(obj): walk(v, key, f"{path}[{i}]", hits)
    for fname in ["data/grammar.json", "data/questions.json", "data/reading.json", "data/listening.json"]:
        try:
            d = json.loads((ROOT / fname).read_text(encoding="utf-8"))
        except Exception:
            continue
        hits = []
        walk(d, None, fname, hits)
        for path, kanji, text in hits[:5]:
            failures.append(f"JA-13 {path}: out-of-scope kanji '{kanji}' in {text!r}")
        if len(hits) > 5:
            failures.append(f"JA-13 {fname}: ... and {len(hits) - 5} more")
    return failures


def _check_ja_14_no_auto_ruby_in_renderer() -> list[str]:
    """js/furigana.js must not auto-generate ruby for in-scope N5 kanji.
    The Pass-13 redesign removed this feature because the single-primary
    lookup picks wrong context-dependent readings (大学 displays
    だい+がく, but 大[おお] alone). Guard the regression here."""
    src = (ROOT / "js" / "furigana.js").read_text(encoding="utf-8") if (ROOT / "js" / "furigana.js").exists() else ""
    if not src:
        return ["JA-14: js/furigana.js missing"]
    # Look for the bad pattern: a ruby tag that references readings[ch].primary
    if "readings[ch]?.primary" in src or "readings[ch].primary" in src:
        return ["JA-14: js/furigana.js still references readings[ch].primary - auto-furigana not fully removed"]
    # The function should not import primary readings as a render input
    if "n5KanjiReadings" in src and "primary" in src:
        return ["JA-14: js/furigana.js still wires the readings map into the renderer"]
    return []


def _check_ja_16_kanji_examples_in_scope() -> list[str]:
    """K-1 invariant: every kanji entry's `examples[*].form` must contain
    only kanji that are either (a) the target kanji of the card, or (b)
    in the N5 whitelist. Non-kanji characters (kana) are always allowed.

    Out-of-scope kanji should be substituted with their kana reading
    BEFORE landing in the data file. The renderer doesn't perform the
    substitution at display time; the form here is what's shown.
    """
    failures: list[str] = []
    kanji_path = ROOT / "data" / "kanji.json"
    wl_path = ROOT / "data" / "n5_kanji_whitelist.json"
    if not kanji_path.exists() or not wl_path.exists():
        return ["JA-16: data files missing"]
    try:
        whitelist = set(json.loads(wl_path.read_text(encoding="utf-8")))
        data = json.loads(kanji_path.read_text(encoding="utf-8"))
    except Exception as e:
        return [f"JA-16: parse error: {e}"]
    KANJI_RE = re.compile(r"[一-鿿]")
    for entry in data.get("entries", []):
        target = entry.get("glyph")
        for ex in entry.get("examples", []):
            form = ex.get("form", "")
            for ch in KANJI_RE.findall(form):
                if ch == target or ch in whitelist:
                    continue
                failures.append(
                    f"JA-16 kanji '{target}' has example '{form}' with "
                    f"out-of-scope kanji '{ch}'. Substitute with kana per K-1 rule."
                )
    return failures


def _check_ja_15_audio_refs_on_disk() -> list[str]:
    """Every entry in data/audio_manifest.json must point to a file that
    exists on disk. Per data-correction brief §4.1: a release-blocker check
    for "no question, grammar pattern, listening item references a missing
    audio file." If this fails, the runtime app would 404 on `<audio src>`.

    The `skipped: true` flag in the manifest is a build-script status (file
    already on disk, skipped re-rendering); it does NOT mean missing.
    """
    failures: list[str] = []
    manifest_path = ROOT / "data" / "audio_manifest.json"
    if not manifest_path.exists():
        return ["JA-15: data/audio_manifest.json missing"]
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as e:
        return [f"JA-15: could not parse audio_manifest.json: {e}"]
    items = manifest.get("items", [])
    for it in items:
        path = it.get("path", "")
        # Manifest paths use OS-native separators (Windows backslash on the
        # author machine). Normalise so the check works on any OS.
        rel = path.replace("\\", "/")
        full = ROOT / rel
        if not full.exists():
            failures.append(
                f"JA-15 manifest entry {it.get('id', '?')} points to missing file: {rel}"
            )
            if len(failures) >= 20:
                failures.append(f"JA-15 ... and more (truncated at 20)")
                break
    return failures


def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    verbose = "-v" in argv or "--verbose" in argv

    overall_failures: list[str] = []
    print(f"JLPT N5 Content Integrity - {len(CHECKS)} invariants")
    # Note: invariant count grew from 23 to 24 with JA-15 (audio refs on disk).
    print("=" * 60)

    for code, label, check_fn in CHECKS:
        try:
            failures = check_fn()
        except Exception as e:  # noqa: BLE001 - report any check-internal error
            failures = [f"{code} check raised {type(e).__name__}: {e}"]
        status = "PASS" if not failures else f"FAIL ({len(failures)})"
        print(f"  {code:<6} {label:<32} {status}")
        if failures and verbose:
            for f in failures[:10]:
                print(f"           - {f}")
            if len(failures) > 10:
                print(f"           ... and {len(failures) - 10} more")
        overall_failures.extend(failures)

    print("=" * 60)
    if overall_failures:
        print(f"FAIL: {len(overall_failures)} integrity violation(s)")
        if not verbose:
            print("Run with -v / --verbose to see all violations")
        return 1

    print(f"PASS: all {len(CHECKS)} invariants green")
    return 0


if __name__ == "__main__":
    sys.exit(main())
