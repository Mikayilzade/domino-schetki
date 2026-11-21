# Forced-pass joint connector/double support — 2026-11-21 13:46 Asia/Baku

- Source of truth read: `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `STATUS.md`, gameplay/hidden-world validation gates and checkout preflight.
- Rules: recovered `qosa-1.0.0`, primary 3 players × 9 stones + 1 stock. Reference engine `qosha-research-0.5.3`; **this is an isolated exact combinatorial oracle, not a validated gameplay-engine result**.
- Deals simulated: **0**. Seeds: **none** (exhaustive integer enumeration). Strategies: **none**. Hidden-world Monte Carlo samples: **0**. Rollouts: **0**.
- Local execution: standalone Node v22.16.0 integer combinatorics completed. GitHub clone remains unavailable: `Could not resolve host: github.com`. Gameplay gate **0/17** suites executed, hidden-world gate **0/4**.
- Historical persisted **180,000 matched-seat strategy rounds** remain separate legacy evidence, not added to this run.

## Conditional model

Condition on the starter playing 1-1, drawing the sole stock tile and **still holding no ordinary 1-x connector**. The six ordinary 1-x tiles (x ≠ 1) must be in the two opponent hands. The remaining 12 opponent tiles consist of six other doubles (0-0, 2-2, ..., 6-6) and six ordinary non-1 tiles. These three categories each have six tiles. Conditioned on a uniform shuffle, the clockwise opponent's nine tiles are a uniformly chosen 9-subset of the 18.

Let X be the number of ordinary 1-x connectors and D the number of other doubles in that opponent's hand. Exact joint mass:

`P(X=x,D=d) = C(6,x) C(6,d) C(6,9-x-d) / C(18,9)`, with `C(18,9)=48620`; out-of-range binomials are zero.

Numerator rows x=0..6, columns d=0..6:

```text
x\\d  0    1    2    3    4    5    6
0     0    0    0   20   90   90   20
1     0    0   90  720 1350  720   90
2     0   90 1350 4500 4500 1350   90
3    20  720 4500 8000 4500  720   20
4    90 1350 4500 4500 1350   90    0
5    90  720 1350  720   90    0    0
6    20   90   90   20    0    0    0
```

Checks: 49 cell numerators sum exactly to **48620**; marginal X=3 is 18480/48620 (38.009%), matching the earlier connector-only oracle.

**New exact observation:** `P(X>=4 and D>=2) = 12710/48620 = 26.1415%`. `P(X>=4)=15070/48620=30.9955%`. Among opponent hands with at least four connectors, `P(D>=2 | X>=4)=12710/15070=84.34%`. This is a hand-composition correlation, **not** a probability of legal multi-double moves, winning, or obtaining minus points.

- Confidence: exact under the specified uniform conditional shuffle; independent of branch-unlocking, block-scoring and loneZero interpretations. It does **not** model turn choice, double accessibility, opponent behavior or the probability of the conditioning event.
- Win/first-place, mean/median remainder, turns, blocks, −10/−20/−30/−40, starting/ending doubles in simulated games, branch effects and decision regret: **not measured** this run.
- Next exact action: recover a complete SHA-verified 415-file research-only checkout; execute strict manifest verifier, preflight, all 17 gameplay and 4 hidden-world suites and fingerprint replays, archive raw reports, then resume matched-seed strategy comparisons. No live PWA files or GitHub Actions modified.
