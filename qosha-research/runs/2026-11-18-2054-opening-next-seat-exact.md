# Exact next-seat connector distribution — 2026-11-18 20:54 Asia/Baku

- Source of truth reviewed: `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `STATUS.md`, current-tree manifest and preflight.
- Engine reference: `qosha-research-0.5.3`; recovered rules `qosa-1.0.0`; primary 3 players × 9 stones, one stock.
- Experiment: **exact combinatorial enumeration**, no gameplay deals (0), no sampled hidden worlds (0), no rollouts (0), no seed set, no strategies. Historical 180,000 matched-seat strategy rounds remain separate. Full gameplay gate 0/17 and hidden-world gate 0/4 executed this pass.
- Condition: starter has 1-1, draws stock, and cannot play any of the six ordinary 1-x tiles. Therefore all six connectors lie in the other two hands, 18 tiles total. The clockwise next player holds a uniform 9-of-18 sample.
- Exact distribution: `P(K=k) = C(6,k) C(12,9-k) / C(18,9)` for k=0..6. Denominator = **48,620**; integer numerators in k order: **[220, 2970, 11880, 18480, 11880, 2970, 220]**. Sum = 48,620.
- New result: next seat has **at least two** playable ordinary 1-x stones with probability **93.4389140271%**; **at least three** with probability **69.0045248869%**. Expected number = **3**. No playable connector probability = **0.4524886878%**, independently agreeing with the earlier two-pass oracle.
- Reproducibility: standalone Node v22 computation performed locally with integer binomial products and assertions for denominator, normalization, both tail counts and expected value. These are **not gameplay-engine tests**.
- Confidence: exact under uniform shuffle and the documented opening rule; no dependence on provisional branch unlock, block scoring or loneZero. **Not a strategic win-rate finding**: availability alone does not determine best choice.
- Win/first-place, mean/median remaining pips, round length, block rate, −10/−20/−30/−40, specific-double value, branch-opening effects and regret: **not measured**.
- Exact next action: reconstruct complete research-only executable checkout from a pinned GitHub tree; run preflight, 17 gameplay suites, 4 hidden-world suites and fingerprint replays; archive actual JSON/timings. Only then compare candidate opening connectors on matched seeds and hidden worlds.
- No scoreboard/PWA files or GitHub Actions changed.
