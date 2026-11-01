# English G12

A free companion for **Grade 12 English in the Lebanese official exams**, for Life Sciences and Sociology & Economics students anywhere in Lebanon.

**The official paper is the map.** The home page is a replica of the exam sheet: every question type on it (Sections A to F, the analysis questions, the essay genres) opens its own skill page. Each skill shows how it appears on real papers, how the official grading schemes mark it, a method, a worked example, something to try, and a short self-check. When a student is ready for a skill, its share of the 20 marks appears in the margin, as an examiner would write it.

Live: https://aghozlan.github.io/english-g12-platform/

## What is on the site

- **The paper** (home): the exam sheet, marks in the margin, the examiner’s comment, word of the day, days to the exam.
- **Skills** (`skills/<id>/`): live now: the paper and timing, skim/scan, command words, own-words answers (A), inferring (A), false statements (B), vocabulary in context (E), reference words (F). The rest of Section C, D and the essays are listed as coming.
- **Reading room** (`reading/`): original exam-style texts on the LS and SE themes, read aloud by a natural voice with the sentence highlighted, reading tools (skim, scan, highlighter, pronoun tracer), and a full set of exam questions with model answers.

## How it is built

Static site, no framework, no server, published by a GitHub Actions workflow on every push to `main`.

```
tools/site/**/src.html     page sources (edit these)  →  built to the same path as index.html
tools/partials/            head, top bar, footer
tools/texts/<id>.html      reading texts (original practice texts)
tools/texts/questions/     the exam question set of each text
tools/build.js             builds every page
tools/audio.py             records texts and word clips with a natural voice (Kokoro, open source, offline)
tools/check.js             Playwright: phone and desktop, light and dark, console errors, horizontal scroll
assets/js/catalog.js       THE map: paper sections, skills, their marks and status; the reading-room list
assets/js/platform.js      shared behaviour, one entry point EGP.boot()
assets/js/labs.js          the interactive models
assets/js/listen.js        the read-aloud player with sentence highlighting
assets/js/skill.js         skill page chrome: crumbs, marks, "ready", next/previous
audio/                     recorded texts (.m4a + sentence timings .json) and word clips
_raw/                      git-ignored: reference PDF, CRDP downloads, screenshots
```

### Commands

```
npm install                          # once (Playwright)
npm run build                        # build every page
npm run check                        # must print only "ok" lines before a push
python3 tools/audio.py kokoro-v1.0.onnx voices-v1.0.bin af_heart [text-id]   # record a text
```

The Kokoro model files come from the kokoro-onnx GitHub releases (`model-files-v1.0`).

### Adding a skill

1. Write `tools/site/skills/<id>/src.html` (copy a live skill for the pattern: on the paper, how it’s marked, method, try it, check yourself).
2. Set its `status` to `"live"` in `assets/js/catalog.js`.
3. `npm run build && npm run check`, then commit and push.

### Adding a text

1. `tools/texts/<id>.html` with sentences in `<span class="s">`, and `tools/texts/questions/<id>.html`.
2. `tools/site/reading/<id>/src.html` (copy an existing one), add it to `EGP_TEXTS` in the catalog.
3. Record it with `tools/audio.py`.

### Sign-in later

Answers live only in `<div class="ans" hidden>` blocks and every exercise has a stable `data-ex` id. To add Firebase: set `EGP.gate = async () => …` before `platform.js` runs (`EGP.boot()` waits for it), and encrypt the `.ans` blocks in `tools/build.js`.

## Sources

Paper structure, instructions, marks and grading follow the CRDP official papers and their grading schemes, the 2025–2026 official-exam lessons circular and the 2026–2027 curriculum. Reading texts are original and labelled as practice texts. The reference PDF is not published.
