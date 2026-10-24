# Qoşa research status

Updated: 2026-10-24 11:50 (+04)

## Verified scale
- **431700** independent matched full continuations unchanged; **756160** forced hidden-world counterfactual continuations (+57344 this run).
- Historical 4000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9. Four-branch locking/opening remains provisional.
- Deterministic replay test passed in V8 CommonJS; Node CLI not run.

## Latest checkpoint
- Requested seeds 1388040..1390239; actual **266 unique deals**, 1388040..1388305. **112 discordant positions**, **28672 matched hidden allocations**, **57344 forced continuations**, 0 full rounds.
- Min-pips own-minus-risk finish-first **+6.40 pp ±10.12**; branch-control **+0.89 pp ±8.23** (exploratory position-cluster half-widths).
- Exact opponent-size/opened-number matched 2-vs-3 interaction: min-pips **+9.15 pp** (9 sparse strata, 20 effective pairs); branch-control **+7.12 pp** (5 strata, 9 pairs). **Not reliable**.
- All 112 simulated states have four active sides, but that does not validate real branch locking/opening.
- **No reliable new human-play rule.** Block winners and match wins not assigned.
- Raw: `runs/2026-10-24-1150-late-opponent-strata-1388040.json`.

## NEXT ACTION
Validate authentic locked/open four-branch fixture; expand exact matched opponent-size/opened-number strata on fresh seeds >=1390240. Keep research inside `qosha-research/`.
