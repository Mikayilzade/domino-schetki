# Late equal-pip / equal-accessible next-reply checkpoint — 2026-10-18 17:50 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3×9 later-round. Fresh seeds 1098000..1127585; 29586 deals scanned; 12 matched late positions; 360 hidden allocations; 1440 forced continuations; **0 new full strategy rounds**. Prior verified full-round cumulative: **215,520** (historical 4,000 separate).

Compared connector X-Y against unrelated ordinary U-V at **equal discarded pips and equal accessible-end count**, both retaining X-X and another connector. Focal hand 4–5, next clockwise opponent <=3. Identical hidden worlds and continuation policies.

Immediate next-opponent playable chance, connector minus unrelated: **-16.94 pp** (exploratory 95% position CI -30.98..-2.91 pp); legal action count -0.311; unique playable tiles -0.289. Paired playable-status disagreement 22.50%. Immediate finish option delta 0.56 pp; immediate minus-finish option delta 0.56 pp.

Full continuation first-place difference: closed-branch **13.33 pp** (CI 2.45..24.21 pp); moderate-hold **14.44 pp** (CI -2.41..31.30 pp). All other metrics and position-level details in JSON.

**Finding:** late-game mechanism remains exploratory. With only 12 matched positions, do not claim a general connector advantage. Strict focal 3-stone control is structurally impossible: X-X + two distinct X-Y connectors + unrelated U-V requires >=4 tiles.

**Limitations:** position-level exploratory uncorrected CI; first eligible selection; two fixed bots; uniform hidden worlds ignore earlier opponent decisions; end-number identities differ despite same accessible count; provisional branch semantics; block winner unassigned. No human-play generalization. V8 CommonJS self-test passed; Node CLI not executed.

Reproduce: `node qosha-research/simulator/late-equal-accessible-reply.js test`; `node qosha-research/simulator/late-equal-accessible-reply.js 1098000 50000 12 30`.

**Exact next hypothesis/action:** independent late holdout focal 4–5 / next <=3 stratified by end-number overlap; for focal 3 use different, explicitly less-controlled comparator.
