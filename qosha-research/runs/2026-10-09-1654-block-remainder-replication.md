# Independent block-remainder replication — 2026-10-09 17:00:33 +04:00

- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3 players x 9; no gameplay-rule changes.
- Disjoint deal seed scans: closed-branch-control 258000..263999; min-hand-pips 264000..269999. Exact selected seeds in JSON. 8 positions per discovery policy x mobility-direction stratum = **32 positions**.
- **1600 new fixed-visible hidden worlds** (25 training + 25 disjoint evaluation per position), **4800 candidate continuations**, 0 new complete strategy rounds. Hidden seed: `16000000+1000*dealSeed+worldIndex; training 0..trainWorlds-1; test trainWorlds..trainWorlds+testWorlds-1`.
- Frozen decision: expose own more-connected endpoint, unless 25 training worlds predict >=12pp lower immediate next-opponent finish risk for alternative. Three side-neutral continuation policies: closed-branch-control, min-hand-pips, random-legal.
- Overrides: 11/32; evaluation immediate next-opponent finish risk change **-11.13pp [-17.67pp, -4.58pp]** (exploratory unadjusted position-level 95% CI).
- closed-branch-control: focal finish-first -1.25pp [-6.30pp, 3.80pp]; block frequency 12.63pp [2.05pp, 23.20pp]; strictly-lowest-at-block proxy 7.13pp [0.04pp, 14.21pp]; tied-lowest proxy 1.63pp [-1.56pp, 4.81pp]; mean remaining pips -0.425.
- min-hand-pips: focal finish-first -1.25pp [-6.30pp, 3.80pp]; block frequency 12.63pp [2.05pp, 23.20pp]; strictly-lowest-at-block proxy 7.13pp [0.04pp, 14.21pp]; tied-lowest proxy 1.63pp [-1.56pp, 4.81pp]; mean remaining pips -0.425.
- random-legal: focal finish-first -0.87pp [-5.97pp, 4.22pp]; block frequency 8.00pp [-0.46pp, 16.46pp]; strictly-lowest-at-block proxy 2.63pp [0.07pp, 5.18pp]; tied-lowest proxy 1.63pp [-1.56pp, 4.81pp]; mean remaining pips -0.504.
- **Interpretation:** immediate threat reduction replicates; finish-first does not reliably improve. Block frequency rises for closed-branch-control and min-hand-pips. Strictly-lowest-at-block event frequency is exploratory, **not an official win**. All block proxies are unconditional event frequencies (not P(lowest | block)); more blocks alone can raise them.
- Validation: block rank/tie/finish self-test passed; separate deterministic smoke (4 positions, 3+4 worlds) passed; full run had no unresolved continuations (otherwise runner throws). V8 CommonJS execution, not Node CLI.
- Limitations: Branch opening/locking assumption-labelled; Handcrafted continuation bots; Block winner unresolved; No opponent-pass-history conditioning; First eligible position per deal seed; Exploratory unadjusted 95% position-level normal intervals; No independent Node CLI execution (V8 CommonJS harness).
- Cumulative persisted: **180000** full strategy rounds (historical 4000 separate); **81010** reproducible hidden worlds (400 pilot separate).
- Exact next action: Compare strict-lowest-at-block changes on a third disjoint seed set, conditional on block frequency; seek user-confirmed block winner/scoring rule before win-based strategy claims.
- Reproduce: `node qosha-research/simulator/block-remainder-replication.js 8 25 25`.
