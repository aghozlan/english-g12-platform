"""Record a reading text with a natural neural voice (Kokoro, open source, runs offline).

For each text in tools/texts/<id>.html it writes
  audio/<id>.<voice>.m4a   the whole text, read sentence by sentence
  audio/<id>.<voice>.json  start/end time of every sentence (.s), in page order
so the page can highlight the sentence being read.

Usage: python3 tools/audio.py <model.onnx> <voices.bin> [voice] [text-id ...]
       voice defaults to af_heart
Also: python3 tools/audio.py <model> <voices> <voice> --words   (word-of-the-day clips)
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from bs4 import BeautifulSoup
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model, voices = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
targets = sys.argv[4:]
lang = "en-gb" if voice.startswith("b") else "en-us"
k = Kokoro(model, voices)

SAY = [  # how a word should be spoken (the page text is unchanged)
    (r"\b1:40 a\.m\.", "one forty a.m."), (r"\bDr\b\.?", "Doctor"), (r"\bP(\d)\b", r"paragraph \1"),
    (r"“|”", '"'), (r"’", "'"),
]
def speakable(t):
    for a, b in SAY: t = re.sub(a, b, t)
    return re.sub(r"\s+", " ", t).strip()

def synth(text, speed=0.94):
    s, sr = k.create(speakable(text), voice=voice, speed=speed, lang=lang)
    return s, sr

def encode(wav, out):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-c:a", "aac", "-b:a", "40k", out], check=True)

def record_text(tid):
    html = open(os.path.join(ROOT, "tools", "texts", tid + ".html"), encoding="utf8").read()
    soup = BeautifulSoup(html, "html.parser")
    pieces = [("title", soup.find("h3").get_text())]
    for p in soup.select("p[data-p]"):
        for i, s in enumerate(p.select("span.s")):
            pieces.append(("p" if i == 0 else "s", s.get_text()))
    audio, marks, t, sr = [], [], 0.0, 24000
    for kind, text in pieces:
        gap = 0.75 if kind in ("p", "title") and audio else 0.28
        if audio:
            audio.append(np.zeros(int(gap * sr), dtype=np.float32)); t += gap
        s, sr = synth(text)
        audio.append(s.astype(np.float32))
        if kind != "title": marks.append([round(t, 2), round(t + len(s) / sr, 2)])
        t += len(s) / sr
    with tempfile.NamedTemporaryFile(suffix=".wav") as w:
        sf.write(w.name, np.concatenate(audio), sr)
        encode(w.name, os.path.join(ROOT, "audio", f"{tid}.{voice}.m4a"))
    json.dump({"voice": voice, "duration": round(t, 2), "sentences": marks}, open(os.path.join(ROOT, "audio", f"{tid}.{voice}.json"), "w"))
    print(tid, voice, f"{t:.0f}s", len(marks), "sentences")

def record_words():
    src = open(os.path.join(ROOT, "assets", "js", "companion.js"), encoding="utf8").read()
    words = re.findall(r'\["([^"]+)", "[^"]*", "[^"]*", "((?:[^"\\]|\\.)*)"\]', src)
    os.makedirs(os.path.join(ROOT, "audio", "words"), exist_ok=True)
    for w, ex in words:
        ex = ex.replace('\\"', '"')
        a, sr = synth(w, 0.85); b, _ = synth(ex)
        clip = np.concatenate([a, np.zeros(int(0.6 * sr), dtype=np.float32), b])
        slug = re.sub(r"[^a-z]+", "-", w.lower()).strip("-")
        with tempfile.NamedTemporaryFile(suffix=".wav") as f:
            sf.write(f.name, clip, sr); encode(f.name, os.path.join(ROOT, "audio", "words", f"{slug}.m4a"))
    print(len(words), "word clips")

os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
if "--words" in targets: record_words()
else:
    ids = targets or [f[:-5] for f in sorted(os.listdir(os.path.join(ROOT, "tools", "texts"))) if f.endswith(".html")]
    for tid in ids: record_text(tid)
