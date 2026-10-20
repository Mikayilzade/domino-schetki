# 2026-10-20 19:53 (+04) — independent alpha20 / alpha36 pass-disagreement holdouts

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9, provisional branch semantics.
- Existing runner: `node qosha-research/simulator/pass-disagreement-regret.js 1304800 1305800 40 80 20` and same with `36`. Executed in V8 CommonJS harness; Node CLI not run. Deterministic 2-position/2-world smoke passed.
- Fresh seed window 1304800..1305799. Alpha20: 151 scanned, 40 first changed-decision positions; alpha36: 133 scanned, 40 positions. Different alpha policies can select DIFFERENT positions: **do not interpret across-alpha differences as a matched-position comparison**.
- Per alpha: 80 pass-conditioned hidden allocations per position; two identical continuation policies (min-hand-pips, closed-branch-control) applied to one-pass and joint-pass choices within the same position/world. World seed `mixSeed32((dealSeed + Math.imul(worldIndex+1,0x9e3779b9))>>>0)`.
- Total allocations: 6400 (may share seeds but positions differ); candidate continuations 60320; unresolved 0. 0 new complete strategy rounds.

- alpha20, min-hand-pips: joint-minus-one finish-first -6.69 pp (exploratory 95% position CI -13.19..-0.19); mean remainder -0.067 pips; minus finish -0.38 pp; positive/negative/tied positions 8/18/14.\n- alpha20, closed-branch-control: joint-minus-one finish-first -5.97 pp (exploratory 95% position CI -13.37..1.43); mean remainder 0.082 pips; minus finish 1.00 pp; positive/negative/tied positions 14/17/9.\n- alpha36, min-hand-pips: joint-minus-one finish-first -9.03 pp (exploratory 95% position CI -14.94..-3.12); mean remainder 0.277 pips; minus finish 3.28 pp; positive/negative/tied positions 7/19/14.\n- alpha36, closed-branch-control: joint-minus-one finish-first -8.06 pp (exploratory 95% position CI -14.10..-2.02); mean remainder -0.023 pips; minus finish -0.59 pp; positive/negative/tied positions 9/21/10.

- Confidence: within-alpha paired hidden-world comparison, position-level exploratory CI, uncorrected. Selection on disagreement; not full-game win-rate evidence. Different move geometry and extra double opening remain confounders; pass-conditioned uniform hidden worlds ignore opponent policy-choice likelihood; block winner unspecified.
- Exact next action: implement a single matched-position alpha20/28/36 action evaluator that forces every candidate once per hidden world, then stratify equal-geometry and double-opening differences. Independent seed window >=1305800; compare all three alpha policies on the same focal positions.
- Cumulative full strategy continuation baseline: previously reported 264900, unchanged; previous branch's 58200 paired candidate continuations and this run's 60320 are separate.
- No scoreboard/PWA modifications.
