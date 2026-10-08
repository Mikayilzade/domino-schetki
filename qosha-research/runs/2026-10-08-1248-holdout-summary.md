# Independent same-side connector holdout — 2026-10-08 12:48 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9. Reproduce with `node qosha-research/simulator/same-side-holdout.js 24000 27000 15 30`. The persisted runner's selfTest passed in a V8 CommonJS harness (Node CLI not run). Discovery seeds 24000..26999, world seed = 4100000 + 1000*dealSeed + worldIndex. Policies: closed-branch-control, min-hand-pips, fast-doubles. 45 reachable positions, 30 worlds each: 1,350 worlds, 20,880 continuations, 0 unresolved. Full-round cumulative 180,000 unchanged; cumulative hidden worlds 18,310 (prior 16,960 + 1,350).

Same-side/same-opened-X comparison: KEEP HIGH minus KEEP LOW, finish-first percentage points, equal-weight positions. Each group has 15 positions. Approximate 95% CIs use position variation.

- Both destinations open: branch-control 0.00 [−7.96,+7.96]; min-pips −4.22 [−11.86,+3.41]; fast-doubles −4.00 [−11.97,+3.97].
- One open: branch-control +8.44 [−1.97,+18.86]; min-pips +2.22 [−6.30,+10.74]; fast-doubles −4.00 [−14.34,+6.34].
- Both unopened: branch-control +4.67 [−1.64,+10.97]; min-pips 0.00 [−7.57,+7.57]; fast-doubles +5.56 [−3.50,+14.61].

Finding: earlier exploratory 5–10 pp high-connector advantage when both destinations are open DID NOT REPLICATE on disjoint seeds. No reliable general rule. Observed eligibility among 3,000 seeds: both-open 61, one-open 422, both-closed 2,511; 15/group quota oversamples rare cases. Limits: first-eligible branch-control discovery, assumed branch rules, unassigned block winner, three bot policies, small groups, no multiple-testing correction.

Next: run Node CLI selfTest; collect >=50 independent both-open positions from seeds 27000+; change discovery policy and stratify by opponent hand sizes. Do not promote a human rule yet.
