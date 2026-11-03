# Deal-clustered branch-label tie-break ablation — 2026-11-03T04:49:39+04:00 (Asia/Baku)

## Reproducibility

- **Engine/rules:** `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 stones plus one stock tile. Branch-label interchangeability is a model/metamorphic assumption, not physical-rule authentication.
- **Seeds:** 3,405,520–3,406,519; 1,000 draws, 1,000 unique allocations, 0 duplicate pairs; previous-winner index = seed modulo 3.
- **Full rounds:** three seat rotations per deal; 3,000 paired rounds per mix, 6,000 pairs total; 200-turn cap; all resolved.
- **Mix 1:** random-legal / min-hand-pips / closed-branch-control. **Mix 2:** fast-doubles / moderate-double-hold / closed-branch-control.
- **Arms:** baseline stable-key/raw action-list tie-break; action-orbit preserves primary ranking and samples a best-ranked branch-feature orbit then an action uniformly. Random-legal uses the same seeded action in both arms.
- **Source blobs:** engine `82e5bd544a57683d5b4f7812beb2d4abf80da894`; initializer `2fad29e516454580ec9a06115354e9866f3096e6`; turn kernel `94657896e1f8e471ceb2e9a65d1842b6102dff18`; dispatcher `55b0bcf3f1653c64b4e06bc95d7e917a480562a0`; round driver `fbaad78865adbddde1ea6651e6a501dc0bde3203`; strategy runner `b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f`; ablation runner `26e4a7966641f3f0a8a254434ff1f0a42509268f`.
- **Execution:** exact fetched source blobs ran in an isolated V8 harness, not a clean Node checkout; container clone failed because github.com did not resolve.

## Branch-label audit (first 100 seeds, subset of the full set)

- 2,289 sampled positions; all 24 permutations = **54,936 checks**.
- 47,472 playable comparisons; option-state mismatches = 0; legal-action-set mismatches = 0.
- Distributional checks: 47,472 per policy × 5 = **237,360**, mismatches = 0.

## Matched full-round outcomes

| Mix | Baseline finish / block | Action-orbit finish / block | Outcome kind changed | Finish winner changed, both finished | Minus changed, both finished | Mean turn Δ (orbit − baseline), deal-clustered 95% CI | Mean final-pip Δ/seat, deal-clustered 95% CI |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 2887 / 113 | 2891 / 109 | 154/3000 = 5.13% (4.35%–5.92%) | 548/2812 = 19.49% (17.99%–20.98%) | 263/2812 = 9.35% (8.27%–10.44%) | -0.009 (-0.076, 0.058) | 0.013 (-0.074, 0.100) |
| 2 | 2884 / 116 | 2857 / 143 | 181/3000 = 6.03% (5.14%–6.93%) | 565/2780 = 20.32% (18.80%–21.84%) | 295/2780 = 10.61% (9.47%–11.75%) | 0.028 (-0.039, 0.095) | 0.007 (-0.070, 0.085) |

Mean round length: mix 1 baseline 25.281 vs orbit 25.272 turns; mix 2 baseline 25.198 vs orbit 25.226. Mean-turn and mean-final-pip intervals span zero.

## Per-deal output and regression

The JSON retains **2,000 per-deal rows** (1,000 per mix) with rate numerators/denominators and turn/final-pip deltas. Rate SE uses pooled ratio (p=Σy/Σn) and cluster residuals; mean SE uses deal-level means. Intervals are approximate 95% normal intervals.

Runner deterministic replay passed: 8 per-deal rows in the 4-deal fixture, 3 seat rotations per row, and recomputed cluster summary equality. Cluster-statistics fixture passed **17 assertions**.

## Finding and limitations

**Finding:** tested action sets/distributions remain branch-label equivariant, but tie-break changes round outcomes: kind changed in 5.13% (mix 1) and 6.03% (mix 2); finish winner changed in 19.49% and 20.32% of both-finish pairs. This is representation sensitivity, **not** proof of strategic superiority. No strategy promoted.

Confidence is high for coded-model matched-seed and cluster-statistic calculations, not physical-rule authentication. Branch lock/open, block winner/tie, and `loneZero=10` remain unresolved. No hidden-world Monte Carlo or 5-player cohort was added.

## Separate scale and exact next action

This run adds 1,000 unique deals and 6,000 paired comparisons; the 100-deal audit is a subset. The three distinct matched-ablation ranges now total **2,120 seed draws / 12,720 paired comparisons**. Other cohorts remain separate: 88,886 deal allocations, 1,074 multi-action positions, 5,863 state-world assignments, and 5,000 invariant-smoke rounds. No historical-baseline pooling.

**Next:** audit block winner/tie allocation under labelled candidate rules (lowest pip total, tied-lowest split, seat-order tie-break) across seat permutations. Keep results model-provisional until the physical rule is authenticated.

Report: [Markdown](./2026-11-03-0449-branch-label-tiebreak-clustered-1000.md) · [Per-deal JSON](./2026-11-03-0449-branch-label-tiebreak-clustered-1000.json) · [Runner](../simulator/branch-label-symmetric-tiebreak.js) · [Cluster statistics](../simulator/cluster-statistics.js).
