# 2026-10-27T19:53:44+04:00 Asia/Baku — late-side probe and block-tie audit

- **Engine/rules:** qosa-research-0.5.3+tie-probe / recovered qosa-1.0.0 3×9; four opening variants PROVISIONAL.
- **Validation:** late arrival, control branch, 2-way tie, 3-way tie, zero-pip tie, unique minimum, deterministic replay; 96 deterministic pilot model-rounds passed using V8 CommonJS loader (Node CLI not executed).
- **Fresh seeds:** 1602140..1602939, 800 deals × 2 policy mixes × 3 rotations × 4 models = **19,200 complete model-rounds**; zero unresolved.
- **global:** 159/4800 blocks (3.31%); 6 tied minima (5 two-way, 1 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 763/37/0/0; mean 25.24 turns.
- **currentAll:** 4453/4800 blocks (92.77%); 257 tied minima (255 two-way, 2 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 39/6/0/0; mean 23.33 turns.
- **localFirst:** 4716/4800 blocks (98.25%); 245 tied minima (240 two-way, 5 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 3/0/0/0; mean 20.54 turns.
- **localLast:** 4735/4800 blocks (98.65%); 239 tied minima (231 two-way, 8 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 1/2/0/0; mean 20.40 turns.
- **Paired global/current-only:** both blocked 155, both tied 0, global unique/current tied 4, global tied/current unique 6. Do NOT infer blocked winners from minimum-pip ties.
- **Synthetic discriminator (NOT real play):** centre 1-1 → up 1-5 → left 1-3 → 3-3 opens left → 5-5 opens up → left 3-5. Now left 5-6 is legal under global-ever-open, illegal under all-current-only; up 5-6 legal under both. The archived qosa-1.0.0 fixture has only initial hands, not moves; the scoreboard is a score tracker.
- **Finding:** block tie interpretation matters under the restricted models, but no authentic tie-break rule or late-side gameplay observation is available. **No reliable new human-play tactic.**
- **Limitations:** synthetic policies, provisional branch rules, unresolved blocked winner/101 match/loneZero, divergent paths after different legal moves; model-specific results must not be pooled for rankings.
- **Reproduce:** `node qosha-research/simulator/branch-tie-probe.js test`; `node qosha-research/simulator/branch-tie-probe.js 1602140 800`. Raw `runs/2026-10-27-1951-branch-tie-probe-1602140-1602939.json`.
- **Verified cumulative:** **1,380,975** model-rounds across incompatible rules (workload only), comprising global 1,342,575, one-side 28,800, current-all 9,600; **1,898,856** matched hidden-world continuations unchanged. Next unused seed >=1602940.
- **Exact next action:** acquire a real late-arrival observation and authentic block-tie scoring convention, or restrict strategy tests to ambiguity-invariant positions.
