# Qoşa exact triple-choice control — 2026-10-11T05:52:31 +04:00 Asia/Baku

Engine `qosa-research-0.5.3`, recovered rules `qosa-1.0.0`, 3×9. **50 positions**, **360 exhaustive hidden allocations**, **4,650 candidate continuations**, no unresolved; **0 new complete strategy rounds**.

Seeds `90000..91499`: min-hand-pips discovery, 755 scanned deals, first 25 eligible positions. Seeds `91500..92999`: closed-branch-control discovery, 878 scanned, first 25. Next opponent 1–2 stones, focal 3–5, stock empty. Exact unseen allocations equally weighted within position, equal action-class and position weights. Continuation seeds `15000000+1000*dealSeed+lexicographicAllocationIndex`; three continuation policies: closed-branch-control, min-hand-pips, fast-doubles.

**Same visible position:** A=open X-X; B=play X-Y retaining X-X and another X connector; C=play unrelated non-X single also retaining X-X. All tested on identical worlds/policies.

| Policy | B−A finish-first | C−A finish-first | B−C finish-first |
|---|---:|---:|---:|
| Closed-branch-control | +13.20 pp | +19.04 pp | −5.84 pp |
| Min-hand-pips | +11.07 pp | +18.10 pp | −7.03 pp |
| Fast-doubles | +1.10 pp | +0.10 pp | +1.00 pp |

B−C exploratory position-level 95% intervals include zero: closed −13.80..+2.12 pp; min-pips −14.60..+0.54 pp; fast −0.50..+2.50 pp. **Provisional finding:** preserving closed X-X can explain much of earlier pair/connector benefit; separate X-Y connector advantage **not demonstrated**.

Validation: V8 CommonJS self-test passed seed 90004 (6 exact allocations, 54 continuations), deterministic replay, immutable source state, 28-tile exact-world integrity and paired-contrast arithmetic. Node CLI not run. Limits: assumption-labelled branch semantics; unseen allocations do not condition on opponents' previous actions; block winner unassigned; first-eligible quotas; exploratory intervals; not human causal advice.

Cumulative validated complete strategy rounds **180,000** (historical 4,000 separate); previous 1,337 exact late-game allocations + 360 = **1,697**, separately counted.

Reproduce: `node qosha-research/simulator/triple-choice-control-runner.js test` and `node qosha-research/simulator/triple-choice-control-runner.js 90000 91500 25 91500 93000 25`. Data: `runs/2026-10-11-triple-choice-control-90000.json`.

**Next:** fresh matched B vs C positions controlling immediate pip removal and next-player legal mobility; separate branch-control effect from connector effect.
