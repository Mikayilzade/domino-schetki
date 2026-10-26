# Qoşa research status

Updated: 2026-10-26 06:47:44 +04 (Asia/Baku)

## Verified cumulative scale
- **1071855** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Latest fresh seeds **1560580..1560819**, 240 deals; next fresh seed **>=1560820**.

## Latest checkpoint
- New `simulator/mobility-hybrid-holdout.js` and `runs/2026-10-26-mobility-hybrid-1560580.json`.
- **6480** complete matched rounds, 6316 finishes, 164 blocks, 0 unresolved; 120/120 discovery/holdout.
- closed-branch-control+closed-branch-control: mobility−closed finish-first **-5.97 ±2.80 pp**, pips **1.14**; tempo−closed **-6.39 ±2.77 pp**, pips **0.92**. Holdout finish-first mobility **-5.00 pp**, tempo **-6.94 pp**.
- random-legal+closed-branch-control: mobility−closed finish-first **-10.42 ±4.17 pp**, pips **0.98**; tempo−closed **-10.83 ±3.84 pp**, pips **0.73**. Holdout finish-first mobility **-9.17 pp**, tempo **-12.22 pp**.
- random-legal+tempo-hybrid: mobility−closed finish-first **-2.36 ±4.17 pp**, pips **0.13**; tempo−closed **-4.31 ±4.06 pp**, pips **-0.09**. Holdout finish-first mobility **-1.67 pp**, tempo **-6.11 pp**.
- Deterministic replay, four-branch synthetic and scoring contract tests passed in V8; Node CLI not executed. No scoreboard/PWA edits.
- Findings within provisional model only; block winner/loneZero/bust/101-point match unresolved.

## NEXT ACTION
- Independent fresh seeds >=1560820: replicate promising hybrid if any and run paired hidden-world regret; diagnose proxy failures otherwise. Obtain authentic branch lock/open and block-winner fixtures before human-play advice.
