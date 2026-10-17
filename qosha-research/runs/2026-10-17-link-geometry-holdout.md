# Retained double/connector links — geometry and opponent-stage holdout

- Timestamp: 2026-10-17 12:59:20 +04:00; engine `qosa-research-0.5.3`, rules recovered `qosa-1.0.0`, primary 3×9.
- Deterministic discovery seeds `824000..825999` and independent holdout `826000..827999`; three seat rotations; policies `closed-branch-control`, `min-hand-pips`, `fast-doubles`; canonical continuation.
- **12000 new full baseline rounds**, 86 blocks, 0 unresolved; **690** eligible different-retained-link paired positions and **1380** forced continuations, counted separately.
- Overall higher-minus-lower retained link finish-first: discovery **1.45 pp** (n=345; exploratory 95% seed-cluster interval -4.10..6.99 pp), holdout **1.45 pp** (n=345; interval -4.39..7.28 pp).
- **Next opponent 3–5 tiles:** discovery 8.87 pp (n=124, interval 0.15..17.59 pp); independent holdout **0.81 pp** (n=123, interval -8.10..9.72 pp).
- **Next opponent 6+ tiles:** discovery -3.30 pp (n=212); holdout 1.39 pp (n=216). The split is exploratory and was selected after seeing discovery data; a holdout sign agreement alone does not prove a causal game rule.
- Same end-number diversity and same next-player action-count subset: discovery n=37, delta 5.41 pp; holdout n=35, delta -2.86 pp. Exact post-move open-end **multiset** matching is impossible for distinct non-double tiles with the same pip sum: 52 directed distinct-tile equal-pip transition pairs checked, zero identical delta vectors; observed 0 exact matches in 690 eligible positions.
- Validation: V8 CommonJS execution of GitHub source; deterministic smoke seeds 859000..859015, 0 primary-score mismatches, 0 source-state mutations, 0 unresolved; new standalone test and runner persisted. Node CLI execution not claimed.
- Confidence: provisional observational full-information bot rollouts, not a hidden-world posterior; multiple subgroup looks, assumed branch semantics, unassigned block winner, seed-cluster intervals exploratory.
- Cumulative credited new full strategy rounds **239400**, historical 4,000 separate. Forced continuations separate.
- Reproduce: `node qosha-research/simulator/first-tile-link-controls.js test`; `node qosha-research/simulator/first-tile-link-controls.js run 824000 2000`; `node qosha-research/simulator/first-tile-link-controls.js run 826000 2000`. Full JSON: `runs/2026-10-17-link-geometry-holdout.json`.
- **Exact next hypothesis/action:** if opponent-stage interaction replicates, stratify by both own and next opponent hand size and immediate next-player legal action count on *fresh* seeds; then compare fixed-visible hidden-world Monte Carlo with identical opponent-world samples and policies. Do not claim a universal connector-holding rule.
