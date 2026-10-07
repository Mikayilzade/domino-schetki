# Qoşa pattern research

Goal: discover reproducible, human-usable strategy patterns from simulator states. Position Monte Carlo is a validation tool, not the main research output.

Features to compare include repeated numbers in hand, doubles with connectors, double-connector-double chains, branch-end control, opened versus closed numbers, hand sizes, and recent passes.

First hypothesis: when a hand contains at least three tiles with number X, including X-X and an X-Y connector, compare preserving that pair with spending X-X early. Split results by branch state and hand size. Track finish-first, remaining pips, and minus finishes separately. Treat this as a hypothesis until paired tests and disjoint-seed validation support it.

Discovery workflow: log multi-choice states, group by interpretable features, compare candidate actions from identical states, retest useful effects on fresh seeds, and document counterconditions as well as positive rules.
