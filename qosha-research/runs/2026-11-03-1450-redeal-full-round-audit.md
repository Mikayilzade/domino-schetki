# Full-round redeal and continuation conservation audit — 2026-11-03T14:50:33+04:00 (Asia/Baku)

- **Engine/rules:** `qosha-research-0.5.3`; recovered `qosa-1.0.0` coded model; primary 3×9 + one stock tile. Physical branch/opening semantics, block winner/tie scoring, and `loneZero=10` remain provisional/unresolved.
- **Policy:** deterministic hash of seed, turn, and seat selects an index from the current legal-action list. It is a transition-validation policy only; no strategy arm or tactical comparison was run.

## Cohorts

- **First-match-round path:** 2,000 accepted deals from attempts 15,000,000–15,002,079 (2,080 attempts). There were 80 explicit 1-1-in-stock redeal signals; retry histogram 1,922 / 76 / 2 accepted after 0 / 1 / 2 retries. All 2,000 accepted seat-labelled allocations were unique.
- **Continuation path:** 2,000 deals, seeds 16,000,000–16,001,999; 2,000 unique allocations, no duplicate pairs. The 1-1 was in stock in 73 deals and hand-owned in 1,927. For stock-owned 1-1, previous winner was set to `seed % 3`; when 1-1 was in a hand, its owner started.

## Full-round results

| Metric | First-round accepted | Continuation |
|---|---:|---:|
| Resolved rounds | 2,000 | 2,000 |
| Finish / block | 1,910 / 90 | 1,894 / 106 |
| Block rate | 4.50% | 5.30% |
| Mean / median turns | 24.613 / 25 | 24.677 / 25 |
| Mean / median terminal pips per seat | 6.803 / 6 | 6.765 / 6 |
| Finish minus −10 / −20 / −30 / −40 | 78 / 2 / 0 / 0 | 76 / 1 / 0 / 0 |
| Finish with no minus | 1,830 | 1,817 |

Minus frequencies are among finish outcomes only; blocks receive no finish-minus classification. The two cohorts are descriptive and should not be contrasted as strategy effects because their seed windows and opening contexts differ.

## Invariants and separate scoring checks

- All **4,000 rounds resolved**; no turn-limit outcome.
- **94,580** transitions, each independently reconstructed and matched to the round driver.
- **98,580** exact inventory snapshots (after setup and after every transition): all 28 tile identities conserved, no duplicate play.
- **91,305** played-tile provenance/uniqueness checks; pass counter reset/increment and finish/block termination checked.
- No in-round draws occurred (maximum 0 per turn), consistent with the single stock tile being consumed during 3×9 opening setup. Draw-enabled action paths remain covered by separate fixtures.
- Full run: **985,748 assertions**. Deterministic smoke replay: 24 rounds / 566 transitions / 590 inventory snapshots, **5,907 assertions**.
- Separate active-PWA match-scoring adapter tests passed: **23 unit assertions** and **64,066 exhaustive assertions** across score-floor, 100/101 threshold, survivor ranking, and five-player elimination-order fixtures. These validate the implementation contract, not physical table rules.

## Finding, confidence, limitations

The initializer plus round-driver/kernel path is internally consistent through complete finish or block on these deterministic cohorts. This is useful engine validation, not a reliable tactical finding. No strategy was promoted. Block winner/tie allocation is deliberately not assigned; branch semantics and physical scoring remain unauthenticated. Deterministic replay does not prove PRNG uniformity.

## Exact next action

Connect finish-only round score deltas to the separate active-PWA adapter and test score-floor / 101-bust progression end-to-end. Keep block rounds unscored until the block winner/tie rule is authenticated.

Reproducers: [runner](../simulator/redeal-full-round-audit.js) · [test](../simulator/redeal-full-round-audit-test.js) · [machine data](2026-11-03-1450-redeal-full-round-audit.json).
