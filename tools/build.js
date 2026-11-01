// Build every page of the site.
//   tools/site/**/src.html  ->  the same path at the repo root, as index.html
//   e.g. tools/site/skills/own-words/src.html -> skills/own-words/index.html
//        tools/site/src.html                  -> index.html
// - {{> path}}          includes a partial (path relative to the file that includes it)
// - {{> path|suffix}}   same, with every id / data-ref / for made unique by "-suffix"
// - {{root}}            relative path from the page to the site root ("", "../", "../../")
// Answers live only in <div class="ans" hidden> blocks: the one place a future lock encrypts.
// Usage: node tools/build.js
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const site = path.join(__dirname, "site");

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (f === "src.html") out.push(p);
  }
  return out;
}

function expand(html, dir, depth = 0) {
  if (depth > 8) throw new Error("include nesting too deep");
  return html.replace(/\{\{>\s*([^}|\s]+)(?:\|([a-z0-9-]+))?\s*\}\}/g, (_, p, suffix) => {
    const file = path.resolve(dir, p);
    let inc = expand(fs.readFileSync(file, "utf8"), path.dirname(file), depth + 1);
    if (suffix) inc = inc.replace(/\b(id|data-ref|for|aria-controls)="([^"]+)"/g, (m, a, v) => `${a}="${v}-${suffix}"`);
    return inc;
  });
}

let problems = 0, pages = 0;
for (const src of walk(site)) {
  const rel = path.relative(site, path.dirname(src));            // "" or "skills/own-words"
  const outDir = path.join(root, rel);
  const prefix = rel ? rel.split(path.sep).map(() => "..").join("/") + "/" : "";
  let html = expand(fs.readFileSync(src, "utf8"), path.dirname(src)).replace(/\{\{root\}\}/g, prefix);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (dup.length) { problems++; console.error(`[${rel || "home"}] duplicate ids: ${dup.join(", ")}`); }
  const left = html.match(/\{\{[^}]*\}\}/g);
  if (left) { problems++; console.error(`[${rel || "home"}] unexpanded: ${left.join(" ")}`); }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  const ans = (html.match(/<div class="ans" hidden>/g) || []).length;
  console.log(`${(rel || "home").padEnd(28)} ok  ${ans} hidden answers  ${(html.length / 1024).toFixed(0)} KB`);
  pages++;
}
console.log(pages + " pages");
process.exit(problems ? 1 : 0);
