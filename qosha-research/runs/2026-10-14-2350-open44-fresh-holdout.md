# Fresh 4-4 matched-K holdout — 2026-10-14 23:50 Asia/Baku

- Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`; primary mode: 3 players x 9 tiles.
- New complete strategy rounds: **0**; prior verified cumulative: **180,000** (historical 4,000 separate).
- Discovery seeds: `4400000..4499999`, closed-branch-control discovery; scanned **24,833** deals to find the first 150 first-eligible matched-K positions. Among those, **48** had lexicographically first double choice `4-4`. Preregistered first **20** were evaluated.
- Each selected position: 40 paired unknown allocations, indices `0..39`; exact seed `(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0`; 800 sampled hidden worlds (**741** unique allocations within position), 6,400 candidate continuations, 0 unresolved.
- Comparison: legal single retaining 4-4 vs immediate opening 4-4; equal discarded pips, hand size and distinct playable unknown-tile count K; not identical legal tile identities or full four-end geometry. Both candidates replayed against identical hidden allocations.
- Continuation policies (table order): closed-branch-control, min-hand-pips, fast-doubles, random-legal.
- Position-weighted **single-minus-double** first-finish difference: **+16.38 pp** (exploratory position 95% CI +7.91..+24.84), **+11.00 pp** (+2.32..+19.68), **+10.13 pp** (+0.52..+19.73), **+14.38 pp** (+7.00..+21.75), respectively. Positive means retaining the double was better.
- Position-weighted pip remainder difference: **-0.823**, **-0.548**, **-0.213**, **-1.420** respectively; negative favors retaining.
- Open-4-4 better in **4/20**, **6/20**, **6/20**, **6/20** positions respectively; at least 2 policies in 6 positions (4401931, 4405939, 4407745, 4408450, 4408945, 4410301). **All four** policies favored opening only in seeds **4401931 and 4407745** (both small negative effects at 40 worlds).
- New finding: on these fresh positions, holding 4-4 usually helps first-finish rate, yet genuine-looking exceptions remain. No universal 4-4 opening rule follows. The four policies are not independent experiments and the exploratory CIs do not account for selection/multiple testing.
- Limitations: first-eligible lexicographic pair selection (not all 4-4 opportunities); deterministic bots, assumed opening semantics, hidden allocations uniform with replacement and not conditioned on opponent history; no block winner assigned; 40 worlds/position is weak for exception-level claims.
- Exact next action: retest **4401931 and 4407745** with 200 disjoint world indices `1000..1199` per position under the same four policies, then inspect retained 4-connectors and return mobility; compare with 4-4 non-exception controls. Do not claim a human strategy rule before replication.

## Position-level finish-first deltas, percentage points (single minus opening 4-4)

| Deal seed | Branch control | Min pips | Fast doubles | Random legal |
| --- | ---: | ---: | ---: | ---: |
| 4401931 | -7.5 | -7.5 | -7.5 | -2.5 |
| 4402067 | 7.5 | 20.0 | 12.5 | 17.5 |
| 4402068 | 17.5 | 15.0 | 7.5 | -5.0 |
| 4402643 | 25.0 | 10.0 | 0.0 | 7.5 |
| 4403299 | 5.0 | -7.5 | 12.5 | 32.5 |
| 4403863 | 2.5 | 2.5 | 2.5 | -2.5 |
| 4404413 | -10.0 | 42.5 | 70.0 | 42.5 |
| 4404636 | 37.5 | 0.0 | 0.0 | 17.5 |
| 4404750 | 7.5 | 2.5 | 27.5 | 5.0 |
| 4405689 | 35.0 | 67.5 | 67.5 | 30.0 |
| 4405939 | 12.5 | 5.0 | -2.5 | -2.5 |
| 4406253 | 12.5 | 20.0 | 10.0 | 32.5 |
| 4406530 | 42.5 | 35.0 | 0.0 | 30.0 |
| 4407435 | 7.5 | 2.5 | -2.5 | 10.0 |
| 4407745 | -15.0 | -7.5 | -5.0 | -2.5 |
| 4408450 | -7.5 | -7.5 | 0.0 | 27.5 |
| 4408945 | 40.0 | -7.5 | -10.0 | 0.0 |
| 4409744 | 45.0 | 17.5 | 7.5 | 25.0 |
| 4409958 | 30.0 | 22.5 | 15.0 | 37.5 |
| 4410301 | 40.0 | -5.0 | -2.5 | -12.5 |

## Reproduction

The existing `qosha-research/simulator/matched-k-outcome-runner.js` already provides `discover` and `run`; no engine mutation was required. Discover with `discover(4400000,4500000,150,'closed-branch-control')`, filter `pair.double.endsWith('|4-4')`, select first 20, and for each seed S call `run(S,S+1,1,40,['closed-branch-control','min-hand-pips','fast-doubles','random-legal'],'closed-branch-control')`. The deterministic runner's own self-test passed in V8 CommonJS; the new batch ran using the same loaded GitHub source in V8 (not Node CLI). Do not mix these position-world continuations with the 180,000 complete strategy rounds.
