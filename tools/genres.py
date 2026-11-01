"""Writes the four essay-genre skill pages (tools/site/skills/<genre>/src.html)
from one template, so every genre page has the same anatomy:
on the paper → how it's marked → the outline → the model essay → technique → check yourself.
Usage: python3 tools/genres.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def outline_html(rows):
    out = ['<ol class="outline">']
    for title, parts in rows:
        out.append(f"<li><b>{title}</b><ul>" + "".join(f"<li>{p}</li>" for p in parts) + "</ul></li>")
    return "\n".join(out) + "</ol>"

def quiz(q, opts, a, ok):
    bs = "".join(f'<button class="chip"{(" data-why=" + chr(34) + w + chr(34)) if w else ""}>{t}</button>' for t, w in opts)
    return f'<div class="quiz" data-a="{a}" data-ok="{ok}"><p>{q}</p><div class="opts">{bs}</div><div class="feedback"></div></div>'

G = {
 "argumentative": dict(
  title="Argumentative essay", desc="The argumentative essay of the Lebanese official English exam: the official outline, refutation, and a model essay read aloud.",
  lead="The most frequent prompt on past papers. You take a side, prove it, and then defeat the other side. The refutation is not optional: the prompt asks for it.",
  onpaper=[("Some people believe that technology stands behind many dangerous diseases; however, others believe that technology has helped doctors diagnose and treat many diseases. Where do you stand? Write a well-organized argumentative essay of 250-300 words in which you show your point of view. <b>Make sure that your essay supports your position and refutes the opposite point of view.</b>", "LS, June 2019"),
           ("Some people believe that the rich should pay more taxes … Others believe that rich people should not be taxed more because they have worked hard for their money … In a well-organized argumentative essay of 250-300 words, show with which point of view you stand.", "SE, June 2019")],
  marking="The last sentence of every argumentative prompt sets the content mark: <i>supports your position <b>and</b> refutes the opposite point of view</i>. An essay that only argues one side is answering half the prompt, however well it is written.",
  outline=[("I. Introduction", ["1. General statement (hook)", "2. Narrower or background statement", "3. Thesis statement: your claim and the counter claim"]),
           ("II. Your claim", ["Topic sentence: the point of view you support", "a. b. c. Three supporting details", "Concluding sentence"]),
           ("III. The counter claim", ["Topic sentence: the opposite point of view", "a. b. c. Each of their points, followed by your refutation", "Concluding sentence"]),
           ("IV. Conclusion", ["Restatement of the thesis and final thoughts"])],
  outline_src="The outline printed with Prompt A of the LS paper, June 2019 (special-needs version).",
  extra='<div class="note">Many teachers prefer a five-paragraph form: three arguments in three paragraphs, then one paragraph for the counter-argument and its refutation. Both shapes answer the prompt. With 250–300 words, the four-paragraph outline above leaves more room for each point.</div>',
  model_prompt="LS, June 2019: technology and dangerous diseases.",
  technique=('The refutation in three moves', '<ol class="steps"><li><b>Concede</b>: state their view fairly. <i>Admittedly, some argue that…</i></li><li><b>Counter</b>: show why it is weak, incomplete or wrong. <i>However, these harms come from the misuse of technology, not from technology itself.</i></li><li><b>Conclude</b>: bring it back to your claim. <i>Therefore, blaming technology for disease is like blaming a knife instead of the hand that holds it.</i></li></ol>'),
  checks=[quiz("What must an argumentative essay contain that a persuasive essay does not?", [("A hook in the introduction", "Both genres open with a hook."), ("The opposite point of view and its refutation", ""), ("A conclusion", "Every essay needs one.")], 1, "Right. The prompt says: refute the opposite point of view."),
          quiz("Which sentence is a refutation?", [("Some people think technology causes diseases.", "That only states their view; it does not answer it."), ("Technology is very important in our lives.", "That is a general statement, not a refutation."), ("However, most of these illnesses come from misusing technology, not from technology itself.", "")], 2, "Yes. It answers the opposite view and turns it back toward your claim."),
          quiz("Where does your thesis go?", [("The last sentence of the introduction", ""), ("The first sentence of the essay", "The first sentence is the general statement, the hook."), ("The conclusion", "The conclusion restates it.")], 0, "Correct: general → narrower → thesis.")],
 ),
 "persuasive": dict(
  title="Persuasive essay", desc="The persuasive essay of the Lebanese official English exam: the official outline, techniques of persuasion, and a model essay read aloud.",
  lead="You already hold the view the prompt gives you. Your job is to make the reader feel it is true, with strong reasons, real examples, and a closing call to act.",
  onpaper=[("“Overreliance on online resources to learn results in a world of depersonalized communication.” Write a persuasive essay of 250-300 words in which you show how important it is to have face-to-face communication in order to build social skills and family relationships (team work, communication, values and manners, social responsibilities, tolerance, etc.)", "SE, August 2019"),
           ("To sustain the beauty and value of nature, all living things should be well-preserved. Write a persuasive essay of 250-300 words in which you show how vital it is to preserve nature and protect its living things.", "LS, July 2019, second session")],
  marking="Persuasive prompts usually <b>give you the two controlling ideas</b>: <i>social skills</i> and <i>family relationships</i> above. Those become your two body paragraphs. The ideas in brackets are a gift: use them as evidence. No counter-argument is needed.",
  outline=[("I. Introduction", ["A. Hook", "B. A narrower statement linking the hook to the thesis", "C. Thesis statement with your two controlling ideas"]),
           ("II. Topic sentence 1: the first controlling idea", ["A. B. C. Three pieces of supporting evidence (details and examples)", "D. Concluding sentence"]),
           ("III. Topic sentence 2: the second controlling idea", ["A. B. C. Three pieces of supporting evidence", "D. Concluding sentence"]),
           ("IV. Conclusion", ["A. Restatement of the thesis", "B. Final thought"])],
  outline_src="The outline printed with Prompt B of the LS and SE papers, August 2019 (special-needs version).",
  extra="",
  model_prompt="SE, August 2019: face-to-face communication.",
  technique=('Tools of persuasion', '<ol class="steps"><li><b>A question that involves the reader</b>: <i>How many times have you sat at a family dinner where everyone was looking at a screen?</i></li><li><b>Concrete examples</b> the reader recognises: the shy student presenting to the class, grandparents telling stories.</li><li><b>Facts and figures</b> when you have them, and confident, positive wording: <i>essential, the heart of, never</i>.</li><li><b>A call to act</b> in the final thought: <i>So put the phone down tonight…</i></li></ol>'),
  checks=[quiz("A persuasive prompt says: “…show how important it is to have face-to-face communication in order to build <b>social skills</b> and <b>family relationships</b>.” What are your body paragraphs?", [("Advantages and disadvantages of the internet", "That changes the task."), ("Social skills, then family relationships", ""), ("Your opinion, then the opposite opinion", "That is the argumentative shape.")], 1, "Exactly. The prompt hands you the two controlling ideas."),
          quiz("Which final thought is most persuasive?", [("That is all I have to say about this topic.", "It closes the essay but persuades no one."), ("Technology has advantages and disadvantages.", "That weakens your own case at the last moment."), ("So tonight, leave the phone in another room and talk to someone you love.", "")], 2, "Yes: a concrete call to act.")],
 ),
 "problem-solution": dict(
  title="Problem-solution essay", desc="The problem-solution essay of the Lebanese official English exam: structure, citizen and government solutions, and a model essay read aloud.",
  lead="First make the reader see the problem clearly, then offer solutions that are practical: who does what, and how.",
  onpaper=[("Countries with high levels of gender inequality have lower economic growth. Some studies show that countries with fewer female leaders ignore a wider range of issues such as health, education, and child support. Write a problem-solution essay of 250-300 words in which you identify two different problems (social, economic, political, etc.) caused by gender inequality, and then suggest practical solutions to these problems.", "SE, August 2018")],
  marking="Read the counts: <i>two different problems</i>, <i>practical solutions</i>. The examiner checks that you named two problems, that they really are different (social and economic, for example), and that each solution could actually be done.",
  outline=[("Introduction", ["Hook and background: present the problem", "Thesis: the problem can be solved"]),
           ("Body 1: the problem", ["Problem (or effect) 1, explained", "Problem (or effect) 2, explained"]),
           ("Body 2: solutions for citizens", ["What individuals, families or employers can do"]),
           ("Body 3: solutions for the government", ["Laws, services, funding, programmes"]),
           ("Conclusion", ["Restate the problem and the solutions", "Final thought: what should have been done, or what will follow"])],
  outline_src="The generic form from the course notes. No official outline has been published for this genre.",
  extra="",
  model_prompt="SE, August 2018: problems caused by gender inequality.",
  technique=('Make a solution practical', '<ol class="steps"><li>Say <b>who</b> acts: parents, employers, schools, the ministry.</li><li>Say <b>what</b> they do, concretely: <i>enforce equal pay for equal work</i>, not <i>make things fair</i>.</li><li>Link it to the <b>problem</b> it solves: <i>affordable childcare, so that mothers do not have to choose…</i></li></ol>'),
  checks=[quiz("Which solution is <i>practical</i>?", [("People should stop being unfair to women.", "Who does what? It is a wish, not a solution."), ("The government can provide affordable childcare so mothers can keep working.", ""), ("Inequality is a very bad thing for every country.", "That describes the problem again.")], 1, "Yes: who (the government), what (affordable childcare), why (mothers keep working)."),
          quiz("The prompt asks for “two different problems”. Which pair works?", [("Lower growth and lower national income", "Both are economic: the same problem twice."), ("Economic: lost talent and growth. Social: health and education neglected.", ""), ("Women are unhappy and women are sad", "One idea in two words.")], 1, "Right: two different kinds of problem.")],
 ),
 "cause-effect": dict(
  title="Cause-effect essay", desc="The cause-effect essay of the Lebanese official English exam: block organisation, cause and effect connectors, and a model essay read aloud.",
  lead="Why does something happen, or what does it lead to? Give each cause (or each effect) its own paragraph, and link every claim to its result.",
  onpaper=[("The climate has become hotter than usual … Write an expository essay of 250-300 words in which you discuss two to three reasons behind the current critical situation of the environment, and then provide some effective actions humans should take in order to save our planet.", "LS, July 2019, second session"),
           ("Artificial intelligence … is getting smarter every day. In a well-organized expository essay of 250-300 words, develop the statement above, shedding light on two positive and/or negative effects of artificial intelligence in any field(s) of your choice.", "LS, June 2018")],
  marking="Past papers often <b>call</b> these prompts expository, but the task inside is cause or effect: <i>reasons behind</i>, <i>effects of</i>. Read the task, not only the label. Note that the 2019 prompt also asked for <i>actions to take</i>: an answer with causes only would miss part of the content mark.",
  outline=[("Introduction", ["Hook and background", "Thesis naming your two or three causes (or effects)"]),
           ("Body 1, 2 (and 3)", ["One cause (or effect) per paragraph: topic sentence, explanation, example"]),
           ("Conclusion", ["Restatement", "Final thought. If the prompt asks for actions, give them a paragraph of their own before the conclusion."])],
  outline_src="Block organisation, from the course notes: “each of the causes or effects in a separate paragraph”.",
  extra='<div class="note"><b>Expository essays in past papers.</b> Until 2019 about a third of the prompts said “expository”. The 2026–2027 list names persuasive, cause-effect, problem-solution and argumentative instead. If an expository prompt appears, use the official expository outline: introduction, two body paragraphs each with a topic sentence and three pieces of evidence, conclusion. It is the same shape as the persuasive outline.</div>',
  model_prompt="Adapted from LS, July 2019: the reasons behind the climate crisis (the actions part is left to you).",
  technique=('Cause and effect connectors', '<ol class="steps"><li>Cause → effect: <i>As a result, Consequently, Therefore, This leads to</i></li><li>Effect ← cause: <i>because, since, due to, is caused by</i></li><li>Order of importance: <i>The main cause… Another important cause… Finally…</i></li></ol>'),
  checks=[quiz("“Discuss two to three reasons behind the current critical situation.” What is the essay mainly about?", [("Effects", "Reasons are causes."), ("Causes", ""), ("Advantages and disadvantages", "Not here.")], 1, "Right: reasons behind = causes."),
          quiz("Which connector shows a result?", [("Consequently,", ""), ("For instance,", "That introduces an example."), ("Although", "That introduces a contrast.")], 0, "Yes: consequently = as a result.")],
 ),
}

T = '''<!doctype html>
<html lang="en">
<head>
{{> ../../../partials/head.html}}
<title>%(title)s · English G12</title>
<meta name="description" content="%(desc)s">
<script src="{{root}}assets/js/writing-data.js" defer></script>
<script src="{{root}}assets/js/labs.js" defer></script>
<script src="{{root}}assets/js/listen.js" defer></script>
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

  <section class="block">
    <h2><span class="k">On the paper</span>Real prompts</h2>
    %(onpaper)s
  </section>

  <section class="block">
    <h2><span class="k">How it’s marked</span><span>Content <span class="hand">3.5</span>, language <span class="hand">3.5</span>, tidiness <span class="hand">1</span></span></h2>
    <div class="marking">%(marking)s</div>
  </section>

  <section class="block">
    <h2><span class="k">The outline</span>Four or five paragraphs, each with one job</h2>
    %(outline)s
    <p class="muted" style="font-size:.88rem">%(outline_src)s</p>
    %(extra)s
  </section>

  <section class="block">
    <h2><span class="k">See it done</span>A model essay</h2>
    <p class="muted">Prompt: %(model_prompt)s Listen to it, then switch on the views to see how it is built.</p>
    <div class="lab" data-lab="essay" id="model" style="background:transparent;border:0;padding:0">
      <div class="listen" data-audio="essay-%(id)s" data-for="model"></div>
      <div class="row" style="margin-bottom:6px"><button class="chip" data-view="skeleton" aria-pressed="false">Show the skeleton</button><button class="chip" data-view="connectors" aria-pressed="false">Show the connectors</button></div>
      <div class="legend-row"><span><i style="background:var(--mark)"></i>thesis</span><span><i style="background:var(--mark-2)"></i>topic sentences</span><span><i style="background:var(--mark-3)"></i>concluding sentences</span></div>
      {{> ../../../texts/essay-%(id)s.html}}
    </div>
  </section>

  <section class="block">
    <h2><span class="k">Technique</span>%(tech_title)s</h2>
    %(tech_body)s
  </section>

  <section class="block">
    <h2><span class="k">Your turn</span>Write one</h2>
    <p>Open the <a href="{{root}}writing/index.html?g=%(id)s">writing studio</a>: choose a real %(lower)s prompt, build your essay part by part on the outline, and check it against the rubric.</p>
  </section>

  <section class="block">
    <h2>Check yourself</h2>
    <div class="check">%(checks)s</div>
    <div id="skill-ready"></div>
  </section>

  <nav id="skill-pager" class="pager" aria-label="More skills"></nav>
</main>
{{> ../../../partials/footer.html}}
</body>
</html>
'''

for gid, d in G.items():
    onpaper = "\n    ".join(f'<div class="onpaper">{t}<span class="src">{s}</span></div>' for t, s in d["onpaper"])
    html = T % dict(id=gid, title=d["title"], desc=d["desc"], lead=d["lead"], onpaper=onpaper, marking=d["marking"],
                    outline=outline_html(d["outline"]), outline_src=d["outline_src"], extra=d["extra"], model_prompt=d["model_prompt"],
                    tech_title=d["technique"][0], tech_body=d["technique"][1], lower=d["title"].split()[0].lower(), checks="\n      ".join(d["checks"]))
    os.makedirs(os.path.join(ROOT, "tools", "site", "skills", gid), exist_ok=True)
    open(os.path.join(ROOT, "tools", "site", "skills", gid, "src.html"), "w", encoding="utf8").write(html)
    print("wrote", gid)
