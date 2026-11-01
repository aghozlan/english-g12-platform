/* Shared live models (labs) used across skill pages and the reading room. One idea per model.
   Each lab is a [data-lab="…"] element; data it needs lives in the page itself. */
(function () {
  "use strict";
  const ready = (fn) => (window.EGP && EGP.ready ? fn() : window.addEventListener("egp-ready", fn, { once: true }));

  ready(() => {
    const { $, $$, esc } = EGP;
    const sec = () => EGP.section();
    if (window.innerWidth > 760) $$("details.toolbox").forEach((d) => (d.open = true));
    const visibleText = (lab) => $$(".selection", lab).find((s) => !s.closest("[data-sec]") || !s.closest("[data-sec]").hidden);

    /* ---------- 1. The paper map and time plan ---------- */
    $$('[data-lab="paper"]').forEach((lab) => {
      const parts = [
        ["A", "Written answers", "4 marks", "Four questions answered in 1–4 complete sentences, in your own words: identify, scan, explain, infer."],
        ["B", "False statements", "1 mark", "Two statements to rewrite correctly, 0.5 each."],
        ["C", "Text analysis", "4 marks", "Pattern of organisation, tone, credibility, audience, thesis, figures of speech."],
        ["D", "Table or graph", "1.5 marks", "A conclusion drawn from a table or graph in 4–5 sentences, with evidence."],
        ["E", "Vocabulary", "1 mark", "Words underlined in the text placed in new sentences; spelling must be correct."],
        ["F", "Reference words", "0.5 mark", "What the bold-typed pronouns refer to."],
        ["W", "Writing", "8 marks", "One essay of 250–300 words from two prompts: content and organisation 3.5, language and style 3.5, tidiness and handwriting 1."]
      ];
      const map = $(".paper-map", lab), info = $(".paper-info", lab);
      if (map) parts.forEach(([k, name, m, d], i) => {
        const b = document.createElement("button");
        b.className = "chip"; b.type = "button"; b.setAttribute("aria-pressed", "false");
        b.innerHTML = "<b>" + (k === "W" ? "Part Two" : k) + "</b>&nbsp;" + esc(name) + ' <span class="muted">' + m + "</span>";
        b.addEventListener("click", () => {
          $$(".chip", map).forEach((c) => c.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
          info.textContent = (k === "W" ? "Part Two, Writing" : "Section " + k + ", " + name) + " (" + m + "). " + d;
        });
        map.appendChild(b);
        if (i === 0) b.click();
      });
      const note = document.createElement("p"); note.className = "muted"; note.style.cssText = "font-size:.85rem;margin:8px 0 0";
      note.textContent = "Marks as in the LS paper of June 2019 (Part One = 12). Sections can vary slightly from year to year.";
      if (info) info.after(note);
    });
    $$('[data-lab="paper"], [data-lab="paper-time"]').forEach((lab) => {
      const r = $('input[type="range"]', lab); if (!r) return;
      const outR = $('[data-out="r"]', lab), outW = $('[data-out="w"]', lab), adv = $('[data-out="advice"]', lab);
      const upd = () => {
        const rv = +r.value, wv = 150 - 15 - rv;
        outR.textContent = rv; outW.textContent = wv;
        let msg, ok = true;
        if (wv < 50) { msg = "Too little for writing: planning, drafting and copying 250–300 words needs at least 50 minutes."; ok = false; }
        else if (rv < 60) { msg = "Tight for reading: 12 marks is 60% of the paper. Give it at least an hour."; ok = false; }
        else msg = "A balanced plan. Reading earns 12 marks, writing 8: roughly " + Math.round(rv / 12 * 10) / 10 + " min per reading mark and " + Math.round(wv / 8 * 10) / 10 + " per writing mark.";
        adv.className = "feedback " + (ok ? "ok" : "no"); adv.textContent = msg;
      };
      r.addEventListener("input", upd); upd();
    });

    /* ---------- 2. Reading tools on a text ---------- */
    $$('[data-lab="readtool"]').forEach((lab) => {
      let mode = null, active = null, linked = 0;
      const out = (k, v) => { const o = $('[data-out="' + k + '"]', lab); if (o) o.textContent = v; };
      const setMode = (m) => {
        mode = mode === m ? null : m;
        $$("[data-tool=main],[data-tool=detail],[data-tool=trace]", lab).forEach((b) => b.setAttribute("aria-pressed", b.dataset.tool === mode ? "true" : "false"));
        $$(".selection", lab).forEach((s) => { s.classList.toggle("marking", mode === "main" || mode === "detail"); s.classList.toggle("tracing", mode === "trace"); });
        if (mode === "trace") out("trace", "Tap a bold word first.");
      };
      const unscan = (t) => $$("mark.scan", t).forEach((m) => m.replaceWith(document.createTextNode(m.textContent)));
      const scan = (q) => {
        const t = visibleText(lab); if (!t) return;
        unscan(t); t.normalize();
        const words = q.toLowerCase().split(/[^a-z0-9'’-]+/).filter((w) => w.length > 2);
        if (!words.length) { out("scan", ""); return; }
        const re = new RegExp("\\b(" + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\w*", "gi");
        let n = 0; const paras = new Set();
        const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, { acceptNode: (nd) => nd.parentElement.closest(".orig, h3, .preview") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
        const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
        nodes.forEach((nd) => {
          if (!re.test(nd.data)) return; re.lastIndex = 0;
          const frag = document.createDocumentFragment(); let last = 0, m;
          while ((m = re.exec(nd.data))) {
            frag.append(nd.data.slice(last, m.index));
            const mk = document.createElement("mark"); mk.className = "scan"; mk.textContent = m[0]; frag.append(mk);
            last = m.index + m[0].length; n++;
            const p = nd.parentElement.closest("p[data-p]"); if (p) paras.add(p.dataset.p);
          }
          frag.append(nd.data.slice(last)); nd.replaceWith(frag);
        });
        out("scan", n ? n + " found in paragraph" + (paras.size > 1 ? "s " : " ") + [...paras].join(", ") : "Not found. Try a synonym.");
        const first = $("mark.scan", t); if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
      };
      $$("[data-tool]", lab).forEach((el) => {
        const tool = el.dataset.tool;
        if (tool === "scan") { let tm; el.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => scan(el.value), 250); }); return; }
        el.addEventListener("click", () => {
          const t = visibleText(lab);
          if (tool === "skim") { const on = el.getAttribute("aria-pressed") !== "true"; el.setAttribute("aria-pressed", on); $$(".selection", lab).forEach((s) => s.classList.toggle("skim", on)); }
          else if (tool === "main" || tool === "detail" || tool === "trace") setMode(tool);
          else if (tool === "clear") { $$(".s", lab).forEach((s) => s.classList.remove("m-main", "m-detail")); $$(".linked,.active,.wrong", lab).forEach((x) => x.classList.remove("linked", "active", "wrong")); linked = 0; out("trace", ""); const f = $('[data-out="main"]', lab); if (f) f.textContent = ""; }
          else if (tool === "checkmain") {
            const ps = $$("p[data-p]", t); let right = 0, marked = 0;
            ps.forEach((p) => { const m = $$(".s.m-main", p); if (m.length) { marked++; if (m.some((s) => s.classList.contains("ts"))) right++; } });
            const f = $('[data-out="main"]', lab);
            f.className = "feedback " + (marked && right === marked ? "ok" : "no");
            f.textContent = marked ? (marked === 1 ? (right ? "The paragraph you marked matches" : "The paragraph you marked does not match") + " the topic sentence." : right + " of the " + marked + " paragraphs you marked match the topic sentence.") + " In exam texts the main idea is usually the first sentence of the paragraph." : "Mark one sentence per paragraph in yellow first.";
          }
        });
      });
      lab.addEventListener("click", (e) => {
        const t = e.target.closest(".selection"); if (!t || !mode) return;
        if (mode === "main" || mode === "detail") {
          const s = e.target.closest(".s"); if (!s) return;
          const cls = mode === "main" ? "m-main" : "m-detail";
          const had = s.classList.contains(cls); s.classList.remove("m-main", "m-detail"); if (!had) s.classList.add(cls);
          return;
        }
        // tracing
        const ref = e.target.closest("b.ref");
        if (ref) { $$("b.ref.active", lab).forEach((r) => r.classList.remove("active")); ref.classList.add("active"); active = ref; out("trace", "Now tap the words “" + ref.textContent + "” refers to."); return; }
        if (!active) { out("trace", "Tap a bold word first."); return; }
        if (!e.target.closest(".s")) return;
        const np = e.target.closest(".np");
        if (np && np.id === active.dataset.ref) {
          if (!active.classList.contains("linked")) linked++;
          np.classList.add("linked"); active.classList.add("linked"); active.classList.remove("active");
          out("trace", "Yes: “" + active.textContent + "” → “" + np.textContent + "”. Linked: " + linked + " of " + $$("b.ref", t).length);
          active = null;
        } else {
          const w = e.target; w.classList && w.classList.add("wrong"); setTimeout(() => w.classList && w.classList.remove("wrong"), 700);
          out("trace", "Not that one. Look at the noun just before “" + active.textContent + "” and check singular or plural.");
        }
      });
    });


    /* ---------- 3. Matching pairs ---------- */
    $$('[data-lab="match"]').forEach((lab) => {
      let pick = null; const fb = $(".feedback", lab);
      lab.addEventListener("click", (e) => {
        const c = e.target.closest(".chip"); if (!c || c.disabled) return;
        const side = c.parentElement.dataset.side;
        if (side === "q") { $$('[data-side="q"] .chip', lab).forEach((x) => x.setAttribute("aria-pressed", "false")); c.setAttribute("aria-pressed", "true"); pick = c; return; }
        if (!pick) { fb.className = "feedback no"; fb.textContent = "Tap a question word first."; return; }
        if (c.dataset.pair === pick.dataset.pair) {
          [c, pick].forEach((x) => { x.classList.add("ok"); x.disabled = true; x.setAttribute("aria-pressed", "false"); });
          pick = null;
          const left = $$('[data-side="q"] .chip:not(:disabled)', lab).length;
          fb.className = "feedback ok"; fb.textContent = left ? "A match. " + left + " to go." : "All matched. Questions borrow ideas, not words: scan for meaning.";
        } else { c.classList.add("no"); setTimeout(() => c.classList.remove("no"), 600); fb.className = "feedback no"; fb.textContent = "Not the same idea. Read the text words again."; }
      });
    });

    /* ---------- 4. Sorters (tap a chip, then a box) ---------- */
    $$('[data-lab="sort"]').forEach((lab) => {
      let pick = null; const fb = $(".feedback", lab);
      const total = $$(".pool .chip", lab).length; let placed = 0;
      $$(".pool .chip", lab).forEach((c) => c.addEventListener("click", () => {
        if (c.closest(".bin")) return;
        $$(".pool .chip", lab).forEach((x) => x.setAttribute("aria-pressed", "false"));
        c.setAttribute("aria-pressed", "true"); pick = c; $$(".bin", lab).forEach((b) => b.classList.add("target"));
      }));
      const drop = (bin) => {
        if (!pick) { fb.className = "feedback no"; fb.textContent = "Tap a question first, then a box."; return; }
        if (pick.dataset.bin === bin.dataset.bin) {
          pick.setAttribute("aria-pressed", "false"); pick.classList.add("ok"); bin.appendChild(pick); placed++;
          fb.className = "feedback ok"; fb.textContent = placed === total ? "All sorted. Read the command word before anything else." : "Right. " + (total - placed) + " left.";
        } else { fb.className = "feedback no"; fb.textContent = "Not this box. Look at the first word of the question, or at what it asks you to produce."; }
        pick = null; $$(".bin", lab).forEach((b) => b.classList.remove("target"));
      };
      $$(".bin", lab).forEach((b) => { b.addEventListener("click", (e) => { if (!e.target.closest(".chip")) drop(b); }); b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); drop(b); } }); });
    });

    /* ---------- 5. Own-words meter ---------- */
    $$('[data-lab="ownwords"]').forEach((lab) => {
      const sel = $("select", lab), orig = $(".ow-orig", lab), ta = $("textarea", lab), bar = $(".meter > i", lab), show = $(".ow-show", lab), adv = $('[data-out="advice"]', lab);
      const set = (k, v) => ($('[data-out="' + k + '"]', lab).textContent = v);
      const toks = (s) => s.toLowerCase().replace(/[’']/g, "'").match(/[a-z0-9']+/g) || [];
      const fill = () => {
        const text = $$(".selection").find((t) => { const w = t.closest("[data-sec]"); return !w || w.dataset.sec === sec(); });
        const sents = text ? $$(".s", text).map((s) => s.textContent.trim()).filter((s) => s.split(" ").length >= 9 && !s.startsWith("“")) : [];
        sel.innerHTML = sents.slice(0, 12).map((s, i) => '<option value="' + i + '">' + esc(s.length > 90 ? s.slice(0, 88) + "…" : s) + "</option>").join("");
        sel._s = sents; pickS();
      };
      const pickS = () => { orig.textContent = (sel._s || [])[+sel.value || 0] || ""; ta.value = ""; meter(); };
      const meter = () => {
        const src = toks(orig.textContent), mine = ta.value, mt = toks(mine);
        const grams = new Set(); for (let i = 0; i + 3 < src.length; i++) grams.add(src.slice(i, i + 4).join(" "));
        const copied = new Array(mt.length).fill(false);
        for (let i = 0; i + 3 < mt.length; i++) if (grams.has(mt.slice(i, i + 4).join(" "))) for (let k = 0; k < 4; k++) copied[i + k] = true;
        const pct = mt.length ? Math.round((copied.filter(Boolean).length / mt.length) * 100) : 0;
        set("pct", pct + "%"); set("words", mt.length); set("sent", (mine.match(/[.!?](\s|$)/g) || []).length);
        bar.style.width = pct + "%"; bar.style.background = pct > 40 ? "var(--no)" : pct > 15 ? "var(--lamp)" : "var(--ok)";
        let j = 0;
        show.innerHTML = esc(mine).replace(/[A-Za-z0-9’']+/g, (w) => (copied[j++] ? '<mark style="background:var(--mark-3)">' + w + "</mark>" : w));
        if (!mt.length) { adv.className = "feedback"; adv.textContent = ""; return; }
        if (pct > 40) { adv.className = "feedback no"; adv.textContent = "Mostly copied. Change the structure: start from a different word, turn a verb into a noun, use synonyms."; }
        else if (pct > 15) { adv.className = "feedback no"; adv.textContent = "Close. Rephrase the highlighted chunks; names and numbers can stay."; }
        else if (mt.length < 5) { adv.className = "feedback"; adv.textContent = "Keep going: write a full sentence."; }
        else { adv.className = "feedback ok"; adv.textContent = "Your own words. Now check: does it still say exactly what the original says?"; }
      };
      sel.addEventListener("change", pickS); ta.addEventListener("input", meter);
      window.addEventListener("egp-section", fill); fill();
    });

    /* ---------- 6. Trap spotter ---------- */
    const TRAPS = ["Antonym", "Tense", "General ↔ specific", "Cause ↔ effect", "Wrong person", "Wrong order"];
    // each traps lab holds <script type="application/json" class="lab-data">{"ls":[[statement, trapIndex, correction, why],…],"se":[…]}</script>
    const labData = (lab) => { try { return JSON.parse(lab.querySelector("script.lab-data").textContent); } catch (e) { return {}; } };
    $$('[data-lab="traps"]').forEach((lab) => {
      const list = $(".trap-list", lab); const DATA = labData(lab); const rows = () => DATA[sec()] || DATA.all || [];
      const render = () => {
        list.innerHTML = rows().map((d, i) =>
          '<div class="q" data-i="' + i + '"><p style="margin:0 0 6px"><b>' + (i + 1) + ".</b> " + esc(d[0]) + '</p><div class="row">' +
          TRAPS.map((t, k) => '<button class="chip" data-k="' + k + '">' + t + "</button>").join("") +
          '</div><div class="feedback"></div></div>').join("");
      };
      list.addEventListener("click", (e) => {
        const b = e.target.closest("[data-k]"); if (!b) return;
        const q = b.closest(".q"), d = rows()[+q.dataset.i], fb = $(".feedback", q);
        $$("[data-k]", q).forEach((x) => x.classList.remove("ok", "no"));
        if (+b.dataset.k === d[1]) { b.classList.add("ok"); fb.className = "feedback ok"; fb.innerHTML = "Yes, " + esc(TRAPS[d[1]].toLowerCase()) + ". " + esc(d[3]) + "<br><b>Correct:</b> " + esc(d[2]); }
        else { b.classList.add("no"); fb.className = "feedback no"; fb.textContent = "Not this trap. Find the exact word or idea that differs from the text."; }
      });
      window.addEventListener("egp-section", render); render();
    });

    /* ---------- 7. Fill in the blanks with a spelling check ---------- */
    const lev = (a, b) => { const m = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { let p = m[0]; m[0] = i; for (let j = 1; j <= b.length; j++) { const t = m[j]; m[j] = Math.min(m[j] + 1, m[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return m[b.length]; };
    $$('[data-lab="fill"]').forEach((lab) => {
      const fb = $(".feedback", lab);
      $("[data-check]", lab).addEventListener("click", () => {
        let right = 0, close = 0; const ins = $$("input[data-answer]", lab);
        ins.forEach((i) => {
          const v = i.value.trim().toLowerCase(), a = i.dataset.answer;
          i.style.borderColor = v === a ? "var(--ok)" : "var(--no)";
          if (v === a) right++; else if (v && lev(v, a) <= 2) close++;
        });
        fb.className = "feedback " + (right === ins.length ? "ok" : "no");
        fb.textContent = right + " of " + ins.length + " correct." + (close ? " " + close + " look like spelling slips: in the official scheme a misspelt word scores zero." : "") + (right === ins.length ? " Perfect spelling too." : "");
      });
    });

    /* ---------- 8. Timer ---------- */
    $$('[data-lab="timer"]').forEach((lab) => {
      const total = (+lab.dataset.minutes || 30) * 60; let left = total, tm = null;
      const out = $(".timer-out", lab);
      const show = () => { out.textContent = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0"); out.style.color = left < 300 ? "var(--no)" : ""; };
      $('[data-timer="start"]', lab).addEventListener("click", (e) => {
        if (tm) { clearInterval(tm); tm = null; e.target.textContent = "Resume"; return; }
        e.target.textContent = "Pause";
        tm = setInterval(() => { left--; show(); if (left === 300) EGP.toast("Five minutes left: check your spelling."); if (left <= 0) { clearInterval(tm); tm = null; EGP.toast("Time. Put the pen down and compare with the answers."); } }, 1000);
      });
      $('[data-timer="reset"]', lab).addEventListener("click", () => { clearInterval(tm); tm = null; left = total; show(); $('[data-timer="start"]', lab).textContent = "Start the " + total / 60 + "-minute timer"; });
      show();
    });
  });
})();
