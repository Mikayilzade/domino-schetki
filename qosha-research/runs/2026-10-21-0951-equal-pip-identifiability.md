# Equal-pip double opening: legal-set identifiability audit

- Timestamp (Asia/Baku): 2026-10-21T09:55:52 +04:00
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, primary 3 players × 9 stones, branch semantics provisional.
- Fresh seed cohorts: min-pips 1336000..1336095; branch-control 1340000..1340078.
- Sample: 175 deals scanned, 100 first-eligible reachable positions, 4800 matched hidden allocations, 28800 candidate continuations, 0 unresolved; **0 new full strategy rounds**.
- Candidate comparison: one X-X double opening versus ordinary A-B with A+B=2X, same removed pips, same state/hidden world, canonical continuation bots.
- Validation: deterministic V8 CommonJS replay test passed (4 positions, 72 candidate continuations), source-state immutability and candidate resolution checked for all positions. Node CLI not executed.

## Outcome (double minus ordinary)

| Continuation bot | First-finisher difference | Mean focal remainder difference (pips) | Conditional first-finisher delta when exact next legal tile set matches |
|---|---:|---:|---:|
| min-hand-pips | -14.77 pp | 1.153 | -17.41 pp (43 positions) |
| closed-branch-control | -15.42 pp | 1.369 | -15.36 pp (43 positions) |
| fast-doubles | -18.52 pp | 0.790 | -13.31 pp (43 positions) |

- Immediate next opponent legal tile-type difference: **1.798** (exploratory position 95% CI 1.609..1.986).
- Immediate focal-player legal tile-type difference on post-action board: **1.360** (exploratory CI 1.140..1.580); this is *not* focal mobility at the next actual turn.
- Exact same next-opponent playable tile-key set: **160/4800** worlds; same next action-type/tile-set classes: **160/4800** worlds.
- Exact same focal-player playable tile-key set: **0/4800** worlds; **both** legal sets identical: **0/4800** worlds.
- Identical post-action unordered branch-end multiset: **0/4800** worlds. Under this model, opening a double preserves all end values whereas playing a non-double changes one end, so this pair design cannot hold branch-end geometry fixed. The double also changes opened-number state. This is a **structural identifiability limit**, not proof of any causal gameplay mechanism.
- Positions with positive double-opening first-finisher delta under all three bots: 5; negative under all three: 47. Individual positive seeds (exploratory): 1336047, 1336063, 1340021, 1340037, 1340039.

## Confidence and limitations

Intervals are exploratory normal CIs across positions, not independent hidden worlds. Same-next conditional results select on a post-action variable and have limited effective positions; they do not isolate causation. Focal connectivity, opponent replies and board geometry differ. Uniform hidden allocations do not condition on opponent choice likelihood; branch rules provisional; first eligible position per seed; block winner unassigned; first finisher is not full-match winner. Historical 264,900 full continuations, 17,280 canonical continuations and these 28800 paired continuations must remain distinct.

## Reproduction

`node qosha-research/simulator/equal-pip-identifiability.js test` then `node qosha-research/simulator/equal-pip-identifiability.js 1336000 1340000 100 48`. Hidden-world seed: `mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)`. Raw per-position metrics: `runs/2026-10-21-0951-equal-pip-identifiability.json`.

## Exact next hypothesis/action

On independent seeds >=1345000, oversample late focal hand <=4 and next hand <=3; compare X-X opening against equal-pip singles under the same 3 canonical bots, and inspect exceptions. Do not infer causal double-opening effect without matched post-action geometry.
