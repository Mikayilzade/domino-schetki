# Qoşa matched both-block pip-choice holdout — 2026-10-09 19:48 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3×9; V8 CommonJS validation, 3/3 checks; Node CLI not executed. No rule changes.

## Protocol and reproducibility
Deal scans: closed-branch-control 294000..296999 (stopped after 195 seeds), min-hand-pips 297000..299999 (stopped after 315). First reachable state per seed with no stock, focal hand 2..7, at least one opponent <=4 tiles, and two distinct legal ordinary singles differing >=3 pips. Select lowest/highest pip tiles; for same tile choose lexicographically first actionKey. Screen four fixed-visible hidden worlds under side-neutral closed-branch-control; select if BOTH forced moves lead to block in >=1 screening world. Evaluate selected positions on 60 disjoint worlds under side-neutral closed-branch-control, min-hand-pips and random-legal. World seed: 22000000+1000*dealSeed+worldIndex; training indices 0..3, holdout 4..63. Same hidden allocation for both moves and continuation policy.

Selected closed-control seeds: 294004,294035,294054,294056,294066,294068,294079,294110,294170,294173,294175,294194.
Selected min-pips seeds: 297008,297011,297013,297054,297063,297070,297097,297161,297194,297238,297263,297314.

Scale: 24 independent selected positions; 96 training + 1440 holdout = 1536 selected fixed-visible worlds, 8640 paired candidate continuations, 0 new full strategy rounds. 1908 additional screening worlds on rejected positions excluded from credited scale. Cumulative 180000 full strategy rounds + 86546 selected hidden worlds; 400 pilot worlds remain separate.

## Holdout (BOTH moves block in the SAME world)
Policy | Both-block worlds | Distinct positions | Higher-pip leaves fewer / equal / more focal pips | Mean focal pip difference high−low, equal-position weighted (exploratory 95% position CI) | Strict-min proxy gain/loss
closed-branch-control | 177 | 22 | 44 / 87 / 46 | -1.219 [-2.148,-0.291] | 12 / 7
min-hand-pips | 184 | 22 | 49 / 81 / 54 | -1.603 [-3.149,-0.056] | 18 / 8
random-legal | 33 | 14 | 7 / 21 / 5 | +1.131 [-1.982,4.243] | 3 / 1

Unconditional focal finish-first high−low: closed-control -5.97 percentage points [-12.58,+0.64]; min-pips -6.11 [-12.53,+0.31]; random-legal -3.61 [-7.01,-0.21]. **These are finish rates, NOT overall wins.**

Finding (provisional): Higher-pip shedding can reduce remainder when both options ultimately block, but may sacrifice chances to finish first. In contrast to the previous 40 both-block worlds from one position, these results involve 14–22 distinct positions. This is a selected block-prone sample, not a universal strategy rule. Conditioning on both-block is descriptive, not an unconditional causal effect. Official block winner is unspecified: lowest pips is only a descriptive proxy. Limitations: assumption-labelled branch opening/locking, handcrafted bots, first-eligible selection, no opponent pass-history conditioning, unadjusted exploratory CIs, not Node CLI.

The full experimental V8 run completed, but an attempted inline-content multi-file GitHub tree write and a Contents-API file write were rejected by connector safety checks. Do not claim raw JSON or executable runner is persisted until independently verified.

Exact next action: persist executable replay for the selected seed list and verify matching summary; replicate on fresh seeds stratified by opponent hand sizes/connectors; clarify official block scoring.
