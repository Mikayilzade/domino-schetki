# Qoşa açdı research — current status

Last checkpoint: 2026-11-07 15:53 Asia/Baku.

## Validation gate (authoritative current state)

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3 players × 9 stones; branch semantics remain provisional.
- **17/17 validation suite entrypoint files are present in the GitHub `main` simulator directory** (348 directory entries, inspected through GitHub contents API on 2026-11-07). This is a *static presence check*, not execution.
- **0/17 suites executed in this checkpoint**; no green validation evidence. Executable shell still cannot resolve `github.com` (`git ls-remote` DNS failure). Connector access to GitHub source does not supply a local executable checkout.
- Validation commands once checkout is available: `node qosha-research/simulator/validation-fingerprint-replay-test.js` (two complete gate executions), then `node qosha-research/simulator/validation-gate.js`. Archive the actual JSON outputs and inspect failures before any new strategy claims.
- New strategy deals this checkpoint: **0**. Seed set: none. Strategies: none. Win rate, remaining pips, blocks, minuses and regret: not measured this checkpoint. Historical 180,000 matched-seat rounds are a separate legacy subtotal, **not** an all-time cumulative count.
- New finding: all 17 gate suite paths are present, narrowing the immediate blocker to *executable source retrieval / runtime validation*, rather than absent suite entrypoints. Confidence: high for repository listing; none for runtime correctness.
- Exact next action: obtain executable checkout from GitHub, run both validation commands, save their reports in `qosha-research/runs/`, repair any failures, then resume matched-seed comparisons. Do not change PWA files or create GitHub Actions.

## Historical status (not a current validation claim)

2026-11-03 event-level six-order replay of an existing 20M cohort: 1,000 accepted outcomes, 1,035 attempts, 35 redeals, 942 finishes and 58 unscored blocks; 76 completed matches across six orders. The earlier 26 dependent rank changes at gap 11–20 came from only three unique boundaries (560, 801, 856). This was a replay, not new independent deals. Provisional terminal-pip scoring and unresolved physical branch/block rules still limit interpretation.

## 2026-11-09 07:51 Asia/Baku — validation runtime budget audit

- Engine/rules: `qosha-research-0.5.3` / recovered `qosa-1.0.0` (branch semantics provisional); 3 × 9 primary.
- This pass: 0 new deals; no seed set; no strategies; win/pips/block/minus/regret metrics not measured. Historical 180,000 matched-seat rounds remain a separate legacy subtotal, not the all-time total.
- GitHub source audit: `validation-gate.js` runs 17 suites with a **120-second per-suite timeout**, while `validation-fingerprint-replay-test.js` runs the entire gate twice with a **600-second timeout per gate**. Therefore a slow gate can be killed by the replay wrapper before it returns its complete JSON, even when individual suites are within their own timeouts. This is a **static timeout-budget risk**, not an observed failure or an assertion that the gate needs >600 seconds.
- Local executable checkout attempt: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`. GitHub connector reads/writes still work. **0/17 suites executed in this pass; no green validation evidence.**
- Confidence: high for source timeout constants and DNS failure; no gameplay-strategy conclusion.
- Exact next action: obtain executable checkout; run `node qosha-research/simulator/validation-gate.js` first and record wall-clock duration + JSON, then run fingerprint replay with an explicitly sufficient timeout or remove its outer timeout in favor of suite-level timeouts; archive outputs and fix failures before strategy simulations. Do not change live PWA or create GitHub Actions.

## 2026-11-09 08:49 Asia/Baku — replay timeout guard fixed

- Engine/rules: `qosha-research-0.5.3` / recovered `qosa-1.0.0`, 3×9 primary; branch and block semantics provisional.
- Changed only `simulator/validation-fingerprint-replay-test.js`: outer per-gate timeout now `17 × 120,000 + 60,000 = 2,100,000 ms` rather than 600,000 ms. This covers all 17 sequential suite timeouts plus 60s overhead; each suite still has its own 120s limit. The replay runs the gate twice. Static code change only, **not executed**.
- New deals: **0**; seed set: none; strategies: none; win/remaining-pips/block/minus/regret not measured. **0/17** validation suites executed in this checkpoint. Historical 180,000 matched-seat rounds remain separate, not an all-time total.
- Finding: a previously identified premature outer-timeout risk has been removed in source. Confidence: high for timeout arithmetic and source change; none for runtime correctness or strategy.
- Limitation: executable checkout still unavailable in this runtime; GitHub connector provides source access, not local execution. No validation report was produced.
- Exact next action: obtain executable checkout; run `node qosha-research/simulator/validation-gate.js`, archive JSON and wall-clock time, then run `node qosha-research/simulator/validation-fingerprint-replay-test.js`, archive output and repair failures before matched-seed simulations. Do not modify live PWA or create GitHub Actions.

## 2026-11-09 19:00 Asia/Baku — isolated opening oracle execution

- Source-of-truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, opening-k-b-joint-regression.js and validation-gate.js. Rules recovered `qosa-1.0.0`, engine reference `qosha-research-0.5.3`; branch/block/loneZero remain provisional.
- Executable shell still cannot resolve github.com (git ls-remote DNS failure). However Node v22.16.0 is available. The exact contents of the self-contained GitHub `simulator/opening-k-b-joint-regression.js` were copied into a temporary local file and executed with Node; its assertions **passed**. This is an isolated source-copy execution, **not** an executable GitHub checkout and **not** a full-engine gate.
- Oracle checked 28 joint K/B cells, integer mass 4,686,825 / 4,686,825, K>=2 probability 0.6767811898246681, K>=2 and B=1 probability 0.3175433262389784, B>=2 probability 0.09652376608898348, and B>=2 given K>=2 probability 0.14262182155799813. This independently confirms the previously authored oracle runs without assertion failure; it does not supply a new strategic advantage.
- New gameplay deals **0**, seed set none, strategies none; win/first-place, remaining pips, round length, block, minus and regret **not measured**. Full-engine validation **0/17 suites executed**. Historical 180,000 matched-seat rounds remain a separate legacy subtotal, not the all-time cumulative total.
- Confidence: high for isolated exact combinatorics under uniform shuffle/independent previous-winner assumptions; none for full-engine validation. **Exact next action:** reconstruct an executable research-only checkout via connector-fetched files or restore GitHub DNS, run all 17 suites via validation-gate.js, archive the real JSON and repair failures before matched-seed K>=2/B=1 comparisons. No PWA files or Actions changed.

## 2026-11-11 12:53 Asia/Baku — gate contract audit and execution blocker

- Read GitHub source-of-truth README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, gameplay validation gate and hidden-world validation gate. Engine reference `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3×9+1. Branch, block and loneZero interpretations remain provisional.
- Executable environment check: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`. GitHub connector source reads work. This run did not reconstruct a complete executable tree, and no full-gate tests were executed.
- Source audit: gameplay gate declares 17 distinct named suites and requires checkout preflight; hidden-world gate declares four separate suites and also requires checkout preflight. Both bind JS/JSON simulator source hashes and README/RULES/EXPERIMENTS contract hashes. Source review alone is not a pass result.
- New strategy deals: **0**; hidden worlds: **0**; executed seed set: none; strategies: none. Gameplay suites executed: **0/17**; hidden-world suites: **0/4**. No fresh first-place, remainder, length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds remain separate, not an all-time cumulative total.
- Finding: no new reliable strategic finding. Confidence high for gate source structure and DNS failure, none for runtime correctness. No live PWA files or Actions changed.
- Exact next action: reconstruct the research-only executable tree via connector-fetched source files if shell DNS remains unavailable, run preflight, both gates and both fingerprint replay tests, archive real JSON, repair failures; only then run paired K>=2/B=1 backed-vs-unbacked opening experiments on matched seeds under explicitly provisional branch semantics.
