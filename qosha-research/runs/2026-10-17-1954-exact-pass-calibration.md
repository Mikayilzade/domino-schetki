# Exact next-pass holdout calibration — 2026-10-17 19:54 Asia/Baku

Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0`; primary 3 players x 9 stones.
Code: `simulator/pass-calibration-20261017.js`.
Reproduce: `node qosha-research/simulator/pass-calibration-20261017.js 780000 800000 30 128`.

## Sample and method

- **Fresh, disjoint discovery seeds**: 780000..799999 (relative to 760000..779999 prior exact-pass study).
- **6,274 deals scanned**, first 30 eligible reachable positions selected (actual selected deal seeds 780088..786273, full list in script output).
- **3,840 new hidden-world draws** = 30 positions x 128 uniform unknown allocations. No new complete strategy rounds; previously reported baseline **186,000** full strategy rounds unchanged (historical 4,000 separate).
- Discovery strategy: `min-hand-pips`. Continuation strategies: **none**; only immediate next-opponent pass measured. Candidate moves: equal-pip connector versus unrelated ordinary single, fixed same visible state and same hidden allocation for both actions.
- Exact prediction: hypergeometric `P(pass)=C(N-M,k)/C(N,k)`, where N is unknown tile count, M is number of individually legal unknown tiles, k is next opponent's hand size.
- Monte Carlo sampler: `sampleWorld`, deterministic seed `(1700000000+Math.imul(dealSeed,101)+worldIndex)>>>0`; no changes to scoreboard/PWA files.

## Results

- Position-weighted mean exact **connector minus unrelated** pass probability: **+15.67 percentage points**.
- Empirical mean across paired hidden-world draws: **+16.12 percentage points**.
- Mean calibration error (sampled minus exact): **+0.45 percentage points**; mean absolute per-position delta error: **4.15 percentage points**; largest absolute position error: **23.44 percentage points** at 128 draws/position.
- Separate deterministic exhaustive fixture, seed **715654**, checks all **21** allocations of 2 stones from 7 unknown stones. Pass probabilities exactly **6/21 = 28.57%** versus **15/21 = 71.43%**, matching the formula. This fixture was executed in a V8 CommonJS harness, not added as a Node test in this checkpoint.
- Saved runner re-executed in V8 CommonJS against fetched GitHub source and reproduced 30 positions, 3,840 worlds, and the reported summary. **Node CLI was not run**.

## Finding, confidence and limitations

The exact combinatorial forecast is internally consistent with independently sampled unknown hands on fresh positions, and the independent 21-allocation fixture agrees exactly. This validates the immediate-pass calculation **under the model's uniform hidden allocation assumption**. It does **not** establish a causal strategy advantage or increased finish-first probability; a +15.67 pp mean on this selected sample is not a general rule.

Limitations: opponents' earlier decisions/passes are not conditioned on; first-eligible-position selection, provisional branch-opening semantics, deterministic pseudo-random draws, and no block-winner assignment. 128 draws per position leaves substantial error for individual positions. The calibration sample and formula share the same underlying legal-move engine, so they do not independently validate that engine against human rules.

## Exact next experiment

On **new disjoint deal seeds 800000..**, use matched hidden worlds and identical continuation policies (`closed-branch-control`, `min-hand-pips`, `fast-doubles`) to test whether a higher **exact next-pass forecast** actually improves focal finish-first rate, remaining pips and −10/−20 outcomes; report paired regret and per-position uncertainty. Include cases where exact pass forecast and branch-control heuristic disagree.
