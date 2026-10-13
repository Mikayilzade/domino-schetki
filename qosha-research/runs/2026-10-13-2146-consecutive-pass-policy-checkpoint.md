# Pass-aware choice vs baseline — 2026-10-13 21:46 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3×9. Fresh seeds 2940000..2949999, 1639 deals scanned, 30 first-eligible disagreement positions, 1200 fixed-visible hidden worlds (40 each), 0 unresolved. No new full strategy rounds; prior verified 180,000 (historical 4,000 separate).

Method: exclude immediate finishes; choose the action maximizing exact next-pass probability `C(N-K,h)/C(N,h)`, preserving baseline on ties. Same hidden worlds and deterministic continuation policy for both actions; choices use only visible information.

- closed-branch-control: changed 10/30; next-pass 29.28% -> 36.19%; first-place delta -1.83 pp, exploratory 95% [-9.45, 5.78] pp; remainder 0.146 pips; minus-finish 3.08 pp; block 0.92 pp.
- min-hand-pips: changed 29/30; next-pass 3.16% -> 36.19%; first-place delta 1.17 pp, exploratory 95% [-7.09, 9.42] pp; remainder -0.043 pips; minus-finish 14.17 pp; block -1.00 pp.

Finding: no reliable first-place advantage (both intervals overlap zero). Higher minus-finish versus min-hand-pips is exploratory and conditional on selected disagreements, not a universal strategy.

Validation: deterministic two-position V8 CommonJS replay passed (2940101, 2940161, 20 worlds); all continuations resolved; source state unchanged. Node CLI not run.

Limitations: first-eligible and disagreement selection, uniform allocations, fixed bots, assumed branch semantics, block winner unassigned, unadjusted exploratory intervals.

Reproduce: `node qosha-research/simulator/consecutive-pass-policy-runner.js test`; `node qosha-research/simulator/consecutive-pass-policy-runner.js 2940000 2950000 30 40`. Raw JSON `runs/2026-10-13-2146-consecutive-pass-policy.json`.

Exact next: independent disjoint-seed holdout of win/minus effect, especially K=0, and nonconsecutive-pass history replay with intervening plays.
