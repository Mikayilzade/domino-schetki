# 2026-11-18 11:48 Asia/Baku — hidden-world allocation smoke

- Source of truth: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js and validation-gate.js read from GitHub before changes.
- Engine/rules reference: qosha-research-0.5.3 / recovered qosa-1.0.0; primary 3 players × 9 stones; branch, block and loneZero semantics provisional.
- New standalone module: simulator/hidden-world-allocation-smoke-20261118.js; deterministic xorshift32 allocation of remaining double-six tiles after fixing known and played stones. It rejects duplicates, unknown tiles, and inconsistent hidden capacities.
- Smoke executed as equivalent pure JavaScript logic in the tool runtime (not as Node invocation of the committed file): 10,000 allocations, seeds 1..10000, fixed 9 known and 9 played tiles, hidden capacities [5,4,1]; 10,000/10,000 conserved all 28 unique tiles and capacities; deterministic replay checked; 3/3 malformed input categories rejected. 8,540 distinct first-opponent hands observed. No sampling-uniformity claim (modulo reduction can introduce bias).
- Strategies: none. New gameplay deals: 0; hidden-world allocations: 10,000 standalone smoke only. No win, remainder, round-length, block, minus, branch or regret metrics. Full gameplay validation 0/17; hidden-world gate 0/4. Historical 180,000 matched-seat rounds separate.
- Finding: a reproducible, rule-independent hidden-world allocation conservation primitive is now available; no reliable strategy finding.
- Confidence: high for directly executed JS conservation/replay assertions; limited because the committed CommonJS CLI itself has not run in a complete checkout. No full-engine validation claim.
- Limitation: shell git ls-remote failed with Could not resolve host: github.com. Full 398-file checkout not restored. Sampling currently uses modulo indexing, so replace with rejection sampling and test marginal uniformity before using this primitive for decision estimates.
- Exact next action: run committed CLI under Node once source is locally available, replace modulo-biased draw with rejection sampling, then integrate sampler into Monte Carlo validation gate and run 17+4 full suites before strategy rollouts.
- Scope: qosha-research/ only; no live PWA or GitHub Actions changed.
