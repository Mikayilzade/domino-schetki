# Latest checkpoint — matched branch-lock and block-winner sensitivity (2026-11-01 22:54:59 +04 (Asia/Baku))

- **New matched cohort:** seeds 3415120–3415619; 500 unique full allocations, 0 duplicates; 3,000 policy-generated rounds; 2,896 finishes / 104 blocks / 0 unresolved; mean turns 25.239.
- **Local-side counterfactual:** 6,200 multi-side unlock events; global 25,965 next-player actions vs local 15,236 (−41.3%). Side choice changed 2,878 times; tile-group choice 38 times; no pass flips. This is one-step model sensitivity only.
- **Block identity:** minimum-pip set unique 101/104, tied 3; fewest-tile set unique 18/104, tied 86; candidate sets differ 90/104. Coded model still assigns no block winner or points.
- **Deduplicated unlock-delay:** 80 discovery deals/positions; 1,920 world draws, 1,878 within-state unique allocations, 42 duplicates; 3,756 paired continuations. Finish-first intervals include zero; no tactical finding.
- **Regression replay:** existing seeds 3406720–3407219 rerun (11,795 positions / 41,451 action applications / 0 failures); historical cohort not counted again. Block/mixed/scoring fixtures and new runner tests passed.
- **Cumulative:** branch-label cohort remains 1,500 unique deals / 60,274 positions; validation allocations 7,550; property audit 52,315; strategy tournament 1,500 deals / 18,000 arm-rounds (+120-deal pilot). No new strategy arms.
- **Interpretation:** high confidence in internal sensitivity measurements, no physical rule authentication, no reliable strategy advantage. Global/local branch semantics and block winner/tie scoring remain provisional.
- **Exact next:** fresh seeds from 3416220; stratify delayed-unlock selection by late next-opponent hand size (1–4 stones), deduplicate worlds per visible state, and seek a real-table trace/ruling for branch and block rules.

See [run report](runs/2026-11-01-2254-branch-lock-block-sensitivity.md), [raw JSON](runs/2026-11-01-2254-branch-lock-block-sensitivity.json), [block-winner runner](simulator/block-winner-sensitivity.js), and [deduplicated delay runner](simulator/branch-unlock-delay-dedup-audit.js).
