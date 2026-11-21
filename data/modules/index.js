/* ================= MODULE REGISTRY =================
   Every exam ("module") registers itself here by calling window.registerModule(def).
   The engine (index.html) never hardcodes an exam: it renders whatever is in this
   registry. Adding a new exam = adding one data file — see docs/ADD-A-MODULE.md.
   The crawler (scripts/ingest.py) writes ingested open-source questions into
   data/modules/extra.js as window.MODULE_EXTRA[moduleId] = [ ... ]; they are merged
   into the module's pools when the module is activated. */
window.MODULES = [];
window.MODULE_EXTRA = {};

window.registerModule = function(def){
  if(!def || !def.id){ console.error("registerModule: missing id"); return; }
  if(window.MODULES.some(m => m.id === def.id)){ console.error("registerModule: duplicate id", def.id); return; }
  if(!def.sections || !def.sections.length){ console.error("registerModule: no sections", def.id); return; }
  if(!def.plans){ def.plans = {}; }
  if(!def.testCards){ def.testCards = []; }
  window.MODULES.push(def);
};

/* Merge a module's static pools with any crawler-ingested extras.
   Invalid or unknown-domain items are dropped (never crash the site). */
window.modulePools = function(def){
  const pools = {};
  Object.keys(def.pools || {}).forEach(sec => { pools[sec] = (def.pools[sec] || []).slice(); });
  const domainSec = {};
  Object.keys(def.domains || {}).forEach(k => { domainSec[k] = def.domains[k].sec; });
  const src = window.MODULE_EXTRA[def.id] || [];
  let kept = 0, dropped = 0;
  src.forEach(q => {
    const stem = q.q || q.question, chs = q.ch || q.choices;
    const ai = typeof q.a === "number" ? q.a :
               (typeof q.answerIndex === "number" ? q.answerIndex : "ABCD".indexOf(String(q.answer == null ? "" : q.answer).trim().toUpperCase()));
    const ok = q && q.id && domainSec[q.d] && Array.isArray(chs) && chs.length === 4 &&
               new Set(chs.map(c => String(c).trim())).size === 4 &&
               typeof ai === "number" && ai >= 0 && ai < 4 && stem && (q.e || q.explanation);
    if(!ok){ dropped++; return; }
    const sec = domainSec[q.d];
    if(!pools[sec]) pools[sec] = [];
    if(pools[sec].some(x => x.id === q.id)){ dropped++; return; }
    const tier = ["core","advanced","elite"].indexOf(q.tier) >= 0 ? q.tier : "advanced";
    pools[sec].push({ id:String(q.id), d:q.d, tier, p:q.p || q.passage || "", q:stem,
      ch:chs.map(String), a:ai, e:q.e || q.explanation });
    kept++;
  });
  if(kept || dropped) console.log("[modules] " + def.id + ": +" + kept + " ingested questions (" + dropped + " dropped)");
  return pools;
};
