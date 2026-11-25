# 2026-11-25 15:51 Asia/Baku — hidden-world partial validation

Pinned source b5b362e7b9c0541b73aefd2c7e797ea2df22587f; engine qosha-research-0.5.3, recovered qosa-1.0.0. Executed three standalone suites in V8 CommonJS adapter with strict equality, recursive array/object and Set equality, regex throws; not native Node, not full gate. Fourth enumeration suite requires native crypto and was not executed. Source closure fetched from pinned GitHub commit; no independent byte hash.

```json
{
  "hidden-world-test.js": {
    "assertions": 66,
    "stdout": [
      "fixed-visible hidden-world regression: ok; worlds=25 candidates=8"
    ],
    "passed": true
  },
  "hidden-world-seat-stock-regression-test.js": {
    "assertions": 3303,
    "stdout": [
      "{\"schema\":\"qosha-hidden-world-seat-stock-regression/v1\",\"status\":\"passed\",\"checks\":300,\"seeds\":\"25000000..25000099\",\"focalSeats\":[0,1,2],\"rules\":\"synthetic 3x9+1, no played tiles\",\"limitation\":\"No gameplay or opponent-history conditioning; standalone regression only.\"}"
    ],
    "passed": true
  },
  "hidden-world-empirical-oracle-test.js": {
    "assertions": 84008,
    "stdout": [
      "{\n  \"schema\": \"qosha-hidden-world-empirical-oracle/v1\",\n  \"passed\": true,\n  \"rules\": \"recovered qosa-1.0.0 opening allocation only\",\n  \"engine\": \"qosha-research-0.5.3\",\n  \"seedStart\": 24000000,\n  \"seedEnd\": 24011999,\n  \"worlds\": 12000,\n  \"strategies\": [],\n  \"nextSeatCounts\": {\n    \"zero\": 2891,\n    \"one\": 6325,\n    \"two\": 2784\n  },\n  \"oppositeSeatCounts\": {\n    \"zero\": 2784,\n    \"one\": 6325,\n    \"two\": 2891\n  },\n  \"oppositeObserved\": [\n    0.232,\n    0.5270833333333333,\n    0.24091666666666667\n  ],\n  \"observed\": [\n    0.24091666666666667,\n    0.5270833333333333,\n    0.232\n  ],\n  \"expected\": [\n    0.23529411764705882,\n    0.5294117647058824,\n    0.23529411764705882\n  ],\n  \"maxAbsoluteDeviation\": 0.005622549019607848,\n  \"limitation\": \"Synthetic visible hand; unconditional uniform hidden worlds, no pass history or opponent choice likelihood; no gameplay rounds.\"\n}"
    ],
    "passed": true
  }
}
```

Seeds 700..724 (25 paired hidden worlds, default closed-branch-control), 25000000..25000099 (three focal seats), 24000000..24011999 (12,000 allocation draws). Synthetic fixtures, not actual strategy deals. No new full gameplay deals or reliable strategy inference. Previous 2,024 full rounds remain validation only; legacy 180,000 separate. Branch unlock, block allocation and loneZero provisional. Next: execute exact enumeration with real SHA-256, complete native checkout and both gates/fingerprint replays before matched strategy cohorts. No live PWA or Actions changes.
