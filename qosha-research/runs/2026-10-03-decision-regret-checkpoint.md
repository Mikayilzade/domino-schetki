# Decision-regret checkpoint — 2026-10-03 22:45 (+04)

Engine/rules: `qosa-research-0.5.3`, primary 3×9 mode.

Deals simulated this checkpoint: **0**. No new numeric strategy result is claimed because the repository connector rejected the attempted simulator-code write, and GitHub remains the source of truth.

## Paired rollout design locked for next executable pass

At a state with 2+ legal actions:
1. Freeze the complete state, including hidden opponent hands and stock.
2. Fork one clone per legal candidate action.
3. Apply exactly one different candidate action in each clone.
4. Continue every clone with the same deterministic policy and same seed/salt context.
5. For the focal player record: first-to-finish indicator, own final remainder, finish minus, block flag, unresolved flag.
6. Do **not** assign a winner to blocks until block-winner/tie semantics are confirmed.
7. Rank candidates first by first-to-finish, then by lower own remainder. Report minus separately rather than silently choosing a utility weight.
8. Aggregate how often the reference policy's chosen action is not best, finish-win regret, remainder regret, and action/branch features.

Planned fresh seed set: `40000..49999`, using `closed-branch-control` as the reference continuation policy. This set must remain separate from the earlier 0..39999 strategy runs.

Cumulative validated strategy scale remains **180,000 matched-seat rounds**. Historical 4,000 rounds remain separate.

Next action: persist the clone-safe evaluator under `qosha-research/simulator/`, run a small deterministic regression fixture first, then execute paired rollouts on the fresh seed set and only afterwards interpret when branch preservation should be overridden.
