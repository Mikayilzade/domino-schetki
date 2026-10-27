# Qoşa research status

Updated: 2026-10-27 14:59:54 +04 (Asia/Baku)

## Verified cumulative scale
- **1306575** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **14082** immediate next-opponent pass labels.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9; four-side number-lock **PROVISIONAL**.
- Fresh disjoint seeds **1595740..1596939**; next >=**1596940**.

## Latest checkpoint
- Out-of-family public-history mismatch guard: 1200 deals / 14400 rounds; 13789 finishes, 611 blocks, 0 unresolved, mean turns 25.492569; minus {"-10":2014,"-20":71,"-30":0,"-40":0}.
- 774 selected positions / 1548 next-pass labels / 49536 hidden allocations; 0 new forced full-game continuations. Four opponent mixes (random, tempo-open, anti-minus), 3 seat rotations; focal closed-branch-control.
- Seven predeclared gates trained on first 600 seeds only (≥80 uncertain clusters, 99% cluster lower bound >+0.003). Selected **pass-only**. Discovery 100 uncertain clusters / 139 labels, cluster gain 0.000000 ± 0.000000. Untouched holdout 94 clusters / 131 labels: exact Brier **0.108843**, guarded **0.108843**, cluster gain **0.000000 ± 0.000000**.
- No evidence to replace exact pass-only under policy mismatch. Deterministic V8 tests 6/6 passed; Node CLI not run. No human-game tactic claimed.
- Code: `simulator/pass-choice-mismatch-guard.js`; full run data: `runs/2026-10-27-1455-mismatch-guard-1595740-1596939.json`. No scoreboard/PWA changes, no GitHub Actions.

## NEXT ACTION
- Authenticate branch opening/locking and blocked winner from real examples. On fresh seeds >=1596940, compare public-history-only calibration against exact pass-only and then matched hidden-world move regret; do not infer match win from Brier.
