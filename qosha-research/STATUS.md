# Qoşa research status

Updated: 2026-10-28 23:47 +04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **740,496** separate synthetic hidden-world allocations (738,448 previous + 2,048 new); exact partitions are not independent new random worlds.
- Engine `qosa-research-0.5.3 + double-connectivity-holdout-1.0`, recovered `qosa-1.0.0` 3×9; both branch models **PROVISIONAL**.
- Latest new seeds `2809448..2811495`; next unused >= `2811496`.

## Latest checkpoint — independent connector-stratum holdout
- [Script](simulator/double-connectivity-holdout.js), [checkpoint](runs/2026-10-28-2347-double-connectivity-holdout.md), [raw](runs/2026-10-28-2347-double-connectivity-holdout.json).
- 32 disjoint new focal hands (8 per stratum), 29,568 exact hand-world partitions, 2,048 new seeded hidden allocations, 0 new complete rounds.
- **Prior 8/8 universal-safety observation in Z+/S0 fails on the very first fresh holdout hand:** only 490/924 allocations safe for single0/low. Do **not** promote zero-connector possession to a universal strategy.
- Exact conditional combinatorics valid for the synthetic fixture; neither branch model authenticated, no win-rate conclusion. V8 CommonJS harness executed; Node CLI not run.

## NEXT ACTION
Study structural counterconditions and opponent-pass-conditioned midgame positions; authenticate physical late-arrival branch unlocking, optional multi-double timing and blocked ties. No scoreboard/PWA or GitHub Actions touched.
