# Qoşa research status

Updated: 2026-10-28 17:45 +04:00 (Asia/Baku)

## Verified cumulative (do not pool incompatible models)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **702,200** separate synthetic hidden-world allocations (**678,200** previous + **24,000** new).
- Earlier exhaustive **1,820 × 924 = 1,681,680** conditional hand partitions remain *exact enumeration*, not sampled worlds.
- Engine `qosa-research-0.5.3 + midgame-chain-return-1.0`; recovered `qosa-1.0.0` 3×9. Both branch unlock models remain **PROVISIONAL**.
- Fresh seeds **2749200..2773199**, two disjoint 12,000-world cohorts; next unused **>=2773200**.

## Latest checkpoint — midgame connector protection and double-chain stress
- Reproducible script and full embedded run data: [`simulator/midgame-chain-return.js`](simulator/midgame-chain-return.js) (export `CHECKPOINT`). V8 CommonJS-compatible test and full 24,000-world run **executed**; Node CLI **not** executed.
- Same synthetic 3×9 public history and legal focal `2-3` action as the preceding two-opponent study: collapse to four 3 ends vs spread to two 2 and two 3 ends; same focal hand, opponent hands and discarded pips in each paired world.
- Two provisional branch models × four opponent policies: high-pip, low-pip, double-first, and an **omniscient focal-mobility-denial oracle** (stress test only; NOT a realistic opponent).
- **10,858 / 24,000** worlds had a focal 3 connector. In this stratum, the focal player's next-turn forced-pass frequency was **0 in BOTH alternatives under all eight model/policy combinations**. This fixture has at least three unlocked 3 ends after collapse; two opponent turns cannot consume all three with one ordinary placement each. This is a short-window fixture invariant, **not a general winning rule**.
- **13,142 / 24,000** worlds had no focal 3 connector; all forced-pass risk differences arose in this stratum. Global/high collapse vs spread own pass: **24.554% vs 2.596%** overall (**+21.958 pp**); all-current/high: **24.554% vs 20.688%** (**+3.867 pp**).
- **Policy dependence:** under *all-current-only* and omniscient denial, collapse vs spread own pass **32.338% vs 43.071%** (**−10.733 pp**), reversing the high/low policy direction. Under *global-ever-open* and the same oracle, **32.338% vs 13.017%** (**+19.321 pp**). This is a strong warning against generalizing a win tactic from one branch interpretation or one bot.
- Opponent stones collapse−spread: global/high **−0.5780**, global/low **−0.5777**, global/double-first **−0.5780**, global/oracle **−0.5658**; current/high **−0.4835**, current/low **−0.4412**, current/double-first **−0.4835**, current/oracle **−0.3605**.
- **Optional multi-double continuation implemented and tested** (two-double locked-end fixture; ordinary+double append prohibited). In this specific public trace **zero extra chained doubles** across all 24,000 worlds and eight modes. The only unplayed doubles are 0-0 and 6-6, and the two-turn board never exposes both required values simultaneously for one player; a different trace is required to study chain frequency.
- 100 deterministic world replays, full 28-tile conservation, post-action geometry, locked double unlock, optional chain, and exact first-opponent pass calibration passed.
- **No validated full-round win, remainder, minus, regret or 101-match claim.** Opponent hands are synthetic uniform allocations, not conditioned on earlier choices; oracle has private knowledge; branch legality, blocked winner/ties, loneZero/bust and match scoring remain unresolved.

## NEXT ACTION
Build a separately documented, physically plausible midgame trace with two simultaneously playable unplayed doubles and verify optional multi-double tempo under both branch models. Authenticate late-arrival branch unlocking and block ties before scoring full games or ranking finish-first strategy. No scoreboard/PWA files or GitHub Actions touched.
