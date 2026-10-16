# Independent exact geometry holdout — 2026-10-17 03:49 Asia/Baku

Engine `qosa-research-0.5.3`; rules recovered `qosa-1.0.0`; 3 players × 9 stones. No gameplay-rule changes. Research only.

## Experiment
Two independent deterministic deal ranges scanned: `800000..804999` and `805000..809999` (10,000 deals total). First eligible equal-pip connector-vs-unrelated choice per deal, discovered under `min-hand-pips`. The existing `simulator/exact-geometry-enumeration.js` exhaustively assigned unseen tiles to both opponents for each fixed visible position and compared both legal moves in identical hidden worlds, with policies `closed-branch-control`, `min-hand-pips`, `fast-doubles`.

Discovery: **27 positions**, **230 exact allocations**, **1,380 forced continuations**.
Independent holdout: **25 positions**, **251 exact allocations**, **1,506 forced continuations**.
Total: **52 positions, 481 exhaustive allocations, 2,886 continuations**, all completed without unresolved states. **0 new full strategy rounds**; previous confirmed full-round scale **186,000**, historical 4,000 separate. Hidden allocations are not counted as full rounds.

V8 CommonJS source-level replay and `exact-geometry-enumeration.test()` passed (seed 715654: 21 distinct allocations, 126 continuations, source state unchanged). Node CLI was not executed.

## Matched deltas: connector minus unrelated
All values are **equal-weight averages over positions**, not pooled-world averages. A positive first-finish delta favors connector; a negative remainder delta favors connector.

| Cohort | Policy | First-finish delta | Mean remaining pips delta | Minus-finish delta | Positions positive/negative/tied |
|---|---|---:|---:|---:|---|
| Discovery (27) | closed-branch-control | −12.35 pp | +2.858 | −13.95 pp | 3/6/18 |
| Discovery (27) | min-hand-pips | −15.68 pp | +2.936 | −17.65 pp | 3/6/18 |
| Discovery (27) | fast-doubles | +0.62 pp | +0.023 | 0.00 pp | 2/0/25 |
| Holdout (25) | closed-branch-control | −14.32 pp | +1.938 | −13.01 pp | 1/7/17 |
| Holdout (25) | min-hand-pips | −13.52 pp | +1.894 | −12.21 pp | 1/7/17 |
| Holdout (25) | fast-doubles | +0.48 pp | −0.354 | −0.57 pp | 2/3/20 |

**Critical geometry confound:** in **52/52** positions the connector move left **one fewer accessible branch end** than the unrelated move; **0/52** had the same accessible end-number multiset. Thus these are NOT matched-geometry controls and do NOT identify a causal connector-retention or specific-number effect. Exact enumeration removes hidden-allocation sampling error but not selection or opponent-history bias.

## Exact seeds and reproduction

Discovery seeds:
`800069, 800242, 800368, 800551, 800700, 800893, 801083, 801239, 801266, 801439, 801723, 802082, 802172, 802262, 802269, 802484, 802732, 802852, 803103, 803125, 803345, 803669, 804069, 804119, 804287, 804345, 804394`

Holdout seeds:
`805784, 805790, 805806, 806026, 806322, 806571, 806646, 807392, 807788, 807893, 807900, 807964, 808087, 808341, 808358, 808369, 808438, 808508, 808598, 808732, 808871, 809258, 809264, 809760, 809918`

Run on this branch from repository root:
```bash
node qosha-research/simulator/exact-geometry-enumeration.js test
node qosha-research/simulator/exact-geometry-enumeration.js 800069 800242 800368 800551 800700 800893 801083 801239 801266 801439 801723 802082 802172 802262 802269 802484 802732 802852 803103 803125 803345 803669 804069 804119 804287 804345 804394 > /tmp/qosa-exact-discovery.json
node qosha-research/simulator/exact-geometry-enumeration.js 805784 805790 805806 806026 806322 806571 806646 807392 807788 807893 807900 807964 808087 808341 808358 808369 808438 808508 808598 808732 808871 809258 809264 809760 809918 > /tmp/qosa-exact-holdout.json
```
The runner emits per-allocation outcomes, visible geometry, candidate keys, all three policies and seed formula `73000000+1000*dealSeed+allocationIndex`. The full arrays are reproducible but are not duplicated in this compact checkpoint.

## Finding, confidence, next
In both disjoint cohorts, the connector move (one fewer accessible end) performed worse for first-finish and remainder under closed-branch-control and min-hand-pips; fast-doubles was essentially neutral. This is **model-specific and provisional**, NOT a recommendation to always open more branches. It may reflect the exact exposed end numbers rather than end count. First-eligible selection, deterministic opponents, unconditioned uniform hidden worlds, assumption-labelled branch semantics, and unassigned block winner remain limitations.

**Next exact hypothesis/action:** find two legal equal-pip moves with the same **accessible-number multiset**, rather than merely equal accessible-end count; compare exhaustive hidden worlds, then stratify by immediate opponent response and prior pass history when observed. If none exist in this choice class, widen discovery instead of forcing an unsupported causal claim.
