# 2026-11-04 13:52 Asia/Baku — inactive-side permutation coverage

- Engine/rules: `qosha-research-0.5.3`, recovered `qosa-1.0.0` (3 players × 9 tiles); branch number-unlocking remains provisional.
- Deals executed: **0**. Seeds: none. Strategies: none. Existing 4,000 accepted-outcome replay cohorts and older strategy samples remain separate; cumulative verified scale is unchanged.
- Code: extended `simulator/branch-permutation-regression.js` with a fourth fixture containing one inactive side and three active sides, with both ordinary placements and a two-double opening sequence. The test now asserts that no single/mixed action targets an inactive side, and compares legal action multisets and post-action branch state under all 24 relabelings. **96 fixture-permutation comparisons are specified, not yet executed.**
- Finding: the previous three fixtures used four active sides, so they could not detect a relabeling bug affecting the inactive/locked side flag. The new fixture addresses that coverage gap; this is a test-design finding, not evidence of a strategy advantage.
- Metrics: 0 new wins, 0 block outcomes, 0 minus events, 0 remainder or regret observations; no new strategic claim.
- Confidence/limitations: source-level checkpoint only; no runtime pass is claimed. A passing metamorphic check would verify branch-label symmetry under the research engine, not establish the physical game's locking semantics.
- Exact next action: execute `node qosha-research/simulator/branch-permutation-regression.js` and `node qosha-research/simulator/round-conservation-regression.js` in an executable checkout, persist actual counts/failures, and only then resume matched-seed strategy trials. No live PWA files modified.
- Code commit: https://github.com/Mikayilzade/domino-schetki/commit/ad6d1557031df896ecabc193fff22e3b5c80a1fd
