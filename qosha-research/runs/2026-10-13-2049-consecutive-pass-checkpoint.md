# Two consecutive passes — 2026-10-13 20:49 Asia/Baku

Engine qosa-research-0.5.3; recovered qosa-1.0.0; 3×9, stock empty. Fresh seeds 2930000..2930529: 530 deals scanned, 40 eligible reachable positions, 4,800 fixed-visible hidden allocations, 15,120 next-opponent candidate/world checks, 126 nonterminal actions. All 4,800 allocations compatible with both consecutive passes; zero invariant failures. No new full strategy rounds; verified prior 180,000 (historical 4,000 separate).

Exact invariant: after both hidden opponents pass consecutively without any intervening board change, complete known-tile accounting implies every unknown tile is unplayable. Thus filtering a uniform hidden allocation by those two passes cannot further narrow it. An unknown playable tile would signal an incomplete or inconsistent known-tile history.

For a nonterminal focal move, let N=unknown tiles, K=unknown tiles that become playable after the move, h=next opponent hand size. Under uniform allocation, exact P(next opponent passes)=C(N-K,h)/C(N,h). K=0 guarantees another pass. 14/126 candidate moves had K=0; 8/40 positions offered both K=0 and K>0. Closed-branch-control chose K=0 in 4 positions, min-hand-pips in 3; both chose immediate finish in 10. Mean next-pass probability on nonterminal choices 0.3104 vs 0.2382. Mean absolute Monte Carlo vs exact forecast error 0.01469.

Validation: deterministic 3-position V8 CommonJS replay passed for seeds 2920000,2920049,2920077; malformed intervening-pass log rejected. Seed formula for 120 sampled worlds per position: (700000000+Math.imul(dealSeed,263)+worldIndex)>>>0. No Node CLI execution. No first-place advantage established.

Limitations: assumed branch-opening semantics, full played-tile history essential, uniform allocation not behavior-conditioned, first-eligible selection and min-hand-pips discovery. Exact next: persist executable runner (GitHub contents/tree write attempted but blocked), replicate and test K=0-aware policy against baselines on fresh matched worlds; then validate replay of nonconsecutive passes with intervening plays.
