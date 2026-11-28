# 2026-11-28 06:45 Asia/Baku — hidden-world empirical oracle replay

Engine qosha-research-0.5.3; recovered qosa-1.0.0. Isolated V8 CommonJS adapter, fetched GitHub sources; strict equality and JSON structural equality assertion shim. Native Node checkout remains blocked by DNS; full gates not green. No gameplay deals or strategy rollouts; 12,000 hidden allocations, existing deterministic fixture seeds 24000000..24011999, not independent new cohort. Strategies none. Branch unlock, block allocation and loneZero remain provisional. No gameplay metrics or new strategy conclusion. Historical 180,000 matched-seat rounds separate.

Assertion calls: 84008

```json
{
  "schema": "qosha-hidden-world-empirical-oracle/v1",
  "passed": true,
  "rules": "recovered qosa-1.0.0 opening allocation only",
  "engine": "qosha-research-0.5.3",
  "seedStart": 24000000,
  "seedEnd": 24011999,
  "worlds": 12000,
  "strategies": [],
  "nextSeatCounts": {
    "zero": 2891,
    "one": 6325,
    "two": 2784
  },
  "oppositeSeatCounts": {
    "zero": 2784,
    "one": 6325,
    "two": 2891
  },
  "oppositeObserved": [
    0.232,
    0.5270833333333333,
    0.24091666666666667
  ],
  "observed": [
    0.24091666666666667,
    0.5270833333333333,
    0.232
  ],
  "expected": [
    0.23529411764705882,
    0.5294117647058824,
    0.23529411764705882
  ],
  "maxAbsoluteDeviation": 0.005622549019607848,
  "limitation": "Synthetic visible hand; unconditional uniform hidden worlds, no pass history or opponent choice likelihood; no gameplay rounds."
}
```

Source blobs:
- hidden-world-empirical-oracle-test.js 6e3ba12a4238ed7a7bb525f0ac9ac963cd8edc32
- engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894
- hidden-world.js 6d4d2c3d693a3d9b66a3d21c7f0d65474292a3e2
- round-driver.js fbaad78865adbddde1ea6651e6a501dc0bde3203
- turn-kernel.js 94657896e1f8e471ceb2e9a65d1842b6102dff18
- turn-dispatcher.js 55b0bcf3f1653c64b4e06bc95d7e917a480562a0
- decision-regret.js decf4ae09705176a2ea4eb9759457622a2a57294
- strategy-runner.js b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f
- initializer.js 2fad29e516454580ec9a06115354e9866f3096e6

Next: native complete pinned checkout and gates; do not treat this replay as native gate validation.
