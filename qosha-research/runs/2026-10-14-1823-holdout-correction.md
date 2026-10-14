# Correction to 18:23 exception holdout

The earlier checkpoint says opening a double was better under at least two policies in 10/14 positions. The correct count is **9/14**, using epsilon=1e-9 to classify floating-point zero as a tie. Seed 4201249 had closed-branch delta -3.47e-18, numerically zero, not a negative outcome. All-three-policy count remains 3/14. The per-seed CSV rounds this value correctly to zero. All other aggregate results are unchanged.
