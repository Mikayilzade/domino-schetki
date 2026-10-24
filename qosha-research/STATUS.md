# Qoşa research status

Updated: 2026-10-24 04:51 (+04)

## Verified scale
- **364,500** full matched continuations under current research engine, plus **532,608** paired hidden-world counterfactual continuations.
- Historical 4,000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9.
- Deterministic replay passed; branch locking/opening remains provisional pending real-play fixture.

## Latest checkpoint
- Conditional own-mobility sacrifice threshold policy tested on fresh seeds 1374640..1375239 (600 deals, 14,400 full continuations).
- Conditional vs strict mobility guard finish-first: **+0.06 pp ±0.11 pp** against min-hand-pips bots, **+0.06 pp ±0.24 pp** against branch-control bots. Only **27** actual sacrifices across profiles. No universal rule confirmed.
- Prior 03:55 independent 800-deal audit run (14,400 continuations) reconciled from persisted run-data JSON; no duplicate counting.

## NEXT ACTION
Fresh disjoint seeds 1375240+ to retest conditional sacrifice against mobility guard; obtain a real-game locked/open branch fixture. Never edit live scoreboard/PWA files.
