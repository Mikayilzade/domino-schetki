# Qoşa pass-mechanism diagnostic — 2026-10-16 19:53 +04:00

Engine: qosa-research-0.5.3; recovered qosa-1.0.0 (branch semantics provisional). Primary 3x9. V8 CommonJS execution of repository modules; Node CLI not run. Deterministic 2-world replay self-test: PASS. Zero unresolved forced continuations.

## Cohort A
- Seeds: 360000..360599 (first 30 eligible; 34 scanned), worldSeedBase 98000000; 900 hidden worlds, 5400 candidate continuations.
- Immediate next-opponent pass groups: new-pass 63, unchanged-no-pass 832, unchanged-pass 3, lost-pass 2.
- Finish-first keep-minus-open (equal position weight): closed-branch-control 17.11 pp; min-hand-pips 11.78 pp; fast-doubles 7.44 pp.
- When pass status unchanged (descriptive pooled-world means): closed-branch-control 15.99 pp for no-pass/no-pass (n=832); min-hand-pips 13.10 pp for no-pass/no-pass (n=832); fast-doubles 7.45 pp for no-pass/no-pass (n=832).

## Cohort B
- Seeds: 390000..390599 (first 30 eligible; 34 scanned), worldSeedBase 99000000; 900 hidden worlds, 5400 candidate continuations.
- Immediate next-opponent pass groups: new-pass 129, unchanged-no-pass 765, unchanged-pass 4, lost-pass 2.
- Finish-first keep-minus-open (equal position weight): closed-branch-control 15.89 pp; min-hand-pips 22.78 pp; fast-doubles 19.00 pp.
- When pass status unchanged (descriptive pooled-world means): closed-branch-control 13.46 pp for no-pass/no-pass (n=765); min-hand-pips 19.74 pp for no-pass/no-pass (n=765); fast-doubles 15.03 pp for no-pass/no-pass (n=765).

Total this checkpoint: 1800 hidden worlds and 10800 forced candidate continuations; **0 new full strategy rounds**. Persisted full-round reference from previous checkpoint: **186,000**; historical 4,000 separate. Do not mix hidden worlds with complete strategy rounds.

Interpretation: classifying by next-opponent pass after the focal move is conditioning on a post-treatment outcome; it is a descriptive mechanism diagnostic, NOT a causal mediation estimate. Different tile types change branch geometry, legal mobility, and discarded pips simultaneously. If advantage persists when immediate pass status is unchanged, pass creation alone cannot be its complete descriptive explanation. This remains bot/model-specific and provisional.

Reproduction protocol used in V8: min-hand-pips discovery (first eligible choice with X-X and X-Y), lexicographically first legal single retaining X-X+connector versus lexicographically first X-X opening, `force` from existing `connector-equal-pip-runner.js`, `sampleWorld` from `hidden-world.js`; seeds 360000..360599 and 390000..390599, first 30 eligible positions each; 30 worlds/position, seed = 98000000/99000000 + 1000*dealSeed + worldIndex; continuation policies closed-branch-control, min-hand-pips, fast-doubles. Detailed compact data is saved in `runs/2026-10-16-1953-pass-diagnostic-compact.json`. **Reproducibility limitation:** standalone `simulator/preserve-pass-diagnostic.js` could not be attached to the branch (GitHub connector safety check rejected the code write). The unreferenced source blob `9e263d99d6167010da4595c51144062cd3dcf07e` was created during an unsuccessful tree/ref write but must NOT be treated as branch-persisted code. The compact JSON contains the per-position deltas and exact seed specification; no Node CLI run claimed. Next: persist standalone code safely, verify Node CLI, match immediate branch geometry and discarded pips; evaluate counterconditions under alternative discovery policies. No scoreboard/PWA edits.
