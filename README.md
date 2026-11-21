# SAT Ascent — Elite Digital-SAT Prep (zero-admin)

A complete, self-contained SAT prep platform for students preparing for the **Digital SAT**:

- **Accounts with no passwords** — students sign in with **Google** or **GitHub** (via Firebase OAuth). No password is ever created, stored, or transmitted by this app. A lightweight "on this device" email account is available as a fallback that also stores no password.
- **Tamper-sealed progress** — every student's full record (account, attempts, mastery, misses, settings) is stored as **one encrypted envelope** (AES-256-GCM + HMAC-SHA256) that only this app can read and parse. Manual edits, corruption or rollback attempts are detected and rejected.
- **Unlimited tests** — full-length, standard and quick full tests with **module-adaptive difficulty** (a strong Module 1 unlocks a harder Module 2, like test day), plus topic-wise tests and drills at three difficulty bands (Advanced / **Elite 700+**).
- **Topic-wise learning** — a strategy primer for each of the 8 official Digital-SAT domains, with worked micro-examples and common-trap lists.
- **Personalized tips** — after every test, a tip engine analyzes pacing, skipped questions, weakest domains and elite-band accuracy to produce concrete advice and a **7-day plan** for the next exam.
- **Twice-daily content watching** — a GitHub Action runs at 06:00 and 18:00 UTC, pulls new items from SAT communities and official announcements (titles/links/summaries only — no copyrighted question content), commits them to `data/`, and emails a change report to the admin. The site's **Updates** panel reads the same log, so students always see the latest content intelligence.
- **Zero admin burden** — everything is static + scheduled GitHub Actions. No servers, no databases, no bills. **No API keys in the code** — all configuration is injected at deploy time from repository secrets.

All questions are **original**, written in the style and difficulty bands of the Digital SAT (every item tagged Advanced or Elite/700+ band, each with a full explanation of the trap).

---

## 1 · One-time setup (~10 minutes)

### Step 1 — Put this code in your repo `svesgp/SAT`

Done — the platform is pushed to `main` and the deploy workflow publishes it.

### Step 2 — Point GitHub Pages at the deploy workflow (one click)

Repo → **Settings → Pages** → under "Build and deployment", set **Source: GitHub Actions**. That's all: the included **Deploy site to GitHub Pages** workflow (`.github/workflows/deploy.yml`) builds the site, injects your secrets as a generated config file, and publishes it on every push (including the twice-daily data refresh).

Your site lives at **`https://svesgp.github.io/SAT/`**.

### Step 3 — Add the required secret (sealed storage key)

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Required | Value |
|---|---|---|
| `SEAL_SECRET` | **Yes** | A long random string (run `openssl rand -hex 32` locally, or use any password generator). This is the master key material for every student's sealed progress record. **Keep it stable** — rotating it makes existing sealed records unreadable (progress resets). |

Then trigger a redeploy: **Actions → Deploy site to GitHub Pages → Run workflow**. Without this secret the deploy still succeeds but generates an *ephemeral* key per build, which would reset student progress on every deploy — so set it once and leave it.

Optionally also add `ADMIN_EMAIL` (your email, shown in the footer/About; not related to scraper reports).

### Step 4 — (Students) That's it

Students open the site and use **Continue with email (on this device)** — fully functional, zero passwords, progress sealed on their device. Provider sign-in (Step 5) adds multi-device sync of the *sign-in identity*.

### Step 5 — Enable Google / GitHub sign-in (5 minutes, one time, no code edits)

Sign-in is delegated to providers through **Firebase Auth** (Google's free tier — no server, no password handling on your side). The Firebase web config is **public by design** (it identifies the Firebase project, it is not a password) — but we keep it out of the code and repo anyway, injected at deploy time:

1. Go to <https://console.firebase.google.com> → **Add project** (name it e.g. `sat-ascent`) → disable Analytics → Create.
2. In the project: **Build → Authentication → Get started**. Enable the **Google** provider and the **GitHub** provider.
   - For **GitHub**: console.firebase.google.com will show a callback URL like `https://<your-project>.firebaseapp.com/__/auth/handler`. Copy it. Then on GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App** — Application name anything, Homepage `https://svesgp.github.io/SAT/`, callback = the URL you copied. Create, then copy the **Client ID** and **Client Secret** back into the Firebase GitHub provider box and save.
   - For **Google**: just toggle it on and add a support email.
3. **Build → Authentication → Settings → Authorized domains → Add domain**: `svesgp.github.io` (and add your custom domain later if you attach one). Firebase's own `*.firebaseapp.com` domain is pre-authorized.
4. **Project settings (gear) → General → Your apps → Web app (`</>`)** — register, then copy the config object.
5. Repo → **Settings → Secrets and variables → Actions → New repository secret** — name `FIREBASE_CONFIG_JSON`, value exactly the copied object as JSON:

```json
{"apiKey":"AIza…","authDomain":"sat-ascent.firebaseapp.com","projectId":"sat-ascent","storageBucket":"sat-ascent.appspot.com","messagingSenderId":"…","appId":"1:…:web:…"}
```

6. Re-run **Deploy site to GitHub Pages** → the two provider buttons now open real Google/GitHub popups, and no password ever touches this app. **Nothing in `index.html` or the repository changed.**

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
        └─ commits data/ → deploy workflow republishes the site automatically
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
- **Sealed progress records.** The entire student record is serialized to JSON, encrypted with **AES-256-GCM** and authenticated twice: the GCM tag plus an **HMAC-SHA256** over the full envelope header. The encryption/HMAC key is derived per account (PBKDF2-SHA256, 200 000 iterations, salted with the account email) from `SEAL_SECRET`, which exists **only as a GitHub repository secret** and is injected into the deployed site as a generated `assets/app-config.js` (gitignored, never committed).
- **Tampering is rejected, not trusted.** Envelope format `SA1|keyId|email|timestamp|sequence|iv|ciphertext|mac`: flipping any byte fails the MAC/GCM check; a record whose sequence number is older than the signed mirror (rollback attack) is rejected; a ciphertext that decrypts to a different account email is rejected. In every case the rejected record is moved to a quarantine storage key for inspection and the app continues with a clean state — tampered data is never used.
- **Nothing leaves the device.** Sealed records live in the student's own browser (localStorage) — no server, no database, nothing to breach. Students can export their progress as plaintext JSON from Settings (a deliberate, user-initiated action).
- **No keys in the code.** `index.html` and the repository contain no API keys or secrets; they are generated at deploy time from repository secrets. The committed `assets/app-config.sample.js` documents the shape.
- **Honest limits.** Client-side sealing makes casual tampering (DevTools localStorage edits, score inflation) effectively impossible, but a site with no backend cannot stop a determined attacker who reverse-engineers the client and the injected secret. For a practice platform this is the right trade-off; true server-side authority would require a backend.

## 5 · Troubleshooting

| Symptom | Fix |
|---|---|
| Updates panel says the feed isn't available | You opened the HTML from disk (`file://`). Browsers block `fetch` there — use the GitHub Pages URL or a local server (`python3 -m http.server`). |
| "Progress saved unencrypted" warning | The page is not in a secure context (`file://`). Open the site over HTTPS (GitHub Pages) or localhost — sealing needs WebCrypto, which secure contexts provide. |
| "Saved progress failed its integrity check" toast | The sealed record was modified, corrupted, or produced by a different deploy key (e.g. `SEAL_SECRET` rotated or missing). The rejected record is in the `satascent_v1.quarantine` localStorage key. If `SEAL_SECRET` was unset before, set it (Step 3) — progress accumulates again from a clean state. |
| Provider buttons show a setup dialog | `FIREBASE_CONFIG_JSON` not set (Step 5) — students can still use the device account meanwhile. |
| `auth/unauthorized-domain` on sign-in | Add `svesgp.github.io` (and any custom domain) to Firebase → Authentication → Settings → Authorized domains. |
| Actions run fails at the email step | Check the secrets' names/typos; Gmail requires an **App Password**, not your login password. Email failures never fail the run — data updates still commit. |
| Pages 404 / not updating | Settings → Pages → Source must be **GitHub Actions**, and the **Deploy site to GitHub Pages** workflow must have succeeded (check the Actions tab). |
| Every deploy resets student progress | `SEAL_SECRET` is not set — the build generates an ephemeral key each time. Set it (Step 3) and keep it stable. |
