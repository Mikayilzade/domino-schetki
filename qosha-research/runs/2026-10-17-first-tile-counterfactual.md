# First distinct-tile tie-break counterfactual — 2026-10-17

- Timestamp (Asia/Baku): 2026-10-17T10:58:35.049+04:00
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3 players × 9 stones.
- Fresh deterministic seeds: **821000..821999**, 1,000 deals × 3 seat rotations.
- Policies: closed-branch-control, min-hand-pips, fast-doubles. The same canonical-multiset policy continues after each forced choice.
- Selection: first reachable decision per canonical rollout where the legacy and tile-first tie-breakers choose **different single tiles** at identical primary strategy score. Counterfactuals share the same exact complete-information state. **737/3000** trajectories eligible; **1474** forced continuations; zero unresolved.
- Discovery policy at eligible decision: branch-control 269, min-hand-pips 194, fast-doubles 274.
- Forced legacy: **10/737 blocks**, **209/737 focal first finishes**, 42 focal minus finishes, mean focal remainder **4.4681** pips, mean remaining turns 12.4071.
- Forced tile-first: **6/737 blocks**, **229/737 focal first finishes**, 37 focal minus finishes, mean focal remainder **4.6893** pips, mean remaining turns 12.2605.
- Paired discordance: **9 legacy-only blocks vs 5 tile-first-only blocks** (both block 1); **76 legacy-only first finishes vs 96 tile-first-only first finishes**. Immediate next-player action count: tile-first minus legacy **−0.2022** on average; tile-first more 264, legacy more 318, same 155.
- Fresh baseline with canonical-multiset (same seeds): **3,000 complete rounds**, **26 blocks**, **0 unresolved**; first-finish rates: branch control **48.4333%**, min-hand-pips **29.9000%**, fast-doubles **20.8000%**. Counterfactual legacy/tile-first baseline modes are excluded from credited totals.
- Validated in V8 CommonJS evaluation: independent replay on seeds **859000..859015**, 15 eligible positions/30 continuations, deterministic output and paired accounting assertions passed. This is not a Node CLI execution claim.
- Cumulative credited full strategy rounds: **218,400 + 3,000 = 221,400**. The 1,474 forced continuations are tracked separately, not added to this total.
- Finding: selecting a different equal-primary-score tile can change later block/finish behavior, but **only 14/737 paired positions disagreed on block status**; first-finish and remainder objectives also point in different directions. **No reliable universal tile preference is established.**
- Confidence/limits: deterministic model-specific diagnostic, first-eligible-position selection, one opponent mix, full hidden hands known to the simulator, no Monte Carlo hidden-world posterior, branch-opening assumptions remain provisional, block winner unassigned. Do not extrapolate to human-game win rate.
- Reproduce: `node qosha-research/simulator/first-tile-disagreement.js test`; `node qosha-research/simulator/first-tile-disagreement.js run 821000 1000`; baseline `node qosha-research/simulator/canonical-multiset-holdout.js run 821000 1000`.
- **Exact next hypothesis/action:** stratify the first-disagreement pairs by whether a connector and a double are preserved, by playable-end diversity, and by next-player mobility; run independent seed holdout and then fixed-visible Monte Carlo over unknown opponents.
