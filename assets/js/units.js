/* =========================================================
   The unit list — the ONLY file to edit when a unit goes live.
   status: "live" (opens) or "soon" (shown as a dim lighthouse on the journey)
   month: when the centre teaches it (drives the Year Journey and seasonal notes)
   themes: the reading-text theme per section (LS / SE), from the CRDP exam circular
   ========================================================= */
window.EGP_EXAM = {
  // Estimated. Update when the Ministry announces the official date.
  date: "2027-06-15T08:00:00+03:00",
  estimated: true
};

window.EGP_UNITS = [
  { id: "unit-1", n: 1, month: "Nov", status: "live", href: "units/unit-1/index.html", pdf: { ls: "units/unit-1/unit1_reading_the_exam_way_LS.pdf", se: "units/unit-1/unit1_reading_the_exam_way_SE.pdf" },
    title: "Reading the exam way",
    blurb: "How the paper is built, skimming and scanning, command words, answering in your own words, false statements, reference words and vocabulary in context.",
    themes: { ls: "Technology", se: "The Media" } },
  { id: "unit-2", n: 2, month: "Nov", status: "soon", title: "Main idea and structure",
    blurb: "Stated and implied thesis, titles, ten kinds of introduction, five kinds of conclusion.",
    themes: { ls: "The Ecological Environment", se: "Pollution" } },
  { id: "unit-3", n: 3, month: "Dec", status: "soon", title: "Organisation and coherence",
    blurb: "Patterns of organisation, thematic relations between paragraphs, unity, direct and indirect links.",
    themes: { ls: "Natural Phenomena", se: "Natural Phenomena and Disasters" } },
  { id: "unit-4", n: 4, month: "Dec", status: "soon", title: "The writer's voice",
    blurb: "Tone and mood, purpose, type of writing and audience.",
    themes: { ls: "The Teenager", se: "Youth Problems and Interests" } },
  { id: "unit-5", n: 5, month: "Jan", status: "soon", title: "Evidence and reasoning",
    blurb: "Achieving credibility, facts and opinions, refutation, logical fallacies.",
    themes: { ls: "Human Rights", se: "Democracy and Human Rights" } },
  { id: "unit-6", n: 6, month: "Feb", status: "soon", title: "Figures of speech and character",
    blurb: "Simile, metaphor, personification and irony, plus the character sketch.",
    themes: { ls: "Human Values", se: "The Family and Gender Issues" } },
  { id: "unit-7", n: 7, month: "Feb", status: "soon", title: "Graphs, tables and summaries",
    blurb: "Reading a table or graph against the text, summarising and paraphrasing.",
    themes: { ls: "Current Issues", se: "Developed and Developing Countries" } },
  { id: "unit-8", n: 8, month: "Mar", status: "soon", title: "Writing studio: argue and persuade",
    blurb: "The argumentative essay with counter-argument and refutation, and the persuasive essay.",
    themes: { ls: "Across themes", se: "Across themes" } },
  { id: "unit-9", n: 9, month: "Apr", status: "soon", title: "Writing studio: problems and causes",
    blurb: "Problem-solution and cause-effect essays, with a short look at the expository essay of past papers.",
    themes: { ls: "Current Issues", se: "Waves of Emigration" } },
  { id: "unit-10", n: 10, month: "May", status: "soon", title: "Exam rehearsal",
    blurb: "Full mock papers against the clock and a plan for the 150 minutes.",
    themes: { ls: "Mixed", se: "Mixed" } }
];

window.EGP_EXTRAS = [
  { id: "official", title: "Official exams", status: "soon", blurb: "Past LS and SE papers, retyped, with official marks and skills map." }
];
