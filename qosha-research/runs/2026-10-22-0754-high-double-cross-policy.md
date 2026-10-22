# 2026-10-22 07:54 (+04) — independent high-double cross-policy holdout

- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3 players × 9 stones; scoreboard/PWA unchanged.
- Seeds: `1313840..1315439` available for discovery; scan stopped at quotas, per-bot scan counts: {"min-hand-pips":{"seedsScanned":606,"positions":{"3":20,"4":20,"5":20,"6":20}},"closed-branch-control":{"seedsScanned":450,"positions":{"3":20,"4":20,"5":20,"6":20}}}.
- **80 new selected positions**, 21 exact-support positions; 4270 distinct fixed-visible hidden allocations; **17080 forced continuations**. Two actions (open/defer) × both continuation bots, matched worlds; no unresolved. 8-position V8 deterministic replay/invariant passed, Node CLI not run.
- Predeclared contrasts: 3-3 and 5-5; each of two discovery bot profiles, each tested under **both** continuation bots, including cross-profile. Seed-cluster Bonferroni-normal intervals (z=2.735) over 8 cells; exploratory, not a fully powered confirmation.

| Discovery bot | Double | Continuation bot | Defer−open win (pp) | Seed-cluster Bonferroni 95% (pp) | Retained X-Y / not retained (positions) |
|---|---|---|---:|---|---:|
| min-hand-pips | 3-3 | min-hand-pips | 7.30 | -2.62 .. 17.22 | 15/5 |
| min-hand-pips | 3-3 | closed-branch-control | 11.85 | 2.01 .. 21.7 | 15/5 |
| min-hand-pips | 5-5 | min-hand-pips | 6.69 | -6.43 .. 19.81 | 13/7 |
| min-hand-pips | 5-5 | closed-branch-control | 11.89 | 0.7 .. 23.08 | 13/7 |
| closed-branch-control | 3-3 | min-hand-pips | 7.13 | -4.9 .. 19.17 | 17/3 |
| closed-branch-control | 3-3 | closed-branch-control | 11.51 | -3.43 .. 26.44 | 17/3 |
| closed-branch-control | 5-5 | min-hand-pips | 6.64 | -9.68 .. 22.96 | 15/5 |
| closed-branch-control | 5-5 | closed-branch-control | 15.86 | 0.06 .. 31.66 | 15/5 |

- Key interpretation: 3-3: 11.51 pp; 5-5: 15.86 pp under original closed-branch bot; cross-bot cells show how much of the signal depends on continuation behavior. **This is selected-position counterfactual advantage, not full-round win-rate improvement.**
- Post-hoc X-Y connector retention strata are recorded per cell in JSON; small/imbalanced strata are descriptive only, not evidence of causation.
- Confidence/limitations: first-eligible selection, fixed deterministic bots, provisional four-branch opening, no block winner, uniform pass-constrained hidden worlds ignore opponent action likelihood, seed-cluster intervals do not include hidden-world Monte Carlo error. No general human-play rule established from this test alone.
- Cumulative: **389,700 complete strategy continuations unchanged**; **164534 separate counterfactual continuations** (prior 147,454 + 17080); prior historical 4,000 and quarantined runs remain separate.
- Reproduce: `node qosha-research/simulator/high-double-cross-policy.js test` and `node qosha-research/simulator/high-double-cross-policy.js 1313840 1600 20 64`.
- **Exact next hypothesis/action:** matched connector-vs-nonconnector controls at the same double, branch geometry and remaining pips; run 30+ independent positions per stratum with 128 unique/exact worlds and at least two continuation policies. Verify Node CLI and audit seed-cluster intervals.
