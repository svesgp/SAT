# SAT Ascent — Elite Digital-SAT Prep (zero-admin)

A complete, self-contained SAT prep platform for students preparing for the **Digital SAT**:

- **Accounts with no passwords** — students sign in with **Google** or **GitHub** (via Firebase OAuth). No password is ever created, stored, or transmitted by this app. A lightweight "on this device" email account is available as a fallback that also stores no password.
- **Unlimited tests** — full-length, standard and quick full tests with **module-adaptive difficulty** (a strong Module 1 unlocks a harder Module 2, like test day), plus topic-wise tests and drills at three difficulty bands (Advanced / **Elite 700+**).
- **Topic-wise learning** — a strategy primer for each of the 8 official Digital-SAT domains, with worked micro-examples and common-trap lists.
- **Personalized tips** — after every test, a tip engine analyzes pacing, skipped questions, weakest domains and elite-band accuracy to produce concrete advice and a **7-day plan** for the next exam.
- **Twice-daily content watching** — a GitHub Action runs at 06:00 and 18:00 UTC, pulls new items from SAT communities and official announcements (titles/links/summaries only — no copyrighted question content), commits them to `data/`, and emails a change report to the admin. The site's **Updates** panel reads the same log, so students always see the latest content intelligence.
- **Zero admin burden** — everything is static + scheduled GitHub Actions. No servers, no databases, no bills.

All questions are **original**, written in the style and difficulty bands of the Digital SAT (every item tagged Advanced or Elite/700+ band, each with a full explanation of the trap).

---

## 1 · One-time setup (~10 minutes)

### Step 1 — Put this code in your private repo `svesgp/SAT`

Upload everything in this folder to the repo (keep the folder structure, including `.github/` and `data/`):

**Option A — GitHub web upload (easiest):** on `github.com/svesgp/SAT`, open **Add file → Upload files**, drag the contents of this folder in, and commit. GitHub's web uploader does *not* accept empty/hidden folders — for `.github/workflows/scrape-and-report.yml` use **Add file → Create new file**, type the path `.github/workflows/scrape-and-report.yml`, and paste the file's contents. Same trick for `data/reports/` if needed (or just let the first scraper run create it).

**Option B — git:**
```bash
cd path/to/extracted/sat-prep-repo
git init
git remote add origin https://github.com/svesgp/SAT.git
git add -A && git commit -m "SAT Ascent: initial platform"
git push -u origin main --force
```

### Step 2 — Turn on GitHub Pages (hosting)

Repo → **Settings → Pages** → under "Build and deployment", set **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`** → Save.

Your site goes live in 1–2 minutes at **`https://svesgp.github.io/SAT/`**. Every future commit (including the twice-daily data refresh) republishes it automatically.

> Prefer Vercel? Import the repo at vercel.com → Framework preset "**Other**" → Deploy. No build command, output directory `.`. Everything else works identically.

### Step 3 — Set the admin email (the only placeholder in the app)

Open `index.html`, find near the top:

```js
adminEmail: "",
```

and put your email inside the quotes. It appears in the site footer and Settings → About. This is **not** what receives the scraper reports — that's Step 5, which uses a GitHub secret.

### Step 4 — (Students) That's it

Students open the site, click **Continue with Google** or **Continue with GitHub**… which requires Step 5's OAuth setup. Until then they can use **Continue with email (on this device)** — fully functional, still zero passwords.

### Step 5 — Enable Google / GitHub sign-in (5 minutes, one time)

Sign-in is delegated to providers through **Firebase Auth** (Google's free tier — no server, no password handling on your side):

1. Go to <https://console.firebase.google.com> → **Add project** (name it e.g. `sat-ascent`) → disable Analytics → Create.
2. In the project: **Build → Authentication → Get started**. Enable the **Google** provider and the **GitHub** provider.
   - For **GitHub**: console.firebase.google.com will show a callback URL like `https://<your-project>.firebaseapp.com/__/auth/handler`. Copy it. Then on GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App** — Application name anything, Homepage `https://svesgp.github.io/SAT/`, callback = the URL you copied. Create, then copy the **Client ID** and **Client Secret** back into the Firebase GitHub provider box and save.
   - For **Google**: just toggle it on and add a support email.
3. **Build → Authentication → Settings → Authorized domains → Add domain**: `svesgp.github.io` (and add your custom domain later if you attach one). Firebase's own `*.firebaseapp.com` domain is pre-authorized.
4. **Project settings (gear) → General → Your apps → Web app (`</>`)** — register, then copy the config values.
5. Paste them into `index.html`:

```js
firebase: { apiKey: "AIza…", authDomain: "sat-ascent.firebaseapp.com",
            projectId: "sat-ascent", appId: "1:…:web:…" },
```

Redeploy (any commit) → the two provider buttons now open real Google/GitHub popups, and no password ever touches this app.

### Step 6 — Get the twice-daily change report by email (optional but recommended)

The watcher runs on GitHub's schedule automatically. To also **receive the report by email**:

1. Repo → **Settings → Secrets and variables → Actions → New repository secret** — add:
   | Secret | Value |
   |---|---|
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | a Gmail **App Password** (myaccount.google.com → Security → 2-Step Verification → App passwords) |
   | `SMTP_TO` | the admin email that should receive the report |
2. Test it: repo → **Actions → Twice-daily refresh → Run workflow**. Then check **Actions → (run) → scrape-and-report** for the log, and your inbox.

Without secrets the watcher still runs fully — it just skips the email. Every report is also committed under `data/reports/`, so you can read the history in the repo at any time.

---

## 2 · How the twice-daily automation works

```
GitHub Actions (cron 0 6 * * *, 0 18 * * *)
        │  python scripts/scraper.py
        ├─ fetches public RSS: r/SAT, r/SATACTprep, College Board blog
        ├─ dedupes against data/update-log.json  (only NEW items survive)
        ├─ writes data/update-log.json  → read live by the site's Updates panel
        ├─ writes data/reports/report-YYYYmmdd-HHMM.md  → full change history
        ├─ emails the report (if SMTP secrets set)
        └─ commits data/ → GitHub Pages republishes automatically
```

The scraper stores **only titles, links, dates and short public summaries** of discussions and announcements. It deliberately does **not** copy question content — that keeps the repo clean of copyright issues while still telling you (and surfacing to students) where new past-paper chatter and official news live. The feed sources live in the `SOURCES` list at the top of `scripts/scraper.py` — add or remove feeds there.

## 3 · Extending the question bank

Questions live in plain JavaScript arrays inside `index.html`:

- `window.RW1` — Craft & Structure + Information & Ideas
- `window.RW2` — Standard English Conventions + Expression of Ideas
- `window.MATH` — static Math items
- The `GENERATORS` block — parameterized Math items that produce **fresh, unlimited** questions (systems, quadratics, percent chains, conditional probability, sectors, trig, …) with recomputed answers.

To add an item, copy the shape:

```js
{id:"CS10", d:"CS", tier:"elite",           // domain + core/advanced/elite
 p:"passage HTML (optional)", q:"question stem",
 ch:["A","B","C","D"], a:0,                 // a = index of the correct choice
 e:"explanation of the answer and the traps"},
```

Domain codes: `CS, II, SEC, EOI` (Reading & Writing) and `ALG, ADV, PSD, GEO` (Math). After editing, commit — the site republishes on its own.

## 4 · Privacy & security model

- **No passwords anywhere.** Provider sign-in is handled entirely by Google/GitHub via Firebase; this app only receives a name/email/uid.
- Student progress lives **in the student's own browser** (localStorage) — nothing is sent to any server, so there is nothing to breach. They can export it as JSON from Settings.
- The repo contains no secrets. Email credentials live only in GitHub Actions secrets.

## 5 · Troubleshooting

| Symptom | Fix |
|---|---|
| Updates panel says the feed isn't available | You opened the HTML from disk (`file://`). Browsers block `fetch` there — use the GitHub Pages URL or a local server (`python3 -m http.server`). |
| Provider buttons show a setup dialog | Firebase config not added (Step 5) — students can still use the device account meanwhile. |
| `auth/unauthorized-domain` on sign-in | Add `svesgp.github.io` (and any custom domain) to Firebase → Authentication → Settings → Authorized domains. |
| Actions run fails at the email step | Check the secrets' names/typos; Gmail requires an **App Password**, not your login password. Email failures never fail the run — data updates still commit. |
| Pages 404 | Settings → Pages → Source must be "Deploy from a branch / main / (root)". |
