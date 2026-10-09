# Qoşa independent holdout — 2026-10-09 09:45 Asia/Baku

96 positions, 2,400 fixed-visible worlds, 14,400 forced continuations, 0 unresolved. Engine qosa-research-0.5.3; rules qosa-1.0.0, 3x9.

Same-tile different-end mobility-aligned finish-first advantage (64 unequal-mobility positions, 95% unadjusted position-clustered CIs): closed-branch-control +6.31 pp [0.37,12.26], min-hand-pips +6.75 pp [0.86,12.64], random-legal +8.13 pp [4.01,12.24]. Mean remainder differences -1.18/-1.43/-1.32 pips. Conditional hypothesis, not a universal rule.

Counterexample seed 179656: hand 0-5,1-3,0-2, opponents 3/1, ends up=2,left=0,right=3,down=5. Mobility-aligned move -80 pp under branch-control and min-pips. Limits: assumed branch rules, simple bots, correlated worlds, exploratory CIs, no block winner.

Seeds 178000..181999 and 186000..189999; 25 worlds/position; world seed 9900000+1000*dealSeed+worldIndex. Reproduce: node qosha-research/simulator/different-end-choice-replication.js 8 25. Raw data: 2026-10-09-0945-different-end-choice-replication.json.

Cumulative: 180,000 complete strategy rounds + 70,610 fixed-visible worlds (historical 4,000 separate).

Next: independent opponent-one-stone matched counterexample study and Node CLI validation.
