// Build every page:
//   tools/<unit>/src.html  ->  units/<unit>/index.html
// - {{> path}}           includes a partial (path relative to the unit folder)
// - {{> path|suffix}}    same, with every id / data-ref / for made unique by "-suffix"
//                        (lets one reading text appear in several panels)
// - {{fig}}              inlines tools/<unit>/figs/fig.svg
// - copies tools/<unit>/*.js next to the page
// Answers stay in <div class="ans" hidden> blocks: the one place a future lock will encrypt.
// Usage: node tools/build.js            (all units)
//        node tools/build.js unit-1
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const only = process.argv[2];
const jobs = fs.readdirSync(__dirname)
  .filter((d) => fs.existsSync(path.join(__dirname, d, "src.html")))
  .filter((d) => !only || d === only);

function expand(html, dir, depth = 0) {
  if (depth > 6) throw new Error("include nesting too deep");
  html = html.replace(/\{\{>\s*([^}|\s]+)(?:\|([a-z0-9-]+))?\s*\}\}/g, (_, p, suffix) => {
    const file = path.resolve(dir, p);
    let inc = expand(fs.readFileSync(file, "utf8"), path.dirname(file), depth + 1);
    if (suffix) inc = inc.replace(/\b(id|data-ref|for|aria-controls)="([^"]+)"/g, (m, a, v) => `${a}="${v}-${suffix}"`);
    return inc;
  });
  html = html.replace(/\{\{([a-z0-9_]+)\}\}/g, (_, n) => fs.readFileSync(path.join(dir, "figs", n + ".svg"), "utf8"));
  return html;
}

let problems = 0;
for (const u of jobs) {
  const src = path.join(__dirname, u);
  const out = path.join(root, "units", u);
  const html = expand(fs.readFileSync(path.join(src, "src.html"), "utf8"), src);
  // sanity checks
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) { problems++; console.error(`[${u}] duplicate ids:`, [...new Set(dup)].join(", ")); }
  const exIds = [...html.matchAll(/data-ex="([^"]+)"/g)].map((m) => m[1]);
  const exDup = exIds.filter((x, i) => exIds.indexOf(x) !== i);
  if (exDup.length) { problems++; console.error(`[${u}] duplicate exercise ids:`, exDup.join(", ")); }
  const ans = (html.match(/<div class="ans" hidden>/g) || []).length;
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  for (const f of fs.readdirSync(src)) if (f.endsWith(".js")) fs.copyFileSync(path.join(src, f), path.join(out, f));
  console.log(`${u}: ok, ${exIds.length} exercises, ${ans} hidden answers, ${(html.length / 1024).toFixed(0)} KB`);
}
process.exit(problems ? 1 : 0);
