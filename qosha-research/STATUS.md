# Qoşa research status

Updated: 2026-10-27T16:51:19+04:00 (Asia/Baku)

## Verified cumulative scale
- **1,328,175** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **14,082** immediate next-opponent pass labels (unchanged).
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9; global four-side number-lock **PROVISIONAL**.
- Fresh disjoint seeds **1599340..1600539**; next >=**1600540**.

## Latest checkpoint
- One-step branch-unlock sensitivity: **1200 deals × 2 policy mixes × 3 seat rotations = 7200 rounds**, 6946 finishes, 254 blocks, 0 unresolved; mean round length 25.32125, block rate 3.5278%.
- Policies: random-legal/min-hand-pips/closed-branch-control vs fast-doubles/moderate-double-hold/closed-branch-control; same seed/deal per rotation.
- **15,848** double openings on ≥2 matching sides; **14,758** were nonterminal and analyzed for the *next player's immediate legal actions*.
- Hypothetical side-local rule: one played double opens only ONE of the matching sides, enumerating all candidate sides. Under global unlock the next player had **4.164** actions/event versus **2.430** under side-local (same min/max across side choices); **12,338** events lost at least one legal action.
- In this one-step sample **0** next-player forced-pass flips, but **112** events changed the chosen tile/action group for deterministic next-player policies; **9** lost at least one mixed-finish option. This is NOT a full alternate-rule simulation, and no authentic branch rule has been established.
- Minus finishes: −10=1091, −20=47, −30=1, −40=0. Block winner/tie remains unassigned.
- Deterministic 2-side opening fixture and 6-deal/36-round replay test passed using V8 CommonJS loader; Node CLI not executed.
- Code: `simulator/branch-side-sensitivity.js`; full reproducible data: `runs/2026-10-27-1651-branch-side-sensitivity-1599340-1600539.json`.
- Read-only scoreboard inspection: `qosha-rules.js` handles 101-point explosion and score entry but does not authenticate branch unlocking or blocked-round winner.
- No scoreboard/PWA files or GitHub Actions modified. No new validated human-game tactic.

## NEXT ACTION
- Build an isolated **side-local full-round counterfactual kernel** with explicit side-selection policy and matched seeds >=1600540; compare first-finish/block/−10..−40/decision differences against global-number baseline. Do NOT promote strategy results until actual branch-opening and blocked-winner examples are confirmed. Preserve block ties as unresolved.
