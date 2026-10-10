# Next-two X-matched holdout — 2026-10-10 05:54 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9. Fresh seeds 1600000..1999999 filtered seed%17=0. First eligible reachable state per seed under closed-branch-control. NEXT clockwise opponent has exactly 2 tiles. Compare forced X-X opening with X-Y connector into closed X under side-neutral closed-control, min-hand-pips and fast-doubles; same sampled hidden worlds. Use existing simulator/double-connector-urgency-holdout.js eligible/analyze and world seed 22000000+1000*dealSeed+attemptOffset, at most 15 distinct allocations per position.

Frozen seeds, six per cell:
3/X0: 1601315 1604545 1608829 1609101 1609849 1610461
3/X2: 1603712 1604052 1608574 1609917 1616122 1618519
4/X0: 1602998 1605480 1607996 1608931 1612263 1612603
4/X2: 1601383 1608064 1614915 1615170 1617125 1619437
5/X0: 1603134 1603593 1608319 1611039 1613351 1619845
5/X2: 1600465 1621834 1624265 1626390 1626968 1629195

36 independent positions; 257 distinct hidden allocations; 1542 paired forced continuations; 0 unresolved; 0 new full rounds. Cumulative 180000 complete rounds + 98490 credited hidden worlds (historical 4000 and pilot 400 excluded).
Double-minus-connector finish-first: closed-control -21.30pp (position-normal exploratory 95% CI -31.43..-11.17), min-pips -20.00pp (-30.09..-9.91), fast-doubles -15.65pp (-25.81..-5.49). Next opponent after opening double: +0.935 distinct playable tiles, -34.54pp pass probability. Immediate finish/minus exposure: 3/36 positions, +1.67pp [-0.16,+3.50], all mixed finish -10.

Concrete sampled threat hands: seed 1601383 X2, next hand 0-2 and 0-0 (world offset 3), finish 0-2 then 0-0. Seed 1608319 X0, next hand 0-4 and 2-2 (offset 8), finish 0-4 then 2-2. Seed 1626390 X2, next hand 2-3 and 0-0 (offset 2), finish 2-3 then 0-0. These were enabled by double opening but not by the alternative connector.

V8 CommonJS base self-test and exact replay passed, not Node CLI. Assumed branch locking; nonrandom first-eligible selection, correlated worlds, simple bots, no official block winner. Results provisional, not a universal playing rule.
Next: disjoint-seed conditional X-Y plus Z-Z immediate-minus threat test and counterexamples.
