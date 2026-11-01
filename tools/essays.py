"""Model essays, written for this platform to real official prompts.
Generates tools/texts/essay-<genre>.html with sentences in <span class="s"> (so they can be
read aloud and highlighted) and the roles of key sentences marked for "show the skeleton":
  .thesis, .topic (first sentence of a body paragraph), .closing (concluding sentence), .final
Usage: python3 tools/essays.py   (prints word counts)
"""
import os, re, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ESSAYS = {
  "argumentative": ("Technology and disease", [
    ("intro", "Few inventions have changed human life as deeply as technology. From the phone in our pocket to the scanner in a hospital, machines now shape how we live, work and even fall ill. Although some people blame technology for many dangerous diseases, I firmly believe that it has done far more to help doctors diagnose and treat illness than to cause it."),
    ("body", "To begin with, technology allows doctors to discover diseases early, when they are easiest to cure. Scanners reveal a tumour long before the patient feels any pain. In addition, technology makes treatment safer and more precise. Surgeons now use tiny cameras and robotic arms, so operations that once needed weeks in hospital are done in a day. Finally, technology carries medicine to people who could not reach it before. A villager in Akkar can consult a specialist in Beirut through a video call. Clearly, technology has become one of medicine’s strongest allies."),
    ("counter", "Admittedly, some argue that technology causes serious diseases. They point to radiation, to factory pollution and to the long hours young people spend in front of screens. However, these harms come from the misuse of technology, not from technology itself. Radiation in hospitals is carefully measured and controlled, and the same science that pollutes also gives us filters and clean energy. As for screen addiction, it is a habit that education and self-discipline can correct. Therefore, blaming technology for disease is like blaming a knife instead of the hand that holds it."),
    ("conclusion", "In conclusion, technology has transformed the way doctors detect and treat disease. Its risks are real, but they can be controlled when it is used wisely. If we invest in medical technology and teach people to use it responsibly, the future of health will be brighter than ever."),
  ]),
  "persuasive": ("Face to face", [
    ("intro", "How many times have you sat at a family dinner where everyone was looking at a screen? Online resources have made learning faster and communication easier than ever. Yet a world that talks only through screens risks forgetting how to talk at all. That is why face-to-face communication remains essential, both for building social skills and for keeping families close."),
    ("body", "First of all, real conversations teach social skills that no screen can teach. When students work together in the same room, they learn to listen, to take turns and to settle disagreements politely. Moreover, they learn to read faces, tones and gestures, which carry much of what people mean. A shy student who presents in front of classmates gains a confidence that a typed message will never give him. In short, face-to-face contact turns knowledge into teamwork."),
    ("body", "Equally important, face-to-face communication is the heart of family life. Values such as respect, patience and generosity are passed on at the dinner table, not through a group chat. When parents and children talk directly, misunderstandings are cleared quickly, and young people feel heard. Grandparents, too, can share stories and traditions that would otherwise be lost. Families that make time to sit together are, quite simply, families that stay together."),
    ("conclusion", "To sum up, online resources are useful, but they must never replace the human voice and the human face. Personal communication builds the skills we need at school and the bonds we need at home. So put the phone down tonight and start a real conversation: it may be the most important lesson you learn this year."),
  ]),
  "problem-solution": ("When half a country is held back", [
    ("intro", "In many countries, women make up half of the population but only a small share of decision-makers. This gap is not only unfair; it is costly. Gender inequality creates serious economic and social problems, but practical steps taken by both citizens and governments can solve them."),
    ("body", "The first problem is economic. When women are kept out of good jobs or paid less for the same work, a country loses the talent of half its workforce, and its growth slows down. The second problem is social. When few women hold leadership positions, issues such as health, education and child support receive less attention. As a result, families suffer, and children grow up with fewer opportunities."),
    ("body", "Citizens can begin to change this situation at home and at work. Parents can give their daughters the same education and encouragement they give their sons. Employers can promote people according to their skills, not their gender, and offer flexible hours to working mothers. Moreover, men and women alike can vote for qualified female candidates and support them once they are elected."),
    ("body", "The government, for its part, must protect equality through law. It can enforce equal pay for equal work and punish discrimination. It can also provide affordable childcare, so that mothers do not have to choose between a career and their children. Finally, scholarships can prepare more women for leadership."),
    ("conclusion", "In conclusion, gender inequality weakens both the economy and society, but it is not a fate we must accept. If families, employers and the state work together, women will contribute fully, and the whole country will share in their success."),
  ]),
  "cause-effect": ("A warming world", [
    ("intro", "Summers in Lebanon are getting longer and hotter, and storms are becoming more violent. Around the world, crops are failing and rivers are drying up. This critical change in the climate is not a mystery: it is mainly caused by burning fossil fuels, destroying forests and wasting resources."),
    ("body", "The main cause is the burning of fossil fuels. Cars, power plants and factories burn oil, coal and gas, and release huge amounts of carbon dioxide into the air. This gas traps the sun’s heat around the Earth like a blanket. As a result, temperatures keep rising year after year."),
    ("body", "Another important cause is deforestation. Trees absorb carbon dioxide and keep the soil cool and moist. However, millions of trees are cut down every year for timber, farming and building. Consequently, there are fewer trees to clean the air, and the land becomes drier and more exposed to fires and floods."),
    ("body", "Finally, our habits of consumption make the problem worse. We waste food, water and electricity, and we buy more products than we need. Each product must be made, packed and transported, which burns even more energy and produces even more pollution. A single plastic bottle, for instance, may travel thousands of kilometres before it is thrown away after a few minutes."),
    ("conclusion", "To conclude, the climate crisis is the result of human choices: the fuels we burn, the forests we destroy and the way we consume. The good news is that choices can change. Clean energy, protected forests and careful habits can still slow the damage and leave the next generation a healthier planet."),
  ]),
}

def sentences(p):
    return [x for x in re.split(r"(?<=[.?!])\s+(?=[A-Z“])", p.strip()) if x]

for g, (title, paras) in ESSAYS.items():
    words = sum(len(re.findall(r"[A-Za-z’'-]+", p)) for _, p in paras)
    out = [f'<article class="selection essay" data-text="essay-{g}" aria-label="Model essay: {html.escape(title)}">',
           f'  <h3>{html.escape(title)}</h3>',
           f'  <p class="orig">Model essay written for this platform, {words} words.</p>']
    for n, (role, p) in enumerate(paras, 1):
        ss = sentences(p); spans = []
        for i, s in enumerate(ss):
            cls = ["s"]
            if role == "intro" and i == len(ss) - 1: cls.append("thesis")
            if role in ("body", "counter") and i == 0: cls.append("topic")
            if role in ("body", "counter") and i == len(ss) - 1 and len(ss) > 3: cls.append("closing")
            if role == "conclusion" and i == 0: cls.append("restate")
            if role == "conclusion" and i == len(ss) - 1: cls.append("final")
            spans.append(f'<span class="{" ".join(cls)}">{html.escape(s, quote=False)}</span>')
        out.append(f'  <p data-p="{n}" data-role="{role}">' + " ".join(spans) + "</p>")
    out.append("</article>")
    open(os.path.join(ROOT, "tools", "texts", f"essay-{g}.html"), "w", encoding="utf8").write("\n".join(out) + "\n")
    print(f"{g:18} {words} words, {len(paras)} paragraphs")
