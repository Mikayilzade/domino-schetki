## 2026-10-30 20:50 +04 — stock-conditioned double posterior (latest)
- [Standalone Node exact/sampled contract](simulator/connector-posterior-contract.js); [checkpoint](runs/2026-10-30-2050-connector-posterior-contract.md). 7,150 exact synthetic allocations + **32,768 new seeded worlds** (3344968..3377735), 0 new complete rounds. Node 22 independent mode passed; optional actual-repository integration is coded but **not yet executed**.
- Given seat1 owns 1-3, P(seat1 also owns 3-3) is **30.77%** if stock is another 1-X connector versus **23.08%** if stock is a nonconnector; exact only under synthetic pass and fixed focal hand, not a proven winning tactic.
- Cumulative: **1,380,975** incompatible-model rounds, **1,898,856** continuations, **630,000** opening deals, **1,168,784** seeded hidden allocations; next unused seed >=3377736. Physical late-arrival branches/ties unresolved; next clean-checkout integration and authenticated chronological pass.

## 2026-10-30 19:46 +04 — connector versus matching double posterior (latest)
- [Executable standalone exact audit](simulator/connector-double-conditional-audit.js); [full checkpoint](runs/2026-10-30-1946-connector-double-conditional.md). 7,150 exact synthetic conditional worlds + 32,768 new seeded allocations (3312200..3344967), Node test/full run passed; 0 new full rounds.
- Assumed forced pass makes P(seat1 has 1-3)=90%, but P(seat1 has 3-3 | has 1-3) **falls from 44.44% to 27.35%** because connector-heavy hands have fewer slots for doubles. This is an exact *conditional capacity* finding, not an authenticated physical-game tactic.
- Cumulative: 1,380,975 model rounds; 1,898,856 continuations; 630,000 opening deals; **1,136,016** seeded hidden allocations. Next unused seed >=3344968. Branch/tie scoring unresolved; next real chronological pass + cross-check against existing posterior sampler.

# Qoşa research status

Updated: 2026-10-30 18:50 +04 (Asia/Baku)

## Latest checkpoint — calibrated exact pairwise ownership against seeded hidden-world sampler
- [Script](simulator/public-joint-sampler-calibration.js), [full metrics](RESULTS.md). **32,768 new seeded hidden allocations** on `3279432..3312199`; **0 new deals, complete rounds or forced continuations**. 7,150 exact compatible worlds, 7,071 distinct observed; paired `1-2`/`1-3` both in seat1 **26,172/32,768** versus exact **80%**, no impossible both-in-stock assignments. All calibration |z| <=1.051. Fetched committed source and actual GitHub dependencies passed V8 CommonJS replay; clean-checkout Node still pending.
- **Cumulative:** 1,380,975 incompatible-model complete rounds, 1,898,856 forced continuations, 630,000 opening deals, **1,103,248 seeded hidden allocations**. Historical 4,000 rounds separate. **Next unused seed >=3312200**.
- This is one synthetic known-hand/pass-mask fixture, **not an authenticated physical pass or a winning strategy**. Late-arrival branch and blocked ties remain unverified. **Next:** authentic trace/rules, then matched-world move regret.

Updated: 2026-10-30 16:50 +04 (Asia/Baku)

## Latest checkpoint — chronological exact four-owner bridge
- [Source](simulator/public-ownership-bridge.js), [run note](runs/2026-10-30-1650-public-ownership-bridge.md). V8 integration of actual fetched GitHub modules passed 6 public chronological cases (5,005 / 24,310 / 2,002 / 5,005 / 3,003 / 6,435 compatible worlds), 98 hidden-tile marginals independently matched against the existing exact ledger, 2 negative guards. **Node clean-checkout still pending**.
- **0 new seeded deals/worlds/complete rounds/forced continuations**; no new winning tactic. Exact owner probabilities now flow from verified chronological forced passes into seat0/seat1/seat2/stock marginals, conditional on PROVISIONAL global-ever-open geometry.
- Cumulative unchanged: **1,380,975** incompatible-model rounds, **1,898,856** forced continuations, **630,000** opening deals, **1,070,480** seeded hidden allocations; next unused seed >=3279432. Physical branch reopening and blocked ties unverified.
- **Next:** independent Node execution, authentic pass/branch/tie evidence, then matched-seed full-game comparisons.


Updated: 2026-10-30 14:55 +04 (Asia/Baku)

## Latest checkpoint — impossible opening triple-pass history now rejected
- [Exact capacity checker](simulator/public-pass-feasibility.js), [replay integration](simulator/public-history-replay.js), [run details](runs/2026-10-30-1455-public-pass-feasibility.md). In a 3×9 first-round 1-1 opening with empty stock, **all three players cannot be forced to pass**: six unplayed 1-X connectors must be held somewhere. Exact compatible assignments: **227,873,431,500** without passes, **64,664,600** when two seats pass, **0** when all three pass.
- Node 22 standalone checker passed 7 fixtures and 2 guards. GitHub-fetched V8 integration passed replay (18 guards, 100 seeds), bridge (6 fixtures), ledger (9 checks) and posterior (200 seeds). Clean-checkout Node integration remains pending. **0 new deals/worlds/rounds**, no new winning tactic.
- Cumulative unchanged: **1,380,975** incompatible-model complete rounds, **1,898,856** forced continuations, **630,000** opening deals, **1,070,480** hidden allocations; next unused seed >=3279432. Late-arrival branch rule and blocked ties still provisional.
- **Next:** clean-checkout Node tests, authentic physical pass/branch/tie evidence, then matched-seed strategy ranking.

Updated: 2026-10-30 13:52 +04 (Asia/Baku)

## Latest checkpoint — chronological focal/opponent pass regression repaired
- [Code](simulator/public-history-replay.js) and [checkpoint](runs/2026-10-30-1350-public-replay-regression.md). Fixed stale assertion after the focal-pass exclusion: opening seats 2→0 have **1** hidden pass mask, not 2; new 2→0→1 fixture has **2** opponent masks, 1 focal pass, eligibility [true,false,true].
- V8 CommonJS integration passed for public replay (18 guards, 100 deterministic replays), bridge (6 exact scenarios, 6 guards), and independent ownership ledger (9 checks). **Clean-checkout Node still pending**. **0 new deals/worlds/rounds**; no new strategy finding.
- Cumulative unchanged: **1,380,975** incompatible-model rounds; **1,898,856** continuations; **630,000** opening deals; **1,070,480** hidden allocations; next unused seed >=3279432. Physical branch reopening and blocked ties remain provisional.
- **Next:** clean-checkout Node tests and authenticated public trace, then matched-seed strategy comparisons only under verified rules.


Updated: 2026-10-30 12:45 +04 (Asia/Baku)

## Latest checkpoint — focal-pass posterior bug fixed (2026-10-30 12:45 +04)
- [Chronological replay](simulator/public-history-replay.js) previously forwarded a valid **seat-0 (known focal) forced pass** into an opponent-only posterior, causing a rejection. It now verifies the focal pass against the known hand but constrains only hidden seats 1 and 2. [Bridge](simulator/public-pass-inference-bridge.js) reports focal passes separately.
- New 3×9 chronological fixture: 5 played tiles, focal hand 8, unknown opponent hands 8+7, **C(15,8)=6,435** exact allocations, **0 hidden pass masks**. A deliberately playable focal hand is rejected. Independent Node 22 fixture combinatorics passed; full repository integration Node/V8 run remains pending.
- **0 new seeded deals, random worlds, complete rounds or forced continuations.** Cumulative unchanged: **1,380,975** incompatible-rule rounds; **1,898,856** continuations; **630,000** opening deals; **1,070,480** seeded hidden allocations. Next unused seed >=3279432. Physical late-arrival branches and block ties remain provisional.
- [Detailed checkpoint](runs/2026-10-30-1245-focal-pass-posterior-fix.md). **Next:** run the full bridge and replay tests from a clean checkout; validate real public histories, then compare matched-seed strategies only under authenticated rules.

Updated: 2026-10-30 11:55 +04 (Asia/Baku)

## Latest checkpoint — bridge integration fixture repaired (2026-10-30 11:55 +04)
- [Regression fix](simulator/public-pass-inference-bridge.js), [run note](runs/2026-10-30-1155-bridge-integration-regression.md). Previous no-pass fixture incorrectly removed a real played tile while keeping the old focal hand; reproduced fail-closed rejection, corrected the fixture, and added a negative guard.
- In isolated V8 CommonJS integration: 5 fixture counts (5,005 / 24,310 / 2,002 / 5,005 / 3,003), 5 bridge negative guards, related replay (100 seeds), posterior (200 seeds) and stock-aware ledger tests pass. **Clean-checkout Node 22 execution still pending.**
- **0 new deals/worlds/rounds/continuations**; cumulative unchanged: 1,380,975 incompatible-rule rounds, 1,898,856 continuations, 630,000 opening deals, 1,070,480 hidden allocations; next unused seed >=3279432. Physical branch/tie rules provisional; no new winning tactic.
- **Next:** clean-checkout Node test and authenticated real forced-pass history; then matched-seed strategy validation.

Updated: 2026-10-30 10:53 +04 (Asia/Baku)

## Latest checkpoint — chronological pass-to-ownership bridge (2026-10-30 10:53 +04)
- [New source](simulator/public-pass-inference-bridge.js), [checkpoint](runs/2026-10-30-1053-public-pass-inference-bridge.md). Connects chronological provisional public replay to exact stock-aware ownership inference with independent posterior-count comparison.
- 5 fixture expectations: 5,005 forced-pass, 24,310 no-pass, 2,002 known draw to seat 2, 5,005 stock-1-1 opening, 3,003 known tile in seat 1. Four fail-closed guards. Node 22 syntax and independent combinatorial oracle checked; **clean-checkout integration test still pending**.
- **0 new deals/worlds/rounds/continuations**. Cumulative unchanged: 1,380,975 incompatible-rule rounds; 1,898,856 continuations; 630,000 opening deals; 1,070,480 hidden allocations. Next seed >=3279432. Physical branch reopening and blocked ties still unresolved; no new winning tactic.
- **Next:** execute bridge test in clean checkout; validate against genuinely logged forced-pass history and physical branch/tie rulings.

## Latest checkpoint — two forced passes distinguish provisional branch models (2026-10-30 06:50 +04)
- [Node exact evidence-strength audit](simulator/late-arrival-pass-evidence-strength.js), [checkpoint](runs/2026-10-30-0650-pass-evidence-strength.md). 8,568 own hands × 1,716 hidden opponent hands (14,702,688 exact joint assignments), 6,864 independent brute-force checks; **0 new seeded deals/worlds/full rounds**.
- Constructed witness: current-only/global forced-pass likelihood ratio **10.4** for one pass, **36.0** for two; own-hand-exclusive evidence among current-model pass observations **1.05% → 60.10%**. **Both physical branch models provisional; not a real-game frequency or win tactic.**
- Cumulative unchanged: 1,380,975 incompatible-rule model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next seed >=3279432. **Next:** authenticate physical branch reopening and blocked ties, then analyze real forced-pass history.

## Latest checkpoint — own-hand-conditioned late-arrival posterior (2026-10-30 04:45 +04)
- [Standalone exact Node script](simulator/late-arrival-own-hand-posterior.js); [checkpoint](runs/2026-10-30-0445-late-arrival-own-hand-posterior.md); [JSON](runs/2026-10-30-0445-late-arrival-own-hand-posterior.json). **27,132** own-hand subsets classified; **10,296** opponent-hand brute-force checks passed. **0 new seeded deals, random worlds, or full rounds**.
- Under the forced chronological prefix and fixed seat-1 `2-6`, knowing that seat 0 holds r of five remaining `1-a` stones changes the current-only forced-pass chance from **1.63% (r=0)** through **26.92% (r=3)** to **100% (r=5)**; global-ever-open gives 0% throughout. Exact conditional combinatorics, **not natural prevalence or an authenticated rule**.
- Cumulative unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** physical branch/tie authentication and public-history-conditioned posterior.

## Previous checkpoint — conditional late-arrival pass census (2026-10-30 03:54 +04)
- [Independent Node 22 census](simulator/late-arrival-conditional-census.js); [checkpoint](runs/2026-10-30-0354-late-arrival-conditional-census.md). All 360 relabels structurally checked, 12 × 27,132 = **325,584** exhaustive conditional hand subsets validated. **0 new deals/seeded worlds/rounds**.
- Conditional on the forced reachable prefix and fixed candidate x-w, **3,003/27,132 = 11.0681%** of seat-1 six-tile assignments force a pass under current-only but allow a move under global-ever-open. Not a natural-game frequency or a verified tactic; physical rule and blocked-tie scoring remain unconfirmed.
- Cumulative unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** authenticate late-arrival branch and blocked ties.

## Latest checkpoint — reachable chronological branch divergence (2026-10-30 02:52 +04)
- [Reproducible 3×9 chronological contract](simulator/late-arrival-reachable-contract.js); [full checkpoint](RESULTS.md). **360/360** distinct relabelled forced traces passed; each preserves 28 unique stones, 3×9+stock, clockwise turns and the confirmed `1-1` starter draw. **0 new deals/worlds/rounds**.
- Example: `1-1 → 1-2 → 2-2 → 2-4 → 4-4 → 4-5 → 5-5 → 2-5`; next `2-6` is legal under global-ever-open but illegal under all-current-only. Thus the prior synthetic branch-model counterexample is **reachable within both provisional kernels** until the final action; neither physical interpretation is authenticated.
- Node 22 standalone independent test passed; exact GitHub kernel cross-check passed in V8; clean-checkout Node with dependency pending. **No reliable new winning tactic.** Cumulative unchanged: 1,380,975 incompatible-rule model rounds, 1,898,856 forced continuations, 630,000 opening deals, 1,070,480 hidden allocations. Next unused seed >=3279432.
- **Next:** verify physical late-arrival reopening and blocked-tie scoring, then compare matched-seed strategies only under authenticated rules.

## Latest checkpoint — independent probability oracle (2026-10-30 01:46 +04)
- [Independent regression script](simulator/per-double-probability-contract-test.js), [full checkpoint](runs/2026-10-30-0146-per-double-probability-contract.md). **3,840** synthetic exact-probability comparisons passed (three board fixtures × 64 seeds × 2 policies × 2 provisional branch models × 5 p values). **0 new deals/worlds/rounds**; existing totals unchanged.
- **Critical counterexample:** a synthetic late-arrival branch gives 1.0 opponent moves under global-ever-open but 0.0 under all-current-only. Thus prior short-window equality between the models is not physical rule validation. No new win tactic.
- Independent oracle passed in V8; fresh-checkout Node pending. **Cumulative:** 1,380,975 incompatible-rule rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations; next unused seed >=3279432. **Next:** authenticate physical late-arrival branch unlocking and blocked ties, then full-game win-rate experiments.

## Previous checkpoint — independent new-hand per-double-stop holdout
- [Source](simulator/multi-double-per-double-holdout.js), [checkpoint](runs/2026-10-30-0055-per-double-new-hand-holdout.md), [per-hand JSON](runs/2026-10-30-0055-per-double-new-hand-holdout.json).
- **30,000 new seeded deals, 49,152 new hidden allocations across 24 independent starter hands; 0 new complete rounds**. New per-double continuation break-even **49.46% high / 57.14% low**, previous **26.98% / 51.76%**. At p=.5, high **−0.00145** and low **+0.02030** opponent stones; both exploratory hand-level 95% intervals cross zero. **Earlier high-pip sign does not robustly replicate across hands.** No win-rate claim.
- V8 CommonJS deterministic replay and full run passed; clean-checkout Node pending. Both branch models provisional. **Cumulative:** 1,380,975 incompatible-rule rounds, 1,898,856 forced continuations unchanged; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** Node replay, physical branch/tie fixtures, equal-pip control.

## Latest checkpoint — independent per-double stopping
- [Reproducible source](simulator/multi-double-per-double-stop.js), [full checkpoint](runs/2026-10-29-2351-per-double-stop.md), [JSON](runs/2026-10-29-2351-per-double-stop.json). **0 new deals/worlds/rounds**; reused **49,152** worlds from 24 prior starter hands.
- **Finding:** independent continuation decisions after *each* double yield nonlinear throughput differences: high `(3853-13730p-2034p²)/49152`, low `(7205-12597p-2555p²)/49152`; sign changes at **26.98%** and **51.76%** (previous per-turn mixture: 24.44% / 47.55%). No win-rate claim.
- V8 regression and deterministic replay passed; clean-checkout Node execution pending. Both physical branch models and blocked ties remain provisional.

## Latest checkpoint — independent per-turn chain choices (2026-10-29 22:53:27 +04)
- [Reproducible source](simulator/multi-double-turn-mixture.js) and [checkpoint](runs/2026-10-29-2253-per-turn-chain-mixture.md). Reused **49,152 existing worlds**; **0 new deals/worlds/rounds**.
- Evaluated all four combinations of single versus greedy multi-double response for the two opponents. First opponent's chain policy has larger short-window impact. The per-turn interaction is **zero in every world**, so independent per-turn mixture break-even remains **24.44%** (high-pip) / **47.55%** (low-pip), exactly the whole-world thresholds *in this provisional kernel*.
- V8 CommonJS full regression passed; Node clean-checkout execution pending. No win-rate claim; next independent per-double stopping and physical branch/tie authentication.

## Previous checkpoint — chain-policy break-even and second-opponent residual (2026-10-29 21:46 +04)
- [Reproducible run audit](runs/2026-10-29-2146-chain-policy-break-even-audit.md) and [updated chain script](simulator/multi-double-response-sensitivity.js). Replayed the same **49,152** hidden worlds in the JavaScript research runtime; **0 new deals/worlds/rounds**.
- For a whole-world mixture of one-tile versus greedy multi-double opponent policies, the double-minus-ordinary opponent throughput changes sign at **24.44%** chain worlds (high-pip bots) or **47.55%** (low-pip). Not a per-turn independent mixture estimate.
- Decomposition finds **−277** (high) / **−153** (low) net second-opponent first-move contributions beyond extra double tiles, showing that chain effects propagate between opponents.
- Added optional-stop, four-double, ordinary-first no-chain, and unexposed-double legality fixtures. The matching algorithm and fixtures were exercised in V8; clean-checkout Node remains pending. Physical late-arrival branch/tie rules still provisional.

## Previous checkpoint — optional multi-double opponent replies
- [Run report](runs/2026-10-29-2051-multi-double-response-sensitivity.md) and [reproducible script](simulator/multi-double-response-sensitivity.js).
- Reused 24 starter hands × 2,048 hidden worlds = **49,152 existing worlds**; **0 new deals, 0 new worlds, 0 new full rounds**.
- Opponent stones after starter double versus ordinary: single replies **+0.0784** (high-pip) / **+0.1466** (low-pip), but greedy optional double chains **−0.2423** / **−0.1617**. Prior short-window conclusion reverses under chain policy.
- Branch models and human chain propensity remain provisional; no full-game win-rate claim. Next: clean Node replay, chain legality fixtures, physical branch/tie validation.

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations (unchanged).
- **630,000** deterministic opening deals (600,000 prior + 30,000 new).
- **1,070,480** seeded random hidden-world allocations (1,021,328 prior + 49,152 new); exact partitions separate.
- Engine `qosa-research-0.5.3 + multi-double-per-double-holdout-1.0`; recovered `qosa-1.0.0` 3×9. Both late-arrival branch models **PROVISIONAL**.
- Next unused random seed **>=3279432**.

## Latest checkpoint — new-hand double follow-up (2026-10-29 19:50 +04)
- [Standalone reproducible script](simulator/opening-double-followup-new-hands.js); [full details](RESULTS.md).
- **30,000 new seeded deals** and **49,152 new matched hidden worlds**, 24 *new* stratified starter hands; **0 new full rounds**.
- Playing a double rather than an ordinary stone on the starter return gave opponents **+0.0784** (high-pip policy) / **+0.1466** (low-pip) more immediate moves; increased starter ordinary mobility on the next return by **+1.49 to +1.89**, depending on provisional branch model and opponent policy.
- No proven win-rate benefit. Code was executed as JavaScript in the research runtime with deterministic replay, but not via Node from a clean checkout.
- **Next:** fresh-checkout Node verification; optional multi-double reply sensitivity; authenticate physical late-arrival branches and blocked ties.

## Previous checkpoint — ordinary versus double return mobility (2026-10-29 17:56 +04)
- [Earlier mobility audit](simulator/opening-ordinary-mobility-audit.js); [detailed checkpoint](runs/2026-10-29-1754-opening-ordinary-mobility-audit.md).
- Reanalysis of earlier 24 hands × 1,166,880 exact partitions; **no new allocations**.
- Retaining a matching double improved playable doubles by +1.0096 / +1.0073, but reduced playable ordinary stones by −0.2485 / −0.2767 (high-/low-pip opponents). No win-rate claim.

## Previous checkpoint — exact third-turn return mobility (16:50 +04)
- [Executable source](simulator/opening-third-return-exact.js); [detailed checkpoint](runs/2026-10-29-1650-opening-third-return-exact.md).
- Reused 24 balanced starter hands from 20,000 seeded opening deals; exact 1,166,880 hidden partitions, **0 new seeded deals/worlds/full rounds**.
- Keeping a matching double improved **distinct playable stones** on return by +0.761 (high-pip opponents) / +0.731 (low-pip), but changed **branch placements** by −0.332 / +0.100. Two low-policy hands reversed the legal-stone effect despite higher opponent pass probability.
- No proven win-rate benefit; both late-arrival branch models still provisional. Next: physical late-arrival and blocked-tie rule authentication before full-game claims.

## Earlier checkpoint — exact one-opponent-turn pip-margin census
- [Reproducible source](simulator/opening-first-turn-exact.js); [run checkpoint](runs/2026-10-29-1252-opening-first-turn-exact.md).
- **0 new seeded deals/hidden worlds/full rounds**; exact combinatorial analysis of **4,686,825** post-draw starter hands and **969,475** pip-conflict choices. Two independent exhaustive **48,620-world** fixture checks (97,240 partitions); no samples added to cumulative.
- With 1–2 immediate pip sacrifice, the one-turn relative pip-margin difference (retain matching X-X minus shed larger Y) is **+1.230** against high-pip opponent but **−0.872** against low-pip. With 3+ sacrifice it is **−1.068** and **−3.385**, respectively, despite a ~6 pp first-pass advantage in both groups.
- **Exact one-turn finding only**, not a full-game win tactic; both branch models provisional, blocked tie unresolved. Next: independent gap-balanced two-turn holdout and physical-rule authentication.

## Previous checkpoint — policy-mixture sensitivity (reanalysis only)
- [Executable audit](simulator/opening-policy-mixture-audit.js); [checkpoint](runs/2026-10-29-1153-opening-policy-mixture-audit.md).
- **No new deals/worlds/rounds**; the previous 30,000 deals and 19,200 worlds are reused, not counted again. Six arithmetic policy-mixture comparisons with exact branch-model consistency checks.
- Single-tile opponents: high-pip-policy share required for positive short-window margin is **9.49%** for 1–2 pip sacrifice versus **56.64%** for 3+; optional double chains **0%** versus **38.93%**. Descriptive threshold only, not a win-rate claim.
- Next: independent gap-balanced holdout and physical late-arrival/blocked-tie rule authentication.

## Previous checkpoint — opponent pip margin versus opening double retention
- [Executable source](simulator/opening-pip-margin-holdout.js); [detailed checkpoint](runs/2026-10-29-1053-opening-pip-margin-holdout.md); [raw JSON](runs/2026-10-29-1053-opening-pip-margin-holdout.json).
- Independent **30,000** opening deal seeds and **19,200** matched hidden worlds, 600 selected same-hand conflicts. No new full rounds.
- Keeping matching X-X suppresses opponent stone tempo, but relative remaining-pip margin is **policy-dependent**: high-single **+3.56**, high-chain **+4.76**, low-single **−1.81**, low-chain **−0.97**, seeded-random single **−0.60**, random chain **+0.07** (95% exploratory interval crosses zero), all owned minus higher-pip choice.
- Both provisional branch models agree in this two-turn window; **no confirmed real-game win-rate or universal strategy**. Pip/geometry confounded; selected positions and simple bots.

## Previous checkpoint — opening cost matched
- [2026-10-29 09:48](runs/2026-10-29-0947-opening-cost-matched.md): 30,000 opening deals + 7,680 seeded worlds, mean immediate pip sacrifice 2.746; opponent stone tempo reduced 0.10–0.28 over two turns. Cumulative after prior run 756,368 seeded worlds and 520,000 opening deals.

## Earlier checkpoints
- [Exact repeated opening pass locks](simulator/opening-lock-depth-exact.js): 875/245/20 of 4,686,825 post-draw starter hands guarantee at least 2/4/6 opponent passes respectively, under a very rare confirmed opening configuration; not win-rate evidence.
- [Chronological pass posterior](runs/2026-10-29-0452-branch-order-posterior.md): same board snapshot but different histories can imply 100% versus 36.36% tile ownership in an explicit **provisional** branch model.
- [Four-model blocked-tie audit](runs/2026-10-27-1951-branch-tie-probe.md): tied minima occur in synthetic blocked rounds, but the actual winner/tie convention is unconfirmed.

## NEXT ACTION
Authenticate physical late-arrival branch reopening and blocked-tie scoring. Evaluate double-play follow-up versus ordinary-play alternatives on matched hidden worlds under explicitly labelled models; do not treat short-window playable-double count as a win-rate advantage.
