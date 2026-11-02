# Exact pass-history joint-support cohort D — 2026-11-02 09:52 +04 (Asia/Baku)

## Reproducible run

- **Engine/rules:** qosha-research-0.5.3 + current-only-pass-support-1.0 + model-agreement-common-world-regret-node; recovered qosa-1.0.0, 3 players × 9 stones. Global-ever-open and current-only branch models remain provisional.
- **Fresh disjoint seed set:** reserved 3473601–3489600; scan stopped at 3486024 after reaching 1,500 selected positions. **12,424 unique deal allocations**, 0 duplicate allocations.
- **Discovery:** 1,500 selected late states; 264 had non-empty exact joint pass-consistent support and at least two common legal root actions. There were 1,899 eligible late states and 57,841 no-stock pass observations.
- **Current-only-counterfactual discovery outcomes:** 418 finishes / 12,006 blocks / 0 unresolved. This 96.6% block share belongs to the provisional counterfactual model, not a real-game estimate.
- **Exact support:** 3,746 labeled allocations enumerated; global 1,512, current-only 2,673, joint 1,512, global-only 0, current-only-exclusive 1,161, neither 1,073. The 1,512 are **state-world assignments**, not globally unique worlds. 0 within-state allocation duplicates.
- **Matched continuations:** 4,118 candidate-action/world pairs and 8,236 model rollouts per profile; four profiles = 16,472 pairs / 32,944 rollouts. Profiles: closed-branch-control, min-hand-pips, fast-doubles, moderate-double-hold. Same hidden worlds and continuation seeds were reused across candidate arms. 0 unresolved rollouts.

## Key metrics

State-cluster mean global-ever-open minus current-only:

| Continuation profile | Pooled first-finish chance, global / current-only | First-finish gap | Mean remainder gap |
|---|---:|---:|---:|
| closed-branch-control | 31.76% / 2.89% | +23.50 ± 4.39 pp | −6.00 ± 0.54 pips |
| min-hand-pips | 31.84% / 2.84% | +23.57 ± 4.39 pp | −6.00 ± 0.54 pips |
| fast-doubles | 31.84% / 2.84% | +23.46 ± 4.41 pp | −5.99 ± 0.54 pips |
| moderate-double-hold | 31.84% / 2.84% | +23.57 ± 4.39 pp | −6.00 ± 0.54 pips |

The first-finish model-gap range across profiles is **0.104 pp**. Pooled rollout rates and state-cluster gaps are different estimands; the table labels them separately. The small profile range again suggests that continuation policy is not the main source of the branch-model separation in this selected cohort.

### Exploratory strata (closed-branch-control)

95% half-widths are descriptive state-cluster normal intervals. They are not population-level uncertainty, and the strata are exploratory.

| Opponent hand sizes (sorted) | States | Joint assignments | First-finish gap | Mean remainder gap |
|---|---:|---:|---:|---:|
| 3–3 | 135 | 992 | +34.10 ± 6.47 pp | −8.26 ± 0.65 pips |
| 2–3 | 83 | 409 | +15.48 ± 7.13 pp | −5.09 ± 0.75 pips |
| 2–2 | 22 | 66 | +18.18 ± 12.56 pp | −2.99 ± 0.96 pips |
| 1–3 | 12 | 20 | −0.69 ± 5.11 pp | +0.13 ± 0.67 pips |
| 1–2 | 12 | 25 | −6.25 ± 8.79 pp | +1.46 ± 1.90 pips |

The 3–3 minus 2–3 model-gap contrast is **+18.62 ± 9.62 pp** (approximate independent state-cluster interval). This is a useful stratification signal, not a tactic: the branch-model gap is larger when both opponents hold three stones, while smaller-hand strata are sparse and noisy.

| Common root actions | States | Joint assignments | First-finish gap | Mean remainder gap |
|---|---:|---:|---:|---:|
| 2 | 166 | 865 | +25.73 ± 5.77 pp | −5.98 ± 0.67 pips |
| 3–4 | 88 | 547 | +19.66 ± 7.06 pp | −6.11 ± 0.95 pips |
| 5+ | 10 | 100 | +20.33 ± 20.17 pp | −5.33 ± 3.70 pips |

| Pass observations in selected state | States | Joint assignments | First-finish gap | Mean remainder gap |
|---|---:|---:|---:|---:|
| 1 | 141 | 830 | +26.69 ± 6.30 pp | −6.13 ± 0.66 pips |
| 2 | 75 | 467 | +25.77 ± 8.16 pp | −6.45 ± 1.01 pips |
| 3+ | 48 | 215 | +10.61 ± 8.08 pp | −4.92 ± 1.61 pips |

### Regret diagnostic

Under the closed-branch-control continuation, mean per-state hindsight-oracle candidate regret was 7.94 ± 1.69 pp in first-finish chance / 1.09 ± 0.15 pips in remainder under global-ever-open, and 2.48 ± 1.30 pp / 1.73 ± 0.18 pips under current-only. The oracle is hindsight over sampled common legal candidates, not an executable perfect-information policy.

## Finding, confidence, limits

The positive global/current-only model gap replicated in this fresh disjoint cohort. Its magnitude is consistent with Cohort C: D−C is −1.46 ± 6.63 pp, an interval including zero. Across four continuation profiles the gap moves only 0.104 pp.

The most useful new diagnostic is **heterogeneity by opponent hand size**: 3–3 states show a +34.10 pp gap versus +15.48 pp for 2–3 states. This may reflect the selected pass-history geometry and needs a preregistered holdout. It does not authenticate the physical branch-opening rule and does not establish a tactical advantage. No strategy is promoted.

Exact enumeration and paired rollouts are reliable for the stated selected states and model assumptions. Limitations: current-only-counterfactual discovery; late-state selection; pass consistency without opponent-choice likelihood; unauthenticated branch-opening/block/scoring semantics; descriptive intervals; exploratory subgroup contrasts; no authenticated public Qoşa açdı trace/ruling. A web search surfaced generic domino double/spinner guidance only, which cautions that variant rules differ; it did not provide a Qoşa açdı-specific ruling ([generic doubles guide](https://dominopeak.com/az/domino-rules/domino-doubles-rules/), [generic FAQ](https://dominopeak.com/az/domino-faq/)).

The committed runner source was fetched from GitHub and executed in a V8 harness. The hash-ranked subset path was not invoked; exact enumeration was used. A clean Node checkout integration run was unavailable because the container could not resolve github.com. The stratification summarizer passed 10 unit assertions in V8; runtime accounting checks confirmed the support partition, 0 duplicate worlds, 32,944 paired rollouts, and 0 unresolved rollouts. No live scoreboard/PWA files were modified.

## Cumulative separate pass-history cohorts

Across five disjoint cohorts (pilot, A, B, C, D): **28,637 unique deal allocations**, **614 joint-support multi-action states**, **3,254 state-world assignments**. Cohorts remain separate; state-world assignments are not globally unique hidden allocations. The strategy tournament is unchanged.

## Exact next action

Use a preregistered fresh holdout starting at **3489601**. Keep opponent-hand-size strata (3–3 versus 2–3) primary; then stratify by common-action count and pass-evidence count. Compare pass-only posterior support against an explicit opponent-choice likelihood grid (random-legal / min-hand-pips / fast-doubles mixtures), reusing identical hidden worlds and continuation seeds. Report posterior-weighted regret separately from pass-only exact-support regret. Continue seeking an authentic trace or explicit ruling for branch opening and block scoring.

Reproducer: simulator/pass-history-cohort-strata-audit.js; regression: simulator/pass-history-cohort-strata-audit-test.js.
