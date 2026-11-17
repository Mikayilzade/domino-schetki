# 2026-11-17 07:47 Asia/Baku — isolated opening follow-up oracle execution

- Source of truth: GitHub `main` README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator directory, and `simulator/opening-followup-option-count-oracle.js`.
- Engine reference: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`; primary mode: 3 players × 9 stones + 1 stock.
- Execution: copied the mathematical body and assertions of the GitHub self-contained oracle into temporary local Node v22.16.0 source, then executed it successfully. The copied source is not a verified full GitHub checkout; this validates only the isolated hypergeometric calculation.
- Model: starter owns 1-1; after compulsory draw, 9 other stones are sampled uniformly from 27, including 6 connectors 1-x. Exact sample-space denominator: C(27,9)=4,686,825.
- Counts for K=0..6 available 1-x connector stones: [293930, 1220940, 1744200, 1085280, 305235, 35910, 1330]; counts sum to 4,686,825; mean K=2; P(K=0)=0.06271409749670619; P(K>=2)=0.6767811898246681. All normalization and mean assertions passed.
- New finding: no new strategy advantage. This is an **execution-confirmed replication of an existing exact oracle**, not an independent new game sample; the opening immediate pass risk conditional on owning 1-1 is 6.2714% under uniform deal and draw, irrespective of unresolved four-branch semantics.
- Confidence: high for the exact combinatorial identity; none for gameplay engine validation. No claim about opponent strategies, minus outcomes, or block scoring.
- New gameplay deals: 0; seed set: none (exact enumeration); strategies: none; win/first-place, remainder, length, blocks, −10/−20/−30/−40, doubles-at-finish, branch effects, regret: not measured. Full gameplay gate: 0/17 executed; hidden-world gate: 0/4 executed. Historical 180,000 matched-seat rounds are a separate legacy subtotal, not an all-time total.
- Blocker: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still failed with `Could not resolve host: github.com` in the executable shell; GitHub connector reads and writes remain available.
- Exact next action: reconstruct a complete research-only executable simulator checkout via connector or restored DNS; run checkout preflight, all 17 gameplay suites, four hidden-world suites, and fingerprint replays; archive actual JSON and timings before matched-seed strategy comparisons.
- Scope: this checkpoint file only; no live scoreboard/PWA files or GitHub Actions changed.
