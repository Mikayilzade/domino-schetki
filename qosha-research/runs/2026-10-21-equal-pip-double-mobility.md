# Equal-pip double opening vs ordinary single — independent paired holdout

- Timestamp (Asia/Baku): 2026-10-21T06:50:47 +04:00
- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; 3×9; branch rules provisional.
- Seeds: min-pips 1318000..1318146 (end exclusive), branch-control 1319500..1319644 (end exclusive).
- 290 scanned deals; 160 independent first-eligible positions; 7680 hidden allocations (48/position); 30720 paired candidate continuations; 0 unresolved; no new full strategy rounds.
- Same state: opening exactly one double vs ordinary single with **equal removed pip sum**; continuation policies min-hand-pips and closed-branch-control. First eligible pair deterministically selected by canonical signature.
- Next opponent legal tile-type change (double minus single): 1.885 [1.747, 2.024] types; opening creates more legal types in 156/160 positions, unchanged in 0.
- Finish-first delta (double minus single), all: min-pips -13.42 pp [-16.44, -10.41] (n=160); branch-control -12.28 pp [-14.70, -9.86] (n=160).
- When next mobility increases (n=156): min-pips -13.47 pp [-16.54, -10.41] (n=156); branch-control -12.34 pp [-14.80, -9.88] (n=156).
- When next mobility unchanged (n=0): min-pips n=0; branch-control n=0.
- Mean focal pip remainder double-minus-single (all): min-pips 1.042; branch-control 1.361.
- Confidence: exploratory normal position-level intervals; repeated hidden worlds are not independent positions. Equal pips removes one confound, **not** connectivity/geometry confounding. Do not claim human causal benefit or universal rule.
- Limitations: uniform hidden allocations do not condition on observed opponent choices or passes; assumed locked/open branch semantics; first eligible position per seed, fixed bots; blocks have no assigned winner; first finish is not full-match victory.
- Validation: deterministic 3-position discovery, equal-pip invariant, same-world replay, source immutability and all candidate continuations resolved in V8 CommonJS harness (not Node CLI).
- Exact next action: independent seed set >=1321000, matched within double number / next-player hand size / legal tile sets; identify where opening does **not** increase mobility, and verify whether remaining win delta persists under alternate continuation policy.

Reproduce: `node qosha-research/simulator/equal-pip-double-mobility.js test` then `node qosha-research/simulator/equal-pip-double-mobility.js 1318000 1321000 160 48`. Raw rows: `runs/2026-10-21-equal-pip-double-mobility.json`.
