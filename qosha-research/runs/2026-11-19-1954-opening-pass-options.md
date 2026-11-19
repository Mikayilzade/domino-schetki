# 2026-11-19 19:54 Asia/Baku — exact opening-pass option distribution

- Source of truth: GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation preflight and both gate scripts read before work.
- Engine/rules: standalone exact combinatorial oracle; gameplay engine reference qosha-research-0.5.3 / recovered qosa-1.0.0, primary 3 players × 9 tiles, one stock. Provisional branch/block/loneZero assumptions not used.
- Deals: **0 gameplay deals**; no seed set, no strategies, no matched-policy comparisons. Exact conditional space: **48,620** equally likely 9-of-18 allocations, counted analytically and independently by dynamic programming; local Node execution passed both checks.
- Conditioning: starter held 1-1, took mandatory stock, and had no other 1-x tile. Then all six 1-x connectors are among the 18 opponent tiles; next player has 9.
- Exact counts for k=0,1,2,3,4,5,6 available 1-x tiles: **220, 2970, 11880, 18480, 11880, 2970, 220** / 48,620. Mean **3**. P(k>=2)=**93.438914%**; P(k=3)=**38.009050%**; P(k=0)=**0.452489%**. This refines the earlier >=2 finding into a complete distribution; it is not an independent strategy result.
- New finding: after the rare starter pass, the next player most often holds exactly **three** 1-x connectors (38.01%). This measures hand options only, not optimal play.
- Confidence: exact under uniform shuffle and the stated conditioning; two mathematically independent counting methods agree. No gameplay-engine test is implied.
- Execution blocker: shell git ls-remote failed DNS resolution of github.com this run. Full checkout still unavailable. Gameplay validation **0/17**, hidden-world validation **0/4** in this run. No new win/first-place, remainder, round-length, block, minus, double-value, branch-effect or regret measurements. Historical 180,000 matched-seat rounds remain separate and are not new samples.
- Source: simulator/opening-pass-next-seat-options-oracle-20261119.js (run: node qosha-research/simulator/opening-pass-next-seat-options-oracle-20261119.js).
- Exact next action: recover a complete verified research-only executable checkout, run preflight and both gates, archive JSON; only after green evidence compare policies on identical seed sets and test whether having 2/3/4 connectors affects tempo and double retention. Do not modify PWA or create Actions.
