# Redeal suite partial execution — 2026-11-27 05:46 Asia/Baku

Engine qosha-research-0.5.3 / recovered qosa-1.0.0; 3x9. README, RULES, EXPERIMENTS, STATUS and both gates fetched; RESULTS range returned empty (oversized). Executed exported tests using connector-fetched source in V8 CommonJS adapter with local strict equality/deep-object assertion shim, not native Node or full checkout. Source blob identifiers: [["initializer-redeal-conservation-audit.js","bd2c353a70574829d2b1a3a5e2269e5af833f092"],["engine.js","82e5bd544a57683d5b4f7812beb2d4abf80da894"],["initializer.js","2fad29e516454580ec9a06115354e9866f3096e6"],["redeal-full-round-audit.js","a439b46473cac35a7d4e96bafe82136d1383f28b"],["round-driver.js","fbaad78865adbddde1ea6651e6a501dc0bde3203"],["turn-kernel.js","94657896e1f8e471ceb2e9a65d1842b6102dff18"],["turn-dispatcher.js","55b0bcf3f1653c64b4e06bc95d7e917a480562a0"]].

Actual outputs:
```json
[
  {
    "n": "initializer-redeal-conservation-audit.js",
    "result": {
      "passed": true,
      "seedDraws": 24,
      "uniqueAllocations": 24,
      "assertions": 2433,
      "previousWinnerInitializations": 72,
      "firstRoundRedeals": 1
    }
  },
  {
    "n": "redeal-full-round-audit.js",
    "result": {
      "passed": true,
      "rounds": 24,
      "transitions": 566,
      "inventorySnapshots": 590,
      "assertions": 5907
    }
  }
]
```

Seeds: initializer 12000000..12000023; full-round test first-round attempts from 15001000 until 12 accepted, continuation 16001000..16001011. Both tests replay internally. Validation policy only; no new strategy deals, no win/pips/block/minus/regret estimates. Historical 180,000 matched-seat rounds separate. Native gates not executed. Branch, block allocation and loneZero provisional. Next: complete pinned native checkout and execute both gates; investigate any adapter failures before strategy runs. No PWA or Actions changes.
