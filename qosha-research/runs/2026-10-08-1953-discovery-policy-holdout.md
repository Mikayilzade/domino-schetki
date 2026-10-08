# 2026-10-08 19:53 (+04) — discovery-policy holdout

Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0` (3 players × 9 tiles). No gameplay-rule changes.
New completed full rounds: **0**; verified cumulative completed strategy rounds: **180,000** (historical 4,000 excluded).
New fixed-visible hidden worlds: **3,200**; cumulative fixed-visible worlds: **34,290** (prior 31,090).
Policy/world evaluations: **9,600**; forced-candidate continuations: **47,625**; unresolved candidate continuations: **0**.
Discovery seed scan: `80000..89999`, stopped at 80375 (closed-branch-control) / 80180 (min-hand-pips).
Each discovery: 64 reachable positions, exactly 8 in each of eight strata (focal hand 4/5 × opponent minimum <=3/>=4 × connector gap <=2/>=3).
Each position: 25 sampled hidden worlds, deterministic world seed `6100000 + 1000*dealSeed + worldIndex`.
Continuation policies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Matched hidden worlds and policies for the two forced moves **within each position**.
Action comparison: same branch and starting number X, two already-open legal connectors X-low and X-high. **Keep HIGH minus keep LOW** = spend LOW minus spend HIGH. Positive remainder pips means **worse**. Residual remainder = observed remainder difference − (high-low), an arithmetic decomposition, NOT an independent strategic payoff.

## Summary (mean across 64 positions; 95% exploratory position-normal interval)

| Discovery | Continuation | Finish-first delta (pp) | Remainder delta (pips) | Residual delta (pips) |
|---|---|---:|---:|---:|
| closed-branch-control | closed-branch-control | +4.19 [-0.59, +8.96] | +0.84 [+0.04,+1.64] | -1.91 [-2.69,-1.13] |
| closed-branch-control | min-hand-pips | +4.13 [-0.14,+8.39] | +0.70 [+0.02,+1.38] | -2.05 [-2.74,-1.36] |
| closed-branch-control | fast-doubles | +7.13 [+2.48,+11.77] | +0.41 [-0.23,+1.05] | -2.34 [-3.01,-1.66] |
| min-hand-pips | closed-branch-control | +5.81 [+1.76,+9.87] | +1.11 [+0.49,+1.74] | -1.40 [-2.08,-0.72] |
| min-hand-pips | min-hand-pips | +5.44 [+1.65,+9.23] | +1.24 [+0.60,+1.88] | -1.28 [-1.95,-0.60] |
| min-hand-pips | fast-doubles | +3.13 [-0.72,+6.97] | +1.14 [+0.63,+1.65] | -1.38 [-1.95,-0.80] |

## Opponent pressure (late: nearest opponent 1–3 tiles; early: >=4)

Finish-first delta for keep HIGH, **late vs early**, in percentage points:

| Discovery | Continuation | Late | Early |
|---|---|---:|---:|
| closed-branch-control | closed-branch-control | +3.25 | +5.13 |
| closed-branch-control | min-hand-pips | +2.00 | +6.25 |
| closed-branch-control | fast-doubles | +3.63 | +10.63 |
| min-hand-pips | closed-branch-control | +1.38 | +10.25 |
| min-hand-pips | min-hand-pips | +0.75 | +10.13 |
| min-hand-pips | fast-doubles | +0.88 | +5.38 |

**Finding / hypothesis:** Across these two discovery policies, keep-HIGH looks more promising for finishing first when opponents are not near finishing, but **its positive raw remainder difference is usually unfavorable**. The late-vs-early contrast is exploratory; do not recommend a universal move yet. It may reflect selection/branch effects and repeated testing.

## Exact selected deal seeds

- closed-branch-control: 80002,80004,80005,80006,80008,80010,80012,80013,80015,80017,80021,80024,80026,80027,80028,80029,80030,80031,80032,80037,80039,80040,80041,80042,80045,80047,80048,80049,80050,80052,80060,80063,80065,80069,80071,80074,80075,80076,80081,80082,80087,80094,80096,80101,80104,80105,80109,80115,80116,80120,80122,80126,80134,80149,80161,80166,80216,80220,80221,80229,80247,80284,80311,80375
- min-hand-pips: 80000,80001,80002,80003,80007,80008,80010,80012,80013,80015,80017,80018,80020,80022,80025,80027,80028,80029,80030,80031,80032,80035,80037,80038,80039,80041,80042,80043,80044,80045,80047,80048,80050,80052,80053,80060,80061,80062,80063,80065,80066,80069,80072,80074,80075,80076,80080,80082,80087,80089,80102,80108,80110,80111,80112,80115,80119,80122,80124,80128,80143,80152,80154,80180

## Reproducibility / limitations

Executed in a V8 CommonJS harness using the checked-in `simulator/connector-gap-pressure.js` with the following **in-memory, non-gameplay** change to `collect`: add optional argument `discoveryPolicy='min-hand-pips'` and use `chooseBy(discoveryPolicy, ...)` instead of hard-coded `chooseBy('min-hand-pips', ...)`. Then for each discovery policy, call `collect(80000,90000,8,discoveryPolicy)`, for each selected position call `analyze(position,25,continuationPolicy)`, and aggregate **per position** (not per world). All other source unchanged. Node CLI not executed. Do not count this as a new full-round strategy baseline.

Caveats: assumption-labelled branch opening; fixed deterministic bots; quota/first-eligible sampling not population-weighted; many exploratory comparisons with no multiplicity correction; block winner unassigned; same seed scans yield different positions under different discovery policies, so between-discovery contrasts are not randomized causal effects.

**Next exact action:** persist the optional discovery-policy argument as executable source, add a standalone runner/test, run it under Node CLI if possible, and replicate a *pre-registered* late-vs-early finish-first contrast on independent seed range `100000+` with at least 30 hidden worlds per position. Check pressure interaction at the position level and compare with an alternate legal branch selection.
