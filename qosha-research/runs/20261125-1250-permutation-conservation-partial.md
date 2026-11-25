# 2026-11-25 12:50 Asia/Baku — branch permutation and conservation partial execution

Engine qosha-research-0.5.3; recovered qosa-1.0.0, primary 3×9+1. Exported suites executed in V8 CommonJS adapter (strict equality and recursive plain-object/array equality), pinned commit aaf0a4dea5ca818ffaab47ed355411885121ee76; not native Node or full gate. Connector blob IDs, not independently byte-hashed:

```json
{
  "branch-permutation-regression": "c88e3d2c22779bba545a01739081760227f6234f",
  "round-conservation-regression": "ece052c9bb756c168291c99439494c85b2e60bf5",
  "engine": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
  "initializer": "2fad29e516454580ec9a06115354e9866f3096e6",
  "round-driver": "fbaad78865adbddde1ea6651e6a501dc0bde3203",
  "turn-dispatcher": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0",
  "turn-kernel": "94657896e1f8e471ceb2e9a65d1842b6102dff18"
}
```

Actual results:

```json
{
  "branch-permutation-regression": {
    "error": "Error: fixture does not cover single",
    "stack": "Error: fixture does not cover single\n    at fail (exec_main.mjs:1:468)\n    at Object.ok (exec_main.mjs:1:919)\n    at check (eval at req (exec_main.mjs:1:1090), <anonymous>:29:36)\n    at Object.run (eval at req (exec_main.mjs:1:1090), <anonymous>:76:10)\n    at exec_main.mjs:1:1266",
    "assertions": 2316
  },
  "round-conservation-regression": {
    "passed": true,
    "stockFixtures": 3,
    "engine": "qosha-research-0.5.3",
    "seeds": [
      21000000,
      21000999
    ],
    "deals": 1000,
    "blocks": 62,
    "meanTurns": 23.566,
    "assertions": 498542
  }
}
```

Seed range 21000000..21000999 for conservation, deterministic seeded legal-action selection; permutation fixtures constructed. No matched strategy comparisons, hidden worlds or regret estimates. Branch unlock, block allocation and loneZero remain provisional. Historical 180,000 matched-seat rounds separate. Conservation seed overlap with earlier smoke not yet audited; do not sum as unique deals. No reliable new strategy conclusion. Next: initializer-redeal-conservation-audit-test and redeal-full-round-audit-test, then native complete pinned checkout and both gates. No live PWA or Actions changes.
