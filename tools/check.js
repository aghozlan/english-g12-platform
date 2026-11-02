// Quality check before every publish:
//   phone (390 px) and desktop (1280 px), light and dark,
//   no console errors, no horizontal scroll, every unit tab opens.
// Usage: node tools/check.js [outDir]   (serves the repo on a local port)
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = process.argv[2] || path.join(root, "_raw", "shots");
fs.mkdirSync(outDir, { recursive: true });
const types = { ".m4a": "audio/mp4", ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
  const pages = [["home", "/index.html"]];
  for (const dir of ["reading", "skills", "writing", "teacher"]) {
    const d = path.join(root, dir);
    if (fs.existsSync(path.join(d, "index.html"))) pages.push([dir, "/" + dir + "/index.html"]);
    if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (fs.existsSync(path.join(d, f, "index.html"))) pages.push([dir + "-" + f, "/" + dir + "/" + f + "/index.html"]);
  }
  let fails = 0;
  for (const [w, h, dev] of [[390, 844, "phone"], [1280, 860, "desktop"]]) {
    for (const scheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: dev === "phone" ? 2 : 1 });
      for (const [name, url] of pages) {
        const page = await ctx.newPage();
        const errors = [];
        page.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.addInitScript(() => { try { if (!localStorage.getItem("egp.profile")) localStorage.setItem("egp.profile", JSON.stringify({ id: "checkcheck00", name: "Check Bot", section: "ls", cls: "" })); } catch (e) {} });
        await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" })); // offline check: fallback fonts
        await page.goto(base + url, { waitUntil: "load" });
        await page.waitForTimeout(name === "home" ? 2500 : 600);
        const tabs = await page.$$(".subtab");
        for (const t of tabs) { await t.click(); await page.waitForTimeout(120); }
        if (tabs.length) await tabs[0].click();
        // open every lesson step to render all labs
        await page.$$eval("details.step", (ds) => ds.forEach((d) => (d.open = true)));
        await page.waitForTimeout(200);
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const shot = path.join(outDir, `${name}-${dev}-${scheme}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        const bad = errors.length || scrollW > 0;
        if (bad) fails++;
        console.log(`${bad ? "FAIL" : "ok  "} ${name} ${dev} ${scheme}  hscroll=${scrollW}  errors=${errors.length}${errors.length ? "\n      " + errors.slice(0, 5).join("\n      ") : ""}`);
        await page.close();
      }
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  process.exit(fails ? 1 : 0);
})();
