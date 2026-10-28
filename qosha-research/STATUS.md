# Qoşa research status

Updated: 2026-10-28T09:46:17+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **180,000** random deterministic opening deals (60,000 prior + 60,000 prior + **60,000 new**), tracked separately from model-rounds.
- **539,000** separate synthetic hidden-world allocations (**499,000 previous + 40,000 new**); not complete rounds.
- Engine `qosa-research-0.5.3 + opening-two-opponent-window-1.0`; recovered `qosa-1.0.0`.
- Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- New deal seeds **2200000..2259999**, hidden allocation seeds **2260000..2299999**; next unused **>=2300000**.

## Latest checkpoint — owned-double advantage after both opponents
- 60,000 new deterministic first-round deal seeds: **57912** valid starters, **21721** hands with both candidate classes, **1,000** fixed paired hands × **40** matched hidden allocations = **40,000** worlds.
- Candidate 1-X with owned X-X versus candidate 1-Y with unseen Y-Y; minimum X/Y within class. Two opponents each choose **one** legal stone by highest-pips or lowest-pips, respectively; optional multi-double chains intentionally not modeled.
- Highest-pip policy: first opponent pass **9.60% vs 3.92%**; second opponent pass **5.34% vs 1.50%**; two-opponent stone count **1.85055 vs 1.94572** (owned minus unowned **-0.09517**, position-cluster 95% interval [-0.10071, -0.08964]).
- Lowest-pip policy: two-opponent stone count **1.85170 vs 1.94738** (delta **-0.09567**, position-cluster 95% interval [-0.10141, -0.08994]).
- Focal player's return mobility (number of distinct playable stones) **3.728 vs 2.979** with high-pip opponents, **3.603 vs 2.896** with low-pip opponents.
- Two-opponent tempo and return mobility were identical under **both provisional branch models** in all sampled worlds (late-arrival case not triggered). Exact 48,620-partition checks for 4 fixed hands, 100 deterministic replays, 28-tile conservation passed in V8. Node CLI not executed.
- **Finding:** the immediate pass advantage persists through the next two opponent turns under these limited continuation policies, but **is not evidence of a win-rate gain**; saving the double can cost immediate pips and may behave differently with multi-double play or later turns.
- Raw: `runs/2026-10-28-0946-opening-two-opponent-window-2200000-2299999.json`; code `simulator/opening-two-opponent-window.js`. No scoreboard/PWA or GitHub Actions touched.

## NEXT ACTION
- Re-run on disjoint seeds with legal optional multi-double opponent policy; stratify by connector count and immediate pip cost. Confirm late-arrival branch and blocked tie rules before any full-game win claims.
