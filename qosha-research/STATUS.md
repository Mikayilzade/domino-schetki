# Latest checkpoint — exact late-game hidden-world legal-choice audit (2026-11-02 04:06 +04 Asia/Baku)

- Engine/rules: qosha-research-0.5.3; recovered qosa-1.0.0; primary 3×9. Global-ever-open branch semantics remain provisional.
- Added simulator/finite-late-world-choice.js and simulator/finite-late-world-choice-test.js. Exact allocation support is enumerated for pass-free, stock-empty late states; actual discovery allocation inclusion and complete root-action invariance are checked.
- Test: 7 assertions passed under Node 22.16.0 in a local mirror of repository modules. Clean checkout integration remains unrun because github.com DNS resolution failed in the container.
- New cohorts: 9,271 unique deal allocations / 9,271 resolved discovery rounds; 153 selected positions; 2,107 exact hidden-world records within visible states; 4,214 matched candidate-world-policy pairs / 8,428 candidate rollouts. No duplicates, no unresolved rounds.
- Equal-pip cohort: 33 positions, next-opponent hand sizes 1/2/3 = 3/15/15. The modeled double-opening choice reduces focal first-finish chance by about 25 pp / 18 pp under two continuation policies, but the cohort is selected and branch semantics are provisional. No strategy promotion.
- Historical strategy tournament remains separate and unchanged: 1,500 deals / 18,000 arm-rounds. Prior branch-label/property cohorts are not mixed with these exact-world records.
- Exact next: implement pass-history-conditioned support filters for global-ever-open and current-only branch models; reconstruct pass-time hands from current hidden hands plus later played tiles; report model-specific and joint/exclusive support before matched reruns.
- Report: [2026-11-02-exact-late-hidden-world-choice.md](runs/2026-11-02-exact-late-hidden-world-choice.md).
