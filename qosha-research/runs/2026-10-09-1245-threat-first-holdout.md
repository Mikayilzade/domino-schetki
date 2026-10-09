# Threat-first out-of-sample checkpoint — 2026-10-09 12:45 Asia/Baku

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3 players × 9 stones. No rule changes.
- New experiment: **48 distinct reachable positions**, **2400 fixed-visible hidden worlds** (25 training + 25 disjoint evaluation per position), **7200 paired forced continuations** across three side-neutral bot policies; **0 new complete strategy rounds**.
- Deal seed scans: closed-branch-control 210000..215999; min-hand-pips 216000..221999; exact selected seeds in linked JSON. World seeds: `14000000+1000*dealSeed+worldIndex`; training indices 0..24, evaluation 25..49.
- Question: when next opponent holds **exactly one stone**, should we override the own-connector mobility heuristic to reduce its immediate finish probability? Both alternatives place the SAME ordinary X-Y tile on different already-open X/Y ends. 12 positions per discovery-policy × mobility-direction stratum.
- Decision rule (out of sample): estimate each candidate's next-opponent immediate-finish risk using only 25 training hidden worlds. Switch from mobility-aligned to alternative only when estimated risk is at least 12 percentage points lower. Test decisions on a disjoint set of 25 worlds per position.
- Overrides: **19/48** positions. Evaluation immediate-finish risk mobility **67.5%**, threat-first **56.25%**, change **-11.25 percentage points**.
- Finish-first improvement of threat-first over mobility (all 48 positions, equal position weight; unadjusted exploratory 95% position-level CI):
  - closed-branch-control: **-2.33 pp** [-7.93, 3.27]; override-only -5.89 pp; mean remainder delta -0.060 pips.
  - min-hand-pips: **-2.33 pp** [-7.93, 3.27]; override-only -5.89 pp; mean remainder delta -0.060 pips.
  - random-legal: **-0.42 pp** [-6.17, 5.34]; override-only -1.05 pp; mean remainder delta -0.177 pips.
- Finding: **Threat-first is a testable conditional alternative, but do not treat an exploratory 48-position result as a universal rule.**
- Validation: deterministic replay on 3 training + 4 evaluation worlds, correct one-stone-next-opponent and source immutability guards; full run completed in V8 CommonJS harness, **not Node CLI**.
- Confidence/limits: unadjusted position-clustered intervals, multiple strategies, first-eligible selection, simplified bot continuations, assumed branch opening/locking, no block winner, sampled hidden worlds do not condition on opponent pass history. No human-game generalization.
- Previous GitHub-verified scale: **180,000 full strategy rounds** and **70,610 fixed-visible hidden worlds**. Earlier 400-world pilot was documented but lacked exact selected seeds/replay runner; keep it **provisional and separate**. After this checkpoint, verified fixed-visible worlds **73010**, plus 400 provisional pilot worlds.
- Exact next action: independent disjoint-seed replication with frozen 12pp override threshold, then compare threshold sensitivity on a new set and study both opponents at one tile.
- Code: `simulator/threat-first-holdout.js`; raw data: `runs/2026-10-09-1245-threat-first-holdout.json`.
