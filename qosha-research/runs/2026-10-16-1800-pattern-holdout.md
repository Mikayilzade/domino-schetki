# Qoşa research checkpoint — 2026-10-16 18:00 Asia/Baku

Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0 (branch semantics provisional); 3 players x 9. V8 CommonJS execution of repository code; Node CLI not run. All 7 core regression scripts passed in V8.

Paired experiment: existing simulator/pattern-paired-runner.js, 30 reachable positions per cohort, 40 sampled hidden worlds per position, identical hidden worlds/continuation for both actions. Compare retaining X-X plus an X-Y connector by playing an ordinary tile versus immediately playing X-X. Closed-branch-control continuation. All outcomes are preserve minus spend, equally weighted by position. No unresolved continuations.

Cohort A: deal seeds 200000..200299, first 30 eligible (selected 200000..200033 with gaps); 1,200 worlds, world seeds 92000000+1000*dealSeed+j. Finish-first +19.67 percentage points (exploratory position-level 95% CI +14.59..+24.76); final pips -2.022 (CI -2.682..-1.361); minus-finish rate +5.53 pp (CI +2.56..+8.50). Position finish deltas: 28 positive, 2 negative.

Cohort B: deal seeds 220000..220299, first 30 eligible (selected 220001..220039 with gaps); 1,200 worlds, world seeds 93000000+1000*dealSeed+j. Finish-first +24.69 pp (CI +18.62..+30.75); final pips -2.876 (CI -3.862..-1.891); minus-finish +3.90 pp (CI +0.84..+6.96). Position finish deltas: 28 positive, 1 negative, 1 tie.

Independent complete-round baseline: 1,000 deal seeds 610000..610999, 3 seat rotations, 3,000 rounds; 2,898 finishes, 102 blocks, 0 unresolved; mean 25.219333 turns (measured). Closed-branch-control: 1,188/3,000 finish-first (39.60%), mean remainder 3.711, minus -10/-20/-30/-40 = 305/8/1/0. Moderate-double-hold: 913/3,000 (30.43%), remainder 5.052, minus 138/6/0/0. Min-hand-pips: 797/3,000 (26.57%), remainder 5.270, minus 104/1/0/0. Block winners unassigned.

Documented complete-round scale: 180,000 from RESULTS.md, plus 3,000 in runs/2026-10-11-1946-alt-discovery-checkpoint.md, plus 3,000 this run = 186,000; historical 4,000 separate. Hidden worlds do not count as complete rounds. Do not add unverified chat-only claims.

Finding: retaining X-X and a connector beat opening X-X under this bot and state-selection policy on two disjoint cohorts. This does NOT establish a human-game causal rule: opening a number and ordinary play differ in tempo and branch geometry. First eligible selection, assumed branch semantics, single continuation policy, unconditioned hidden allocations, exploratory confidence intervals.

Next exact test: independent min-hand-pips discovery on disjoint seeds; compare matched non-pattern double-versus-single controls and stratify by connectors, X, branch ends and opponent hand sizes. Verify Node CLI. No live scoreboard files changed.
