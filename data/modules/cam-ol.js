/* ================= MODULE: Cambridge O Level Mathematics (starter bank) =================
   CAIE 4024-style practice. All items are ORIGINAL sample questions written for this
   platform (not past-paper content). Grow the bank with the open-source ingestion
   pipeline — see docs/ADD-A-MODULE.md and data/sources.yml. */
window.registerModule({
  id:"cam-ol",
  name:"Cambridge O Level Mathematics",
  board:"CAIE 4024 (practice style)",
  icon:"🎓",
  tagline:"Number, algebra, geometry & statistics drills in the Cambridge O Level style, with full worked explanations.",
  legacy:false, adaptive:false, scoring:null,
  sections:[{id:"core", name:"Practice", perQ:100}],
  domains:{
    NM: { name:"Number", sec:"core", icon:"🔢",
      blurb:"Ratio, proportion, percentages, standard form and everyday calculations.",
      lesson:`<p><b>What it tests.</b> Working confidently with fractions, ratio, proportion, percentages, standard form and estimation — the calculation backbone of Paper 1 and Paper 2.</p>
      <p><b>Strategy.</b> Convert every percentage change into a multiplier (a 15% fall is × 0.85) and multiply successive changes instead of adding them. For ratio questions, find <i>one part</i> first, then scale. For standard form, keep the front number between 1 and 10 and let the power of ten carry the size.</p>
      <p><b>Common traps.</b> Adding successive percentage changes (a −15% fall then −10% is × 0.85 × 0.90 = × 0.765, not −25%); dividing instead of multiplying in direct proportion; forgetting that standard form's first factor must be at least 1.</p>
      <div class="ex"><span class="lbl">Micro-example</span>$40 reduced by 15%: 40 × 0.85 = $34. Then 10% off: 34 × 0.90 = $30.60 — the answer, not $30 (which comes from the wrong "−25%" shortcut).</div>` },
    AG: { name:"Algebra & Graphs", sec:"core", icon:"📐",
      blurb:"Equations, factorising, gradients and the algebra of quadratic curves.",
      lesson:`<p><b>What it tests.</b> Solving linear and quadratic equations, changing the subject of a formula, and reading gradients and intercepts from lines and curves.</p>
      <p><b>Strategy.</b> For quadratics, try factorising first — two numbers that multiply to <i>c</i> and add to <i>b</i>. For the minimum of a quadratic, complete the square: the squared bracket zeroed gives the vertex. For gradients, always compute (change in y) ÷ (change in x) from the coordinates, never by eye.</p>
      <p><b>Common traps.</b> Expanding 3(x − 2) as 3x − 2; mixing up which coordinate pair is (x₁, y₁); stopping at the vertex <i>x</i>-value when the question asks for the <i>y</i>-value.</p>
      <div class="ex"><span class="lbl">Micro-example</span>y = x² − 6x + 5 = (x − 3)² − 4, so the minimum is −4 at x = 3 — completing the square hands you both values at once.</div>` },
    GM: { name:"Geometry & Mensuration", sec:"core", icon:"📏",
      blurb:"Angle facts, polygons, circles, arcs, sectors and 3-D volume.",
      lesson:`<p><b>What it tests.</b> Angle properties (triangles, polygons, parallel lines), circle theorems in mild form, and mensuration: perimeter, area, arcs, sectors and volumes.</p>
      <p><b>Strategy.</b> Memorise the small set of formulas that carry most marks: interior angle of a regular polygon = (n − 2) × 180° ÷ n; arc length = (angle/360) × 2πr; sector area = (angle/360) × πr²; cylinder volume = πr²h. Reduce the angle fraction before multiplying.</p>
      <p><b>Common traps.</b> Using the radius where the diameter belongs; quoting the exterior angle where the interior is asked (or vice versa); forgetting units — a volume needs cubed units.</p>
      <div class="ex"><span class="lbl">Micro-example</span>Regular hexagon: (6 − 2) × 180° = 720° total; 720° ÷ 6 = 120° per interior angle.</div>` },
    SP: { name:"Statistics & Probability", sec:"core", icon:"🎲",
      blurb:"Averages, data displays, and probability including without-replacement draws.",
      lesson:`<p><b>What it tests.</b> Mean, median, mode and range; reading charts; and probability — including combined events and drawing without replacement.</p>
      <p><b>Strategy.</b> For "without replacement" probabilities, multiply along the tree and adjust the denominators after each draw. For medians, sort the data first — always. For means from a frequency table, total (value × frequency) ÷ total frequency.</p>
      <p><b>Common traps.</b> Adding probabilities of dependent events as if they were independent; taking the median of unsorted data; quoting a probability outside 0–1.</p>
      <div class="ex"><span class="lbl">Micro-example</span>Bag with 3 red, 5 blue: P(both blue) = 5/8 × 4/7 = 20/56 = 5/14 — the second denominator drops to 7 because a blue is gone.</div>` }
  },
  pools:{
    core:[
      {id:"OLM-01", d:"NM", tier:"core",
       q:"A recipe for 4 people uses 300 g of flour. How much flour is needed for 10 people?",
       ch:["700 g","720 g","750 g","800 g"], a:2,
       e:"Flour per person = 300 ÷ 4 = 75 g. For 10 people: 75 × 10 = 750 g. In direct proportion, find the single-unit value first, then scale up."},
      {id:"OLM-02", d:"NM", tier:"advanced",
       q:"Which of these is 0.000452 written in standard form?",
       ch:["4.52 × 10<sup>−4</sup>","45.2 × 10<sup>−5</sup>","4.52 × 10<sup>4</sup>","0.452 × 10<sup>−3</sup>"], a:0,
       e:"Standard form is A × 10<sup>n</sup> with 1 ≤ A < 10. Move the decimal point 4 places right to get 4.52, so the power is −4. Option B has 45.2 (too big) and D has 0.452 (too small) — both fail the 1 ≤ A < 10 rule."},
      {id:"OLM-03", d:"NM", tier:"advanced",
       q:"A shirt costs $40. Its price is reduced by 15%, and later a further 10% is taken off the reduced price. What is the final price?",
       ch:["$30.00","$30.60","$31.00","$29.60"], a:1,
       e:"Successive changes multiply: 40 × 0.85 = $34, then 34 × 0.90 = $30.60. Adding −15% and −10% to get a 25% cut ($30.00) is the classic error — percentages compose multiplicatively."},
      {id:"OLM-04", d:"NM", tier:"elite",
       q:"A sum of money is shared between Amina and Bilal in the ratio 3 : 5. Bilal receives $12 more than Amina. How much money is shared in total?",
       ch:["$40","$48","$54","$60"], a:1,
       e:"Bilal gets 5 parts, Amina 3 parts — the difference is 2 parts = $12, so one part = $6. Total = 8 parts × $6 = $48. Always find the value of one part before totalling."},
      {id:"OLM-05", d:"AG", tier:"core",
       q:"Solve 3(x − 2) = 15.",
       ch:["x = 3","x = 5","x = 7","x = 9"], a:2,
       e:"Divide both sides by 3: x − 2 = 5, so x = 7. Expanding first also works: 3x − 6 = 15 → 3x = 21 → x = 7. Check: 3(7 − 2) = 15 ✓. Option B (x = 5) forgets to undo the −2."},
      {id:"OLM-06", d:"AG", tier:"advanced",
       q:"What is the gradient of the line passing through (1, 5) and (4, 14)?",
       ch:["2","3","−3","1/3"], a:1,
       e:"Gradient = (14 − 5) ÷ (4 − 1) = 9 ÷ 3 = 3. Keep the change in y on top and keep coordinate order consistent; flipping the order in one pair gives −3, a sign-slip trap."},
      {id:"OLM-07", d:"AG", tier:"advanced",
       q:"Solve x² − 5x + 6 = 0.",
       ch:["x = 2 or x = 3","x = −2 or x = −3","x = 1 or x = 6","x = −1 or x = −6"], a:0,
       e:"Factorise: two numbers multiplying to 6 and adding to −5 are −2 and −3, so (x − 2)(x − 3) = 0 → x = 2 or 3. Both negative roots (option B) would give +5x as the middle term."},
      {id:"OLM-08", d:"AG", tier:"elite",
       q:"The curve y = x² − 6x + 5 has its minimum at the point (3, k). What is k?",
       ch:["−4","5","−5","4"], a:0,
       e:"Complete the square: y = (x − 3)² − 4. The square is zero at x = 3, so the minimum value is k = −4. The trap is answering 3 (the x-coordinate) when the question asks for the y-value k."},
      {id:"OLM-09", d:"GM", tier:"core",
       q:"Two angles of a triangle measure 52° and 63°. What is the third angle?",
       ch:["55°","65°","75°","115°"], a:1,
       e:"Angle sum of a triangle is 180°: 180 − 52 − 63 = 65°. A quick sanity check — the three angles 52 + 63 + 65 = 180 ✓."},
      {id:"OLM-10", d:"GM", tier:"advanced",
       q:"A cylinder has radius 5 cm and height 12 cm. What is its volume?",
       ch:["60π cm³","150π cm³","300π cm³","600π cm³"], a:2,
       e:"V = πr²h = π × 5² × 12 = π × 25 × 12 = 300π cm³. Using the diameter (10) instead of the radius inflates to 1200π — option D territory; always square the radius, not the diameter."},
      {id:"OLM-11", d:"GM", tier:"advanced",
       q:"What is the size of one interior angle of a regular hexagon?",
       ch:["108°","120°","135°","144°"], a:1,
       e:"Interior angle = (n − 2) × 180° ÷ n = 4 × 180° ÷ 6 = 120°. The exterior angle is 360° ÷ 6 = 60° — make sure you answer the angle that was asked."},
      {id:"OLM-12", d:"GM", tier:"elite",
       q:"A sector of a circle has radius 9 cm and central angle 40°. What is the length of its arc?",
       ch:["π cm","2π cm","3π cm","4π cm"], a:1,
       e:"Arc length = (40/360) × 2πr = (1/9) × 18π = 2π cm. Reduce the fraction 40/360 to 1/9 first, then multiply — it keeps the arithmetic clean."},
      {id:"OLM-13", d:"SP", tier:"core",
       q:"What is the mean of 4, 7, 9, 12 and 8?",
       ch:["7.5","8","8.5","9"], a:1,
       e:"Total = 4 + 7 + 9 + 12 + 8 = 40; mean = 40 ÷ 5 = 8. The mean of five values need not be one of them — 'looks central' is never a method."},
      {id:"OLM-14", d:"SP", tier:"advanced",
       q:"A bag holds 3 red and 5 blue counters. Two counters are drawn at random without replacement. What is the probability that both are blue?",
       ch:["5/14","25/64","5/16","3/14"], a:0,
       e:"P(1st blue) = 5/8; then 4 blue remain among 7 counters, so P(2nd blue) = 4/7. Multiply: 5/8 × 4/7 = 20/56 = 5/14. Keeping the second denominator at 8 ignores the replacement rule — that's the trap."},
      {id:"OLM-15", d:"SP", tier:"advanced",
       q:"What is the median of 12, 7, 15, 9, 21 and 10?",
       ch:["10","11","12","13.5"], a:1,
       e:"Sort first: 7, 9, 10, 12, 15, 21. With six values, the median is the mean of the 3rd and 4th: (10 + 12) ÷ 2 = 11. Taking the middle of the unsorted list is the most common median error."},
      {id:"OLM-16", d:"SP", tier:"elite",
       q:"A fair six-sided die is rolled twice. What is the probability that the two scores sum to 9?",
       ch:["1/9","1/6","1/12","5/36"], a:0,
       e:"Sum 9 combinations: (3,6), (4,5), (5,4), (6,3) — 4 outcomes out of 36 equally likely pairs → 4/36 = 1/9. Missing the two ordered pairs (4,5) and (5,4) gives 3/36 — a classic undercount."}
    ]
  },
  generators:[],
  tips:{
    general:[
      {id:"ol-pace", title:"Steady beats speedy",
       body:"You averaged {pace} in this set. O Level papers reward sustained accuracy more than bursts of speed: work at a pace you can hold while still writing full method, and if a question stalls after two genuine attempts, mark it and move on — method marks for the questions you <i>can</i> finish are worth more than a heroic 10-minute siege."},
      {id:"ol-method", title:"Write the method, not just the answer",
       body:"Cambridge marking gives credit for correct steps even when the final answer slips. Set the working out line by line (one step per line), keep the equals signs aligned, and carry more digits than you need until the end — rounding happens once, at the answer."},
      {id:"ol-check", title:"Close every question with a 5-second check",
       body:"Substitute your answer back into the equation, re-add the triangle's angles to 180°, or re-estimate the sum. A wrong-but-plausible answer survives unread; a 5-second reverse check catches most arithmetic slips before they cost marks."}
    ],
    NM:[
      {id:"nm-multiplier", title:"Percentages are multipliers, not additions",
       body:"A 15% decrease is × 0.85; a further 10% decrease multiplies by 0.90 again — never add the percentages. Chain the multipliers for successive changes and convert ratios to 'one part' values before scaling."}
    ],
    AG:[
      {id:"ag-sq", title:"Complete the square to read the vertex",
       body:"For y = x² + bx + c, halve b and write (x − b/2)² + (c − b²/4). The squared bracket zeroed gives the minimum (or maximum) point directly — both coordinates at once — with no calculus and no guessing."}
    ],
    GM:[
      {id:"gm-fraction", title:"Reduce the angle fraction before multiplying",
       body:"For arcs and sectors, simplify angle/360 first (40° → 1/9, 60° → 1/6). The remaining multiplication is small, clean and much harder to fumble under exam pressure."}
    ],
    SP:[
      {id:"sp-tree", title:"Without replacement: shrink every denominator",
       body:"After each draw, both the favourable count AND the total drop. Multiply along the branch, adjusting at every stage — 5/8 then 4/7, never 5/8 twice. Tree diagrams exist precisely to stop this slip."}
    ]
  },
  plans:{
    quick:    {label:"Quick practice",    secs:[["core",8]]},
    standard: {label:"Standard practice", secs:[["core",12]]},
    full:     {label:"Full practice set", secs:[["core",16]]}
  },
  testCards:[
    {k:"quick", icon:"⚡", label:"Quick practice", sub:"8 questions · ~14 min",
     d:"A fast mixed warm-up across all four O Level areas — perfect before homework or a class test."},
    {k:"standard", icon:"🎯", label:"Standard practice", sub:"12 questions · ~20 min",
     d:"Balanced coverage of Number, Algebra, Geometry and Statistics, with a full explanation after every answer."},
    {k:"full", icon:"🏔️", label:"Full practice set", sub:"16 questions · ~27 min",
     d:"The complete starter bank in one sitting — a weekly check of the whole syllabus taster."}
  ],
  note:"Starter bank — original sample items in exam style. Extend it with real open-source question sets via the ingestion pipeline (data/sources.yml)."
});
