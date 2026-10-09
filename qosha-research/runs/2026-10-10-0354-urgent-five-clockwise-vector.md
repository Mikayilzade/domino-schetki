# Clockwise vector holdout — 2026-10-10 03:55:53 +04:00

Engine qosa-research-0.5.3; recovered rules qosa-1.0.0; primary 3x9.
36 independent fresh positions (focal hand 5): next/following opponent counts [2,4] vs [4,2], balanced X0 (6 each) and X2 (12 each). Scan seeds 826000..1225999, seed%17===0. 540 new hidden allocations (all 15 possible per state), 3240 paired candidate continuations across closed-branch-control, min-hand-pips, fast-doubles. No new full rounds.
Opening X-X versus playing X-Y connector: immediate next-player finishing move became available in 6/18 next=2 positions, versus 0/18 next=4. Mean immediate opportunity difference +6.30 percentage points vs zero. Under closed-branch-control, finish-first difference (double minus connector) -20.37 pp vs -7.41 pp; fast-doubles largely removes the gap.
IMPORTANT: previous opponentSizes arrays were numeric player-index ordered, NOT clockwise. This run uses next=(focal+1)%3. Do not interpret old vector tables as turn order.
Limitations: model-specific, nonrandom reachable states, assumed branch opening/locking, X4 not matched, unadjusted exploratory position-level CIs, official block winner unknown, Node CLI pending. All hidden worlds enumerated within selected states, not all possible deals.
Reproduce: node qosha-research/simulator/urgent-five-clockwise-vector.js
Next: disjoint-seed next-opponent=2 study across focal hand 3/4/5; identify exact X-X openings that expose immediate opponent finish or minus.
