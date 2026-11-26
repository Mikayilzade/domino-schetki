# 2026-11-26 14:46 Asia/Baku — redeal suite recheck

Engine qosha-research-0.5.3; recovered qosa-1.0.0, 3×9+1. Connector source execution in V8 CommonJS adapter; not native Node, no full checkout or independent byte hash. Source blob IDs and actual results:

```json
{
  "sha": {
    "engine": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
    "initializer": "2fad29e516454580ec9a06115354e9866f3096e6",
    "round-driver": "fbaad78865adbddde1ea6651e6a501dc0bde3203",
    "turn-kernel": "94657896e1f8e471ceb2e9a65d1842b6102dff18",
    "turn-dispatcher": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0",
    "initializer-redeal-conservation-audit": "bd2c353a70574829d2b1a3a5e2269e5af833f092",
    "redeal-full-round-audit": "a439b46473cac35a7d4e96bafe82136d1383f28b"
  },
  "results": {
    "initializer-redeal-conservation-audit": {
      "passed": true,
      "seedDraws": 24,
      "uniqueAllocations": 24,
      "assertions": 2433,
      "previousWinnerInitializations": 72,
      "firstRoundRedeals": 1
    },
    "redeal-full-round-audit": {
      "passed": true,
      "rounds": 24,
      "transitions": 566,
      "inventorySnapshots": 590,
      "assertions": 5907
    }
  }
}
```

Seeds 12000000..12000023 initializer; first-round attempts from 15001000 (12 accepted), continuation 16001000..16001011. Deterministic legal-action hash policy, replayed by test. These are regression replays, not new unique strategy deals. No hidden worlds or strategy metrics; historical 180,000 separate. Branch unlock, block allocation and loneZero provisional. Earlier partial permutation report recorded a failure; native gates remain unverified. Next: inspect current permutation fixture and execute corrected coverage, then complete native gates before promoting strategy results. No live files or Actions modified.
