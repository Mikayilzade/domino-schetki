# 2026-11-27 14:54 Asia/Baku — repaired branch permutation regression

Engine qosha-research-0.5.3; recovered qosa-1.0.0; 3×9+1. Executed current connector-fetched exported suite in V8 CommonJS adapter with strict primitive and recursive plain-object/array equality, not native Node. Source blob IDs (connector reported, not independently byte verified):

```json
{
  "branch-permutation-regression": "71d289ebd34e08a42f893b7711bef9bc7faf94f9",
  "engine": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
  "turn-dispatcher": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0",
  "turn-kernel": "94657896e1f8e471ceb2e9a65d1842b6102dff18"
}
```

Actual output:

```json
{
  "result": {
    "passed": true,
    "engine": "qosha-research-0.5.3",
    "fixtures": 4,
    "permutations": 96,
    "actionTransitions": 480,
    "results": [
      {
        "permutations": 24,
        "actionTransitions": 96,
        "coverage": {
          "single": 4,
          "doubleSequence": 0,
          "multiDouble": 0,
          "mixedFinish": 0
        }
      },
      {
        "permutations": 24,
        "actionTransitions": 120,
        "coverage": {
          "single": 1,
          "doubleSequence": 4,
          "multiDouble": 2,
          "mixedFinish": 0
        }
      },
      {
        "permutations": 24,
        "actionTransitions": 144,
        "coverage": {
          "single": 0,
          "doubleSequence": 4,
          "multiDouble": 2,
          "mixedFinish": 2
        }
      },
      {
        "permutations": 24,
        "actionTransitions": 120,
        "coverage": {
          "single": 1,
          "doubleSequence": 4,
          "multiDouble": 2,
          "mixedFinish": 0
        }
      }
    ],
    "coverageVerified": true
  },
  "assertions": 3326
}
```

Previous fixture coverage failure no longer reproduces. No new deals, seeds, strategies, hidden worlds or rollouts; no strategy metrics. Historical 180,000 matched-seat rounds separate; native full gates not executed. Branch unlock, block allocation and loneZero remain provisional. RESULTS.md connector returned empty content; this standalone run report preserves evidence. Next: link this report from STATUS and recover complete pinned native checkout for both gates and fingerprint replays. No live PWA or Actions changes.
