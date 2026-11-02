# Live PWA match-scoring contract — 2026-11-02T19:54:23+04:00 (Asia/Baku)

## Scope

Read-only inspection of the active scoreboard entry point and its loaded script chain, followed by a small source-derived match-scoring adapter. No domino deals were simulated and no strategy was compared. The adapter is an implementation compatibility contract, not a physical-rule ruling.

## Source finding

- `index.html` loads `scoreboard.js`, `scoreboard-extra.js`, and the versioned scoreboard scripts through v19. It does not load `app.js`, `qosha-rules.js`, or `qosha-101.js`.
- The active Qoşa implementation marks a player exploded at score **>=101**. The score update is floored at zero. A result is prepared when at most two players remain; two survivors are ranked by ascending score and receive 2/1 daily points.
- A one-survivor branch awards 3 points, but the normal sequential stop-at-two flow makes it unreachable from a 3+ player start; the test covers it only as a separate 2-entity code-path fixture.
- Help text says “завершение гошой снимает 10”, but does not define whether this is the recovered `loneZero=10` parameter or what exact hand qualifies. The score entry is manual. `loneZero=10` remains unresolved.
- `qosha-101.js` is an unreferenced legacy target-win-at-101 variant; it must not be mixed with the active bust-at-101 behavior.

## Validation

Node v22.16.0; exact research `engine.js` blob hash verified as `82e5bd544a57683d5b4f7812beb2d4abf80da894` in an isolated temporary directory.

- `match-scoring-test.js`: **23 assertions passed** across 100/101 threshold, zero-input no-op, 3-player survivor places, one-survivor branch, a 5-player sequential explosion path, score floor, exploded-entity guard, and invalid inputs.
- No full PWA browser integration was run. No live scoreboard/PWA file was modified.

## Cohort, finding, and limitations

- New deals: 0; seeds: none; strategies: none.
- Cumulative separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive cohort summaries, no global deduplication.
- Useful finding: the active PWA implementation supports `bust=101` and gives a concrete match-points contract, but this does not authenticate physical table rules or the `loneZero=10` mapping. No tactical finding and no strategy promoted.
- Confidence is high for the inspected code path and its isolated tests; low/none for physical-rule authentication. Survivor ties and the one-survivor path are implementation-only.

## Exact next action

Treat “gosha finish −10” as a separate candidate interpretation of `loneZero=10`; require a concrete hand/finish fixture before accepting it. Then keep match scoring under a named source-backed variant and continue authenticating branch-lock/open and blocked-round winner/tie rules before large strategy batches.

Files: `simulator/match-scoring.js`, `simulator/match-scoring-test.js`, `runs/2026-11-02-1954-live-pwa-match-scoring-contract.json`.
