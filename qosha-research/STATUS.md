# Qoşa research status

Updated: 2026-10-25 01:55:34 +04

## Verified scale
- **687,700** complete full-round continuations; **920,880** forced hidden-world counterfactual continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; authentic four-branch number locking **PROVISIONAL**.
- Fresh seeds consumed through **1458239**, next **>=1458240**.

## Latest checkpoint
- Independent holdout `simulator/pass-independent-holdout.js`: 1,800 fresh deals, 1,800 pseudo-uniform selected decision states (405 pass-constrained), 72 plain-vs-joint posterior policy changes.
- Exact joint pass conditioning improved **same-action** next-pass Brier error in constrained states from **0.11020 to 0.04349**. This predicts passes better; **no statistically reliable finish-first advantage** on 72 changed choices.
- 576 conditioned hidden allocations; 2,304 paired forced continuations; 0 unresolved. Deterministic V8 tests green; Node CLI not run.
- Raw/aggregate JSON: `runs/2026-10-25-pass-independent-holdout-1456440.json`; full details in `RESULTS.md`. Scoreboard/PWA untouched.

## NEXT ACTION
Fresh disjoint seeds **>=1458240**: repeat under different discovery policies, collect >=150 changed-choice positions for adequate decision comparison. Authenticate real four-branch number locking and block-winner/loneZero/bust/101 scoring before translating to human match advice.
