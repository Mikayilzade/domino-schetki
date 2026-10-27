# Midgame exact posterior — 2026-10-28 00:45 (+04)

- **Timestamp (Asia/Baku):** 2026-10-28 00:47:25 +04:00
- **Engine/rules:** qosa-research-0.5.3 + midgame-exact-posterior-1.0; recovered qosa-1.0.0; tile conservation only; hypothetical documented no-stock pass masks, no geometry inference
- **Seeds:** 2018000..2029999; **12,000 hidden-world allocations**, 0 full deals/rounds, 0 strategic continuations; no policies compared.
- **Fixture:** 3 players, public played 6, focal hand 5, opponents 9/8, stock 0. Two hypothetical, documented no-stock pass masks (seat 1 cannot have any 6-X; seat 2 cannot have any 2-X), with no later tile acquisition.
- **Exact independent enumeration:** 21 / 24310 allocations satisfy both masks; 3-4 belongs to seat 1 in 15/21 feasible worlds. This 21/24,310 fraction is a *synthetic fixture fraction*, **not** a natural game event rate.
- **Calibration:** 12,000 deterministic posterior worlds, all 21 exact allocations reached; seat-1 possession of 3-4: 8565/12000 = 71.38%, exact 71.43%; z=-0.130. Independent brute-force count, replay, stock/known-opponent asymmetric fixture, conservation and invalid-input tests passed in V8 CommonJS-compatible execution. Node CLI not run.
- **Finding:** conditional uniform allocation works even for highly restrictive *midgame* pass masks and asymmetric opponent sizes without inefficient rejection sampling. This is infrastructure, **not** a new winning tactic.
- **Limitations:** pass masks are hypothetical, not derived from authenticated branch geometry; prior opponent choices not modelled; no actual block winner, -10/-20/-30/-40 or match-win inference.
- **Cumulative:** 1,380,975 earlier incompatible-rule model-rounds (unchanged); 1,898,856 forced continuations (unchanged); 355,000 prior opening-world allocations + **12,000 new midgame allocations = 367,000 allocations**, kept separate from rounds. Historical 4,000 rounds separate. Next fresh seed >=2030000.
- **Exact next action:** connect pass-time legal tile sets to a replayable authentic midgame history (and reject any pass with intervening draw); test on independent small-world enumerations, then evaluate candidate moves on matched hidden worlds only after branch legality is confirmed.

Reproduce: `node qosha-research/simulator/midgame-exact-posterior.js test`; `node qosha-research/simulator/midgame-exact-posterior.js 2018000 12000`. Full data: `runs/2026-10-28-0045-midgame-exact-posterior.json`.
