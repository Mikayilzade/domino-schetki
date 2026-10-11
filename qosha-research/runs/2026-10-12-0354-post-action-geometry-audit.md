# Post-action geometry audit — 2026-10-12 03:54 Asia/Baku

Engine qosa-research-0.5.3; recovered rules qosa-1.0.0; 3x9. Exact deterministic audit of the 50 fresh paired positions in 2026-10-12-0354-balanced-geometry-checkpoint.md; no additional complete rounds or hidden worlds.

Compared connector X-Y against unrelated equal-pip single from the SAME state. After the action, connector minus unrelated:
- count of active/open branch ends equal to X: **0 in all 50 positions**;
- number of X-containing non-double connectors remaining: **-1 in all 50**;
- count of distinct immediately playable focal tiles: -2 in 3 positions, -1 in 8, 0 in 24, +1 in 14, +2 in 1.

Finding: the observed paired finish difference is NOT explained by changing the NUMBER of currently open X ends. The identity of branches, their other endpoint values, opponent responses, and future access remain confounded. This is descriptive, not causal.

Reproduce: collect(900000,1000000,200) from simulator/two-opponent-conditional-holdout.js; select first 25 X=0 and first 25 X>0; use turn-dispatcher.applyTurn for both pair actions and actionsForHand for distinct playable tiles. V8 replay passed. New audit code upload was blocked; formula is documented here. No new full rounds; cumulative validated 180000 (historical 4000 separate).

Next: group finish deltas by immediate own-playability change and compare complete four-branch post-action end vectors; repeat on fresh seeds.
