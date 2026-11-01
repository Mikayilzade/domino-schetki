# Matched legal branch-opening double vs ordinary single — 2026-11-02 01:00:14 +04 (Asia/Baku)

## Cohort and method
- Engine qosha-research-0.5.3; rules recovered qosa-1.0.0 3x9 + stock; global number-unlock/branch geometry PROVISIONAL.
- Reserved seeds 3418620–3421019; profile windows are disjoint. One position per scanned seed/profile; focal seat rotates as (seed+1) mod 3.
- 1970 deal draws, 1970 unique complete allocations, 0 duplicates. Tile-conservation and deal-shape checks: 1970/1970.
- 1970 discovery trajectories: 1902 finishes / 68 blocks / 0 unresolved. 96 positions; quota 12 per next-opponent hand size 1–4 and profile.
- Both candidate actions are legal: one unopened-number double-sequence (one double) vs an ordinary single. Choose minimum pip gap; equal-pip pairs are separated. Ties use symmetric action-orbit/member sampling. Continuation policy and action-orbit tie-break are matched.
## Hidden-world accounting
- 4608 draws; 1214 unique within-state allocations; 3394 repeats. Mean unique worlds/position 12.65 (range 1–43); mean ESS 10.64/48.
- 2428 paired continuations after dedup. Duplicate seed pairs are preserved in JSON.
## Paired deltas (double minus ordinary single)
| Profile | Next hand | n positions | Unique worlds | Equal-pip n | Next-opponent finish (pp) | Focal finish-first (pp) | Focal remainder (pips) | Expected minus loss |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| min-hand-pips | 1 | 12 | 36 | 1 | 47.92 ± 18.87 | -10.42 ± 16.47 | 4.54 ± 2.10 | -0.83 ± 1.63 |
| min-hand-pips | 2 | 12 | 92 | 0 | 1.67 ± 3.27 | -12.92 ± 13.70 | 0.67 ± 1.35 | -1.64 ± 1.97 |
| min-hand-pips | 3 | 12 | 160 | 0 | 0.00 ± 0.00 | -16.06 ± 19.49 | 1.64 ± 2.05 | -1.75 ± 1.52 |
| min-hand-pips | 4 | 12 | 332 | 1 | 0.00 ± 0.00 | -17.89 ± 8.52 | 1.00 ± 1.10 | -2.00 ± 1.44 |
| closed-branch-control | 1 | 12 | 25 | 0 | 30.56 ± 19.78 | -10.00 ± 17.73 | 3.39 ± 1.88 | -1.33 ± 1.83 |
| closed-branch-control | 2 | 12 | 68 | 0 | 0.00 ± 0.00 | -39.72 ± 27.02 | 2.20 ± 1.40 | -3.96 ± 2.79 |
| closed-branch-control | 3 | 12 | 182 | 0 | 0.00 ± 0.00 | -25.95 ± 15.98 | 1.06 ± 0.56 | -1.01 ± 0.94 |
| closed-branch-control | 4 | 12 | 319 | 4 | 0.00 ± 0.00 | -15.96 ± 14.84 | 0.16 ± 2.30 | -1.12 ± 0.70 |
## Profile-wide exploratory estimates
- **min-hand-pips** (n=48): next-opponent finish 12.40 ± 7.48 pp; focal finish-first -14.32 ± 7.35 pp; remainder 1.96 ± 0.93 pips; minus loss -1.56 ± 0.81 points.
- **closed-branch-control** (n=48): next-opponent finish 7.64 ± 6.10 pp; focal finish-first -22.91 ± 9.96 pp; remainder 1.70 ± 0.88 pips; minus loss -1.85 ± 0.92 points.
## Finding and limitations
Some small strata have intervals away from zero, but multiple comparisons and provisional branch geometry prevent a reliable strategy claim; no policy is promoted.
This is not a pure unlock ablation: tile identity/retained hand and sometimes pip count differ. Global number-unlock geometry remains provisional. Hidden worlds condition on no-stock pass exclusions, not opponent action-choice likelihood. Only two synthetic continuation profiles; exploratory position-cluster CIs. Block winner, loneZero, bust/101 scoring, and physical branch rules remain unauthenticated. Pairwise hindsight regret covers only these two candidates, not an executable perfect-information strategy.
## Exact next action
Replicate on fresh seeds from 3421020, expand equal-pip candidates, and seek an authentic table trace/ruling for global-vs-local number opening and block scoring.
