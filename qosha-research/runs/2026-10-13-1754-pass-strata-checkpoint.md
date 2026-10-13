# Qoşa observed-pass independent stratification — 2026-10-13 17:54 Asia/Baku

- Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0`; primary 3 players x 9 stones.
- Deterministic command: `node qosha-research/simulator/reachable-pass-heldout-runner.js 2840000 2860000 40 160`.
- Seed interval scanned: 2840000..2840115 (116 deals); 40 eligible reachable positions; 6,400 proposed hidden worlds; 1,996 pass-compatible; 966 accepted odd-index held-out worlds; 58,560 candidate continuations; zero unresolved. No new complete strategy rounds.
- Selection: first stock-empty observed pass followed by 2..10 legal focal actions; min-hand-pips discovery. Even proposal indices train choices; odd accepted indices evaluate. Same visible position, hidden worlds and continuation seeds for both candidate choices.
- Closed-branch-control: pass-conditioned minus unconditioned choice first-place +1.008 pp, exploratory 95% position interval [-0.812,+2.828] pp; mean remainder -0.193 pips, minus-finish +0.821 pp. Choice changed 10/40 positions.
- Min-hand-pips: first-place -0.870 pp, exploratory 95% position interval [-1.979,+0.238] pp; remainder +0.055 pips, minus-finish -0.395 pp. Choice changed 9/40.
- Passer hand <=3 stones: closed-branch choice changed 0/14, min-hand-pips 0/14; >=4 stones: closed-branch 10/26, min-hand-pips 9/26.
- Pass compatibility <1/3: closed-branch changed 9/25, min-hand-pips 8/25; >=1/3: closed-branch 1/15, min-hand-pips 1/15.
- 2..3 legal focal actions: see reproducible runner for raw position analysis; action-count matching is required before attributing the effect to passer hand size.
- Independent cohort comparison: earlier seed groups 2800000+ (30 positions, 4800 proposals, 36800 continuations) and 2820000+ (40 positions, 6400 proposals, 54720 continuations). Combined **110 positions, 17,600 proposals, 2,941 accepted held-out worlds, 150,080 candidate continuations**. Closed-branch choice changed 1/45 positions when passer had <=3 stones vs 26/65 with >=4; min-hand-pips changed 1/45 vs 25/65. Three closed-branch cohort first-place deltas: +1.14, +2.53, +1.01 pp; min-hand-pips: -0.32, -1.88, -0.87 pp.
- Verified historical cumulative complete strategy rounds: **180,000**, not increased; historical 4,000 rounds separate. No new full-round results credited.
- Validation: V8 CommonJS deterministic two-position replay passed. The three core posterior/regret/hidden-world tests were previously executed in V8; not re-executed as part of this saved checkpoint. Node CLI not executed.
- Finding: observed-pass evidence is much more likely to alter decisions when the passer has >=4 stones. This is a model-specific **decision-sensitivity association**, not a demonstrated winning strategy. Neither continuation policy has a new held-out first-place CI excluding zero.
- Limits: single immediately observed pass, first-eligible selection, assumed branch semantics, repeated sampled worlds possible, bots, no block winner; exploratory uncorrected intervals and confounding by legal action count, acceptance rate, and branch geometry.
- Exact next action: independent 2860000+ holdout; compare passer hand-size effects within matched legal-action-count, acceptance-rate and branch-end strata; validate multi-pass event replay before using longer history.
