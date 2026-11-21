/* ================= MODULE: Cambridge International AS & A Level Mathematics (starter) =================
   CAIE 9709-style practice (Pure Mathematics, Mechanics, Probability & Statistics).
   All items are ORIGINAL sample questions written for this platform (not past-paper
   content). Mechanics items use g = 10 m/s² for clean numbers. Grow the bank with the
   open-source ingestion pipeline — see docs/ADD-A-MODULE.md and data/sources.yml. */
window.registerModule({
  id:"cam-asal",
  name:"Cambridge International AS & A Level Mathematics",
  board:"CAIE 9709 (practice style)",
  icon:"🧮",
  tagline:"Pure Mathematics, Mechanics and Probability & Statistics drills in the CAIE 9709 style, with worked explanations.",
  legacy:false, adaptive:false, scoring:null,
  sections:[{id:"core", name:"Practice", perQ:110}],
  domains:{
    PM: { name:"Pure Mathematics", sec:"core", icon:"∑",
      blurb:"Algebra, calculus, trigonometry and binomial expansions — the Paper 1 core.",
      lesson:`<p><b>What it tests.</b> The AS Pure core: differentiation and integration of polynomials, stationary points, binomial expansion, and exact trigonometry.</p>
      <p><b>Strategy.</b> Differentiate term by term (x<sup>n</sup> → n·x<sup>n−1</sup>) and always check what the question wants: a derivative value, a coordinate, or a proof that a point is a maximum (second derivative negative, or sign change). For definite integrals, write the bracket notation [F(x)] with the limits before substituting — it prevents lost terms. For binomial coefficients, C(n, r) × a<sup>n−r</sup>b<sup>r</sup> keeps the powers honest.</p>
      <p><b>Common traps.</b> Stopping at the stationary <i>x</i>-value instead of the point; differentiating x as 0 instead of 1; integrating 6x² as 6x³ (forgetting to divide by the new power); taking cos of a wrong quadrant in exact-value questions.</p>
      <div class="ex"><span class="lbl">Micro-example</span>y = x³ − 3x²: dy/dx = 3x² − 6x = 0 at x = 0 and x = 2. d²y/dx² = 6x − 6, which is −6 at x = 0 (maximum) and +6 at x = 2 (minimum at (2, −4)). Second derivative settles the classification instantly.</div>` },
    ME: { name:"Mechanics", sec:"core", icon:"🧭",
      blurb:"Kinematics, Newton's laws, momentum — the Paper 2/3 mechanics core (g = 10 m/s²).",
      lesson:`<p><b>What it tests.</b> Constant-acceleration kinematics (the suvat equations), Newton's second law with resistance forces, and momentum conservation in collisions.</p>
      <p><b>Strategy.</b> Before any algebra: draw the diagram, mark every force, choose the positive direction and <i>write it down</i>. For suvat questions, list the four known quantities first — the right equation is the one containing exactly those. For F = ma problems, 'resultant force' means sum of forces <i>along the motion</i>, so subtract resistances.</p>
      <p><b>Common traps.</b> Mixing up speed and velocity directions; using g = 9.8 when the paper states 10 (or vice versa — state which you use); forgetting that momentum is a vector, so opposite directions carry opposite signs; treating 'from rest' as u = 1 instead of 0.</p>
      <div class="ex"><span class="lbl">Micro-example</span>Ball thrown horizontally at 20 m/s from 45 m: vertical fall gives 45 = ½ × 10 × t² → t = 3 s; horizontal motion is unaffected, so range = 20 × 3 = 60 m. The two directions never mix.</div>` },
    PS: { name:"Probability & Statistics", sec:"core", icon:"📊",
      blurb:"Expectation, binomial distribution, variance and probability laws — the Paper 2/3 statistics core.",
      lesson:`<p><b>What it tests.</b> Expected value, the binomial distribution B(n, p), variance and standard deviation, and the addition/multiplication laws for independent events.</p>
      <p><b>Strategy.</b> For E(X), sum x·P(x) over every outcome — a quick table keeps weights honest. For binomial 'exactly r successes', write <sup>n</sup>C<sub>r</sub> p<sup>r</sup>(1−p)<sup>n−r</sup> before substituting. For variance, Var = mean of squares − square of mean; check it is non-negative as a sanity test. For combined events, decide independence <i>first</i> — the laws differ.</p>
      <p><b>Common traps.</b> Using n·p when the question says 'exactly r' (that's an approximation, not the binomial probability); forgetting the complement shortcut P(at least one) = 1 − P(none); adding variances of non-independent variables.</p>
      <div class="ex"><span class="lbl">Micro-example</span>Six fair coin tosses: P(at least one head) = 1 − P(all tails) = 1 − (1/2)<sup>6</sup> = 63/64. The complement route is one line; counting the cases individually is seven.</div>` }
  },
  pools:{
    core:[
      {id:"ALM-01", d:"PM", tier:"core",
       q:"Given y = x³ − 4x, what is the value of dy/dx at x = 2?",
       ch:["4","8","12","20"], a:1,
       e:"dy/dx = 3x² − 4. At x = 2: 3(4) − 4 = 8. Differentiate first, substitute second — substituting into y first (giving 0) is a common wrong turn."},
      {id:"ALM-02", d:"PM", tier:"advanced",
       q:"Evaluate ∫₀² (6x² − 4) dx.",
       ch:["8","12","16","24"], a:0,
       e:"Antiderivative: 2x³ − 4x. Evaluate from 0 to 2: (2·8 − 8) − 0 = 16 − 8 = 8. Writing [2x³ − 4x] with the limits before substituting stops the '16 only' error, which forgets to subtract the −4x term."},
      {id:"ALM-03", d:"PM", tier:"advanced",
       q:"What is the coefficient of x² in the expansion of (2 + x)<sup>5</sup>?",
       ch:["80","40","10","32"], a:0,
       e:"The x² term is <sup>5</sup>C<sub>2</sub> · 2³ · x² = 10 × 8 × x² = 80x². Forgetting the 2³ factor (answer 10) or miscounting powers (2², giving 40) are the two standard slips in binomial expansions."},
      {id:"ALM-04", d:"PM", tier:"advanced",
       q:"For 0 ≤ x ≤ π, solve sin x = 1/2.",
       ch:["x = π/6 only","x = π/6 and x = 5π/6","x = π/3 and x = 2π/3","x = π/6 and x = 7π/6"], a:1,
       e:"sin is positive in quadrants I and II: the solutions are π/6 and π − π/6 = 5π/6. Sketch the graph on 0 ≤ x ≤ π — it rises then falls through 1/2 twice. 7π/6 lies outside the interval."},
      {id:"ALM-05", d:"PM", tier:"elite",
       q:"The curve y = x³ − 3x² has a stationary point at (2, k). Which statement is correct?",
       ch:["k = −4 and it is a minimum","k = −4 and it is a maximum","k = 4 and it is a minimum","k = 0 and it is a maximum"], a:0,
       e:"dy/dx = 3x² − 6x = 0 at x = 2; y(2) = 8 − 12 = −4. Second derivative 6x − 6 = +6 > 0 at x = 2, so the point (2, −4) is a minimum. Quoting the y-value without classifying it (or swapping the classification) loses the accuracy mark."},
      {id:"ALM-06", d:"ME", tier:"core",
       q:"A cyclist starts from rest and accelerates uniformly at 2 m/s² for 8 s. What is her final speed?",
       ch:["4 m/s","10 m/s","16 m/s","64 m/s"], a:2,
       e:"v = u + at = 0 + 2 × 8 = 16 m/s. 'From rest' means u = 0 — the trap answer 64 comes from squaring time or from using a distance equation instead of a velocity one."},
      {id:"ALM-07", d:"ME", tier:"core",
       q:"A ball is thrown horizontally at 20 m/s from a height of 45 m. Taking g = 10 m/s², how far does it travel horizontally before landing?",
       ch:["45 m","60 m","75 m","20 m"], a:1,
       e:"Vertical: 45 = ½ × 10 × t² → t = 3 s. Horizontal speed is constant (no air resistance): range = 20 × 3 = 60 m. The horizontal and vertical motions are independent — mixing them is the classic projectile error."},
      {id:"ALM-08", d:"ME", tier:"advanced",
       q:"A block of mass 4 kg is pulled along a rough surface by a horizontal force of 18 N against a frictional resistance of 6 N. What is its acceleration?",
       ch:["2 m/s²","3 m/s²","4 m/s²","4.5 m/s²"], a:1,
       e:"Resultant force = 18 − 6 = 12 N; a = F/m = 12/4 = 3 m/s². Newton's second law uses the resultant — dividing the pulling force alone by the mass (4.5) ignores friction; adding the friction (6) reverses its direction."},
      {id:"ALM-09", d:"ME", tier:"advanced",
       q:"A trolley of mass 2 kg moving at 3 m/s collides with a stationary 1 kg trolley and they move off together. What is their common speed?",
       ch:["1 m/s","1.5 m/s","2 m/s","3 m/s"], a:2,
       e:"Momentum is conserved: 2 × 3 + 0 = 3 × v → v = 2 m/s. The combined mass (3 kg) is the denominator — forgetting to add the second mass gives 3 m/s, the trap answer."},
      {id:"ALM-10", d:"ME", tier:"elite",
       q:"A car travelling at 20 m/s brakes uniformly and stops in 50 m. What is its deceleration?",
       ch:["2 m/s²","3 m/s²","4 m/s²","5 m/s²"], a:2,
       e:"v² = u² + 2as with v = 0: 0 = 400 + 2a(50) → a = −4 m/s², i.e. a deceleration of 4 m/s². The magnitude is what's asked; keeping the minus sign and answering '−4' (or '2', from halving instead of doubling) are the usual slips."},
      {id:"ALM-11", d:"PS", tier:"core",
       q:"A discrete random variable X takes values 1, 2, 3 with probabilities 0.2, 0.5 and 0.3. What is E(X)?",
       ch:["2.0","2.1","2.2","2.5"], a:1,
       e:"E(X) = 1(0.2) + 2(0.5) + 3(0.3) = 0.2 + 1.0 + 0.9 = 2.1. Every value must be weighted by its own probability — averaging the outcomes 1, 2, 3 (giving 2) ignores the distribution."},
      {id:"ALM-12", d:"PS", tier:"advanced",
       q:"X ~ B(5, 0.5). What is P(X = 3)?",
       ch:["5/16","3/16","1/2","5/32"], a:0,
       e:"P(X = 3) = <sup>5</sup>C<sub>3</sub>(0.5)³(0.5)² = 10 × (1/32) = 10/32 = 5/16. 'Exactly 3' demands the binomial point formula — 5 × 0.5 = 2.5 would be the expected number, not this probability."},
      {id:"ALM-13", d:"PS", tier:"advanced",
       q:"What is the variance of the data set 2, 4, 4, 4, 5, 5, 7, 9?",
       ch:["2","4","5","2.5"], a:1,
       e:"Mean = 40/8 = 5; Σx² = 232, so mean of squares = 232/8 = 29. Variance = 29 − 5² = 4 (standard deviation 2). Var = Σx²/n − (mean)² — subtracting the mean once instead of squared, or dividing Σx² by n − 1 here, both give wrong options."},
      {id:"ALM-14", d:"PS", tier:"advanced",
       q:"Events A and B are independent with P(A) = 0.4 and P(B) = 0.5. What is P(A ∪ B)?",
       ch:["0.7","0.9","0.2","0.6"], a:0,
       e:"P(A ∪ B) = P(A) + P(B) − P(A ∩ B), and independence gives P(A ∩ B) = 0.4 × 0.5 = 0.2. So 0.4 + 0.5 − 0.2 = 0.7. Adding without the intersection (0.9) double-counts the overlap."},
      {id:"ALM-15", d:"PS", tier:"elite",
       q:"A fair coin is tossed 6 times. What is the probability of getting at least one head?",
       ch:["63/64","1/2","31/32","3/4"], a:0,
       e:"P(at least one head) = 1 − P(no heads) = 1 − (1/2)⁶ = 63/64. The complement converts a six-case sum into one line — 'at least one' questions are almost always complement questions."}
    ]
  },
  generators:[],
  tips:{
    general:[
      {id:"al-pace", title:"Set out, then compute",
       body:"You averaged {pace} in this set. A Level marks reward structure: list what is given (u, v, a, t…), choose the single equation that fits, and keep one step per line. Marks live in the method as much as the final value — a clean layout also makes your own checking fast."},
      {id:"al-exact", title:"Exact answers unless told otherwise",
       body:"Keep π, surds and fractions exact through the working and only convert at the final step if the question asks for decimals. Premature rounding propagates through later parts of a structured question — carry 4+ significant figures until the end."},
      {id:"al-check", title:"Interrogate the answer",
       body:"Does the acceleration have the right sign? Is the probability between 0 and 1? Is the minimum actually below nearby curve values? Ten seconds of physics/number sense on each part catches the sign and unit slips that cost the most marks."}
    ],
    PM:[
      {id:"pm-2nd", title:"Classify stationary points with the second derivative",
       body:"dy/dx = 0 finds candidates; d²y/dx² > 0 means minimum, < 0 means maximum. Write the test explicitly in the script — it is frequently a whole dedicated mark."}
    ],
    ME:[
      {id:"me-suvat", title:"List the suvat letters before choosing an equation",
       body:"Write down u, v, a, s, t and strike the unknown one. The correct equation is the only one that avoids it. This ten-second ritual eliminates most 'used the wrong formula' errors in constant-acceleration questions."}
    ],
    PS:[
      {id:"ps-complement", title:"'At least one' means one minus 'none'",
       body:"For 'at least one' successes, compute P(none) and subtract from 1. It is shorter, safer and immune to the case-counting slips that multi-part direct sums invite."}
    ]
  },
  plans:{
    quick:    {label:"Quick practice",    secs:[["core",8]]},
    standard: {label:"Standard practice", secs:[["core",12]]},
    full:     {label:"Full practice set", secs:[["core",15]]}
  },
  testCards:[
    {k:"quick", icon:"⚡", label:"Quick practice", sub:"8 questions · ~15 min",
     d:"A fast mixed warm-up across Pure, Mechanics and Statistics."},
    {k:"standard", icon:"🎯", label:"Standard practice", sub:"12 questions · ~22 min",
     d:"Balanced 9709-style coverage with a worked explanation after every answer."},
    {k:"full", icon:"🏔️", label:"Full practice set", sub:"15 questions · ~28 min",
     d:"The complete starter bank in one sitting — a weekly check across all three content areas."}
  ],
  note:"Starter bank — original sample items in exam style. Extend it with real open-source question sets via the ingestion pipeline (data/sources.yml)."
});
