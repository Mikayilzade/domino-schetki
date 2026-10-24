# Qoşa research status

Updated: 2026-10-24 10:53 (+04)

## Verified scale
- **431700** independent matched full continuations unchanged; **698816** sampled hidden-world forced counterfactual continuations (+51712 this run).
- Historical 4000 separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, primary 3×9. Four-branch locking/opening remains provisional.
- Existing late-side and late-discordant deterministic replay tests passed in V8 CommonJS (Node CLI not run).

## Latest checkpoint
- Requested seeds 1385840..1388039; actual **265 unique deals scanned**, seeds 1385840..1386104 (early stop). **101 discordant pre-action positions**, 25856 matched hidden allocations, 51712 forced continuations, 256 worlds/position; 0 new full rounds.
- Min-pips own-minus-risk finish-first: 2 stones +4.88 pp ±6.87 (n=14), 3 stones +4.26 pp ±9.36 (n=47); interaction +0.63 pp ±11.61.
- Branch-control own-minus-risk: 2 stones +18.97 pp ±22.24 (n=9), 3 stones +3.81 pp ±11.80 (n=31); interaction +15.16 pp ±25.17.
- **Earlier 2-vs-3 sign reversal did not replicate; no reliable new rule.** Position-cluster normal 95% half-widths are exploratory, uncorrected. These are finish-first comparisons, not match victories; no block winner.
- Raw: `runs/2026-10-24-1053-late-discordant-hand-size-1385840.json`.

## NEXT ACTION
On fresh disjoint seeds >=1388040, match/stratify both opponents' hand sizes and opened branches to test whether the 2-vs-3 interaction survives confounding. Obtain authentic locked/open four-branch fixture. Do not modify scoreboard/PWA files.
