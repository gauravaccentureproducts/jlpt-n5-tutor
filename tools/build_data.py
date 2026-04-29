"""Build N5 whitelist JSON files from the markdown source-of-truth.

Run from the repo root:
    python tools/build_data.py

Generates:
    data/n5_kanji_whitelist.json   - list of N5-scope kanji characters
    data/n5_vocab_whitelist.json   - list of N5-scope vocabulary tokens
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def extract_kanji(md_path: Path) -> list[str]:
    """Pull all kanji from bullet entries like '- **一**'."""
    text = md_path.read_text(encoding="utf-8")
    matches = re.findall(r"\*\*([一-鿿])\*\*", text)
    return sorted(set(matches))


# Katakana to hiragana conversion table for on'yomi normalization.
KATA_TO_HIRA = str.maketrans(
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョッー",
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっー",
)


def kata_to_hira(s: str) -> str:
    return s.translate(KATA_TO_HIRA)


def extract_kanji_readings(md_path: Path) -> dict[str, dict]:
    """Parse kanji entries with their On / Kun readings.

    Returns: { kanji: { 'on': [hiragana...], 'kun': [hiragana...], 'primary': str } }
    Primary picks the first kun-yomi (without okurigana), falls back to first on-yomi.
    Note: this is a single representative reading - real Japanese reading is
    context-dependent. The renderer applies this best-effort when the user's
    'Show furigana on N5 kanji' toggle is ON.
    """
    text = md_path.read_text(encoding="utf-8")
    entries: dict[str, dict] = {}
    current = None
    for raw in text.splitlines():
        line = raw.rstrip()
        m = re.match(r"^\s*-\s+\*\*([一-鿿])\*\*\s*$", line)
        if m:
            current = m.group(1)
            entries[current] = {"on": [], "kun": [], "primary": None}
            continue
        if current is None:
            continue
        # Sub-bullet readings.
        on_m = re.match(r"^\s*-\s*On\s*:\s*(.+)$", line)
        if on_m:
            raws = [r.strip() for r in on_m.group(1).split(",")]
            entries[current]["on"] = [
                kata_to_hira(r) for r in raws if r and r != "-"
            ]
            continue
        kun_m = re.match(r"^\s*-\s*Kun\s*:\s*(.+)$", line)
        if kun_m:
            raws = [r.strip() for r in kun_m.group(1).split(",")]
            cleaned = []
            for r in raws:
                if not r or r == "-":
                    continue
                # Strip okurigana parens: ひと(つ) -> ひと
                core = re.sub(r"\(.*?\)", "", r).strip()
                if core:
                    cleaned.append(core)
            entries[current]["kun"] = cleaned
            continue
        # End of entry on blank line or new heading.
        if not line.strip() or line.startswith("##"):
            current = None

    # Pick a primary reading per kanji.
    for kanji, e in entries.items():
        e["primary"] = (e["kun"] or e["on"] or [""])[0]
    return entries


def extract_kanji_corpus(md_path: Path) -> list[dict]:
    """Parse kanji_n5.md into rich kanji records (each kanji + meaning + readings).

    Each entry shape:
        {
          "id": "n5.kanji.X",
          "glyph": "食",
          "on": [...],        # hiragana
          "kun": [...],       # hiragana, with okurigana stripped
          "meanings": [...],  # English glosses split on slash/comma
          "stroke_order_svg": "/svg/kanji/食.svg",  # placeholder; KanjiVG can drop in
        }
    """
    text = md_path.read_text(encoding="utf-8")
    out = []
    current = None
    meanings = ""
    for raw in text.splitlines():
        line = raw.rstrip()
        m = re.match(r"^\s*-\s+\*\*([一-鿿])\*\*\s*$", line)
        if m:
            if current:
                out.append(current)
            current = {
                "id": f"n5.kanji.{m.group(1)}",
                "glyph": m.group(1),
                "on": [],
                "kun": [],
                "meanings": [],
                "stroke_order_svg": f"svg/kanji/{m.group(1)}.svg",
            }
            continue
        if current is None:
            continue
        on_m = re.match(r"^\s*-\s*On\s*:\s*(.+)$", line)
        if on_m:
            raws = [r.strip() for r in on_m.group(1).split(",")]
            current["on"] = [kata_to_hira(r) for r in raws if r and r != "-"]
            continue
        kun_m = re.match(r"^\s*-\s*Kun\s*:\s*(.+)$", line)
        if kun_m:
            raws = [r.strip() for r in kun_m.group(1).split(",")]
            cleaned = []
            for r in raws:
                if not r or r == "-":
                    continue
                core = re.sub(r"\(.*?\)", "", r).strip()
                if core:
                    cleaned.append(core)
            current["kun"] = cleaned
            continue
        mn_m = re.match(r"^\s*-\s*Meaning\s*:\s*(.+)$", line)
        if mn_m:
            current["meanings"] = [
                p.strip() for p in re.split(r"[/,;]", mn_m.group(1)) if p.strip()
            ]
        # End of entry on blank line or new heading
        if not line.strip() or line.startswith("##"):
            if current:
                out.append(current)
                current = None
    if current:
        out.append(current)
    return out


def extract_vocab(md_path: Path) -> list[str]:
    """Pull vocab tokens from bullet entries like '- 学生 (がくせい) - student'."""
    text = md_path.read_text(encoding="utf-8")
    vocab = set()
    for line in text.splitlines():
        m = re.match(r"^\s*-\s+([^\s\(-]+)", line)
        if not m:
            continue
        tok = m.group(1).strip()
        if not tok:
            continue
        # Keep only tokens that contain at least one Japanese character.
        has_jp = any(
            "぀" <= ch <= "ヿ" or "一" <= ch <= "鿿"
            for ch in tok
        )
        if has_jp:
            vocab.add(tok)
    return sorted(vocab)


# Regex for full vocab entries: '- 学生 (がくせい) - student' or '- あなた - you'
# captures: form, optional reading, gloss
VOCAB_LINE_RE = re.compile(
    r"^\s*-\s+(?P<form>[^\s\(\-]+)\s*(?:\((?P<reading>[^)]+)\))?\s*[-]\s*(?P<gloss>.+?)$"
)


def extract_vocab_corpus(md_path: Path) -> list[dict]:
    """Parse vocabulary_n5.md into rich vocab records.

    Returns list of:
        {"form": str, "reading": str|None, "gloss": str, "section": str, "id": str}

    The "section" is the most recent ## heading.
    """
    text = md_path.read_text(encoding="utf-8")
    out = []
    section = ""
    seen_ids = set()
    for raw in text.splitlines():
        line = raw.rstrip()
        h = re.match(r"^##\s+(.+?)\s*$", line)
        if h:
            section = h.group(1).strip()
            continue
        m = VOCAB_LINE_RE.match(line)
        if not m:
            continue
        form = m.group("form").strip()
        reading = (m.group("reading") or "").strip() or None
        gloss = m.group("gloss").strip()
        if not form:
            continue
        # Require Japanese in the form
        if not any("぀" <= c <= "ヿ" or "一" <= c <= "鿿" for c in form):
            continue
        # Stable id: section slug + form. If duplicate, append index.
        slug = re.sub(r"[^a-z0-9]+", "-", section.lower()).strip("-")[:24] or "misc"
        base_id = f"n5.vocab.{slug}.{form}"
        vid = base_id
        i = 2
        while vid in seen_ids:
            vid = f"{base_id}.{i}"
            i += 1
        seen_ids.add(vid)
        out.append({
            "id": vid,
            "form": form,
            "reading": reading,
            "gloss": gloss,
            "section": section,
        })
    return out


def main() -> int:
    kanji_md = ROOT / "KnowledgeBank" / "kanji_n5.md"
    vocab_md = ROOT / "KnowledgeBank" / "vocabulary_n5.md"
    data_dir = ROOT / "data"
    data_dir.mkdir(exist_ok=True)

    if not kanji_md.exists():
        print(f"ERROR: missing {kanji_md}", file=sys.stderr)
        return 1
    if not vocab_md.exists():
        print(f"ERROR: missing {vocab_md}", file=sys.stderr)
        return 1

    kanji = extract_kanji(kanji_md)
    (data_dir / "n5_kanji_whitelist.json").write_text(
        json.dumps(kanji, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(kanji):>4} kanji to data/n5_kanji_whitelist.json")

    readings = extract_kanji_readings(kanji_md)
    (data_dir / "n5_kanji_readings.json").write_text(
        json.dumps(readings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        f"Wrote {len(readings):>4} kanji readings to "
        "data/n5_kanji_readings.json"
    )

    vocab = extract_vocab(vocab_md)
    (data_dir / "n5_vocab_whitelist.json").write_text(
        json.dumps(vocab, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(vocab):>4} vocab tokens to data/n5_vocab_whitelist.json")

    corpus = extract_vocab_corpus(vocab_md)
    (data_dir / "vocab.json").write_text(
        json.dumps({"entries": corpus}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(corpus):>4} structured vocab entries to data/vocab.json")

    kanji_corpus = extract_kanji_corpus(kanji_md)
    (data_dir / "kanji.json").write_text(
        json.dumps({"entries": kanji_corpus}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(kanji_corpus):>4} kanji corpus entries to data/kanji.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
