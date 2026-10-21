# Qoşa changed-choice regret — 2026-10-21 16:45 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3×9. GitHub source read fresh. V8 CommonJS conditional-sampler regression passed (not Node CLI).

**Discovery:** seeds 1303640..1304089, ascending first alpha20-joint vs alpha20-one changed choice per focal trajectory, capped at 18 positions per bot profile. 36 positions (18 min-hand-pips, 18 closed-branch-control); 64 matched hidden allocations per position; 4,608 forced-choice counterfactual continuations, 0 unresolved. Scanned 74 deals/221 focal trajectories for min-hand-pips, 46 deals/138 trajectories for branch-control.

**Paired joint-minus-one results, equal position weighting:**
- min-hand-pips: finish-first −2.865 pp; mean remainder +0.073 pips; minus-finish −4.340 pp; next-opponent pass +3.906 pp. Joint better / one better / tied positions: 6 / 7 / 5.
- closed-branch-control: finish-first −14.583 pp; mean remainder +0.630 pips; minus-finish −7.899 pp; next-opponent pass +0.000 pp. Joint better / one better / tied: 8 / 8 / 2.

**Method:** preserve focal hand, all played/known tiles, branch state, opponent hand sizes and observed no-stock pass exclusions. Allocate each unseen tile forbidden to one opponent to the other, uniformly shuffle remaining flexible tiles with deterministic seed, then compare forced one/joint actions in the identical world using the same deterministic continuation policy. Validate 28-tile uniqueness, pass compatibility, immutable visible state, deterministic replay.

**Finding:** better joint pass-probability calibration does not automatically improve the chosen move. The mean disadvantage here is exploratory, strongly heterogeneous, and selected from alpha20-one trajectories; not a general human strategy rule.

**Limitations:** provisional branch-opening semantics; uniform pass-conditioned hidden worlds ignore likelihood of opponents' earlier chosen actions; fixed bots; 64 worlds per position; no block winner; no Node CLI execution. The new runner ran in V8 but its code has **not** yet been persisted; full executable reproduction is pending.

**Cumulative:** prior 290,100 full continuations unchanged; 4,608 *counterfactual* continuations tracked separately; historical/quarantined samples excluded.

**Next exact action:** persist the tested conditional sampler and paired-choice runner under `qosha-research/simulator/`, then independent seeds 1304090..1304539 with 128 worlds/position, stratify by one/both opponents' pass histories, test changed-action regret. No scoreboard/PWA edits.
