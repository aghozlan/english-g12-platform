"""Writes the Section C (analysing the text) and Section D (table or graph) skill pages
from one template: on the paper → how it's marked → method → see it done → try it →
check yourself → revise. Questions on the paper are quoted from CRDP papers; marking
splits come from the official grading schemes; methods follow the course notes.
Worked answers use the reading-room texts (LS: Wired Awake, SE: The Price of a Click).
Usage: python3 tools/analysis.py
"""
import os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = lambda s: s.replace('"', "&quot;")

def quiz(q, opts, a, ok, sec=None):
    bs = "".join('<button class="chip"' + (f' data-why="{E(w)}"' if w else "") + f">{t}</button>" for t, w in opts)
    s = f' data-sec="{sec}"' if sec else ""
    return f'<div class="quiz"{s} data-a="{a}" data-ok="{E(ok)}"><p>{q}</p><div class="opts">{bs}</div><div class="feedback"></div></div>'

def sort(title, chips, bins):
    c = "".join(f'<button class="chip" data-bin="{b}">{t}</button>' for t, b in chips)
    bn = "".join(f'<div class="bin" data-bin="{k}" tabindex="0" role="button"><h4>{v}</h4></div>' for k, v in bins)
    return f'<div class="lab" data-lab="sort"><p class="lab-title">{title}</p><div class="row pool">{c}</div><div class="bins">{bn}</div><div class="feedback"></div></div>'

def cards(prefix, items):
    out = []
    for i, (f, b) in enumerate(items, 1):
        out.append(f'<div class="card" id="{prefix}-{i}"><div class="in"><div class="face front"><span class="box"></span><span class="big">{f}</span></div><div class="face back"><p>{b}</p><div class="grade"><button class="btn small ghost" data-grade="again">Again</button><button class="btn small ghost" data-grade="good">Good</button></div></div></div></div>')
    return '<div class="deck-bar"><p class="muted" style="margin:0">Tap to flip, then grade yourself. <b data-due></b></p><div class="row"><button class="btn small ghost" data-flip-all>Flip all</button></div></div><div class="cards small">' + "".join(out) + "</div>"

def onpaper(items):
    return "\n".join(f'<div class="onpaper">{t}<span class="src">{s}</span></div>' for t, s in items)

def model(q, a, why, sec=None):
    s = f' data-sec="{sec}"' if sec else ""
    return f'<div class="model"{s} style="margin-bottom:10px"><div class="q"><b>Question.</b> {q}</div><div class="a">{a}</div><p class="why">{why}</p></div>'

def table(head, rows):
    return '<div class="scroll-x"><table class="t"><tr>' + "".join(f"<th>{h}</th>" for h in head) + "</tr>" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows) + "</table></div>"

def steps(items):
    return '<ol class="steps">' + "".join(f"<li>{x}</li>" for x in items) + "</ol>"

S = {}

# ------------------------------------------------------------------ thesis and title
S["thesis-title"] = dict(
  title="Thesis statement and title", lead="Every selection has one main idea. Sometimes a sentence states it; sometimes you must build it from the topic sentences. The title is usually a squeezed version of it.",
  onpaper=onpaper([("Which sentence in Paragraph one serves as the thesis statement? Justify your answer. (Score: 1½)", "LS paper, older session"),
                   ("How is the title related to the main idea of the article? Explain. (Score: 01½)", "LS paper, older session"),
                   ("Identify the figure of speech used in the title, and show the function it serves. (01)", "LS paper, 2019")]),
  marking="Identification and justification are marked separately: <span class=\"hand\">0.5</span> for naming the sentence (or the figure in the title), <span class=\"hand\">0.5</span> for explaining why. A justification links the sentence to the <b>body</b>: “…an idea fully developed in the body paragraphs”.",
  method=table(["", "What to look for"], [["<b>Stated thesis</b>", "One sentence, usually the <b>last</b> (sometimes the first) of the introduction, that gives the writer’s central point: what the reader should know or believe by the end."],
      ["<b>Implied thesis</b>", "No single sentence says it. Read the topic sentences of the body and the conclusion, then write the thesis yourself in one sentence."],
      ["<b>A real thesis</b>", "is a complete sentence, gives an opinion or idea rather than a bare fact, and is never a question."],
      ["<b>The title</b>", "condenses the thesis. It may do so directly, or through a figure of speech or irony. Explain both what it says and what it means."]])
    + '<div class="tip-exam"><b>Answer frame:</b> The last sentence of the introductory paragraph serves as the thesis statement since it introduces the main idea of the text, which is about… Such an idea is fully elaborated in the body paragraphs.</div>',
  see=model("Which sentence in paragraph 1 of <i>Wired Awake</i> serves as the thesis statement? Justify.", "The last sentence of paragraph 1, “Karim is not lazy, and he is not alone: he belongs to a generation whose nights have quietly been taken over by a screen,” serves as the thesis. It moves from one teenager to a whole generation and states the main idea: screens are taking over teenagers’ sleep. The body develops this idea through its causes (paragraphs 3–4), its effects (5–6) and its solutions (7–8).", "<span class=\"hand\">0.5</span> identification, <span class=\"hand\">0.5</span> justification linked to the body.", "ls")
     + model("How does the title <i>The Price of a Click</i> reflect the main idea?", "The title is a metaphor: a click looks free, yet it has a price. It condenses the main idea of the selection, that sharing news without checking it costs society trust and unity. The body develops this cost: false stories spread (paragraph 2), journalists lose credibility and communities divide (paragraph 5).", "What the title says, what it means, and where the body develops it.", "se"),
  tryit=quiz("Which of these could <b>not</b> be a thesis statement?", [("Phones should stay out of teenagers’ bedrooms at night.", "That gives a clear opinion."), ("Do phones harm teenagers’ sleep?", ""), ("Sharing news without checking it weakens trust in the media.", "That gives a clear idea.")], 1, "Right: a thesis is never a question; it is the answer to one.")
     + quiz("The writer never states the thesis. What do you read to build it?", [("Only the title", "The title helps, but is not enough."), ("The topic sentences of the body and the conclusion", ""), ("The first sentence of each paragraph of the introduction only", "There is usually one introductory paragraph.")], 1, "Yes. The topic sentences together carry the main idea."),
  checks=[quiz("Where is a stated thesis most often found?", [("The last sentence of the introduction", ""), ("The middle of the second paragraph", "Rarely."), ("The title", "The title condenses it, but is not a sentence.")], 0, "Correct: general to specific, ending on the thesis."),
          quiz("A strong justification of your thesis answer ends with…", [("“…because I think so.”", "That is not evidence."), ("“…such an idea is fully developed in the body paragraphs.”", ""), ("“…it is a long sentence.”", "Length proves nothing.")], 1, "Yes: link the thesis to the body.")],
  cards=[("Stated thesis", "One sentence, usually last in the introduction, giving the central point."), ("Implied thesis", "Build it from the topic sentences and the conclusion."), ("Title", "A condensed thesis; may use a figure of speech or irony.")])

# ------------------------------------------------------------------ introductions and conclusions
S["intro-conclusion"] = dict(
  title="Introductions and conclusions", lead="The first and last paragraphs have jobs. Name the technique the writer uses, then say what it does for the reader.",
  onpaper=onpaper([("What type of introduction does the writer use in the selection? What two purposes does it serve? (01)", "SE, August 2018"),
                   ("What two functions does the introductory paragraph serve? Justify your answer. (01)", "LS, July 2019"),
                   ("In what way(s) do you think Ms. Judson is realistic and practical in her concluding paragraph? (Score: 01½)", "LS paper, older session")]),
  marking="For the 2018 SE question the official answer named the type (an anecdote) and two functions, marked <span class=\"hand\">0.5 for the type; two functions are required, 0.25 each</span>. The functions it accepted: attracting the reader, introducing the topic, and achieving credibility through a real-life example.",
  method="<p><b>Ten types of introduction</b> (from the course notes):</p>" + table(["Type", "What it does"], [
      ["Anecdote", "A brief story that illustrates the topic."], ["Facts or statistics", "Striking numbers from a credible source."], ["Historical", "General historical background."],
      ["Questions", "A series of questions that the essay then answers."], ["General to specific", "Starts wide, narrows to the thesis."], ["Dialogue or dramatic scene", "Characters speaking; we are dropped into a moment."],
      ["Summary", "Sums up the whole text to arouse curiosity."], ["Description", "A vivid picture of a person or place."], ["Listing examples", "Several examples that point to the theme."], ["Quotation", "A famous saying that expresses the topic."]])
    + "<p><b>Functions</b> to choose from: attract the reader’s attention and interest; introduce the topic; give background information; present the thesis; achieve credibility (with a real example or figure).</p>"
    + "<p><b>Five types of conclusion:</b> result, restatement, summary, prediction, recommendation.</p>"
    + "<p><b>Intro and conclusion together</b> are often linked: problem → solution, question → answer, past → present, or a story that returns at the end (a frame).</p>",
  see=model("What type of introduction does the writer of <i>Wired Awake</i> use? What two purposes does it serve?", "The writer uses an anecdote: the story of Karim, a seventeen-year-old in Saida who is still watching videos at 1:40 a.m. First, it attracts the reader’s attention, since many teenagers and parents will recognise the scene. Second, it introduces the topic of the selection, how screens take over teenagers’ sleep, which the last sentence turns into the thesis.", "<span class=\"hand\">0.5</span> the type, <span class=\"hand\">0.25 + 0.25</span> two functions.", "ls")
     + model("What type of introduction does the writer of <i>The Price of a Click</i> use? What two purposes does it serve?", "The writer uses an anecdote: Rana, a nineteen-year-old student in Tripoli, shares a dramatic photo of a bridge that never collapsed. First, it attracts the reader, who has probably shared a post just as quickly. Second, it introduces the topic, the spread of false news through social media, and gives it credibility through a real-life example.", "<span class=\"hand\">0.5</span> the type, <span class=\"hand\">0.25 + 0.25</span> two functions.", "se"),
  tryit=sort("Name each introduction", [("“Have you ever wondered why your phone feels heavier at midnight? Or why one more video is never just one?”", "q"), ("“In 1879, Edison’s lamp lengthened the human day for the first time.”", "h"), ("“Seventy percent of teenagers check their phone before they get out of bed.”", "f"), ("“The night Lina’s phone died, she slept for ten hours and woke up a different person.”", "a")],
          [("a", "Anecdote"), ("f", "Facts / statistics"), ("h", "Historical"), ("q", "Questions")]),
  checks=[quiz("Which is a <i>function</i>, not a type, of an introduction?", [("Anecdote", "That is a type."), ("Attracting the reader’s attention", ""), ("Quotation", "That is a type.")], 1, "Right. Types describe the form; functions describe the job."),
          quiz("The essay opens with a problem and ends with ways to solve it. How are the introduction and conclusion related?", [("Question – answer", "No question was asked."), ("Problem – solution", ""), ("Past – present", "Time is not the link.")], 1, "Yes.")],
  cards=[("Intro functions", "Attract interest · introduce the topic · background · thesis · credibility."), ("Conclusion types", "Result · restatement · summary · prediction · recommendation."), ("Intro ↔ conclusion", "Problem–solution · question–answer · past–present · a returning story.")])

# ------------------------------------------------------------------ organisation
S["organisation"] = dict(
  title="Patterns of organisation", lead="Every paragraph is built in a recognisable way: in time order, by causes and effects, by comparison… Name the pattern, then prove it with the words that signal it.",
  onpaper=onpaper([("Identify the pattern of organization of Paragraph 3. Justify your answer. (01)", "LS, June 2019"),
                   ("What is the pattern of organization of Paragraph 8? Justify your answer. (01)", "LS, July 2019"),
                   ("What pattern of organization is used in paragraph 5? Support your answer with evidence. (Score: 1.5)", "LS paper, older session")]),
  marking="<span class=\"hand\">0.5 for identification and 0.5 for explanation</span> (2019). The official answer for June 2019: <i>It is a chronological pattern of organization. The narrator lists the events that led her to discover her daughter’s illness. This pattern is illustrated by the use of time expressions such as “At first”, “One day”, “Then” and “later”.</i> In July 2019 the answer was <i>problem-solution</i>, justified by the problem in the first sentences and the solution in the last.",
  method=table(["Pattern", "Signal words and clues"], [
      ["Chronological", "dates, at first, then, later, one day, finally"], ["Cause and effect", "because, since, as a result, consequently, leads to"],
      ["Comparison and contrast", "similarly, likewise / however, unlike, whereas, while"], ["Problem-solution", "a difficulty, then what was done about it"],
      ["Exemplification", "for example, for instance, such as"], ["Definition", "is, means, refers to, is called"],
      ["Classification", "types, kinds, categories, groups"], ["Spatial", "location: above, beside, at the far end"],
      ["Order of importance (logical)", "the most important, above all, the main reason"]]),
  see=model("Identify the pattern of organisation of paragraph 8 of <i>Wired Awake</i>. Justify.", "The pattern of organisation is chronological. The writer follows Karim over time, from his first attempt with the basket to its results. This is shown by the time expressions “for a month”, “the first three nights” and “by the second week”.", "<span class=\"hand\">0.5</span> pattern, <span class=\"hand\">0.5</span> justification with signal words.", "ls")
     + model("Identify the pattern of organisation of paragraph 3 of <i>The Price of a Click</i>. Justify.", "The pattern is cause and effect. The writer explains why alarming posts spread: algorithms show what keeps us scrolling, and since anger and fear hold attention longer, these posts are pushed to the top. The link is signalled by “are designed to” and “Since…”.", "<span class=\"hand\">0.5</span> pattern, <span class=\"hand\">0.5</span> justification.", "se"),
  tryit=sort("Which pattern?", [("“At first I was pleased. One day she forgot her bottle. Then I began to worry.”", "chr"), ("“Since the brain stores memories during deep sleep, tired students forget what they studied.”", "ce"), ("“Unlike paper books, screens give off light that delays sleep.”", "cc"), ("“Measuring the herd was too costly, so scientists built a computer model instead.”", "ps")],
          [("chr", "Chronological"), ("ce", "Cause–effect"), ("cc", "Comparison–contrast"), ("ps", "Problem–solution")]),
  checks=[quiz("Your justification for “chronological” must quote…", [("the time expressions", ""), ("the longest sentence", "Length proves nothing."), ("a statistic", "Statistics prove credibility, not time order.")], 0, "Yes: the signal words are your evidence.")],
  cards=[("Chronological", "Time order: at first, then, later, one day."), ("Cause–effect", "because, since, as a result, consequently."), ("Problem–solution", "A difficulty, then the answer to it.")])

# ------------------------------------------------------------------ relations
S["relations"] = dict(
  title="Thematic relations and cohesion", lead="Two questions live here: how two paragraphs are related in meaning, and which words tie them together.",
  onpaper=onpaper([("What is the thematic relationship between paragraphs 4 and 5? Explain.", "CRDP model exams 2016–2019"),
                   ("Identify the cohesive device used to link each pair of paragraphs below and specify its type. (01) a. Paragraphs 5 and 6 b. Paragraphs 7 and 8", "LS, June 2018")]),
  marking="For the 2018 cohesion question: <span class=\"hand\">0.25 for the device and 0.25 for its type</span> per pair. Official answer: <i>Paragraphs 5 and 6 are linked with the transition signal “In addition”, which is a direct cohesive device. Or: with the repetition of the key terms such as “biological intelligence”; it is an indirect cohesive device.</i>",
  method="<p><b>Thematic relations</b> between paragraphs:</p>" + table(["Relation", "The second paragraph…"], [
      ["Problem – solution", "solves the problem the first presents"], ["Problem – elaboration", "develops the problem in more detail"], ["Statement – reinforcement", "confirms or restates the first idea"],
      ["Statement – illustration", "gives examples of it"], ["Statement – elaboration", "explains it in detail"], ["Statement – support", "gives evidence: facts, statistics, a live example"],
      ["Statement – addition", "adds a new point"], ["Contradiction", "presents an opposing idea"], ["Past – present", "compares then and now"], ["Question – answer", "answers the question"], ["Cause – effect", "gives the result of what came before"]])
    + "<p><b>Cohesive devices:</b> <b>direct</b> links are connectors (moreover, however, as a result, in addition). <b>Indirect</b> links are pronouns, synonyms and repetition of key words. Writers use indirect links so the style does not become heavy with connectors.</p>",
  see=model("What is the thematic relationship between paragraphs 6 and 7 of <i>Wired Awake</i>? What links them?", "The relationship is problem – solution. Paragraph 6 shows how lack of sleep harms teenagers’ mood and health and traps them in a cycle, while paragraph 7 offers ways out: screens off an hour before bed, phones outside the bedroom, lessons on sleep. The link is direct: the connector “Fortunately”.", "Name the relation, show the content of both paragraphs, name the link.", "ls")
     + model("What is the thematic relationship between paragraphs 2 and 3 of <i>The Price of a Click</i>?", "The relationship is statement – elaboration. Paragraph 2 states that false stories spread because young people rarely check their sources; paragraph 3 explains in detail one reason behind it, the algorithms that push alarming posts to the top. The link is indirect: the repetition of “problem” and the idea of what we see online.", "Relation + content of both paragraphs + the link.", "se"),
  tryit=quiz("Paragraph 5 says screens harm sleep. Paragraph 6 begins “Moreover, they also harm eyesight.” What is the relation, and the link?", [("Statement – addition; direct link “Moreover”", ""), ("Contradiction; indirect link “they”", "No opposing idea appears."), ("Question – answer; repetition", "No question is asked.")], 0, "Yes: a new point, joined by a connector.")
     + quiz("Which is an <i>indirect</i> cohesive device?", [("However,", "That is a connector: direct."), ("Repeating the key term “biological intelligence”", ""), ("As a result,", "Direct.")], 1, "Right: repetition, pronouns and synonyms are indirect."),
  checks=[quiz("The second paragraph gives three statistics that prove the first. Relation?", [("Statement – support", ""), ("Past – present", "Not about time."), ("Problem – solution", "Nothing is solved.")], 0, "Yes: evidence supports the statement.")],
  cards=[("Direct link", "A connector: moreover, however, as a result."), ("Indirect link", "Pronoun, synonym, repetition of key words."), ("Statement – illustration", "The next paragraph gives examples.")])

# ------------------------------------------------------------------ tone and mood
S["tone-mood"] = dict(
  title="Tone and mood", lead="Tone is the writer’s attitude; mood is the atmosphere a place or scene creates. Name the tone with precise adjectives, then prove each one with the writer’s words.",
  onpaper=onpaper([("What two different adjectives best describe the writer’s tone in Paragraph 8? Justify your answer. (01)", "LS, June 2019"),
                   ("Determine the tone of Jan Kowalzig in Paragraph 6. Justify your answer. (Score: 01pt)", "LS paper"),
                   ("Explain how the tone of Paragraph 8 serves the paragraph’s function. (Score: 01)", "LS paper, older session")]),
  marking="<span class=\"hand\">0.5 for each tone with its justification</span>. The official answer (June 2019): <i>The writer’s tone is surprised/pleased/proud and hopeful/wishful. She is surprised by her daughter’s brave reaction… In addition, she reveals the wish of her daughter to have a cure.</i> Several adjectives are accepted if the justification fits.",
  method=table(["Family", "Tone adjectives"], [["Positive", "hopeful, enthusiastic, confident, optimistic, proud, impressed, amused"], ["Negative", "angry, indignant, accusing, worried, frustrated, pessimistic, alarmed, disappointed, warning"],
      ["Ironical", "sarcastic, critical, cynical, scornful, witty, humorous"], ["Sorrowful", "sad, melancholic, mournful, concerned, apprehensive"], ["Sentimental", "loving, compassionate, nostalgic"],
      ["Neutral", "objective, informative, instructive, serious, rational, impartial (no stand taken)"]])
    + "<p>Clues to tone: the subject, the choice of words and their <b>connotations</b>, the point of view and the purpose. <b>Mood</b> is named with nouns: tranquillity, fear, hope, sadness.</p>"
    + '<div class="tip-exam"><b>Answer frame:</b> The writer’s tone is <i>[adjective]</i>, as she … (“quote”). It is also <i>[adjective]</i> since … (“quote”).</div>',
  see=model("What two adjectives best describe the writer’s tone in paragraph 7 of <i>Wired Awake</i>? Justify.", "The writer’s tone is hopeful, as he opens with “Fortunately, small changes can make a large difference.” It is also instructive, since he lists practical steps for families and schools, such as switching off screens an hour before bed.", "<span class=\"hand\">0.5</span> per adjective with its evidence.", "ls")
     + model("What two adjectives best describe the writer’s tone in paragraph 6 of <i>The Price of a Click</i>? Justify.", "The tone is ironic, as the writer points out that this generation has more information than any before it “yet it may be less informed”. It is also critical, since he shows that endless headlines give only “the feeling of knowing” while the full story stays unread.", "<span class=\"hand\">0.5</span> per adjective with its evidence.", "se"),
  tryit=sort("Sort the tone words", [("optimistic", "pos"), ("indignant", "neg"), ("sarcastic", "iro"), ("objective", "neu"), ("enthusiastic", "pos"), ("alarmed", "neg"), ("cynical", "iro"), ("informative", "neu")],
          [("pos", "Positive"), ("neg", "Negative"), ("iro", "Ironical"), ("neu", "Neutral")]),
  checks=[quiz("Which answer would earn the full mark?", [("The tone is good and nice.", "Too vague: tone needs precise adjectives."), ("The tone is worried, as she fears her daughter “may not wake up”, and hopeful, since she wants a cure.", ""), ("The tone is sad because it is a sad story.", "One adjective and no quotation.")], 1, "Yes: two precise adjectives, each with evidence."),
          quiz("Mood is best named with…", [("nouns such as fear, tranquillity", ""), ("connectors", "No."), ("numbers", "No.")], 0, "Right, according to the course notes.")],
  cards=[("Tone", "The writer’s attitude. Adjective + evidence."), ("Mood", "The atmosphere. Named with nouns."), ("Neutral tone", "Objective, informative: the writer takes no stand.")])

# ------------------------------------------------------------------ purpose, type, audience
S["purpose-audience"] = dict(
  title="Purpose, type of writing, audience", lead="Why was this written, in what form, and for whom? These three questions are linked: answer one and the others follow.",
  onpaper=onpaper([("What two main types of audience, other than the general reader, might be interested in reading the selection above? State the interest each type finds in it. (01)", "LS, June 2019"),
                   ("What is the writer’s purpose in writing this selection? Explain.", "CRDP model exams"),
                   ("What type of writing is the above text? Explain.", "Course notes, from past papers")]),
  marking="Audience (June 2019): <span class=\"hand\">0.5 for each</span> audience with its interest; <i>any other reasonable type with justification is acceptable</i>. The official answer named parents and family members of patients (to learn the symptoms) and health organisations (the obstacles to a cure).",
  method=table(["Type of writing", "Purpose", "Typical modes"], [["Narrative", "to entertain, share an experience", "chronological order, anecdote"], ["Descriptive", "to describe a person, place or thing", "spatial order, sensory details"],
      ["Expository", "to inform, explain, define, instruct", "facts, examples, cause–effect, comparison"], ["Argumentative / persuasive", "to convince", "opinions, evidence, refutation"]])
    + "<p><b>Audience:</b> the general reader reads for interest; a <b>specific</b> audience has a reason, which you must state. Name a precise group (parents of teenagers, school principals, health ministers) and the interest it finds.</p>",
  see=model("What two types of audience, other than the general reader, might be interested in <i>Wired Awake</i>? State the interest of each.", "First, parents of teenagers might be interested, since the selection warns them of how phones damage their children’s sleep and gives them practical rules, like the phone basket. Second, school principals and teachers might be interested, because it explains why students fall asleep in class and suggests teaching how sleep works.", "<span class=\"hand\">0.5</span> per audience + interest.", "ls")
     + model("What is the writer’s purpose in <i>The Price of a Click</i>? Explain.", "The writer’s purpose is to inform and to persuade. He informs readers about how false news spreads, through a survey, algorithms and advertising money, and then persuades them to read the media more wisely, giving three questions to ask before sharing.", "Purpose + how the text achieves it.", "se"),
  tryit=quiz("A text explains how volcanoes form, with diagrams of the layers of the Earth. Type of writing?", [("Narrative", "No story is told."), ("Expository", ""), ("Argumentative", "No position is defended.")], 1, "Yes: it informs and explains.")
     + quiz("Which audience answer is precise enough?", [("People", "Too general."), ("Readers who like reading", "That is the general reader."), ("Journalism students, who learn how sensational headlines damage credibility", "")], 2, "Yes: a specific group and its interest."),
  checks=[quiz("Persuasive and argumentative writing share which purpose?", [("To convince", ""), ("To entertain", "That is narrative."), ("To describe", "That is descriptive.")], 0, "Right.")],
  cards=[("Expository", "Informs, explains, defines, instructs."), ("Audience answer", "A specific group + the interest it finds."), ("Narrative purpose", "To entertain, share an experience.")])

# ------------------------------------------------------------------ credibility
S["credibility"] = dict(
  title="Credibility and evidence", lead="Why should the reader believe the writer? Because of the evidence. Name each type, and give the example from the text with its paragraph.",
  onpaper=onpaper([("Identify two types of evidence the writer uses to achieve credibility. Support your answer with examples. (01)", "LS, June 2019"),
                   ("State four types of evidence (with examples) that reveal the writer’s credibility in the selection above. (Score: 01pt)", "LS paper")]),
  marking="<span class=\"hand\">0.5 for each type with its examples</span>. Official answer (June 2019): <i>First, the writer uses numbers as in Paragraphs 2 and 4: “400,000 people suffer from it”… Second, she uses specific names as in Paragraph 9: “House of Parliament”…</i> Any other two types with examples were accepted.",
  method=table(["Type of evidence", "Example of what to quote"], [["Statistics, numbers", "“only one in five”, “70 percent”"], ["Study or research results", "“a recent survey of 1,200 students”"], ["Expert opinion, quotation", "“…explains Dr Maya Haddad, a sleep researcher”"], ["Live example", "a real person’s story: Karim, Rana"], ["Facts: names, dates, places, events", "“Saida”, “Tripoli”, an organisation’s name"], ["Scientific explanation", "how melatonin works"]])
    + '<div class="tip-exam"><b>Answer frame:</b> To achieve credibility, the writer uses different types of evidence. First, … as in paragraph … (“…”). Second, … as in paragraph … (“…”).</div>',
  see=model("Identify two types of evidence the writer of <i>Wired Awake</i> uses to achieve credibility. Give examples.", "To achieve credibility, the writer uses different types of evidence. First, he gives the results of a survey in paragraph 2: of 1,200 students, “only one in five” sleeps eight hours. Second, he quotes an expert in paragraph 4, Dr Maya Haddad, a sleep researcher, who compares apps to “a slot machine”.", "<span class=\"hand\">0.5</span> per type with its example.", "ls")
     + model("Identify two types of evidence the writer of <i>The Price of a Click</i> uses to achieve credibility. Give examples.", "First, the writer gives statistics in paragraph 2: three out of four young adults get their news from social media. Second, he quotes an expert in paragraph 4, Ziad Khoury, a journalism lecturer: “When attention becomes the product, accuracy becomes optional.”", "<span class=\"hand\">0.5</span> per type with its example.", "se"),
  tryit=sort("Which kind of evidence?", [("“…says Ziad Khoury, a journalism lecturer.”", "exp"), ("“three out of four said that social media is their main source of news”", "stat"), ("“On a rainy evening in Tripoli, Rana…”", "live"), ("“melatonin, the hormone that makes us sleepy, is released two hours later”", "sci")],
          [("exp", "Expert opinion"), ("stat", "Statistics / survey"), ("live", "Live example"), ("sci", "Scientific fact")]),
  checks=[quiz("Which answer earns the full 0.5 for one type?", [("The writer uses statistics.", "No example: half the job."), ("The writer uses statistics, as in paragraph 2: “only one in five” sleeps eight hours.", ""), ("The writer is very credible.", "No type, no example.")], 1, "Yes: type + paragraph + example.")],
  cards=[("Credibility answer", "Type + paragraph + quoted example, twice."), ("Expert opinion", "A named specialist and their words."), ("Live example", "A real person’s experience.")])

# ------------------------------------------------------------------ figures of speech
S["figures"] = dict(
  title="Figures of speech", lead="The 2026–2027 list requires four: simile, metaphor, personification and irony. Identify the figure, explain what it means, and say why the writer used it.",
  onpaper=onpaper([("Explain the metaphor used in Paragraph 9, and show the purpose it serves. (01)", "LS paper"),
                   ("Identify the ironical situation in Paragraphs 1 and 2. Justify your answer. (Score: 01pt)", "LS paper"),
                   ("Identify the paradox in Paragraph 1 and explain it. (01)", "LS, June 2018")]),
  marking="<span class=\"hand\">0.5 for identification and 0.5 for explanation</span> (June 2018, paradox): <i>Biological intelligence is considered a “new” concept although it is very old; logically, something which is four billion years old should be old, not new.</i>",
  method=table(["Figure", "Definition", "Example"], [["<b>Simile</b>", "A comparison using <i>like</i> or <i>as</i>", "“It works like a slot machine.”"], ["<b>Metaphor</b>", "Says one thing <i>is</i> another", "“The media can be a window on the world or a mirror.”"],
      ["<b>Personification</b>", "Human qualities given to something not human", "“…where it cannot call for attention” (a phone calling)"], ["<b>Irony</b>", "The opposite of what is said or expected: verbal, dramatic, or of situation", "Students stay up to study, “only to forget” what they reviewed."]])
    + "<p>Recognise these too, as past papers have used them: <b>paradox</b> (seems contradictory but makes sense), <b>hyperbole</b> (exaggeration), <b>rhetorical question</b> (no answer expected), <b>oxymoron</b> (“hot ice”), <b>alliteration</b>, <b>antithesis</b>.</p>"
    + "<p><b>Purposes:</b> make an idea vivid or concrete, emphasise it, attract attention, express the writer’s attitude.</p>",
  see=model("Identify the figure of speech in “Yet a phone should be a tool that we use, not a master that decides when we sleep” (<i>Wired Awake</i>, paragraph 9) and explain its purpose.", "It is a metaphor: the phone is compared to a master who controls the teenager, a servant. It emphasises how completely phones now rule teenagers’ nights, and warns readers to take control back.", "<span class=\"hand\">0.5</span> identification, <span class=\"hand\">0.5</span> meaning and purpose.", "ls")
     + model("Identify the figure of speech in paragraph 6 of <i>The Price of a Click</i> and explain it.", "It is irony of situation: this generation has more information than any before it, yet it may be less informed. The contrast emphasises that quantity of news is not the same as understanding.", "<span class=\"hand\">0.5</span> + <span class=\"hand\">0.5</span>.", "se"),
  tryit=sort("Name the figure", [("“Her smile was as bright as the morning sun.”", "sim"), ("“The classroom was a beehive before the exam.”", "met"), ("“The wind whispered through the cedars.”", "per"), ("“The fire station burned down.”", "iro"), ("“I have told you a million times.”", "hyp")],
          [("sim", "Simile"), ("met", "Metaphor"), ("per", "Personification"), ("iro", "Irony"), ("hyp", "Hyperbole")]),
  checks=[quiz("What separates a simile from a metaphor?", [("A simile uses “like” or “as”.", ""), ("A metaphor is longer.", "Length does not matter."), ("A simile is always about nature.", "No.")], 0, "Right."),
          quiz("“Ironically, many students stay up late to study, only to forget what they reviewed.” Which irony?", [("Dramatic irony", "That is when the reader knows something a character does not."), ("Irony of situation", ""), ("Verbal irony", "The writer is not saying the opposite of what he means.")], 1, "Yes: the result is the opposite of the purpose.")],
  cards=[("Simile", "A comparison with like or as."), ("Metaphor", "One thing is said to be another."), ("Personification", "Human qualities for something non-human."), ("Irony", "The opposite of what is said or expected.")])

# ------------------------------------------------------------------ fallacies
S["fallacies"] = dict(
  title="Logical fallacies", lead="Some arguments sound convincing but are built on faulty reasoning. Spot the flaw, name it, and say what is wrong.",
  onpaper=onpaper([("Identify the logical fallacy in the following statement, and then explain why the reasoning is faulty.", "Typical form, from the course notes. Not found in the 2004–2019 LS and SE papers on CRDP, but part of the curriculum.")]),
  marking="Expect the usual split: name the fallacy, then explain the flaw. Reasonable thinking needs reasonable language: beware of <i>always, never, all, none, undoubtedly, obviously</i>.",
  method=table(["Fallacy", "Example from the course notes"], [["Faulty cause", "He was sure he would do well because everybody wished him good luck."], ["Hasty generalisation", "All smokers die of lung cancer."], ["False cause from sequence (it happened first)", "He gets full marks because he smokes a cigarette before every test."],
      ["Oversimplification (one cause for a complex problem)", "The operation succeeded because they used sterilised tools."], ["Half-truth", "The new recycling law is bad because it will cost more money than it saves."], ["Appeal to ignorance", "Show me one study that proves seat belts save lives."],
      ["Bandwagon (everybody does it)", "I choose to accept his proposal because everybody does."], ["False authority", "A gifted accountant, he will obviously be an active member of parliament."]]),
  see=model("Identify the fallacy: “My cousin failed the official English exam, so the exam is impossible to pass.”", "This is a hasty generalisation. The speaker draws a conclusion about all students from one case. Thousands of students pass every year, so one failure proves nothing about the exam.", "Name + why the reasoning fails."),
  tryit=sort("Name the fallacy", [("“Everyone in my class uses this app, so it must be safe.”", "band"), ("“A famous footballer says this phone is the best for students.”", "auth"), ("“I wore my blue shirt and we won, so it is a lucky shirt.”", "seq"), ("“All teenagers are addicted to their phones.”", "hasty")],
          [("band", "Bandwagon"), ("auth", "False authority"), ("seq", "False cause from sequence"), ("hasty", "Hasty generalisation")]),
  checks=[quiz("“Prove to me that this medicine is dangerous; until then, it is safe.” Which fallacy?", [("Appeal to ignorance", ""), ("Half-truth", "No partial fact is given."), ("Bandwagon", "No crowd is mentioned.")], 0, "Yes: the burden of proof is shifted.")],
  cards=[("Hasty generalisation", "A big conclusion from too few cases."), ("Bandwagon", "True because everybody does it."), ("Warning words", "always, never, all, none, obviously, undoubtedly.")])

# ------------------------------------------------------------------ character
S["character"] = dict(
  title="Character sketch", lead="A character is revealed by what they do, what they say, and what others say about them. Build your sketch from evidence, not impressions.",
  onpaper=onpaper([("Paragraph 7 sheds light mostly on James Cooney’s character. How does the writer describe him throughout the text? (Score: 1.5)", "LS paper"),
                   ("Draw a character sketch of … as portrayed in the above text.", "Typical form, from the course notes")]),
  marking="Marks go to each trait <b>with its evidence</b>. One adjective without proof earns little; two or three traits, each tied to an act or a saying, earn the full mark.",
  method=steps(["<b>Background</b>: name, age, position or job.", "<b>Acts</b>: what does the character do?", "<b>Sayings</b>: what do they say, and how?", "<b>Others</b>: what do other people say about them?", "<b>Result</b>: what happens because of their acts? Then name traits in pairs of opposites: knowledgeable or ignorant, daring or cowardly, tolerant or dogmatic, trustworthy or hypocritical."]),
  see=model("Draw a character sketch of Karim as portrayed in <i>Wired Awake</i>.", "Karim is a seventeen-year-old student from Saida. At first he appears weak-willed, since he keeps promising himself “just one more video” at 1:40 a.m. However, he is honest about his struggle, admitting that the first nights without his phone “were terrible”. Above all, he is determined: he keeps the phone basket for a month and is rewarded with better sleep and rising grades.", "Background + traits, each tied to an act or saying.", "ls")
     + model("Draw a character sketch of Rana as portrayed in <i>The Price of a Click</i>.", "Rana is a nineteen-year-old business student in Tripoli. At first she is impulsive, sharing a shocking photo “at once” without checking it. Yet she is responsible enough to learn from her mistake, and she shows initiative: she now runs a fact-checking page with three classmates, helping other students avoid the same error.", "Background + traits with evidence.", "se"),
  tryit=quiz("Which sentence best proves that a character is <i>generous</i>?", [("She is very generous.", "That repeats the trait; it proves nothing."), ("She gives half her salary to her neighbours’ children every month.", ""), ("Everyone likes her.", "Liked is not generous.")], 1, "Yes: an act is evidence."),
  checks=[quiz("Where do you start a character sketch?", [("With background: name, age, position", ""), ("With your own opinion of the character", "Evidence first."), ("With the writer’s tone", "That is a different question.")], 0, "Right.")],
  cards=[("Sketch method", "Background · acts · sayings · others’ words · results."), ("Trait answer", "Adjective + the act or saying that proves it.")])

# ------------------------------------------------------------------ summary
S["summary"] = dict(
  title="Summarising and paraphrasing", lead="A paraphrase repeats almost everything in new words; a summary keeps only the main points. Both are written in your own words.",
  onpaper=onpaper([("Summarise paragraph … in two or three sentences of your own.", "Typical form, from the course notes")]),
  marking="A summary loses marks for copied sentences and for minor details. It earns them for the main idea and the key supporting points, in your own words.",
  method="<p><b>A paragraph:</b> ask who, what, when, where, why and how, then combine the answers.</p>"
    + steps(["Skim: introduction and thesis, the topic sentence and concluding sentence of each body paragraph, the conclusion.", "Read in detail and take short notes.", "Combine the notes in your own words into one paragraph.", "Start with the title and the writer: “In <i>Wired Awake</i>, the writer explains…”"]),
  see=model("Summarise paragraph 3 of <i>Wired Awake</i> in one or two sentences.", "The writer explains that teenagers sleep late partly for biological reasons: their bodies release the sleep hormone two hours later than children’s, and screen light delays it further.", "The main point and its two supports, in new words, no examples.", "ls")
     + model("Summarise paragraph 4 of <i>The Price of a Click</i> in one or two sentences.", "Because websites earn money from every click, some of them use exaggerated headlines to attract readers, putting attention before accuracy.", "Cause, effect and the key idea, without the quotation.", "se"),
  tryit=quiz("Which is the best summary of paragraph 7 of <i>Wired Awake</i>?", [("Fortunately, small changes can make a large difference.", "That copies one sentence and gives no points."), ("Families and schools can protect teenagers’ sleep with simple rules, such as switching off screens early and keeping phones out of bedrooms.", ""), ("Some families have a basket in the living room at ten o’clock, which parents use too.", "One detail, not the main point.")], 1, "Yes: main idea plus key points, new words."),
  checks=[quiz("A paraphrase is usually…", [("about as long as the original", ""), ("one sentence for a whole text", "That is a summary."), ("a list of quotations", "No.")], 0, "Right: it keeps almost all the information.")],
  cards=[("Summary", "Main points only, own words, much shorter."), ("Paraphrase", "All the meaning, new words, similar length.")])

# ------------------------------------------------------------------ graphs and tables (Section D)
LS_TABLE = '<div class="scroll-x"><table class="t"><caption style="caption-side:top;text-align:left;font-weight:700;padding-bottom:4px">Average sleep on school nights, by daily screen time after 8 p.m. (practice data)</caption><tr><th>Screen time</th><td>under 1 h</td><td>1 to 3 h</td><td>3 to 5 h</td><td>over 5 h</td></tr><tr><th>Hours of sleep</th><td>8.6</td><td>7.9</td><td>7.1</td><td>6.2</td></tr></table></div>'
SE_TABLE = '<div class="scroll-x"><table class="t"><caption style="caption-side:top;text-align:left;font-weight:700;padding-bottom:4px">People who check a story before sharing it, by age (practice data)</caption><tr><th>Age</th><td>15–19</td><td>20–24</td><td>25–34</td><td>35 and over</td></tr><tr><th>Check first (%)</th><td>14</td><td>19</td><td>27</td><td>38</td></tr></table></div>'
S["graphs-tables"] = dict(
  title="Drawing a conclusion from a table or graph", lead="Section D gives you a table or graph linked to the text. The answer always has three parts: what the table shows, the evidence, and the conclusion.",
  onpaper=onpaper([("The table below shows the percentages of prevalence of Diabetes 1 by age. Read it carefully, and then answer the question that follows. What conclusion can be drawn from the table? Explain your answer in 4 to 5 sentences, using evidence. (1.5)", "LS, June 2019")]),
  marking="Official split (June 2019): <span class=\"hand\">0.5 for the introductory sentence, 0.5 for the explanation with evidence, and 0.5 for the concluding sentence</span>. The official answer began: <i>The table provides statistics about the relation between age and the percentages of Diabetes 1…</i> and ended: <i>Thus, the older the person gets, the higher the risk of Diabetes 1 will be.</i>",
  method=steps(["<b>Read the title, the labels and the scale.</b> What is measured, in what unit?", "<b>Introductory sentence:</b> “The table entitled … shows …”.", "<b>Evidence:</b> the lowest and highest values, and the trend between them, with the numbers.", "<b>Conclusion:</b> one sentence that states the relation: “Thus, the more …, the …”. Link it to the text if you can."])
    + "<p>For a picture or illustration: describe it, relate it to the text, then draw a conclusion.</p>",
  see='<div data-sec="ls">' + LS_TABLE + "</div>" + model("What conclusion can be drawn from the table? Explain in 4–5 sentences, using evidence.", "The table shows how much teenagers sleep on school nights according to the time they spend on screens after 8 p.m. Those who use screens for less than an hour sleep 8.6 hours, which is within the recommended range. Sleep falls to 7.9 hours with one to three hours of screen time and to 7.1 hours with three to five. Teenagers who use screens for more than five hours sleep only 6.2 hours. Thus, the more time teenagers spend on screens at night, the less they sleep, which supports the writer’s warning in <i>Wired Awake</i>.", "<span class=\"hand\">0.5</span> introduction, <span class=\"hand\">0.5</span> evidence, <span class=\"hand\">0.5</span> conclusion.", "ls")
     + '<div data-sec="se">' + SE_TABLE + "</div>" + model("What conclusion can be drawn from the table? Explain in 4–5 sentences, using evidence.", "The table shows the percentage of people who check a story before sharing it, by age group. Only 14 percent of people aged 15 to 19 check first, and the figure rises to 19 percent for those aged 20 to 24. It reaches 27 percent for people aged 25 to 34 and 38 percent for those aged 35 and over. Thus, the younger people are, the less likely they are to check a story, which supports the writer’s call for media literacy in schools and universities.", "<span class=\"hand\">0.5</span> introduction, <span class=\"hand\">0.5</span> evidence, <span class=\"hand\">0.5</span> conclusion.", "se"),
  tryit=quiz("Which is a strong concluding sentence?", [("The numbers are interesting.", "It concludes nothing."), ("Thus, the older a person is, the higher the risk becomes.", ""), ("The table has four columns.", "That describes the layout, not the meaning.")], 1, "Yes: it states the relation the data shows.")
     + quiz("Your evidence sentence should contain…", [("the actual numbers from the table", ""), ("your personal opinion", "Evidence comes from the table."), ("a quotation from the text only", "The table is the evidence here.")], 0, "Right: quote the figures."),
  checks=[quiz("How many parts does the official answer have?", [("Three: introduction, evidence, conclusion", ""), ("One long sentence", "The scheme marks three parts."), ("Two: numbers and opinion", "No.")], 0, "Correct: 0.5 each.")],
  cards=[("Section D answer", "Introductory sentence · evidence with numbers · concluding sentence."), ("Conclusion frame", "Thus, the more …, the …")])

T = '''<!doctype html>
<html lang="en">
<head>
{{> ../../../partials/head.html}}
<title>%(title)s · English G12</title>
<meta name="description" content="%(title)s for the Lebanese official English exam (Grade 12 LS and SE): how the question appears, how it is marked, a method, worked answers and practice.">
<script src="{{root}}assets/js/labs.js" defer></script>
<script src="{{root}}assets/js/skill.js" defer></script>
</head>
<body data-skill="%(id)s" data-nav="paper">
{{> ../../../partials/topbar.html}}
<main id="main" class="wrap skill-page">
  <div id="skill-top"></div>
  <header class="skill-head">
    <h1>%(title)s</h1>
    <p class="lead">%(lead)s</p>
    <div id="skill-badge"></div>
  </header>
  <section class="block"><h2><span class="k">On the paper</span><span>Real questions</span></h2>%(onpaper)s</section>
  <section class="block"><h2><span class="k">How it’s marked</span><span>The official split</span></h2><div class="marking">%(marking)s</div></section>
  <section class="block"><h2><span class="k">The method</span><span>How to answer</span></h2>%(method)s</section>
  <section class="block"><h2><span class="k">See it done</span><span>Worked answers</span></h2>%(see)s
    <p class="muted" style="font-size:.9rem">Texts: <a href="{{root}}reading/wired-awake/index.html">Wired Awake</a> (LS) and <a href="{{root}}reading/price-of-a-click/index.html">The Price of a Click</a> (SE), in the reading room.</p></section>
  <section class="block"><h2><span class="k">Try it</span><span>Practise</span></h2>%(tryit)s</section>
  <section class="block"><h2>Check yourself</h2><div class="check">%(checks)s</div><div id="skill-ready"></div></section>
  <section class="block"><h2>Revise</h2>%(cards)s</section>
  <nav id="skill-pager" class="pager" aria-label="More skills"></nav>
</main>
{{> ../../../partials/footer.html}}
</body>
</html>
'''
for sid, d in S.items():
    page = T % dict(id=sid, title=d["title"], lead=d["lead"], onpaper=d["onpaper"], marking=d["marking"], method=d["method"], see=d["see"],
                    tryit=d["tryit"], checks="".join(d["checks"]), cards=cards(sid[:4], d["cards"]))
    os.makedirs(os.path.join(ROOT, "tools", "site", "skills", sid), exist_ok=True)
    open(os.path.join(ROOT, "tools", "site", "skills", sid, "src.html"), "w", encoding="utf8").write(page)
    print("wrote", sid)
