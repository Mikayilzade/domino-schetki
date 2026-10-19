# Independent pass-history composition holdout — 2026-10-19 Asia/Baku

Engine: `qosa-research-0.5.3`; rules: `qosa-1.0.0`; mode: 3×9 later-round. Fresh seeds `2026800..2026859`: 60 distinct deals × 3 focal seats × 8 fixed opponent compositions × 2 focal strategies = **2,880 completed rounds**, 0 unresolved. Reproducible existing script `simulator/pass-history-composition-ablation.js`; deterministic self-test green (96 test rounds excluded), V8 CommonJS, not Node CLI.

Focal history minus focal uniform **finish-first rate**, percentage points (exploratory 95% seed-cluster confidence intervals):

| Fixed bot | Public bot | Public seat | Δ pp | CI95 pp | Changed choices |
|---|---|---|---:|---|---:|
| closed-branch-control | public-next-pass | next | -3.33 | [-7.35, 0.69] | 38 |
| closed-branch-control | public-next-pass | third | -1.67 | [-4.93, 1.60] | 42 |
| closed-branch-control | public-history-pass | next | -2.78 | [-6.35, 0.79] | 38 |
| closed-branch-control | public-history-pass | third | -1.67 | [-4.93, 1.60] | 43 |
| min-hand-pips | public-next-pass | next | -0.56 | [-5.34, 4.23] | 59 |
| min-hand-pips | public-next-pass | third | +1.11 | [-0.42, 2.64] | 19 |
| min-hand-pips | public-history-pass | next | 0.00 | [-4.66, 4.66] | 57 |
| min-hand-pips | public-history-pass | third | +0.56 | [-1.34, 2.45] | 21 |

**Finding:** no reliable universal benefit from pass history. Earlier composition-direction hints do not repeat uniformly in this independent holdout; all eight arms reuse the same 60 seeds (not 480 independent deals). The mixed-tournament +5–8 pp is not causal evidence. Full per-arm finish-first, remainder mean/median, block, turns, ending doubles, minus frequencies and confidence intervals are in the linked JSON.

**Confidence/limitations:** exploratory and low for composition interactions (60 independent seed clusters per arm); no multiplicity adjustment; fixed deterministic bots, pass-only inference, provisional branch semantics, block winner unassigned, no 101 match score. Old reported cross-branch 264,000 + 2,880 = **266,880 reported complete rounds**, not all independently audited; separate main-branch audited 180,000 and historical 4,000 must not be merged silently.

**Exact next action:** replicate with disjoint seeds `2026860..2026999`; then clone the first divergent history/uniform decision from the same visible state, sample identical hidden worlds, and evaluate both candidate actions with the same continuation policy. Stratify by public opponent next/third and next opponent with 1–2 tiles; report finish-first, remainder, minus and paired regret.

**Reproduce:** `node qosha-research/simulator/pass-history-composition-ablation.js test` and `node qosha-research/simulator/pass-history-composition-ablation.js 2026800 60`.
