# Negative action validation checkpoint — 2026-11-04 19:49 Asia/Baku

- **Engine/rules:** `qosha-research-0.5.3` / recovered `qosa-1.0.0`, 3 players × 9 stones; number-opening and branch semantics provisional.
- **Executed deals:** 0 new; **seed set:** none (constructed deterministic states). **Strategies:** none; legality validation only.
- **Code:** new `simulator/illegal-action-regression.js` and inclusion in `simulator/validation-gate.js`.
- **Coverage authored:** eight negative choices (inactive branch, forged endpoint, mismatched side, unavailable double, duplicate double, forged mixed finish, missing required action, forbidden action on pass), plus one positive legal placement. Assert unchanged input state after rejections.
- **Key metrics:** 8 negative cases and 1 positive control **prepared; 0 executed/verified**. The existing 1,000-deal conservation smoke set remains `21000000..21000999`, not rerun. Historical 4,000 tie-audit accepted outcomes and older 180,000 matched-seat rounds remain separate; neither is added to a new sample.
- **Finding:** the dispatcher currently validates a proposed action against enumerated legal choices; the new test explicitly protects against forged choices and unintended state mutation. This is a source-inspection observation, **not a verified passing test or strategy advantage**.
- **Confidence/limitations:** GitHub connector read/write worked; local git checkout failed `Could not resolve host: github.com`. Therefore Node regression execution remains unverified. Constructed states do not independently authenticate physical table rules.
- **Exact next action:** run `node qosha-research/simulator/validation-gate.js` in a complete checkout; save JSON stdout and investigate any failed suite. Only after all gates pass run fresh matched-seed 3×9 strategy comparisons and report their seed ranges separately.
- **Live scoreboard/PWA:** unchanged.
