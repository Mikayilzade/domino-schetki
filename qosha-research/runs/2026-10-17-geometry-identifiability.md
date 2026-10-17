# 2026-10-17 15:54 Asia/Baku — geometry identifiability

Engine qosa-research-0.5.3; rules qosa-1.0.0; primary 3x9.

Validated 1,680 ordered/oriented distinct non-double tile comparisons, including 104 equal-pip pairs. Zero equal four-end multisets after different tiles. This is a structural invariant, not 1,680 games.

With different branches, equality of post-action end multisets requires {newA,oldB}={oldA,newB}; with non-doubles that implies identical undirected tiles. Same-branch equality also implies identical tiles. Exact full-end geometry matching of connector vs unrelated moves is impossible in this model.

Seed 715654: opened [1,2,4,5,6]. Connector 0-5 leaves [3,2,3,0]; unrelated 2-3 leaves [3,3,3,5]. Both have one accessible end, but their accessible values differ.

No new full games or hidden worlds; GitHub verified cumulative scale remains 186,000 full rounds; historical 4,000 separate. No strategy advantage claimed. Node CLI not run; V8 exhaustive test passed. Branch semantics provisional.

Next: add an executable number-aware geometry signature test, then compare same-tile different-side actions and evaluate paired regret on fresh seeds.
