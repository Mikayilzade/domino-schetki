# Equal-pass geometry holdout — 2026-10-17 23:50 Asia/Baku

Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; 3 players x 9 stones. Code: `simulator/equal-pass-geometry-holdout-v2.js`. V8 CommonJS executable replay and deterministic self-test passed; Node CLI not executed.

## Reproduction and sample
- `node qosha-research/simulator/equal-pass-geometry-holdout-v2.js test`
- `node qosha-research/simulator/equal-pass-geometry-holdout-v2.js 920000 940000 48 32`
- `node qosha-research/simulator/equal-pass-geometry-holdout-v2.js 940000 960000 48 32`
- Two independent deal-seed ranges: 920000..939999 (10,828 deals scanned) and 940000..959999 (14,203 scanned). 96 eligible positions; 29 exact-next-pass ties, one degenerate zero-pass tie excluded (different legal unknown counts). **28 compared positions**, 896 sampled hidden worlds (32/position), **5,376 paired candidate continuations**; no unresolved outcomes reported.
- Discovery policy `min-hand-pips`. Continuations `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Equal-pip connector single versus unrelated single; same focal state, same hidden allocation and continuation seed for both choices.
- Hidden seed `(1900000000 + Math.imul(dealSeed,109) + worldIndex) >>> 0`.

## Position-weighted connector minus unrelated outcomes
| Metric | Seeds 920000.. | Seeds 940000.. |
| --- | ---: | ---: |
| Eligible / compared | 48 / 16 | 48 / 12 |
| Closed-branch finish-first | -5.66 pp | -14.58 pp |
| Min-pips finish-first | -5.66 pp | -17.71 pp |
| Fast-doubles finish-first | -4.10 pp | -1.56 pp |
| Closed-branch mean remaining pips | +2.12 | +2.84 |
| Min-pips mean remaining pips | +2.03 | +2.90 |
| Fast-doubles mean remaining pips | +0.56 | +0.36 |
| Mean empirical immediate-pass delta | -3.32 pp | -5.47 pp |
| Hidden-world immediate pass flip rate | 14.26% | 24.74% |

Exploratory 95% position-normal CI for closed-branch pips: [1.15, 3.09] and [1.23, 4.45]. Closed-branch finish-first CI: [-11.85, +0.52] pp and [-27.82, -1.34] pp. These are exploratory, not multiple-comparison adjusted.

**Finding:** equal exact marginal probability that the next opponent passes does **not** make two moves strategically equivalent. In these selected positions the connector move left more pips in both independent seed sets against two bots. No causal claim about geometry alone: candidate tile identities, available ends and future responses all change. Equal marginal pass probability also does not imply identical pass outcomes in each sampled hidden world.

**Limits:** first eligible positions, 28 position clusters, unconditioned uniform hidden worlds, fixed bots, provisional branch opening, block winner unassigned. The 32-world per-position pass differences reflect sampling noise. This is not a general human-play rule. V1 `equal-pass-geometry-holdout.js` fails on degenerate zero-pass ties; use V2 which counts and excludes them.

**Cumulative:** 186,000 verified full strategy rounds unchanged; 0 new full rounds in this pass; 896 new hidden-world samples and 5,376 continuations tracked separately. Historical 4,000 rounds excluded.

**Next:** on fresh seeds 960000..1020000 test whether equal-pass differences track exact end-number overlap and next-opponent legal reply sets; evaluate paired decision regret under the same hidden worlds. Execute Node CLI regressions in a runnable checkout when possible.
