/* =========================================================
   Writing data: real official prompts, outlines, connectors, rubric.
   Prompts are quoted from the CRDP official papers (source in "src").
   Outlines for argumentative, persuasive and expository follow the outlines printed
   in the official 2019 papers; problem-solution and cause-effect follow the course notes.
   ========================================================= */
window.EGP_WRITING = {
  outlines: {
    argumentative: [
      { k: "intro", t: "Introduction", parts: ["General statement (hook)", "Narrower or background statement", "Thesis statement: your claim, and the counter claim"] },
      { k: "body", t: "Body 1: your claim", parts: ["Topic sentence: the point of view you support", "Supporting detail 1", "Supporting detail 2", "Supporting detail 3", "Concluding sentence"] },
      { k: "counter", t: "Body 2: the counter claim and its refutation", parts: ["Topic sentence: the opposite point of view", "Their point 1, and your refutation", "Their point 2, and your refutation", "Concluding sentence"] },
      { k: "conclusion", t: "Conclusion", parts: ["Restatement of the thesis", "Final thought"] }
    ],
    persuasive: [
      { k: "intro", t: "Introduction", parts: ["Hook", "Narrower statement linking the hook to the thesis", "Thesis statement with your two controlling ideas"] },
      { k: "body", t: "Body 1: first reason", parts: ["Topic sentence: controlling idea 1", "Evidence 1 (detail or example)", "Evidence 2", "Evidence 3", "Concluding sentence"] },
      { k: "body", t: "Body 2: second reason", parts: ["Topic sentence: controlling idea 2", "Evidence 1 (detail or example)", "Evidence 2", "Evidence 3", "Concluding sentence"] },
      { k: "conclusion", t: "Conclusion", parts: ["Restatement of the thesis", "Final thought: a call to act"] }
    ],
    "problem-solution": [
      { k: "intro", t: "Introduction: the problem", parts: ["Hook", "Background: what the problem is", "Thesis: the problem can be solved by citizens and by the government"] },
      { k: "body", t: "Body 1: the problem(s), causes or effects", parts: ["Topic sentence", "Problem or effect 1, explained", "Problem or effect 2, explained", "Concluding sentence"] },
      { k: "body", t: "Body 2: what citizens can do", parts: ["Topic sentence", "Solution 1", "Solution 2"] },
      { k: "body", t: "Body 3: what the government can do", parts: ["Topic sentence", "Solution 1", "Solution 2"] },
      { k: "conclusion", t: "Conclusion", parts: ["Restate the problem and the solutions", "Final thought: what should have been done, or what will happen"] }
    ],
    "cause-effect": [
      { k: "intro", t: "Introduction", parts: ["Hook", "Background", "Thesis naming the two or three causes (or effects)"] },
      { k: "body", t: "Body 1: cause (or effect) 1", parts: ["Topic sentence", "Explanation", "Example or evidence"] },
      { k: "body", t: "Body 2: cause (or effect) 2", parts: ["Topic sentence", "Explanation", "Example or evidence"] },
      { k: "body", t: "Body 3: cause (or effect) 3", parts: ["Topic sentence", "Explanation", "Example or evidence"] },
      { k: "conclusion", t: "Conclusion", parts: ["Restatement", "Final thought"] }
    ],
    expository: [
      { k: "intro", t: "Introduction", parts: ["Hook", "Narrower statement linking the hook to the thesis", "Thesis statement"] },
      { k: "body", t: "Body 1", parts: ["Topic sentence 1", "Supporting evidence 1", "Supporting evidence 2", "Supporting evidence 3", "Concluding sentence"] },
      { k: "body", t: "Body 2", parts: ["Topic sentence 2", "Supporting evidence 1", "Supporting evidence 2", "Supporting evidence 3", "Concluding sentence"] },
      { k: "conclusion", t: "Conclusion", parts: ["Restatement of the thesis", "Final thought"] }
    ]
  },

  prompts: [
    { id: "ls19-1a", sec: "ls", g: "argumentative", src: "LS, June 2019", text: "Some people believe that technology stands behind many dangerous diseases; however, others believe that technology has helped doctors diagnose and treat many diseases. Where do you stand? Write a well-organized argumentative essay of 250-300 words in which you show your point of view. Make sure that your essay supports your position and refutes the opposite point of view." },
    { id: "ls18-1b", sec: "ls", g: "argumentative", src: "LS, June 2018", text: "Many scientists believe that artificial intelligence will continue to develop to an extent we, human beings, turn to be slaves to it. In a well-organized argumentative essay of 250-300 words, argue for or against this point of view. Make sure that your essay supports your position and refutes the opposite point of view." },
    { id: "ls17-1a", sec: "ls", g: "argumentative", src: "LS, June 2017", text: "Some people are optimistic that the coming technological and scientific changes will make life better, while some others think these changes will lead to a future in which people are worse off than they are today. In a well-organized argumentative essay of 250-300 words, show with which point of view you stand. Make sure that your essay supports your position and refutes the opposite point of view." },
    { id: "ls18-2b", sec: "ls", g: "argumentative", src: "LS, August 2018", text: "Technology has made significant contributions that improve the life of people all around the world. However, some people believe that this field of development pays costly prices due to many technical errors that occur in many fields (space, medicine, industry, etc.) Write an argumentative essay of 250-300 words in which you show with which point of view you stand. Make sure that your essay supports your position and refutes the opposite point of view." },
    { id: "se19-1a", sec: "se", g: "argumentative", src: "SE, June 2019", text: "Some people believe that the rich should pay more taxes, for those who earn more must pay more in order to help the poor who struggle in life. Others believe that rich people should not be taxed more because they have worked hard for their money, and anyone else has the same opportunity to do so. In a well-organized argumentative essay of 250-300 words, show with which point of view you stand. Make sure that your essay supports your position and refutes the opposite point of view." },
    { id: "ls19-2a", sec: "ls", g: "persuasive", src: "LS, July 2019 (second session)", text: "To sustain the beauty and value of nature, all living things should be well-preserved. Write a persuasive essay of 250-300 words in which you show how vital it is to preserve nature and protect its living things." },
    { id: "ls17-2b", sec: "ls", g: "persuasive", src: "LS, August 2017", text: "The government that does not have basic knowledge of the community’s social, economic, infrastructure, and environmental needs should be held responsible for the death and damage caused by natural disasters. In a well-organized persuasive essay of 250-300 words, support the statement above, using appropriate pieces of evidence such as facts, real-life examples, etc." },
    { id: "se19-2b", sec: "se", g: "persuasive", src: "SE, August 2019", text: "“Overreliance on online resources to learn results in a world of depersonalized communication.” Write a persuasive essay of 250-300 words in which you show how important it is to have face-to-face communication in order to build social skills and family relationships (team work, communication, values and manners, social responsibilities, tolerance, etc.)" },
    { id: "se18-2a", sec: "se", g: "persuasive", src: "SE, August 2018", text: "“There is no tool for development more effective than the empowerment of women because when women succeed, all of society benefits, and coming generations are given a better start in life.” Write a persuasive essay of 250-300 words in which you provide convincing pieces of evidence about the importance of empowering women in the society." },
    { id: "se18-2b", sec: "se", g: "problem-solution", src: "SE, August 2018", text: "Countries with high levels of gender inequality have lower economic growth. Some studies show that countries with fewer female leaders ignore a wider range of issues such as health, education, and child support. Write a problem-solution essay of 250-300 words in which you identify two different problems (social, economic, political, etc.) caused by gender inequality, and then suggest practical solutions to these problems." },
    { id: "ls19-2b", sec: "ls", g: "cause-effect", src: "LS, July 2019 (second session), labelled expository", text: "The climate has become hotter than usual. Minor temperature changes cause the death of crops, decrease the amount of food, result in floods, and lead to imbalanced wildlife. Write an expository essay of 250-300 words in which you discuss two to three reasons behind the current critical situation of the environment, and then provide some effective actions humans should take in order to save our planet." },
    { id: "ls18-1a", sec: "ls", g: "cause-effect", src: "LS, June 2018, labelled expository", text: "Artificial intelligence (robotics, automation, virtual reality, etc.) is getting smarter every day. In a well-organized expository essay of 250-300 words, develop the statement above, shedding light on two positive and/or negative effects of artificial intelligence in any field(s) of your choice (educational, social, industrial, etc.)." },
    { id: "se19-1b", sec: "se", g: "cause-effect", src: "SE, June 2019, labelled expository", text: "With increased tax incomes, the government can spend more money on important public services such as health and education. In a well-organized expository essay of 250-300 words, illustrate the statement above, focusing on the fact that spending the money collected from taxes on public services will result in many positive impacts such as improved medical care, increased educational standards, better environmental conditions, etc." },
    { id: "se19-2a", sec: "se", g: "expository", src: "SE, August 2019", text: "Media can be a tool of some active learning strategies such as participating in online group discussions, producing video projects, or analyzing newspaper articles. In an expository essay of 250-300 words, explain the statement above, showing the positive impacts of media on education (engaging students, arousing interest in the subject matter, enriching many new concepts, etc.)" }
  ],

  // From the course notes: transitions for each job
  connectors: [
    ["First point", ["First,", "To begin with,", "First of all,", "To start with,"]],
    ["Another point", ["Moreover,", "Furthermore,", "In addition,", "What is more,", "Also,", "Another point to be made is that"]],
    ["Final point", ["Finally,", "Lastly,", "Last but not least,"]],
    ["Others’ opinion", ["Some people believe that", "Some argue that", "According to", "It is said that", "Admittedly,"]],
    ["Contrast, refutation", ["However,", "On the contrary,", "Conversely,", "Nevertheless,", "Yet,", "Although"]],
    ["Cause and result", ["because", "since", "As a result,", "Consequently,", "Therefore,", "This leads to"]],
    ["Example", ["For example,", "For instance,", "such as", "To illustrate,"]],
    ["Conclusion", ["In conclusion,", "To sum up,", "All in all,", "In a nutshell,", "To conclude,"]]
  ],

  // Self-assessment against the official criteria. w = share of that criterion's marks.
  rubric: [
    { c: "Content and organisation of ideas", max: 3.5, items: [
      ["The essay answers exactly what the prompt asks (genre, task, focus).", 0.8],
      ["The introduction moves from a general statement to a clear thesis.", 0.6],
      ["Each body paragraph opens with a topic sentence and stays on it.", 0.7],
      ["Every point is supported with details, examples or evidence.", 0.7],
      ["The conclusion restates the thesis and ends with a final thought.", 0.4],
      ["Argumentative only: the opposite view is stated and refuted. Otherwise: ideas flow in a logical order.", 0.3]
    ]},
    { c: "Language and style", max: 3.5, items: [
      ["Sentences are grammatically correct (tenses, agreement, articles).", 1],
      ["Spelling and punctuation are accurate.", 0.6],
      ["Connectors link the ideas smoothly and are not repeated.", 0.7],
      ["Vocabulary is varied, precise and formal (no contractions, no slang).", 0.7],
      ["Sentences vary in length and structure.", 0.5]
    ]},
    { c: "Tidiness and legible handwriting", max: 1, items: [
      ["Clear paragraphs, neat handwriting, no crossing-out in the final copy.", 1]
    ]}
  ]
};
