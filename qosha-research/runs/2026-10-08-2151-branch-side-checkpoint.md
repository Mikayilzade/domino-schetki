# Branch-side sensitivity checkpoint — 2026-10-08 21:51 Asia/Baku

Engine: qosa-research-0.5.3. Rules: qosa-1.0.0 (3 players × 9 tiles). New completed rounds: 0; validated cumulative rounds: 180,000.

Seed scan: 110000..110173, first eligible multi-side state per seed with min-hand-pips discovery. Balanced 40 reachable positions: focal hand 4/5 × minimum opponent hand <=3 / >=4, 10 per cell. 25 fixed hidden worlds each (world seed = 7200000 + 1000 * dealSeed + worldIndex). New hidden worlds: 1,000; cumulative: 39,130. Three continuation policies: closed-branch-control, min-hand-pips, fast-doubles. Forced-candidate continuations: 18,300. Unresolved: 0.

Each position has at least two eligible sides. Compare keep-HIGH minus keep-LOW for first and last qualifying side, both already-open same-side X connectors. All candidate actions evaluated under identical hidden worlds and continuation policy. Positive finish-first delta is beneficial; positive remainder delta is worse.

Last-minus-first finish-first advantage (position-level exploratory normal 95% CI):
- closed-branch-control: +1.1 percentage points [-5.8, +8.0].
- min-hand-pips: +0.3 percentage points [-6.7, +7.3].
- fast-doubles: +6.4 percentage points [-0.9, +13.7].
First-side keep-HIGH finish deltas: +0.5, +3.2, +1.1 pp respectively; last-side: +1.6, +3.5, +7.5 pp. Remainder deltas first/last: +0.834/+1.008, +0.650/+0.851, +0.335/+0.168 pips.

Finding: no confirmed general side-order effect. The earlier keep-HIGH advantage varies across qualifying branches in the SAME reachable state, and raw remainder often worsens. The fast-doubles last-side effect is exploratory and requires independent replication, not a human strategy rule.

Limitations: 40 positions, first-eligible selection, different side numbers/gaps/geometry confounded, assumption-labelled locked/open branch rules, deterministic bots, unadjusted exploratory CIs, block winner unassigned. Executed in V8 CommonJS evaluation, not Node CLI.

Reproduction: load current qosha-research/simulator modules; discover first reachable position with >=2 qualifying sides under min-hand-pips, as in connector-gap-pressure.js; for each of first and last qualifying side compare spend-low vs spend-high using runHiddenWorlds with 25 worlds and the world seed formula above. Next exact action: persist a standalone branch-side-sensitivity.js runner, Node-test it, and repeat on fresh seeds with matched connector-gap strata.
