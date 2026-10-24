# Qoşa research status

Updated: 2026-10-24 19:57:54 +04

## Verified scale
- **595500** full-round continuations; **839664** forced hidden-world counterfactual continuations. Historical 4,000 separate.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9; real four-branch locking/opening **provisional**.
- Fresh research seeds used through **1409239**; next independent seed >= **1409240**.

## Latest checkpoint
- Three-stone double–connector–double chain ablation: 45600 full-round continuations, 91 matched late positions (84 chain), 10416 hidden-world forced continuations.
- **Important methodological fix:** strategy tournaments now use all six seat permutations, not just three cyclic rotations; earlier cyclic-only finish-first comparisons may be confounded by relative clockwise order.
- Direct balanced triad chain/fewest/max-pips finish-first: 34.06% / 28.78% / 34.22%; these are not match wins.
- Within-position chain select-minus-many: finish-first -10.22 pp; minus frequency 37.95 pp, provisional number-lock model.
- Tests: chain/nonchain gating, ordinary exclusion, six-permutation balance, deterministic replay, accounting passed in V8 CommonJS; Node CLI not run.
- Code: `simulator/three-stone-chain-preservation.js`; data: `runs/2026-10-24-1950-three-stone-chain-1406840.json`.

## NEXT ACTION
Hold out on fresh seeds >=1409240; null-policy symmetry test and recheck earlier cyclic-only findings; authenticate real branch opening and block winner/loneZero/bust before match scoring. All changes restricted to `qosha-research/`.
