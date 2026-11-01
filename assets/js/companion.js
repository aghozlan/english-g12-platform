/* =========================================================
   The companion: Nour (an original lighthouse character), word of the day,
   a gentle streak, seasonal notes and a short celebration when a unit is done.
   ========================================================= */
(function () {
  "use strict";
  const EGP = (window.EGP = window.EGP || {});

  EGP.nourSVG = '<svg viewBox="0 0 46 64" aria-hidden="true"><path d="M23 2 L30 10 L16 10 Z" fill="var(--sea)"/><rect x="15" y="10" width="16" height="9" rx="2" fill="var(--lamp)"/><path d="M14 19 H32 L35 60 H11 Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M13.2 31 H32.8 L33.4 40 H12.6 Z" fill="var(--sea)"/><path d="M12 48 H34 L34.6 56 H11.4 Z" fill="var(--sea)"/><circle cx="19.5" cy="25" r="1.6" fill="var(--ink)"/><circle cx="26.5" cy="25" r="1.6" fill="var(--ink)"/><path d="M20 28.2 Q23 30.6 26 28.2" stroke="var(--ink)" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="8" y="59" width="30" height="4" rx="2" fill="var(--ink)"/></svg>';

  /* Exam vocabulary from the course: tone words, devices, connectors and question words. */
  EGP.WORDS = [
    ["infer", "verb", "to work out a meaning the writer suggests but does not state", "From her shaking hands, we can infer that she was afraid."],
    ["credible", "adjective", "able to be believed; supported by good evidence", "The writer quotes a doctor to make the claim credible."],
    ["concise", "adjective", "saying a lot in few words", "A concise answer earns the same marks as a long one."],
    ["refute", "verb", "to prove that an opposing claim is wrong", "In the fourth paragraph, refute the opposite point of view."],
    ["optimistic", "adjective", "expecting good things to happen (a positive tone)", "The last paragraph sounds optimistic about a cure."],
    ["pessimistic", "adjective", "expecting bad things to happen (a negative tone)", "His pessimistic tone shows he has lost hope."],
    ["indignant", "adjective", "angry about something unfair", "The writer is indignant at how workers are treated."],
    ["nostalgic", "adjective", "missing the past with warm feeling", "The grandmother speaks of her village in a nostalgic tone."],
    ["sarcastic", "adjective", "saying the opposite of what you mean to mock someone", "\"Great idea,\" he said in a sarcastic tone."],
    ["objective", "adjective", "based on facts, without personal feelings (a neutral tone)", "A news report should stay objective."],
    ["anecdote", "noun", "a short, interesting story used to open or illustrate a point", "The essay opens with an anecdote about a lost child."],
    ["thesis", "noun", "the sentence that states the main idea of a whole essay", "The thesis is the last sentence of the introduction."],
    ["coherent", "adjective", "clear and logically connected", "Linking words make a paragraph coherent."],
    ["antecedent", "noun", "the noun a pronoun refers back to", "In \"Rami lost his keys\", Rami is the antecedent of his."],
    ["simile", "noun", "a comparison using like or as", "\"Her voice was as soft as rain\" is a simile."],
    ["metaphor", "noun", "a comparison that says one thing is another", "\"The classroom was a zoo\" is a metaphor."],
    ["personification", "noun", "giving human qualities to something not human", "\"The wind whispered\" is personification."],
    ["irony", "noun", "a contrast between what is said or expected and what really is", "It is ironic that the fire station burned down."],
    ["moreover", "connector", "adds a further point", "The plan is cheap. Moreover, it is quick."],
    ["consequently", "connector", "shows a result", "He skipped revision; consequently, he struggled."],
    ["nevertheless", "connector", "shows contrast: in spite of that", "It rained. Nevertheless, the match went ahead."],
    ["conversely", "connector", "introduces the opposite situation", "Some cities grew; conversely, villages emptied."],
    ["detrimental", "adjective", "causing harm", "Lack of sleep is detrimental to memory."],
    ["alleviate", "verb", "to make a problem less severe", "Free transport could alleviate traffic in Beirut."],
    ["prevalent", "adjective", "common; widespread", "Screen addiction is prevalent among teenagers."],
    ["advocate", "verb / noun", "to publicly support; a supporter", "She advocates cleaner beaches in Saida."],
    ["deteriorate", "verb", "to become worse", "Air quality deteriorates in summer traffic."],
    ["implement", "verb", "to put a plan into action", "The school implemented a phone-free lunch."],
    ["sustainable", "adjective", "able to continue without harming the future", "Sustainable fishing protects the coast."],
    ["emigrate", "verb", "to leave your country to live in another", "Many young graduates emigrate for work."],
    ["exploit", "verb", "to use unfairly for your own benefit", "Some apps exploit our need for approval."],
    ["vulnerable", "adjective", "easily harmed", "Children are vulnerable to online scams."],
    ["scrutinise", "verb", "to examine very carefully", "Scrutinise each statement before calling it false."],
    ["paraphrase", "verb", "to say the same idea in your own words", "Paraphrase the line instead of copying it."],
    ["skim", "verb", "to read quickly for the general idea", "Skim the text before reading the questions."],
    ["scan", "verb", "to search a text quickly for specific information", "Scan paragraph 4 for the date."],
    ["hasty generalisation", "noun", "a conclusion drawn from too few cases", "\"My cousin failed, so the exam is impossible\" is a hasty generalisation."],
    ["chronological", "adjective", "arranged in time order", "The story is told in chronological order."],
    ["elaborate", "verb", "to explain in more detail", "The body paragraphs elaborate the thesis."],
    ["resilient", "adjective", "able to recover after difficulties", "Lebanese students are famously resilient."]
  ];
  EGP.wordOfDay = () => {
    const day = Math.floor(Date.now() / 864e5);
    return EGP.WORDS[day % EGP.WORDS.length];
  };

  EGP.daysToExam = () => {
    const d = new Date((window.EGP_EXAM || {}).date || "2027-06-15");
    return Math.max(0, Math.ceil((d - Date.now()) / 864e5));
  };

  /* A short, warm note that changes with the season of the school year. */
  EGP.seasonNote = () => {
    const days = EGP.daysToExam();
    const m = new Date().getMonth(); // 0 = January
    if (days === 0) return "Exam day. Read the questions first, breathe, and trust the work you have done.";
    if (days <= 7) return "One week left. Sleep well, revise lightly, and reread your best essay plans. You are ready for more than you think.";
    if (days <= 30) return "The last 30 days. One past paper every two days, timed, then compare with the official answers. Small, steady steps.";
    if (m === 11 || m === 0) return "Mid-year: a good moment to look back. Which question type still makes you hesitate? Give it ten minutes a day.";
    if (m >= 8 && m <= 10) return "A new year and a long coastline ahead. One lighthouse at a time: today, just one step.";
    if (m >= 1 && m <= 3) return "Spring is the writing season. Plan one essay outline a week, even when you do not write the whole essay.";
    return "Keep the rhythm: a little reading every day beats a lot once a week.";
  };

  EGP.streakNote = () => {
    const v = EGP.store ? EGP.store.get("visits", null) : null;
    if (!v) return "";
    if (v.gapBefore > 3) return "Welcome back. Pick up exactly where you left off; nothing is lost.";
    if (v.streak >= 7) return v.streak + " days in a row. That rhythm is what wins in June.";
    if (v.streak >= 2) return v.streak + " days in a row. Nice and steady.";
    return "";
  };

  /* Celebrate a finished unit (both sessions marked). */
  EGP.celebrate = (unit) => {
    const u = (window.EGP_UNITS || []).find((x) => x.id === unit);
    const next = (window.EGP_UNITS || []).find((x) => u && x.n === u.n + 1);
    const box = document.querySelector(".unit-done");
    const msg = "Lighthouse " + (u ? u.n : "") + " is lit. " + (next ? "Next stop: " + next.title.toLowerCase() + "." : "That was the last stop before the exam.");
    if (box) {
      box.hidden = false;
      box.innerHTML = '<div class="nour">' + EGP.nourSVG + '<div class="bubble"><b>' + EGP.esc(msg) + "</b><br>You did the reading, the cards and the practice. That is real work, and it shows.</div></div>";
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    EGP.toast(msg);
  };
})();
