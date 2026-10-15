# Pass-history exact hidden-world holdout — 2026-10-15 16:54 +04:00 (Asia/Baku)

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0` (branch-opening semantics provisional), primary 3×9.
- Fresh deal-seed scan: `206500..279999` (scanned 68100); 50 first eligible positions **with an observed opponent pass since that opponent's last played tile**.
- Exact hidden allocations: 334; pass-compatible: 228; 2004 candidate continuations, same world and continuation seed for each equal-pip connector-vs-unrelated candidate. **No new full rounds**; verified full-round cumulative **180,000**; historical 4,000 separate.
- A past pass is applied as a hard constraint only if stock was empty and the opponent has not played since that pass; test every hypothetical hand for zero legal actions at the recorded pre-pass branch/opening state. The actual source deal must satisfy all evidence.
- Equal-position-weight finish-first, connector minus unrelated single: 
  - closed-branch-control: raw -2.53 pp; conditioned -0.33 pp; change 2.20 pp (exploratory 95% interval -1.78..6.18 pp).
  - min-hand-pips: raw -3.27 pp; conditioned -2.00 pp; change 1.27 pp (exploratory 95% interval -2.78..5.32 pp).
  - fast-doubles: raw 1.13 pp; conditioned 1.00 pp; change -0.13 pp (exploratory 95% interval -0.39..0.13 pp).
- Validation: V8 CommonJS runner self-test green; seed 189705 exactly 3 hidden allocations, only 1 pass-compatible; replay deterministic; original hidden deal consistent with recorded passes; unchanged source state; exact 28-tile enumeration delegated to existing validated runner. Node CLI **not executed**.
- Finding: past observed passes eliminate 106/334 previously possible allocations in this selected cohort. This improves the information model without inventing a hidden opponent hand. Changes in win advantage are descriptive and **not yet a reliable human-play strategy rule**.
- Confidence/limits: high for deterministic pass-consistency filter, exploratory for bot-outcome changes; ignores past voluntary move choices, bot policies, unconfirmed branch semantics, first-eligible selection, block winner unassigned, intervals uncorrected.
- Reproduce: `node qosha-research/simulator/pass-history-exact-runner.js test` then `node qosha-research/simulator/pass-history-exact-runner.js 206500 280000 50`. Full per-position data: `runs/2026-10-15-1654-pass-history-exact.json`.
- **Exact next action:** validate runner with Node in executable checkout; extend posterior constraints to recorded opponent played tiles and legal move choice while avoiding unjustified deterministic-bot assumptions, then rerun independent disjoint seeds. Stratify next-opponent pass evidence vs third-player evidence and four-end geometry.
