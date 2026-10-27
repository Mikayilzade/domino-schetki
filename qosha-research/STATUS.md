# Qoşa research status

Updated: 2026-10-27T18:56:18+04:00 (Asia/Baku)

## Verified cumulative scale
- **1,337,775** complete rounds under the PROVISIONAL global-ever-open model; historical 4,000 separate.
- **19,200** one-side-only counterfactual rounds across first/last selection (do not pool).
- **4,800** all-currently-matching-only counterfactual rounds (do not pool).
- **1,361,775** model-rounds across incompatible assumptions, for workload scale ONLY.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **14,082** immediate next-pass labels and **4,900** known-world diagnostics (unchanged).
- Engine \`qosa-research-0.5.3\` / recovered \`qosa-1.0.0\` 3×9; authentic four-branch rule and blocked winner **UNVALIDATED**.
- Fresh disjoint seeds **1601340..1602139**; next >=**1602140**.

## Latest checkpoint
- **800 deals × 2 policy mixes × 3 seat rotations × 4 models = 19,200 complete model-rounds**; zero unresolved. V8 CommonJS replay and explicit four-side / −20 / −40 / score-floor / conservation fixtures passed; Node CLI not executed.
- Global-ever-open: **187/4800 blocks (3.90%)**, 4613 finishes, 5 block ties; mean 25.316 turns, minus −10=764, −20=15.
- All-current-only: **4509/4800 blocks (93.94%)**, 291 finishes, 276 block ties; mean 23.301 turns, minus −10=33. Double opens ALL ends matching now, but later arrivals at its number remain locked. **6,908 multi-side opening events**; **18,539 transitions into previously doubled locked numbers**; **21,569 passes with a globally legal non-double**.
- One-side-first: **4737/4800 blocks (98.69%)**, 63 finishes, 261 ties; one-side-last: **4750/4800 blocks (98.96%)**, 50 finishes, 254 ties.
- Paired global finish -> all-current block **4,326/4,800**; mean remainder **+10.898 pips/player** in all-current.
- **Interpretation:** opening all sides *at double-play time* does not reproduce global-ever-open behavior. Future-side unlocking is the dominant ambiguity; **NO authentic rule or human tactic established**. Block ties counted, winners NOT assigned.
- Code: \`simulator/branch-current-full-round.js\`; raw data: \`runs/2026-10-27-1856-branch-current-full-round-1601340-1602139.json\`; full limitations in \`RESULTS.md\`.
- No scoreboard/PWA files or GitHub Actions modified.

## NEXT ACTION
- Find an authentic gameplay trace or derive an observable test for a side arriving at an already doubled number *after* N-N was played elsewhere. Verify whether that side is playable without another N-N, then fix branch semantics before ranking tactics.
- Add explicit block-tie winner/scoring tests using authentic rules; do not invent tie-breaking.
