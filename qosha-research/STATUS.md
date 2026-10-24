# Qoşa research status

Updated: 2026-10-24 08:47 (+04)

## Verified scale
- **431700** independent matched full continuations unchanged; **606144** sampled hidden-world forced counterfactual continuations (+73536 this run).
- Historical 4000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9. Four-branch locking/opening remains provisional.
- New late-side Monte Carlo deterministic replay and 8 existing invariant/regression suites passed in V8 CommonJS (Node CLI not run).

## Latest checkpoint
- Fresh discovery + disjoint holdout: **320** selected pre-action 2–3-stone positions, **30720** matched hidden allocations, **73536** all-side forced candidate continuations. No new full strategy rounds.
- Own-mobility versus predicted next-opponent access: holdout min-pips **+1.367 pp ±1.536 pp**; branch-control **+0.026 pp ±1.791 pp** (exploratory position-level intervals). Policies disagreed at **32/160** holdout positions; no robust rule.
- New runner: `simulator/late-side-mc.js`; per-action raw position metrics:
  `runs/2026-10-24-0847-late-side-mc-discovery-1380040.json` and
  `runs/2026-10-24-0847-late-side-mc-holdout-1381840.json`.

## NEXT ACTION
On fresh disjoint seeds **1383640+**, oversample discordant 2–3-stone positions, >=256 matched worlds each, and test multiple continuation policies. Independently validate an authentic four-branch locked/open fixture. Do not modify scoreboard/PWA files.
