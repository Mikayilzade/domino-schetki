# Qoşa research status

Updated: 2026-10-28 18:50 +04:00 (Asia/Baku)

## Verified cumulative (do not pool incompatible models)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **714,200** separate synthetic hidden-world allocations (702,200 previous + 12,000 new); 924 exact partitions from this checkpoint are *enumeration*, not extra sampled worlds.
- Earlier exact **1,820 × 924 = 1,681,680** conditional hand partitions remain separate.
- Engine `qosa-research-0.5.3 + midgame-double-rich-1.0`; recovered `qosa-1.0.0` 3×9. Both branch unlock models **PROVISIONAL**.
- New seeds **2773200..2785199**; next unused >= **2785200**.

## Latest checkpoint — two simultaneous playable doubles
- [`simulator/midgame-double-rich.js`](simulator/midgame-double-rich.js) implements a physically plausible chronological 1-1/stock-draw 3×9 trace with p2's 0-0 and 6-6 both legally playable on locked 0 and 6 ends; source includes tests and exact 924-partition enumeration.
- Two 6,000-world seeded cohorts compare single 0-0, single 6-6, 0-0→6-6, 6-6→0-0, under two provisional branch models and three simple opponent policies. Results and exact numbers in [`runs/2026-10-28-1850-midgame-double-rich.md`](runs/2026-10-28-1850-midgame-double-rich.md).
- Both chain orders are exactly equivalent in this trace; stopping after one double preserves the other locked branch. The chain opens both ends and sheds one extra stone, changing opponent access. No full-game win/minus inference.
- Validation passed in V8 CommonJS-compatible harness; Node CLI not executed. Uniform hidden worlds do not condition on past choices. Branch unlocking, block ties, loneZero/bust and 101 scoring remain unverified.

## NEXT ACTION
Authenticate a real physical late-arrival branch and optional double-chain trace; then confirm block ties before scoring full games. No scoreboard/PWA or GitHub Actions touched.
