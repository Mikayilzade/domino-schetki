# Equal-pip connector holdout — 2026-10-18 15:48 Asia/Baku

Engine qosa-research-0.5.3; recovered rules qosa-1.0.0; 3×9 later-round.
Scan seeds 1075000..1081073 (6,074 deals). Selected 20 first eligible positions, one per deal. 30 hidden allocations each = 600 hidden worlds, 2,400 paired forced continuations, 0 unresolved; 0 new full tournament rounds. Prior verified full strategy rounds 215,520 (historical 4,000 separate).

Compared legal ordinary X-Y connector with legal unrelated ordinary tile of identical discarded pip sum, both retaining X-X and another X-Y. Next opponent <=2 stones. Fixed visible state, uniformly resampled hidden hands, same hidden worlds and continuation policy for both actions. Policies: closed-branch-control and moderate-double-hold. World seed = (Math.imul(dealSeed,1009)+Math.imul(seat+1,1000003)+worldIndex+19000000)>>>0.

Connector minus unrelated first-finish rate: -0.83 percentage points (exploratory 95% position CI -17.01..+15.34) under closed-branch; +1.33 pp (-13.27..+15.94) under moderate-hold. Mean remaining pips: +1.14 and +0.45 respectively. Beneficial minus-finish delta +0.50 pp under both. No reliable improvement.

Critical geometry confound: ALL 20 connector actions leave exactly one fewer accessible branch end than the unrelated equal-pip action. Therefore this control cannot isolate intrinsic connector value from branch closure. X values: 0 (12), 2 (5), 3/4/5 (1 each). Wide uncorrected intervals, selected positions, provisional branch semantics, unconditioned hidden worlds, block winner unassigned.

Reproduce: later-round initializer previousWinnerIndex=seed%3; closed-branch-control discovery; first connector-other-matches.matches(state) pair per deal; 30 hidden worlds, same two forced legal actions and two continuation policies; compare first-finish, raw remainder, minus, block and turns; check legal/equal pips/retention/immutability.

Next: design geometry-matched alternatives (equal accessible-end count and ideally same end-number multiset); if structurally impossible, report non-identifiability instead of a gameplay claim.
