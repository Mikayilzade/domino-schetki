# 2026-11-26 01:51 Asia/Baku — native deal regression checkpoint

Source of truth: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and both gates/preflight read from GitHub. Simulator tree 0ffa0670aa363f4671e635cbdf0fd574640b3d62. Engine qosha-research-0.5.3, recovered qosa-1.0.0. Branch unlocking, block allocation and loneZero remain provisional.

Reconstructed exact dependency closure for two formal suites in a temporary research-only directory. All three Git blob hashes independently matched git hash-object and tree sizes:
- engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894 (5199 bytes)
- seed-deal-regression.js 483cea1e94d7acb266b24bb67809050d68d9e811 (1536 bytes)
- five-player-deal-regression.js 71022e8bb6aa56ff3a905687109df26658cc33ca (1587 bytes)

Native Node v22.16.0, commands node seed-deal-regression.js and node five-player-deal-regression.js, both successful. Actual JSON (compact):
```json
{"schema":"qosha-seed-deal-regression/v1","passed":true,"deals":1024,"seeds":[22000000,22001023],"uniqueDeals":1024,"stockOpening":40,"strategies":[],"engine":"qosha-research-0.5.3","rules":"double-six 3x9 + one stock, branch-independent"}
{"schema":"qosha-five-player-deal-regression/v1","passed":true,"deals":1024,"seeds":[23000000,23001023],"uniqueDeals":1024,"stockOpening":119,"players":5,"handSize":5,"stockSize":3,"strategies":[],"engine":"qosha-research-0.5.3","rules":"double-six 5x5+3; shuffle partition only, no five-player opening or draw rule asserted"}
```

Finding: deterministic replay, inventory and partition checks passed on 2,048 seed draws, 1,024 unique ordered deals per mode. Stock 1-1 counts 40 and 119 respectively; not a proof of shuffle uniformity. High confidence in narrow native suite results. These are fixture replays, not new independent strategy samples. No gameplay rounds, hidden worlds or rollouts; strategies none. No win/first-place, remainder, length, block, minus, double effects or regret metrics. Historical 180,000 matched-seat rounds remain separate. Full gameplay/hidden-world gates still not executed; two formal suites passed independently this run, not through preflight. DNS still fails git ls-remote (Could not resolve host: github.com).

Next: native byte-verified four-branch-lock-kernel-test.js dependency closure, then remaining native suites, complete pinned checkout/preflight, both gates and fingerprint replays. No live PWA or Actions changes.
