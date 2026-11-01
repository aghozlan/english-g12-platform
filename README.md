# English G12 — Tutoring Centre

A year-long study companion for **Grade 12 English (Lebanese official exams, LS and SE sections)**.
Students open one link, pick their section, and follow a coastline of ten lighthouses from November to the June exam:
interactive lessons, reading tools, flip cards, practice with hidden answers, printable class PDFs, and later the bank of official papers.

Student link: https://aghozlan.github.io/english-g12-platform/

## What is live

| Unit | Month | Status |
|---|---|---|
| 1. Reading the exam way | Nov | live |
| 2–10 | Nov–May | planned (see [ROADMAP.md](ROADMAP.md)) |
| Official exams bank | Jun | planned |

## How it is built

Static site, no framework, no server. Hosted on GitHub Pages from `main`.

```
index.html                     home: 3D Year Journey, countdown, Nour, word of the day, unit list
assets/css/platform.css        shared look (light and dark)
assets/js/platform.js          shared behaviour, ONE entry point: EGP.boot()
assets/js/units.js             THE unit list (edit this to open a unit) and the exam date
assets/js/companion.js         Nour, word of the day, streak, seasonal notes, celebrations
assets/js/journey.js           the 3D coastline (three.js, lazy-loaded)
assets/vendor/three.module.min.js   three.js 0.160, self-hosted
units/<unit>/index.html        built unit page (never edit by hand)
units/<unit>/*.pdf             printable class handouts, one per section
tools/<unit>/src.html          unit source (edit this)
tools/<unit>/texts/*.html      reading texts (original practice texts)
tools/<unit>/<unit>.js         the unit's live models
tools/partials/                shared head and top bar
tools/build.js                 builds every unit
tools/print.js                 builds the LS and SE PDFs of a unit
tools/check.js                 Playwright check: phone/desktop, light/dark, console errors, horizontal scroll
_raw/                          git-ignored: teacher's PDF, CRDP downloads, screenshots
```

### Commands

```
npm install                    # once (Playwright)
npm run build                  # tools/*/src.html -> units/*/index.html
npm run print -- unit-1 unit1_reading_the_exam_way
npm run check                  # must print only "ok" lines before a publish
```

### Writing a unit

- Sections LS and SE: wrap section-specific content in `data-sec="ls"` / `data-sec="se"`; the top-bar switch shows one.
- A reading text can be included several times with `{{> texts/ls.html|suffix}}`; the suffix keeps ids unique.
- Every exercise: `<div class="ex" data-ex="u1-p1-e1">` with a **stable id**.
- Every answer: `<div class="ans" hidden>…</div>`. Nothing else holds answers.

### Adding sign-in later (Firebase)

Designed for it, nothing to restructure:
1. Set `EGP.gate = async () => { /* sign in, check approval */ return true; }` in a script loaded before `platform.js`. `EGP.boot()` waits for it.
2. In `tools/build.js`, encrypt each `<div class="ans" hidden>` block per page or per `data-ex` (the physics platform's AES-GCM scheme drops in here).

## Sources and copyright

- Exam structure, marks, question wording and themes follow the CRDP circulars (2025–2026 official-exam lessons, 2026–2027 curriculum) and the official papers with their grading schemes.
- Reading texts in the units are **original practice texts**, labelled as such. Official exam texts will appear only in the official-exams bank, retyped as set.
- The teacher's reference PDF is not published; it lives in `_raw/`.
