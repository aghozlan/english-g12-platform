/* =========================================================
   Entering the platform, and keeping the teacher informed.
   - First visit: a welcome card asks for name, section and an optional class code.
     The profile stays on this device; every page then opens directly.
   - Progress (skills ready, marks, texts done), pages opened and active study time
     are queued on the device and sent in small batches to the teacher's Google Sheet
     (window.EGP_TRACK_URL). Nothing is lost on a weak connection: the queue waits.
   Must load BEFORE platform.js: it sets EGP.gate, which EGP.boot() awaits.
   ========================================================= */
(function () {
  "use strict";
  const EGP = (window.EGP = window.EGP || {});
  const get = (k, d) => { try { const v = localStorage.getItem("egp." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem("egp." + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const newId = () => { let s = ""; const a = "abcdefghijklmnopqrstuvwxyz0123456789"; const r = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(16)) : Array.from({ length: 16 }, () => Math.random() * 256); for (const x of r) s += a[x % 36]; return s; };

  EGP.profile = () => get("profile", null);

  /* ---------------- the welcome card ---------------- */
  function card(existing) {
    return new Promise((resolve) => {
      const p = existing || {};
      const sec = p.section || get("section", "ls");
      const wrap = document.createElement("div");
      wrap.className = "enter-back";
      wrap.innerHTML =
        '<form class="enter" aria-labelledby="enter-h" novalidate>' +
        '<h2 id="enter-h">' + (existing ? "Your details" : "Welcome to English G12") + "</h2>" +
        (existing ? "" : '<p class="muted">The official English paper, skill by skill, for Grade 12 LS and SE students. Tell us who you are to begin.</p>') +
        '<label for="en-name">Your name</label><input id="en-name" name="name" type="text" autocomplete="name" maxlength="40" required placeholder="First and last name" value="' + esc(p.name || get("name", "")) + '">' +
        '<fieldset><legend>Your section</legend><label class="opt"><input type="radio" name="sec" value="ls"' + (sec === "ls" ? " checked" : "") + "> Life Sciences (LS)</label>" +
        '<label class="opt"><input type="radio" name="sec" value="se"' + (sec === "se" ? " checked" : "") + "> Sociology and Economics (SE)</label></fieldset>" +
        '<label for="en-cls">Class code <span class="muted">(optional, if your teacher gave you one)</span></label><input id="en-cls" name="cls" type="text" maxlength="20" autocomplete="off" placeholder="e.g. SAIDA-LS1" value="' + esc(p.cls || "") + '">' +
        '<p class="err" role="alert"></p>' +
        '<button class="btn" type="submit">' + (existing ? "Save" : "Enter") + "</button>" + (existing ? ' <button class="btn ghost" type="button" data-cancel>Cancel</button>' : "") +
        '<p class="fine">Your name, class code and your progress on this site are saved to help your teacher follow your work. Your answers and essays stay on this device.</p>' +
        "</form>";
      document.body.appendChild(wrap);
      document.documentElement.classList.add("entering");
      const f = wrap.querySelector("form"), nm = f.querySelector("#en-name"), err = f.querySelector(".err");
      setTimeout(() => nm.focus(), 50);
      const close = () => { wrap.remove(); document.documentElement.classList.remove("entering"); };
      const cancel = f.querySelector("[data-cancel]");
      if (cancel) cancel.addEventListener("click", () => { close(); resolve(null); });
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nm.value.replace(/\s+/g, " ").trim();
        if (name.length < 2) { err.textContent = "Please write your name."; nm.focus(); return; }
        const prof = { id: p.id || newId(), name, section: f.sec.value, cls: f.cls.value.replace(/\s+/g, "").toUpperCase(), since: p.since || Date.now() };
        set("profile", prof); set("name", name.split(" ")[0]); set("section", prof.section);
        close(); resolve(prof);
      });
    });
  }

  EGP.editProfile = async () => {
    const prof = await card(EGP.profile());
    if (!prof) return;
    document.documentElement.dataset.section = prof.section;
    queue({ t: "profile", p: page(), d: prof.name + " · " + prof.section.toUpperCase() + (prof.cls ? " · " + prof.cls : "") });
    flush();
    location.reload();
  };

  /* The gate: pages with <body data-nogate> (the teacher page) skip it. */
  EGP.gate = async () => {
    if (document.body.hasAttribute("data-nogate")) return true;
    let prof = EGP.profile();
    if (!prof) { prof = await card(null); queue({ t: "join", p: page(), d: prof.name }); }
    document.documentElement.dataset.section = prof.section;
    startTracking();
    return true;
  };

  /* ---------------- tracking ---------------- */
  const page = () => location.pathname.replace(/^.*?english-g12-platform/, "").replace(/index\.html$/, "") || "/";
  function queue(ev) {
    const q = get("q", []);
    ev.at = ev.at || Date.now();
    q.push(ev);
    set("q", q.slice(-200)); // keep the newest 200 if the device stays offline for long
  }
  function state() {
    const ready = Object.keys(get("ready", {}));
    const done = Object.keys(get("exdone", {})).filter((k) => k.startsWith("rr-") && get("exdone", {})[k]).map((k) => k.slice(3));
    let marks = 0;
    try { marks = EGP.marks ? EGP.marks().total : 0; } catch (e) { /* catalog not loaded */ }
    return { ready, marks, texts: done };
  }
  let sending = false;
  function flush(beacon) {
    const url = window.EGP_TRACK_URL, prof = EGP.profile();
    if (!url || !prof || sending) return;
    const q = get("q", []);
    if (!q.length) return;
    const batch = q.slice(0, 60);
    const body = JSON.stringify({ app: "egp", profile: { id: prof.id, name: prof.name, section: prof.section, cls: prof.cls }, state: state(), events: batch });
    const drop = () => { const now = get("q", []); set("q", now.slice(batch.length)); };
    if (beacon && navigator.sendBeacon) {
      if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain;charset=utf-8" }))) drop();
      return;
    }
    if (!navigator.onLine) return;
    sending = true;
    fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, keepalive: true })
      .then(drop).catch(() => { /* try again later */ }).finally(() => { sending = false; });
  }
  EGP.flush = flush;

  let started = false;
  function startTracking() {
    if (started) return; started = true;
    // a new visit if nothing happened for 30 minutes
    const last = get("lastActive", 0);
    if (Date.now() - last > 30 * 60 * 1000) queue({ t: "enter", p: page(), d: document.title.replace(/ · English G12$/, "") });
    set("lastActive", Date.now());
    queue({ t: "page", p: page(), d: document.title.replace(/ · English G12$/, "") });

    // active time: counted while the page is visible and the student did something in the last 90 s
    let active = 0, lastInput = Date.now();
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((t) => window.addEventListener(t, () => (lastInput = Date.now()), { passive: true }));
    const audioPlaying = () => [...document.querySelectorAll("audio")].some((a) => !a.paused);
    setInterval(() => {
      if (document.visibilityState === "visible" && (Date.now() - lastInput < 90000 || audioPlaying())) { active += 5; set("lastActive", Date.now()); }
    }, 5000);
    const pushTime = () => { if (active >= 5) { queue({ t: "time", p: page(), s: active }); active = 0; } };
    setInterval(() => { pushTime(); flush(); }, 180000); // every 3 minutes
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { pushTime(); flush(true); } });
    window.addEventListener("pagehide", () => { pushTime(); flush(true); });

    // progress
    window.addEventListener("egp-ready-change", () => {
      const now = Object.keys(get("ready", {})), before = get("readySent", []);
      now.filter((k) => !before.includes(k)).forEach((k) => queue({ t: "ready", p: page(), d: k }));
      before.filter((k) => !now.includes(k)).forEach((k) => queue({ t: "unready", p: page(), d: k }));
      set("readySent", now); flush();
    });
    document.addEventListener("change", (e) => {
      const box = e.target.closest && e.target.closest(".ex[data-ex] input.done");
      if (box && box.checked) { queue({ t: "done", p: page(), d: box.closest(".ex").dataset.ex }); flush(); }
    });
    window.addEventListener("egp-ready", () => {
      // the name chip in the top bar
      const prof = EGP.profile(); if (!prof) return;
      const bar = document.querySelector(".topbar .wrap");
      if (bar && !bar.querySelector(".who")) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "who"; b.title = "Your details";
        b.innerHTML = '<span class="ini">' + esc(prof.name.trim().charAt(0).toUpperCase()) + '</span><span class="nm">' + esc(prof.name.split(" ")[0]) + "</span>";
        b.setAttribute("aria-label", "Your details: " + prof.name);
        b.addEventListener("click", EGP.editProfile);
        bar.appendChild(b);
      }
      setTimeout(() => flush(), 1500);
    }, { once: true });
    window.addEventListener("online", () => flush());
  }
})();
