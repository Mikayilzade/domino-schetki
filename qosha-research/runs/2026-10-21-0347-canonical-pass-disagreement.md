# 2026-10-21 03:47 Asia/Baku — canonical pass disagreement

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9.
Discovery seeds 1308928..1309527: 102 deals scanned, 24 positions, 576 hidden worlds, 3840 candidate continuations.
Independent holdout seeds 1309528..1310527: 226 deals scanned, 48 positions, 1536 hidden worlds, 11072 candidate continuations.
Total 328 deals scanned, 72 first non-equivalent disagreement positions, 2112 hidden worlds, 14912 candidate continuations; 0 unresolved.

Joint minus one opponent pass-history, first-finisher rate:
- Discovery, min-pips: -0.52 percentage points (95% exploratory position CI -8.72..+7.68); branch-control: -11.63 (-18.53..-4.73).
- Holdout, min-pips: -2.15 (-12.23..+7.94); branch-control: -8.79 (-17.84..+0.26).
- Combined exploratory branch-control: -9.74 (-16.17..-3.30).
- 57/72 joint-pass decisions discarded more pips immediately. 28/72 changed single to double sequence; branch-control delta -10.86 points (post-hoc, confounded).

Validation: new deterministic replay, brute-force posterior, 25/25 sampler diversity, canonical geometry symmetry green in V8 CommonJS. Node CLI not run. Same worlds and canonical continuation policy for each candidate. Alpha=20, canonical min-pips discovery opponents, two canonical continuation policies.

Confidence/limitations: exploratory and selected disagreements, provisional branch rules, fixed bots, uniform pass-conditioned allocation with no choice likelihood, block winner unassigned; not a universal human rule. Old 264900 full continuations, 17280 prior canonical full continuations and 14912 new candidate continuations remain separate.

Exact next: fresh seeds >=1310528, stratify single-versus-double changes by equal discarded pips, opponent hand size, immediate reply mobility and active ends; retest both bots on matched worlds.
Reproduce: node qosha-research/simulator/pass-disagreement-canonical.js test
Discovery: node qosha-research/simulator/pass-disagreement-canonical.js 1308928 1309528 24 24 20
Holdout: node qosha-research/simulator/pass-disagreement-canonical.js 1309528 1310528 48 32 20
Data: runs/2026-10-21-0347-canonical-pass-disagreement-{discovery,holdout}.json
