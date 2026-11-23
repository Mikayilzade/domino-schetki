# Exact opening forced-pass double enrichment — 2026-11-23 13:52 Asia/Baku

- Rules: recovered `qosa-1.0.0` opening; reference full engine `qosha-research-0.5.3` (NOT executed).
- Mode: 3 players × 9 tiles, one stock tile, starter owns 1-1 and draws before required continuation.
- Deals: **0 gameplay simulations**; deterministic exact enumeration over 8-tile starter hands and mandatory stock draw. Seeds: none. Strategies: none.
- Universe after known 1-1: six ordinary 1-x connectors, six other doubles, fifteen other tiles. A forced opening pass requires zero connectors in eight initial tiles and zero connector in the stock draw.
- Exact probability of forced pass: `C(21,9)/C(27,9) = 0.06271409749670619`.
- **New finding:** expected count of other doubles among the starter's *eight pre-draw tiles* is `16/9 = 1.77777778` unconditionally, but `16/7 = 2.28571429` conditioned on forced pass: **28.57% enrichment**. Posterior distribution K=0..6: 3.1623%, 18.9739%, 36.8937%, 29.5150%, 10.0619%, 1.3416%, 0.0516%. This is a selection effect (nonconnector enrichment), NOT evidence that holding doubles causes passes or improves play.
- Validation: self-contained Node v22.16.0 script `simulator/opening-pass-double-enrichment-20261123.js` executed locally, assertions passed; independent Python combinatorial calculation matched the mean and distribution. No full engine validation inferred.
- Confidence: high for exact uniform-deal opening combinatorics; no strategic recommendation. Branch unlock, block allocation and loneZero=10 still provisional.
- Current blocked full-game tests: 0/17 gameplay suites, 0/4 hidden-world suites; new gameplay deals 0, hidden worlds 0, rollouts 0. Win rate, mean/median remainder, round length, block/minus frequencies, branch effect, regret: not measured. Historical 180,000 matched-seat rounds remain separate legacy evidence.
- Fresh network check: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`; connector reads/writes work, executable complete checkout still absent.
- **Exact next action:** obtain complete single-commit SHA-verified research-only checkout, run strict manifest audit and synthetic regression, preflight, 17 gameplay + 4 hidden-world suites and fingerprint replays, archive actual JSON, then paired-seed strategy comparisons. Do not change live PWA or create Actions.
