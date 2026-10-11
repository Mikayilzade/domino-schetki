# Geometry matching audit — 2026-10-12 01:50 Asia/Baku

Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0, 3 players x 9 stones.

Source: runs/2026-10-12-0057-geometry-paired.json; discovery seeds 800000..849999, 26,580 scanned deals, 120 eligible positions. Discovery policy min-hand-pips; continuation policies closed-branch-control, min-hand-pips, fast-doubles.

New deals/worlds/continuations: 0/0/0. Prior 150 hidden allocations and 1,800 continuations are not counted again. Verified cumulative full-strategy rounds: 180,000, historical 4,000 separate.

Audit finding: 2 nominal strict pairs, 0 pairs with identical ends on all four branches. Seeds 812495 vs 819603 differ on right and down; seeds 813164 vs 823203 also differ on right and down. All 3 relaxed pairs also have different branch ends. Nominal strict matching used action side/from and focal hand size, NOT complete board geometry. Stored rows also omit opened-number and active-branch flags. Therefore the prior numerical X=0 vs X>0 comparison does not isolate the 0-0 effect. No reliable new gameplay finding.

Validation: directly compared seed-indexed rows from the persisted JSON; the audit returned 2 nominal strict pairs and 0 with equal four-branch ends. No new Node CLI tests or simulations claimed.

Confidence: high for recorded branch-end mismatch; low for causal interpretations of previous X=0 versus X>0 results.

Exact next action: implement a reproducible full-state geometry signature including four active/end pairs, opened numbers, focal-relative opponent hand sizes and stock size. Find >=30 truly matched pairs on independent seeds, or prioritize within-state equal-pip comparisons if full-state pairs are too sparse. Do not touch scoreboard/PWA files.
