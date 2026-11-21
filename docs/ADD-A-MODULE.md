# Adding an exam module — the full guide

The platform is **data-driven**: an exam ("module") is a plain JavaScript file in `data/modules/` that registers itself. The engine (`index.html`) renders whatever is in the registry — adding an exam never requires touching app code, and the crawler can keep any module's bank growing automatically.

---

## 1 · Anatomy of a module

Create `data/modules/<your-id>.js`:

```js
window.registerModule({
  id:"my-exam",                    // unique; also used as the stats namespace
  name:"My Exam Name",
  board:"Exam board (practice style)",
  icon:"🎓",                       // emoji shown in the picker
  tagline:"One-line promise for the module picker.",
  legacy:false,                    // false = stats keyed as "<id>:<domain>" (isolated per module)
  adaptive:false,                  // true = two modules per section, Module 2 difficulty adapts (SAT behaviour)
  scoring:null,                    // "sat1600" enables the 400–1600 estimate; null = % only
  sections:[{ id:"core", name:"Practice", perQ:100 }],   // perQ = seconds per question
  domains:{
    KEY1: { name:"Area One", sec:"core", icon:"📘", blurb:"…", lesson:`<p>HTML lesson…</p>` },
    KEY2: { name:"Area Two",  sec:"core", icon:"✏️", blurb:"…", lesson:`<p>…</p>` }
  },
  pools:{
    core:[ /* questions for the "core" section, schema below */ ]
  },
  generators:[],                   // optional: functions producing unlimited randomized items
  tips:{ general:[ {id:"t1", title:"…", body:"…"} ], KEY1:[ … ], KEY2:[ … ] },
  plans:{
    quick:    {label:"Quick practice",    secs:[["core",8]]},
    standard: {label:"Standard practice", secs:[["core",12]]},
    full:     {label:"Full practice set", secs:[["core",16]]}
  },
  testCards:[
    {k:"quick", icon:"⚡", label:"Quick practice", sub:"8 questions · ~14 min", d:"Description…"},
    {k:"standard", icon:"🎯", label:"Standard practice", sub:"…", d:"…"},
    {k:"full", icon:"🏔️", label:"Full practice set", sub:"…", d:"…"}
  ],
  note:"Starter bank — original sample items. Extend via data/sources.yml."
});
```

Then reference it in **one** place — the module list in `index.html`'s `<head>`:

```html
<script src="data/modules/my-exam.js"></script>
```

(the line goes between `cam-asal.js` and `extra.js`). Commit and push — the deploy workflow republishes, and the exam appears in the **Modules** picker.

### Question schema (native)

```js
{id:"ME-01",           // unique, stable; ids feed the wrong-answer review
 d:"KEY1",             // domain key — must exist in this module's `domains`
 tier:"core",          // "core" | "advanced" | "elite" (drives difficulty weighting)
 p:"optional passage HTML",
 q:"question stem (HTML allowed)",
 ch:["A","B","C","D"], // exactly 4 choices
 a:0,                  // index of the correct choice
 e:"full explanation — the answer AND the traps"}
```

**Requirements that the runtime enforces:** 4 distinct choices, `a` in range, non-empty stem and explanation, known domain key. Invalid items are dropped at load time (check the browser console for `[modules]` messages). Keep plan sizes ≤ pool size so tests never underfill.

### Multi-section modules

A module may have several sections (like the SAT's Reading & Writing + Math): list them in `sections`, give each domain a `sec` matching a section id, and provide a pool per section in `pools`. Plans then look like `secs:[["rw",12],["math",12]]`.

---

## 2 · Feeding a module from open-source question banks (the crawler)

1. Find a question bank that is genuinely open-source and whose license permits republication.
2. Add an entry to `data/sources.yml`:

```yaml
  - name: Nice Open Maths Drills
    url: https://raw.githubusercontent.com/OWNER/REPO/main/questions.json
    license: cc-by-4.0          # must be in the allowlist — see the file header
    format: qa-json
    module: cam-ol              # target module id
    default_domain: NM          # used when an item has no domain
    default_tier: advanced
    enabled: true
```

3. Run the crawler once to preview (dry run), then write:

```bash
python3 scripts/ingest.py            # fetch + validate + report, writes nothing
python3 scripts/ingest.py --write    # rewrites data/modules/extra.js + data/ingest-log.json
python3 scripts/ingest.py --selftest # ingester unit tests
```

4. Commit & push — or let the daily `update-banks` GitHub Action do steps 3–4 automatically.

**What the crawler guarantees:** only permissive licenses (MIT, ISC, BSD-2/3, Apache-2.0, CC0, CC-BY-4.0, CC-BY-SA-4.0, OPL-1.0) are ingested — non-commercial ("NC") and unknown licenses are refused; every item must have exactly 4 distinct choices, an in-range answer, an explanation, and a domain key that exists in the target module; duplicates (by stem+domain hash) are dropped; ids are prefixed so they stay unique across sources. The run log lands in `data/ingest-log.json` and is committed for transparency.

**Where the questions appear:** `data/modules/extra.js` maps `window.MODULE_EXTRA["<module id>"] = [...]`. When a module is activated, the registry merges these into its pools (tagging the module chip "+N open-source" in the picker). Manual edits to `extra.js` are overwritten on the next run — put permanent questions in the module's own file instead.

### Converting a bank to `qa-json`

Most simple exports need only a small script:

```python
import json
out = [{"question": q["prompt"], "choices": q["options"],
        "answerIndex": q["correct"],            # 0-based
        "explanation": q["solution"], "domain": "NM"}
       for q in json.load(open("raw.json"))]
json.dump(out, open("questions.json","w"))
```

---

## 3 · Tips for good starter banks

- 15–25 original items spread across **every** domain key, mixed tiers — enough for the three test cards.
- Every explanation should teach: state the answer, the fastest method, and the trap each wrong option springs.
- Write `lesson` HTML with three blocks: *What it tests*, *Strategy*, *Common traps*, plus a `.ex` micro-example box — the Learn page renders it directly.
- Give the module honest `testCards` subtitles (duration ≈ questions × perQ / 60).
