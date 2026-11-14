# Qoşa açdı research — current status

Last checkpoint: 2026-11-11 22:50 Asia/Baku. See latest dated checkpoint below; no full validation gate has passed.

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

## 2026-11-11 17:53 Asia/Baku — validation evidence audit

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-gate.js, hidden-world-validation-gate.js and validation-fingerprint-replay-test.js; simulator directory inspected through GitHub connector.
- Engine/rules: qosha-research-0.5.3 / recovered qosa-1.0.0, primary 3 players × 9 stones; branch opening, block winner and loneZero interpretation remain provisional.
- Static finding: gameplay validation gate defines 17 suites and hidden-world allocation gate defines four, both fail closed on checkout preflight; the gameplay replay wrapper budgets 120s preflight + 17×120s suites + 60s overhead. Source inspection cannot establish whether any suite passes. The README's latest-checkpoint date (Nov 6) and STATUS top-line date (Nov 7) are stale; use dated entries as authoritative until reconciled.
- This run: **0 new strategy deals**, **0 sampled hidden worlds**, **no seed range**, **no strategy policies executed**. **0/17 gameplay suites and 0/4 allocation suites executed**. Win/first-place, mean/median pips, round length, blocks, minus frequencies, doubles, branch effects and decision regret not measured. Historical 180,000 matched-seat rounds remain a separate historical subtotal, not the all-time total.
- New reliable strategic finding: **none**. Confidence high for static gate definitions and low/none for executable validation; this checkpoint does not claim a green engine or new sample statistics.
- Exact next action: reconstruct a complete research-only executable checkout using GitHub connector files or restored shell DNS; run validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js and both fingerprint replay tests; save raw JSON outputs, fix failures, then compare backed versus unbacked K>=2/B=1 branch openings on matched hidden worlds under documented provisional assumptions.
- Scope: only qosha-research/STATUS.md updated; no live PWA files or GitHub Actions changed.


## 2026-11-11 22:50 Asia/Baku — executable access recheck and status reconciliation

- Source of truth read this run: `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `STATUS.md`, `simulator/validation-gate.js`, `validation-fingerprint-replay-test.js`, and `validation-checkout-preflight.js`. Engine reference `qosha-research-0.5.3`, recovered rules `qosa-1.0.0`; primary 3 players × 9 tiles; branch/block/loneZero semantics provisional.
- Executable shell `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` retried and failed with `Could not resolve host: github.com`. GitHub connector read access succeeded. No runnable complete checkout, no full gate execution. This checkpoint corrects the stale STATUS top-line date; it does not claim new code validation.
- New strategy deals **0**, hidden worlds **0**, seed set **none**, strategies **none**. Gameplay suites **0/17 executed**; hidden-world suites **0/4 executed**. Win/first-place, mean/median remainder, round length, block rate, minus frequencies, double ownership, branch-opening effects, and regret **not measured**. Historical **180,000** matched-seat rounds remain a separate historical subtotal, not an all-time cumulative count.
- Finding: no new reliable strategy conclusion. Source inspection confirms fail-closed preflight and a two-pass fingerprint replay wrapper, but no test pass can be inferred from authored assertions. Confidence high for DNS observation, none for runtime/strategic validation.
- Exact next action: restore executable checkout access **or reconstruct the entire research-only simulator source tree from GitHub connector files**, run preflight, both validation gates and both fingerprint replays, archive raw JSON and timings, repair any failures, then resume matched-seed K>=2/B=1 backed-versus-unbacked opening comparisons under explicitly provisional assumptions. No scoreboard/PWA files or GitHub Actions changed.


## 2026-11-13 01:53 Asia/Baku — independent first-round redeal oracle

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, and GitHub simulator directory. Engine reference `qosha-research-0.5.3`; rules `qosa-1.0.0`; primary 3×9+1.
- Executable checkout remains blocked: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` returned `Could not resolve host: github.com`. GitHub connector read/write works.
- New independent self-contained oracle: `simulator/opening-redeal-exact-oracle.js`. Exact 28-position calculation, independently executed in local Node with assertions: first-round 1-1 in stock 1/28 (3.5714286%); accepted opening 27/28; expected initial shuffle attempts 28/27 (1.037037); at least two consecutive first-round redeals 1/784 (0.127551%). Assumes independent uniform reshuffles. This oracle's identical mathematical assertions ran locally before persistence; the GitHub file itself was not run from a checkout.
- Important scope: first round only. In subsequent rounds, stock 1-1 is claimed by previous winner rather than forcing redeal. This is a correctness sanity check for initializer sampling, not a new strategy advantage.
- New gameplay deals: **0**; seed range: none (exact enumeration); strategies: none. Gameplay validation gate **0/17 executed**, hidden-world gate **0/4 executed**; no win, remainder, round length, block, minus, branch, double, or regret metrics measured. Historical 180,000 matched-seat strategy rounds remain separate.
- Confidence: exact under stated uniform-shuffle assumption; none for full-engine runtime validation. Branch unlock, block scoring and loneZero remain provisional.
- Exact next action: obtain executable research-only checkout or reconstruct complete dependency tree from connector files, run `validation-checkout-preflight.js`, `validation-gate.js`, `hidden-world-validation-gate.js` and fingerprint replays, archive actual JSON and fix failures before matched-seed strategy comparisons. No PWA or Actions changed.


## 2026-11-13 20:54 Asia/Baku — executable checkout blocker reconfirmed; no validation credited

- Read current GitHub source-of-truth README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator directory, conditional-hidden-worlds.js and its property test. Engine reference `qosha-research-0.5.3`, recovered `qosa-1.0.0`; primary 3×9+1; branch unlock, block scoring and loneZero interpretation still provisional.
- Retried `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` from Node v22.16.0-capable executable shell: `Could not resolve host: github.com`. GitHub connector can read and write individual source files but does not provide a runnable checkout. This is a retrieval failure, **not** a failed gameplay test.
- Rechecked the conditional sampler's exceptional seed handling and its committed property assertions: zero-premix seed 1640531527 is routed to a distinct Mulberry32 stream and the previously colliding seed 2804951790 has a regression assertion. These checks are **source inspection only**; no property suite was executed this pass.
- This checkpoint: **0 new gameplay deals**, **0 hidden-world allocations**, **0 rollouts**; game seed set **none**; strategies **none**. Gameplay suites **0/17 executed**; hidden-world suites **0/4 executed**. Win/first-place, mean/median remainder, round length, block, minus frequencies, doubles, branch-opening effects and regret **not measured**. Historical 180,000 matched-seat rounds remain separate, not an all-time total.
- New reliable strategy finding: **none**. Confidence high for observed DNS failure and inspected source state; no claim of engine validation. Exact next action: retrieve a complete research-only simulator tree using a network-enabled executable checkout or a verified connector-file reconstruction; execute sampler property test, preflight, both validation gates and fingerprint replays, archive real JSON and timings, repair failures, then resume matched-seed strategy experiments. No PWA files or Actions changed.


## 2026-11-13 23:45 Asia/Baku — runtime retrieval recheck

- GitHub source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and opening-redeal-exact-oracle.js. Engine reference qosha-research-0.5.3; recovered rules qosa-1.0.0; primary 3×9+1. Branch, block and loneZero semantics remain provisional.
- Direct executable checkout retried with `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD`; it failed with `Could not resolve host: github.com`. Connector source reads succeeded. No complete checkout was reconstructed, and no validation was executed.
- New gameplay deals: **0**; hidden worlds: **0**; seed range: none; strategies: none. Gameplay validation **0/17 suites executed this pass**, hidden-world validation **0/4**. Win/first-place, mean/median pips, round length, block rate, −10/−20/−30/−40, double value, branch effects and decision regret were not measured. Historical 180,000 matched-seat rounds remain a separate subtotal.
- Finding: **no new reliable strategic result**. Independent redeal oracle is already persisted; no duplicate oracle or unverified metric was added. Confidence high for DNS failure and static source read, none for full-engine validation.
- Exact next action: obtain executable checkout or verified complete connector-based reconstruction, run preflight plus both validation gates and fingerprint replays, archive real JSON and timings, repair failures, then resume matched-seed strategy comparisons. No live scoreboard/PWA files or GitHub Actions changed.


## 2026-11-14 05:54 Asia/Baku — dependency-closure audit and retrieval blocker

- Source-of-truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator/validation-checkout-preflight.js and opening-redeal-exact-oracle.js. Engine reference qosha-research-0.5.3; recovered qosa-1.0.0, primary 3×9+1; branch/block/loneZero still provisional.
- Executable environment: Node v22.16.0 available, but git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD failed with `Could not resolve host: github.com`. GitHub connector source reads succeeded. No runnable full checkout; no gate executions.
- New static observation: the preflight does not merely inspect 17 suite entrypoints. It recursively parses every simulator JS and JSON file, rejects symlinks, and walks literal relative CommonJS dependency closure for every JS file, including otherwise unreferenced utilities. Consequently, reconstructing just the 17 suites and their direct imports cannot satisfy the full checkout gate; a complete research simulator tree (plus four Markdown contracts) is required. This is a source-contract observation, not validation success.
- This pass: 0 gameplay deals, 0 hidden-world samples, seed set none, strategies none; 0/17 gameplay and 0/4 hidden-world suites executed. Win rate, remainder, round length, block, minus, double, branch and regret metrics not measured. Historical 180,000 matched-seat rounds remain separate, not an all-time total. No new reliable strategic finding.
- Confidence: high for source inspection and observed DNS failure; none for engine validation. Exact next action: acquire a complete research-only simulator tree (including unreferenced JS/JSON utilities) through a working executable checkout or verified connector reconstruction, run preflight and both gates/fingerprint replays, archive raw reports, fix failures, then resume matched-seed strategy trials. No PWA files or Actions changed.


## 2026-11-14 22:48 Asia/Baku — preflight completeness contract audit

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator/validation-checkout-preflight.js. Engine reference qosha-research-0.5.3, recovered qosa-1.0.0, primary 3×9+1; branch unlock, block allocation and loneZero=10 provisional.
- Executable git ls-remote failed: Could not resolve host: github.com. No complete checkout, no test execution.
- New source-level validation finding: the current preflight recursively checks syntax and literal require closure for **files present**, checks named required files and a minimum count of 17, but does **not** compare the simulator directory against a pinned complete file inventory or content-hash manifest. Thus a partial tree containing all required entrypoints and dependencies can potentially pass preflight while omitting unrelated simulator utilities. This is a static coverage limitation, not an observed false pass; the prior statement that preflight guarantees all 387 files is too strong.
- This checkpoint: 0 new deals, 0 hidden worlds, 0 rollouts; no seeds or strategies. Gameplay suites 0/17 executed, hidden-world suites 0/4. Win, pips, blocks, minus, doubles, branch and regret metrics not measured. Historical 180,000 matched-seat rounds remain separate. No new reliable strategy finding.
- Confidence high for source-level coverage observation and DNS failure, none for engine correctness. Exact next action: enforce a pinned research-only inventory/hash check in preflight (with an explicit policy for new files), reconstruct full checkout, run preflight and both gates/fingerprint replays, archive actual JSON and timings, then resume matched-seed strategy tests. No PWA files or Actions changed.
