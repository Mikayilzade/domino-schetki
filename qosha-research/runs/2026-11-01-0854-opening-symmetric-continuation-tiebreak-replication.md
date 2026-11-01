# Qoşa research — independent symmetric-opener tie-break replication

- Timestamp: 2026-11-01 08:54:27 +04 (Asia/Baku)
- Runner: `simulator/opening-symmetric-continuation-tiebreak-audit.js`; engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 stones + 1 stock.
- Physical late-arrival branch reopening and blocked-round tie/scoring rules remain **PROVISIONAL**.
- Seeds: `3409220–3409719`; 500 seed draws, 500 unique full allocations, 0 duplicate allocation pairs.
- Symmetric opener held identical between arms: 954 follow-ups / 46 forced opening passes; side counts up 234 / left 238 / right 240 / down 242. 1,000 opening conservation checks, 0 failures; follow-up tile and hand-state mismatches 0.
- Design: two policy mixes × three seat rotations = 1,500 paired rounds per mix; 3,000 paired comparisons / 6,000 rounds total. Side-order baseline uses the existing stable-key tie-break; action-orbit arm preserves primary policy rank and samples top action orbit/member symmetrically. Regression test passed (8 replay deals / 48 pairs); no unresolved rounds in the main cohort.

## Matched results

| Mix | Side-order finishes / blocks | Action-orbit finishes / blocks | Outcome kind changed | First finisher changed (both finish) | Minus class changed |
|---|---:|---:|---:|---:|---:|
| random-legal / min-hand-pips / closed-branch-control | 1,457 / 43 | 1,452 / 48 | 55/1,500 (3.67%; deal-clustered approx. 95% CI 2.68–4.65%) | 285/1,427 (19.97%; CI 17.61–21.86%) | 116/1,427 (8.13%) |
| fast-doubles / moderate-double-hold / closed-branch-control | 1,439 / 61 | 1,447 / 53 | 90/1,500 (6.00%; deal-clustered approx. 95% CI 4.76–7.24%) | 307/1,398 (21.96%; CI 19.49–23.91%) | 160/1,398 (11.44%) |

- Mean turn delta (orbit − side-order): +0.0167 in Mix 1; −0.0007 in Mix 2. Mean final-pip delta per seat: −0.0273 / −0.0267.
- Descriptive pooling with the previous disjoint 500-deal cohort: Mix 1 outcome kind changed 142/3,000 (4.73%), first finisher changed 578/2,824 both-finish pairs (20.47%); Mix 2 176/3,000 (5.87%) and 629/2,792 (22.53%). These pooled proportions are descriptive only; no pooled seed-clustered interval was reconstructed.

## Interpretation and limits

The first-finisher sensitivity replicated across the disjoint seed cohort, while aggregate finish/block and turn differences remained small and inconsistent. This is **tie-break sensitivity, not strategy superiority, a human win-rate estimate, or decision regret**. The run added 0 hidden worlds and 0 strategy-strength holdout deals. Confidence is high for deterministic matched bookkeeping and the coded selector, but external validity is low while physical branch reopening and blocked-tie rules remain unauthenticated.

- Cumulative separate validation/opening/tie-break allocations: 3,700 (prior 3,200 + 500 this run).
- Reachable-position property-audit count remains 39,262.
- Strategy-strength holdout remains 1,500 deals / 18,000 arm-rounds (+ separate 120-deal pilot / 1,440 arm-rounds); legacy and historical populations remain separate.

**Exact next action:** isolate reachable positions where the global-ever-open and current-only branch models agree on legal actions and successor geometry; compare candidate actions under common sampled hidden worlds for within-state regret there, keeping model-disagreement positions separate. Continue seeking an authenticated physical trace/ruling for late-arrival reopening and blocked-round tie/scoring.
