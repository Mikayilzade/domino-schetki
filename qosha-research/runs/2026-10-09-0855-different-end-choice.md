# Different-end same-tile paired choice — 2026-10-09 08:55:23 +04:00

Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3 players × 9 stones. **0 new complete strategy rounds**; historical 4,000 separate. V8 CommonJS self-test passed (seed 174171); Node CLI not run.

- Deal-seed scans: 174000..177999 and 182000..185999. Discovery policies: closed-branch-control and min-hand-pips; 8 selected positions per discovery × urgency × mobility cell, 96 distinct positions, 2400 fixed-visible hidden worlds (25 per position), 7200 policy/world evaluations, 14400 candidate continuations. Hidden seed formula: `9900000+1000*dealSeed+worldIndex`. Exact selected seeds and per-position data in JSON.
- Forced alternatives from the **same position/world**: place X–Y on an open X end, exposing Y, versus place the same tile on a different open Y end, exposing X. Both numbers already open. This changes the multiset of branch ends, unlike the previous same-end side-isomorphism. Side-neutral continuation removes deterministic left/right tie-break artifacts.
- Strategies: side-neutral closed-branch-control, min-hand-pips, random-legal. Compare chance focal player finishes first, focal remaining pips, minus finish, block and turns. Aligned difference is **expose endpoint with more OTHER matching hand stones minus fewer**. Opponent urgency: minimum opponent hand <=2 vs >=3. Equal mobility is a pre-specified control.

## Position-clustered finish-first differences (exploratory 95% normal CIs)
closed-branch-control: aligned 9.50 pp [3.85, 15.15] (n=64); late 10.88 pp [1.07, 20.68] (n=32); early 8.13 pp [2.36, 13.89] (n=32); equal-endpoint-mobility baseline -0.63 pp [-7.34, 6.09] (n=32)
min-hand-pips: aligned 6.25 pp [0.77, 11.73] (n=64); late 10.88 pp [1.07, 20.68] (n=32); early 1.62 pp [-2.94, 6.19] (n=32); equal-endpoint-mobility baseline 1.88 pp [-5.81, 9.56] (n=32)
random-legal: aligned 7.13 pp [2.81, 11.44] (n=64); late 5.00 pp [-1.02, 11.02] (n=32); early 9.25 pp [3.05, 15.45] (n=32); equal-endpoint-mobility baseline 2.50 pp [-3.41, 8.41] (n=32)

## Descriptive continuation outcomes
- closed-branch-control: finish-first 26.19%; mean remainder 6.38 pips; median of per-position candidate medians 5; mean round length 25.52 turns; block 7.54%; minus counts {"-10":298,"-20":5,"-30":0,"-40":0} across 4800 candidate rollouts.
- min-hand-pips: finish-first 26.60%; mean remainder 6.05 pips; median of per-position candidate medians 4; mean round length 25.34 turns; block 8.92%; minus counts {"-10":259,"-20":0,"-30":0,"-40":0} across 4800 candidate rollouts.
- random-legal: finish-first 24.96%; mean remainder 7.11 pips; median of per-position candidate medians 6; mean round length 25.68 turns; block 6.81%; minus counts {"-10":53,"-20":0,"-30":0,"-40":0} across 4800 candidate rollouts.

## Finding and limitations
Mobility-aligned choice is positive in all three continuation policies on this discovery sample, but requires disjoint-seed replication before human advice.

Confidence: provisional. Selection is first eligible per seed, then balanced by urgency and mobility and hashed within cells; worlds within position are correlated, so confidence intervals use **positions** rather than worlds. Three handcrafted bots, assumption-labelled branch locking, no physical geometry, no block winner, multiple exploratory comparisons. Side-neutral continuations do not prove physical side equivalence. Hindsight regret is conditional on the two candidate actions, not an omniscient full-action regret.

**Cumulative**: 180000 validated full strategy rounds (historical 4,000 separate); 68210 fixed-visible hidden worlds (prior 65810 + 2400).

**Exact next action**: independent holdout on disjoint seeds 178000..181999 and 186000..189999 with same quota/worlds/policies; compare opponent <=2 vs >=3, record counterexamples, and only then consider a practical mobility rule. Do not mix old quarantined specific-double runs.

Reproduce: `node qosha-research/simulator/different-end-choice.js 8 25`. Linked JSON: `runs/2026-10-09-0855-different-end-choice.json`.
