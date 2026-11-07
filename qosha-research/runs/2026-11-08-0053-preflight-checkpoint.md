# 2026-11-08 00:53 Asia/Baku — checkout preflight hardening

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md and validation-gate.js, validation-fingerprint-replay-test.js, validation-checkout-preflight.js.
- Engine: qosha-research-0.5.3; recovered qosa-1.0.0 rules; 3 players x 9 stones, one stock. Branch/block/loneZero semantics remain provisional.
- Change: checkout preflight now rejects symlink/non-file dependencies and relative imports escaping qosha-research; recognizes .json dependencies and does not parse Markdown contracts as JavaScript. GitHub commit e45bbf88b69dd9f8ea52d062710ce372f2a8e242.
- Runtime attempt: git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD failed with 'Could not resolve host: github.com'. Node.js v22.16.0 is available, but executable checkout is not.
- Validation: 0/17 suites executed this run; preflight patch not runtime-verified. New strategy deals: 0; seed range/set: none; strategies: none. Win/first-place, mean/median remainder, round length, blocks, -10/-20/-30/-40, starting/ending doubles, branch effects and regret: not measured.
- Historical 180,000 matched-seat rounds are a separate older subtotal; not mixed with this run.
- Finding: static preflight previously trusted existence of dependencies and did not reject traversal outside research root. This is a validation-integrity improvement, **not** a strategy finding. Confidence: high from source inspection, none for runtime.
- Exact next action: obtain executable checkout; run `node qosha-research/simulator/validation-checkout-preflight.js`, then `node qosha-research/simulator/validation-gate.js` and `node qosha-research/simulator/validation-fingerprint-replay-test.js`; save actual JSON outputs and fix any failures before matched-seed strategy runs.
- No live PWA files or GitHub Actions modified.
