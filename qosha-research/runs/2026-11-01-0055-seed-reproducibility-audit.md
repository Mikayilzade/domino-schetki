# 3×9 seed-to-deal reproducibility audit

**Timestamp:** 2026-11-01 00:55:31 +04 (Asia/Baku)  
**Engine:** qosa-research-0.5.3; research engine source blob SHA: 82e5bd544a57683d5b4f7812beb2d4abf80da894  
**Rules scope:** recovered qosa-1.0.0, 3 players × 9 tiles + one stock tile. This audit tests only deterministic deal generation/allocation, not branch, scoring, or strategy rules.

## Workload and method

- 100,000 deterministic seed draws, 0..99,999.
- Each deal checked for 3×9 hand sizes, one stock tile, all 28 distinct double-six tiles, and no missing/duplicate tile.
- Full allocation identity canonicalizes tile order within each player's hand but preserves seat identity and the stock tile.
- Measured stock-tile frequencies and each of the 28 shuffled positions across the fixed seed sweep.
- Cross-runtime anchor fingerprints checked for seeds 0, 1, 1,898,414,179, 3,406,020, and 4,294,967,295.

## Results

- **100,000 / 100,000 unique allocations**; duplicate allocation pairs: **0**.
- Tile-conservation failures: **0**.
- Stock-tile counts: min **3,467**, max **3,661**, expected **3,571.43** per tile. χ²(27) = **23.77952**, upper-tail p = **0.64252**.
- Across all 28 shuffled positions, position-wise χ² ranged **14.8212–43.4641**; approximate p-values ranged **0.02347–0.97187**. The smallest p-value does not pass the Bonferroni threshold 0.05/28 = 0.00179, so this fixed sweep shows no position-level anomaly surviving the 28-position correction.
- All five anchor fingerprints and aggregate counts matched between Node v22.16.0 and the V8 research harness.

## Finding and confidence

This is a useful reproducibility gate: the current 3×9 seed stream produced no duplicate full allocations in this 100k cohort, preserved the deck exactly, and reproduced the same anchor deals across runtimes. The stock/position frequency checks show no detectable anomaly in this fixed sweep.

Confidence is **high** for deterministic fingerprints and tile conservation, and **moderate/descriptive** for the frequency sanity check. This is not proof of uniformity, independence, or cryptographic quality. It adds **0 strategy deals, 0 complete rounds, and 0 hidden worlds**; it does not validate the provisional branch-unlocking or block-winner rules.

## Execution provenance

A clean GitHub clone could not resolve github.com in this runtime. The audit was executed under Node v22.16.0 using a local mirror of engine.js; git hash-object on that file exactly matched the GitHub blob SHA above. The same 100k sweep was independently replayed in the V8 research harness. This is not described as a clean-checkout repository CLI run.

## Exact next action

Run a deterministic reachable-state property audit on seeds 3,406,020..3,406,219: verify legal-action/application round trips, draw-one-then-play-or-pass stock accounting, and tile conservation across 200 3×9 trajectories. Keep this as engine validation only; do not rank strategies until physical branch reopening and blocked-round scoring are authenticated.

Machine-readable metrics: runs/2026-11-01-0055-seed-reproducibility-audit.json. Reproduction: node qosha-research/simulator/seed-reproducibility-audit.js 0 100000.
