# 2026-11-25 09:54 Asia/Baku — draw/pass and mixed finish partial execution

Source snapshot 2aa897ffefe6cdceb96683ee172695c9e53b5739; engine qosha-research-0.5.3, recovered qosa-1.0.0, 3×9+1. Read README, RULES, EXPERIMENTS, RESULTS, STATUS and gameplay gate. Executed fetched source modules via V8 CommonJS adapter with strict equality, recursive array/plain-object equality and truth assertions; not native Node assert, not full checkout or gate. Source paths and GitHub tree blob IDs:
- engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894
- turn-dispatcher.js 55b0bcf3f1653c64b4e06bc95d7e917a480562a0
- turn-kernel.js 94657896e1f8e471ceb2e9a65d1842b6102dff18
- round-driver.js fbaad78865adbddde1ea6651e6a501dc0bde3203
- draw-enabled-action-contract-test.js dac6e9287518edefdc9e633e0cfd097e85cb58fb
- mixed-finish-exhaustive-contract-test.js 8aac88af43ce20af7ae1e4d183acb1b345e9c7bf

Both exported test() calls returned passed:true. Draw suite: 71 assertions, seven fixture categories (no unnecessary draw, ordinary/double/mixed draw-enabled play, round integration, retained unplayable draw, pass counter and finish precedence). Mixed suite: 1095 assertions, 33 mixed finish permutations for 1–4 doubles, 408 score-floor pairs, three negative fixtures. Total 1166 assertions. Source fetched from main at observed snapshot; blob IDs listed from tree, not independently byte-hashed in this execution. Adapter supports only assertion methods used by these suites. Native Node replay still required. Branch unlock, block allocation, loneZero remain provisional.

New deals 0, seed set none, strategies none, hidden worlds 0, rollouts 0. No new win, remainder, length, block frequency, minus frequency, double value, branch effects or regret estimates. Prior partial cohorts: 11,024 initial deals and 1,000 full rounds; historical 180,000 matched-seat rounds separate. Full gate not run. Finding: coded mixed finish and draw/pass behavior satisfy these fixtures; no new strategy finding. Next: execute native Node dependency closures for these suites, opening-stock and block-boundary regressions; complete pinned checkout and full gates. No live files or Actions modified.
