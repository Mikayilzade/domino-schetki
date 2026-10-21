# 2026-10-22 03:47 (+04) — double-number deferral matched-seed test

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9, branch opening still provisional.
- Fresh deterministic seeds **1310240..1310639**, 400 deals × 3 seats × 2 opponent profiles × 4 focal policies = **9,600 complete continuations**, 0 unresolved. Same initial deals/seats and deterministic opponent policies. Old historical and changed-choice samples excluded.
- Focal policies: `a20-joint` (reference), `joint-defer-either` (any optional double after observed no-stock pass), `joint-defer-low` (only chosen double sequence entirely 0–2), `joint-defer-high` (entirely 3–6). All deferrals require a legal non-double alternative. A sequence mixing low/high is eligible only for the either variant.
- Validation: deterministic V8 CommonJS replay and number/pass-gate regression passed (120 test continuations, not credited). Node CLI not run.

## Results (1,200 focal-seat continuations per policy/profile)

| Opponent | Policy | Finish-first | Delta vs joint | Exploratory 95% seed-cluster CI | Mean remaining pips | Deferrals |
|---|---|---:|---:|---|---:|---:|
| min-hand-pips | a20-joint | 44.00% | — | — | 3.548 | 0 |
| min-hand-pips | joint-defer-either | 45.33% | +1.33 pp | [0.31, 2.36] pp | 3.486 | 182 |
| min-hand-pips | joint-defer-low | 44.42% | +0.42 pp | [0.05, 0.78] pp | 3.538 | 20 |
| min-hand-pips | joint-defer-high | 44.92% | +0.92 pp | [-0.02, 1.85] pp | 3.497 | 153 |
| closed-branch-control | a20-joint | 30.08% | — | — | 5.972 | 0 |
| closed-branch-control | joint-defer-either | 32.58% | +2.50 pp | [1.28, 3.72] pp | 5.768 | 189 |
| closed-branch-control | joint-defer-low | 30.67% | +0.58 pp | [0.04, 1.12] pp | 5.965 | 20 |
| closed-branch-control | joint-defer-high | 31.92% | +1.83 pp | [0.76, 2.90] pp | 5.785 | 162 |

- By deferred number, counts for 0..6: min-pips low [0,0,20,0,0,0,0], high [0,0,0,45,52,43,49]; branch-control low [0,0,20,0,0,0,0], high [0,0,0,47,55,47,49]. `1-1` is the mandatory opener and is not available for optional deferral.
- Starting-double strata (0/1/2+): 87/298/815 focal seats per opponent profile. Minus outcomes, block rates, median pips and turn counts are retained in the linked JSON.
- **Provisional finding:** most of the observed whole-policy benefit of deferring optional doubles is reproduced by restricting deferral to numbers 3–6: +0.92 / +1.83 pp vs joint; low-only +0.42 / +0.58 pp. **This does not prove that high doubles are intrinsically better to hold:** high deferrals occurred 153/162 times vs low 20/20, and policy trajectories diverge.
- Confidence/limitations: exploratory CIs without multiple-testing correction, fixed bot profiles, selected seed window, provisional branch semantics, no block winner, 1-1 preprocessed, opponent earlier-action likelihood omitted; cannot promote as a human-game rule yet.
- Cumulative: previous **347,700** full continuations + **9,600** = **357,300**; **49,988** separate changed-choice continuations unchanged; historical 4,000 and quarantined samples excluded.
- Reproduce: `node qosha-research/simulator/double-number-deferral.js test`, then `node qosha-research/simulator/double-number-deferral.js 1310240 400`. Raw: `runs/2026-10-22-0347-double-number-deferral.json`.
- **Exact next hypothesis/action:** same-visible-position paired hidden-world counterfactual at first eligible 3–6 deferral, matched continuation policy and worlds, stratified by actual double number and hand size; fresh independent full-deal seeds **1310640..1311239** to test high-only vs either without reusing discovery deals.
