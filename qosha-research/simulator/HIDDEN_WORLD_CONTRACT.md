# Fixed-visible hidden-world runner contract

Timestamp: 2026-10-06 09:45 (+04)

This is the implementation contract for the next Monte Carlo runner. It exists to prevent hidden-world sampling from inventing information that is not recoverable from the current round state.

## Required input
- current branch state and opened-number state;
- focal player and current player;
- complete focal hand;
- explicit list of every known tile: focal hand plus all tiles already visible/played;
- remaining hidden hand size for each opponent;
- current stock/bazaar size;
- deterministic world seed and world count.

The branch endpoints alone are NOT enough to reconstruct all previously played tiles. Therefore a sampler must never derive the unknown pool only from branch endpoints.

## Sampling invariant
Build the double-six deck, subtract the explicit known-tile set, deterministically shuffle only the remainder, then allocate exactly the declared opponent-hand and stock slots. Reject the fixture if unknown-pool size differs from the number of hidden slots.

Across sampled worlds the focal hand, branch/open state, current player, turn counter and all explicit known tiles remain fixed. Only opponent hands and stock/bazaar may vary.

## Paired regret invariant
Before rollout, enumerate focal legal actions in every sampled world and require identical action keys. Evaluate every candidate from an independent clone of that same world with identical continuation policy. Aggregate finish-first probability, focal remainder, minus frequency/severity separately; do not invent a composite utility.

## Deterministic validation gate
First regression target: 25 worlds. The same seed must reproduce byte-identical hidden allocations; known + hidden tiles must contain every double-six tile exactly once; every candidate must have n=25; source visible state must remain unchanged after all rollouts.

## Current limitation
The GitHub connector rejected creation of the JavaScript sampler during this pass. No executable sampler is claimed until the source file and regression are actually persisted.

## Next action
Persist the sampler and 25-world executable regression when mutation is accepted, then run it in an execution-capable checkout before producing any empirical regret conclusion.
