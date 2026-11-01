/* =========================================================
   Writing studio: choose a real prompt, build the essay on its outline,
   watch it assemble with a live word count, run automatic checks,
   and estimate your mark against the official criteria (3.5 / 3.5 / 1).
   Drafts are kept on this device only.
   ========================================================= */
(function () {
  "use strict";
  const go = () => {
    const W = window.EGP_WRITING, { $, $$, esc } = EGP;
    const sel = $("#prompt"), shown = $("#prompt-text"), form = $("#outline"), draft = $("#draft"), wc = $("#wc"), bar = $("#wcbar i");
    const checks = $("#checks"), rub = $("#rubric"), est = $("#estimate"), pal = $("#palette"), model = $("#model-link");
    const GN = { argumentative: "Argumentative", persuasive: "Persuasive", "problem-solution": "Problem-solution", "cause-effect": "Cause-effect", expository: "Expository (past papers)" };
    let cur = null, lastField = null;

    // prompt list, your section first
    function fillPrompts() {
      const sec = EGP.section(), want = new URLSearchParams(location.search).get("g");
      const order = Object.keys(GN);
      const ps = W.prompts.slice().sort((a, b) => order.indexOf(a.g) - order.indexOf(b.g) || (a.sec === sec ? -1 : 1) - (b.sec === sec ? -1 : 1));
      let html = "", g = null;
      ps.forEach((p) => {
        if (p.g !== g) { if (g) html += "</optgroup>"; g = p.g; html += '<optgroup label="' + GN[g] + '">'; }
        html += '<option value="' + p.id + '">' + esc(p.src) + ": " + esc(p.text.slice(0, 70)) + "…</option>";
      });
      sel.innerHTML = html + "</optgroup>";
      const saved = EGP.store.get("studio.prompt", null);
      const first = (want && ps.find((p) => p.g === want && p.sec === sec)) || (want && ps.find((p) => p.g === want)) || ps.find((p) => p.id === saved) || ps.find((p) => p.sec === sec) || ps[0];
      sel.value = first.id;
    }

    function load() {
      cur = W.prompts.find((p) => p.id === sel.value);
      EGP.store.set("studio.prompt", cur.id);
      shown.innerHTML = esc(cur.text) + '<span class="src">' + esc(cur.src) + " · " + GN[cur.g] + "</span>";
      const saved = EGP.store.get("studio.draft." + cur.id, {});
      const ol = W.outlines[cur.g];
      form.innerHTML = ol.map((blk, i) =>
        '<fieldset data-b="' + i + '"><legend>' + esc(blk.t) + "</legend>" +
        blk.parts.map((part, j) => { const id = "f" + i + "-" + j; return '<label class="part" for="' + id + '">' + esc(part) + '</label><textarea id="' + id + '" data-b="' + i + '" rows="2">' + esc(saved[id] || "") + "</textarea>"; }).join("") +
        "</fieldset>").join("");
      model.innerHTML = cur.g !== "expository" ? 'Compare with the <a href="' + EGP.url("skills/" + cur.g + "/index.html") + '#model">model ' + GN[cur.g].toLowerCase() + " essay</a>." : "Expository prompts follow the persuasive outline. See the <a href=\"" + EGP.url("skills/cause-effect/index.html") + "\">cause-effect page</a> for notes.";
      renderRubric(); update();
    }

    function text() {
      const ol = W.outlines[cur.g];
      return ol.map((_, i) => $$('textarea[data-b="' + i + '"]', form).map((t) => t.value.trim()).filter(Boolean).join(" ")).filter(Boolean);
    }
    const words = (s) => (s.match(/[A-Za-z0-9’'-]+/g) || []).length;

    function update() {
      const paras = text(), all = paras.join(" "), n = words(all);
      draft.innerHTML = paras.length ? paras.map((p) => "<p>" + esc(p) + "</p>").join("") : '<p class="empty">Your essay appears here as you write each part.</p>';
      wc.className = "wc " + (n < 250 ? "low" : n > 300 ? "high" : "ok");
      wc.querySelector(".n").textContent = n;
      wc.querySelector(".m").textContent = n < 250 ? (n ? 250 - n + " words to go" : "Target: 250–300 words") : n > 300 ? n - 300 + " words over: cut" : "In range";
      bar.style.width = Math.min(100, (n / 350) * 100) + "%";
      // save
      const save = {}; $$("textarea", form).forEach((t) => { if (t.value) save[t.id] = t.value; });
      EGP.store.set("studio.draft." + cur.id, save);
      // automatic checks
      const ol = W.outlines[cur.g];
      const contractions = all.match(/\b\w+(n[’']t|[’'](re|ve|ll|m|d))\b|\b(it|that|there|what|he|she)[’']s\b/gi) || [];
      const flat = [].concat(...W.connectors.map((c) => c[1])).map((w) => w.replace(/[,]$/, ""));
      const used = flat.filter((w) => new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(all));
      const thesis = ($("#f0-2", form) || {}).value || "";
      const topics = ol.map((b, i) => (b.k === "body" || b.k === "counter") ? (($("#f" + i + "-0", form) || {}).value || "").trim() : "x").every(Boolean);
      const long = (all.match(/[^.!?]+[.!?]/g) || []).filter((s) => words(s) > 40).length;
      const items = [
        [n >= 250 && n <= 300, "Length: " + n + " words (250–300)."],
        [paras.length >= ol.length, "Paragraphs: " + paras.length + " of " + ol.length + " written."],
        [thesis.trim().length > 20 && !/\?\s*$/.test(thesis.trim()), "Thesis statement written, and it is not a question."],
        [topics, "Every body paragraph has a topic sentence."],
        [cur.g !== "argumentative" || ol.some((b, i) => b.k === "counter" && $$('textarea[data-b="' + i + '"]', form).some((t) => /however|but|yet|nevertheless|on the contrary/i.test(t.value))), "Argumentative: the counter claim is answered with a refutation (however, yet…)."],
        [contractions.length === 0, contractions.length ? "Contractions to expand: " + [...new Set(contractions)].slice(0, 5).join(", ") : "No contractions."],
        [used.length >= 4, "Connectors used: " + used.length + (used.length ? " (" + used.slice(0, 6).join(", ") + ")" : "") + "."],
        [long === 0, long ? long + " sentence(s) over 40 words: split them." : "No overlong sentences."]
      ];
      checks.innerHTML = items.filter((x, i) => i !== 4 || cur.g === "argumentative").map((x) => '<li class="' + (x[0] ? "y" : "n") + '">' + esc(x[1]) + "</li>").join("");
    }

    function renderRubric() {
      const ticks = EGP.store.get("studio.rubric." + cur.id, {});
      rub.innerHTML = W.rubric.map((c, i) => "<h4><span>" + esc(c.c) + '</span><span class="hand">' + c.max + "</span></h4>" +
        c.items.map((it, j) => '<label><input type="checkbox" data-k="' + i + "-" + j + '"' + (ticks[i + "-" + j] ? " checked" : "") + "> <span>" + esc(it[0]) + "</span></label>").join("")).join("");
      score();
    }
    function score() {
      const ticks = {}; let s = 0;
      $$("input[data-k]", rub).forEach((b) => { if (b.checked) { ticks[b.dataset.k] = 1; const [i, j] = b.dataset.k.split("-"); s += W.rubric[i].items[j][1]; } });
      EGP.store.set("studio.rubric." + cur.id, ticks);
      est.textContent = "≈ " + (Math.round(s * 4) / 4) + " / 8";
    }

    // connectors palette
    pal.innerHTML = W.connectors.map((c) => '<div class="grp"><span>' + esc(c[0]) + "</span>" + c[1].map((w) => '<button type="button" class="chip" data-ins="' + esc(w) + '">' + esc(w) + "</button>").join("") + "</div>").join("");
    pal.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ins]"); if (!b) return;
      const t = lastField || $("textarea", form); if (!t) return;
      const a = t.selectionStart ?? t.value.length, z = t.selectionEnd ?? t.value.length;
      const before = t.value.slice(0, a), ins = (before && !/\s$/.test(before) ? " " : "") + b.dataset.ins + " ";
      t.value = before + ins + t.value.slice(z); t.focus(); t.selectionStart = t.selectionEnd = a + ins.length; update();
    });

    form.addEventListener("input", update);
    form.addEventListener("focusin", (e) => { if (e.target.tagName === "TEXTAREA") lastField = e.target; });
    rub.addEventListener("change", score);
    sel.addEventListener("change", load);
    $("#copy").addEventListener("click", async () => {
      const t = text().join("\n\n");
      try { await navigator.clipboard.writeText(t); EGP.toast("Essay copied"); } catch (e) { EGP.toast("Select the essay text to copy it"); }
    });
    $("#clear").addEventListener("click", () => {
      if (!confirm("Clear this draft? This cannot be undone.")) return;
      $$("textarea", form).forEach((t) => (t.value = "")); update(); EGP.toast("Draft cleared");
    });
    $("#print").addEventListener("click", () => window.print());
    window.addEventListener("egp-section", () => { fillPrompts(); load(); });
    fillPrompts(); load();
  };
  if (window.EGP && EGP.ready) go(); else window.addEventListener("egp-ready", go, { once: true });
})();
