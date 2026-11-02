/**
 * English G12 — student activity collector and teacher dashboard feed.
 * Lives inside the Google Sheet "English G12 — student activity"
 * (Extensions → Apps Script). Deploy as a web app: Execute as "Me", access "Anyone".
 *
 *  POST  (from the platform)  : records a student's profile, progress and activity.
 *  GET   ?key=...             : returns all students and recent activity, for the dashboard.
 *
 * The teacher password is the only secret. Change it here, then Deploy → Manage deployments
 * → edit → Version: New version → Deploy.
 */
const TEACHER_KEY = "CHANGE_ME";
const MAX_EVENTS_RETURNED = 600;

const S_HEAD = ["Student ID", "Name", "Section", "Class code", "First seen", "Last seen", "Visits", "Minutes", "Skills ready", "Marks ready /20", "Ready list", "Last page", "Texts done"];
const A_HEAD = ["Time", "Student ID", "Name", "Section", "Class code", "Event", "Page", "Detail", "Seconds"];

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
const clip_ = (v, n) => String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").slice(0, n);

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: "bad json" }); }
  if (!body || body.app !== "egp" || !body.profile || !/^[a-z0-9]{8,24}$/.test(body.profile.id || "")) return out_({ ok: false, error: "bad request" });

  const p = body.profile, st = body.state || {};
  const id = p.id, name = clip_(p.name, 40), sec = (p.section === "se" ? "SE" : "LS"), cls = clip_(p.cls, 20).toUpperCase();
  const events = (Array.isArray(body.events) ? body.events : []).slice(0, 60);
  const now = new Date();

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // activity log
    const act = sheet_("Activity", A_HEAD);
    let secs = 0, visits = 0, lastPage = "";
    const rows = events.map((ev) => {
      const s = Math.max(0, Math.min(3600, Number(ev.s) || 0)); secs += s;
      if (ev.t === "enter") visits++;
      if (ev.p) lastPage = clip_(ev.p, 120);
      const when = ev.at ? new Date(Number(ev.at)) : now;
      return [isNaN(when) ? now : when, id, name, sec, cls, clip_(ev.t, 20), clip_(ev.p, 120), clip_(ev.d, 200), s];
    });
    if (rows.length) act.getRange(act.getLastRow() + 1, 1, rows.length, A_HEAD.length).setValues(rows);

    // one row per student, updated in place
    const stu = sheet_("Students", S_HEAD);
    const n = stu.getLastRow() - 1;
    const ids = n > 0 ? stu.getRange(2, 1, n, 1).getValues().map((r) => r[0]) : [];
    let r = ids.indexOf(id);
    const ready = Array.isArray(st.ready) ? st.ready.slice(0, 60).map((x) => clip_(x, 30)) : null;
    const texts = Array.isArray(st.texts) ? st.texts.slice(0, 60).map((x) => clip_(x, 40)) : null;
    if (r < 0) {
      stu.appendRow([id, name, sec, cls, now, now, visits, Math.round(secs / 6) / 10, ready ? ready.length : 0, Number(st.marks) || 0, ready ? ready.join(", ") : "", lastPage, texts ? texts.join(", ") : ""]);
    } else {
      const row = r + 2, cur = stu.getRange(row, 1, 1, S_HEAD.length).getValues()[0];
      cur[1] = name; cur[2] = sec; cur[3] = cls; cur[5] = now;
      cur[6] = (Number(cur[6]) || 0) + visits;
      cur[7] = Math.round(((Number(cur[7]) || 0) * 60 + secs) / 6) / 10;
      if (ready) { cur[8] = ready.length; cur[10] = ready.join(", "); }
      if (st.marks != null) cur[9] = Number(st.marks) || 0;
      if (lastPage) cur[11] = lastPage;
      if (texts) cur[12] = texts.join(", ");
      stu.getRange(row, 1, 1, S_HEAD.length).setValues([cur]);
    }
  } finally { lock.releaseLock(); }
  return out_({ ok: true });
}

function doGet(e) {
  const key = (e && e.parameter && e.parameter.key) || "";
  if (TEACHER_KEY === "CHANGE_ME" || key !== TEACHER_KEY) return out_({ ok: false, error: "wrong password" });
  const stu = sheet_("Students", S_HEAD), act = sheet_("Activity", A_HEAD);
  const sv = stu.getLastRow() > 1 ? stu.getRange(2, 1, stu.getLastRow() - 1, S_HEAD.length).getValues() : [];
  const last = act.getLastRow(), from = Math.max(2, last - MAX_EVENTS_RETURNED + 1);
  const av = last > 1 ? act.getRange(from, 1, last - from + 1, A_HEAD.length).getValues() : [];
  const iso = (d) => (d instanceof Date ? d.toISOString() : String(d));
  return out_({
    ok: true, now: new Date().toISOString(), sheet: SpreadsheetApp.getActive().getUrl(),
    students: sv.map((r) => ({ id: r[0], name: r[1], section: r[2], cls: r[3], first: iso(r[4]), last: iso(r[5]), visits: r[6], minutes: r[7], readyCount: r[8], marks: r[9], ready: String(r[10] || "").split(", ").filter(String), lastPage: r[11], texts: String(r[12] || "").split(", ").filter(String) })),
    events: av.map((r) => ({ at: iso(r[0]), id: r[1], name: r[2], section: r[3], cls: r[4], t: r[5], p: r[6], d: r[7], s: r[8] }))
  });
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
