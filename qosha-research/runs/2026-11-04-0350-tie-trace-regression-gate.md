# 2026-11-04 03:50 Asia/Baku — tie-trace regression gate

- Engine: qosha-research-0.5.3; recovered rules: qosa-1.0.0 (3 players × 9 stones). Active PWA v16 score-entry overlay is implementation evidence only.
- New deals: **0**. Seeds in existing replay cohorts: accepted 1,000 each from 17,000,000 / 18,000,000 / 19,000,000 / 20,000,000; do not count these as new or merge with historical baseline.
- Policies: deterministic seed/turn/seat hash legal-action selection, not a competitive strategy comparison. Six score-entry permutations per finished round.
- Work: added `simulator/pwa-v16-eleven-tie-traces-regression.js`. Fast fixtures assert sequential bust, 1.5/1.5 ties, order-dependent ranking, pending nonzero events, skipped zeros, and score floor. `--full` additionally asserts four cohort census and all six arms for each tie boundary (expected 11 unique boundaries / 30 tie arms / 66 recorded arms).
- Verification: source-level review only. **Node regression not executed**: local checkout cannot reach github.com due to DNS. Do not mark the 66 traces validated or claim a new strategy result.
- Key finding: the previously observed tie effect has a precise executable regression contract, but no new empirical finding is established.
- Confidence: high in fixture intent, unverified in runtime. The finish-to-score mapping remains provisional; block scoring and physical tie rule remain unresolved. PWA is read-only and was not changed.
- Next exact action: execute `node qosha-research/simulator/pwa-v16-eleven-tie-traces-regression.js` and the same command with `--full` in a Node checkout, fix any failures, then persist actual trace JSON. Only afterward resume block/branch validation and matched-seed strategy regret.
