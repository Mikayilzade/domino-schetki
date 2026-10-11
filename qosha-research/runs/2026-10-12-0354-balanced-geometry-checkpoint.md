# Balanced equal-pip connector holdout — 2026-10-12 03:54 Asia/Baku

Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; primary 3×9.
Reproduce from repository: `node qosha-research/simulator/number-balanced-connector-holdout.js 900000 1000000 200 25 20`.
Discovery: min-hand-pips, first eligible state per deal; 46,041 deals scanned, 200 eligible positions inspected; quota 25 X=0 and 25 X>0, **50 positions**. Deterministic hidden-world seeds `36000000+1000*dealSeed+worldIndex`; 20 worlds/position = **1,000 worlds**, **12,120 candidate continuations**, 3 continuation policies. No unresolved reported.

Connector single minus unrelated equal-pip single (both retain X-X and >=1 X connector), finish-first difference: closed-branch-control **−26.40 pp** (exploratory position CI −38.23..−14.57), min-hand-pips **−26.90 pp** (−38.05..−15.75), fast-doubles **+0.10 pp** (−2.40..+2.60). Mean remainder difference: +2.598 / +2.570 / −0.222 pips.
Strata: X=0 (n=25): −29.4 / −29.4 / −1.4 pp; X>0 (n=25; X=2:19, X=3:5, X=4:1): −23.4 / −24.4 / +1.6 pp. Immediate next/third opponent playable-tile difference (unrelated minus connector): −0.039 / −0.061 overall, both exploratory intervals include zero.

Interpretation: preserving the extra connector beat spending it under two policies in a fresh balanced X sample; this is **provisional**, not a causal effect of connector retention. Post-action branch sides/end values differ, so geometry remains confounded. The third policy shows no clear advantage. No inference for X=1,5,6 (not sampled).
Validation: V8 CommonJS evaluation of persisted runner; Node CLI not executed. JSON upload of this run was blocked by connector safety checks, so raw world outcomes are **not persisted**. Re-run with command above for reproducibility. Do not credit new complete rounds; verified cumulative **180,000** full strategy rounds, historical 4,000 separate.

Exact next: persist full run-data when writes allow; compare post-action four-branch end vectors, focal next-turn access and both opponents' actual responses on matched worlds, then repeat on independent seeds with alternate discovery policy.
