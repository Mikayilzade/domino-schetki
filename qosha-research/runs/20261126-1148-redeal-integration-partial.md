# 2026-11-26 11:48 Asia/Baku — redeal integration partial validation

Engine qosha-research-0.5.3; recovered qosa-1.0.0; 3×9+1. Actual V8 CommonJS adapter execution of exported tests with strict scalar and canonical plain-object equality; not native Node or complete gate. Connector blob IDs (not independently byte verified):

```json
{
  "hashes": {
    "initializer-redeal-conservation-audit.js": "bd2c353a70574829d2b1a3a5e2269e5af833f092",
    "engine.js": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
    "initializer.js": "2fad29e516454580ec9a06115354e9866f3096e6",
    "redeal-full-round-audit.js": "a439b46473cac35a7d4e96bafe82136d1383f28b",
    "round-driver.js": "fbaad78865adbddde1ea6651e6a501dc0bde3203",
    "turn-kernel.js": "94657896e1f8e471ceb2e9a65d1842b6102dff18",
    "turn-dispatcher.js": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0"
  },
  "results": {
    "initializer-redeal-conservation-audit.js": {
      "passed": true,
      "seedDraws": 24,
      "uniqueAllocations": 24,
      "assertions": 2433,
      "previousWinnerInitializations": 72,
      "firstRoundRedeals": 1
    },
    "redeal-full-round-audit.js": {
      "passed": true,
      "rounds": 24,
      "transitions": 566,
      "inventorySnapshots": 590,
      "assertions": 5907
    }
  }
}
```

Initializer seeds 12000000..12000023; first-round accepted stream from 15001000 (12 accepted, retry as necessary), continuation 16001000..16001011; each test replays internally. Deterministic legal-index policy, not a strategy arm. No new matched strategy deals or hidden worlds. Historical 180,000 matched-seat rounds separate; do not sum overlapping validation cohorts. Branch unlock, block allocation and loneZero remain provisional. No strategic conclusion. Next: resolve branch-permutation fixture coverage failure and execute native full pinned gates and fingerprint replays. No live PWA or Actions changes.
