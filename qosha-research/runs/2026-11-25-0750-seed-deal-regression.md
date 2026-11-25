# 2026-11-25 07:50 Asia/Baku — standalone formal seed regression

Engine qosha-research-0.5.3; recovered qosa-1.0.0, 3×9+1. Branch unlocking, block allocation and loneZero remain provisional; this test is invariant to them.

Reconstructed exact GitHub source in temporary shell; git hash-object matched simulator tree 3969f6deefabe350ac4a00a0e42119f7d1824238 for engine.js (82e5bd544a57683d5b4f7812beb2d4abf80da894) and seed-deal-regression.js (483cea1e94d7acb266b24bb67809050d68d9e811). Node v22.16.0; `node seed-deal-regression.js` exited 0. Direct git checkout still fails DNS.

Raw stdout:
```json
{"schema":"qosha-seed-deal-regression/v1","passed":true,"deals":1024,"seeds":[22000000,22001023],"uniqueDeals":1024,"stockOpening":40,"strategies":[],"engine":"qosha-research-0.5.3","rules":"double-six 3x9 + one stock, branch-independent"}
```

All 1024 seeds reproduced identical deals, exact 28-tile conservation, correct hand/stock sizes and shuffle order. This satisfies the standalone suite coverage predicate in validation-gate.js. One formal suite independently passed; full gate remains unexecuted (not green). New full gameplay rounds 0, hidden worlds 0, strategy comparisons 0; win/remainder/length/block/minus/doubles/branch/regret not measured. Previous checkpoint reported 1000 full smoke rounds, separate from 10,000 initial deals and this 1024-deal cohort; historical 180,000 legacy rounds remain separate. High confidence in narrow reproducibility, no new strategy finding.

Next: reconstruct exact dependency closure for four-branch-lock-kernel-test.js and draw-enabled-action-contract-test.js, execute standalone, then complete full checkout and gates. No live PWA or Actions changes.
