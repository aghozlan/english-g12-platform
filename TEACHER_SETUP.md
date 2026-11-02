# Teacher dashboard: switching it on (about 5 minutes, free)

Student activity goes to your own Google Sheet, **English G12 — student activity** (already in your Drive, with two tabs: *Students* and *Activity*). A small script inside the Sheet receives the updates and feeds the dashboard. No other account or database is needed.

## 1. Paste the script
1. Open the Sheet **English G12 — student activity** in Google Drive.
2. Menu **Extensions → Apps Script**.
3. Delete everything in `Code.gs`, paste the whole content of the `Code.gs` file Claude sent you (it already contains your teacher password), and press **Save** (the disk icon).

## 2. Deploy it as a web app
1. **Deploy → New deployment**. Next to "Select type" click the gear → **Web app**.
2. Description: `English G12`. **Execute as: Me**. **Who has access: Anyone**.
3. **Deploy** → **Authorize access** → choose your Google account. Google warns that the app is unverified, because it is your own script: click **Advanced → Go to English G12 (unsafe) → Allow**. It can only touch this Sheet.
4. Copy the **Web app URL** (it ends in `/exec`) and send it to Claude (or paste it into `assets/js/config.js`).

## 3. Open the dashboard
`https://aghozlan.github.io/english-g12-platform/teacher/` and type your teacher password. The page is not linked anywhere on the site; keep the address and the password to yourself.

## Daily use
| You want to… | Do this |
|---|---|
| Group your classes | Give each class a code (e.g. `SAIDA-LS1`); students type it when they enter. Filter by it in the dashboard. |
| See who is studying now | The **Online now** tile, the green dot in the table. |
| See one student’s progress | Tap their name: skills ready, study time, visits, recent activity. |
| See what the class still needs | **Skills across the class**: the shortest bars are the skills to teach next. |
| Keep or analyse the raw data | **Open the Sheet**: every row is there, ready to sort, filter or chart. |
| Change the password | Change `TEACHER_KEY` in the script, then **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same. |
| Remove a student | Delete their row in the *Students* tab (their activity rows can stay or go). |

## What this does, honestly
- Students enter with a name they type; it is not verified, so a student could type someone else’s name.
- Sent to the Sheet: name, section, class code, pages opened, active study time, skills marked ready, marks ready, texts completed. **Not sent:** answers, essays, anything typed in the exercises.
- Anyone who finds the script address could post fake rows, but only someone with your password can read the data.
- Google’s free limits are generous for this use (each student sends a small update every few minutes while studying). If hundreds of students study at the same moment, a few updates may wait and are sent later from their device.
