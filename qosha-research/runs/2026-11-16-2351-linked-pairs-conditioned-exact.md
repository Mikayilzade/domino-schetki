# Exact linked-pair baseline controlled for connector and double counts

Timestamp: 2026-11-16 23:51 Asia/Baku. Reference engine `qosha-research-0.5.3` (not executed); rules `qosa-1.0.0`, 3 players × 9 tiles, one stock. **This is an independent exact opening-inventory calculation, not gameplay validation.**

After starter plays 1-1 and draws the mandatory stock tile, its nine tiles are a uniform subset of the remaining 27. For each x in {0,2,3,4,5,6}, let connector A_x=1-x and double B_x=x-x. Define K=# connectors among six, D=# matching-category doubles among six, L=at least one x with both A_x and B_x in hand. The other 15 tiles are fillers.

Exact formula conditional on K,D:
`P(L | K,D)=1-C(6-K,D)/C(6,D)`, where C(n,k)=0 if k>n. The hand-count weight for each K,D is `C(6,K) C(6,D) C(15,9-K-D)`. The connector and double sets are independent conditional on their counts (not unconditionally).

| K \\ D | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 16.67 | 33.33 | 50.00 | 66.67 | 83.33 | 100 |
| 2 | 0 | 33.33 | 60.00 | 80.00 | 93.33 | 100 | 100 |
| 3 | 0 | 50.00 | 80.00 | 95.00 | 100 | 100 | 100 |
| 4 | 0 | 66.67 | 93.33 | 100 | 100 | 100 | — |
| 5 | 0 | 83.33 | 100 | 100 | 100 | — | — |
| 6 | 0 | 100 | 100 | 100 | — | — | — |

Values are percent; — indicates impossible K+D>9. This provides an **exact null baseline** for later matched-seed analysis conditioned on BOTH connector count and available doubles, preventing the misleading interpretation that more connectors alone causes a better strategy outcome.

Execution: exhaustive JavaScript 12-bit enumeration of all 4096 connector/double masks, each weighted by `C(15,9-K-D)`. Sum of weights = **4,686,825 = C(27,9)**. Representative cells: K=2,D=2 has 405,405 linked hands / 675,675 total = 60%; K=3,D=3 has 172,900 / 182,000 = 95%; K=1,D=1 has 38,610 / 231,660 = 1/6. All values are exact fractions; table rounded.

New gameplay deals: **0**; hidden-world samples: **0**; rollouts: **0**; seed range: none (exact enumeration); strategies: none; full gameplay gate: **0/17 suites executed**; hidden-world gate: **0/4 executed**. Historical 180,000 matched-seat rounds are a separate legacy subtotal. Win, remainder, length, block, minus and regret not measured. No new validated strategic advantage.

Confidence: exact for uniformly shuffled inventory and confirmed opening draw, none for legal move availability or engine correctness. Branch unlocking, block allocation and loneZero=10 remain provisional. Executable git checkout unavailable due DNS `Could not resolve host: github.com` in this run; connector file reads work.

**Next action:** restore complete single-commit research-only checkout, verify pinned inventory and blob drift, run preflight, 17 gameplay suites, four hidden-world suites and fingerprint replays, archive raw JSON/timings; then evaluate linked-pair retention on matched seeds stratified by (K,D), with starter status held fixed. Do not modify live scoreboard/PWA or create GitHub Actions.
