# Opening policy-mixture sensitivity audit — 2026-10-29T11:54:50+04:00 Asia/Baku

- **Engine/rules:** `qosa-research-0.5.3+opening-pip-margin-holdout-1.0` / recovered `qosa-1.0.0` 3×9; late-arrival global/current branch semantics **provisional**.
- **New workload:** **0 new deals, 0 new hidden worlds, 0 complete rounds, 0 forced continuations**. Reanalysis only of the already-counted **30,000 opening deals** (seeds `2855320..2885319`) and **19,200 matched hidden allocations** (`2885320..2904519`). Do **not** add these again to cumulative totals.
- **Comparison:** same-hand `1-X` retaining `X-X` versus higher-pip `1-Y` with `Y-Y` unowned. Margin = remaining opponent pips minus focal remaining pips after two opponent turns; positive owned-minus-higher-pip favours keeping the matching double in this **short-window metric only**.
- **Mixture definition:** in fraction `p` of games opponents follow the high-pip policy; otherwise the low-pip policy. The threshold is the `p` where the *linear mixture of previously observed mean margins* crosses zero. Random-policy outcomes are shown as an additional descriptive comparator; they are **not** inferred from the mixture.

| Opponent mode | Sacrifice bucket | High-pip Δ | Low-pip Δ | Random Δ | High-pip share needed | Worst of three Δ |
|---|---|---:|---:|---:|---:|---:|
| single | all | 3.56 | -1.81 | -0.60 | 33.73% | -1.81 |
| single | 1-2 | 4.73 | -0.50 | 0.75 | 9.49% | -0.50 |
| single | 3+ | 2.40 | -3.13 | -1.95 | 56.64% | -3.13 |
| chain | all | 4.76 | -0.97 | 0.07 | 16.88% | -0.97 |
| chain | 1-2 | 5.83 | 0.42 | 1.40 | 0.00% | 0.42 |
| chain | 3+ | 3.68 | -2.35 | -1.27 | 38.93% | -2.35 |

- **New finding (descriptive, not validated tactic):** keeping the double when the immediate pip sacrifice is **1–2** has a much less negative worst observed margin (**−0.50**) than sacrificing **3+** (**−3.13**) across these toy policies. With single-tile opponents the required high-pip-policy share rises from **9.49%** (small sacrifice) to **56.64%** (large sacrifice); with optional double chains from **0%** to **38.93%**. Thus the pip sacrifice and opponent's shedding style are important qualifiers; tempo suppression alone is not a universal reason to retain the double.
- **Validation:** six exact arithmetic reweightings; each of six policies agrees between the two provisional branch models for these two-turn means; each overall mean equals the average of two equal-size 300-position gap strata; source sample/seed metadata asserted. Test: `node qosha-research/simulator/opening-policy-mixture-audit.js test`. Calculations checked against source JSON in connector V8; **fresh-checkout Node execution not claimed**.
- **Confidence/limits:** exploratory reuse of selected positions, no independent holdout or confidence interval for mixture thresholds, no observed human policy frequencies. Connector pips/branch geometry remain confounded with double ownership. No win/first-place, median pips, block, minus, 101 or full-round regret claim. Physical late-arrival branch reopening and blocked tie scoring remain unresolved.
- **Cumulative unchanged:** **1,380,975** incompatible-rule model rounds, **1,898,856** forced continuations, **550,000** deterministic opening deals, **775,568** separate seeded hidden allocations; historical 4,000 separate. Next unused seed **>=2904520**.
- **Exact next hypothesis/action:** run an independent fresh-seed holdout with **pip-gap-balanced** same-hand choices and mixed high/low opponents; validate the policy-mixture crossover and compute per-position uncertainty. Prioritize authentic physical late-arrival and blocked-tie fixtures before any full-game strategy ranking.
