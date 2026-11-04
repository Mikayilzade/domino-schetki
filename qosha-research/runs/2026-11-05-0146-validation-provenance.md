# Validation provenance checkpoint — 2026-11-05 01:46 Asia/Baku

- Engine/rules: `qosha-research-0.5.3` / recovered `qosa-1.0.0`, 3 players × 9 stones; branch and block allocation assumptions provisional.
- New completed deals: **0**. Seeds: none executed. Strategies: none (validation only).
- Change: aggregate `simulator/validation-gate.js` now includes `executedAt` (UTC ISO), `nodeVersion`, and a SHA-256 of each suite's actual source file in the per-suite JSON. The existing report SHA-256 now incorporates these fingerprints, making it possible to detect changed test code between purportedly identical validation runs.
- Planned metrics (not measured): 8 suites, 1,000 deterministic conservation deals with seeds `21000000..21000999`; 98 pure minus combinations, 7,609 non-double/mixed cases, 11,211 score-floor cases; 96 branch permutations. Actual passes: **unverified**.
- New finding: validation artifacts previously lacked executable-source fingerprints and runtime metadata. This is a reproducibility improvement, **not** evidence that the tests pass or that any strategy is stronger.
- Confidence/limitations: high for the source change; no test execution. The local Node runtime is installed, but `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` fails with `Could not resolve host: github.com`, preventing checkout. GitHub connector read/write works.
- Cumulative: no additional strategy rounds credited; earlier persisted strategy total 180,000 matched-seat rounds remains separate from historical 4,000 tie-replay outcomes.
- Exact next action: obtain an executable checkout, run `node qosha-research/simulator/validation-gate.js > validation.json`, save the JSON and inspect every suite's exit/coverage and SHA; repair failures before fresh matched-seed strategy rollouts. No live scoreboard/PWA files changed.
- Code commit: https://github.com/Mikayilzade/domino-schetki/commit/0b749f5d77783f63aa20a5a8614b16ead106767d
