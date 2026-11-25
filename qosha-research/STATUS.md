# Qoşa açdı research — current status

Last checkpoint: 2026-11-15 21:50 Asia/Baku. See latest dated checkpoint below; no full validation gate has passed.

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


## 2026-11-15 14:54 Asia/Baku — independent oracle re-execution; full gate still blocked

- Read source-of-truth README, RULES, EXPERIMENTS, RESULTS, STATUS and current preflight/gate source, plus the exact first-round redeal oracle. Engine reference `qosha-research-0.5.3`; rules `qosa-1.0.0`, primary 3×9+1; branch/block/loneZero assumptions remain provisional.
- Local Node v22.16.0 executed the GitHub oracle logic in an isolated temporary source copy; assertions passed: stock 1-1 probability 1/28, accepted first-round probability 27/28, expected shuffle attempts 28/27. This repeats an existing independent sanity check; **not** a new strategy finding or full engine validation.
- Executable git retrieval failed again with `Could not resolve host: github.com`. Full research-only checkout unavailable. **0 new gameplay deals**, **0 hidden-world samples**, seeds none, strategies none, gameplay validation **0/17 executed**, Monte Carlo validation **0/4 executed**. Win, pips, length, block, minus, doubles, branches and regret not measured. Historical 180,000 matched-seat rounds remain separate.
- Confidence: exact for first-round uniform reshuffle oracle; none for full-engine correctness. **Next action:** obtain complete simulator checkout via restored DNS or verified connector reconstruction; run pinned inventory preflight, both gates and fingerprint replays, archive actual reports and repair failures before paired-seed strategy simulations. No live PWA files or Actions changed.


## 2026-11-15 20:50 Asia/Baku — executed pinned-inventory metadata audit

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator preflight and pinned inventory. Engine reference `qosha-research-0.5.3`; recovered rules `qosa-1.0.0`; primary 3×9+1. Branch unlocking, block scoring and loneZero remain provisional.
- Independently **executed** the current preflight inventory-row regex against the full GitHub inventory text in the connector JavaScript runtime: exactly **387 matching entries**, **387 unique paths**, **0 duplicate paths**, **0 unsafe dot/empty components**, **383 JavaScript files**, **0 JSON files**, **4 other files**, total recorded byte sizes **2,571,416**. This confirms the inventory document's parseability and internal count only; no file content hashes or filesystem completeness verified. The 4 non-JS files are included in the pinned presence check.
- Executable shell `git ls-remote` still fails with `Could not resolve host: github.com`. No full research checkout. **0 new gameplay deals**, **0 hidden worlds**, **0 rollouts**; seed range none; strategies none. Gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**. No new win, pips, round-length, block, minus, double, branch or regret measurements. Historical **180,000** matched-seat rounds remain a separate legacy subtotal.
- Finding: pinned metadata parses consistently, but this is **not** evidence that an executable checkout or gameplay engine is valid; no new reliable strategy finding. Confidence high for inventory metadata counts, none for gameplay validation.
- Exact next action: restore executable checkout or reconstruct all 387 pinned files from connector with blob verification, run preflight and both validation gates plus fingerprint replays, archive actual JSON and timings, fix failures, then resume paired-seed strategy tests. No PWA/scoreboard or GitHub Actions changes.


## 2026-11-15 21:50 Asia/Baku — pinned source provenance spot-check

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, current validation-checkout-preflight.js and historical simulator-checkout-inventory-2026-11-14.md; engine reference qosha-research-0.5.3, rules qosa-1.0.0, primary 3×9+1. Branch unlock, block scoring and loneZero=10 remain provisional.
- Compared current GitHub blob SHA to the 2026-11-14 historical pinned inventory for six important simulator files. **Five match exactly**: validation-gate.js, hidden-world-validation-gate.js, round-driver.js, initializer.js, opening-redeal-exact-oracle.js. **One differs**: validation-checkout-preflight.js current 5f24cf3159ecdd105c4f895fbd2093f05b60b2b2 versus pinned 581774282e41c489c66280875f6e3cab45ad8aeb. This is a source-version drift observation, not proof of corruption: preflight was edited after the historical inventory snapshot. Reconstruction should use one consistent pinned commit or refresh manifests intentionally; never silently equate historical inventory hashes with current main.
- Executable shell git ls-remote still fails with Could not resolve host: github.com (Node v22.16.0 available). No full executable checkout or test gate execution. This pass: **0 new gameplay deals**, **0 hidden worlds**, **0 rollouts**, seeds none, strategies none; **0/17 gameplay suites and 0/4 hidden-world suites executed**. Win, pips, round length, block, minus, doubles, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain a separate legacy subtotal.
- Confidence high for GitHub blob comparisons and DNS failure; none for engine runtime correctness. No new reliable strategic finding.
- Exact next action: reconstruct the **complete** research-only tree at one immutable Git commit using connector reads and verify all blob SHAs; then run checkout preflight, both gates and fingerprint replays, archive raw outputs/timings, fix failures, and only then resume matched-seed strategy comparisons. No live PWA files or GitHub Actions changed.


## 2026-11-16 04:51 Asia/Baku — historical blob provenance audit added

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and validation-checkout-preflight.js. Engine reference qosha-research-0.5.3, recovered rules qosa-1.0.0, primary 3×9+1; branch unlock, block scoring and loneZero=10 provisional.
- Updated simulator/validation-checkout-preflight.js to compute the actual Git blob SHA-1 (including Git's blob length prefix) and byte count for each safe, present historical inventory entry, exposing pinnedDriftCount and pinnedDrift in the preflight JSON. This is intentionally **nonblocking** because the inventory is a dated snapshot and legitimate files have changed; missing, unsafe or symlinked files remain fail-closed as before.
- The code was persisted via GitHub connector in commit 7c0dd998f9719b6e3fda4340ab293f07956417ae, but **not executed** against a complete checkout. Do not treat authored logic as a passed test. No scoreboard/PWA files touched.
- New strategy deals 0, hidden worlds 0, rollouts 0; seed set none, strategies none. Full gameplay validation 0/17 suites executed; hidden-world 0/4. No new win, pips, round length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds remain a separate legacy subtotal. No reliable new strategic finding.
- Next: recover a complete research-only checkout, run preflight and inspect the explicit blob-drift report; reconcile changes against a single GitHub commit, then run both validation gates and fingerprint replays, archive JSON and timings, fix failures, and resume paired-seed comparisons.


## 2026-11-16 18:50 Asia/Baku — independent linked-pair exhaustive cross-check

- Source of truth read at start: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and linked-pairs-distribution-exact-oracle.js. Reference gameplay engine qosha-research-0.5.3; recovered qosa-1.0.0; 3 players × 9 stones + 1 stock. Branch unlocking, block scoring, loneZero=10 provisional.
- Added independent 12-bit exhaustive weighted enumeration to simulator/linked-pairs-distribution-exact-oracle.js (commit 9ac89033be1daf0d8e0964adb17e80cf5ffc0306). The 4,096 masks cover all C(27,9)=4,686,825 possible 9-tile post-opening hands, weighting remaining 15 nonspecial tiles by C(15,9-popcount(mask)). Independently executed the same exact source logic with Node locally; assertions passed against the prior inclusion–exclusion probabilities for counts 0..4.
- Corrected precision finding: P(2+ linked pairs) = **9.6523766089%** (not 9.64637661% as mistakenly printed in the previous checkpoint). Distribution P(0..4) = 48.66930171%, 41.67832168%, 9.10307084%, 0.54322489%, 0.00608088%. This corrects an arithmetic/reporting discrepancy; still inventory-only, not a legal-move or strategy finding.
- Gameplay deals **0**, hidden worlds **0**, rollouts **0**, seed set none (exact enumeration), strategies none; gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**. No new win, pips, length, block, minus, branch or regret results. Historical **180,000** matched-seat rounds remain separate.
- Confidence exact for the independently cross-checked opening-inventory distribution; no claim of complete engine validation. Next action: recover full single-commit research-only checkout, run pinned preflight, all 17 gameplay suites, all four hidden-world suites and fingerprint replays; archive real JSON/timings and fix failures before matched-seed strategy runs. No PWA/scoreboard or GitHub Actions changed.


## 2026-11-17 01:54 Asia/Baku — repaired preflight source-breaking escaped newlines

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and validation-checkout-preflight.js / validation-gate.js. Reference engine `qosha-research-0.5.3`, recovered rules `qosa-1.0.0`, primary 3×9+1; branch unlock, block scoring, `loneZero=10` provisional.
- Source inspection found a concrete preflight defect: the comment preceding `const pinnedDrift=[]` contained literal backslash-n text (`\\n//`) instead of actual line breaks, so the declaration was swallowed by the `//` comment. Subsequent `pinnedDrift.push(...)` and `pinnedDrift.length` would reference an undeclared variable, preventing preflight JSON from being emitted. Corrected only those comment line breaks in `simulator/validation-checkout-preflight.js` (commit `d575fdfeed3bbf77d300593c4184194fdce7d3cd`). This is a static source-level repair; complete checkout execution remains pending.
- This run: **0 new gameplay deals**, **0 hidden-world allocations**, **0 rollouts**; seed set none; strategies none. **0/17 full gameplay suites**, **0/4 hidden-world suites executed**. No win/pips/length/block/minus/double/branch/regret measurements. Historical **180,000** matched-seat rounds remain separate. No reliable new strategic finding.
- Confidence high for the source-level JavaScript comment/declaration defect and its textual correction, not for full runtime validation. Exact next action: reconstruct full single-commit simulator checkout, execute preflight (check `pinnedDriftCount`), both validation gates and fingerprint replays; archive actual JSON and timings, repair failures, then resume paired-seed strategies. No live scoreboard/PWA files or GitHub Actions changed.

## 2026-11-17 08:55 Asia/Baku — checkout recovery blocker verified

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js. Engine `qosha-research-0.5.3`; recovered `qosa-1.0.0`; 3×9 primary, 5×5 secondary; branch unlock, block allocation and loneZero remain provisional.
- Executable shell checked directly: Node v22.16.0 available; `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`. GitHub connector source read/write remains available, but no complete executable checkout was reconstructed this pass.
- Static source audit: preflight requires all 387 historical pinned simulator files, recursively checks every simulator JS/JSON and literal relative require, rejects symlinks and validates parse syntax; gameplay gate requires 17 suites, hidden-world gate four suites. These are code contracts, **not** executed test results. The historical pinned SHA-1 drift report is intentionally nonblocking for later legitimate edits.
- Deals this run: **0**; seed set: **none**; strategies: **none**; hidden worlds: **0**. Full gameplay tests executed **0/17**; hidden-world tests **0/4**. Win rate, mean/median remaining pips, round length, block frequency, minus frequencies, double effects, branch effects and decision regret: **not measured**. Historical 180,000 matched-seat strategy rounds are a separate legacy subtotal, not the cumulative total of all experiments.
- New reliable strategic finding: **none**. Confidence high for direct DNS observation and static gate structure; no confidence claim for unexecuted gameplay validation.
- Exact next action: obtain complete research-only checkout (restore DNS or reconstruct the full 387+ file pinned inventory via connector), run preflight, gameplay and hidden-world gates and fingerprint replays, archive their real JSON plus timings under runs/, repair any failures, then resume matched-seed backed-versus-unbacked branch strategy tests. Do not modify live scoreboard/PWA files or create GitHub Actions.

## 2026-11-17 16:52 Asia/Baku — recovery manifest limitation identified

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js and validation-gate.js. Engine `qosha-research-0.5.3`, recovered rules `qosa-1.0.0`; primary 3 players × 9 stones. Branch unlock, block winner allocation and loneZero remain provisional.
- Direct executable access rechecked: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` fails with `Could not resolve host: github.com`. Connector read access succeeds; no full checkout recovered or executable suite run.
- Concrete static finding: preflight's pinned inventory checks presence of 387 historical paths, and `unpinnedInputs` only reports additional files **already present locally**. Consequently, an incomplete recovered checkout missing one or more of the newer unpinned inputs could still pass the inventory-presence part of preflight if those files are not imported by any retained file. This is a recovery completeness gap, not a demonstrated gameplay failure. A single-commit current-tree manifest (paths and blob IDs) is needed to close it; do not treat the 387-file snapshot as complete.
- This pass: new gameplay deals **0**, hidden-world allocations **0**, rollouts **0**; seed set none; strategies none; full gameplay suites executed **0/17**, hidden-world **0/4**. Win/first-place, mean/median remaining pips, turns, blocks, minus frequencies, doubles, branch effects and regret not measured. Historical persisted **180,000 matched-seat rounds** remain a separate legacy subtotal, not an all-time cumulative figure.
- Finding confidence: high for the logical manifest gap based on preflight source; no new reliable strategy finding and no claim of green validation.
- Exact next action: capture the current single-commit GitHub simulator path/blob manifest and require its full presence during checkout recovery; then run preflight, both gates and fingerprint replays, archive raw JSON and timings, repair failures and resume matched-seed strategy comparisons. No live PWA files or Actions changed.

## 2026-11-18 09:47 Asia/Baku — executable source access recheck

- Source of truth read at start: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js and hidden-world-validation-gate.js. Engine reference `qosha-research-0.5.3`; recovered `qosa-1.0.0`; primary 3×9+1. Branch unlock, block scoring and loneZero interpretation remain provisional.
- Local Node v22.16.0 is available, but fresh `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`. GitHub connector can read/write files, but no complete verified runnable checkout was obtained in this pass.
- Audited gate implementation: gameplay validation requires preflight followed by 17 suites; hidden-world validation requires the same preflight followed by four suites. No execution is inferred from static source inspection.
- New gameplay deals: **0**; sampled hidden worlds: **0**; seed set: **none**; strategies: **none**. Gameplay suites executed: **0/17**; hidden-world suites executed: **0/4**. Win/first-place, remaining pips, length, blocks, minus frequencies, doubles, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain a separate legacy subtotal, not a new or all-time count.
- Finding: **no new reliable strategy conclusion**. Confidence high in the observed DNS failure and source gate structure; no runtime validation confidence. This is a retrieval blocker, not a failed gameplay invariant.
- Exact next action: obtain a full research-only checkout (restore DNS or transfer every required simulator JS/JSON source from GitHub connector into an executable tree), run checkout preflight and both gates, save their raw reports/timings and repair failures. Only then resume matched-seed strategy comparisons. No PWA files or GitHub Actions changed.

## 2026-11-18 10:51 Asia/Baku — recovery-path verification

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and both simulator/validation-checkout-preflight.js and simulator/reconstruct-checkout.js. Engine reference qosha-research-0.5.3; rules qosa-1.0.0, primary 3 players x 9 stones + 1 stock. Branch unlock, block scoring and loneZero=10 remain provisional.
- Direct executable environment: Node v22.16.0 available; `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still fails with `Could not resolve host: github.com`. The connector successfully reads the GitHub source, but it cannot populate the shell checkout directly. The existing reconstruction script itself uses HTTPS fetch, so it cannot bypass the same DNS restriction.
- Verified source-level recovery contracts: the preflight checks the immutable 398-blob snapshot presence and reports SHA drift nonblockingly; reconstruct-checkout.js verifies each pinned SHA and size and refuses to overwrite divergent local files. These checks are **inspected, not executed** on a full checkout. An unmodified pinned checkout and a later edited working tree must not be silently conflated.
- This pass: gameplay deals **0**, sampled hidden worlds **0**, rollouts **0**; seed set **none**; strategies **none**. Full gameplay suites **0/17 executed** and hidden-world suites **0/4 executed**. No new win/first-place, pips, round length, blocks, minus, double, branch or regret metrics. Historical **180,000 matched-seat rounds** are separate legacy data.
- New reliable strategic finding: **none**. Confidence high for direct DNS failure and GitHub code inspection; no runtime validation confidence.
- Exact next action: restore shell network access or transfer the complete 398 pinned blobs through a verified offline mechanism, run SHA/size verification and checkout preflight, then all 17+4 suites and fingerprint replays. Archive actual outputs before matched-seed strategy tests. No PWA/scoreboard or Actions changes.

## 2026-11-18 19:54 Asia/Baku — exact current-tree recovery presence gate

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and gameplay/hidden-world validation gate source; inspected current pinned simulator manifest `simulator-tree-manifest-20261118-current.json` (source commit `375f7b8c0fb7999a0c2d2273dc400f2488714cf1`, 406 entries).
- Engine reference `qosha-research-0.5.3`; recovered `qosa-1.0.0`; primary 3×9+1; branch unlocking, block winner allocation and `loneZero=10` still provisional.
- Updated `simulator/validation-checkout-preflight.js` to require **every named file** in the 406-entry pinned current-tree manifest, rejecting absent, malformed, symlinked and nonregular paths. Previously a 406-file checkout containing the wrong 8 additional files could pass the count-only gate. Current-manifest Git blob SHA/size differences remain **nonblocking diagnostics** for legitimate post-snapshot edits. Commit `f737da124b2aed40a470751596fe185173162087`.
- No executable full checkout was available in this run; this is a static source repair, **not** an executed green preflight or game-engine test. New strategy deals **0**, hidden worlds **0**, rollouts **0**; seed set none; strategies none; full gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**. Win, remaining pips, rounds, blocks, minus, double, branch and regret metrics not measured. Historical **180,000** matched-seat rounds separate.
- Finding: recovery completeness is now checked by path identity instead of file count alone; **no reliable new strategic finding**. Confidence high for static gap closure; runtime unverified.
- Exact next action: recover the pinned 406 blobs into one executable research-only checkout, run preflight and 17+4 suites, fingerprint replays, archive raw JSON/timings, repair failures, then resume matched-seed strategy comparisons. No live PWA files or GitHub Actions changed.

## 2026-11-19 20:52 Asia/Baku — forced-opening-pass two-opponent support exact check

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md and STATUS.md at start. Reference engine `qosha-research-0.5.3`, recovered rules `qosa-1.0.0`, 3×9+1 primary. Branch unlock, block allocation and loneZero remain provisional.
- Exact ambiguity-independent extension of the documented forced-pass hypergeometric model: after starter plays 1-1, draws stock and still has no ordinary 1-x, all six ordinary 1-x connectors are among opponents' 18 tiles. With X in clockwise next player's nine, the other opponent has 6-X. Both opponents have at least two connectors iff 2<=X<=4. Exact count C(6,2)C(12,7)+C(6,3)C(12,6)+C(6,4)C(12,5)=42,240 out of C(18,9)=48,620, or **86.8778%**. In the remaining 13.1222%, one opponent has zero or one connector. This is an exact conditional hand-support result, not a move-choice or win-rate advantage.
- New gameplay deals **0**; hidden-world Monte Carlo samples **0**; rollouts **0**; seeds **none** (exact counting); strategies **none**. Full gameplay suites **0/17 executed**, hidden-world suites **0/4 executed** in this checkpoint. No new win, pips, length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds remain separate.
- Confidence exact for combinatorics under uniform shuffle and stated forced-pass condition; no claim of full-engine validation or superior strategy. Next: recover complete research-only checkout, execute preflight, 17+4 suites and fingerprint replays, archive actual JSON/timings, then paired-seed strategy comparisons. No live scoreboard/PWA or Actions files changed.


## 2026-11-19 23:47 Asia/Baku — executable validation retry

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator/validation-checkout-preflight.js; inspected simulator directory through GitHub connector. Reference engine `qosha-research-0.5.3`, recovered rules `qosa-1.0.0`; primary 3×9+1, secondary 5×5. Branch unlock, block allocation and loneZero=10 remain provisional.
- Fresh local runtime check: Node `v22.16.0`; `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`. GitHub connector can read source, but a full verified executable research checkout has not been obtained.
- Source audit: latest preflight requires 409 simulator files and `simulator-tree-manifest-20261119-409.json`, in addition to older 406/398 inventories; validates literal relative dependencies and JS syntax. This is static inspection, **not** an executed pass.
- New gameplay deals **0**, sampled hidden worlds **0**, rollouts **0**; seeds **none**, strategies **none**. Full gameplay suites executed **0/17**, hidden-world suites executed **0/4**; win/first-place, mean/median pips, round length, block, minus frequencies, doubles, branch effects and regret **not measured this run**. Historical 180,000 matched-seat rounds are separate legacy samples.
- New reliable strategy finding **none**. Confidence high for directly observed DNS failure and static source contracts; no runtime-validation claim. Exact next action: obtain all 409 manifest-listed simulator files at one GitHub commit into executable checkout, verify manifest/preflight, execute 17+4 suites and fingerprint replays, archive actual JSON and timings; only then resume paired-seed strategy runs. No live PWA files or GitHub Actions changed.


## 2026-11-20 01:47 Asia/Baku — pinned-manifest freshness audit

- At run start read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md and STATUS.md, plus current validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js and pinned 409-file simulator manifest. Reference engine qosha-research-0.5.3 / recovered qosa-1.0.0; primary 3×9+1. Branch unlock, block scoring and loneZero=10 remain provisional.
- **New recovery finding:** the pinned `simulator-tree-manifest-20261119-409.json` (source commit `5c15ee1a9930432844d332a288dbad47951f2e9f`) does **not** list `simulator/forced-pass-support-oracle.js`, a later research file recorded in RESULTS.md. Therefore its 409-path gate certifies only that older snapshot, **not** the complete latest simulator tree. Do not call a recovered 409-file checkout complete for the current HEAD. Require a fresh single-commit path/blob manifest and check its exact path set; verify all added files, not just the count.
- Fresh executable check: local Node v22.16.0 available; `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`. GitHub connector read succeeded; no complete executable checkout or runtime gate was obtained.
- This run: 0 gameplay deals, 0 hidden-world samples, 0 rollouts; seed set none, strategies none. Full gameplay suites 0/17 executed, hidden-world suites 0/4 executed. Win/first-place, mean/median pips, turns, blocks, minus frequencies, doubles, branch effects and regret not measured. Historical persisted 180,000 matched-seat rounds remain a separate legacy subtotal, not new or all-time data.
- Confidence: high for exact manifest-path absence and observed DNS failure; no new reliable strategy conclusion. Next: regenerate a fresh HEAD-pinned simulator manifest through GitHub, reconcile post-snapshot paths, recover the full tree, execute preflight + 17+4 suites and fingerprint replays, archive actual JSON/timings, then resume paired-seed comparisons. No live scoreboard/PWA or Actions files changed.

## 2026-11-20 04:47 Asia/Baku — complete-checkout execution blocker reverified

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator preflight, gameplay gate and hidden-world gate source. Reference engine qosha-research-0.5.3 / recovered qosa-1.0.0, primary 3×9+1. Branch unlock, block scoring and loneZero=10 remain provisional.
- Fresh shell check: Node v22.16.0 works, but git ls-remote against the repository fails with 'Could not resolve host: github.com'. GitHub connector source reads succeed; no verified complete executable checkout was available. The current preflight statically demands a 413-path HEAD manifest, historical manifests, all literal dependencies and syntax checks; source review is not execution.
- New gameplay deals: 0; hidden worlds: 0; rollouts: 0. Seed set: none. Strategies: none. Gameplay gate suites executed: 0/17; hidden-world suites executed: 0/4. No new win, pip, round-length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds remain separate legacy evidence.
- New reliable strategy finding: none. Confidence high only for observed DNS failure and inspected source contracts; gameplay validation remains blocked, not green. Exact next action: restore full GitHub checkout access or transfer all 413 manifest-listed simulator files with verified Git blobs, execute preflight, 17+4 suites and fingerprint replays, archive raw outputs/timings, then resume matched-seed strategy experiments. No live scoreboard/PWA files or GitHub Actions changed.

## 2026-11-20 15:48 Asia/Baku — pinned checkout download quota fix

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator inventory, reconstruct-checkout.js, validation-checkout-preflight.js, verify-current-tree-manifest.js. Engine reference qosha-research-0.5.3; recovered qosa-1.0.0, primary 3×9. Branch/block/loneZero interpretations provisional.
- Found a concrete recovery obstacle: the reconstruction script requested each of >=415 files through GitHub REST contents API. Without GITHUB_TOKEN this can exceed the normal unauthenticated REST hourly quota long before recovery finishes. This is a static risk, not an observed HTTP 403.
- Changed ONLY simulator/reconstruct-checkout.js to download immutable-commit raw.githubusercontent.com URLs instead, retaining pinned HEAD tree discovery, per-file Git blob SHA-1 and byte-length verification, symlink/path checks, and fail-closed behavior. Commit: 17aaf0cd0b00de15b0189f452d2a144e83a56298. This reduces REST usage to metadata requests; raw CDN availability still requires network access.
- Shell retry: git ls-remote failed with Could not resolve host: github.com. Thus reconstruction was NOT executed and its changed path is NOT runtime-validated. Gameplay suites 0/17, hidden-world suites 0/4 this pass; 0 new gameplay deals, 0 sampled worlds, no seeds or strategies. Win/first-place, pips, length, block, minus, double, branch, regret: not measured. Historical 180,000 matched-seat rounds remain a separate legacy subtotal.
- Finding: a likely API-quota obstacle to complete reconstruction is removed in source; no new reliable gameplay-strategy finding. Confidence high for static source change, none for runtime outcome.
- Exact next action: restore shell DNS or obtain verified research-only checkout; execute reconstruct-checkout.js, preflight, both validation gates and fingerprint replays; archive real JSON and repair failures before matched-seed strategy comparisons. No live PWA files or Actions changed.

## 2026-11-20 20:47 Asia/Baku — recursive-tree directory handling repair

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator/reconstruct-checkout.js. Engine reference qosha-research-0.5.3; recovered rules qosa-1.0.0, 3×9+1 primary. Branch unlocking, block allocation and loneZero=10 remain provisional.
- Found a deterministic reconstruction failure in source: GitHub recursive tree includes ordinary directory rows (type tree, mode 040000), but the newly added source-type guard rejected every non-blob row, preventing reconstruction even with restored DNS. Updated reconstruct-checkout.js to accept normal directory rows without downloading them, while still rejecting symlinks, submodules and irregular entries. Commit e7a3320203ef0400f1ca0fec218279843337feb9. Static source fix; full checkout execution NOT claimed.
- Fresh shell git ls-remote still failed: Could not resolve host: github.com. Gameplay deals 0; sampled hidden worlds 0; rollouts 0; seed set none; strategies none. Full gameplay suites 0/17 executed; hidden-world suites 0/4 executed. No new win, pip, length, block, minus, double, branch or regret measurements. Historical 180,000 matched-seat rounds remain separate legacy evidence.
- Finding: reconstruction no longer falsely treats ordinary Git directories as unsafe; no reliable new strategic finding. Confidence high for source-level diagnosis, no gameplay validation. Exact next action: restore DNS/verified full checkout, execute reconstruction and preflight, 17+4 gates and fingerprint replays, archive actual JSON/timings, then matched-seed strategy experiments. No PWA or GitHub Actions changed.


## 2026-11-21 04:46 Asia/Baku — executable checkout and integrity gate audit

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator/validation-checkout-preflight.js; inspected current 415-file manifest gate. Reference engine qosha-research-0.5.3 / recovered qosa-1.0.0; primary 3 players × 9 tiles + 1 stock. Branch unlocking, block allocation and loneZero=10 remain provisional.
- Fresh shell check: Node v22.16.0 available; git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD failed 'Could not resolve host: github.com'. No full executable research checkout; no suite executed.
- Source-level integrity distinction: the 415-file preflight enforces path presence and regular-file status, but SHA/byte differences against the historical pinned manifest are recorded as nonblocking drift. Thus a green preflight alone would **not** prove exact pinned-blob integrity; the reconstruction tool's pinned SHA/size verification must also pass, or a fresh manifest must be checked against the exact intended commit. This is a validation-scope clarification, not an observed failure.
- New strategy deals 0, sampled hidden worlds 0, rollouts 0; seeds none, strategies none. Gameplay suites 0/17 executed, hidden-world suites 0/4 executed. No new win, remainder, length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds remain separate.
- Finding: distinguish checkout *presence* from checkout *integrity* before calling recovery validated. Confidence high for source-level gate behavior, none for runtime gameplay. No reliable new strategic finding.
- Exact next action: restore shell DNS or transfer full verified pinned research checkout, validate Git blob SHA/size at the chosen commit, execute preflight + 17 gameplay and 4 hidden-world suites and fingerprint replays, archive actual JSON/timings, then resume matched-seed strategy experiments. No PWA files or GitHub Actions modified.

## 2026-11-21 08:52 Asia/Baku — strict manifest verifier compatibility

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, and validation/reconstruction source. Engine qosha-research-0.5.3; rules qosa-1.0.0; primary 3×9+1. Branch unlock, block scoring and loneZero=10 remain provisional.
- Found an actionable tooling mismatch: `verify-current-tree-manifest.js` accepted only `qosha-current-simulator-manifest/v1` while the available 415-path manifest uses `qosha-simulator-tree-manifest/v1`. Updated the strict verifier to accept either schema, requiring a complete manifest via `truncated:false` or exact `scope` and `fileCount` metadata. Existing strict path-set and Git blob SHA/size comparisons are unchanged. Commit `790cd486712c7be112f2bdd2503cb4bcb21f5415`.
- This is source-level repair, not an executed integrity pass: no full checkout available for verifier execution. Deals 0, hidden worlds 0, rollouts 0; seeds none, strategies none; gameplay suites executed 0/17 and hidden-world suites 0/4. Win/first-place, mean/median pips, turns, blocks, minus frequencies, doubles, branch effects, regret not measured. Historical 180,000 matched-seat rounds remain separate legacy samples.
- No new reliable strategy finding. Confidence high in identified schema mismatch; runtime validation pending. Next exact action: recover full HEAD-pinned research tree, execute strict verifier against matching pinned manifest, preflight, 17+4 suites and fingerprint replays; save raw outputs and only then resume matched-seed strategy trials. No live scoreboard/PWA or Actions changes.


## 2026-11-21 21:50 Asia/Baku — validation gate version-drift audit

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js and hidden-world-validation-gate.js before this checkpoint. Reference engine qosha-research-0.5.3 / recovered qosa-1.0.0; primary 3×9+1; branch unlocking, block scoring and loneZero=10 provisional.
- Fresh executable check: Node v22.16.0 available, but git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD failed with Could not resolve host: github.com. No complete local simulator checkout, so do not claim any gameplay or hidden-world tests passed.
- Concrete validation hazard found in current source: validation-checkout-preflight.js still pins historical 406-, 413-, and 415-path manifests and records historical SHA drift as nonblocking; its returned passed flag does not certify that the latest HEAD simulator tree is byte-identical. Both 17-suite gameplay and 4-suite hidden-world gates depend on this same preflight. The separate strict manifest verifier must be run against a fresh *single-commit* HEAD manifest before interpreting either gate as fully validated. Historical manifests are compatibility floors, not current-HEAD integrity proof.
- New gameplay deals 0, hidden worlds 0, rollouts 0; seeds none; strategies none. Gameplay suites executed 0/17; hidden-world suites 0/4. Win/first-place, pip mean/median, turns, blocks, minus outcomes, doubles, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain separate legacy evidence. No new reliable strategy finding.
- Confidence high for directly inspected validation-gate dependency and fresh DNS failure; no claim about current HEAD path count or test outcomes without fresh complete manifest and execution. Next exact action: recover complete HEAD-pinned tree, verify exact path set plus every Git blob SHA and byte length, then run preflight, 17+4 gates and fingerprint replays; archive raw JSON/timings and resume matched-seed strategy comparisons only after validation. Live scoreboard/PWA and GitHub Actions unchanged.

## 2026-11-22 05:52 Asia/Baku — opt-in stale checkout recovery

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js and reconstruct-checkout.js. Rules recovered qosa-1.0.0, engine reference qosha-research-0.5.3; 3×9+1 primary. Branch unlock, block allocation, loneZero=10 remain provisional.
- Fixed an actionable reconstruction blocker: existing stale local files previously caused unconditional refusal to proceed. `reconstruct-checkout.js` now supports explicit `--replace-stale`, verifies downloaded bytes against immutable HEAD Git blob SHA-1 and size before replacing; default remains fail-closed. Change commit 975b6c0e25302c5db4f6d828db6565ea081cb301. No live PWA or GitHub Actions touched.
- Runtime check: Node v22.16.0 available; `git ls-remote` still fails `Could not resolve host: github.com`. Full checkout and changed reconstruction path not executed. Gameplay suites 0/17, hidden-world suites 0/4; 0 new deals, 0 sampled worlds, 0 rollouts, seed set none, strategies none. All gameplay metrics not measured. Historical 180,000 matched-seat rounds separate.
- Finding: stale-copy refresh is now possible via explicit opt-in without accepting unverified replacement bytes. High confidence in static code path; no new reliable strategy finding or runtime validation.
- Next exact action: restore DNS, run reconstruction with `--replace-stale` in dedicated research checkout, verify current HEAD tree SHA/size, execute preflight, 17 gameplay and 4 hidden-world suites and fingerprint replays, archive raw outputs, then matched-seed trials.


## 2026-11-22 13:51 Asia/Baku — executable retrieval check and opening-oracle source audit

- Read GitHub source of truth: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and simulator/opening-pass-risk-by-double-count-20261122.js. Engine reference qosha-research-0.5.3, recovered qosa-1.0.0; primary 3×9+1. Branch opening, block scoring and loneZero=10 still provisional.
- Executable shell `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` again returned `Could not resolve host: github.com`. GitHub connector read worked. A complete checkout remains unavailable; no validation result is inferred from static assertions.
- Source audit: opening forced-pass oracle counts 6 ordinary 1-x connectors, 6 other doubles and 15 other nonconnectors after 1-1; enumerates conditional K=0..6 counts using combinations and asserts total 27-choose-9 and 21-choose-9. This is a source-level consistency check of an existing oracle, **not** an independently executed gameplay test or new finding.
- New deals 0, sampled hidden worlds 0, rollouts 0; seed range none (no stochastic experiment), strategies none. Full gameplay suites 0/17 executed, hidden-world suites 0/4 executed. Win/first-place, mean/median remainder, length, block, minus frequencies, doubles, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain separate.
- Reliable new strategic finding: none. Confidence high for observed DNS failure and code inspection; none for full-engine correctness. Exact next action: obtain a complete single-commit SHA-verified research-only checkout, run strict manifest audit, preflight, 17+4 validation suites and fingerprint replays, archive actual outputs and repair failures before matched-seed comparisons. No live PWA or GitHub Actions modified.


## 2026-11-22 15:51 Asia/Baku — reconstruction and preflight blocker audit

- Source-of-truth files read this pass: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, simulator/validation-checkout-preflight.js, simulator/reconstruct-checkout.js. Engine reference qosha-research-0.5.3; recovered qosa-1.0.0; primary 3 players × 9 tiles + 1 stock. Branch unlock, block scoring and loneZero=10 remain provisional.
- Fresh shell attempt `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD`: `Could not resolve host: github.com`. The GitHub connector can read files, but a complete pinned checkout is still absent. No engine validation was executed.
- Audit finding: `reconstruct-checkout.js` already resolves a single HEAD SHA, recursively inventories research-only blobs, rejects symlinks, checks Git blob SHA-1 and byte length, and supports `--replace-stale`. `validation-checkout-preflight.js` reports SHA drift for historical manifests but its `passed` flag does not require zero drift. Therefore a passing presence/preflight result alone must not be promoted to a current-HEAD byte-integrity or gameplay-validation claim. This is a source-level safety finding, not a new game-strategy result.
- New deals 0; seed set none; strategies none; sampled hidden worlds 0; rollouts 0. Gameplay suites executed 0/17; hidden-world suites executed 0/4. Win/first-place, mean/median remainder, length, block, minus frequencies, double ownership, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain separate legacy evidence, not cumulative new validation.
- Confidence: high for directly inspected code and observed DNS failure; no new reliable strategy finding. Exact next action: recover complete single-commit research-only tree via network or verified connector reconstruction, run independent strict SHA/path/size audit, then preflight, 17+4 gates and fingerprint replays; archive actual JSON before any matched-seed strategy comparison. Live scoreboard/PWA and GitHub Actions untouched.

## 2026-11-22 17:45 Asia/Baku — pre-draw double-count opening oracle

- Read GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md; recovered rules qosa-1.0.0, reference engine qosha-research-0.5.3, primary 3×9+1. Branch unlocking, block scoring, loneZero=10 remain provisional.
- Added research-only standalone exact oracle `simulator/opening-pre-draw-double-pass-oracle-20261122.js` (commit 8992653705428fae6ca156898af51b7cee53a9d0). It measures forced-pass probability **conditioned on K other doubles in the starter's eight tiles before the mandatory draw**, unlike earlier post-draw conditioning. Formula: [C(6,K)C(15,8-K) / (C(6,K)C(21,8-K))] × 13/19. For K=0..6: 2.1637%, 3.7865%, 6.3108%, 10.0972%, 15.6048%, 23.4072%, 34.2105%. Weighted aggregate equals C(21,9)/C(27,9)=6.2714%. Independent Python combinatorial calculation completed; committed JS itself not executed in full checkout.
- New finding: pre-draw other-double count is a predictor of the opening forced-pass event, with risk increasing from ~2.16% at zero other doubles to ~34.21% at six. This is a hand-composition association, not a strategy recommendation or evidence of causality. High confidence in exact combinatorics under uniform deal and confirmed opening; no gameplay engine validation.
- Fresh executable GitHub clone check still fails: `Could not resolve host: github.com`. New gameplay deals 0, hidden worlds 0, rollouts 0; seeds none (exact enumeration), strategies none; full gameplay suites executed 0/17, hidden-world suites 0/4. First-place, pips, length, blocks, minus frequencies, branch effects, regret not measured. Historical 180,000 matched-seat rounds remain separate.
- Exact next action: obtain complete SHA-verified research checkout; run strict manifest audit, preflight, 17+4 suites and fingerprint replays; archive actual outputs and resume matched-seed strategy comparison only after validation. No live PWA files or Actions touched.


## 2026-11-22 20:46 Asia/Baku — executable checkout availability recheck

- Source of truth read at run start: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, plus validation-checkout-preflight.js and strict-pinned-415-audit-regression-20261122.js. Reference engine qosha-research-0.5.3, recovered rules qosa-1.0.0; primary 3×9+1. Branch unlocking, block allocation, loneZero=10 provisional.
- Actual shell check: Node v22.16.0 available; git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD failed with Could not resolve host: github.com. No complete SHA-verified executable research checkout. GitHub connector source inspection succeeds, but cannot substitute for executing the full game kernel.
- Inspected strict pinned 415 regression: seven synthetic checks are defined (intact, mutated, missing, symlink, duplicate, traversal, wrong commit), but no claim of execution. Preflight's historical manifest SHA drift remains diagnostic, not a strict current-HEAD proof.
- New gameplay deals 0; sampled hidden worlds 0; rollouts 0; seeds none; strategies none. Gameplay suites executed 0/17, hidden-world suites 0/4. No new win/first-place, mean/median remainder, length, block, minus, double, branch or regret metrics. Historical 180,000 matched-seat rounds separate. No reliable new strategic finding.
- Confidence high for observed network error and source inspection; no gameplay validity claim. Exact next action: restore executable access to complete single-commit research-only checkout, verify Git blob SHA and size/path inventory, run strict verifier and seven synthetic cases, preflight, 17+4 suites and fingerprint replays, archive raw JSON/timings, then matched-seed comparisons. No live PWA or GitHub Actions changes.


## 2026-11-22 22:49 Asia/Baku — gate evidence checkpoint

- Read current GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, gameplay validation-gate.js and hidden-world-validation-gate.js. Engine qosha-research-0.5.3 / recovered qosa-1.0.0; 3×9+1 primary; branch unlock, block allocation and loneZero remain provisional.
- Executable shell has Node v22.16.0; fresh `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`. GitHub connector reads work, but a complete executable research-only checkout was not obtained.
- Static gate audit: gameplay gate lists 17 suites, hidden-world gate four; both require the checkout preflight and hash the complete simulator JS/JSON inventory plus rule contracts. Authored suite definitions are not executed validation evidence. No new reliable strategic finding.
- This run: 0 gameplay deals, 0 hidden-world allocations, 0 rollouts; seed set none, strategies none; 0/17 gameplay and 0/4 Monte Carlo suites executed. Win rate, remainder, turns, block/minus, doubles, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain a separate legacy subtotal, not a fresh cumulative total.
- Confidence high for source-level gate counts and observed DNS failure, none for current engine validation. Exact next action: retrieve complete pinned research-only source snapshot; independently verify every Git blob SHA/path/size; execute strict snapshot regression, preflight, 17+4 gates and fingerprint replays, archive raw JSON/timings, repair failures before matched-seed strategy experiments. No PWA files or GitHub Actions modified.


## 2026-11-23 00:50 Asia/Baku — dangling-symlink integrity regression

- Read GitHub source of truth README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and both strict pinned verifier/regression source files. Rules qosa-1.0.0, reference engine qosha-research-0.5.3; primary 3×9+1. Branch unlocking, block allocation, loneZero=10 remain provisional.
- Fixed a concrete strict-audit diagnostic defect: `fs.existsSync` returns false for dangling symbolic links, incorrectly classifying them as missing. Verifier now uses `lstatSync` with ENOENT handling, rejecting both live and dangling symlinks explicitly. Added eighth synthetic regression scenario for a dangling symlink. Source commits 8767b901ba96fdbe5340c5f0b8493a5db2131b55 and 69ad9d60e6213f421f0ccb1ec87f3e0fab8dce22.
- Fresh executable GitHub access check: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`; Node v22.16.0 available. Updated regression source NOT executed in an executable repository checkout; no green test claim.
- New gameplay deals 0; hidden-world samples 0; rollouts 0; seed set none; strategies none. Gameplay suites executed 0/17; hidden-world suites executed 0/4. Win/first-place, remainder mean/median, length, block rate, minus frequencies, double effects, branch effects and regret not measured. Historical 180,000 matched-seat rounds remain separate legacy evidence.
- Finding: integrity checker now distinguishes dangling symlink tampering from absent files while failing closed in either case. High confidence in source-level behavior, no new reliable gameplay-strategy finding.
- Exact next action: obtain complete single-commit SHA-verified research-only checkout, execute all eight synthetic strict-audit scenarios, pinned manifest audit, preflight, 17 gameplay and 4 hidden-world suites and fingerprint replays; archive raw output before matched-seed comparisons. No live scoreboard/PWA or GitHub Actions files changed.


## 2026-11-25 05:50 Asia/Baku — first byte-verified partial executable recovery

- Read README, RULES, EXPERIMENTS, initial RESULTS range, STATUS, engine.js, test.js and both validation gates. Reference engine qosha-research-0.5.3 / recovered qosa-1.0.0, 3×9+1. Branch unlock, block allocation and loneZero remain provisional.
- Reconstructed two source files in a temporary executable directory from connector text; independently verified exact Git blob SHA via git hash-object: engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894; test.js 7438e5332e25606324e39c9b8ccde603064806eb. Node v22.16.0, command node test.js, exit 0, stdout: qosa research invariants: OK.
- Actual executed coverage: 10,000 deterministic initial deals (seeds 0..9999), four replay/conservation fixtures (0,1,1898414179,4294967295), stock coverage/broad frequency bounds, pip sums, minus -10/-20/-30/-40 pure helper, floor, partial and full double opening sequence enumeration. This is one standalone smoke suite, NOT one of the 17 formal gameplay gate suites. No full rounds, strategy deals, hidden worlds or rollouts; no win/remainder/length/block/regret metrics. Historical 180,000 matched-seat rounds separate. Formal gates remain 0/17 and 0/4 executed.
- Finding: connector text can be transferred to the shell with exact Git blob identity, and the basic kernel actually executes successfully. High confidence in this narrow test, no new strategy conclusion. Next: reconstruct and hash-check the dependency closure for a formal suite (seed-deal-regression.js first), execute it independently with explicit partial-checkout scope, then complete the full pinned inventory and both gates. No live PWA or Actions changes.


## 2026-11-25 09:54 Asia/Baku — draw/mixed partial execution

See [run report](runs/20261125-0954-draw-mixed-partial.md): two exported suites passed in V8 adapter, 1166 assertions; native gate not run.


## 2026-11-25 10:48 Asia/Baku — opening/block/scoring partial execution

See [run report](runs/20261125-1048-opening-block-scoring-partial.md): four exported suites passed in V8 adapter, 30,303 assertions; native gate not run.


## 2026-11-25 11:52 Asia/Baku — legality/order/terminal partial execution

See [run report](runs/20261125-1152-legality-order-terminal-partial.md): three exported suites passed in V8 adapter, 658 assertions; native gate not run.


## 2026-11-25 12:50 Asia/Baku — permutation/conservation partial execution

See [run report](runs/20261125-1250-permutation-conservation-partial.md) for actual suite results and limitations.
