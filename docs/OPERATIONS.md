# Operations guide — SAT Ascent

Everything the site owner needs: one-time setup, sign-in providers, secrets, the scheduled automations, and troubleshooting. The student-facing overview lives in the [README](../README.md).

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

### Step 4 — Enable Google / GitHub sign-in (5 minutes, one time, no code edits)

Sign-in is delegated to providers through **Firebase Auth** (Google's free tier — no server, no password handling on your side). The Firebase web config is **public by design** (it identifies the Firebase project, it is not a password) — but we keep it out of the code and repo anyway, injected at deploy time:

1. Go to <https://console.firebase.google.com> → **Add project** (name it e.g. `sat-ascent`) → disable Analytics → Create.
2. **Build → Authentication → Sign-in method** — enable the providers:
   - **Google**: toggle **Enable**, add a support email, Save. No other configuration needed.
   - **GitHub**: toggle **Enable**. The dialog shows an **Authorization callback URL** (looks like `https://<your-project>.firebaseapp.com/__/auth/handler`) — copy it. Then on GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App** — Application name anything, Homepage `https://svesgp.github.io/SAT/`, callback = the URL you copied. Register, copy the **Client ID**, **Generate a new client secret**, and paste both back into the Firebase GitHub provider box. Save.
3. **Build → Authentication → Settings → Authorized domains → Add domain**: `svesgp.github.io` (and your custom domain later if you attach one). Firebase's own `*.firebaseapp.com` domain is pre-authorized. This one-time entry covers **both** providers.
4. **Project settings (gear) → General → Your apps → Web app (`</>`)** — register, then copy the config object.
5. Repo → **Settings → Secrets and variables → Actions → New repository secret** — name `FIREBASE_CONFIG_JSON`, value exactly the copied object as JSON:

```json
{"apiKey":"AIza…","authDomain":"sat-ascent.firebaseapp.com","projectId":"sat-ascent","storageBucket":"sat-ascent.appspot.com","messagingSenderId":"…","appId":"1:…:web:…"}
```

6. Re-run **Deploy site to GitHub Pages** → the provider buttons open real Google/GitHub popups, and no password ever touches this app. **Nothing in `index.html` or the repository changed.**

**Status checklist (what's currently live):** the config secret is set and parsed; the **Google provider is fully provisioned** (verified against Firebase's public pre-flight API); the **GitHub provider still needs the three steps in 4.2** — until then Firebase answers `OPERATION_NOT_ALLOWED` for GitHub sign-ins. Provider toggles take effect immediately; only config changes need a redeploy.

### Step 5 — Get the twice-daily change report by email (optional but recommended)

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

## 2 · The scheduled automations

### 2.1 Twice-daily content refresh

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

The scraper stores **only titles, links, dates and short public summaries** of discussions and announcements. It deliberately does **not** copy question content — that keeps the repo clean of copyright issues while still surfacing where new past-paper chatter and official news live. Feed sources live in the `SOURCES` list at the top of `scripts/scraper.py`.

### 2.2 Daily open-source question-bank crawler

`.github/workflows/update-banks.yml` runs daily at 04:00 UTC (and on demand):

```
GitHub Actions (cron 0 4 * * *)
        │  python scripts/ingest.py --selftest   (sanity-check the ingester)
        │  python scripts/ingest.py --write
        ├─ for each source in data/sources.yml:
        │    fetch → license allowlist check → item validation → dedupe
        ├─ rewrites data/modules/extra.js  → the site merges banks into modules
        ├─ writes data/ingest-log.json     → transparent run record
        └─ commits → deploy workflow republishes the site automatically
```

Sources are **only** ingested when their `license` field is in the permissive allowlist (MIT, ISC, BSD-2/3, Apache-2.0, CC0, CC-BY-4.0, CC-BY-SA-4.0, OPL-1.0). Non-commercial and unknown licenses are skipped with a warning. To add sources, edit `data/sources.yml` (format documented inside) — see also [ADD-A-MODULE.md](ADD-A-MODULE.md) for the full pipeline guide.

### 2.3 Deploy workflow

`deploy.yml` builds the site on every push: it copies `index.html`, `assets/` and `data/` into the Pages artifact and generates `assets/app-config.js` from the repository secrets (`SEAL_SECRET`, `SEAL_KEY_ID`, `ADMIN_EMAIL`, `FIREBASE_CONFIG_JSON`). The secret values never exist in the repo or in the built code files — only in the generated runtime config of the deployed site.

---

## 3 · The AI tutor

The 🤖 tutor (button on every question + floating button in the app) calls the **Pollinations.ai community text API** — free, no key, no account, CORS-enabled for browser use. The request contains only a system prompt, the current exam-module name, the last few chat turns, and (when the student taps "Ask AI tutor" on a question) that question's stem/choices plus whether it has been answered. **No student record, email, or progress is ever sent.**

Before a question is answered the system prompt forbids revealing the answer (guided hints only); after answering, full worked explanations are allowed. If the API is unreachable the panel shows a friendly retry message — nothing else in the app depends on it. To switch providers later, edit `scripts/src/10b_ai.js` (`POST_URL` / `GET_URL`) and rebuild.

---

## 4 · Managing accounts & data on a device

- **Sign out** (⏻ button in the header) parks the student's sealed record in an email-keyed slot on that device and returns to the sign-in screen. Signing back in with the same account (or creating a device account with the same email) restores everything.
- Multiple students can therefore share one browser: sign out, sign in as the next student — each record stays intact and isolated.
- **Reset all progress** (Settings) wipes the current account's record; parked records for other accounts on the same device are also cleared by a browser-data wipe.

---

## 5 · Building from source

The app is assembled from source parts in `/scripts/src` of the authoring workspace (or edited directly):

- `index.html` = engine parts (head + body + config + app logic + AI + init)
- `data/modules/sat.js` = the SAT data parts + `07b_sat_register.js`

After changing source parts, rebuild `index.html` / `data/modules/sat.js`, commit, and push — the deploy workflow republishes automatically. There is no build toolchain beyond `cat`.

---

## 6 · Troubleshooting

| Symptom | Fix |
|---|---|
| Updates panel says the feed isn't available | You opened the HTML from disk (`file://`). Browsers block `fetch` there — use the GitHub Pages URL or a local server (`python3 -m http.server`). |
| "Progress saved unencrypted" warning | The page is not in a secure context (`file://`). Open the site over HTTPS (GitHub Pages) or localhost — sealing needs WebCrypto. |
| "Saved progress failed its integrity check" toast | The sealed record was modified, corrupted, or produced by a different deploy key (e.g. `SEAL_SECRET` rotated or missing). The rejected record is in the `satascent_v1.quarantine` localStorage key. If `SEAL_SECRET` was unset before, set it (Step 3) — progress accumulates again from a clean state. |
| Provider buttons show a setup dialog | `FIREBASE_CONFIG_JSON` not set (Step 4) — students can still use the device account meanwhile. |
| `auth/operation-not-allowed` on GitHub sign-in | The GitHub provider toggle (and its OAuth app callback) is not finished — complete Step 4.2. Google sign-in is already provisioned. |
| `auth/unauthorized-domain` on sign-in | Add `svesgp.github.io` (and any custom domain) to Firebase → Authentication → Settings → Authorized domains. |
| AI tutor says the service is unreachable | Pollinations.ai is a free community API and can be briefly down or rate-limited. Retry in a minute; nothing else is affected. |
| Actions run fails at the email step | Check the secrets' names/typos; Gmail requires an **App Password**, not your login password. Email failures never fail the run — data updates still commit. |
| Pages 404 / not updating | Settings → Pages → Source must be **GitHub Actions**, and the **Deploy site to GitHub Pages** workflow must have succeeded (check the Actions tab). |
| Every deploy resets student progress | `SEAL_SECRET` is not set — the build generates an ephemeral key each time. Set it (Step 3) and keep it stable. |
| Dashboard previously showed sessions/answers you never made | Fixed in the current build: skipped questions no longer count as "answered" and zero-answer attempts are not recorded; existing records were migrated automatically on first load. |
