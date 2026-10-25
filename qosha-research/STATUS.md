# Qoşa research status

Updated: 2026-10-26 01:52:36 +04 (Asia/Baku)

## Verified cumulative scale
- **990135** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest disjoint seed window **1556940..1558139** (1,200 deals, discovery 600 + holdout 600). Next fresh seed **>=1558140**.

## Latest checkpoint
- Added `simulator/six-conditional-hold.js` with deterministic matched-deal three-arm policy test. The conditional policy protects 6-6 ONLY with >=2 other 6-Y connectors and BOTH opponents holding >4 stones, provided a non-6 legal move exists; otherwise closed-branch-control. Comparator `six-pair-hold` is the earlier unconditional policy.
- **32,400** complete full rounds: **31,333 finishes**, **1,067 blocks**, **0 unresolved**. Conditional gate eligible at **4,946** focal decisions and changed the control choice at **3,553**; these are decisions, not independent deals.
- **No verified conditional win-rate improvement over closed-branch-control.** Conditional-minus-control finish-first deltas by opponent mix (closed+closed / min+min / closed+min): **−0.53 ±0.78 / −0.19 ±0.85 / ~0.00 ±0.82 pp**. Focal remainder **+0.194 / +0.089 / +0.158 pips**, worse in all three mixes. Exploratory uncorrected deal-cluster 95% normal half-widths.
- Discovery/holdout finish-first deltas do **not** reproduce a positive sign across opponent mixes. The initial 6-6 plus >=2 connectors stratum has **716 deal/seat observations per mix** and no supported positive win-rate delta; remainder worse by **+0.98 / +0.45 / +0.79 pips**.
- Conditional strategy **does improve on unconditional six-pair-hold**, by **+5.08 / +6.58 / +6.19 pp** finish-first and **−2.14 / −2.48 / −2.29 pips**. This is evidence against indiscriminate holding, not evidence conditional beats control.
- Deterministic V8 CommonJS fixtures and 8-deal replay passed; Node CLI not executed. Live scoreboard/PWA untouched.
- Full row-level reproducible data: `runs/2026-10-26-0152-conditional-six-hold-1556940.json`.

## NEXT ACTION
- On fresh seeds >=1558140, test a **more selective tactical retention rule** tied to the *immediate legal next-opponent response/branch geometry*, not just number of connectors or opponents' hand sizes; first isolate an invariant legal-choice metric from provisional opening rules if possible.
- Obtain authentic human four-branch locked/open, block-winner, loneZero and 101-point scoring fixtures before promoting human-game advice.
