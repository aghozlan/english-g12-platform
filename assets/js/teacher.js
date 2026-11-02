/* =========================================================
   Teacher dashboard: reads the Google Sheet through the Apps Script web app
   (window.EGP_TRACK_URL + ?key=teacher password) and shows who is studying,
   for how long, and which skills the class is ready for.
   ========================================================= */
(function () {
  "use strict";
  const go = () => {
    const { $, $$, esc } = EGP;
    const URL = window.EGP_TRACK_URL;
    const root = $("#dash"), login = $("#login"), msg = $("#login-msg");
    let data = null, sortKey = "last", sortDir = -1, openId = null;
    const F = { cls: "", sec: "", q: "", period: "all" };

    if (!URL) { login.hidden = true; $("#not-connected").hidden = false; return; }

    /* ---------- names for pages, skills and texts ---------- */
    const SK = {}; (window.EGP_SKILLS || []).forEach((k) => (SK[k.id] = k));
    const TX = {}; (window.EGP_TEXTS || []).forEach((t) => (TX[t.id] = t));
    const pageName = (p) => {
      p = String(p || "");
      let m = p.match(/skills\/([a-z-]+)/); if (m) return SK[m[1]] ? SK[m[1]].title : m[1];
      m = p.match(/reading\/([a-z-]+)/); if (m) return TX[m[1]] ? TX[m[1]].title : m[1];
      if (/reading\/?$/.test(p)) return "Reading room";
      if (/writing/.test(p)) return "Writing studio";
      return "The paper";
    };
    const ago = (iso) => {
      const s = (Date.now() - new Date(iso)) / 1000;
      if (isNaN(s)) return "–";
      if (s < 300) return "online now";
      if (s < 3600) return Math.round(s / 60) + " min ago";
      if (s < 86400) return Math.round(s / 3600) + " h ago";
      if (s < 86400 * 7) return Math.round(s / 86400) + " d ago";
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };
    const mins = (m) => { m = Number(m) || 0; if (m > 0 && m < 1) return "<1 min"; return m < 60 ? Math.round(m) + " min" : Math.floor(m / 60) + " h " + String(Math.round(m % 60)).padStart(2, "0"); };
    const online = (s) => Date.now() - new Date(s.last) < 300000;

    /* ---------- load ---------- */
    async function load(key) {
      msg.textContent = "Loading…";
      try {
        const r = await fetch(URL + "?key=" + encodeURIComponent(key), { cache: "no-store" });
        const j = await r.json();
        if (!j.ok) { msg.textContent = j.error === "wrong password" ? "Wrong password." : "The Sheet answered with an error: " + (j.error || "unknown"); login.hidden = false; root.hidden = true; return false; }
        data = j; EGP.store.set("teacherKey", key);
        login.hidden = true; root.hidden = false; msg.textContent = "";
        $("#sheet-link").href = j.sheet || "#";
        render(); return true;
      } catch (e) { msg.textContent = "Could not reach the Sheet. Check the connection and try again."; login.hidden = false; return false; }
    }
    $("#login-form").addEventListener("submit", (e) => { e.preventDefault(); load($("#key").value.trim()); });
    $("#refresh").addEventListener("click", () => load(EGP.store.get("teacherKey", "")));
    $("#forget").addEventListener("click", () => { EGP.store.set("teacherKey", ""); location.reload(); });
    setInterval(() => { if (!root.hidden && document.visibilityState === "visible") load(EGP.store.get("teacherKey", "")); }, 120000);

    /* ---------- filters ---------- */
    ["f-cls", "f-sec", "f-q", "f-period"].forEach((id) => $("#" + id).addEventListener("input", () => {
      F.cls = $("#f-cls").value; F.sec = $("#f-sec").value; F.q = $("#f-q").value.trim().toLowerCase(); F.period = $("#f-period").value; render();
    }));
    const inPeriod = (iso) => {
      const d = Date.now() - new Date(iso);
      return F.period === "all" || (F.period === "today" && new Date(iso).toDateString() === new Date().toDateString()) || (F.period === "week" && d < 7 * 864e5) || (F.period === "month" && d < 30 * 864e5);
    };
    const pass = (s) => (!F.cls || (F.cls === "-" ? !s.cls : s.cls === F.cls)) && (!F.sec || s.section === F.sec) && (!F.q || String(s.name).toLowerCase().includes(F.q)) && inPeriod(s.last);

    /* ---------- render ---------- */
    function render() {
      const all = data.students || [];
      // class filter options
      const codes = [...new Set(all.map((s) => s.cls).filter(Boolean))].sort();
      const sel = $("#f-cls"), keep = sel.value;
      sel.innerHTML = '<option value="">All classes</option>' + codes.map((c) => '<option value="' + esc(c) + '">' + esc(c) + "</option>").join("") + '<option value="-">No class code</option>';
      sel.value = keep;
      const list = all.filter(pass);
      const ids = new Set(list.map((s) => s.id));
      const evs = (data.events || []).filter((e) => ids.has(e.id));

      // tiles
      const today = list.filter((s) => new Date(s.last).toDateString() === new Date().toDateString()).length;
      const week = list.filter((s) => Date.now() - new Date(s.last) < 7 * 864e5).length;
      const totalMin = list.reduce((a, s) => a + (Number(s.minutes) || 0), 0);
      const avg = list.length ? list.reduce((a, s) => a + (Number(s.marks) || 0), 0) / list.length : 0;
      $("#tiles").innerHTML = [
        ["Students", list.length, "who entered"], ["Online now", list.filter(online).length, "in the last 5 minutes"], ["Active today", today, ""],
        ["This week", week, "active in 7 days"], ["Study time", mins(totalMin), "in total"], ["Average ready", (Math.round(avg * 4) / 4) + " / 20", "marks per student"]
      ].map((t) => '<div class="tile"><span class="lbl">' + t[0] + '</span><span class="val">' + t[1] + "</span>" + (t[2] ? '<span class="sub">' + t[2] + "</span>" : "") + "</div>").join("");

      // table
      const val = { name: (s) => String(s.name).toLowerCase(), marks: (s) => Number(s.marks) || 0, skills: (s) => Number(s.readyCount) || 0, minutes: (s) => Number(s.minutes) || 0, visits: (s) => Number(s.visits) || 0, last: (s) => new Date(s.last).getTime() || 0, cls: (s) => s.cls || "" };
      list.sort((a, b) => (val[sortKey](a) > val[sortKey](b) ? 1 : val[sortKey](a) < val[sortKey](b) ? -1 : 0) * sortDir);
      $("#rows").innerHTML = list.length ? list.map((s) => {
        const m = Number(s.marks) || 0;
        return '<tr data-id="' + esc(s.id) + '" tabindex="0"' + (openId === s.id ? ' class="open"' : "") + "><td><b>" + esc(s.name) + "</b>" + (online(s) ? ' <span class="dot" title="Online now"></span>' : "") + "</td>" +
          "<td>" + esc(s.section) + "</td><td>" + (s.cls ? esc(s.cls) : '<span class="muted">–</span>') + "</td>" +
          '<td class="barcell" title="' + m + ' of 20 marks ready"><span class="mbar"><i style="width:' + (m / 20 * 100) + '%"></i></span><span class="num">' + m + "</span></td>" +
          '<td class="num">' + (s.readyCount || 0) + '</td><td class="num">' + mins(s.minutes) + '</td><td class="num">' + (s.visits || 0) + "</td><td>" + ago(s.last) + "</td></tr>";
      }).join("") : '<tr><td colspan="8" class="muted" style="padding:18px">No student matches these filters yet.</td></tr>';
      $$("#tbl th[data-k]").forEach((th) => th.setAttribute("aria-sort", th.dataset.k === sortKey ? (sortDir > 0 ? "ascending" : "descending") : "none"));

      // skills across the class
      const n = list.length || 1;
      $("#skills").innerHTML = (window.EGP_PAPER || []).map((p) => p.sections.map((s) => {
        const rows = s.skills.map((k) => {
          const c = list.filter((st) => st.ready.includes(k.id)).length, pct = Math.round(c / n * 100);
          return '<div class="srow" title="' + esc(k.title) + ": " + c + " of " + list.length + ' students ready"><span class="sname">' + esc(k.title) + '</span><span class="sbar"><i style="width:' + pct + '%"></i></span><span class="num">' + c + "</span></div>";
        }).join("");
        return '<div class="sgroup"><h4>' + (s.letter ? "Section " + s.letter + ": " : "") + esc(s.title) + "</h4>" + rows + "</div>";
      }).join("")).join("");
      $("#skills-n").textContent = list.length ? "of " + list.length + " student" + (list.length > 1 ? "s" : "") + " ready" : "";

      // activity
      $("#feed").innerHTML = evs.slice(-60).reverse().map(eventRow).join("") || '<li class="muted">No activity yet.</li>';
      if (openId) detail(openId);
    }

    function eventRow(e) {
      const t = { join: "joined the platform", enter: "started a visit", page: "opened " + pageName(e.p), time: "studied " + mins((Number(e.s) || 0) / 60) + " on " + pageName(e.p), ready: "is ready for " + (SK[e.d] ? SK[e.d].title : e.d), unready: "unmarked " + (SK[e.d] ? SK[e.d].title : e.d), done: "finished the questions of " + (TX[String(e.d).replace(/^rr-/, "")] ? TX[String(e.d).replace(/^rr-/, "")].title : e.d), profile: "updated their details" }[e.t] || e.t;
      return '<li><span class="when">' + ago(e.at) + "</span> <b>" + esc(e.name) + "</b> " + esc(t) + "</li>";
    }

    /* ---------- one student ---------- */
    function detail(id) {
      const s = (data.students || []).find((x) => x.id === id); const box = $("#detail");
      if (!s) { box.hidden = true; return; }
      openId = id; box.hidden = false;
      const sections = (window.EGP_PAPER || []).map((p) => p.sections.map((sec) => {
        const items = sec.skills.map((k) => '<li class="' + (s.ready.includes(k.id) ? "y" : "n") + '">' + esc(k.title) + "</li>").join("");
        return "<div><h4>" + (sec.letter ? "Section " + sec.letter : esc(sec.title)) + "</h4><ul class=\"autocheck\">" + items + "</ul></div>";
      }).join("")).join("");
      const mine = (data.events || []).filter((e) => e.id === id).slice(-25).reverse();
      box.innerHTML = '<div class="d-head"><div><h3>' + esc(s.name) + "</h3><p class=\"muted\">" + esc(s.section) + (s.cls ? " · " + esc(s.cls) : "") + " · first seen " + new Date(s.first).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " · last seen " + ago(s.last) + '</p></div><button class="btn small ghost" type="button" id="d-close">Close</button></div>' +
        '<div class="d-stats"><span><b class="hand">' + (s.marks || 0) + "</b> / 20 ready</span><span><b>" + (s.readyCount || 0) + "</b> skills</span><span><b>" + mins(s.minutes) + "</b> study</span><span><b>" + (s.visits || 0) + "</b> visits</span><span><b>" + s.texts.length + "</b> texts done</span></div>" +
        '<div class="d-grid">' + sections + "</div>" +
        '<h4 style="margin-top:14px">Recent activity</h4><ul class="feed">' + (mine.map(eventRow).join("") || '<li class="muted">No activity in the recent log.</li>') + "</ul>";
      $("#d-close").addEventListener("click", () => { openId = null; box.hidden = true; $$("#rows tr.open").forEach((r) => r.classList.remove("open")); });
      $$("#rows tr").forEach((r) => r.classList.toggle("open", r.dataset.id === id));
    }
    $("#rows").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) { detail(tr.dataset.id); $("#detail").scrollIntoView({ behavior: "smooth", block: "nearest" }); } });
    $("#rows").addEventListener("keydown", (e) => { if (e.key === "Enter") { const tr = e.target.closest("tr[data-id]"); if (tr) detail(tr.dataset.id); } });
    $$("#tbl th[data-k]").forEach((th) => th.addEventListener("click", () => { if (sortKey === th.dataset.k) sortDir *= -1; else { sortKey = th.dataset.k; sortDir = th.dataset.k === "name" || th.dataset.k === "cls" ? 1 : -1; } render(); }));

    const saved = EGP.store.get("teacherKey", "");
    if (saved) load(saved); else login.hidden = false;
  };
  if (window.EGP && EGP.ready) go(); else window.addEventListener("egp-ready", go, { once: true });
})();
