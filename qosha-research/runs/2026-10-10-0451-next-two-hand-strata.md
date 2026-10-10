# 2026-10-10 04:51 Asia/Baku

Engine qosa-research-0.5.3 / rules qosa-1.0.0. 36 fresh 3x9 positions, 302 unique hidden worlds, 1,812 paired continuations; seed scan 1226000..1599999, seed%17=0, six positions per focal hand 3/4/5 and following opponent <=2/>=3, NEXT clockwise opponent exactly 2. Strategies: closed-branch-control, min-hand-pips, fast-doubles. X-X opening now minus X-Y connector: finish-first -30.09/-25.79/-17.92 pp; immediate NEXT-player finish risk +1.11 pp, only 2/36 positions positive. Cumulative: 180,000 complete rounds + 98,233 hidden worlds. Provisional: model assumptions, quota bias, correlated worlds, no block winner, V8 only. Next: X-matched fresh-seed replication and exact immediate-finish hand patterns.

Frozen seeds (hand/second opponent short<=2, long>=3):
3/short: 1228522,1229644,1234948,1235679,1238059,1240592
3/long: 1226550,1229117,1235747,1237804,1240473,1248174
4/short: 1228726,1229168,1231327,1231514,1232908,1233758
4/long: 1228386,1230698,1233962,1234285,1234659,1239385
5/short: 1228318,1233061,1233333,1236648,1238552,1243822
5/long: 1232449,1232942,1233571,1239283,1241289,1241442

Replay: initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3}), stepRound with chooseBy('closed-branch-control') until first base.eligible state; choose X2 before X0 before X4, then base.analyze(position,24). Hidden world seed=22000000+1000*dealSeed+attemptOffset, unique allocations. Position-weighted metrics. Existing base.selfTest and exact first-position replay passed. No independent Node CLI.
