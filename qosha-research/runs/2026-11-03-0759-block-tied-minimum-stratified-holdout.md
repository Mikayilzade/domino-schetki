# Tied-minimum block trace holdout — 2026-11-03T07:59:49+04:00 (Asia/Baku)

## Design and reproducibility

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0; 3 players × 9 stones + one stock. All branch models and block-candidate interpretations remain provisional.
- **Fresh holdout:** seeds 9002000–9003999; 2000 draws, 2000 unique seat-labelled allocations, 0 duplicate allocations.
- **Rounds:** 48000 total (12000 per model); four models × two policy mixes × three seat rotations. No unresolved rounds.
- **Strategies:** mix 1 = random-legal / min-hand-pips / closed-branch-control; mix 2 = fast-doubles / moderate-double-hold / closed-branch-control. Policy assignment rotates across seats.
- **Trace retention:** every block with a tied minimum-pip candidate set was stored with a compact turn/action replay log, final hands/geometry, candidate sets and checksum. 1921/1921 traces replayed exactly; 0 mismatches.
- **Regression fixture:** 24-deal deterministic pilot, 576 model-rounds per run; 39 tied traces replayed in the pilot and repeated outputs matched. This fixture is not pooled into the holdout.
- **Execution:** exact GitHub source blobs were run in an isolated V8 harness. A clean Node checkout remains unavailable because this runtime cannot resolve github.com.

## Overall model diagnostics

| Model | Rounds | Blocks | Block rate (95% CI) | Min-pip tie among blocks | Last passer in min-set | Pip-vs-tile set agreement | Tied traces |
|---|---:|---:|---|---|---|---|---:|
| global-ever-open | 12000 | 431 | 431/12000 = 3.59% [3.24–3.95%] | 14/431 = 3.25% [1.47–5.02%] | 159/431 = 36.89% [32.12–41.66%] | 54/431 = 12.53% [9.36–15.70%] | 14 |
| current-all | 12000 | 11232 | 11232/12000 = 93.60% [93.13–94.07%] | 655/11232 = 5.83% [5.37–6.29%] | 5045/11232 = 44.92% [43.91–45.92%] | 5326/11232 = 47.42% [46.35–48.48%] | 655 |
| local-first | 12000 | 11823 | 11823/12000 = 98.52% [98.25–98.80%] | 642/11823 = 5.43% [4.95–5.91%] | 4845/11823 = 40.98% [39.93–42.02%] | 5176/11823 = 43.78% [42.67–44.89%] | 642 |
| local-last | 12000 | 11904 | 11904/12000 = 99.20% [99.00–99.40%] | 610/11904 = 5.12% [4.68–5.57%] | 4905/11904 = 41.20% [40.17–42.24%] | 5175/11904 = 43.47% [42.35–44.60%] | 610 |

A block is empty stock plus at least three consecutive passes. Minimum-pip candidates, fewest-tile candidates and last passer are recorded without assigning a winner or points.

## Stratification by policy mix and seat rotation

| Model | Mix | Rotation | Rounds | Blocks | Block rate | Tie among blocks | Last passer in min-set | Set agreement |
|---|---:|---:|---:|---:|---|---|---|---|
| global-ever-open | 1 | 0 | 2000 | 54 | 2.70% [1.99–3.41%] | 9.26% [1.53–16.99%] | 48.15% [34.82–61.48%] | 25.93% |
| global-ever-open | 1 | 1 | 2000 | 68 | 3.40% [2.61–4.19%] | 1.47% [0.00–4.33%] | 26.47% [15.98–36.96%] | 8.82% |
| global-ever-open | 1 | 2 | 2000 | 71 | 3.55% [2.74–4.36%] | 4.23% [0.00–8.91%] | 42.25% [30.76–53.75%] | 11.27% |
| global-ever-open | 2 | 0 | 2000 | 90 | 4.50% [3.59–5.41%] | 2.22% [0.00–5.27%] | 33.33% [23.59–43.08%] | 7.78% |
| global-ever-open | 2 | 1 | 2000 | 65 | 3.25% [2.47–4.03%] | 0.00% [0.00–0.00%] | 35.38% [23.76–47.01%] | 10.77% |
| global-ever-open | 2 | 2 | 2000 | 83 | 4.15% [3.28–5.02%] | 3.61% [0.00–7.63%] | 38.55% [28.08–49.03%] | 14.46% |
| current-all | 1 | 0 | 2000 | 1891 | 94.55% [93.55–95.55%] | 5.66% [4.62–6.70%] | 42.46% [40.24–44.69%] | 47.54% |
| current-all | 1 | 1 | 2000 | 1868 | 93.40% [92.31–94.49%] | 5.89% [4.82–6.96%] | 46.95% [44.68–49.21%] | 47.75% |
| current-all | 1 | 2 | 2000 | 1874 | 93.70% [92.63–94.77%] | 5.98% [4.90–7.05%] | 44.98% [42.73–47.24%] | 47.39% |
| current-all | 2 | 0 | 2000 | 1852 | 92.60% [91.45–93.75%] | 6.43% [5.31–7.54%] | 45.46% [43.20–47.73%] | 46.44% |
| current-all | 2 | 1 | 2000 | 1873 | 93.65% [92.58–94.72%] | 5.50% [4.47–6.53%] | 44.85% [42.59–47.10%] | 47.20% |
| current-all | 2 | 2 | 2000 | 1874 | 93.70% [92.63–94.77%] | 5.55% [4.51–6.59%] | 44.82% [42.57–47.08%] | 48.19% |
| local-first | 1 | 0 | 2000 | 1982 | 99.10% [98.69–99.51%] | 5.50% [4.50–6.50%] | 39.51% [37.35–41.66%] | 44.65% |
| local-first | 1 | 1 | 2000 | 1985 | 99.25% [98.87–99.63%] | 5.14% [4.17–6.11%] | 41.86% [39.69–44.03%] | 44.08% |
| local-first | 1 | 2 | 2000 | 1974 | 98.70% [98.20–99.20%] | 5.93% [4.89–6.97%] | 41.13% [38.96–43.31%] | 45.19% |
| local-first | 2 | 0 | 2000 | 1966 | 98.30% [97.73–98.87%] | 5.24% [4.25–6.22%] | 41.15% [38.97–43.33%] | 42.88% |
| local-first | 2 | 1 | 2000 | 1957 | 97.85% [97.21–98.49%] | 5.26% [4.27–6.25%] | 41.65% [39.46–43.83%] | 43.23% |
| local-first | 2 | 2 | 2000 | 1959 | 97.95% [97.33–98.57%] | 5.51% [4.50–6.52%] | 40.58% [38.41–42.76%] | 42.62% |
| local-last | 1 | 0 | 2000 | 1993 | 99.65% [99.39–99.91%] | 5.62% [4.61–6.63%] | 40.44% [38.29–42.60%] | 44.10% |
| local-last | 1 | 1 | 2000 | 1988 | 99.40% [99.06–99.74%] | 4.58% [3.66–5.50%] | 41.60% [39.43–43.77%] | 44.42% |
| local-last | 1 | 2 | 2000 | 1983 | 99.15% [98.75–99.55%] | 4.54% [3.62–5.45%] | 40.24% [38.08–42.40%] | 44.68% |
| local-last | 2 | 0 | 2000 | 1978 | 98.90% [98.44–99.36%] | 5.11% [4.14–6.08%] | 42.26% [40.09–44.44%] | 42.72% |
| local-last | 2 | 1 | 2000 | 1987 | 99.35% [99.00–99.70%] | 5.54% [4.53–6.54%] | 41.97% [39.80–44.14%] | 42.17% |
| local-last | 2 | 2 | 2000 | 1975 | 98.75% [98.26–99.24%] | 5.37% [4.37–6.36%] | 40.71% [38.54–42.88%] | 42.73% |

The strata share the same deal seeds, but trajectories can diverge by model and policy assignment. Intervals are approximate 95% deal-clustered intervals; each mix/rotation cell uses one round per seed.

## Most useful finding

The disjoint holdout preserves **1921 tied-minimum block traces** and exact replay checks, so candidate-set and last-passer behavior can be examined by policy mix and seat rotation rather than only in aggregate. Branch-model assumptions still dominate block incidence. No physical block-winner rule or reliable strategy advantage is established; no strategy was promoted.

## Confidence and limitations

- High confidence in deterministic replay and internal counts under the coded assumptions.
- Global-ever-open, current-all, local-first and local-last are counterfactual branch models, not authenticated table rules.
- Candidate sets are diagnostics, not the real block winner/tie rule. No block winner, score award, match score, or 101-point result was assigned.
- No historical baseline or earlier cohort was pooled into this seed holdout.

## Separate cohort scale

This run adds 2000 unique deals / 48000 model-rounds and 1921 replay-verified tied-block traces. The prior reachable-block audit was 2,000 deals / 48,000 model-rounds; these two disjoint holdouts total **4,000 deal draws / 96,000 model-rounds** in this block-audit series. Other research cohorts remain separate.

## Exact next action

Compare tied-block trace strata across policy mixes and seat rotations using paired seed-cluster contrasts; test the leading descriptive interaction on a second disjoint holdout, without assigning block winners.

## Data and reproducers

- [Run summary JSON](2026-11-03-0759-block-tied-minimum-stratified-holdout.json)
- [Simulator](../simulator/block-tied-minimum-stratified-audit.js)
- [Regression test](../simulator/block-tied-minimum-stratified-audit-test.js)
- [global tied-block traces](2026-11-03-0759-block-tied-minimum-stratified-holdout-traces-global.json) — 14
- [currentAll tied-block traces](2026-11-03-0759-block-tied-minimum-stratified-holdout-traces-currentAll.json) — 655
- [localFirst tied-block traces](2026-11-03-0759-block-tied-minimum-stratified-holdout-traces-localFirst.json) — 642
- [localLast tied-block traces](2026-11-03-0759-block-tied-minimum-stratified-holdout-traces-localLast.json) — 610
