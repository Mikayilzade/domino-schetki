# Qoşa — 4-4 connector-count holdout, 2026-10-15 03:46 Asia/Baku

Engine qosa-research-0.5.3 / recovered qosa-1.0.0; primary mode 3x9; no rule changes. Fresh deal seeds 4750000..4799999, discovery policy min-hand-pips (independent of earlier closed-branch discovery). 14,388 deals scanned to reach 350 first-eligible matched-K positions; 68 have lexicographically first candidate pair involving 4-4. Pre-outcome selection: first 20 positions with one retained non-double 4-X connector, first 20 with 2+ connectors, and sole zero-connector position. Total 41 positions, 50 hidden-world draws per position, 2,050 draws (1,897 distinct within position), 16,400 paired candidate continuations, 0 unresolved. Four policies: closed-branch-control, min-hand-pips, fast-doubles, random-legal. Same hidden world per move. World seed (1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0; indices 0..49.

Finish-first advantage in percentage points: ordinary single retaining 4-4 MINUS opening 4-4. Values by connector group 0 / 1 / 2+:
- closed-branch-control: +10.0 / +5.6 / +22.1 (exploratory position 95% CI for n=20 groups: one -0.4..+11.6; 2+ +16.2..+28.0).
- min-hand-pips: +22.0 / +1.1 / +9.6 (one -5.4..+7.6; 2+ +3.2..+16.0).
- fast-doubles: +16.0 / +6.5 / +7.1.
- random-legal: +16.0 / +8.2 / +13.2.

Mean final pip difference, same order of policies: zero +0.460,+0.180,-0.460,-0.720; one -0.294,-0.142,-0.406,-1.665; 2+ -2.355,-0.936,-0.625,-1.930. Negative favors retaining 4-4. Post-single vs post-double number of distinct active branch ends: greater in 1/1 zero, 8/20 one and 7/20 2+ positions, equal otherwise, never fewer. Mean K / playable overlap: zero 7/5, one 5.65/3.85, 2+ 5.8/4.1.

Selected seeds (all reproducible via existing matched-k-outcome-runner.js):
- zero: 4760442
- one: 4750967,4751476,4752278,4753378,4753398,4753402,4754484,4754650,4754926,4755733,4756139,4756812,4756855,4756929,4757070,4757198,4757268,4758969,4760690,4761527
- 2+: 4750310,4750347,4750500,4750926,4751099,4751530,4752436,4752905,4752969,4753314,4754509,4754545,4754795,4755228,4755477,4756365,4756416,4756819,4756954,4756984

Replay: matched-k-outcome-runner.test() passed in JavaScript V8 CommonJS; for each seed S, run(S,S+1,1,50,['closed-branch-control','min-hand-pips','fast-doubles','random-legal'],'min-hand-pips') and equal-weight per-position averages from positions[0].metrics. No Node CLI run. Attempt to persist new convenience wrapper through GitHub contents API was blocked; existing reproducible runner is sufficient.

Finding: the 2+ connector stratum shows a stronger model-specific hold-4-4 advantage than the one-connector stratum under closed-branch-control; this is not evidence that extra connectors cause the difference. Zero-connector n=1 is uninterpretable. Limits: first-eligible and lexicographic selection, matched K not exact tile identity/geometry, unconditioned sampled hidden worlds with replacement, bot-policy dependence, assumed branch semantics, block winner unassigned, exploratory intervals. Four policies are correlated, not independent experiments. No new full strategy rounds; verified cumulative full rounds remain 180,000 (historical 4,000 separate).

Next: collect >=20 independent zero-connector positions (rare), match by phase/K/overlap and pre/post four-end geometry, then retest on independent hidden-world indices; implement persistent wrapper/test when code writes permit.
