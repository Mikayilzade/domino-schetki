# Qoşa açdı — matched composition ablation

Timestamp: 2026-10-19 12:55 Asia/Baku. Engine `qosa-research-0.5.3`, rules `qosa-1.0.0` (3×9 later-round).
Seeds **2026600..2026799**: 200 unique deals, 3 focal seat rotations, 8 fixed opponent compositions, 2 focal policies = **9,600 completed rounds**, 0 unresolved.
V8 CommonJS deterministic replay + seat-accounting test passed (96 test rounds, not added to production sample). Node CLI not run.
Focal history and uniform policy are paired on the **same deal, focal seat, and unchanged opponents**. Opponents are one public-next-pass or public-history-pass bot plus one closed-branch-control or min-hand-pips bot; public bot position alternates between next and third clockwise.

| Fixed bot | Public opponent | Public next? | History−uniform finish-first (pp) | Exploratory seed CI95 (pp) | Mean pip delta | Changed focal choices |
|---|---|---|---:|---:|---:|---:|
| closed-branch-control | public-next-pass | true | -0.83 | [-3.30, 1.64] | 0.127 | 179 |
| closed-branch-control | public-next-pass | false | 1.00 | [-0.73, 2.73] | -0.133 | 140 |
| closed-branch-control | public-history-pass | true | -1.00 | [-3.26, 1.26] | 0.220 | 178 |
| closed-branch-control | public-history-pass | false | 0.83 | [-0.86, 2.53] | -0.140 | 145 |
| min-hand-pips | public-next-pass | true | -2.50 | [-4.99, -0.01] | 0.207 | 230 |
| min-hand-pips | public-next-pass | false | 1.33 | [-0.12, 2.79] | -0.303 | 84 |
| min-hand-pips | public-history-pass | true | -2.00 | [-4.52, 0.52] | 0.150 | 233 |
| min-hand-pips | public-history-pass | false | 1.00 | [-0.53, 2.53] | -0.343 | 95 |

**Finding:** Composition-sensitive effects are assessed by matched focal swaps, not by comparing two competing strategies in the same three-way tournament. No universal gain is claimed unless independent holdout and confidence intervals support it.
All eight arms reuse the same 200 deal seeds; they are not 1,600 independent deals. CIs are exploratory seed-cluster normal approximations, not multiplicity-adjusted.
**Limitations:** fixed deterministic bots, no conditioning on voluntary opponent moves, provisional branch semantics, unassigned block winner, no 101 match scoring; selection/tie-breaking may matter. Full finish-first, remainder mean/median, turns, blocks, ending doubles, minus frequencies, and focal action changes are in the linked JSON.
**Scale:** previous reported 254,400 cross-branch complete rounds (some unreconciled) + 9,600 = **264,000 reported**; the separately audited main baseline remains 180,000 and must not be silently equated with this cross-branch tally. Historical 4,000 separate.
**Exact next action:** replay individual focal decisions where history and uniform disagree from identical visible states and sampled hidden worlds, with a fixed continuation policy; stratify regret by opponent composition and next opponent's 1–2 remaining tiles. Then repeat this ablation on fresh 2026800..2026999 seeds.

Reproduce: `node qosha-research/simulator/pass-history-composition-ablation.js test`; `node qosha-research/simulator/pass-history-composition-ablation.js 2026600 200`.
