# Event-level parity guard — 2026-11-04T04:49:02+04:00 (Asia/Baku)

- Engine/rules: qosha-research-0.5.3, qosa-1.0.0 recovered 3×9, active PWA v16 tie adapter. Terminal pip + finish-minus provisional; blocks unscored.
- Deals: 0 new. Pending replay of the same four distinct 1,000-accepted-deal cohorts, starts 17,000,000 / 18,000,000 / 19,000,000 / 20,000,000; no new seed range. Historical comparison target: 30 dependent tie-arm outcomes, 11 unique match boundaries, 66 expected arm traces.
- Policy: deterministic seed/turn/player hash legal action; six matched manual score-entry orders. Not a strategy comparison.
- Change: trace now records `noOp` and compares the complete applied event sequence (`seat`, `entityId`, `delta`, `ignored`, `noOp`) against the versioned v16 integration adapter, in addition to entity/places/pending/zero checks. This closes a coverage gap: matching final scores alone cannot establish that ignored/no-op events were classified identically.
- Finding: static audit identified missing event-level parity assertion. **No new gameplay or strategic result** and no claim of passing assertions: GitHub connector can read/write, but container git clone fails DNS resolution; executable Node replay was not run.
- Confidence: high that guard is persisted as source; zero empirical confidence until executed. Physical rules and blocks remain unresolved; do not pool prior cohorts.
- Exact next action: run `node qosha-research/simulator/pwa-v16-eleven-tie-traces-regression.js --full` in a working Node checkout; then run `node qosha-research/simulator/pwa-v16-eleven-tie-traces.js > qosha-research/runs/pwa-v16-eleven-tie-traces.json`; inspect failures, save verified 66 traces and metrics, and prioritize branch/block invariants.
