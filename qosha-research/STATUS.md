# Qoşa research status

Updated: 2026-10-24 06:53 (+04)

## Verified scale
- **402,900** full matched continuations under current research engine, plus **532,608** paired sampled hidden-world counterfactual continuations.
- Historical 4,000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9.
- Deterministic replay and prior-run guard/conditional regression passed; branch locking/opening remains provisional pending real-play fixture.

## Latest checkpoint
- Fresh disjoint seeds **1376040..1377639**, 1,600 deals, 19,200 matched full continuations.
- New audit runner: `simulator/sacrifice-event-audit.js`; raw rows: `runs/2026-10-24-accepted-sacrifice-event-audit-1376040-1377639.json`.
- 67 accepted one-tile own-mobility sacrifices; 53 reduced both opponents' immediate legal-tile access. Finish-first conditional vs guard: min-hand-pips **+0.042 pp ±0.116 pp**, branch-control **+0.083 pp ±0.129 pp**. No reliable win advantage.
- Opponent hands used only for retrospective audit; no hidden-hand policy leakage.

## NEXT ACTION
Obtain a real-game four-branch opening/locking fixture. Then predeclare and test late-game (≤3 stones) conditional-sacrifice vs strict guard on fresh disjoint seeds 1377640+, using matched hidden-world continuations without threshold tuning. Never edit live scoreboard/PWA files.
