# Qoşa research checkpoint — 2026-10-15 02:54 Asia/Baku

Engine qosa-research-0.5.3 / rules qosa-1.0.0, 3x9. Discovery 4600000..4749999, scanned 81083 deals to find 500 first-eligible matched-K positions, 161 with first double 4-4. Independent, pre-outcome strata: first 24 with retained 4-X connector; all 7 with no retained 4-X connector. Same 60 hidden worlds per position (indices 0..59; seed (1500000000+Math.imul(dealSeed,73)+worldIndex)>>>0), four bots: closed-branch-control, min-hand-pips, fast-doubles, random-legal. Total 31 positions, 1860 hidden samples (1568 unique within position), 14880 paired continuations, zero unresolved. New full rounds 0; prior verified cumulative 180000. Existing matched-k-outcome-runner.js deterministic self-test passed in V8, not Node CLI.

No connector seeds: 4602066,4611909,4628182,4638281,4652428,4670549,4676505.
With connector seeds: 4600133,4600464,4600772,4602011,4602170,4604408,4604930,4604936,4605243,4606022,4606029,4606657,4606772,4608670,4608749,4609958,4610369,4611082,4611302,4611446,4611732,4612468,4612474,4613089.

Position-weighted finish-first delta in percentage points (single retaining 4-4 minus opening 4-4), policies in above order:
- No connector (n=7): +9.05 (95% exploratory CI -11.62..29.72), +2.38 (-16.88..21.64), +8.81 (-9.16..26.78), +5.95 (-4.07..15.98).
- Has connector (n=24): +20.00 (13.90..26.10), +10.90 (5.26..16.55), +7.29 (-0.26..14.85), +13.13 (7.87..18.38).
Pip remainder delta, same order: no connector -0.540,-0.290,-0.024,+0.067; has connector -1.854,-0.938,-0.439,-1.454.

Finding: earlier exploratory no-connector => open-4-4 hypothesis did NOT replicate; all no-connector intervals cross zero. With connector, holding often helps under this bot mix, but it is not a universal causal rule. Limits: first eligible and lexicographic pair selection, equal K not equal playable identities/four-end geometry, uniform hidden allocation not conditioned on play history, bots share worlds, 7 no-connector positions, assumed opening semantics, blocks lack assigned winner. Four policies are not independent confirmations.

Replay: matched-k-outcome-runner.discover(4600000,4750000,500,'closed-branch-control'), filter pair.double.endsWith('|4-4'), classify connectors in retained hand after single; for each listed seed S run(S,S+1,1,60,['closed-branch-control','min-hand-pips','fast-doubles','random-legal'],'closed-branch-control'). Next: fresh seeds 4750000+, seek 20 no-connector positions and stratify by four-end geometry; alternate min-hand-pips discovery and matched controls before proposing a human rule.
