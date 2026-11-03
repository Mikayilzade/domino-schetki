# Six-arm tie trace completeness fix — 2026-11-04T01:48:18+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0 3×9, PWA v16 score-event adapter. Branch semantics and terminal-pip-plus-minus mapping remain provisional; blocks unscored.
- **Deals/seeds:** 0 new accepted deals. Reproducer targets four existing separate 1,000-outcome cohorts starting at 17,000,000, 18,000,000, 19,000,000, 20,000,000; 4,000 previously accepted outcomes total, not rerun in this checkpoint.
- **Strategies:** deterministic seed/turn/player hash legal-action policy; six matched manual-entry orders, not a tactical strategy comparison.
- **Change:** updated `simulator/pwa-v16-eleven-tie-traces.js` to retain **all six arms** at any boundary where at least one order produces a draw. Previously it retained only the draw arms, preventing direct draw-versus-win comparisons. New per-arm `skippedZero` field and exact assertion against the adapter's zero-skip census. Tie-arm count now filters `isDraw` rather than counting all arms. Output schema bumped to v2.
- **Expected comparison target, not a new measurement:** 11 unique tie-containing boundaries and 30 tied arms across existing cohorts. Complete traces should contain 66 arms (including 36 non-draw comparison arms) if the prior audit is reproduced.
- **Confidence:** static source-level correction saved; full Node execution and 66-arm trace output **not verified this run**. Do not promote expected figures as freshly observed results. No new gameplay strategy finding.
- **Next action:** run `node qosha-research/simulator/pwa-v16-eleven-tie-traces.js` from a checkout, inspect any assertion failures, persist machine-readable traces and verify all 11×6 arm records. Then return to branch/block rules and paired decision-regret rollouts.
- **Source:** [runner](simulator/pwa-v16-eleven-tie-traces.js).
