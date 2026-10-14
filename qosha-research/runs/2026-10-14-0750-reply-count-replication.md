# 2026-10-14 07:50 (+04) — independent next-opponent reply-count replication

Engine: qosa-research-0.5.3. Rules: recovered qosa-1.0.0 (branch-opening semantics assumption-labelled). Mode: 3 players x 9 stones. Deal seed 3603084, turn 9, focal seat 2. Compare two single 2-4 placements against opening double 3-3. The alternatives have identical identities of immediately playable unknown stones but different branch/open states.

New world seed range: 99000500..99000999 (500 sampled hidden allocations, 397 distinct within sample). Existing baseline 99000000..99000499 independently reproduced (closed-branch-control first-place deltas +31.4/+31.0 percentage points). Strategies: closed-branch-control, min-hand-pips, fast-doubles; 4500 new candidate continuations, 0 unresolved. All alternatives use identical hidden worlds and continuation policies.

Key new finding: after either move the next opponent can play in all 500 sampled worlds (0 play/pass flips). Yet the number of legal next-opponent actions differs in 489/500 (97.8%). Opening the double offers mean 5.482 legal placements, versus 2.974 after the single; in this sample it never offers fewer. Thus identical playable stone identities and play/pass status do not control branch geometry or action multiplicity.

New holdout first-place deltas (single minus double), placements A/B:
- closed-branch-control: +34.0/+34.0 percentage points; mean remainder -2.120/-2.120 pips; minus-finish +48.0/+48.0 pp.
- min-hand-pips: +17.8/+35.0 pp; remainder -0.668/-2.276 pips; minus-finish -0.2/-0.2 pp.
- fast-doubles: +3.6/+7.8 pp; remainder -0.386/-0.720 pips; minus-finish 0/0 pp.

Validation: V8 CommonJS deterministic five-world replay and reply-count invariants passed. Existing 500-world baseline reproduced. No Node CLI execution claimed. 0 new complete strategy rounds; previously verified cumulative 180,000 full rounds unchanged; historical 4,000 separate.

Confidence/limitations: descriptive for one preselected position, not a general strategy or causal effect of retaining doubles. Hidden worlds sampled uniformly with replacement and not conditioned on prior opponent decisions; overlapping allocations possible across cohorts; assumed branch rules, deterministic bots, no block winner. Two placements and three policies share the same hidden worlds and are not independent experiments.

Reproduce: node qosha-research/simulator/exact-playable-holdout.js test; node qosha-research/simulator/exact-playable-holdout.js 500 99000000; node qosha-research/simulator/exact-playable-holdout.js 500 99000500.

Exact next hypothesis/action: collect independent matched-K positions and stratify on next-opponent legal-action count, playable stone identities and branch/open geometry; compare first-place, remainder and minus-finish on matched hidden worlds before claiming an intrinsic double-retention effect.
