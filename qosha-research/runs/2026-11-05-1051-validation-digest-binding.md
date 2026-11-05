# 2026-11-05 10:51 Asia/Baku — validation digest binding

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3×9; provisional branch/block/loneZero semantics remain unresolved.
- Source of truth reviewed: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md; validation-gate.js and seed-deal-regression.js, plus prior validation/status reports.
- Changed `simulator/validation-gate.js`: the prior `reportSha256` hashed **only suite results**, so different engine/rule/source manifests could produce the same digest if results happened to match. The digest now hashes the entire report (excluding its own digest), binding source hashes, contract hashes, runtime metadata and suite outcomes.
- Executed strategy rounds: **0**; deterministic seed range executed: none; strategies: none. Full 12-suite gate **not executed**. Prior 1,024 deal-regression results and persisted 180,000 matched-seat strategy rounds remain separate; neither is new this run.
- Finding: a concrete provenance defect was corrected, not a gameplay strategy finding. Confidence high for static source reasoning; runtime validation pending.
- Limitation: local `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still fails with `Could not resolve host: github.com`. Connector read/write works, but no executable repository checkout is available. Do not claim test passes.
- Exact next action: run `node qosha-research/simulator/validation-gate.js` on a checked-out repository, save full JSON and verify all 12 suites; repair failures before further matched-seed strategy work.
- Live scoreboard/PWA untouched.
