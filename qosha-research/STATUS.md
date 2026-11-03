# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T15:51:25+04:00 Asia/Baku.

- Latest checkpoint: finish-only round-to-PWA score adapter integration on a deterministic independent 3×9 round stream.
- Seeds: 17,000,000–17,001,028; 1,029 attempts, 29 redeals, 1,000 accepted rounds, 1,000 unique allocations, no duplicates.
- Round outcomes: 955 finishes / 45 blocks / 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = 913/41/1/0/0.
- Adapter progression: 2,784 score events applied; 81 same-round events pending after PWA match completion; 75 matches completed; 9 score-floor hits; 75 bust events.
- Validation: 1,542 integration assertions; 505 score-floor cases; 101 100/101 boundary pairs; 40-round deterministic smoke test passed; full 1,000-round replay exact.
- Most useful finding: active PWA scoring is sequential/manual. First event reaching 101 and leaving at most two survivors ends the match; event order can change the exploded seat. Ascending seat order is only a harness convention.
- Limits: terminal-pip-plus-finisher-minus mapping remains provisional; blocks intentionally unscored; no strategy comparison or promotion; historical baseline not pooled.

Exact next action: run a matched three-order sensitivity audit over the same round-outcome stream (0-1-2, 1-2-0, 2-0-1), record applied/pending events and exploded seat, and treat differences as manual score-entry order sensitivity.

Report: qosha-research/runs/2026-11-03-1551-finish-score-match-integration.md
Runner: qosha-research/simulator/finish-score-match-roundstream.js
Tests: qosha-research/simulator/finish-score-match-integration-test.js; qosha-research/simulator/finish-score-match-roundstream-test.js
