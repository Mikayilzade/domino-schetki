# Qoşa research status

Updated: 2026-10-26 00:48:14 +04 (Asia/Baku)

## Verified cumulative scale
- **957735** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest fresh unique seed window **1556140..1556939** (800 deals; late analysis uses first 400). Next fresh seed **>=1556940**.

## Latest checkpoint
- New deterministic `simulator/six-pair-opponent-mixes.js` compares **six-pair-hold vs closed-branch-control** on identical seeded deals and focal seats against three fixed opponent mixes.
- **14,400** full policy-swap rounds, 13,947 finishes, 453 blocks, zero unresolved. Six-pair-hold finish-first deltas: **−5.21 ±1.64 pp** vs closed+closed, **−9.33 ±2.24 pp** vs min+min, **−5.00 ±2.01 pp** vs closed+min. Focal remainder **+2.35 / +2.60 / +2.10 pips**. Exploratory deal-cluster normal 95% half-widths.
- Initial **6-6 + >=2 connectors** subgroup: 484 seed/seat observations per mix; finish-first deltas **−3.51 ±5.26 / −0.21 ±5.42 / −1.86 ±5.27 pp**, not significant; remainder still **+1.59 to +1.93 pips**. This does not establish a beneficial exception.
- Independent late 6-6 selected cohort: **400** fresh deals, **4,800** discovery rounds, **124** legal paired positions (**123 distinct deals**), **3,968** forced continuations, zero unresolved. Double-minus-connector finish-first **−22.51 ±6.18 pp** (min-pips continuation) / **−26.52 ±6.33 pp** (closed control). After-double connectors >=2 only n=21, exploratory, not a proven tactical rule.
- V8 CommonJS deterministic tests passed; Node CLI not executed. No live scoreboard/PWA changes.
- Run data: `runs/2026-10-26-0048-six-pair-policy-swap-1556140.json`, `runs/2026-10-26-0048-six-late-strata-1556140.json`.

## NEXT ACTION
- On disjoint seeds >=1556940, test a **conditional** 6-6 retention policy (preserve 6-6 only when >=2 other 6-Y connectors remain AND both opponents have >4 stones), matched against closed-branch-control and the unconditional six-pair-hold, with deal-cluster uncertainty.
- Seek authenticated human fixtures for four-branch lock/open, block winner, loneZero and 101-point scoring before giving definitive human-play advice.
