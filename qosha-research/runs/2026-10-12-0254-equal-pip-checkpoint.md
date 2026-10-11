# Equal-pip holdout checkpoint — 2026-10-12 02:54 Asia/Baku

Source: runs/2026-10-12-0254-equal-pip-holdout-860000.json
Engine qosa-research-0.5.3, recovered rules qosa-1.0.0; 3 players x 9.
Fresh seeds 860000..899999, stop at 40 eligible states: 9909 deals scanned, 1600 hidden-world allocations, 19440 continuations; 0 new full strategy rounds. Verified full strategy total remains 180000; historical 4000 separate.
Validation: existing equal-pip matcher regression passed in V8 (10 positions, 15 pairs); existing two-opponent runner self-test passed. Node CLI not run.
Matched comparison: same pre-action state, same hidden worlds, equal discarded pips; connector single versus unrelated single; both retain X-X and at least one X connector.
Connector-minus-unrelated first-place delta: closed-branch-control -24.88 pp, min-hand-pips -25.31 pp, fast-doubles +0.19 pp. Mean remainder delta +2.38 / +2.48 / +0.54 pips. First two policies favor retaining both connectors; third shows no reliable difference.
Caveats: 33 of 40 positions have X=0, only 7 nonzero. Branch geometry after the move differs. Uniform hidden-world allocations, first-eligible selection, bot continuations, assumed branch rules, unassigned block winner. Results are provisional, not causal or general human advice. Complete pre-action branch and opened-number signatures are in the JSON.
Next: compare post-action geometry and opponent responses within the same worlds; collect 50+ fresh states under alternate discovery with X>0 quota. Test true full-signature cross-position matches only if sufficiently common.
