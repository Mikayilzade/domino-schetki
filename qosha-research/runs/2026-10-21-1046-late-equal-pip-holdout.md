# Late equal-pip double opening: independent endgame holdout

- Timestamp (Asia/Baku): 2026-10-21T10:46:07 +04:00
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`; 3×9, provisional branch semantics.
- Independent discovery seeds: min-pips `1345000..1346067` (end exclusive); branch-control `1350000..1350606` (end exclusive).
- 1673 deals scanned; 60 first late eligible positions (focal 3–4 stones, next opponent 2–3); 1920 matched hidden worlds, 11520 paired continuations, 0 unresolved, 0 new full strategy rounds.
- Validation: deterministic V8 CommonJS test {"passed":true,"positions":4,"continuations":72}; source immutability, legal forced moves, equal pip sums and hand-size filters checked. Node CLI not run.
- Seed formula: `mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)`; fixed worlds and policies on both alternatives.

## Double-opening minus ordinary (same removed pips)

| Continuation policy | First-finisher Δ (pp) | Mean focal remainder Δ (pips) |
|---|---:|---:|
| min-hand-pips | -29.7917 | 1.4797 |
| closed-branch-control | -32.9167 | 1.6964 |
| fast-doubles | -22.7604 | 1.0005 |

- Immediate next-opponent legal tile-type Δ: 1.1724.
- Same exact next-opponent legal tile set in 119/1920 sampled worlds.
- Opening favorable against all three bots in 4 positions; opening unfavorable against all three in 33. These are selected exploratory exceptions, not validated game rules.

## Late strata (closed-branch-control continuation)

- focal3: n=28, first-finisher Δ=-27.4554 pp
- focal4: n=32, first-finisher Δ=-37.6953 pp
- next2: n=11, first-finisher Δ=-30.6818 pp
- next3: n=49, first-finisher Δ=-33.4184 pp
- support0: n=11, first-finisher Δ=-20.4545 pp
- support1plus: n=49, first-finisher Δ=-35.7143 pp
- minDiscovery: n=30, first-finisher Δ=-36.0417 pp
- branchDiscovery: n=30, first-finisher Δ=-29.7917 pp

## Confidence / limitations

Exploratory position-level normal intervals, uniform hidden worlds without opponent-choice likelihood, first late eligible position per seed, small late strata, fixed bots, provisional branch opening semantics, block winner unassigned. Equal removed pips does not fix post-action branch geometry or hand connectivity, so no causal claim about the double itself. Previous 264900 historical full continuations remain separate; this run adds only candidate continuations.

## Exact next hypothesis/action

Recheck all opening-favorable late exceptions on independent world seeds (at least 200 worlds/position), inspect whether the alternative single breaks a needed connector, and report position-specific uncertainty. Independently test whether the sign survives different continuation policies and opening assumptions. Do not promote an exception without replication.

Reproduce: `node qosha-research/simulator/late-equal-pip-holdout.js test`, then `node qosha-research/simulator/late-equal-pip-holdout.js 1345000 1350000 60 32`. Raw rows: `runs/2026-10-21-1046-late-equal-pip-holdout.json`.
