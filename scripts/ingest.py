#!/usr/bin/env python3
"""Open-source question-bank ingester ("the crawler") for SAT Ascent.

Reads data/sources.yml — a list of open-source question banks on the web — fetches
each one, validates its LICENSE (permissive allowlist only), normalizes the items
into the platform's native schema, and rewrites data/modules/extra.js with:

    window.MODULE_EXTRA[moduleId] = [ {id, d, tier, p, q, ch, a, e}, ... ]

The site merges these into the target module's question pools at activation time.
A run with no sources (or with all sources disabled) writes a clean stub — the site
is unaffected.

Usage:
    python3 scripts/ingest.py             # dry run: fetch + validate + report, write nothing
    python3 scripts/ingest.py --write     # write data/modules/extra.js + data/ingest-log.json
    python3 scripts/ingest.py --selftest  # run built-in unit tests and exit

License policy (enforced): only permissive licenses are accepted, because ingested
questions are republished on a public site. Allowed: MIT, ISC, BSD-2/3-Clause,
Apache-2.0, CC0-1.0, CC-BY-4.0, CC-BY-SA-4.0. Anything else (or a missing license
field) is skipped with a warning — never guessed.

Accepted item formats:
  qa-json     : [{ "question": str, "choices": [4 strings], "answerIndex": 0-3 or
                 "answer": "A".."D", "explanation": str, "domain": key, "tier": core|advanced|elite }]
  satbank-json: native schema { "id", "d", "tier", "p", "q", "ch", "a", "e" }
Both are normalized to the native schema; ids are prefixed with the source's id
prefix (or the module id) to keep them unique across sources.
"""
import argparse, hashlib, json, os, re, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                       # repo root
SOURCES = os.path.join(ROOT, "data", "sources.yml")
OUT_JS = os.path.join(ROOT, "data", "modules", "extra.js")
OUT_LOG = os.path.join(ROOT, "data", "ingest-log.json")

PERMISSIVE = {"mit", "isc", "bsd-2-clause", "bsd-3-clause", "apache-2.0",
              "cc0-1.0", "cc-by-4.0", "cc-by-sa-4.0", "opl-1.0"}
TIERS = {"core", "advanced", "elite"}
UA = {"User-Agent": "sat-ascent-ingest/2.0 (+https://github.com/svesgp/SAT)"}


def load_sources(path):
    """Parse the simple YAML subset used by sources.yml (no external deps needed).
    Supports comments, a top-level key, and lists of flat dicts with scalar values."""
    try:
        import yaml  # preferred when available
        with open(path) as f:
            return yaml.safe_load(f).get("sources", []) or []
    except ImportError:
        pass
    sources, cur = [], None
    with open(path) as f:
        for raw in f:
            line = re.sub(r"#.*$", "", raw).rstrip()
            if not line.strip():
                continue
            m = re.match(r"^\s*-\s+(\w+):\s*(.*)$", line)
            if m:                                  # "- key: value" starts a new list item
                cur = {}
                sources.append(cur)
                _set(cur, m.group(1), m.group(2))
                continue
            m = re.match(r"^(\w+):\s*(.*)$", line)  # top-level key (e.g. "sources:") ends the item
            if m:
                cur = None
                continue
            m = re.match(r"^\s+(\w+):\s*(.*)$", line)  # indented scalar inside the current item
            if m and cur is not None:
                _set(cur, m.group(1), m.group(2))
    return [s for s in sources if s]


def _set(d, k, v):
    v = v.strip()
    if v == "":                                   # multi-line placeholder → ignore
        return
    if v.lower() in ("true", "false"):
        d[k] = v.lower() == "true"
    elif re.fullmatch(r"-?\d+", v):
        d[k] = int(v)
    else:
        d[k] = v.strip("'\"")


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def extract_domains(module_path):
    """Pull the domain keys out of a module file. Handles both the inline
    `domains: { KEY: {...}, ... }` registration and the SAT-style
    `window.DOMAINS = { KEY: {...}, ... }` definition."""
    txt = open(module_path).read()
    m = re.search(r"(?:domains\s*:\s*|window\.DOMAINS\s*=\s*)\{", txt)
    if not m:
        return set()
    depth, keys = 1, set()
    for tok in re.finditer(r"([A-Za-z_][A-Za-z0-9_]{1,7})\s*:\s*\{|\{|\}", txt[m.end():]):
        t = tok.group(0)
        if t == "{":
            depth += 1
        elif t == "}":
            depth -= 1
            if depth == 0:
                break
        else:                       # "KEY: {" — record the key; its '{' opens the object
            keys.add(t.split(":")[0].strip())
            depth += 1
    return keys


def norm_item(src, item, si, module, default_domain, default_tier, valid_domains):
    """Normalize one question to the native schema; returns (question, None) or (None, reason)."""
    stem = item.get("q") or item.get("question")
    chs = item.get("ch") or item.get("choices")
    exp = item.get("e") or item.get("explanation")
    dom = item.get("d") or item.get("domain") or default_domain
    tier = item.get("tier") or default_tier
    if not stem or not isinstance(stem, str):
        return None, "missing question text"
    if not isinstance(chs, list) or len(chs) != 4:
        return None, "needs exactly 4 choices"
    chs = [str(c) for c in chs]
    if len(set(c.strip() for c in chs)) != 4:
        return None, "duplicate choices"
    a = item.get("a", item.get("answerIndex"))
    if a is None:
        letter = str(item.get("answer", "")).strip().upper()
        a = "ABCD".find(letter) if len(letter) == 1 else None
    if not isinstance(a, int) or not (0 <= a <= 3):
        return None, "answer index out of range"
    if not exp or not isinstance(exp, str):
        return None, "missing explanation"
    if dom not in valid_domains:
        return None, f"unknown domain '{dom}'"
    tier = str(tier).lower()
    if tier not in TIERS:
        tier = "advanced"
    qid = item.get("id") or f"{module}-X{si}"
    qid = re.sub(r"[^A-Za-z0-9_.-]", "-", str(qid))
    prefix = src.get("id_prefix") or module
    if not str(qid).startswith(prefix):
        qid = f"{prefix}-{qid}"
    passage = item.get("p") or item.get("passage") or ""
    return {"id": qid, "d": dom, "tier": tier, "p": passage, "q": stem,
            "ch": chs, "a": a, "e": exp}, None


def run(write=False, sources_path=SOURCES, out_js=OUT_JS, out_log=OUT_LOG):
    if not __import__("os").path.exists(sources_path):
        print(f"No sources file at {sources_path} — nothing to ingest.")
        return 0
    sources = load_sources(sources_path)
    print(f"sources.yml: {len(sources)} entr{'y' if len(sources)==1 else 'ies'}")
    extras, report, seen_hashes = {}, [], set()
    for s in sources:
        name = s.get("name", "(unnamed)")
        url = s.get("url", "")
        lic = str(s.get("license", "")).lower().strip()
        module = s.get("module", "")
        enabled = s.get("enabled") is True
        fmt = s.get("format", "qa-json")
        entry = {"name": name, "url": url, "license": lic, "module": module,
                 "enabled": enabled, "status": "skipped", "kept": 0, "dropped": 0}
        if not enabled:
            entry["reason"] = "enabled: false"
            report.append(entry); print(f"  - {name}: skipped (disabled)"); continue
        if lic not in PERMISSIVE:
            entry["reason"] = f"license '{lic or 'missing'}' not in permissive allowlist"
            report.append(entry); print(f"  - {name}: SKIPPED — {entry['reason']}"); continue
        mod_path = __import__("os").path.join(ROOT, "data", "modules", f"{module}.js")
        if not __import__("os").path.exists(mod_path):
            entry["reason"] = f"module '{module}' has no data file"
            report.append(entry); print(f"  - {name}: SKIPPED — {entry['reason']}"); continue
        try:
            raw = fetch(url)
            data = json.loads(raw)
            items = data if isinstance(data, list) else data.get("questions", data.get("items", []))
            if not isinstance(items, list):
                raise ValueError("JSON must be an array (or {questions:[...]})")
            valid = extract_domains(mod_path)
            kept, dropped = [], []
            for i, it in enumerate(items):
                q, why = norm_item(s, it, i, module, s.get("default_domain", ""),
                                   s.get("default_tier", "advanced"), valid)
                if q is None:
                    dropped.append(f"item {i}: {why}")
                    continue
                h = hashlib.sha1((q["q"] + "|" + q["d"]).encode()).hexdigest()
                if h in seen_hashes:
                    dropped.append(f"item {i}: duplicate of an earlier item")
                    continue
                seen_hashes.add(h); kept.append(q)
            extras.setdefault(module, []).extend(kept)
            entry.update(status="ok" if kept else "empty", kept=len(kept), dropped=len(dropped))
            if dropped[:3]:
                entry["sample_rejections"] = dropped[:3]
            report.append(entry)
            print(f"  - {name}: kept {len(kept)}, dropped {len(dropped)} → module '{module}'")
        except Exception as e:
            entry.update(status="error", reason=f"{type(e).__name__}: {e}")
            report.append(entry); print(f"  - {name}: ERROR — {entry['reason']}")
    stamp = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime())
    header = (f"/* ================= INGESTED OPEN-SOURCE QUESTION BANKS =================\n"
              f"   REGENERATED by scripts/ingest.py at {stamp} from data/sources.yml.\n"
              f"   Manual edits to this file are overwritten — see docs/ADD-A-MODULE.md.\n"
              f"   Run summary: " + "; ".join(
                  f"{r['name']}→{r['module']}:{r['status']}(+{r['kept']})" for r in report) + " */\n")
    body = "window.MODULE_EXTRA = " + json.dumps(extras, ensure_ascii=False, indent=1) + ";\n"
    if write:
        with open(out_js, "w") as f:
            f.write(header + body)
        with open(out_log, "w") as f:
            json.dump({"updated": stamp, "sources": report}, f, ensure_ascii=False, indent=1)
        print(f"WROTE {out_js} ({len(body)} chars) and {out_log}")
    else:
        print(f"DRY RUN — nothing written. Use --write to update {out_js}")
    return 0


def selftest():
    ok = True
    valid = {"NM", "AG", "GM", "SP"}
    good = {"question": "2+2?", "choices": ["3", "4", "5", "6"], "answerIndex": 1,
            "explanation": "2+2=4", "domain": "NM", "tier": "core"}
    q, why = norm_item({}, good, 0, "cam-ol", "", "advanced", valid)
    assert q and q["a"] == 1 and q["tier"] == "core" and q["id"].startswith("cam-ol"), "good item normalized"
    bad_cases = [
        ({"question": "x", "choices": ["a", "b", "c"], "answerIndex": 0, "explanation": "e", "domain": "NM"}, "3 choices"),
        ({"question": "x", "choices": ["a", "b", "c", "a"], "answerIndex": 0, "explanation": "e", "domain": "NM"}, "dup choices"),
        ({"question": "x", "choices": ["a", "b", "c", "d"], "answerIndex": 4, "explanation": "e", "domain": "NM"}, "range"),
        ({"question": "x", "choices": ["a", "b", "c", "d"], "answerIndex": 0, "explanation": "", "domain": "NM"}, "no explanation"),
        ({"question": "x", "choices": ["a", "b", "c", "d"], "answerIndex": 0, "explanation": "e", "domain": "ZZ"}, "bad domain"),
        ({"choices": ["a", "b", "c", "d"], "answerIndex": 0, "explanation": "e", "domain": "NM"}, "no stem"),
    ]
    for item, why_expect in bad_cases:
        q2, why2 = norm_item({}, item, 1, "cam-ol", "", "advanced", valid)
        assert q2 is None and why2, f"should reject: {why_expect}"
    # letter answer
    q3, _ = norm_item({}, {**good, "answerIndex": None, "answer": "C"}, 2, "cam-ol", "", "", valid)
    assert q3 and q3["a"] == 2, "letter answer 'C' → index 2"
    # default domain + tier fallback
    q4, _ = norm_item({}, {**good, "domain": None, "tier": "bogus"}, 3, "cam-ol", "GM", "", valid)
    assert q4 and q4["d"] == "GM" and q4["tier"] == "advanced", "defaults applied"
    # license gate
    assert "mit" in PERMISSIVE and "cc-by-nc-4.0" not in PERMISSIVE, "allowlist shape"
    # yaml-subset parser
    sample = "# comment\nsources:\n  - name: Demo bank\n    url: https://x/y.json\n    license: mit\n    module: cam-ol\n    default_domain: NM\n    enabled: false\n"
    tmp = "/tmp/ingest_selftest.yml"
    open(tmp, "w").write(sample)
    srcs = load_sources(tmp)
    assert len(srcs) == 1 and srcs[0]["name"] == "Demo bank" and srcs[0]["enabled"] is False, "parser"
    # domain extraction from the real module files
    doms_ol = extract_domains(os.path.join(ROOT, "data", "modules", "cam-ol.js"))
    assert {"NM", "AG", "GM", "SP"} <= doms_ol, f"cam-ol domains extracted: {doms_ol}"
    doms_asal = extract_domains(os.path.join(ROOT, "data", "modules", "cam-asal.js"))
    assert {"PM", "ME", "PS"} <= doms_asal, f"cam-asal domains extracted: {doms_asal}"
    doms_sat = extract_domains(os.path.join(ROOT, "data", "modules", "sat.js"))
    assert {"CS", "II", "SEC", "EOI", "ALG", "ADV", "PSD", "GEO"} <= doms_sat, f"sat domains extracted: {doms_sat}"
    print("ingest.py selftest: ALL PASSED (normalization, license gate, parser, domain extraction)")
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Ingest open-source question banks")
    p.add_argument("--write", action="store_true", help="write extra.js + ingest-log.json")
    p.add_argument("--sources", default=SOURCES)
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    sys.exit(selftest() if a.selftest else run(write=a.write, sources_path=a.sources))
