# Conditional threat-first holdout — 2026-10-09 14:55 Asia/Baku

Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; primary mode 3 players × 9 stones. No rule changes.

Fresh deal-seed scans: 234000..239999 (closed-branch-control discovery), 240000..245999 (min-hand-pips discovery). 12 selected positions per discovery policy × mobility direction = **48 positions**. Exact seeds and per-position rows in the linked JSON. Each position used 25 training and 25 disjoint evaluation hidden worlds: **2,400 new worlds** and **7,200 paired forced continuations**. Zero new complete strategy rounds. World seed `14000000+1000*dealSeed+worldIndex`; training indices 0..24, evaluation 25..49.

Compared placing the same X-Y stone on different open X/Y ends when the next opponent held exactly one stone, the other held at least two, and the player's remaining endpoint mobility differed. Frozen decision: switch from mobility-aligned placement only when training worlds predict at least 12 percentage points less immediate next-opponent finish risk. Continuation policies: side-neutral closed-branch-control, min-hand-pips and random-legal.

**Findings:** 17/48 positions triggered the override. On all 48, next-opponent immediate-finish risk changed **−9.17 pp**, exploratory position-clustered 95% CI [−13.88, −4.45]. However the block rate changed **+12.17 pp [2.87, 21.46]** under closed-branch-control/min-hand-pips (+11.75 pp under random-legal). Focal finish-first changed **−1.83 pp [−7.50, 3.83]** (random-legal −2.92 pp); not reliably different from zero. Mean focal remaining pips +0.20; mean round length +0.23 turns. Among 17 overrides, immediate threat −25.88 pp, block rate +34.35 pp, finish-first −5.18 pp (uncertain).

**Crucial limitation:** blocked games have no assigned winner in the current model, and finish-first excludes blocks. The risk reduction appears to trade some immediate finishes for more blocks, not necessarily for more wins. No general human-play recommendation yet. Exploratory intervals are unadjusted and clustered by position, not world. Assumption-labelled branch rules, simple bots, ignored pass history, first-eligible selection, small subgroups. No Node CLI run; deterministic V8 CommonJS self-test passed (seed 210009).

Cumulative verified: **180,000 full strategy rounds** (historical 4,000 separate), **77,810 fixed-visible hidden worlds** (previous 75,410 + 2,400; separate 400-world pilot excluded).

Reproduce: `node qosha-research/simulator/threat-first-conditional.js 12 25 25`. Data: `runs/2026-10-09-1455-threat-first-conditional.json`.

**Exact next hypothesis/action:** investigate whether denying the next opponent's immediate finish causes extra blocks; validate block winner/scoring before a block-aware strategy and independent fresh-seed holdout. Run Node CLI regression.
