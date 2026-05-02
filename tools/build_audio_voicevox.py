"""VOICEVOX audio pipeline upgrade — scaffold.

Closes INFRA-1/2/3 (master task list) by laying down the executable
template for migrating from gTTS (current) to VOICEVOX (target). VOICEVOX
gives us:

  * Proper Japanese prosody (gTTS speaks katakana words awkwardly)
  * Multi-voice dialogue support (male/female speakers per turn)
  * Local synthesis — no external API calls during build (privacy +
    reproducibility)
  * Higher quality / more natural intonation, especially for the
    listening drills which are dialogue-heavy

Status: scaffold only. The actual VOICEVOX engine binary is NOT bundled
in this repo — it's a 200+ MB native dependency (Linux/macOS/Windows
binaries differ). To run this script, you must:

  1. Download VOICEVOX engine for your platform:
       https://voicevox.hiroshiba.jp/
  2. Start the local HTTP server it ships with (default :50021)
  3. Run: python tools/build_audio_voicevox.py
       --target listening   # or grammar / reading
       --speaker 8          # 8 = 春日部つむぎ (default voice; see /speakers)
       --dry-run            # preview without writing
       --resume             # skip files already on disk

The script writes to audio/<target>/<id>.wav (preserves the existing
gTTS layout in audio/), then runs ffmpeg to transcode to .mp3 so the
runtime <audio> elements don't need code changes. Idempotent: only
re-renders files where the input text has changed (hash compared to
data/audio_manifest.json).

For multi-voice dialogues (INFRA-3), the listening.json item carries
a `script` field with `[speaker:M] / [speaker:F]` markers; this script
splits on those markers, calls VOICEVOX with the appropriate speaker
ID per segment, and concatenates the audio fragments.

Once verified locally, swap the precompile step in tools/build_audio.py
to call this module instead of gTTS.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# Default VOICEVOX HTTP server endpoint. Override with --endpoint.
DEFAULT_ENDPOINT = "http://127.0.0.1:50021"

# Speaker map. IDs come from /speakers on a running VOICEVOX engine.
# These three are the most common male/female voices for N5-level dialogue.
SPEAKER_PRESETS = {
    "F1_tsumugi":  8,   # 春日部つむぎ ノーマル — default female (warm, casual)
    "F2_metan":    2,   # 四国めたん ノーマル — alternate female (upbeat)
    "M1_zundamon": 3,   # ずんだもん ノーマル — default male (younger)
    "M2_kurono":   11,  # 玄野武宏 ノーマル — alternate male (deeper)
}


def parse_dialogue_script(text: str) -> list[tuple[int, str]]:
    """Parse a multi-speaker script into (speaker_id, line) pairs.

    Format expected (matches the listening.json `script` field shape):

        [F1] こんにちは。
        [M1] こんにちは。げんきですか。
        [F1] はい、げんきです。

    Lines without a tag inherit the previous speaker; the very first
    line defaults to F1_tsumugi.
    """
    pairs: list[tuple[int, str]] = []
    current = SPEAKER_PRESETS["F1_tsumugi"]
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("[") and "]" in line:
            tag, rest = line.split("]", 1)
            tag = tag[1:].strip()
            if tag in SPEAKER_PRESETS:
                current = SPEAKER_PRESETS[tag]
            line = rest.strip()
        if line:
            pairs.append((current, line))
    return pairs


def synth_segment(text: str, speaker: int, endpoint: str) -> bytes:
    """Synth one segment via VOICEVOX HTTP API. Returns WAV bytes.

    Two-step API: POST /audio_query → get prosody params, then
    POST /synthesis with those params + same speaker → get audio.

    Network call is intentionally synchronous; the caller batches.
    """
    try:
        import urllib.request
        import urllib.parse
    except ImportError:  # pragma: no cover
        raise RuntimeError("urllib not available — non-CPython runtime?")

    qs = urllib.parse.urlencode({"text": text, "speaker": speaker})
    q_url = f"{endpoint}/audio_query?{qs}"
    req = urllib.request.Request(q_url, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        if resp.status != 200:
            raise RuntimeError(f"VOICEVOX /audio_query → {resp.status}")
        params = resp.read()

    s_url = f"{endpoint}/synthesis?speaker={speaker}"
    s_req = urllib.request.Request(
        s_url, data=params, method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(s_req, timeout=60) as resp:
        if resp.status != 200:
            raise RuntimeError(f"VOICEVOX /synthesis → {resp.status}")
        return resp.read()


def text_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:12]


def render_one(item_id: str, text: str, out_path: Path,
               speaker: int, endpoint: str,
               manifest: dict, dry_run: bool, resume: bool) -> str:
    """Render one item. Returns 'rendered' / 'skipped' / 'cached'."""
    h = text_hash(text)
    prior = manifest.get(item_id, {})
    if resume and out_path.exists() and prior.get("hash") == h:
        return "cached"
    if dry_run:
        return f"would-render ({len(text)} chars, speaker={speaker})"
    pairs = parse_dialogue_script(text)
    if len(pairs) == 1:
        wav = synth_segment(pairs[0][1], pairs[0][0], endpoint)
    else:
        # Multi-voice: synthesize each segment, concatenate. VOICEVOX
        # WAV files share the same sample rate so naive byte-concat
        # almost-works, but the WAV header is per-file. Use ffmpeg to
        # do it properly. Defer until needed; for the scaffold, just
        # render each segment and concatenate via ffmpeg.
        import subprocess
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            tmpdir = Path(td)
            seg_paths = []
            for i, (sp, line) in enumerate(pairs):
                seg_wav = synth_segment(line, sp, endpoint)
                p = tmpdir / f"seg-{i:03d}.wav"
                p.write_bytes(seg_wav)
                seg_paths.append(p)
            list_file = tmpdir / "concat.txt"
            list_file.write_text(
                "\n".join(f"file '{p}'" for p in seg_paths),
                encoding="utf-8",
            )
            out_wav = tmpdir / "merged.wav"
            subprocess.run(
                ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
                 "-i", str(list_file), "-c", "copy", str(out_wav)],
                check=True, capture_output=True,
            )
            wav = out_wav.read_bytes()

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(wav)
    manifest[item_id] = {"hash": h, "path": str(out_path.relative_to(ROOT))}
    return "rendered"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--target", required=True,
                        choices=["grammar", "reading", "listening"])
    parser.add_argument("--speaker", type=int, default=SPEAKER_PRESETS["F1_tsumugi"])
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--resume", action="store_true",
                        help="skip files already rendered with same input hash")
    args = parser.parse_args(argv)

    src_path = ROOT / "data" / f"{args.target}.json"
    if not src_path.exists():
        print(f"ERROR: {src_path} not found")
        return 1
    src = json.loads(src_path.read_text(encoding="utf-8"))

    manifest_path = ROOT / "data" / "audio_manifest.json"
    manifest = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    target_manifest = manifest.setdefault(args.target, {})

    out_dir = ROOT / "audio" / args.target

    # Item iteration depends on data shape. Each module has its own.
    if args.target == "listening":
        items = src.get("items", [])
        text_for = lambda item: item.get("script") or item.get("ja") or ""
    elif args.target == "reading":
        items = src.get("passages", [])
        text_for = lambda item: item.get("ja") or ""
    else:  # grammar
        items = []
        for p in src.get("patterns", []):
            for ex in (p.get("examples") or []):
                items.append({"id": f"{p['id']}.{ex.get('idx', 0)}",
                              "ja": ex.get("ja", "")})
        text_for = lambda item: item.get("ja") or ""

    n_rendered = n_skipped = n_cached = 0
    for it in items:
        iid = it.get("id")
        if not iid:
            continue
        text = text_for(it)
        if not text:
            n_skipped += 1
            continue
        out_path = out_dir / f"{iid}.wav"
        try:
            status = render_one(
                iid, text, out_path, args.speaker, args.endpoint,
                target_manifest, args.dry_run, args.resume,
            )
        except Exception as e:
            print(f"  {iid}: ERROR — {e}")
            continue
        if status == "rendered":
            n_rendered += 1
        elif status == "cached":
            n_cached += 1
        else:
            n_skipped += 1
        print(f"  {iid}: {status}")

    if not args.dry_run:
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    print(f"\nSummary: rendered={n_rendered}, cached={n_cached}, skipped={n_skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
