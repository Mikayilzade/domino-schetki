# 2026-11-20 08:51 Asia/Baku — exact forced-pass connector allocation

- Rules: recovered `qosa-1.0.0`; reference engine `qosha-research-0.5.3` (not executed).
- Mode: 3 players × 9 tiles + 1 stock; after mandatory 1-1 and drawing stock, starter cannot continue on 1.
- Deals simulated: **0**. Seeds: **none** (exact enumeration). Strategies: **none**. Hidden worlds sampled: **0**. Gameplay gate: **0/17**; hidden-world gate: **0/4**.
- Exact conditioning: the six ordinary 1-x tiles must all be in the 18 opponent tiles. Conditioned on a uniform shuffle, the clockwise next opponent holds K of those six, with `P(K=k)=C(6,k)C(12,9-k)/C(18,9)`. Denominator `C(18,9)=48620`.
- Numerators for K=0..6: **220, 2970, 11880, 18480, 11880, 2970, 220** (sum 48620). Exact percentages: **0.45249%, 6.10860%, 24.43439%, 38.00905%, 24.43439%, 6.10860%, 0.45249%**.
- **New finding:** after this forced pass, the next opponent has **at least four** 1-connectors in **15070/48620 = 30.99548%** of conditioned deals. The probability they have **none** is **220/48620 = 0.45249%**. The distribution is symmetric between opponents.
- Independent arithmetic check: `sum_k C(6,k)C(12,9-k)=C(18,9)` (Vandermonde); `P(K>=4)=P(K<=2)`.
- Interpretation: **hand-support only**. This does not imply a legal move is available on a locked branch, does not incorporate observed opponent choices, and is not a winning strategy or a validation of the gameplay engine.
- Win/first-place, mean/median remaining pips, round length, blocks, minus frequencies, starting/ending doubles, specific-double causal values, branch-opening effects and regret: **not measured**. Historical **180,000** matched-seat strategy rounds remain separate legacy evidence.
- Confidence: exact under stated uniform-deal/forced-pass assumptions; branch unlocking, block allocation and `loneZero=10` remain provisional.
- Exact next action: obtain the full 413-file GitHub simulator tree in an executable environment; run preflight, 17 gameplay suites, 4 hidden-world suites and fingerprint replays; archive raw outputs; only then restart matched-seed strategy comparisons.
- No live scoreboard/PWA files or GitHub Actions modified.
