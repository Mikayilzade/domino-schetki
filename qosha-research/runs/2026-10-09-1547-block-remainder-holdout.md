# Block remainder holdout — 2026-10-09 15:47 Asia/Baku

Engine: qosa-research-0.5.3; recovered qosa-1.0.0 rules; 3 players x 9 stones. No gameplay changes.

Fresh deal seeds 246000..251999 and 252000..257999; 32 positions, 1600 hidden worlds (25 training + 25 independent evaluation per position), 4800 candidate continuations, zero complete strategy rounds. World seed formula: 16000000 + 1000*dealSeed + worldIndex. Three continuation policies: side-neutral closed-branch-control, min-hand-pips, random-legal.

Baseline: place the same X-Y stone to expose the endpoint matching more remaining own stones. Alternative: switch if training estimates immediate next-opponent finish risk at least 12 percentage points lower.

11 of 32 positions switched. Out-of-sample immediate opponent finish risk change: -12.00 percentage points, exploratory 95% position-clustered CI [-18.16,-5.84]. Under closed-branch-control and min-hand-pips: focal finish-first change -1.75 pp [-7.87,+4.37], blocks +8.13 pp [-0.08,+16.33], focal strictly-lowest remaining pips at block +5.13 pp [-2.04,+12.29]. Random-legal: finish-first +0.63 pp [-6.06,+7.31], blocks +7.38 pp [-0.74,+15.49], strictly-lowest at block +5.13 pp [-2.04,+12.29]. None of the focal-outcome effects is reliable.

IMPORTANT: strictly-lowest/tied-lowest remaining pips at block are descriptive proxies, NOT official wins. The blocked-round winner is deliberately unassigned. No universal advice from this sample.

Validation: block ranking, ties, and finish-versus-block self-test passed in a V8 CommonJS harness; executable Node regression saved but Node CLI not run. Zero unresolved continuations. Limitations: assumed branch semantics, simple bots, first eligible state selection, no pass-history conditioning, exploratory unadjusted CIs.

Cumulative: 180000 full strategy rounds (historical 4000 separate), 79410 reproducible hidden worlds (previous 77810 + 1600; 400 pilot separate).

Reproduce: node qosha-research/simulator/block-remainder-holdout-test.js; node qosha-research/simulator/block-remainder-holdout.js 8 25 25. Full seeds, positions, metrics: runs/2026-10-09-1547-block-remainder-holdout.json.

Next: confirm the official block scoring/winner rule, then independently replicate the block remainder ranking effect on disjoint seeds. No scoreboard/PWA changes.
