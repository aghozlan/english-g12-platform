/* Skill page chrome: where this skill sits on the paper, its marks, the "ready"
   button (unlocked once every question in "Check yourself" is answered correctly),
   and links to the previous and next skills. Reads <body data-skill="id">. */
(function () {
  "use strict";
  const go = () => {
    const id = document.body.dataset.skill;
    const all = window.EGP_SKILLS || [];
    const k = all.find((x) => x.id === id); if (!k) return;
    const { esc, fmt } = EGP;
    const top = document.getElementById("skill-top");
    if (top) {
      const where = k.section.letter ? "Section " + k.section.letter + ", " + k.section.title : k.section.title;
      top.innerHTML = '<p class="crumbs"><a href="' + EGP.url("index.html") + '">The paper</a> › Part ' + k.part + " › " + esc(where) + "</p>";
      const b = document.getElementById("skill-badge");
      if (b) b.innerHTML = k.section.marks ? '<span class="badge">On the paper: ' + esc(where) + ', <span class="hand">' + fmt(k.section.marks) + "</span> mark" + (k.section.marks === 1 ? "" : "s") + "</span>" : '<span class="badge">Used in every section of Part ' + k.part + "</span>";
    }
    // ready
    const box = document.getElementById("skill-ready");
    if (box) {
      const quizzes = () => [...document.querySelectorAll(".check .quiz")].filter((q) => !q.closest("[hidden]"));
      const btn = document.createElement("button"); btn.className = "btn lamp"; btn.type = "button";
      const note = document.createElement("span"); note.className = "hand";
      box.className = "ready-row"; box.append(btn, note);
      const upd = () => {
        const left = quizzes().filter((q) => !q.dataset.solved).length;
        const isR = EGP.isReady(id);
        btn.textContent = isR ? "Ready ✓ (tap to undo)" : "I am ready for this";
        btn.disabled = !isR && left > 0;
        note.textContent = isR ? (k.w ? "+" + fmt(k.w) + " on your paper" : "Noted on your paper") : left ? left + " question" + (left > 1 ? "s" : "") + " left in Check yourself" : "All correct. Well done.";
      };
      btn.addEventListener("click", () => { const v = !EGP.isReady(id); EGP.setReady(id, v); if (v) EGP.celebrate(id); upd(); });
      window.addEventListener("egp-quiz", upd); window.addEventListener("egp-section", upd); upd();
    }
    // pager through live skills
    const live = all.filter((x) => x.status === "live"); const i = live.findIndex((x) => x.id === id);
    const pager = document.getElementById("skill-pager");
    if (pager) {
      const link = (x, dir) => x ? '<a href="' + EGP.url("skills/" + x.id + "/index.html") + '"' + (dir === "next" ? ' style="margin-left:auto;text-align:right"' : "") + "><small>" + (dir === "next" ? "Next" : "Previous") + "</small>" + esc(x.title) + "</a>" : "";
      pager.innerHTML = link(live[i - 1], "prev") + link(live[i + 1], "next");
    }
  };
  if (window.EGP && EGP.ready) go(); else window.addEventListener("egp-ready", go, { once: true });
})();
