# Qoşa research status

Updated: 2026-10-30 00:55 +04 (Asia/Baku)

## Latest checkpoint — independent new-hand per-double-stop holdout
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
- **600,000** deterministic opening deals (570,000 prior + 30,000 new).
- **1,021,328** seeded random hidden-world allocations (972,176 prior + 49,152 new); exact partitions separate.
- Engine `qosa-research-0.5.3 + opening-double-followup-new-hands-1.0`; recovered `qosa-1.0.0` 3×9. Both late-arrival branch models **PROVISIONAL**.
- Next unused random seed **>=3200280**.

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
