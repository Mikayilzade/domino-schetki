# Independent Qoşa holdout — 2026-10-22 21:50 Asia/Baku

Engine qosa-research-0.5.3, rules qosa-1.0.0, 3x9. Fresh seeds 1362340..1363839: 1500 deals, 9000 full baseline continuations, 754 shared-trigger positions, 1508 separate paired suffixes, zero unresolved. V8 deterministic replay passed; Node CLI not executed.

Same-side one-shot retained-double connector vs generic immediate mobility; min-hand-pips continuation, two opponent profiles. Pair-minus-generic first-place: -0.444 pp (exploratory 3SE [-1.198,+0.309]) against min-pips, -0.667 pp ([-1.345,+0.011]) against branch-control. Triggered differences -5.115 / -8.264 pp. No statistically reliable pair-specific advantage.

Signed endpoint gap: negative -7.51/-5.44 pp (n=173/147), positive -3.21/-10.19 pp (n=218/216). Hand <=7: -6.06/-10.58 pp (n=99/104); hand 8-9: -4.79/-7.34 pp (n=292/259). All subgroup intervals cross zero. Endpoint gap and pip cost are inseparable on the same branch.

Pair/generic next-own-turn pass: 2.81%/0% and 14.33%/0%. Fixed bots, selected states, provisional branch opening, unassigned block winner; no human-play generalization. Cumulative: 503100 full + 444880 separate suffix continuations; historical/quarantined excluded.

Reproduce: node qosha-research/simulator/mobility-shared-trigger.js test; then node qosha-research/simulator/mobility-shared-trigger.js 1362340 1500.

Next: independent seeds 1363840..1365339, matched full-deal generic mobility vs baseline; execute Node CLI tests.
