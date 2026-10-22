# Current research checkpoint — 2026-10-22T14:59:45 +04:00
- Engine qosa-research-0.5.3 / qosa-1.0.0; 3×9 provisional branch semantics.
- Verified cumulative: 389700 full + 440060 separate counterfactual continuations.
- Independent seeds 1343840..1353839: 30 exact-size held/no-extra pairs, 60 positions, 7023 hidden allocations, 42138 continuations; V8 deterministic replay and matching tests green, Node CLI not run.
- First-place held-minus-none matched effect: min-pips 2.18 pp, branch-control 5.54 pp, fast-doubles -1.47 pp; exploratory intervals in JSON. No general causal claim.
- Files: simulator/connector-exact-size-mobility-holdout.js; runs/2026-10-22-1455-connector-exact-size-mobility.json.
- Next: full-deal mobility-conditioned policy on fresh seeds, Node CLI regression.

# Current research checkpoint — 2026-10-22 13:59:35 (+04)
- Engine qosa-research-0.5.3 / qosa-1.0.0, 3×9, provisional branch semantics.
- Verified cumulative: 389700 full + 397922 separate counterfactual continuations.
- Fresh seeds 1334840..1343839: 30 matched pairs, 60 positions, 7033 hidden allocations, 42198 forced continuations, zero unresolved. V8 deterministic test green; Node CLI not run.
- Extra retained connector matched first-place contrast +4.71/+6.17/+1.25 pp (min-pips/branch-control/fast-doubles), all exploratory 3SE intervals cross zero; no reliable rule. Immediate pass contrast -0.03 pp.
- Files: simulator/connector-held-matched-holdout.js and runs/2026-10-22-1359-connector-held-matched.json/.md.
- Next: independent seeds >=1343840; exact hand-size controls and within-position future mobility.

# Current research checkpoint — 2026-10-22 12:50 (+04)
- Engine qosa-research-0.5.3 / qosa-1.0.0, 3×9 provisional branch rules.
- Cumulative **389700 full** + **355724 separate counterfactual** continuations.
- New: 78 sign-balanced positions, 7082 hidden worlds, 42492 forced continuations. V8 deterministic replay green; Node CLI not run.
- |pip gap|=1 balanced by sign, double, discovery policy. Endpoint geometry not controlled; no general win rule established.
- Files: simulator/connector-signed-gap-holdout.js; runs/2026-10-22-1250-connector-signed-gap.json/.md.
- Next: seeds >=1334840, endpoint-pair reversal and independent full-deal validation; Node CLI.

# Qoşa research status

## Current research checkpoint — 2026-10-22T11:52:37 +04:00

- Engine `qosa-research-0.5.3` / rules `qosa-1.0.0`; primary 3×9, provisional branch semantics.
- **389,700 full continuations** + **313232 separate counterfactual continuations** (historical/quarantined excluded).
- New independent pre-action subgroup holdout: 80 positions, 3485 distinct hidden allocations, 20910 paired continuations; deterministic V8 replay green; Node CLI not run.
- New files: simulator/connector-prestate-strata.js, runs/2026-10-22-1149-connector-prestate-strata.json/.md.
- No general rule promoted from next-opponent pass rates; winning advantage unconfirmed. Strata exploratory and pip-gap/endpoint confounded.
- Next: balanced pip-gap sign and endpoint controls on independent seeds >=1331840; 128 worlds/position, 3 continuation bots, Node CLI checks.

# Qoşa research status

## Current research checkpoint — 2026-10-22 05:50 (+04)

- Engine: qosa-research-0.5.3; recovered qosa-1.0.0; 3×9.
- Cumulative: **389,700 full continuations**, **54,084 separate counterfactual continuations**; historical/quarantined excluded.
- Latest: runs/2026-10-22-0550-single-high-double-holdout.md, JSON same stem, simulator/single-high-double-holdout.js. Independent 600 deals / 18,000 continuations, zero unresolved; V8 deterministic replay green; Node CLI not run.
- No universal single-double rule: 3-3 and 5-5 selected-position gains did not replicate as a full-deal benefit.
- Next: 1311840 onward, >=25 paired positions per number/profile and 128 matched hidden worlds, with multiplicity correction.

## Current research checkpoint — 2026-10-22T04:58:01+04:00

- Engine: `qosa-research-0.5.3`; 3×9. **371,700** full continuations, **54,084** separate counterfactual continuations, historical/quarantined excluded.
- Latest: `runs/2026-10-22-0450-high-double-paired.md`, paired data `runs/2026-10-22-0450-high-double-paired.json`, full-deal holdout `runs/2026-10-22-0450-double-number-holdout.json`.
- New paired high-double runner `simulator/high-double-paired.js` passed deterministic V8 regression; Node CLI not run. 3-3 and 5-5 show provisional conditional benefits against branch-control bots on only 8 positions each; **not** a universal rule.
- Next: independent 1311240..1311839 single-number deferral holdout, then >=25 positions/number/profile with 128 pass-constrained worlds on disjoint seeds.


Updated: 2026-10-07 10:56 (+04)

## Current engine state
- version target: `qosa-research-0.6.1`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy rounds: 180,000 matched-seat rounds persisted across validated baselines/stress/instrumentation runs (historical 4,000 kept separate)
- historical baseline: kept separate in `RESULTS.md`

## Newly confirmed by user
- every 3-player round starts from `1-1`;
- owner of `1-1` plays it, draws the single stock tile, then plays again on 1;
- play then continues clockwise;
- first-round stock `1-1` causes redeal;
- later-round stock `1-1` is taken/played by the previous-round winner, who then plays again on 1;
- if the starter cannot make that second move on 1 after the draw/opening, the starter passes and play continues clockwise; future turns use the normal pass rule until a legal move appears;
- non-finishing multi-double play is voluntary: any legal prefix may be chosen;
- if the remaining hand can finish with multiple doubles, all finishing doubles are played in that turn;
- mixed finish is valid: ordinary tile + all remaining playable doubles in one turn, with minus determined by the number of finishing doubles.

## Green validation layers
- sequential-seed deal generation now pre-mixes seed values before xorshift; 10,000-seed stock-distribution regression added;
- deterministic deck/deal invariants;
- four-branch geometry and ordinary placements;
- voluntary multi-double prefixes;
- forced all-doubles finish when the playable doubles are the entire remaining hand;
- draw-one-then-play-or-pass;
- block detection;
- mixed finish, including user example yielding −20;
- historical opening fixture: starter 2, draw `1-5`, follow-up `1-5`, then clockwise to player 0;
- first-round stock `1-1` => redeal; later-round stock `1-1` => previous winner starts.

## Remaining safety gates
1. The 10,000-seed complete-round smoke baseline is clean in both later-round and first-round modes (0 unresolved / 0 turn-limit).
2. Formal locked/open branch semantics are regression-tested and survived the 1,000-seed smoke run, but should be stressed over a larger seed range.
3. Historical RNG remains intentionally incompatible with new numeric seeds; preserved historical fixtures are the compatibility path.
4. 5-player bazaar/pass semantics and `loneZero=10` remain secondary.

## Recovered after write outage
- actual-starter correction and stock-`1-1` executable regressions are persisted;
- paired single-world decision-regret evaluator + mutation/aggregation regression are persisted;
- old `runs/2026-10-03-specific-double-controlled-30000-39999.json` is quarantined because it predates the actual-starter correction; its 30,000 rounds are not counted;
- fixed-visible hidden-world Monte Carlo protocol is documented in `runs/2026-10-06-recovery-checkpoint.md`.

## Fixed-visible Monte Carlo / regret status
- `hidden-world.js` is persisted with focal-player/hand fail-fast guards, exact hidden-pool accounting and sequential-seed pre-mix;
- `hidden-world-test.js` now requires **25/25 distinct actual hidden allocations** for seeds `700..724`, deterministic replay, 28-tile integrity, immutable visible state and identical focal candidate keys;
- paired decision-regret is persisted and keeps finish-first, remainder and minus-finish metrics separate;
- minus finish is a beneficial outcome: `minusFinishRegret` is measured against the **maximum** minus-finish rate;
- source/tests are persisted, but the latest hidden-world/regret regressions have not been runtime-executed in this connector environment, so they are not yet labelled green;
- verified cumulative strategy scale remains **180,000**; quarantined pre-fix `30000..39999` remains excluded.

## NEXT ACTION
Execute `decision-regret-test.js` and `hidden-world-test.js`. If both are green, persist the first numerical 25-world paired-regret JSON; then reproduce corrected controlled specific-double seeds `30000..39999`.
