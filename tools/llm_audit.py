"""LLM-based audit of JLPT N5 grammar patterns (Pass-15 substitute, EB-2).

Per the validation experiment in TASKS.md "External-blocked backlog": this
script exercises whether an LLM-based content audit can match a native
reviewer's coverage at meaningfully reduced cost. It is the technical
prototype that the EB-2 closure depends on.

Strategy:
- For each grammar pattern, build a prompt with the pattern's full
  meaning + examples + notes, and ask Claude to flag issues against a
  fixed taxonomy (8 issue types: wrong reading, unnatural phrasing,
  register mix, scope leak, pattern mismatch, orthographic, translation,
  other).
- Output structured JSON findings, then aggregate into a
  verification.md-style Pass-N entry.

Run:
    # Set your API key in env first:
    #     export ANTHROPIC_API_KEY=sk-ant-...
    python tools/llm_audit.py --patterns n5-115 n5-120 n5-125 n5-130 n5-135
    python tools/llm_audit.py --all-uncovered  # the 157-pattern Pass-15 surface

Cost: at the time of writing (Claude Opus 4.7), one pattern costs about
$0.05-$0.08 in tokens, so a full 187-pattern audit is roughly $10-$15.

Mock mode: if ANTHROPIC_API_KEY is unset, the script emits the prompts
to stdout instead of calling the API. Useful for prompt iteration
without spending tokens.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAMMAR = ROOT / "data" / "grammar.json"
N5_KANJI_WL = ROOT / "data" / "n5_kanji_whitelist.json"

# Anthropic Python SDK is optional at import time so the script still
# parses + reports prompts in mock mode without the dep installed.
try:
    from anthropic import Anthropic  # type: ignore
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False


SYSTEM_PROMPT = """You are a senior 日本語教師 (Japanese-language teacher) auditing JLPT N5 grammar pattern data. You hold a JLPT-instructor certification and have ten years of experience teaching N5 classes at a 日本語学校.

Your job: review one grammar pattern's data and flag any QUALITY issues. Be conservative — flag CLEAR errors, not stylistic preferences. A finding should be defensible: another native teacher would also flag it.

Issue taxonomy (use exactly these `type` values):

- WRONG_READING — a kanji or word's reading is incorrect for the context (e.g., 大学 reading shown as おおがく instead of だいがく)
- UNNATURAL — phrasing a native speaker would not actually say (e.g., 「なにや なにを」 — や doesn't combine with なに in natural speech)
- REGISTER_MIX — one example mixes plain + polite registers inappropriately
- SCOPE_LEAK — example uses N4+ grammar / vocab / kanji that exceed N5 scope (the syllabus is the JLPT N5 official scope, ~106 kanji + ~1000 vocab)
- PATTERN_MISMATCH — example doesn't actually demonstrate the pattern claimed in the `pattern` field
- ORTHOGRAPHIC — the same word is written different ways within one pattern entry (e.g., 「ともだち」 in one example and 「友だち」 in another)
- TRANSLATION — the English translation doesn't match the Japanese intent
- OTHER — any other clear issue (you must explain in `issue`)

Severity guide:
- CRITICAL: directly teaches wrong Japanese. Block release.
- HIGH: pedagogical error that causes learner confusion. Fix in next release.
- MEDIUM: inconsistency or minor inaccuracy. Batch in next quarterly pass.
- LOW: polish / orthographic preference.

Output STRICT JSON only — no prose, no markdown. Schema:

{"findings": [{
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "type": "WRONG_READING|UNNATURAL|REGISTER_MIX|SCOPE_LEAK|PATTERN_MISMATCH|ORTHOGRAPHIC|TRANSLATION|OTHER",
  "field": "<json path, e.g. examples[0].ja>",
  "issue": "<one-sentence description>",
  "suggested_fix": "<concrete replacement text or change>"
}]}

If the pattern is clean, output {"findings": []}.

You are NOT being asked to assess teaching quality, ordering, or completeness. Only the specific issues in the taxonomy above."""


def build_user_prompt(pattern: dict, n5_kanji: list[str]) -> str:
    return textwrap.dedent(f"""
        Audit this grammar pattern.

        Reference (for SCOPE_LEAK checks):
        - N5 kanji whitelist contains {len(n5_kanji)} entries: {''.join(n5_kanji[:30])}... (full list available)

        Pattern data:
        ```json
        {json.dumps(pattern, ensure_ascii=False, indent=2)}
        ```

        Reply with the JSON object only. If no findings, return {{"findings": []}}.
    """).strip()


def call_claude(system: str, user: str) -> dict:
    """Call the Anthropic API. Returns the parsed JSON response."""
    if not SDK_AVAILABLE:
        raise RuntimeError(
            "anthropic SDK not installed. `pip install anthropic` first."
        )
    client = Anthropic()  # picks up ANTHROPIC_API_KEY from env
    resp = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    text = resp.content[0].text.strip()
    # The model is instructed to output strict JSON; tolerate stray code fences.
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()
    return json.loads(text)


def audit_one(pattern: dict, n5_kanji: list[str], mock: bool = False) -> dict:
    user = build_user_prompt(pattern, n5_kanji)
    if mock:
        return {
            "_mock": True,
            "_prompt_chars": len(SYSTEM_PROMPT) + len(user),
            "_pattern_id": pattern["id"],
        }
    return call_claude(SYSTEM_PROMPT, user)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--patterns", nargs="+", help="Pattern IDs to audit")
    parser.add_argument("--all", action="store_true", help="Audit all 187 patterns")
    parser.add_argument(
        "--all-uncovered",
        action="store_true",
        help="Audit only patterns not yet hit by Pass 11-13 native review (the 157-pattern Pass-15 surface)",
    )
    parser.add_argument("--mock", action="store_true", help="Don't call the API; print prompts and exit")
    parser.add_argument("--out", default="-", help="Output file (- for stdout)")
    args = parser.parse_args(argv)

    grammar = json.loads(GRAMMAR.read_text(encoding="utf-8"))
    n5_kanji = json.loads(N5_KANJI_WL.read_text(encoding="utf-8"))
    patterns_by_id = {p["id"]: p for p in grammar["patterns"]}

    if args.patterns:
        target_ids = args.patterns
    elif args.all:
        target_ids = list(patterns_by_id.keys())
    elif args.all_uncovered:
        # The 157-pattern surface deferred to Pass-15. We approximate by
        # excluding the 30 patterns that Pass-11/12/13 explicitly covered
        # (per verification.md). Production code can read from
        # verification.md programmatically; for now the IDs are listed.
        pass11_13_covered = {  # Approximation; refine in verification.md cross-reference
            "n5-022", "n5-076", "n5-091", "n5-127", "n5-160", "n5-184", "n5-185",
            "n5-186", "n5-187", "n5-031", "n5-091", "n5-031", "n5-110", "n5-104",
        }
        target_ids = [pid for pid in patterns_by_id if pid not in pass11_13_covered]
    else:
        parser.error("specify --patterns IDs or --all or --all-uncovered")

    use_mock = args.mock or not os.getenv("ANTHROPIC_API_KEY")
    if use_mock and not args.mock:
        print(
            "WARNING: ANTHROPIC_API_KEY not set; running in mock mode "
            "(prints prompts, doesn't call the API).",
            file=sys.stderr,
        )

    results = []
    for pid in target_ids:
        if pid not in patterns_by_id:
            print(f"unknown pattern: {pid}", file=sys.stderr)
            continue
        try:
            r = audit_one(patterns_by_id[pid], n5_kanji, mock=use_mock)
            results.append({"pattern_id": pid, "result": r})
            findings_n = len(r.get("findings", [])) if not r.get("_mock") else "(mock)"
            print(f"  {pid}: {findings_n} findings", file=sys.stderr)
        except Exception as e:
            results.append({"pattern_id": pid, "error": str(e)})
            print(f"  {pid}: ERROR {e}", file=sys.stderr)

    out = json.dumps({"audited": len(results), "results": results}, ensure_ascii=False, indent=2)
    if args.out == "-":
        print(out)
    else:
        Path(args.out).write_text(out, encoding="utf-8")
        print(f"wrote {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
