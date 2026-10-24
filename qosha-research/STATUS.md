# Qoşa research status

Updated: 2026-10-24 09:50 (+04)

## Verified scale
- **431700** independent matched full continuations unchanged; **647104** sampled hidden-world forced counterfactual continuations (+40960 this run).
- Historical 4000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9. Four-branch locking/opening remains provisional.
- New late-discordant runner deterministic replay test passed in V8 CommonJS (Node CLI not run).

## Latest checkpoint
- 261 unique deals examined (seeds 1383640..1383900), 80 discordant pre-action 2–3-stone positions, 20480 matched hidden allocations, 40960 forced continuations; no new full strategy rounds.
- Min-pips continuation own-mobility minus next-risk finish-first: +2.861 pp ±6.143 pp exploratory 95% half-width; closed-branch-control +1.699 pp ±7.570 pp.
- 2-stone positions favored own mobility, 3-stone positions favored next-risk in this exploratory sample, but intervals are broad and effect not preregistered. No robust general rule.
- New runner: `simulator/late-discordant-holdout.js`; raw data: `runs/2026-10-24-0950-late-discordant-holdout-1383640.json`.

## NEXT ACTION
Preregister and independently test the 2-vs-3 stone interaction on fresh seeds >=1385840, two continuation policies and >=256 matched hidden worlds per discordant position. Obtain authentic locked/open four-branch fixture before human recommendations. Do not modify scoreboard/PWA files.
