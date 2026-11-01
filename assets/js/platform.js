/* =========================================================
   English G12 Platform — shared behaviour
   One entry point: EGP.boot(). A sign-in gate can be inserted later by
   setting EGP.gate = async () => { ... } before boot runs (see README).
   ========================================================= */
(function () {
  "use strict";
  const EGP = (window.EGP = window.EGP || {});

  /* ---------- safe storage (per-viewer conveniences only) ---------- */
  EGP.store = {
    get(k, d) { try { const v = localStorage.getItem("egp." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("egp." + k, JSON.stringify(v)); } catch (e) { /* storage blocked: fine */ } }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  EGP.$ = $; EGP.$$ = $$;
  EGP.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- theme ---------- */
  function applyTheme(t) { if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
  applyTheme(EGP.store.get("theme", null));
  EGP.isDark = () => getComputedStyle(document.documentElement).colorScheme === "dark";
  function initTheme() {
    $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
      const next = EGP.isDark() ? "light" : "dark";
      applyTheme(next); EGP.store.set("theme", next);
      window.dispatchEvent(new Event("egp-theme"));
    }));
  }

  /* ---------- section (LS / SE): elements with data-sec show only for that section ---------- */
  EGP.section = () => EGP.store.get("section", "ls");
  function applySection(sec) {
    document.documentElement.dataset.section = sec;
    $$("[data-sec]").forEach((el) => (el.hidden = el.dataset.sec !== sec));
    $$("[data-section-btn]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sectionBtn === sec ? "true" : "false"));
    $$("[data-sec-text]").forEach((el) => { try { el.textContent = JSON.parse(el.dataset.secText)[sec]; } catch (e) { /* ignore */ } });
  }
  function initSection() {
    applySection(EGP.section());
    $$("[data-section-btn]").forEach((b) => b.addEventListener("click", () => {
      EGP.store.set("section", b.dataset.sectionBtn); applySection(b.dataset.sectionBtn);
      window.dispatchEvent(new CustomEvent("egp-section", { detail: b.dataset.sectionBtn }));
      EGP.toast(b.dataset.sectionBtn === "ls" ? "Life Sciences texts" : "Sociology & Economics texts");
    }));
  }

  /* ---------- toast ---------- */
  let toastT;
  EGP.toast = (msg) => {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
  };

  /* ---------- sub-tabs with URL hash; panels announce themselves for lazy labs ---------- */
  function initSubtabs() {
    const tabs = $$(".subtab");
    if (!tabs.length) return;
    const show = (id, push) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.panel === id ? "true" : "false"));
      $$(".panel").forEach((p) => (p.hidden = p.id !== id));
      if (push) history.replaceState(null, "", "#" + id);
      window.dispatchEvent(new CustomEvent("egp-panel", { detail: id }));
      if (push) window.scrollTo(0, 0);
      const cur = tabs.find((t) => t.dataset.panel === id);
      if (cur) cur.scrollIntoView({ block: "nearest", inline: "nearest" });
    };
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.panel, true)));
    const h = location.hash.slice(1);
    show(tabs.some((t) => t.dataset.panel === h) ? h : tabs[0].dataset.panel, false);
    $$("[data-goto]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show(a.dataset.goto, true); }));
    EGP.showPanel = (id) => show(id, true);
  }

  /* ---------- lesson steps: remember which were opened ---------- */
  function initSteps() {
    const key = "steps." + (document.body.dataset.unit || "x");
    const done = EGP.store.get(key, {});
    $$("details.step").forEach((d) => {
      if (done[d.id]) d.dataset.done = "1";
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        done[d.id] = 1; d.dataset.done = "1"; EGP.store.set(key, done);
        window.dispatchEvent(new CustomEvent("egp-open", { detail: d.id }));
      });
    });
    $$("[data-expand-all]").forEach((b) => b.addEventListener("click", () => {
      const all = $$("details.step", b.closest(".panel"));
      const open = all.some((d) => !d.open);
      all.forEach((d) => (d.open = open));
      b.textContent = open ? "Collapse all" : "Expand all";
    }));
  }

  /* ---------- glossary pop-ups: <button class="g" data-g="meaning">word</button> ---------- */
  function initGlossary() {
    let pop = null;
    const close = () => { if (pop) { pop.remove(); pop = null; } };
    document.addEventListener("click", (e) => {
      const g = e.target.closest(".g");
      if (!g) { if (!e.target.closest(".pop")) close(); return; }
      e.preventDefault(); close();
      pop = document.createElement("div"); pop.className = "pop"; pop.setAttribute("role", "tooltip");
      pop.innerHTML = "<b>" + EGP.esc(g.textContent) + "</b>: " + EGP.esc(g.dataset.g);
      document.body.appendChild(pop);
      const r = g.getBoundingClientRect(), w = pop.offsetWidth;
      const left = Math.max(16, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - w - 16));
      pop.style.left = left + "px"; pop.style.top = window.scrollY + r.bottom + 6 + "px";
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    window.addEventListener("resize", close);
  }

  /* ---------- hidden answers: [data-show] reveals the .ans in its .q; [data-show-all] in its .ex ---------- */
  function initAnswers() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-show]");
      if (b) {
        const q = b.closest(".q, .ex, .lab");
        const what = b.dataset.show || "ans";
        const el = q && q.querySelector("." + what);
        if (!el) return;
        if (!b.dataset.label) b.dataset.label = b.textContent;
        el.hidden = !el.hidden;
        b.textContent = el.hidden ? b.dataset.label : (what === "hint" ? "Hide hint" : "Hide answer");
        b.setAttribute("aria-expanded", el.hidden ? "false" : "true");
        return;
      }
      const a = e.target.closest("[data-show-all]");
      if (a) {
        const ex = a.closest(".ex");
        const ans = $$(".ans", ex);
        const open = ans.some((x) => x.hidden);
        ans.forEach((x) => (x.hidden = !open));
        $$("[data-show='ans']", ex).forEach((btn) => { if (!btn.dataset.label) btn.dataset.label = btn.textContent; btn.textContent = open ? "Hide answer" : btn.dataset.label; });
        a.textContent = open ? "Hide all answers" : "Show all answers";
      }
    });
    // keep what the student typed (per exercise question)
    $$("textarea[data-keep]").forEach((t) => {
      const k = "typed." + t.dataset.keep;
      t.value = EGP.store.get(k, "");
      t.addEventListener("input", () => EGP.store.set(k, t.value));
    });
    // "done" tracker per exercise
    const done = EGP.store.get("exdone", {});
    $$(".ex[data-ex]").forEach((ex) => {
      const box = ex.querySelector("input.done");
      if (!box) return;
      box.checked = !!done[ex.dataset.ex];
      box.addEventListener("change", () => { done[ex.dataset.ex] = box.checked ? 1 : 0; EGP.store.set("exdone", done); EGP.checkUnitDone && EGP.checkUnitDone(); });
    });
  }

  /* ---------- self-checks: .quiz with data-a="index", buttons in .opts ---------- */
  function initQuiz() {
    $$(".quiz").forEach((q) => {
      const fb = q.querySelector(".feedback");
      $$(".opts button", q).forEach((b, i) => b.addEventListener("click", () => {
        const right = String(i) === q.dataset.a;
        $$(".opts button", q).forEach((x) => x.classList.remove("ok", "no"));
        b.classList.add(right ? "ok" : "no");
        if (fb) { fb.className = "feedback " + (right ? "ok" : "no"); fb.innerHTML = right ? (q.dataset.ok || "Yes.") : (b.dataset.why || q.dataset.no || "Not quite. Look again."); }
      }));
    });
  }

  /* ---------- flip cards with a gentle spaced-repetition box (1–5) ---------- */
  function initCards() {
    const boxes = EGP.store.get("cards", {});
    const today = Math.floor(Date.now() / 864e5);
    const gap = [0, 0, 1, 3, 7, 14];
    $$(".cards").forEach((deck) => {
      const cards = $$(".card", deck);
      const due = () => cards.filter((c) => { const s = boxes[c.id]; return !s || today >= s.d; }).length;
      const bar = deck.previousElementSibling && deck.previousElementSibling.classList.contains("deck-bar") ? deck.previousElementSibling : null;
      const upd = () => { const n = bar && bar.querySelector("[data-due]"); if (n) n.textContent = due() + " of " + cards.length + " to review today"; };
      cards.forEach((c) => {
        const s = boxes[c.id]; const tag = c.querySelector(".box");
        if (tag) tag.textContent = "Box " + (s ? s.b : 1);
        const front = c.querySelector(".front");
        front.setAttribute("tabindex", "0"); front.setAttribute("role", "button"); front.setAttribute("aria-label", "Flip card: " + front.textContent.trim());
        const flip = () => c.classList.toggle("flipped");
        front.addEventListener("click", flip);
        front.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
        c.querySelector(".back").addEventListener("click", (e) => {
          const g = e.target.closest("[data-grade]");
          if (!g) { if (!e.target.closest("button, a")) flip(); return; }
          const cur = boxes[c.id] ? boxes[c.id].b : 1;
          const b = g.dataset.grade === "again" ? 1 : Math.min(5, cur + (g.dataset.grade === "easy" ? 2 : 1));
          boxes[c.id] = { b, d: today + gap[b] }; EGP.store.set("cards", boxes);
          if (tag) tag.textContent = "Box " + b;
          c.classList.remove("flipped"); upd();
        });
      });
      upd();
      if (bar) {
        const fa = bar.querySelector("[data-flip-all]");
        if (fa) fa.addEventListener("click", () => { const any = cards.some((c) => !c.classList.contains("flipped")); cards.forEach((c) => c.classList.toggle("flipped", any)); });
        const sh = bar.querySelector("[data-due-first]");
        if (sh) sh.addEventListener("click", () => {
          cards.sort((a, b) => ((boxes[a.id] || { d: 0 }).d - (boxes[b.id] || { d: 0 }).d)).forEach((c) => deck.appendChild(c));
          EGP.toast("Cards due today are first");
        });
      }
    });
  }

  /* ---------- progress (sessions finished), used by the Year Journey ---------- */
  EGP.progress = () => EGP.store.get("progress", {});
  EGP.markSession = (unit, s, val = true) => { const p = EGP.progress(); p[unit] = p[unit] || {}; p[unit][s] = val; EGP.store.set("progress", p); };
  function initSessionDone() {
    $$("[data-session-done]").forEach((b) => {
      const [unit, s] = b.dataset.sessionDone.split(":");
      const set = () => { const v = !!(EGP.progress()[unit] || {})[s]; b.setAttribute("aria-pressed", v ? "true" : "false"); b.textContent = v ? "Session finished ✓" : "Mark this session as finished"; };
      set();
      b.addEventListener("click", () => {
        const v = !(EGP.progress()[unit] || {})[s];
        EGP.markSession(unit, s, v); set();
        const p = EGP.progress()[unit] || {};
        if (v && p.s1 && p.s2) EGP.celebrate && EGP.celebrate(unit); else if (v) EGP.toast("Saved. Your lighthouse is getting brighter.");
      });
    });
  }

  /* ---------- visits: a gentle streak (never punishing) ---------- */
  EGP.visit = () => {
    const today = Math.floor(Date.now() / 864e5 + 2 / 24); // Beirut-ish day boundary
    const v = EGP.store.get("visits", { last: 0, streak: 0, days: 0 });
    if (v.last !== today) { v.streak = v.last === today - 1 ? v.streak + 1 : 1; v.days += 1; v.gapBefore = v.last ? today - v.last : 0; v.last = today; EGP.store.set("visits", v); }
    return v;
  };

  /* ---------- boot ---------- */
  EGP.gate = EGP.gate || (async () => true);
  EGP.boot = async () => {
    initTheme(); initSection();
    const ok = await EGP.gate();
    if (!ok) return;
    initSubtabs(); initSteps(); initGlossary(); initAnswers(); initQuiz(); initCards(); initSessionDone();
    EGP.visit();
    window.dispatchEvent(new Event("egp-ready"));
    EGP.ready = true;
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", EGP.boot); else EGP.boot();
})();
