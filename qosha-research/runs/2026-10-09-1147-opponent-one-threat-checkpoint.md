# Next-seat one-stone threat audit — 2026-10-09 11:47 Asia/Baku

- Engine/rules: qosa-research-0.6.1 working status / recovered qosa-1.0.0; 3 players × 9 stones.
- 16 reachable positions; 400 paired fixed-visible hidden worlds (25 per position); 2 candidates × 3 continuation policies = 2,400 candidate continuations. 0 new complete strategy rounds.
- Discovery seeds: 198000..203999 (closed-branch-control) and 204000..209999 (min-hand-pips). Selection: next opponent exactly 1 tile, other opponent >=2; same X-Y tile legal on different ends, focal 2..7 tiles, unequal remaining endpoint mobility. Four positions per discovery policy × mobility direction.
- World seed: 13000000 + 1000 * dealSeed + worldIndex (worldIndex 0..24). Strategies: side-neutral closed-branch-control, min-hand-pips, random-legal. Both candidate actions evaluated in the same hidden world.
- Mobility-aligned minus alternative finish-first difference: +13.5 percentage points under closed-branch-control and min-hand-pips, +13.0 under random-legal. Unadjusted 95% position-level intervals: [-2.24,+29.24], [-2.24,+29.24], [-1.83,+27.83] pp respectively. **Not statistically reliable**.
- Threat: aligned move uniquely exposes immediate finishing action to next one-stone opponent in 71/400 worlds; alternative uniquely does so in 24/400; both risky in 163/400; neither risky in 142/400. Thus mobility alone does not protect from an immediate loss.
- Caveat: V8 CommonJS evaluation passed self-test and experiment; Node CLI not run. Assumed locked/open semantics, handcrafted bots, exploratory selection/intervals, 16 independent positions. No universal human strategy claim.
- Previous persisted total 180,000 complete strategy rounds and 70,610 hidden worlds; this checkpoint would add 400 worlds **only if reproducibility metadata is persisted**. Historical 4,000 separate.
- Exact next action: persist the standalone runner with selected seed list and replay test, then independently test a threat-first override on fresh seeds, including second-seat one-stone opponent.
