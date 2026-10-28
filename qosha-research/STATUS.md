# Qoşa research status

Updated: 2026-10-28T12:49:36+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload scale only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **330,000** deterministic opening deals (280,000 prior + **50,000 new**), separate from model-rounds.
- **587,000** distinct synthetic hidden-world allocations (571,000 prior + **16,000 new**), separate from rounds. The corrected replay of an older 16,000-world batch is **not counted twice**.
- Engine `qosa-research-0.5.3 + actual-connector-paired-1.0`; recovered `qosa-1.0.0`.
- Late-arrival branch legality, blocked winner/ties, loneZero/bust and 101 scoring remain **UNVALIDATED**.
- New deal seeds **2432000..2481999**; new world seeds **2482000..2497999**; next unused **>=2498000**.

## Latest checkpoint — actual legal 1-X versus 1-Y choice
- 50,000 new seeded deals; 48,207 valid first-round starters; 18,089 eligible hands; **500 sign-balanced positions × 32 same hidden worlds = 16,000 new allocations**. Both arms are legal connector plays from the **same hand**. No complete strategy rounds.
- Arm A: play 1-X while retaining owned X-X; arm B: play 1-Y when Y-Y is not held. 250 positions have X>Y and 250 X<Y. **Opening pips and branch geometry differ**, so this is not a pure double-retention effect.
- First clockwise opponent pass: **10.58125% vs 4.40000%** (+6.18125 pp), versus exact combinatorial +6.11294 pp. Independent 48,620-way enumerations and seeded calibration passed.
- Opponents' stones in next two turns: high-pip optional chain **1.83719 vs 2.08256** (delta **-0.24538**, exploratory position CI [-0.25602,-0.23473]); low-pip chain delta **-0.19406**. Effect retains sign with X>Y (-0.24700) and X<Y (-0.24375) for high-chain.
- Focal return legal stones high-chain **3.59094 vs 2.97794** (+0.61300), under the two explicit provisional branch models in this two-turn window; no branch disagreement in these windows.
- Tests: V8 execution of 20-position fixture and full 500-position study, 28-tile conservation, canonical 0-1 removal, optional double chain/no ordinary append, two exhaustive 48,620-partition checks, 100 seeded replays; Node CLI not run.
- **Interpretation:** this legal choice can reduce immediate opponent tempo in the provisional model; **no proven win-rate improvement or universal tactical rule**.
- Code: `simulator/opening-actual-connector-paired.js`; raw `runs/2026-10-28-1249-actual-connector-paired-2432000-2497999.json`.

## X=0 audit — same-seed correction, NOT new samples
- Replayed previous 50,000 deals / 16,000 worlds (2300000..2349999, 2350000..2365999) after correcting noncanonical 1-0 connector removal to 0-1.
- High-chain focal return-legal advantage corrected **+0.49444 -> +0.58044** (+0.08600). Opponent-move deltas unchanged. Same-world replay **not added** to cumulative allocations.
- Source fixed: `simulator/opening-two-opponent-chain.js`; corrected data `runs/2026-10-28-1249-opening-two-opponent-chain-corrected-2300000-2365999.json`. Old raw retained for audit provenance.

## NEXT ACTION
- Authenticate late-arrival branch unlocking and blocked winner/ties with actual gameplay evidence; until then keep full-game win/minus ranking gated. On independent seeds, test legal connector-choice effects by pip-gap and connector count, with paired continuation and explicit rule-model sensitivity.
