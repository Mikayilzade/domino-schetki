# Qoşa research status

Updated: 2026-10-28T10:57:39.752+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **230,000** random deterministic opening deals (180,000 previous + **50,000 new**), tracked separately from model-rounds.
- **555,000** separate synthetic hidden-world allocations (539,000 previous + **16,000 new**); not complete rounds.
- Engine `qosa-research-0.5.3 + opening-two-opponent-chain-1.0`; recovered `qosa-1.0.0`.
- Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- New deal seeds **2300000..2349999**, hidden allocation seeds **2350000..2365999**; next unused **>=2366000**.

## Latest checkpoint — optional multi-double response policy
- 50,000 independent opening deal seeds, 48192 valid starters, 17830 eligible paired hands; **500** fixed hands × **32** matched hidden worlds = **16,000** allocations. Two bot policies (highest/lowest pip first), each with one-stone and optional double-chain variants. 0 new complete strategy rounds.
- Under **high-pip with chains**, opponent stones over two turns: **1.85275** (starter retains owned X-X) vs **2.09325** (comparison Y-Y not held), delta **-0.24050**. With one-stone turns delta **-0.09463**. Additional opponent doubles in chain policy: **0.00000** vs **0.14588** per world.
- Under **low-pip with chains**, opponent stones delta **-0.20631** vs **-0.09825** without chains. Focal return legal stones difference **0.49444** (high-chain) and **0.49456** (low-chain).
- High-chain tempo by connector count: c=2 **-0.2001** (n=253); c=3 **-0.2478** (n=171); c>=4 **-0.3586** (n=76). Immediate pip cost is confounded by different X/Y candidates; stratification in JSON.
- **Interpretation:** owning X-X both keeps it out of opponents' hands and can suppress their optional double chains. This is a model-specific two-turn tempo observation, **NOT a proven win-rate improvement or a causal estimate of saving a double**. Greedy multi-double continuation is only one optional policy.
- Deterministic chain/ordinary guard, four exact 48,620-partition first-pass checks, 100 seed replays, conservation, two provisional branch models: V8 execution passed. Node CLI not run; no authentic late-arrival fixture.
- Reproduce: `node qosha-research/simulator/opening-two-opponent-chain.js test`; `node qosha-research/simulator/opening-two-opponent-chain.js 2300000 50000 2350000 32 500`. Raw `runs/2026-10-28-1055-opening-two-opponent-chain-2300000-2365999.json`.

## NEXT ACTION
- Validate optional double-series and late-arrival branch rules against authentic trace; then test matched equal-pip/connector-balanced alternatives and full-game finish/score, keeping blocked ties unresolved.
