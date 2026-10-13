# Independent consecutive-pass policy holdout — 2026-10-13 22:49 Asia/Baku

Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; mode 3×9.
Fresh seeds 2950000..2964999 (1334 scanned), 30 selected first-eligible disagreement positions, 40 fixed-visible hidden worlds each = 1200 matched worlds. 0 unresolved. No new complete strategy rounds; verified full-round baseline remains 180000 (historical 4000 separate). Combined two consecutive-pass-policy cohorts: 2400 matched hidden worlds.

Compared baseline against maximizing exact probability of next opponent pass, with same hidden worlds and deterministic continuation bots. Test `consecutive-pass-policy-runner.js:test` passed in V8 CommonJS (two positions, 20 worlds), Node CLI not run.

- closed-branch-control: changed 10/30, next-pass 27.13% -> 40.94%, finish-first delta +3.08 percentage points, exploratory 95% [-0.38, +6.55]; mean remainder delta +0.140 pips; minus-finish delta -1.92 pp.
- min-hand-pips: changed 30/30, next-pass 6.34% -> 40.94%, finish-first delta -3.08 pp, exploratory 95% [-12.09, +5.92]; mean remainder delta +0.333 pips; minus-finish delta +9.00 pp, exploratory 95% [-1.40, +19.40].
- Both win intervals overlap zero; no reliable win advantage. Prior min-pips minus +14.17 pp was exploratory; the independent +9.00 pp also has CI overlapping zero.

Reproduce: `node qosha-research/simulator/consecutive-pass-policy-runner.js test` and `node qosha-research/simulator/consecutive-pass-policy-runner.js 2950000 2965000 30 40`. The runner hardcodes a prior timestamp; this checkpoint is dated 22:49. Seed formula `(820000000+Math.imul(dealSeed,401)+worldIndex)>>>0`.

Confidence/limitations: exploratory, first-eligible/disagreement selection, 30 positions, uniform unknown allocations, fixed bots, assumed branch semantics, block winner unassigned, unadjusted intervals.

Exact next: independent K=0 vs K>0 and next-player hand-size strata, and whether keeping a multi-double finishing chain changes the value of forced passes.
