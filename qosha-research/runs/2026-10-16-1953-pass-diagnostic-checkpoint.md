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

Reproduce: `node qosha-research/simulator/preserve-pass-diagnostic.js test`; `node qosha-research/simulator/preserve-pass-diagnostic.js 360000 360600 30 30 98000000`; `node qosha-research/simulator/preserve-pass-diagnostic.js 390000 390600 30 30 99000000`. Data: `runs/2026-10-16-1953-pass-diagnostic-A.json`, `...-B.json`. Next: match immediate branch geometry and discarded pips; evaluate counterconditions under alternative discovery policies. No scoreboard/PWA edits.
