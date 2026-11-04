# Stock transition validation gate — 2026-11-04 09:48 (+04, Asia/Baku)

- Engine/rules: `qosha-research-0.5.3`, recovered `qosa-1.0.0`, primary 3×9.
- Executed this run: **0 deals**; no seed range executed. Prepared: 1,000 accepted first-round deals with attempt seeds beginning at 21,000,000 (redeals advance seed), seeded legal-action selection, plus **3 deterministic stock fixtures**.
- Change: `simulator/round-conservation-regression.js` now exercises (a) draw a legal 1-6 and play immediately, (b) draw an unplayable 0-0 and pass with it retained, (c) pass with empty stock. It asserts draw flags, hand contents, stock depletion, played tiles and pass status.
- Finding: prior 1,000-round conservation test never reached a nonempty stock after the mandatory 1-1 opening, so its stock-head checks were effectively vacuous for actual draws. The targeted fixtures close this *coverage gap*, but are **not yet executed**.
- Confidence: high for the structural coverage diagnosis from read-only inspection of `initializer.js`; no claims of passing tests or strategic advantage. GitHub connector write succeeded; local container cannot resolve github.com for a checkout, so Node execution remains unavailable here.
- Metrics: 0 new finish/win observations, no new block, remainder, minus, regret or branch-opening statistics. Historical 4,000-deal baseline and earlier matched-seed cohorts remain separate; no cumulative scale change.
- Next exact action: execute `node qosha-research/simulator/round-conservation-regression.js` on a Node checkout and save its actual output, fixing any failures. Then run 24 branch-label permutations on identical positions before promoting branch-control results.
- Scope: only `qosha-research/` modified; live scoreboard/PWA untouched.
