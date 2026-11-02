# Exact late-game hidden-world legal-choice audit — 2026-11-02 04:06 +04 (Asia/Baku)

## Scope and reproducibility
- Engine: qosha-research-0.5.3; recovered qosa-1.0.0; primary mode 3 players × 9 stones.
- Two disjoint seed cohorts. No duplicate complete deal allocations and no unresolved discovery rounds.
- Root positions were pass-free, stock-empty states. The focal hand and complete played-tile list were fixed; all remaining opponent hands were enumerated exactly, with seat identity preserved.
- Every selected position's actual discovery allocation was present in its exact support (153/153). The complete root legal-action set was invariant across all hidden assignments.
- Candidate arms: one legal single unopened-number double vs one ordinary single. Continuations used the same hidden allocation, same world-derived seed, and the existing branch-label symmetric action-orbit tie-break under two policies: closed-branch-control and min-hand-pips.
- Position-cluster 95% half-widths below describe variability across selected positions; they are not population confidence intervals.

## Cohorts
| Cohort | Seeds | Deals / unique allocations | Positions | Exact worlds within positions | Matched world-policy pairs | Candidate rollouts |
|---|---|---:|---:|---:|---:|---:|
| Minimum pip-gap pair | 3445020–3445770 | 751 / 751 | 120 | 1,746 | 3,492 | 6,984 |
| Exact equal-pip pair | 3445771–3454290 | 8,520 / 8,520 | 33 | 361 | 722 | 1,444 |
| Total | disjoint | 9,271 / 9,271 | 153 | 2,107 | 4,214 | 8,428 |

The 2,107 exact-world records are unique within each visible position, not globally deduplicated across different positions. Exact support sizes ranged from 3 to 20. Discovery trajectories: 8,992 finishes, 279 blocks, 0 unresolved.

## Main model signal — exact equal-pip cohort
Double minus ordinary single, averaged equally over 33 selected positions:

| Metric | closed-branch-control | min-hand-pips |
|---|---:|---:|
| Focal first-finish chance | −24.85 ± 13.02 pp | −17.73 ± 12.20 pp |
| Focal remaining pips | +1.97 ± 0.79 | +1.56 ± 0.74 |
| Next opponent immediate finish | +4.29 ± 5.03 pp | +4.29 ± 5.03 pp |
| Next opponent pass | −27.47 ± 7.18 pp | −27.47 ± 7.18 pp |
| Next opponent playable tiles | +1.06 ± 0.24 | +1.06 ± 0.24 |

The equal-pip cohort was stratified by next-opponent hand size: 3 positions with 1 stone, 15 with 2 stones, and 15 with 3 stones. In the one-stone stratum, modeled next-opponent immediate finish rose by about 47 pp, but n=3 only; this is a diagnostic, not a stable estimate.

## Broader minimum-gap cohort
The direction repeats, but the comparison is confounded by different discarded pip counts (mean absolute pip gap 3.07; only 8/120 pairs were equal-pip):
- Focal first-finish chance: −31.65 ± 5.67 pp under closed-branch-control; −29.60 ± 5.40 pp under min-hand-pips.
- Focal remaining pips: +1.29 ± 0.40 and +1.30 ± 0.38.
- Next-opponent immediate finish: +1.25 ± 1.82 pp; interval includes zero.
- Next-opponent pass: −29.44 ± 5.49 pp; playable tiles: +1.18 ± 0.11.

## Interpretation and limitations
The repeated model signal is that, in these selected late pass-free states, opening a number with a double can increase the next opponent's mobility while reducing the focal player's modeled first-finish chance—even when discarded pips are equal. This is not yet a real-game tactic recommendation:
- Global-ever-open branch semantics remain provisional; the current-only alternative was not evaluated here.
- Pass evidence was avoided by restricting to pass-free roots. Prior opponent tile choices are not included in the posterior likelihood, and trajectory-based selection can still bias the sampled positions.
- Only two synthetic continuation policies; exact allocation support does not integrate all randomized tie-break outcomes.
- Block winner, loneZero, and match scoring remain unauthenticated. No strategy was promoted.

## Regression
The new runner's deterministic replay, exact support, actual-world inclusion, legal-action invariance, equal-pip selection, and paired-continuation checks passed: 7 assertions under Node 22.16.0 in a local mirror of the repository modules. A clean checkout integration run was not possible in this container because GitHub DNS resolution failed; the committed test imports the repository modules directly.

## Exact next hypothesis/action
Implement separate pass-history-conditioned hidden-world filters for global-ever-open and current-only branch models. Reconstruct each pass-time hand from the current hidden hand plus that seat's tiles played after the pass; report global-only, current-only-exclusive, joint, and neither support counts. Then compare the same legal candidates on matched exact worlds. Continue seeking an authentic table trace/ruling for branch opening and block scoring.

Files: simulator/finite-late-world-choice.js, simulator/finite-late-world-choice-test.js, runs/2026-11-02-exact-late-hidden-world-choice.json.
