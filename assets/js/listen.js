/* =========================================================
   Listen: a natural, pre-recorded voice reads the text while the sentence
   being read is highlighted. Tap any sentence to jump to it.
   Markup:  <div class="listen" data-audio="wired-awake" data-for="text-container-id"></div>
   Audio:   audio/<id>.<voice>.m4a + .json (sentence timings), made by tools/audio.py.
   Nothing is downloaded until the student presses play.
   ========================================================= */
(function () {
  "use strict";
  const VOICE = "af_heart";
  const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>';
  const fmt = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");

  function setup(bar) {
    const id = bar.dataset.audio;
    const host = document.getElementById(bar.dataset.for) || bar.parentElement;
    const base = (window.EGP_ROOT || "") + "audio/" + id + "." + VOICE;
    bar.innerHTML =
      '<button class="play" type="button" aria-label="Listen to the text">' + ICON_PLAY + "</button>" +
      '<span class="lbl" style="font-weight:700;font-size:.9rem">Listen</span>' +
      '<div class="bar" role="slider" aria-label="Position" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
      '<span class="time">0:00</span>' +
      '<label class="sr" for="sp-' + id + '">Speed</label><select id="sp-' + id + '"><option value="0.85">Slower</option><option value="1" selected>Normal</option><option value="1.12">Faster</option></select>';
    const play = bar.querySelector(".play"), lbl = bar.querySelector(".lbl"), track = bar.querySelector(".bar"), fill = track.querySelector("i"), time = bar.querySelector(".time"), speed = bar.querySelector("select");
    let audio = null, marks = null, sents = [], cur = -1;

    const text = () => [...host.querySelectorAll(".selection")].find((t) => !t.closest("[hidden]")) || host.querySelector(".selection");
    function bind() {
      sents = [...text().querySelectorAll("p[data-p] .s")];
      sents.forEach((s, i) => { s.dataset.i = i; });
      host.classList.add("listening");
    }
    async function load() {
      if (audio) return true;
      lbl.textContent = "Loading…";
      try {
        const r = await fetch(base + ".json"); if (!r.ok) throw new Error("no timings");
        marks = (await r.json()).sentences;
      } catch (e) { lbl.textContent = "Audio not available yet"; play.disabled = true; return false; }
      audio = new Audio(base + ".m4a"); audio.preload = "auto"; audio.playbackRate = +speed.value;
      audio.addEventListener("timeupdate", tick);
      audio.addEventListener("play", () => { play.innerHTML = ICON_PAUSE; play.setAttribute("aria-label", "Pause"); lbl.textContent = "Listening"; });
      audio.addEventListener("pause", () => { play.innerHTML = ICON_PLAY; play.setAttribute("aria-label", "Listen to the text"); lbl.textContent = audio.ended ? "Listen again" : "Paused"; });
      audio.addEventListener("ended", () => { light(-1); });
      audio.addEventListener("error", () => { lbl.textContent = "Audio could not load"; });
      bind();
      return true;
    }
    function light(i) {
      if (i === cur) return;
      if (sents[cur]) sents[cur].classList.remove("speaking");
      cur = i;
      const s = sents[i]; if (!s) return;
      s.classList.add("speaking");
      const r = s.getBoundingClientRect();
      if (r.top < 120 || r.bottom > window.innerHeight - 40) s.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    function tick() {
      const t = audio.currentTime, d = audio.duration || 1;
      fill.style.width = (t / d * 100).toFixed(1) + "%"; track.setAttribute("aria-valuenow", Math.round(t / d * 100));
      time.textContent = fmt(t) + " / " + fmt(d);
      let i = -1; for (let k = 0; k < marks.length; k++) { if (t >= marks[k][0] - 0.05) i = k; else break; }
      if (i >= 0 && t > marks[i][1] + 0.6) i = -1; // in a pause between paragraphs
      light(i);
    }
    play.addEventListener("click", async () => {
      if (!(await load())) return;
      if (audio.paused) audio.play().catch(() => (lbl.textContent = "Tap play again")); else audio.pause();
    });
    speed.addEventListener("change", () => { if (audio) audio.playbackRate = +speed.value; });
    const seek = (x) => { if (!audio || !audio.duration) return; const r = track.getBoundingClientRect(); audio.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * audio.duration; };
    track.addEventListener("click", (e) => seek(e.clientX));
    track.addEventListener("keydown", (e) => { if (!audio) return; if (e.key === "ArrowRight") audio.currentTime += 5; if (e.key === "ArrowLeft") audio.currentTime -= 5; });
    host.addEventListener("click", async (e) => {
      const s = e.target.closest(".s[data-i]");
      if (!s || !audio || host.querySelector(".selection.marking, .selection.tracing")) return;
      audio.currentTime = marks[+s.dataset.i][0]; if (audio.paused) audio.play();
    });
    window.addEventListener("egp-section", () => { if (audio) { audio.pause(); } });
  }

  const start = () => document.querySelectorAll(".listen[data-audio]").forEach(setup);
  if (window.EGP && EGP.ready) start(); else window.addEventListener("egp-ready", start, { once: true });
})();
