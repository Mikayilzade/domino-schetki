# Signed-gap balanced connector holdout — 2026-10-22 12:50 (+04)

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9, provisional branch opening.
- Validation: deterministic V8 CommonJS replay and balanced-selection assertions passed (78 positions / 155 hidden worlds). Node CLI not run.
- Fresh seeds `1331840..1334839`: 240 discovered, 78 balanced selected positions (72 unique seeds), 7082 distinct hidden allocations (35 exhaustive positions), 42492 forced continuations, zero unresolved; zero new full-deal strategy rounds.
- Predeclared control: compare connector X-Y vs nonconnector U-Y on same side with |discarded-pip gap|=1; balance +1/-1 within each discovery bot and double. Counts: min-hand-pips / 3-3: 12 per sign; min-hand-pips / 5-5: 4 per sign; closed-branch-control / 3-3: 11 per sign; closed-branch-control / 5-5: 12 per sign. Same hidden worlds and three continuation bots.
- Results (equal position weighting, first-place = finishing first; blocks have no winner):
- min-hand-pips: connector-minus-nonconnector first-place, +1 pip gap -2.72 pp (n=39), -1 pip gap 2.69 pp (n=39); overall -0.02 pp; next-pass 26.83 pp; remainder -0.03 pips.
- closed-branch-control: connector-minus-nonconnector first-place, +1 pip gap 1.31 pp (n=39), -1 pip gap 1.81 pp (n=39); overall 1.56 pp; next-pass 26.83 pp; remainder 0.05 pips.
- fast-doubles: connector-minus-nonconnector first-place, +1 pip gap -2.32 pp (n=39), -1 pip gap 4.66 pp (n=39); overall 1.17 pp; next-pass 26.83 pp; remainder 0.10 pips.
- Finding: signed discarded-pip gap matters as a confound; even sign-balanced comparisons cannot isolate endpoint geometry. At fixed double X, +1 leaves endpoint X vs X-1, whereas -1 leaves X vs X+1. No universal winning rule promoted.
- Limitations: first eligible positions, different resulting endpoints, provisional branch semantics, deterministic bots, no block winner, pass-compatible uniform hidden allocations omit prior action likelihood; exploratory seed-cluster 3SE, no multiplicity correction. Different sign groups are not identical deals.
- Cumulative verified: **389700 full** + **355724 counterfactual continuations** (previous 313232 + 42492); historical/quarantined separate.
- Reproduce: `node qosha-research/simulator/connector-signed-gap-holdout.js test`; `node qosha-research/simulator/connector-signed-gap-holdout.js 1331840 3000 60 128`. Raw: `runs/2026-10-22-1250-connector-signed-gap.json`.
- Exact next: disjoint seeds >=1334840, endpoint-pair reversal {3,5} with independent discovery and balanced bot profiles; test any candidate rule on matched full deals; run Node CLI regressions.
