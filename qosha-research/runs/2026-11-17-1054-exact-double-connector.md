# 2026-11-17 10:54 Asia/Baku — exact conditional connector oracle

- Source: GitHub `qosha-research/{README,RULES,EXPERIMENTS,RESULTS,STATUS}.md` and checkout inventory read at run start.
- Engine reference: `qosha-research-0.5.3`; rule reference: recovered `qosa-1.0.0`; main mode 3 players × 9 stones, standard 28-tile double-six.
- This is **independent combinatorics**, not a gameplay-engine validation or strategy simulation. Gameplay deals: **0**; seed set: **none** (exact enumeration); strategies: **none**; hidden worlds / rollouts: **0**.
- Narrow conditioning: a specified 9-tile hand contains `1-1`, contains **exactly two** doubles with distinct values in `{2,3,4,5,6}`, contains **no other doubles from {2,3,4,5,6}**, and may contain `0-0`. The remaining six tiles are drawn uniformly from the 21 non-doubles plus `0-0` (22 candidates).
- Question: does this hand contain the **direct non-double connector** `x-y` between the two additional doubles `x-x` and `y-y`?
- Exact result: for each fixed pair `x,y`, denominator `C(22,6)=74,613`; favorable hands `C(21,5)=20,349`; probability **3/11 = 27.272727…%**. Across all `C(5,2)=10` possible double pairs: **746,130** hands, **203,490** with the connector. Verified by a separate exhaustive Python combinations enumeration in the execution environment and by the binomial identity.
- Interpretation: under this precise conditioning, roughly **72.73%** of such hands lack the direct bridge. This measures **hand structure only**, not legal moves, branch unlocks, eventual minus finishes or value of holding doubles. It is not comparable to differently conditioned earlier 10% connected-double statistics.
- Confidence: **exact** for the explicitly stated uniform conditional model; **no** evidence of strategic advantage. No branch, block or `loneZero` assumptions affect this count.
- Runtime status: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still fails in executable shell with DNS `Could not resolve host: github.com`. Full validation gates remain unexecuted in this run (**0/17 gameplay**, **0/4 hidden-world**). Historical 180,000 matched-seat rounds are a separate legacy subtotal.
- Metrics not measured this run: win/first-place rate, mean/median remainder, round length, blocks, minus frequencies, starting/ending doubles in actual rounds, branch effects, decision regret.
- **Exact next action:** reconstruct a pinned full simulator checkout using GitHub connector transfer or restored shell DNS; execute preflight, 17 gameplay suites, 4 hidden-world suites, fingerprint replay, archive JSON outputs. Then test whether retaining the `x-x, x-y, y-y` chain beats spending `x-x` on matched deals, with branch-state and opponent-size strata.
- Live scoreboard/PWA files and GitHub Actions unchanged.
