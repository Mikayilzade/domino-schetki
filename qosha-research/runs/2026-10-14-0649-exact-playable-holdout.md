# 2026-10-14 06:49 (+04) — exact playable-set holdout

Engine qosa-research-0.5.3; rules qosa-1.0.0; primary 3 players x 9 stones.
Independent discovery: 10,000 seeds 3610000..3619999; closed-branch-control; turns 4..24 with no earlier pass. 72 positions, 110 single-vs-double equal-K pairs, 0 exact playable-identity pairs. Previous seeds 3600000..3609999: 66 positions, 108 equal-K pairs, 2 exact-set pairs at one position.
Fixture 3603084 turn 9, seat 2, hand [3-3,3-5,2-4,2-3,0-3,2-2]. Two single 2-4 placements versus double 3-3 have equal immediately playable unknown-tile identities but different opened-number and branch-end states.
500 matched hidden-world draws with seeds 99000000..99000499 (388 unique allocations); 3 continuation policies; 4500 candidate continuations; 0 unresolved; 0 next-opponent play/pass flips for both pairs.
First-place probability delta single minus double, placement A/B: closed-branch-control +31.4/+31.0 percentage points; min-hand-pips +13.6/+30.2; fast-doubles +5.4/+10.6.
Mean remaining pip delta A/B: closed-branch -1.954/-1.928; min-hand-pips -0.294/-1.920; fast-doubles -0.472/-0.840.
Minus-finish probability delta A/B: closed-branch +45.4/+45.4 pp; min-hand-pips -0.2/-0.2 pp; fast-doubles 0/0.
Interpretation: same immediate playable tile set does not ensure equal continuation outcomes, but this one selected position cannot isolate the intrinsic effect of keeping a double; branch geometry differs. World samples are correlated across pairs and drawn with replacement; no position-level generalization. Opponent prior decisions are not used to condition hidden worlds. Block winners unassigned; branch-opening semantics assumption-labelled.
Validation: V8 CommonJS 5-world deterministic replay and 10k audit passed; Node CLI not executed. Simulator runner write was rejected by connector; only audit script exists.
New completed tournament rounds: 0. Verified previous cumulative complete strategy rounds: 180000, historical 4000 separate. New sampled hidden worlds: 500. No live scoreboard changes.
Next: persist executable paired holdout runner; find independent exact-set positions or use matched-K strata, and compare legal reply counts separately from win probability.
Reproduce audit: node qosha-research/simulator/exact-playable-audit.js 3610000 3620000.
