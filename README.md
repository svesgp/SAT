# SAT Ascent — a free, multi-exam practice platform

A self-contained, zero-admin practice platform for students — built for the **Digital SAT** today, and designed from the ground up to host **many exams** (Cambridge O Level, AS & A Level, and anything else you add). Everything runs on GitHub Pages: no servers, no databases, no bills, no keys in the code.

**Live site:** <https://svesgp.github.io/SAT/>

## What students get

- **Multiple exam modules.** After signing in, students pick their exam from the *Modules* screen. Each module is a complete practice world — its own subject areas, lessons, question banks, tests and tips. Current modules:
  - **Digital SAT** — full module-adaptive tests, 8 official-style domains, unlimited quick/standard/full-length tests, score estimates out of 1600.
  - **Cambridge O Level Mathematics (4024 style)** — starter bank of original sample items across Number, Algebra, Geometry and Statistics.
  - **Cambridge International AS & A Level Mathematics (9709 style)** — starter bank covering Pure Mathematics, Mechanics and Probability & Statistics.
- **Passwordless sign-in.** Google or GitHub via Firebase OAuth — no password is ever created, stored, or transmitted by this app. A lightweight "on this device" email account is available as a fallback, and **sign-out now parks each account's progress safely** — different students can share one device without overwriting each other.
- **Tamper-sealed progress.** Every student's full record lives in **one encrypted envelope** (AES-256-GCM + HMAC-SHA256) that only this app can read and parse. Manual edits, corruption or rollback attempts are detected, quarantined and rejected.
- **Unlimited tests & honest stats.** Full, standard, quick, topic-wise and wrong-answer-review tests. The dashboard counts **only questions actually answered** — skipping a test without answering records nothing.
- **Free AI tutor.** A 🤖 button on every question and in the corner of every screen: step-by-step guidance, hints (never the bare answer before you've tried), explanations after answering, and open study chat. Free, no signup, no API key — powered by the Pollinations.ai community API. Only the text the student types (or the question they attach) is sent; never their record, email or progress.
- **Topic lessons** for every domain in every module, with strategies, worked micro-examples and common-trap lists.
- **Personalized tips.** After each test, a tip engine analyzes pacing, skipped questions, weakest areas and top-band accuracy to produce concrete advice and a **7-day plan**.
- **Twice-daily content watching.** A GitHub Action pulls new items from SAT communities and official announcements (titles/links/summaries only) into the site's *Updates* panel, with an optional email report to the admin.
- **An open-source question crawler.** Another GitHub Action runs daily: it fetches the open-source question banks listed in `data/sources.yml`, enforces a permissive-license allowlist, validates every item and folds them into the target module automatically. Adding a whole exam never requires touching the app's code.

All built-in questions are **original** items written in the style and difficulty bands of their exam (each tagged by difficulty band, each with a full explanation of the trap). Ingested banks are republished under their own verified open-source licenses.

## For students

1. Open <https://svesgp.github.io/SAT/> and sign in — Google, GitHub, or a device account. No password anywhere.
2. Pick your exam under **Modules** (the choice is remembered).
3. Take a test, learn a topic, or ask the 🤖 AI tutor. Progress is sealed in your browser; **Settings → Export progress (JSON)** gives you a copy any time.

## For owners / maintainers

Operational details (secrets, Firebase sign-in setup, deployment, the content watcher, the bank crawler, troubleshooting) live in **[docs/OPERATIONS.md](docs/OPERATIONS.md)**.
Adding a new exam module or feeding it from open-source question banks is documented in **[docs/ADD-A-MODULE.md](docs/ADD-A-MODULE.md)**.

## Repository layout

```
index.html                  the app engine (no question data inside)
data/modules/index.js       module registry (loaded first)
data/modules/sat.js         Digital SAT module (built from scripts/src parts)
data/modules/cam-ol.js      Cambridge O Level Mathematics starter module
data/modules/cam-asal.js    Cambridge AS & A Level Mathematics starter module
data/modules/extra.js       crawler output — ingested open-source banks (regenerated)
data/sources.yml            open-source bank sources for the crawler
scripts/scraper.py          twice-daily content watcher (Updates panel)
scripts/ingest.py           open-source question-bank crawler
.github/workflows/          deploy · twice-daily refresh · bank ingest
docs/                       OPERATIONS.md · ADD-A-MODULE.md
```

## Privacy & security model

- **No passwords anywhere.** Provider sign-in is handled entirely by Google/GitHub via Firebase; this app only receives a name/email/uid.
- **Sealed progress records.** Records are encrypted with AES-256-GCM and authenticated twice (GCM tag + HMAC over the full envelope). The key is derived per account (PBKDF2-SHA256, 200 000 iterations) from `SEAL_SECRET`, which exists only as a GitHub repository secret and is injected at deploy time as a generated `assets/app-config.js` — never committed.
- **Tampering is rejected, not trusted.** Any byte flipped, any rollback to an older record, any mismatch between ciphertext and account fails verification; the rejected record goes to a quarantine storage key and the app continues clean.
- **Nothing leaves the device.** Sealed records live in the student's browser. The AI tutor transmits only what the student explicitly sends it. Students can export their progress as plaintext JSON from Settings (a deliberate, user-initiated action).
- **Honest limits.** Client-side sealing makes casual tampering (DevTools edits, score inflation) effectively impossible, but a site with no backend cannot stop a determined attacker who reverse-engineers the client. For a practice platform this is the right trade-off; true server-side authority would require a backend.
