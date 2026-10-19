# Qoşa açdı — 2026-10-19 12:15 Asia/Baku

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9 later-round, provisional branch semantics.

New independent seeds 2026300..2026599: 300 deals, 5,400 complete rounds (3,600 fixed-opponent paired; 1,800 mixed), 0 unresolved. V8 CommonJS deterministic test passed; Node CLI not executed.

**Paired fixed opponents, history minus no-history:**
- Two closed-branch-control bots: finish-first 36.11% vs 37.33%, delta -1.22 percentage points, exploratory 95% seed-cluster CI [-2.77, +0.33]; mean remaining-pip difference -0.004.
- Two min-hand-pips bots: 45.33% vs 46.33%, delta -1.00 percentage points, CI [-2.25, +0.25]; mean remaining-pip difference +0.010.
- History changed 386 focal choices (246/140), including 54 with next opponent at <=2 tiles (39/15).

**Mixed three-way tournament, descriptive only:** history vs no-history 35.00% vs 29.33% against closed-branch-control (+5.67 pp); 38.44% vs 32.56% against min-hand-pips (+5.89 pp).

**Finding:** mixed +5–6 pp does not survive a same-seed, same-focal-seat comparison against two identical fixed opponents; both paired CIs include zero. Mixed and isolated opponent compositions differ, so the mixed gap is not a causal pass-memory effect.

Reproduce: node qosha-research/simulator/pass-history-fixed-opponents.js test ; node qosha-research/simulator/pass-history-fixed-opponents.js 2026300 300 . JSON: runs/2026-10-19-1215-pass-history-fixed-opponents-2026300.json.

Limitations: fixed deterministic bots, public-pass-only posterior, no voluntary-action likelihood, provisional branch rules, no block winner or 101 match score; exploratory seed-cluster intervals, Node not run. Full first-place/pips/median/turns/blocks/minus metrics in JSON.

Cumulative: 249,000 previously reported across branches (some unreconciled) + 5,400 = 254,400 reported; main-branch audited baseline 180,000 remains distinct. Historical 4,000 separate.

Next: fixed opponent composition with one public-uniform/history opponent plus one bot; measure single-decision counterfactual regret at changed moves using identical hidden worlds and continuation policy.
