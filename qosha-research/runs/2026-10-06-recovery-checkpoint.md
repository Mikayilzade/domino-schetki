# Recovery checkpoint — 2026-10-06 08:55 (+04)

## Scope
Recovery after intermittent GitHub write failures. GitHub remains the source of truth; no chat-only numeric result is promoted without persisted reproducible data.

## Verified persisted state
- Confirmed cumulative scale remains **180,000 matched-seat strategy rounds**; historical 4,000 stays separate.
- `specific-double-control.js` now uses the initializer's actual `base.starter`.
- Executable regressions `specific-double-starter-test.js` and `specific-double-stock-one-one-test.js` are persisted. They cover the later-round case where `1-1` is stock: previous winner is actual starter and `1-1` is not attributed to any initial hand.
- `decision-regret.js` and `decision-regret-test.js` are persisted. Candidate moves are evaluated from the same source world; continuation policy is deterministic; finish-first, remainder and minus metrics stay separate; source-state mutation is regression-checked.

## Quarantine
`runs/2026-10-03-specific-double-controlled-30000-39999.json` predates the actual-starter correction and is retained only as historical/quarantined data. Its 30,000 rounds are **not** added to the 180,000 verified cumulative scale and its specific-double conclusions must not be used as validated findings. Reproduce this seed range with the corrected runner before comparison.

## Recovered real-game Monte Carlo design
For advice on a real position, keep the player's visible information fixed across worlds:
1. fix focal hand, visible table/branch state, opened/locked state, current player and all known/played stones;
2. derive the exact unknown tile pool;
3. sample only hidden opponent hands and stock/bazaar from that pool, preserving required hand/stock counts and all known constraints;
4. for every sampled hidden world, evaluate the **same legal candidate set** from the fixed visible position;
5. use the same continuation policy and deterministic world seed for every candidate in that world;
6. aggregate separately: finish-first probability, expected focal remainder, minus-finish probability/severity, and per-position regret. Do not invent a composite utility unless the user explicitly supplies one.

### Required invariants before empirical regret claims
- every sampled world contains each tile exactly once across known + hidden locations;
- fixed visible state is byte-for-byte unchanged across worlds;
- candidate action keys are identical across sampled worlds; if hidden information changes legal focal actions, the fixture/design is invalid;
- evaluating one candidate cannot mutate another candidate or the source world;
- deterministic world seeds reproduce identical allocations and outcomes.

## Next exact actions
1. Re-run executable starter/decision-regret regressions in an execution-capable environment.
2. Reproduce corrected specific-double controlled seeds `30000..39999`, save raw output plus adjusted summary, then decide whether any nominal double effect survives.
3. Implement the fixed-visible hidden-world sampler/batch regret runner under `qosha-research/simulator/` and validate on a small deterministic set (target 25 worlds) before scaling.
4. Only after those gates, accumulate larger paired regret samples and derive practical move heuristics.
