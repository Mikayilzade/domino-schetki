# Qoşa research status

Updated: 2026-10-26 02:57:49 +04 (Asia/Baku)

## Verified cumulative scale
- **1008135** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest disjoint seed window **1558140..1559139**, 1,000 deals; next fresh seed **>=1559140**.

## Latest checkpoint
- Added `simulator/six-public-response-gate.js` with a public-information-only tactical retention policy: protect 6-6 with >=2 connectors only if alternative increases estimated next-opponent pass chance by >5 pp without reducing own post-move tile mobility.
- Opponent hands are used only for retrospective observed-pass diagnostics, NEVER for policy decisions.
- V8 CommonJS hypergeometric fixture and 108-round deterministic replay passed; Node CLI not executed.
- **18000** matched full rounds, 17428 finishes, 572 blocks, 0 unresolved; minus −10/−20/−30/−40 = 4013/144/12/8.
- Combined gate-minus-control finish-first by opponent mix (closed+closed / min+min / closed+min): 0.07 / 0.13 / 0.10 pp; final pips delta 0.001 / 0.002 / -0.003.
- Gate eligible/changed decisions by mix: 588/15 / 673/20 / 638/17. Decisions are not independent deals.
- Complete row-level outcomes, discovery/holdout and uncertainty: `runs/2026-10-26-public-response-six-1558140.json`.
- No real-game tactic established until four-branch and scoring rules are authenticated.

## NEXT ACTION
- Test any apparent effect on fresh seeds >=1559140. If too few gate changes, inspect predicted pass and mobility constraints, not opponent hidden identities.
- Obtain authentic branch-open/locked, block-winner, loneZero, bust and 101-match fixtures.
