// Printable PDF of a unit, one per section (LS / SE), A4, body text 12 pt.
// The built page is opened, then turned into paper: labs become exercises,
// every answer moves to the key at the end, cards become a revision sheet.
// Usage: node tools/print.js unit-1 "unit1_reading_the_exam_way"
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const unit = process.argv[2] || "unit-1";
const base = process.argv[3] || unit;
const root = path.resolve(__dirname, "..");
const page = "file://" + path.join(root, "units", unit, "index.html");

const PRINT_CSS = `
@page { size: A4; margin: 12mm 12mm 13mm; }
html, body { background: #fff !important; color: #111 !important; }
:root { --bg:#fff; --surface:#fff; --surface-2:#f3f5f5; --ink:#111; --ink-2:#444; --line:#bbb; --sea:#145a62; --sea-soft:#e6f1f1; --lamp:#c27d0e; --lamp-ink:#7a4b00; --ok:#1f5e38; --ok-soft:#fff; --shadow:none; color-scheme: light; }
body { font: 12pt/1.42 "Atkinson Hyperlegible", Arial, sans-serif; }
h1 { font-size: 20pt; margin: 0 0 4pt; } h2 { font-size: 15pt; margin: 10pt 0 5pt; } h3 { font-size: 13pt; }
.topbar, .subnav, .tools, .qtools, .deck-bar, .grade, .box, footer.site, [data-expand-all], [data-session-done], .unit-done,
.row:has(> [data-show-all]), .lab[data-lab="readtool"], .lab[data-lab="ownwords"], .lab[data-lab="timer"], .lab[data-lab="paper"],
#lab, .textbox > summary, .feedback, .hint, textarea, .panel-intro, .unit-head .row, .no-print { display: none !important; }
.wrap { max-width: none; padding: 0; }
.unit-head { padding: 0 0 4pt; } .unit-head p.lead { font-size: 12pt; max-width: none; margin-bottom: 4pt; }
.panel { display: block !important; padding: 0; }
.panel[hidden] { display: block !important; }
.panel-title { font: 600 15pt "Literata", Georgia, serif; border-bottom: 1.5pt solid #145a62; padding-bottom: 2pt; margin: 12pt 0 6pt; break-after: avoid; }
details.step { border: 0; box-shadow: none; margin: 0 0 4pt; break-inside: auto; }
details.step > summary .sub { display: none; }
details.step > summary { padding: 0; font-size: 13pt; border: 0 !important; break-after: avoid; }
details.step > summary .n { width: 20pt; height: 20pt; font-size: 10pt; transform: none; background: #145a62; color: #fff; }
.step-body { padding: 2pt 0 0 0; }
table.t { font-size: 12pt; margin: 4pt 0 6pt; } table.t th, table.t td { padding: 3pt 6pt; }
.note, .tip-exam { padding: 4pt 8pt; margin: 6pt 0; }
ol, ul { margin: 3pt 0 6pt; padding-left: 18pt; } p { margin: 0 0 5pt; }
.selection { border: 1pt solid #999; padding: 8pt 10pt; font-size: 12pt; line-height: 1.5; max-width: none; }
.selection p[data-p] { margin-bottom: 4pt; }
.ex { border: 0; box-shadow: none; padding: 0; margin: 0 0 8pt; }
.ex-head { margin-bottom: 3pt; border-bottom: 1pt solid #ccc; }
.q { padding: 3pt 0; border: 0; break-inside: avoid; }
.q .qtext { grid-template-columns: 1.8em 1fr auto; }
.lines { margin: 2pt 0 2pt 1.8em; } .lines i { display: block; border-bottom: .6pt solid #999; height: 19pt; }
.ans, .ans[hidden] { display: none !important; }
.p-list { margin: 3pt 0 4pt; padding-left: 18pt; } .p-list li { margin: 1pt 0; }
.p-cats { font-weight: 700; margin: 2pt 0; }
.cards-sheet { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1pt solid #999; }
.cards-sheet > div { padding: 4pt 7pt; border: .5pt solid #bbb; break-inside: avoid; font-size: 12pt; }
.cards-sheet p { margin: 0; }
.cards-sheet b { font-family: "Literata", Georgia, serif; font-size: 12pt; display: block; }
.cards, .card { display: none !important; }
input[type=text] { border: 0; border-bottom: .8pt solid #555; border-radius: 0; width: 8em !important; background: none; }
.key { break-before: page; }
.key h2 { margin-top: 0; }
.key .k { font-size: 12pt; margin: 0 0 3pt; break-inside: avoid; }
.key .k b { color: #145a62; }
.key h3 { font-size: 12.5pt; margin: 8pt 0 3pt; break-after: avoid; }
.scheme { display: inline !important; font-size: 12pt; font-style: italic; color: #444; }
.scheme::before { content: " "; }
`;

(async () => {
  const browser = await chromium.launch();
  for (const sec of ["ls", "se"]) {
    const ctx = await browser.newContext({ colorScheme: "light" });
    await ctx.addInitScript((s) => { try { localStorage.setItem("egp.section", JSON.stringify(s)); localStorage.setItem("egp.theme", '"light"'); } catch (e) {} }, sec);
    const pg = await ctx.newPage();
    await pg.goto(page, { waitUntil: "networkidle" });
    await pg.waitForTimeout(500);
    await pg.addStyleTag({ content: PRINT_CSS });
    await pg.evaluate((sec) => {
      const $$ = (s, r = document) => [...r.querySelectorAll(s)];
      // keep only this section's content
      $$("[data-sec]").forEach((el) => { if (el.dataset.sec !== sec) el.remove(); else el.hidden = false; });
      $$("details").forEach((d) => (d.open = true));
      // the reading text appears once, at the start of Practice 1; Practice 2 refers back to it
      $$("#s2-practice details.textbox").forEach((d) => { const p = document.createElement("p"); p.innerHTML = "<i>Exercises 1 and 2 use the reading text printed in Practice 1.</i>"; d.replaceWith(p); });
      // panel titles
      const titles = { "s1-lesson": "Session 1: Lesson", "s1-cards": "Session 1: Revision cards", "s1-practice": "Session 1: Practice", "s2-lesson": "Session 2: Lesson", "s2-cards": "Session 2: Revision cards", "s2-practice": "Session 2: Practice" };
      Object.entries(titles).forEach(([id, t]) => { const p = document.getElementById(id); if (p) { const h = document.createElement("h2"); h.className = "panel-title"; h.textContent = t; p.prepend(h); } });
      // links that only make sense on screen
      $$("a[data-goto]").forEach((a) => a.replaceWith(document.createTextNode(a.textContent)));
      // answer key collector
      const key = []; let group = null;
      const addKey = (label, html) => { if (!group) return; group.items.push([label, html]); };
      const startGroup = (t) => { group = { t, items: [] }; key.push(group); };
      const letters = "abcdefgh";
      // walk panels in order
      ["s1-lesson", "s1-practice", "s2-lesson", "s2-practice"].forEach((pid) => {
        const panel = document.getElementById(pid); if (!panel) return;
        if (pid.endsWith("lesson")) {
          startGroup(titles[pid] + " (self-checks)");
          let n = 0;
          $$(".lab[data-lab='sort'], .lab[data-lab='match'], .quiz, .lab[data-lab='traps'], .lab[data-lab='fill']", panel).forEach((lab) => {
            n++; const label = "Task " + n;
            const head = document.createElement("p"); head.innerHTML = "<b>" + label + ".</b> ";
            if (lab.matches(".quiz")) {
              const opts = $$(".opts button", lab);
              const ol = document.createElement("ol"); ol.className = "p-list"; ol.type = "a";
              opts.forEach((o) => { const li = document.createElement("li"); li.textContent = o.textContent; ol.appendChild(li); });
              lab.querySelector(".opts").replaceWith(ol);
              lab.prepend(head);
              addKey(label, letters[+lab.dataset.a] + ") " + (lab.dataset.ok || ""));
            } else if (lab.matches("[data-lab='sort']")) {
              const chips = $$(".pool .chip", lab);
              const names = Object.fromEntries($$(".bin", lab).map((b) => [b.dataset.bin, b.querySelector("h4").textContent]));
              const title = lab.querySelector(".lab-title").textContent;
              const ol = document.createElement("ol"); ol.className = "p-list";
              chips.forEach((c) => { const li = document.createElement("li"); li.textContent = c.textContent + "  ______"; ol.appendChild(li); });
              const p = document.createElement("p"); p.className = "p-cats"; p.textContent = "Categories: " + Object.values(names).join(" / ");
              lab.innerHTML = ""; head.innerHTML += title; lab.append(head, p, ol);
              addKey(label, chips.map((c, i) => (i + 1) + ". " + names[c.dataset.bin]).join("; "));
            } else if (lab.matches("[data-lab='match']")) {
              const q = $$("[data-side='q'] .chip", lab), t = $$("[data-side='t'] .chip", lab);
              const title = lab.querySelector(".lab-title").textContent;
              const ol = document.createElement("ol"); ol.className = "p-list"; q.forEach((c) => { const li = document.createElement("li"); li.textContent = c.textContent; ol.appendChild(li); });
              const ol2 = document.createElement("ol"); ol2.className = "p-list"; ol2.type = "A"; t.forEach((c) => { const li = document.createElement("li"); li.textContent = c.textContent; ol2.appendChild(li); });
              lab.innerHTML = ""; head.innerHTML += title + ": match each question word (1–4) with the text words (A–D)."; lab.append(head, ol, ol2);
              addKey(label, q.map((c, i) => (i + 1) + "–" + "ABCD"[t.findIndex((x) => x.dataset.pair === c.dataset.pair)]).join(", "));
            } else if (lab.matches("[data-lab='traps']")) {
              const items = $$(".trap-list .q", lab);
              const ol = document.createElement("ol"); ol.className = "p-list";
              items.forEach((q) => { const li = document.createElement("li"); li.textContent = q.querySelector("p").textContent.replace(/^\d+\.\s*/, "") + "  Trap: ________"; ol.appendChild(li); });
              lab.innerHTML = ""; head.innerHTML += "Name the trap in each false statement (antonym, tense, general/specific, cause/effect, wrong person, wrong order), then correct it."; lab.append(head, ol);
              addKey(label, ((window.EGP_U1_TRAPS || {})[sec] || []).map((d, i) => (i + 1) + ". " + ["Antonym", "Tense", "General/specific", "Cause/effect", "Wrong person", "Wrong order"][d[1]] + ": " + d[2]).join(" "));
            } else if (lab.matches("[data-lab='fill']")) {
              lab.prepend(head);
              addKey(label, $$("input[data-answer]", lab).map((i, k) => (k + 1) + ". " + i.dataset.answer).join("; "));
              $$("[data-check]", lab).forEach((b) => b.remove());
            }
          });
        } else {
          $$(".ex", panel).forEach((ex) => {
            startGroup(titles[pid] + ", " + ex.querySelector("h3").textContent);
            $$(".q", ex).forEach((q, i) => {
              const a = q.querySelector(".ans"); if (!a) return;
              const qn = (q.querySelector(".qn") || {}).textContent || i + 1 + ".";
              addKey(qn.replace(".", ""), a.innerHTML);
              if (q.querySelector("textarea")) { const L = document.createElement("div"); L.className = "lines"; const n = /\(01\)/.test(q.textContent) ? 3 : /\(0\.5\)/.test(q.textContent) ? 1 : 2; L.innerHTML = "<i></i>".repeat(n); q.querySelector("textarea").after(L); }
            });
          });
        }
      });
      // revision cards → compact sheet
      $$(".cards").forEach((deck) => {
        const sheet = document.createElement("div"); sheet.className = "cards-sheet";
        $$(".card", deck).forEach((c) => {
          const d = document.createElement("div");
          const back = c.querySelector(".back").cloneNode(true); back.querySelectorAll(".grade").forEach((g) => g.remove());
          d.innerHTML = "<b>" + c.querySelector(".big").textContent + "</b>" + back.innerHTML; sheet.appendChild(d);
        });
        deck.after(sheet);
      });
      // the key
      const k = document.createElement("section"); k.className = "key wrap";
      k.innerHTML = "<h2>Answer key</h2>" + key.filter((g) => g.items.length).map((g) => "<h3>" + g.t + "</h3>" + g.items.map(([l, h]) => '<p class="k"><b>' + l + ".</b> " + h + "</p>").join("")).join("");
      document.querySelector("main").appendChild(k);
      // header line for the class handout
      const h = document.querySelector(".unit-head .kicker"); h.textContent += sec === "ls" ? ", Life Sciences" : ", Sociology and Economics";
    }, sec);
    const out = path.join(root, "units", unit, `${base}_${sec.toUpperCase()}.pdf`);
    await pg.pdf({ path: out, format: "A4", printBackground: true, margin: { top: "12mm", bottom: "13mm", left: "12mm", right: "12mm" },
      displayHeaderFooter: true, headerTemplate: "<span></span>",
      footerTemplate: '<div style="font:9px Arial;color:#666;width:100%;text-align:center">English G12 · Unit 1 · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>' });
    console.log("wrote", path.relative(root, out));
    await ctx.close();
  }
  await browser.close();
})();
