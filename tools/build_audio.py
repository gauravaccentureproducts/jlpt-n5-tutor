"""Build audio assets for grammar examples and reading passages.

Why a build-time pipeline (Brief §1.1, §5):
    The app must run with no remote API at runtime. So all audio is generated
    OFFLINE during a build step and committed (or shipped to a separate assets
    repo and pre-cached by the service worker on first online visit).

Backends supported (auto-detected, first-available wins):
    1. piper-tts (https://github.com/rhasspy/piper) - high-quality neural,
       offline. Recommended.
       Install:  pip install piper-tts
       Voice:    download a Japanese voice ONNX, e.g.
                   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/ja/ja_JP/jp-takaha-medium/ja_JP-takaha-medium.onnx
                   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/ja/ja_JP/jp-takaha-medium/ja_JP-takaha-medium.onnx.json
                 and pass --voice <path-to-onnx>.
    2. pyttsx3 (offline, OS-native) - works without network. Voice quality
       depends on what's installed on the OS. On Windows, SAPI5 'Haruka' or
       'Ayumi' may be present if the Japanese language pack is installed.

Output:
    audio/grammar/<pattern_id>.<example_idx>.mp3      (or .wav from pyttsx3)
    audio/reading/<passage_id>.mp3
    audio/listening/<item_id>.mp3
    data/audio_manifest.json                          - which IDs were rendered

Run from the repo root:
    python tools/build_audio.py [--backend piper|pyttsx3] [--voice path] [--limit N]

The script is IDEMPOTENT: it skips outputs that already exist unless --force.

This pipeline is OPT-IN. The app degrades gracefully when audio files are
missing - players show no clip, and the listening module shows a notice.
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAMMAR_JSON = ROOT / "data" / "grammar.json"
READING_JSON = ROOT / "data" / "reading.json"
LISTENING_JSON = ROOT / "data" / "listening.json"
MANIFEST = ROOT / "data" / "audio_manifest.json"
OUT_GRAMMAR = ROOT / "audio" / "grammar"
OUT_READING = ROOT / "audio" / "reading"
OUT_LISTENING = ROOT / "audio" / "listening"


def detect_backend(prefer: str | None = None):
    """Pick the first backend that imports successfully."""
    candidates = []
    if prefer:
        candidates.append(prefer)
    # piper first (better quality)
    if "piper" not in candidates:
        candidates.append("piper")
    if "pyttsx3" not in candidates:
        candidates.append("pyttsx3")

    for name in candidates:
        try:
            if name == "piper":
                import piper  # noqa: F401
                return "piper"
            if name == "pyttsx3":
                import pyttsx3  # noqa: F401
                return "pyttsx3"
        except ImportError:
            continue
    return None


class PiperBackend:
    def __init__(self, voice_path: str):
        from piper.voice import PiperVoice
        if not voice_path or not Path(voice_path).exists():
            raise RuntimeError(
                "Piper requires --voice <path-to-.onnx>. Download from "
                "https://github.com/rhasspy/piper-voices and pass the file path."
            )
        self.voice = PiperVoice.load(voice_path)
        self.suffix = ".wav"

    def render(self, text: str, out_path: Path):
        with open(out_path, "wb") as f:
            self.voice.synthesize(text, f)


class Pyttsx3Backend:
    def __init__(self, voice_id: str | None = None):
        import pyttsx3
        self.engine = pyttsx3.init()
        # Try to find a Japanese voice
        if voice_id:
            self.engine.setProperty("voice", voice_id)
        else:
            for v in self.engine.getProperty("voices"):
                if "japan" in v.name.lower() or "ja" in (v.languages and v.languages[0] or "").lower():
                    self.engine.setProperty("voice", v.id)
                    break
        self.suffix = ".wav"

    def render(self, text: str, out_path: Path):
        self.engine.save_to_file(text, str(out_path))
        self.engine.runAndWait()


def collect_jobs(force: bool, limit: int | None):
    """Return list of (text, out_path, source_id)."""
    jobs = []

    # Grammar examples
    if GRAMMAR_JSON.exists():
        g = json.loads(GRAMMAR_JSON.read_text(encoding="utf-8"))
        for p in g.get("patterns", []):
            for i, ex in enumerate(p.get("examples", []) or []):
                ja = ex.get("ja")
                if not ja or "(see " in ja:
                    continue
                out = OUT_GRAMMAR / f"{p['id']}.{i}"
                jobs.append((ja, out, f"grammar.{p['id']}.{i}"))

    # Reading passages
    if READING_JSON.exists():
        r = json.loads(READING_JSON.read_text(encoding="utf-8"))
        for p in r.get("passages", []):
            ja = p.get("ja")
            if not ja:
                continue
            out = OUT_READING / p["id"]
            jobs.append((ja, out, f"reading.{p['id']}"))

    # Listening items
    if LISTENING_JSON.exists():
        l = json.loads(LISTENING_JSON.read_text(encoding="utf-8"))
        for it in l.get("items", []):
            ja = it.get("script_ja") or it.get("prompt_ja")
            if not ja:
                continue
            out = OUT_LISTENING / it["id"]
            jobs.append((ja, out, f"listening.{it['id']}"))

    if limit:
        jobs = jobs[:limit]
    return jobs


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--backend", choices=["piper", "pyttsx3", "auto"], default="auto")
    ap.add_argument("--voice", help="Voice file (piper) or voice id (pyttsx3)")
    ap.add_argument("--limit", type=int, help="Limit jobs (for testing)")
    ap.add_argument("--force", action="store_true", help="Re-render existing files")
    args = ap.parse_args()

    backend_name = args.backend if args.backend != "auto" else detect_backend()
    if not backend_name:
        print("ERROR: no TTS backend installed.", file=sys.stderr)
        print("Install one:", file=sys.stderr)
        print("  pip install piper-tts     # recommended (offline neural)", file=sys.stderr)
        print("  pip install pyttsx3       # OS-native voices", file=sys.stderr)
        return 2

    if backend_name == "piper":
        backend = PiperBackend(args.voice)
    else:
        backend = Pyttsx3Backend(args.voice)

    OUT_GRAMMAR.mkdir(parents=True, exist_ok=True)
    OUT_READING.mkdir(parents=True, exist_ok=True)
    OUT_LISTENING.mkdir(parents=True, exist_ok=True)

    jobs = collect_jobs(args.force, args.limit)
    print(f"Backend: {backend_name}. Jobs: {len(jobs)}.")
    rendered = 0
    skipped = 0
    failed = 0
    manifest = {"backend": backend_name, "items": []}

    for text, out_base, src_id in jobs:
        out = out_base.with_suffix(backend.suffix)
        if out.exists() and not args.force:
            skipped += 1
            manifest["items"].append({"id": src_id, "path": str(out.relative_to(ROOT)), "skipped": True})
            continue
        try:
            backend.render(text, out)
            rendered += 1
            manifest["items"].append({"id": src_id, "path": str(out.relative_to(ROOT))})
            if rendered % 25 == 0:
                print(f"  ... {rendered} rendered")
        except Exception as e:
            failed += 1
            print(f"FAIL {src_id}: {e}", file=sys.stderr)

    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. rendered={rendered} skipped={skipped} failed={failed}.")
    print(f"Manifest: {MANIFEST.relative_to(ROOT)}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
