# Qoşa açdı — 2026-10-19 06:50 Asia/Baku

Engine: qosa-research-0.5.3; rules: qosa-1.0.0; 3 players × 9 stones, later round.
New seeds 2023000..2023999: 1,000 independent deals × 3 seat rotations × 2 bot mixes = **6,000 complete rounds**, 0 unresolved. Same seeds/deals for compared policies. Reproduction: `node qosha-research/simulator/public-pass-history-tournament.js test` then `node qosha-research/simulator/public-pass-history-tournament.js 2023000 1000`. Executed in V8 CommonJS harness using GitHub branch dependencies; deterministic test 18/18 rounds green. Node CLI replay pending.

## Arm A: public-history-pass / public-next-pass / closed-branch-control
3,000 rounds; 284 blocks; 12,779 public pass events; 27.214 mean turns.
Finish-first counts: 1,027 / 866 / 823, rates **34.2333% / 28.8667% / 27.4333%**. History vs uniform **+5.3667 pp**.
Mean remaining pips: **6.010 / 7.2387 / 6.7163**; medians 4 / 6 / 5.
Minus finishes −10: 179/199/147; −20: 18/20/13; −30: 0/0/0; −40: 0/0/0.
History changed preferred move in 719/16,247 multi-choice decisions, all with pass-constrained hidden allocation (4,895 evidence-bearing decisions). Mean starting doubles 2.2513, ending doubles history/uniform/control 0.0060/0.0047/0.0123.

## Arm B: public-history-pass / public-next-pass / min-hand-pips
3,000 rounds; 257 blocks; 11,949 public pass events; 26.6887 mean turns.
Finish-first counts: 1,160 / 990 / 593, rates **38.6667% / 33.0000% / 19.7667%**. History vs uniform **+5.6667 pp**.
Mean remaining pips: **5.087 / 6.656 / 7.575**; medians 3 / 5 / 6.
Minus finishes −10: 224/265/48; −20: 21/21/0; −30: 1/0/0; −40: 0/0/0.
History changed preferred move in 938/17,003 multi-choice decisions, all with pass-constrained allocation (5,390 evidence-bearing decisions). Mean starting doubles 2.2513; ending doubles history/uniform/minpips 0.0077/0.0077/0.0080.

## Finding and confidence
**Provisional independent replication** of previous-pass information benefit vs otherwise identical public-next-pass policy (previous disjoint seeds 2022000..2022999: +7.23/+7.17 pp). These are competitive tournament rates, not causal per-position regrets. Seat rotations share deal seeds; no deal-clustered confidence interval computed for this cohort. The engine's branch-locking semantics remain assumption-labelled; bots deterministic; block winners not assigned; no 101-match outcomes.

Posterior assumes stock empty after 3×9 opening, and each previous pass rules out every tile then playable in that opponent's hand. All remaining hidden allocations treated as equally likely; voluntary move choice likelihood omitted. No evidence yet for human-play effectiveness.

## Cumulative and next
Previous GitHub-confirmed 201,000 full rounds; recovered 2021000..2021999 (6,000) and 2022000..2022999 (6,000); new 2023000..2023999 (6,000): **219,000 documented simulated full rounds**, historical 4,000 excluded; previously quoted 215,520 not reconciled. Recovered older checkpoint reports and executable runner are in this same commit; older runs were not independently replayed this pass.

**Exact next action:** run Node CLI regression, then stratify gains by next-opponent hand size ≤2, consecutive pass count, forced unknown tile count and open branch numbers; validate on fresh independent seeds **2024000..2024999** using matched deals. Never touch live scoreboard/PWA files.
