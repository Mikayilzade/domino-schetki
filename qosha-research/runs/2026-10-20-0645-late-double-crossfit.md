# Qoşa açdı — late-double paired-world crossfit (2026-10-20 06:45 Asia/Baku)

- Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; primary 3×9; branch opening provisional.
- New independent seeds **1303600..1303694**; scanned **95** deals; selected **28** visible late-double decision states; **4128** forced continuations, **0** unresolved. 24 hidden worlds/state, 12 train + 12 disjoint test; two continuation policies. Baseline 266,700 complete strategy rounds unchanged; prior 12,080 continuations kept separate.
- Selection: First focal state >=12 turns, 2..4 hand stones, double+single legal, no mixed finish, no stock; seed%3 focal seat; seed%2 discovery opponent profile; a28-one discovery trajectory.

## min-hand-pips
Train-selected best legal double-sequence vs best legal ordinary single, **held-out** first-finish difference: **-24.11 pp**; exploratory 95% position CI [-37.02, -11.19] pp. Mean focal remainder delta **1.336** pips (double minus single), minus-finish probability delta **-29.17 pp**; better/equal/worse states 3/8/17. Alpha28 vs20 changed 0 states, joint vs one changed 2; held-out first-finish deltas 0.00 / -5.95 pp.
Double-number exploratory breakdown: {"0":{"n":11,"meanDeltaFirst":-0.23484848484848483},"2":{"n":11,"meanDeltaFirst":-0.3106060606060606},"3":{"n":4,"meanDeltaFirst":-0.0625},"4":{"n":3,"meanDeltaFirst":-0.16666666666666666}}.

## closed-branch-control
Train-selected best legal double-sequence vs best legal ordinary single, **held-out** first-finish difference: **-28.27 pp**; exploratory 95% position CI [-41.57, -14.98] pp. Mean focal remainder delta **1.750** pips (double minus single), minus-finish probability delta **-32.44 pp**; better/equal/worse states 2/7/19. Alpha28 vs20 changed 0 states, joint vs one changed 2; held-out first-finish deltas 0.00 / -5.95 pp.
Double-number exploratory breakdown: {"0":{"n":11,"meanDeltaFirst":-0.23484848484848483},"2":{"n":11,"meanDeltaFirst":-0.37121212121212116},"3":{"n":4,"meanDeltaFirst":-0.10416666666666667},"4":{"n":3,"meanDeltaFirst":-0.27777777777777773}}.

## Finding / confidence
This is a state-conditional *comparison*, not an automatic play-the-double rule. A double and an ordinary connector are both legal in each sampled state. The training half chooses the strongest move within each category; the independent test half estimates their difference without in-sample oracle optimism. Differences and per-number subgroups remain exploratory with limited states and deterministic bots. All ambiguous branch-opening assumptions remain provisional; full match scoring, block-winner assignment, 5-player bazaar and loneZero not validated here.

## Reproduce / next hypothesis
`node qosha-research/simulator/late-double-crossfit.js test`; `node qosha-research/simulator/late-double-crossfit.js 1303600 300 24 28`.
Next: fresh seeds 1304000..1304999, >=80 selected states, >=60 hidden worlds each; stratify by remaining hand size, next opponent hand size, double number and branch connectivity; compare a precommitted rule to the same-world single baseline. Do not pool with historical 4,000 or prior matched-strategy samples.

Full machine-readable results: `runs/2026-10-20-0645-late-double-crossfit.json`.
