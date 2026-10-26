# Qoşa research status

Updated: 2026-10-26 08:50:09 +04 (Asia/Baku)

## Verified cumulative scale
- **1,073,535** complete full rounds, historical 4,000 separate.
- **1,324,720** forced matched hidden-world continuations.
- **4,900** forced full-known-world diagnostics tracked separately.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Fresh seeds **1561060..1561099**, 40 deals; next unused fresh seed **>=1561100**.

## Latest checkpoint
- `simulator/hidden-world-mobility.js` and `runs/2026-10-26-0847-hidden-world-mobility-1561060.json`.
- 240 baseline rounds; 416 first-divergence decisions; 4,992 sampled hidden worlds; 9,984 paired forced continuations.
- Hybrid-minus-control finish-first: mobility **−9.68 ±4.18 pp**, tempo **−6.63 ±3.07 pp** (deal-cluster exploratory 95% half-width). Discovery/holdout negative for both.
- Most negative selected-decision contrasts occur when a hybrid changes a double-opening vs non-double action. This is a provisional, non-causal diagnostic.
- Hidden allocations preserve visible focal hand, public played stones and opponent/stock counts, but are uniform rather than pass-history-conditioned. Deterministic V8 replay, hidden-assignment invariance and contract fixtures passed; Node CLI not executed. Scoreboard/PWA untouched.

## NEXT ACTION
- Fresh seeds >=1561100: enlarge independent matched-world sample; stratify opening-type switches, then incorporate observed pass/draw constraints into hidden-world posterior. Obtain authentic four-side locking and block-winner fixtures.
