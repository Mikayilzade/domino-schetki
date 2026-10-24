# Qoşa research status

Updated: 2026-10-24 20:54:05 +04

## Verified scale
- **641100** full-round continuations; **850992** forced hidden-world counterfactual continuations. Historical 4,000 separate.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0; primary 3×9. Real four-branch number locking PROVISIONAL.
- Fresh seeds used through **1411639**; next independent seed >= **1411640**.

## Latest checkpoint
- Independent six-permutation holdout: **45600** full continuations, **95** forced 3-stone positions (88 chain), **11328** hidden-world forced continuations; 0 unresolved.
- Chain versus max-pips finish-first **34.24% vs 34.44%** in balanced tournament; chain preservation raises minus-finish frequency **+37.59 pp** but reduces finish-first **−12.41 pp** within eligible same-world chain positions (model-only).
- **Policy-alias correction:** closed-branch-control and pip-late-fewest-forced-doubles made identical decisions in **13182** reachable comparisons. Their apparent replication is not independent.
- Next opponent two stones: n=8, chain preserve minus max-pips finish-first −42.71 pp; exploratory, not a recommendation.
- Code: `simulator/chain-independent-holdout.js`; complete data: `runs/2026-10-24-2048-chain-independent-1409240.json`. V8 tests passed; Node CLI not run.
- Scoreboard/PWA untouched.

## NEXT ACTION
Fresh seeds >=1411640: genuinely different continuation policy, immediate next-opponent finish threat for each forced choice, larger 2-stone subgroup. Authenticate branch lock and block winner/loneZero/bust before match scoring.
