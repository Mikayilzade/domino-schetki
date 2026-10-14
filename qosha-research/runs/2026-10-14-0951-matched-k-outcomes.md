# Matched-K paired outcomes — 2026-10-14 09:51 Asia/Baku

Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary **3×9**. Independent discovery seeds `3620000..3629999` (stopped after scanning **6641** deals, last seed `3626640`); **40 distinct reachable positions**, 35 middle / 5 late, no previous pass. Deterministically select the first eligible single-versus-one-double action pair per deal, matching discarded pips, remaining hand size and **K** (number of distinct unknown playable stones), but differing in retained doubles. Code: `simulator/matched-k-outcome-runner.js`. Exact selected deal seeds and metrics: `runs/2026-10-14-0951-matched-k-outcomes-summary.json`.

**New simulations:** 25 identical hidden worlds per position = **1000 sampled allocations (905 distinct within positions)**; 3 continuation policies, 2 forced candidates, **6000 completed candidate continuations**, 0 unresolved. Hidden-world seed `(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0`. No new full strategy rounds; previously verified cumulative **180000** (historical 4000 separate).

**Immediate next opponent:** after playing the single, next player had fewer legal action placements in **698/1000** worlds; opening the double gave fewer in **105/1000**, equal in **197/1000**. Mean legal placements **2.662** after single vs **4.176** after double. Play/pass flipped in only **21/1000** worlds; both could play in 979. Count of placements is not the count of distinct playable stones.

**Paired single-minus-double results**, equal position weights:
- `closed-branch-control`: finish-first **+14.0 pp** (exploratory 95% position interval **+6.70..+21.30 pp**); focal remainder **−0.564 pips**, minus-finish **+13.4 pp**.
- `min-hand-pips`: finish-first **+14.2 pp** (**+6.03..+22.37 pp**); remainder **−0.703**, minus-finish **+4.6 pp**.
- `fast-doubles`: finish-first **+13.7 pp** (**+5.48..+21.92 pp**); remainder **−0.571**, minus-finish **+4.9 pp**.
- Positive/negative/tied positions by policy: **28/9/3**, **26/8/6**, **23/10/7**.

**Interpretation:** matched-K comparisons support a *provisional* advantage for the selected single/retain-double action across three bot policies, alongside lower opponent choice multiplicity. This **does not establish** that restricting choices or retaining a double independently causes the win advantage: post-action branch/open geometry and exact playable-stone identities differ. The 40 positions are selected rather than representative of all games.

**Validation and limitations:** V8 CommonJS deterministic fixture `3603084` passed; hidden-world candidate set and visible-state immutability checked. Node CLI not run. Uniform hidden allocations sampled with replacement, not a posterior conditioned on opponents' earlier decisions; assumed branch-opening semantics, deterministic bots, block winner unassigned. Exploratory position-level intervals are not preregistered. No 5-player claim.

**Exact next action:** run `node qosha-research/simulator/matched-k-outcome-runner.js test`, then `node qosha-research/simulator/matched-k-outcome-runner.js 3620000 3630000 40 25` and compare JSON; replicate on disjoint seeds under alternate discovery policy; stratify by exact playable-identity overlap and opponent legal-action multiplicity with history-conditioned worlds.
