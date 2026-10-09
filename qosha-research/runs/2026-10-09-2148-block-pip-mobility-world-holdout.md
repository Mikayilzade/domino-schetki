# Qoşa block-pip mobility: fresh hidden-world holdout (2026-10-09 21:48 Asia/Baku)

Engine qosa-research-0.5.3, recovered qosa-1.0.0, 3×9. Frozen 30 positions from 20:53, NOT new independent positions. Exactly 100 NEW deterministic hidden worlds per position (seed 33000000+1000*dealSeed+i, i=0..99), 3000 worlds, 18000 paired forced continuations; 0 new full strategy rounds. Three continuation bots: closed-branch-control, min-hand-pips, random-legal.

Whole-sample high-pip minus low-pip finish-first: closed-control +4.60pp (position CI [-0.82,+10.02]), min-pips +6.07pp ([+0.86,+11.27]), random +2.73pp ([-1.15,+6.62]). Exploratory, unadjusted position-level CIs.

Conditional urgent/highMore: in six positions with an opponent holding <=2 stones and high-pip leaving more own immediate playable tiles, when BOTH continuations block under closed-control, high-pip leaves +3.13 more focal pips and is worse in 171/193 matched both-block worlds (22 better). Previous hidden-world batch on SAME six positions: +3.73 pips and worse in 90/97. Position-level mean +2.03, CI [-2.71,+6.78] includes zero. This is a provisional, selected conditional observation, not a universal rule. Under random-legal, the sign reverses for overall both-block outcomes; policy dependence is material.

Cumulative: 180000 complete strategy rounds (historical 4000 separate) and 91466 selected hidden worlds (prior 88466 + 3000; 400 pilot worlds separate). Official block winner and ties unknown; strictly-lowest pips is NOT official victory. Assumed branch locking, simple bots, correlated worlds, selection bias, no pass-history conditioning, and exploratory CIs limit inference. V8 CommonJS executed; Node CLI pending.

Reproduce: node qosha-research/simulator/block-pip-mobility-world-holdout.js 100. Data: runs/2026-10-09-2148-block-pip-mobility-world-holdout.json. Next: disjoint position seeds, same-side matched actions, unconditional finish/remainder by opponent urgency, official block scoring.
