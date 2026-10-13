# Multi-choice pass vs cross-validated win — 2026-10-13T06:48:03 +04:00

- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3×9. Exact hidden-world enumeration, uniform allocations; 3+ distinct legal single tiles.
- Deal seed scan: `2350000..2499999`, 15764 eligible deals scanned; 20 selected positions; 226 exact hidden allocations; 3090 candidate continuations; 0 unresolved.
- Strategies: immediate next-opponent pass probability (exact hypergeometric), max removed pips, and twofold cross-validated finish-first under closed-branch-control / min-hand-pips / fast-doubles continuation.
- V8 CommonJS deterministic self-test: {"passed":true,"seeds":[2350361,2351000],"worlds":25}; exact pass forecasts verified against enumerated worlds for every candidate; source state immutable. Node CLI not executed.
- CV win minus pass-max win (position-weighted, percentage points): closed-branch-control 6.67; min-hand-pips 6.33; fast-doubles -0.33.
- Pass-max minus pip-max win (position-weighted, percentage points): closed-branch-control 10.98; min-hand-pips 17.48; fast-doubles 3.50.
- Confidence: exploratory 95% position-normal intervals in linked JSON; small training folds, first-eligible pattern selection, assumed branch semantics, no block winner; no human strategy claim unless intervals and independent controls justify.
- Prior pass history is NOT reconstructed: `consecutivePasses` is only a current streak and cannot condition the hidden-world posterior. This checkpoint does not claim history-conditioned Monte Carlo.
- New full strategy rounds: 0; validated historical-in-repository full rounds: 180,000 (chat-only 4,000 separate).
- Next: reproduce on non-pattern 3+ choice states and add explicit observed pass history to hidden-world filtering, preserving fixed visible state.
- Data: `runs/2026-10-13-0646-multichoice-pass-win.json`; code: `simulator/multi-choice-pass-win-runner.js`.
