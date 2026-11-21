#!/usr/bin/env python3
"""
Twice-daily SAT content watcher.

Runs on GitHub Actions at 06:00 and 18:00 UTC. It:
  1. Reads public RSS feeds (r/SAT community discussions, College Board blog posts).
  2. Dedupes against data/update-log.json (only genuinely NEW items are kept).
  3. Appends new items to data/update-log.json (which the site's "Updates" panel reads).
  4. Writes a markdown change report to data/reports/.
  5. Emails the report to the admin when SMTP secrets are configured (optional).

Only titles, links, dates and short summaries are stored — no copyrighted question
content is ever copied into this repository.

Environment (all optional; without them the run still updates the JSON + report):
  SMTP_HOST (default smtp.gmail.com), SMTP_PORT (default 465),
  SMTP_USER, SMTP_PASS (Gmail app password), SMTP_TO (admin email)
"""
import email.utils
import html as htmllib
import json
import os
import re
import smtplib
import ssl
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
REPORTS_DIR = DATA_DIR / "reports"
LOG_PATH = DATA_DIR / "update-log.json"
MAX_ENTRIES = 400

SOURCES = [
    # r/SAT — the main community: discussions, past-paper chatter, score threads
    {"type": "rss", "url": "https://www.reddit.com/r/SAT/new/.rss",
     "source": "Reddit r/SAT", "kind": "discussion"},
    # r/SATACTprep — prep-resource sharing and free-test alerts
    {"type": "rss", "url": "https://www.reddit.com/r/SATACTprep/new/.rss",
     "source": "Reddit r/SATACTprep", "kind": "discussion"},
    # College Board's official blog — test dates, policy and format announcements.
    # The blog has no RSS feed, so we parse its listing page (h3 titles + slugs).
    {"type": "html", "url": "https://blog.collegeboard.org/",
     "source": "College Board Blog", "kind": "official"},
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; SAT-prep-site-watcher/1.0)"}


def strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = htmllib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def fetch(url: str, tries: int = 3):
    """Fetch with polite retry/backoff — Reddit and busy blogs intermittently
    return 404/429 when hit repeatedly; a short pause usually resolves it."""
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (404, 429, 403, 502, 503):
                last = e
                time.sleep(5 * (i + 1))  # 5s, 10s, 15s
            else:
                raise
    raise last


def parse_feed(raw: bytes):
    """Yield dicts: title, link, published, summary — tolerant of RSS/Atom quirks."""
    root = ET.fromstring(raw)
    items = []
    for it in root.iter():
        tag = it.tag.split("}")[-1]
        if tag not in ("item", "entry"):
            continue
        title = link = pub = summary = ""
        for child in it:
            ctag = child.tag.split("}")[-1]
            if ctag == "title":
                title = strip_html(child.text or "")
            elif ctag == "link":
                link = (child.get("href") or (child.text or "").strip())
            elif ctag in ("pubDate", "published", "updated", "date"):
                pub = (child.text or "").strip()
            elif ctag in ("description", "summary", "content"):
                summary = strip_html(child.text or "")[:300]
        if title:
            items.append({"title": title[:220], "link": link.split("?")[0],
                          "published": pub, "summary": summary})
    return items


def parse_collegeboard_listing(raw: bytes):
    """The College Board blog has no RSS feed. Its listing page shows the newest
    posts as <h3>Title</h3> paired with <a href="/slug"> — pair them by order."""
    html = raw.decode("utf-8", "ignore")
    titles = []
    for m in re.finditer(r"<h3[^>]*>(.*?)</h3>", html, re.S):
        t = strip_html(m.group(1))
        if t and len(t) > 12:
            titles.append(t[:220])
    slugs = []
    for m in re.finditer(r'href="(/[a-z0-9][a-z0-9-]{7,})"', html):
        s = m.group(1)
        if s not in slugs:
            slugs.append(s)
    n = min(len(titles), len(slugs))
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return [{"title": titles[i], "link": "https://blog.collegeboard.org" + slugs[i],
             "published": today, "summary": ""} for i in range(n)]


def to_iso(pub: str) -> str:
    try:
        dt = email.utils.parsedate_to_datetime(pub)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%d")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def main() -> int:
    DATA_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)

    log = {"updated": "", "entries": []}
    if LOG_PATH.exists():
        try:
            log = json.loads(LOG_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    known = {e.get("link") for e in log.get("entries", [])}
    known |= {e.get("title") for e in log.get("entries", [])}

    new_items, errors = [], []
    for src in SOURCES:
        try:
            raw = fetch(src["url"])
            if src["type"] == "rss":
                found = parse_feed(raw)
            else:
                found = parse_collegeboard_listing(raw)
            for it in found:
                if not it["link"] or it["link"] in known or it["title"] in known:
                    continue
                new_items.append({
                    "date": to_iso(it["published"]),
                    "source": src["source"],
                    "kind": src["kind"],
                    "title": it["title"],
                    "url": it["link"],
                    "summary": it["summary"],
                })
                known.add(it["link"])
        except Exception as exc:  # one dead feed must not fail the run
            errors.append(f"{src['source']}: {exc}")

    new_items.sort(key=lambda e: e["date"], reverse=True)
    log["entries"] = (new_items + log.get("entries", []))[:MAX_ENTRIES]
    now = datetime.now(timezone.utc)
    log["updated"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    LOG_PATH.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")

    # ---- markdown report ----
    stamp = now.strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"# SAT content change report — {stamp}",
             "",
             f"**New items found this run: {len(new_items)}**",
             ""]
    if new_items:
        for e in new_items:
            lines.append(f"- **[{e['source']} | {e['kind']}]** {e['date']} — "
                         f"[{e['title']}]({e['url']})")
            if e["summary"]:
                lines.append(f"  > {e['summary'][:220]}")
    else:
        lines.append("No new items since the last run. The log was refreshed and the "
                     "site's Updates panel now shows the current state.")
    if errors:
        lines += ["", "## Source errors", *("- " + e for e in errors)]
    lines += ["", "---",
              "*Automated twice-daily run (GitHub Actions). Feeds carry only titles, "
              "links and short public summaries — no copyrighted question content is "
              "copied into this repository.*"]
    report_path = REPORTS_DIR / f"report-{now.strftime('%Y%m%d-%H%M')}.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")
    # keep only the 30 most recent reports
    reports = sorted(REPORTS_DIR.glob("report-*.md"))
    for old in reports[:-30]:
        old.unlink(missing_ok=True)

    # ---- optional email to the admin ----
    smtp_user, smtp_pass, smtp_to = (os.environ.get(k) for k in
                                     ("SMTP_USER", "SMTP_PASS", "SMTP_TO"))
    if smtp_user and smtp_pass and smtp_to and new_items:
        try:
            msg = email.message_from_string(
                f"From: SAT Ascent watcher <{smtp_user}>\r\n"
                f"To: {smtp_to}\r\n"
                f"Subject: SAT content update — {len(new_items)} new item(s), {stamp}\r\n"
                f"Content-Type: text/plain; charset=utf-8\r\n\r\n"
                + "\n".join(lines))
            ctx = ssl.create_default_context()
            host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
            port = int(os.environ.get("SMTP_PORT", "465"))
            with smtplib.SMTP_SSL(host, port, context=ctx) as s:
                s.login(smtp_user, smtp_pass)
                s.send_message(msg)
            print(f"Emailed report to {smtp_to}")
        except Exception as exc:
            print(f"Email skipped (non-fatal): {exc}", file=sys.stderr)

    print(f"Run complete: {len(new_items)} new item(s); log has "
          f"{len(log['entries'])} entries; report → {report_path.name}")
    if errors:
        print("Source errors (non-fatal): " + "; ".join(errors), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
