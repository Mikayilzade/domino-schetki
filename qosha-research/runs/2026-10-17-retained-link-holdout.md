# Retained double/connector links — independent holdout (2026-10-17)

- Timestamp (Asia/Baku): 2026-10-17T11:52:13+04:00
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3 players × 9 stones.
- Fresh deterministic deal seeds: `822000..823999` (2,000 deals × 3 seat rotations). Policies: closed-branch-control, min-hand-pips, fast-doubles; canonical-multiset continuation.
- Baseline: **6000 new canonical complete rounds**, 5961 finishes, 39 blocks, 0 unresolved; these rounds count toward cumulative strategy scale. Old comparison modes and forced continuations are not credited.
- Matched first-disagreement positions: **1488**, forced continuations **2976**; link-count differs in **385** positions. Link count = number of surviving non-double-to-held-double number incidences after the candidate single.
- High-minus-low retained links: first-finish difference **-0.52 pp**, exploratory seed-cluster 95% interval **[-6.68, 5.64] pp**; mean final pips high/low **3.094 / 3.057**; minus-finish high/low **16.10% / 13.51%**; blocks high/low **0.78% / 0.78%**.
- Independent seed halves: high-minus-low first-finish **-5.64 pp (n=195); 4.74 pp (n=190)**.
- Equal immediate next-opponent action-count subset: **80** positions; high-minus-low first-finish **-1.25 pp**. Changed accessible-end diversity in 895 eligible positions.
- Validation: V8 CommonJS execution (not Node CLI); independent replay test 859000..859015, 15 eligible positions; deterministic and accounting checks passed; source-state mutation 0, primary-score mismatches 0.
- Confidence/limitations: observational strata only; alternative tiles can differ in identity and geometry, policies are deterministic, branch opening assumptions remain provisional, block winner unassigned; seed-cluster interval is exploratory and not a causal interval. No human-game universal strategy claim.
- Cumulative credited full strategy rounds: **221,400 + 6000 = 227400**; historical 4,000 separate. Forced continuations separate.
- Reproduce: `node qosha-research/simulator/first-tile-link-strata.js test` and `node qosha-research/simulator/first-tile-link-strata.js run 822000 2000`. Raw summary: `runs/2026-10-17-retained-link-holdout.json`.
- Exact next hypothesis/action: matched equal-pip connector-vs-nonconnector action pairs with the **same post-move accessible-end multiset** (where feasible); stratify next-player hand size and evaluate fixed-visible Monte Carlo hidden worlds before interpreting link retention causally.
