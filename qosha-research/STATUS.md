# Qoşa research status

Updated: 2026-10-28T07:49:11+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands previously enumerated.
- **479,000** separate synthetic hidden-world allocations (459,000 previous + **20,000** new). Not complete rounds.
- Engine `qosa-research-0.5.3 + opening-next-pass-exact-1.0`; recovered `qosa-1.0.0`.
- Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- Last fresh seeds **2100000..2119999**; next unused **>=2120000**.

## Latest checkpoint — exact immediate-pass candidate comparison
- Synthetic known 9-tile starter hand after 1-1 and stock draw: `1-2,1-5,1-3,0-0,0-2,2-2,3-4,4-5,5-6`. Stock empty; three candidate moves `1-2`, `1-3`, `1-5`.
- Exact **48,620** opponent 9-tile assignments from 18 unknown stones. Forced next-opponent pass: after `1-2` **5,005/48,620 = 10.2941%**; after `1-3` or `1-5` **2,002/48,620 = 4.1176%**. The starter holds `2-2`, whereas opponents may hold `3-3` or `5-5` and open the new end.
- **20,000 matched deterministic hidden worlds**: pass counts 2,010 / 836 / 827 respectively; maximum |z| **1.14** against exact rates. 100 seed replay checks, deck conservation and seven exact combinatorial checks passed in V8. Node CLI not executed.
- **Useful tactical hypothesis (not a win-rate result):** a starter `1-X` may reduce immediate opponent mobility when the starter owns `X-X`. This does not prove that `1-2` is the best move; it removes fewer pips than `1-3` or `1-5`.
- This initial opening comparison is invariant to the disputed *later* branch-arrival models; real opponent policies, future turns, block ties and 101 scoring are not included.
- Reproduce: `simulator/opening-next-pass-exact.js test`; `simulator/opening-next-pass-exact.js 2100000 20000`. Data: `runs/2026-10-28-opening-next-pass-2100000-2119999.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Extend paired immediate-pass analysis to deterministic dealt starter hands; compare held `X-X` vs unknown `X-X`, then authenticate late-arrival branch unlocking before using full-game win rates to rank tactics.
