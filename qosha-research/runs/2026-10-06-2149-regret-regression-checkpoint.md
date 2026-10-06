# Qoşa research checkpoint

Timestamp: 2026-10-06 21:49 (+04)

- Engine/rules: qosa-research-0.5.3; primary 3×9 recovered rules.
- New credited deals: 0. Persisted validated strategy scale remains 180,000 matched-seat rounds; historical 4,000 separate.
- Source audit: `decision-regret.js` correctly reports `minusFinishRegret`, maximizing beneficial −10/−20/−30/−40 finish frequency.
- Blocker: `decision-regret-test.js` still contains three stale `minusRiskRegret` assertions. An attempted source update in this pass was rejected by connector safety checks, so the executable suite is not claimed green.
- Hidden-world sampler remains fixed-visible and deterministic for seeds 700..724, but no numerical regret result is credited until the regression mismatch is fixed and executed.
- New finding: none reliable this pass.
- Confidence/limitations: high confidence in the source/API mismatch from direct GitHub inspection; Node regressions were not executed.
- Exact next action: rename the three stale assertions to `minusFinishRegret`, execute `decision-regret-test.js` and `hidden-world-test.js`, then persist the first 25-world paired-regret JSON.
