# Qoşa pip-matched connector control — 2026-10-11 09:56 Asia/Baku

Engine qosa-research-0.5.3 / rules qosa-1.0.0; primary 3x9. Fresh seeds 100000..103999 (min-hand-pips discovery) and 104000..107999 (closed-branch-control discovery). 60 selected positions, 496 exhaustive hidden allocations, 6468 candidate continuations, 0 new full strategy rounds. Historical verified cumulative 180000 full rounds unchanged.

Same visible state: connector X-Y retaining X-X versus unrelated non-X single retaining X-X, matching immediate pip removal within 1 pip. 30 positions per discovery policy. Exact allocations equally weighted within each position, positions equally weighted. Continuation policies closed-branch-control, min-hand-pips, fast-doubles. Seeds 15000000+1000*dealSeed+allocationIndex.

Connector minus unrelated finish-first: -15.10 percentage points (closed-branch), -12.69 pp (min-pips), +2.45 pp (fast-doubles). Exact-pip matched subgroup n=12: -31.39 pp closed-branch; n=48 within 1 pip: -11.02 pp. Next-opponent legal mobility -0.096 stones on average, interval overlaps zero. Direction depends on policy; no universal connector bonus. Conditional and provisional: assumed branch semantics, unconditioned hidden allocations, first-eligible selection, unassigned block winner, exploratory CIs. Self-test passed in V8 for seed 100139 (10 allocations, 180 continuations); Node CLI not executed.

NEXT: reproduce on disjoint seeds with equal pip removal and matched next-player mobility, separately stratify next opponent with 1 versus 2 stones. Runner source not yet persisted; do not call this fully reproducible until saved.
