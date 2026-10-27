# Qoşa research status

Updated: 2026-10-27T15:54:33+04:00 (Asia/Baku)

## Verified cumulative scale
- **1320975** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **14,082** immediate next-opponent pass labels (unchanged).
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9; global four-side number-lock **PROVISIONAL**.
- Fresh disjoint seeds **1596940..1599339**; next >=**1599340**.

## Latest checkpoint
- Structural audit: 2400 deals × 2 strategy mixes × 3 seat rotations = **14400 complete rounds**, 13905 finishes, 495 blocks, 0 unresolved; 349110 legal transition checks and 363510 full-deck conservation checks, no failures.
- Number unlock events **86017**, of which **31863** involved ≥2 branch ends (**14130** rounds affected). These are *assumption-exposure* diagnostics, not evidence the real game opens both sides.
- Block minima: unique 477, tied 18, zero minimum 0; **no block winner assigned**. Minus finishes: {"0":11538,"-10":2265,"-20":101,"-30":1,"-40":0}.
- Tested mixes: random-legal/min-hand-pips/closed-branch-control versus fast-doubles/moderate-double-hold/closed-branch-control. No new human-game tactic claimed.
- Source `simulator/branch-block-audit.js`; data `runs/2026-10-27-branch-block-audit-1596940-1599339.json`. Deterministic V8 pilot passed; Node CLI not run. No scoreboard/PWA changes or GitHub Actions.

## NEXT ACTION
- Obtain authentic examples to decide whether one double unlocks a number globally across multiple sides or only a particular branch, and how blocked winner/ties are scored. Then re-run matched-seed strategy/regret comparisons under confirmed rules; keep results provisional until then.
