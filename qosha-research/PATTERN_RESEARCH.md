# Qoşa pattern research

Goal: discover reproducible, human-usable strategy patterns from simulator states. Position Monte Carlo is a validation tool, not the main research output.

Features to compare include repeated numbers in hand, doubles with connectors, double-connector-double chains, branch-end control, opened versus closed numbers, hand sizes, and recent passes.

First hypothesis: when a hand contains at least three tiles with number X, including X-X and an X-Y connector, compare preserving that pair with spending X-X early. Split results by branch state and hand size. Track finish-first, remaining pips, and minus finishes separately. Treat this as a hypothesis until paired tests and disjoint-seed validation support it.

Discovery workflow: log multi-choice states, group by interpretable features, compare candidate actions from identical states, retest useful effects on fresh seeds, and document counterconditions as well as positive rules.


## Preserve-pair experiment specification (2026-10-07)

First discovery target: positions where a player's hand contains at least three tiles touching number X, including X-X and at least one X-Y connector, and the player has multiple legal actions.

Classify each legal action without assuming which is best:
- uses X-X now;
- uses an X-Y connector now;
- keeps X-X and at least one X-Y connector after the action.

Only compare classes from the same pre-move state / hidden world. Stratify at minimum by hand size, number of X tiles, connector count, active branch ends, whether X is already opened, opponent hand sizes, and recent passes. Track finish-first, remainder, minus-finish distribution and paired regret separately.

A candidate human rule is promoted only if the direction repeats on a disjoint seed set and has a useful effect size. Also record counterconditions where the effect reverses. This avoids confusing naturally strong hands with the value of preserving the pair.
