# Qoşa research status

Updated: 2026-10-25 23:48:31 +04 (Asia/Baku)

## Verified cumulative scale
- **938535** complete full-round discovery/tournament continuations.
- **1310768** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest fresh unique seed window **1555340..1556139** (800 deals). Next fresh seed **>=1556140**.

## Latest checkpoint
- Independent six-pair-hold holdout: 247 late 6-6 positions (2/3/4 next-hand: 106/97/44; independent deal clusters 106/97/44). Double-minus-connector finish-first: -26.16 pp under min-pips continuation, -30.67 pp under closed-branch continuation. Matched three-policy tournament finish-first: six-pair-hold 33.58%, closed-branch 36.75%, min-pips 25.75%; six-pair-hold is enrichment only, not proven advantageous.
- **9600** discovery rounds, **2400** independent matched-seat tournament rounds, **7936** forced continuations; zero unresolved.
- V8 CommonJS tests passed; Node CLI not run. Source/data: `simulator/six-pair-hold-tournament.js`, `runs/2026-10-25-2345-six-late-holdout-1555340.json`.

## NEXT ACTION
- Validate 6-6 hold's global policy value against other mixes and stratify conditional paired results by retained connectors and focal hand size. Confirm real four-branch number lock/open and block winner before human advice.
