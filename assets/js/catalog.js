/* =========================================================
   The official paper, as the platform's map.
   Every skill belongs to a section of the paper and carries a share of that
   section's marks (the shares add up to 20). When a student marks a skill
   "ready", its share appears in the margin of the home page.
   status: "live" (page exists) or "soon".
   ========================================================= */
window.EGP_EXAM = {
  // Estimated. Update when the Ministry announces the official date.
  date: "2027-06-15T08:00:00+03:00",
  estimated: true
};

window.EGP_PAPER = [
  { part: "One", title: "Reading Comprehension", score: 12, sections: [
    { key: "pre", letter: "", title: "Before you write a word", instruction: "Read the selection carefully, and then answer the questions that follow.", marks: 0, skills: [
      { id: "the-paper", title: "The paper and your 150 minutes", w: 0, status: "live" },
      { id: "skim-scan", title: "Skim, read the questions, scan", w: 0, status: "live" },
      { id: "command-words", title: "Command words", w: 0, status: "live" }
    ]},
    { key: "A", letter: "A", title: "Written answers", instruction: "Answer each of the following questions in 1–4 complete sentences using your own words.", marks: 4, skills: [
      { id: "own-words", title: "Answering in your own words", w: 2.5, status: "live" },
      { id: "inference", title: "Inferring", w: 1.5, status: "live" }
    ]},
    { key: "B", letter: "B", title: "False statements", instruction: "The following statements are false because they misinterpret the meaning stated or conveyed in the selection above. Rewrite them correctly.", marks: 1, skills: [
      { id: "false-statements", title: "Correcting false statements", w: 1, status: "live" }
    ]},
    { key: "C", letter: "C", title: "Analysing the text", instruction: "Answer the following questions in complete sentences.", marks: 4, skills: [
      { id: "thesis-title", title: "Thesis statement and title", w: 0.4, status: "soon" },
      { id: "intro-conclusion", title: "Introductions and conclusions", w: 0.4, status: "soon" },
      { id: "organisation", title: "Patterns of organisation", w: 0.4, status: "soon" },
      { id: "relations", title: "Thematic relations and cohesion", w: 0.4, status: "soon" },
      { id: "tone-mood", title: "Tone and mood", w: 0.5, status: "soon" },
      { id: "purpose-audience", title: "Purpose, type of writing, audience", w: 0.5, status: "soon" },
      { id: "credibility", title: "Credibility and evidence", w: 0.5, status: "soon" },
      { id: "figures", title: "Figures of speech", w: 0.4, status: "soon" },
      { id: "fallacies", title: "Logical fallacies", w: 0.2, status: "soon" },
      { id: "character", title: "Character sketch", w: 0.2, status: "soon" },
      { id: "summary", title: "Summarising and paraphrasing", w: 0.1, status: "soon" }
    ]},
    { key: "D", letter: "D", title: "Table or graph", instruction: "Read the table carefully, and then answer the question that follows. Explain your answer in 4 to 5 sentences, using evidence.", marks: 1.5, skills: [
      { id: "graphs-tables", title: "Drawing a conclusion from a table or graph", w: 1.5, status: "soon" }
    ]},
    { key: "E", letter: "E", title: "Vocabulary", instruction: "Based on contextual clues, infer the meaning of each word in the box below. Then fill in the blanks with the correct words.", marks: 1, skills: [
      { id: "vocabulary", title: "Meaning from context", w: 1, status: "live" }
    ]},
    { key: "F", letter: "F", title: "Reference words", instruction: "What does each of the pronouns, bold-typed in the selection above, refer to?", marks: 0.5, skills: [
      { id: "references", title: "Reference words", w: 0.5, status: "live" }
    ]}
  ]},
  { part: "Two", title: "Writing", score: 8, note: "Choose ONE of the two prompts. 250–300 words. Content and organisation of ideas (3.5), language and style (3.5), tidiness and legible handwriting (01).", sections: [
    { key: "W", letter: "", title: "The essay", instruction: "Write a well-organised essay of 250–300 words.", marks: 8, studio: true, skills: [
      { id: "essay-toolkit", title: "Essay toolkit: outline, connectors, the rubric", w: 3, status: "live" },
      { id: "argumentative", title: "Argumentative essay", w: 1.5, status: "live" },
      { id: "persuasive", title: "Persuasive essay", w: 1, status: "live" },
      { id: "problem-solution", title: "Problem-solution essay", w: 1.25, status: "live" },
      { id: "cause-effect", title: "Cause-effect essay", w: 1.25, status: "live" }
    ]}
  ]}
];

/* Reading Room: original practice texts, each with a full exam-style question set.
   sec: which section's themes it belongs to ("ls", "se" or "both"). */
window.EGP_TEXTS = [
  { id: "wired-awake", title: "Wired Awake", theme: "Technology · The Teenager", sec: "ls", words: 610, blurb: "Why phones keep teenagers awake, and what the lost sleep costs them." },
  { id: "price-of-a-click", title: "The Price of a Click", theme: "The Media", sec: "se", words: 560, blurb: "How false news travels through social media, and how readers can stop it." },
  { id: "seed-library", title: "The Seed Library", theme: "Human Values · The Ecological Environment", sec: "both", words: 330, blurb: "A mountain village that lends seeds instead of books." }
];

window.EGP_SKILLS = (() => {
  const out = [];
  window.EGP_PAPER.forEach((p) => p.sections.forEach((s) => s.skills.forEach((k) => out.push(Object.assign({ part: p.part, section: s }, k)))));
  return out;
})();
