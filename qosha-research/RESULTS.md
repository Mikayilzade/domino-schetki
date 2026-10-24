# Qoşa açdı — накопленные результаты

## Исторический baseline из чата

До переноса исследования в GitHub было выполнено:

### 4 000 раздач × 9 простых стратегий
Предварительные наблюдения:
- удерживать все дубля до конца — слабая общая политика;
- возможность нескольких дублей за ход увеличивает темп и меняет их ценность;
- закрытая ветвь имеет стратегическую ценность;
- −10 наблюдался регулярно;
- −20 — заметно реже;
- −30/−40 в этой конкретной выборке не встретились;
- отдельно был построен пример, доказывающий возможность −40 при 3 игроках.

Эти результаты считаются историческими и не смешиваются с новыми до полной валидации нового движка.

### Разбор реальной партии seed 1898414179
Старый формат:
- schema: `qosa-round/v1`;
- engineVersion: `qosa-1.0.0`;
- players: 3;
- handSize: 9.

Для позиции было рассмотрено около 2 000 возможных скрытых раскладов. Большая часть ходов пользователя оказалась вынужденной; существенные развилки были найдены примерно на ходах №20 и №23.

## Новые почасовые прогоны

### 2026-09-30 23:54 (+04)
- engine: `qosa-research-0.1.0` (local validation prototype)
- deals: 0 strategy deals; 4 deterministic deal fixtures used for invariant validation
- seeds: 0, 1, 1898414179, 4294967295
- strategies: none yet; intentionally blocked until branch/legal-move semantics are validated
- key metrics: 28 unique tiles; each 3×9 fixture produced 27 unique hand tiles + 1 stock tile; deterministic replay, pip counting, minus classification and score-floor checks passed
- new finding: reproducible deal infrastructure is feasible, but strategy statistics are still premature
- confidence: high for these basic invariants; no claim for branch legality or historical seed compatibility
- follow-up: add branch-state/legal-move fixtures from confirmed rules and real positions before the first strategy batch

### 2026-10-01 12:50 (+04)
- engine: `qosa-research-0.1.0` plus pending multi-double API
- deals: 0 strategy deals
- seeds: none
- strategies: none; validation gate remains active
- key metrics: source-of-truth inspection confirms `test.js` requires `enumerateDoubleOpeningSequences` and `applyDoubleOpeningSequence`, while `engine.js` does not export/implement them
- new finding: the multi-double validation fixture is present but cannot pass until the engine API is added; no strategy claim is valid yet
- confidence: high for repository-state diagnosis; multi-double semantics remain assumption-labelled
- limitation: attempted engine write was blocked by connector safety checks, so no code mutation was persisted
- follow-up: implement the missing multi-double API, run invariants, then proceed to draw/pass turn-loop validation

### 2026-10-01 16:45 (+04)
- engine: `qosa-research-0.2.0` multi-double opening kernel
- deals: 0 strategy deals; deterministic invariant suite only
- seeds: 0, 1, 1898414179, 4294967295 for deal invariants; no strategy seeds yet
- strategies: none; validation gate remains active
- key metrics: local invariant suite is green; for branch ends {5,2}, hand {2-2,5-5,3-3} enumerates exactly the two maximal opening orders `2→5` and `5→2`; applying either opens 2 and 5, rejects 3, and leaves branch geometry unchanged
- new finding: the previously missing multi-double API is now implemented and persisted in GitHub commit `dee39ecc6b06c6c2b6bb37054a0cf68117b51621`
- confidence: high for the assumption-labelled opening-state kernel and existing deterministic invariants; this is not yet a claim that all real-game multi-double semantics are fully validated
- limitation: draw/pass turn loop, block termination, and mixed-finish integration are not yet implemented
- follow-up: implement and test draw-one-then-play-or-pass turn flow and block termination before the first strategy batch


### 2026-10-01 16:50 (+04)
- engine: `qosa-research-0.3.0` turn-kernel layer
- deals: 0 strategy deals; deterministic turn/block invariants only
- seeds: none beyond existing deal fixtures
- strategies: none; validation gate remains active
- key metrics: local invariant suites are green; an ordinary legal tile in hand prevents drawing; when hand is dead, exactly one stock tile is drawn; if the drawn tile is legal it may be played immediately, otherwise it remains in hand and the player passes; block is detected only after a full 3-player pass cycle with empty stock; block remainder pip sums are deterministic
- new finding: the draw-one-then-play-or-pass flow and block termination can be modelled cleanly as a separate layer without disturbing the validated multi-double/opening kernel
- confidence: high for the isolated ordinary-turn invariants; the block rule is assumption-labelled to the documented 3-player configuration
- limitation: double-opening actions are not yet integrated into the same turn dispatcher; mixed-finish and complete-round termination are still pending
- follow-up: integrate ordinary play and double-opening into one turn action set, then validate complete round termination before starting strategy batches


### 2026-10-01 16:57 (+04)
- engine: `qosa-research-0.4.0` unified dispatcher + initialized-board round driver
- deals: 0 strategy deals; deterministic dispatcher/round fixtures only
- seeds: no new strategy seed set
- strategies: none; mass-simulation gate remains active
- key metrics: local dispatcher and round-driver invariants are green; doubles are excluded from ordinary single actions and routed through the opening sequence path; draw/pass works through the same dispatcher; ordinary empty-hand finish, double empty-hand finish with −10, and 3-pass empty-stock block all terminate correctly
- new finding: mixed-finish positions can now be detected before an incorrect transition is simulated; the driver returns `unresolved/mixed-finish` instead of silently choosing a rule
- confidence: high for the isolated dispatcher and initialized-board termination fixtures; no claim yet about complete real-round initialization or exact mixed-finish semantics
- limitation: exact starter/opening initialization and mixed finish are still unresolved; current multi-double sequence enumeration remains assumption-labelled
- follow-up: implement a deterministic 3-player round initializer with explicit unresolved gates, then connect it to the driver before the first strategy batch


### 2026-10-01 17:00 (+04)
- engine: `qosa-research-0.4.0`
- compatibility fixture: historical round `seed=1898414179`, engine `qosa-1.0.0`
- key metric: current `dealThreeByNine(1898414179)` does **not** reproduce the historical initial hands or stock; current stock is `2-6`, historical stock is `1-5`
- new finding: the new xorshift-based deal generator is internally deterministic but not seed-compatible with `qosa-1.0.0`
- implication: new matched-seed strategy experiments may compare strategies within the new engine, but numeric seeds must not be interpreted as recreating old-engine rounds unless an old-RNG compatibility layer is implemented
- confidence: high; exact historical hands/stock are preserved as a repository fixture
- follow-up: keep historical fixtures separate, then validate round initialization semantics before mass strategy runs


### 2026-10-01 18:49 (+04)
- engine: `qosa-research-0.4.0`; no engine mutation this pass
- deals: 0 strategy deals
- seeds: historical fixture `1898414179` inspected only
- strategies: none; validation gate remains active
- key metrics: repository searches for old simulator field names returned no implementation evidence; the historical fixture has starter 2 with doubles 5-5, 1-1, 2-2 and `openingDraw=1-5`, insufficient to uniquely recover the centre/opening transition
- new finding: current GitHub evidence cannot resolve exact `qosa-1.0.0` round initialization; inferring the centre would invent a rule
- confidence: high for the evidence audit; no gameplay-strategy claim
- limitation: old simulator source or additional complete historical logs are not discoverable on the default branch
- follow-up: continue with initialization-invariant validation: explicit −10/−20/−30/−40 finish fixtures and a documented maximal-vs-prefix multi-double assumption matrix


### 2026-10-01 20:00 (+04)
- engine: `qosa-research-0.5.0` rule-confirmation checkpoint
- deals: 0 strategy deals; deterministic rule/integration fixtures only
- seeds: historical fixture `1898414179` plus constructed start/finish fixtures
- strategies: none yet
- key metrics: user confirmed mandatory `1-1` opening, clockwise continuation, first-round redeal if `1-1` is stock, previous-winner start on later stock `1-1`; non-finishing multi-double prefixes are voluntary; finishing doubles are all played; mixed finish is valid
- validated example: hand `1-5, 5-5, 2-2` with 5 and 2 available after `1-5` ends the round in the same turn with −20
- historical opening fixture: player 2 owns `1-1`, draws stock `1-5`, plays `1-5` as the second opening move, then turn passes clockwise to player 0
- new finding: the three largest rule blockers (start centre, mixed finish, maximal-vs-prefix multi-double behavior) are now resolved by direct user confirmation
- confidence: high for these rules; they are user-confirmed rather than inferred
- limitation: a rare opening edge remains unresolved when starter has no other 1 after the required opening draw; engine explicitly gates it
- follow-up: quantify that edge-case frequency, resolve it, then run complete initialized-round smoke batches before matched strategy simulations


### 2026-10-01 21:34 (+04)
- engine: `qosa-research-0.5.1`
- deals: 0 strategy deals; opening-pass fixture added
- seeds: constructed valid 3×9+1 opening fixture
- strategies: none
- key rule confirmation: after playing `1-1` and drawing the stock tile, if the starter still has no legal tile on 1, the starter passes; play continues clockwise and later passes follow the ordinary rule until a legal move appears
- new finding: the previously gated `no-followup-on-1` opening case is now resolved and no longer needs to be excluded from simulations
- confidence: high; directly confirmed by user
- limitation: branch locking/opening semantics still need stronger integration fixtures before large strategic claims
- follow-up: run complete initialized-round smoke batches and measure unresolved/turn-limit rate


### 2026-10-02 01:53 (+04)
- engine: `qosa-research-0.5.2` locked-branch regression checkpoint
- deals: 0 strategy deals; deterministic branch legality fixture only
- seeds: constructed branch state
- strategies: none
- key metrics: ordinary `5-6` is illegal while number 5 is closed; `5-5` remains a legal opening action; after playing `5-5`, ordinary `5-6` becomes legal on the same branch end
- new finding: the locked/open branch fix is now protected by a regression test rather than existing only in implementation code
- confidence: high for this isolated transition
- limitation: complete initialized-round smoke batches have not yet been run; no new strategy claim
- follow-up: run deterministic full rounds from initializer to finish/block and quantify unresolved/turn-limit rate before strategy batches


### 2026-10-02 04:48 (+04)
- engine: `qosa-research-0.5.3` RNG checkpoint
- deals: 10,000 deterministic deal-generation checks; 0 strategy rounds
- seeds: sequential `0..9999`
- strategies: none; validation gate remains active
- key metrics: previous direct-xorshift seeding was unsuitable for sequential experimental seeds (earlier audit: only 18/28 stock tiles appeared over 10,000 seeds and `1-1` was absent over `0..4095`); seed pre-mixing is now applied before xorshift and protected by a 10,000-seed stock-distribution regression requiring all 28 tiles and a broad sanity band around the expected 357.1 occurrences/tile
- new finding: deterministic seed identity can be preserved without letting adjacent integer seeds feed highly correlated initial xorshift states
- confidence: high that the specific sequential-seed pathology is addressed; this is a distribution sanity check, not a proof of perfect RNG quality
- limitation: RNG remains intentionally incompatible with historical `qosa-1.0.0` numeric seeds; historical fixtures stay separate
- follow-up: run complete initialized-round smoke batches under the corrected deal generator; inspect every unresolved/turn-limit seed before strategy statistics


### 2026-10-03 17:53 (+04)
- engine: `qosa-research-0.5.3`
- run type: complete-round smoke validation; deterministic policy = first legal action
- later-round seeds: `0..999`; 1,000/1,000 initialized, 961 finishes, 39 blocks, 0 init-unresolved, 0 round-unresolved/turn-limit
- later-round finish diagnostics: −10 = 169, −20 = 5, −30 = 0, −40 = 0; mean turns = 26.775, range 19..37
- first-round seeds: `0..999`; 45 correct redeals because `1-1` was in stock, 955 initialized; among initialized rounds 919 finishes, 36 blocks, 0 unresolved/turn-limit
- first-round finish diagnostics: −10 = 163, −20 = 3, −30 = 0, −40 = 0; mean turns = 26.788, range 19..37
- new finding: the initialized 3-player engine now completes the first 1,000 sequential-seed smoke set with zero unresolved states and zero turn-limit failures under both later-round and first-round initialization paths
- confidence: high as a smoke/integration result; these distributions are not strategy findings because only a trivial first-legal policy was used
- run data: `runs/2026-10-03-smoke-0000-0999.json`
- follow-up: expand smoke coverage to at least 10,000 sequential seeds and inspect any failures; if unresolved remains zero, begin matched-seed baseline strategy comparisons


### 2026-10-03 18:05 (+04)
- engine: `qosa-research-0.5.3`
- run type: 10,000-seed complete-round smoke validation; deterministic first-legal policy
- later-round seeds `0..9999`: 10,000/10,000 initialized; 9,637 finishes; 363 blocks; 0 init-unresolved; 0 round-unresolved/turn-limit; mean turns 26.620, range 19..41
- later-round finish diagnostics: −10 = 1,684; −20 = 63; −30 = 0; −40 = 0
- first-round seeds `0..9999`: 363 correct redeals with `1-1` in stock; 9,637 initialized; 9,284 finishes; 353 blocks; 0 unresolved/turn-limit; mean turns 26.627, range 19..41
- first-round finish diagnostics: −10 = 1,617; −20 = 58; −30 = 0; −40 = 0
- new finding: the complete initialized 3-player engine survives 10,000 sequential seeds in both opening modes with zero unresolved states and zero turn-limit failures
- confidence: high as integration/stability evidence; outcome frequencies remain validation diagnostics, not strategy conclusions
- run data: `runs/2026-10-03-smoke-0000-9999.json`
- follow-up: begin matched-seed strategy baselines; do not assign block winners until block winner/tie semantics are explicitly documented


### 2026-10-03 18:12 (+04)
- engine: `qosa-research-0.5.3`
- run type: first matched-seed strategy baseline
- seeds: `0..9999`; 3 seat rotations per seed; 30,000 complete rounds; 28,722 finishes; 1,278 blocks; 0 unresolved
- strategies: `random-legal`, `min-hand-pips`, `fast-doubles`; each strategy has 30,000 appearances and occupies every seat once per seed across the three rotations
- finish rate per appearance: random legal 38.17%; min-hand-pips 35.24%; fast-doubles 22.33%
- mean / median final pips: random 5.56 / 5; min-hand-pips 3.57 / 2; fast-doubles 5.11 / 4
- winner minus counts: random −10=576, −20=12; min-hand-pips −10=1,163, −20=10; fast-doubles −10=131, −20=1; no −30/−40 in this baseline
- new finding: the first simple policies expose a real objective tradeoff: immediate pip minimization substantially lowers end-of-round residue but does not maximize first-to-finish frequency; blindly prioritizing doubles is clearly weak in this three-policy environment
- confidence: medium as a reproducible baseline; the 1,000-seed pilot showed the same ordering, but this is still one bot mix with simplistic policies and fixed opening choice
- limitation: blocks are included in final-pip averages but no block winner is assigned; therefore finish rate is not an overall game-win rate
- run data: `runs/2026-10-03-baseline-0000-9999.json`
- runner: `simulator/strategy-runner.js`
- follow-up: add moderate-double-hold and branch-control policies on the same `0..9999` seed set; add block winner semantics once user confirms them


### 2026-10-03 18:16 (+04)
- engine: `qosa-research-0.5.3`
- run type: matched-seed candidate strategy extension, exact same `0..9999` seed set, 3 seat rotations per seed
- tournament A (30,000 rounds): random legal / min-hand-pips / moderate-double-hold. Finish rates: 30.50% / 30.91% / **35.16%**. Mean final pips: 7.22 / 4.32 / **3.94**. 0 unresolved.
- tournament B (30,000 rounds): random legal / min-hand-pips / closed-branch-control. Finish rates: 28.37% / 27.16% / **41.04%**. Mean final pips: 7.71 / 5.30 / **3.67**. 0 unresolved.
- strong-control tournament (30,000 rounds): min-hand-pips / moderate-double-hold / closed-branch-control. Finish rates: 26.50% / 30.23% / **39.90%**. Mean final pips: 5.61 / 4.88 / **3.87**. 0 unresolved.
- new finding: preserving closed numbers and opening as few new double-numbers as possible is the strongest provisional heuristic tested so far; importantly, it keeps its advantage when random-legal is removed and it faces the two stronger simple baselines
- secondary finding: moderate double holding improves on pure immediate pip minimization in the matched environments tested
- confidence: medium. The signal repeats across 10,000 matched seeds and stronger-opponent control, but these remain handcrafted bots rather than a proof of optimal play
- limitation: block winners remain unassigned; opening follow-up uses the common initializer policy; no rollout-based decision regret yet
- run data: `runs/2026-10-03-candidate-strategies-0000-9999.json`
- follow-up: stress-test branch control against variants that deliberately trade branch closure for tempo, then build paired decision-regret rollouts for positions with multiple legal moves


### 2026-10-03 18:50 (+04)
- engine: `qosa-research-0.5.3`
- run type: out-of-sample tempo stress test; fresh seeds `10000..19999`; 3 seat rotations; 30,000 rounds
- strategies: closed-branch-control / tempo (maximize stones shed, then pips) / tempo-open (maximize stones shed, then newly opened double numbers)
- finish rates: **46.83%** / 29.21% / 19.82%; mean final pips: **2.84** / 5.20 / 6.10; medians: **1** / 4 / 5
- blocks: 1,242 (4.14%); unresolved: 0; mean round length: 25.23 turns
- normalized minus per finish: branch-control −10 26.60%, −20 1.40%, −30 0.064%; tempo −10 14.31%, −20 0.23%; tempo-open −10 2.77%, −20 0.034%
- new finding: the closed-branch-control signal survives a fresh 10,000-seed out-of-sample set and two explicit tempo challengers. Aggressively opening numbers for tempo is especially weak in this model.
- interpretation: preserving closed numbers appears to buy both finish probability and lower remainder, while also increasing opportunities to finish on retained doubles; this remains a bot-policy hypothesis, not proof of optimal human play.
- confidence: medium-high for direction of this heuristic within the validated 3-player model; limitations are simple deterministic policies, default opening follow-up, and no assigned winner on blocks.
- run data: `runs/2026-10-03-tempo-stress-10000-19999.json`
- next: instrument starting/ending doubles and specific-double ownership, then add paired decision-regret rollouts at multi-choice states to learn when branch preservation should be overridden.


### 2026-10-03 19:47 (+04)
- engine: `qosa-research-0.5.3`
- run type: fresh-seed double-ownership instrumentation; seeds `20000..29999`; 3 seat rotations; 30,000 rounds
- strategies: min-hand-pips / moderate-double-hold / closed-branch-control; finishes 28,962; blocks 1,038; unresolved 0
- starting doubles are measured from the raw 9-tile deal before mandatory `1-1` opening/draw; mean = 2.250 for every strategy by matched-seat construction
- strongest new signal: starting with more doubles is strongly associated with finishing first in all three policies. For closed-branch-control, finish rate rises from 4.1% with 0 starting doubles to 21.1% with 1, 36.1% with 2, 53.2% with 3, 64.9% with 4 and 76.2% with 5 (6+ sample is too small for inference)
- the same monotonic pattern appears for min-hand-pips and moderate-double-hold, so this is not unique to the current branch-control heuristic
- specific-double ownership is much weaker than double count: under branch-control, conditional finish rates for owning 1-1 through 6-6 cluster around 47.0–48.7%, while 0-0 is 49.3%; these raw conditionals are confounded by total double count and starter status and are not yet interpreted as causal value
- ending doubles are rare among non-finish states: mean 0.0125 / 0.0107 / 0.0202 per appearance respectively
- confidence: high that starting-double count is a strong predictive feature in this simulator; low for causal value of any particular double until matched/controlled analysis removes hand-strength and starter confounding
- limitation: block winners remain unassigned; no decision-regret rollouts yet
- run data: `runs/2026-10-03-double-ownership-20000-29999.json`
- next: control specific-double value for total starting-double count/starter, then instrument multi-choice states for paired rollout regret


### 2026-10-04 17:09 (+04) — write recovery / source-of-truth reconciliation
- engine: `qosa-research-0.5.3`; status target remains `0.6.1`
- deals: 0 new strategy rounds in this checkpoint
- verified cumulative scale: **180,000 matched-seat strategy rounds**; historical 4,000 remains separate
- repository audit: persisted run-data/checkpoints exist through fresh seeds `20000..29999`; the previously reported `30000..39999` specific-double-control run was not persisted and is therefore **not counted or reconstructed from chat claims**
- write recovery: GitHub contents write/read/delete probe succeeded on 2026-10-04; research writes are available again
- confidence: high for persisted cumulative count; no new strategy finding claimed
- limitation: any earlier chat-only claim beyond the 180,000 persisted rounds is treated as unverified until reproduced
- exact next action: reproduce the controlled specific-double experiment on fresh deterministic seeds, controlling total starting-double count and starter status; then implement clone-safe paired continuation/decision-regret rollouts using identical hidden worlds and continuation policy


### 2026-10-04 18:47 (+04) — controlled-double analysis checkpoint
- engine: `qosa-research-0.5.3`; no gameplay-rule mutation
- deals: 0 new rounds credited in this checkpoint; persisted cumulative scale remains **180,000 matched-seat rounds**
- code: added `simulator/specific-double-adjust.js`, a postprocessor for the existing fresh-seed controlled runner
- method: compare owning vs not owning each double only inside the same `(total starting doubles, starter status)` stratum; ignore cells below 25 observations and pool stratum differences with matched-cell weights
- important identifiability finding: the independent effect of `1-1` cannot be estimated while starter status is controlled, because in a raw 3×9 deal owning `1-1` exactly determines starter status. This must be reported as non-identifiable rather than assigned a causal value.
- confidence: high for the identifiability statement and analysis design; no new gameplay-strength claim until the fresh `30000..39999` run is executed and persisted
- limitation: this environment can write repository code but cannot execute Node against the repository checkout; no run-data is fabricated
- exact next action: execute `specific-double-control.js 10000 30000`, pipe its JSON through `specific-double-adjust.js`, persist both raw run data and adjusted summary, then interpret 0-0/2-2..6-6 only where matched strata have adequate support; after that continue clone-safe paired decision-regret infrastructure.


### 2026-10-05 02:48 (+04) — actual-starter gate remains blocked
- engine: `qosa-research-0.5.3`; 0 new strategy rounds credited; cumulative persisted scale remains **180,000**
- source audit: `specific-double-control.js` still stratifies `starter` as raw ownership of `1-1`; `initializer.js` correctly sets `base.starter=previousWinnerIndex` when `1-1` is the stock tile on a later round
- attempted fix: replace the controlled runner stratum with `seat === base.starter`; GitHub mutation was blocked by connector safety checks, so the repository code is intentionally left unchanged
- consequence: do not execute or credit `30000..39999` until this gate is fixed; doing so would contaminate the controlled specific-double estimate
- confidence: high; mismatch is directly visible in persisted source
- exact next action: persist the actual-starter fix, add an executable stock-`1-1` regression, then reproduce `30000..39999` and save raw + adjusted JSON before interpretation


### 2026-10-05 18:49 (+04) — actual-starter source-of-truth reconciliation
- engine: `qosa-research-0.5.3`; 0 new strategy rounds credited; cumulative persisted scale remains **180,000**
- source audit: `specific-double-control.js` now initializes the round first and passes `base.starter` into `rawFeaturesFromDeal`; per-seat starter strata are therefore based on `seat === actualStarter`
- persisted guard: `simulator/specific-double-starter-regression.md` now records the stock-`1-1` regression requirement; `initializer-test.js` already asserts that with stock `1-1` on a later round, `previousWinnerIndex=1` yields `starter=1`
- attempted executable guard: creation of a dedicated `specific-double-starter-test.js` was rejected by the GitHub connector in this pass, so no claim is made that the cross-module regression is executable yet
- new finding: the previously documented contamination gate in the runner itself is resolved in GitHub source of truth; the remaining blocker is test coverage/execution, not the analysis implementation
- confidence: high for persisted source inspection; no new gameplay-strength claim
- exact next action: persist an executable cross-module regression proving `rawFeaturesFromDeal(deal, base.starter)` marks the previous winner as starter when `1-1` is stock; then reproduce fresh seeds `30000..39999` and persist raw + adjusted controlled-double outputs


### 2026-10-05 22:50 (+04) — executable actual-starter regression
- engine: `qosa-research-0.5.3`; 0 new strategy rounds credited; cumulative persisted validated scale remains **180,000**
- validation: added `simulator/specific-double-starter-test.js`, a cross-module regression for a later-round deal with `1-1` in stock
- invariant: initializer assigns `previousWinnerIndex=1` as the actual starter; `rawFeaturesFromDeal(deal, base.starter)` marks seat 1 as starter even though no raw hand owns `1-1`
- stale artifact: `runs/2026-10-03-specific-double-controlled-30000-39999.json` predates the actual-starter correction and remains quarantined; its 30,000 rounds are not added to the validated cumulative scale
- new finding: the runner's starter-stratification gate now has an executable source-level regression rather than documentation-only coverage
- confidence: high for the cross-module invariant; no new gameplay-strength claim
- limitation: this connector runtime cannot execute Node, so the test is persisted but not runtime-executed in this pass
- exact next action: reproduce fresh seeds `30000..39999` with the corrected runner in an executable checkout, persist raw + adjusted outputs, then resume paired decision-regret rollouts


### 2026-10-06 06:51 (+04) — decision-regret infrastructure audit
- engine: `qosa-research-0.5.3`; 0 new strategy rounds credited; cumulative persisted validated scale remains **180,000**
- source audit: `simulator/decision-regret.js` now contains a clone-safe paired evaluator plus `aggregateWorlds`; `decision-regret-test.js` checks deterministic replay, complete candidate coverage, aggregation, and source-state immutability
- methodology: every legal candidate is forced from the same round state and then continued with one deterministic policy; finish-first, remainder and minus metrics remain separate rather than being collapsed into an invented utility score
- important limitation: current aggregation is only meaningful when compared worlds expose the same candidate action keys. A real hidden-world Monte Carlo runner must therefore fix the visible focal position/hand and vary only hidden opponent/stock allocations; arbitrary unrelated choice states must not be pooled.
- new finding: no gameplay-strength claim this pass; the paired evaluator is structurally ready for a fixed-visible-state multi-world runner, but that runner and empirical regret sample are not yet persisted
- confidence: high for source-level audit; executable Node tests were not run in this connector runtime
- exact next action: add a fixed-visible-state hidden-world sampler/runner that preserves candidate keys across worlds, then persist the first deterministic paired-regret sample; separately reproduce the quarantined corrected `30000..39999` specific-double run in an executable checkout.


### 2026-10-06 08:55 (+04) — write recovery and backlog reconciliation
- engine/rules: current persisted research stack; primary mode 3×9, recovered `qosa-1.0.0` rules
- deals: **0 new strategy rounds** in this recovery checkpoint
- verified cumulative scale: **180,000 matched-seat strategy rounds**; historical 4,000 remains separate
- write status: GitHub create/read/delete probe succeeded; blocked research notes were reconciled against repository contents before recovery
- recovered/persisted validation: actual-starter correction is present in `specific-double-control.js`; stock-`1-1` starter regressions are persisted; paired decision-regret evaluator and mutation/aggregation regression are persisted
- quarantine: `runs/2026-10-03-specific-double-controlled-30000-39999.json` predates the actual-starter correction. Its 30,000 rounds are not counted in the verified cumulative scale and its nominal-double finding is not treated as validated
- recovered real-position method: Monte Carlo must hold the focal player's visible hand/table/branch/open state and known stones fixed, sample only hidden opponent/stock allocations, and compare the same legal candidates under identical continuation policy/world seeds
- metrics remain separate: finish-first probability, expected remainder, minus probability/severity and regret; no invented composite score
- confidence: high for repository reconciliation and methodology; **no new gameplay finding claimed**
- exact next action: execute persisted regressions; reproduce corrected seeds `30000..39999` with raw + adjusted output; then implement a fixed-visible hidden-world sampler and validate 25 deterministic worlds before scaling paired regret
- linked checkpoint: `runs/2026-10-06-recovery-checkpoint.md`


### 2026-10-07 03:52 (+04) — hidden-world pre-mix audit
- engine: `qosa-research-0.5.3`; 0 new strategy rounds credited; cumulative persisted validated scale remains **180,000**
- source audit: `hidden-world.js` now pre-mixes each world seed before xorshift; `hidden-world-test.js` verifies 25 distinct mixed states for seeds `700..724`, deterministic replay, changed allocation for 700 vs 701, full 28-tile integrity, fixed focal candidate set, and 25 observations per candidate
- validation gap: the current diversity assertion proves 25 distinct pre-mixed integers, but does not yet require all 25 sampled hidden allocations themselves to be distinct; a strengthening patch was attempted in this pass but rejected by connector safety checks
- new finding: no gameplay-strength claim; the Monte Carlo sampler is structurally safer than the earlier direct-seed version, but runtime regression execution is still required before crediting numerical regret data
- confidence: high for source inspection; no Node execution available in this connector runtime
- exact next action: persist the 25-allocation fingerprint regression, execute `decision-regret-test.js` and `hidden-world-test.js` in an executable checkout, then persist the first numerical 25-world paired-regret sample


### 2026-10-07 10:56 (+04) — documentation sync to persisted hidden-world/regret code
- engine/research state: current persisted 3×9 stack; **0 new strategy rounds**; verified cumulative scale remains **180,000** matched-seat rounds, historical 4,000 separate
- fixed-visible sampler: `simulator/hidden-world.js` requires a visible state, exact focal player/hand agreement, removes all known tiles from the hidden pool, preserves hidden hand/stock counts, and pre-mixes sequential world seeds before xorshift
- diversity regression now persisted: `hidden-world-test.js` fingerprints the actual opponent hands + stock and requires seeds `700..724` to produce **25/25 distinct hidden allocations**; it also checks deterministic replay, 28 unique tiles, unchanged visible source state, identical focal legal candidates and 25 observations per candidate
- paired regret: `decision-regret.js` keeps metrics separate and computes regret against the best candidate for finish-first rate, mean remainder and **minus-finish rate**; minus finishes (−10/−20/−30/−40) are beneficial outcomes, so their rate is maximized rather than treated as a risk to minimize
- validation status: these source/test assertions are persisted, but this connector pass did **not** execute Node; do not label the current hidden-world/regret suite runtime-green until executed in an executable checkout
- gameplay finding: none claimed from this documentation sync
- exact next action: execute `decision-regret-test.js` and `hidden-world-test.js`; if green, persist the first numerical 25-world paired-regret JSON, then reproduce corrected controlled specific-double seeds `30000..39999`


### 2026-10-08 01:54 (+04) — first reachable-position paired pattern experiment
- engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; no gameplay-rule changes
- validation: decision-regret-test and hidden-world-test passed in a JavaScript V8 CommonJS evaluation harness (not Node CLI); discovered a wrong expected `keepsPair=true` for spending the only X-X in pattern-choice-test and corrected it
- sample: **20 distinct reachable deal-seed positions** (discovery seeds 0..9; independent holdout seeds 30,31,32,33,35,36,37,40,42,44), 100 hidden worlds per position = **2,000 matched hidden worlds**; 0 unresolved continuations; 0 new complete strategy rounds; verified prior total **180,000** strategy rounds unchanged
- comparison: for first eligible hand with 3+ X, X-X and connector, force one X-X double versus legal ordinary single moves retaining the pair; compare identical hidden worlds and closed-branch-control continuation, equal weight per position and within each action class
- discovery preserve-minus-spend: finish-first **+24.39 percentage points**, mean remainder **−2.01 pips**; holdout: **+24.78 percentage points**, **−3.82 pips**. Minus-finish difference +3.31/+4.57 points respectively, but its uncertainty includes zero across positions.
- finding: **provisional** evidence for preserving the X-X + X-Y structure instead of opening X-X immediately in this specific model/bot setup; not proof that the pattern itself causes the effect (could be general closed-branch advantage)
- confidence/limitations: direction replicated on disjoint seed/world sets, but 10 positions per split, first-eligible selection, one continuation policy, equal-action-class averages, assumption-labelled branch rules; no human-play generalization. The 25-world original regression fixture was non-discriminative (all candidates 25/25), so it is only a correctness check.
- reproducibility: `simulator/pattern-paired-runner.js` with `0 30 10 100` and `30 80 10 100`; `runs/2026-10-08-pattern-paired-20positions.json` records seeds, world formula and per-position deltas
- exact next hypothesis/action: run the new runner and pattern-choice regression in Node; compare this pattern against **non-pattern matched double-vs-single controls** on fresh seeds and alternate continuation policies to isolate branch-control from pair preservation.


### 2026-10-10 10:48 (+04) — strict next-opponent <=2 matched-world holdout
- engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`; 3×9; executable V8 CommonJS self-test green; Node CLI not run.
- fresh seeds `64000..64307`: 308 scanned deals, 40 strict positions, 1000 hidden allocations (25 per position), 8775 candidate continuations; no unresolved; no new full strategy rounds.
- strict comparison: connector X-Y played while retaining X-X and another connector vs opening X-X, next clockwise opponent has 1–2 stones; same hidden worlds, equal-weight action classes/positions.
- preserve-minus-open finish-first: closed-branch-control 32.9 pp (exploratory 95% position CI 21.7 pp..44.1 pp); min-hand-pips 32.2 pp; fast-doubles 27.1 pp.
- immediate legal finish possibility for next opponent: open-minus-preserve 10.6 pp; possible next-player −10 difference 0.0 pp (none in this sample). Threat is a legal option, not necessarily chosen by a bot.
- branch-control next opponent 1 vs 2 stones: 17.2 pp (n=10) vs 38.1 pp (n=30).
- code: `simulator/late-double-threat-runner.js`; data: `runs/2026-10-10-strict-next-opponent-64000.json`; exact seed formula `14000000+1000*dealSeed+worldIndex`, policies in JSON; CLI test `node qosha-research/simulator/late-double-threat-runner.js test`.
- cumulative verified: **180,000 full strategy rounds** + **28685 hidden allocations** (previous 27,685 + 1000); 4,000 historical rounds separate.
- confidence/limits: moderate for model-specific sign; no causal human generalization. First eligible position, only 25 worlds, branch opening assumptions, bot policies, no block winner, uncorrected exploratory intervals.
- next: independent 50+ positions using min-hand-pips discovery and >=50 worlds, matched non-pattern double-vs-single controls, explain counterexample seed 63040.


### 2026-10-10 14:54:50 +04:00 — exact conditional late-double enumeration
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`; primary 3×9. No gameplay changes.
- Reproduced prior discovery seeds `74000..75999`, 100 strict positions (50 X=0, 50 X>0), matched all selected seed/turn/hand triples; no new complete strategy rounds.
- **671 exhaustive distinct hidden opponent allocations**, 5,622 evaluated candidate continuations; 2–21 allocations per position, all resolved. Unlike 50-world Monte Carlo, these position-specific results have no allocation sampling error.
- Compared preserving X-X plus connector against immediately opening X-X, on identical worlds and three deterministic policies. Finish-first advantage: **23.03 / 21.57 / 19.26 percentage points** (closed-branch / min-pips / fast-doubles). Closed-branch mean remainder difference **-3.12 pips**; 47 positive, 53 ties, 0 negative positions.
- Previous apparent opening-favorable seeds were sampling artifacts: 74212: 0.00 pp (10 allocations); 75135: 16.67 pp (6 allocations). Do not retain the earlier -2 pp estimates as verified exceptions.
- Validation: executable deterministic 10/6-allocation fixtures, 28-tile integrity, unchanged focal candidate set and source state; self-test passed in V8 CommonJS harness (Node CLI not run).
- Confidence: exact under equal weighting of unseen-tile allocations and fixed bot policies; not an exact posterior conditioned on opponents' earlier decisions. Quota/first-eligible selection, assumed branch opening semantics, block winner unassigned, exploratory position intervals.
- Cumulative validated full strategy rounds remain **180,000** (historical 4,000 separate); the 671 exhaustive allocations are tracked separately from earlier random-world samples.
- Reproduce: `simulator/exact-late-double-runner.js` (`test`, then `74000 76000 50`), data `runs/2026-10-10-exact-late-double-74000.json`.
- Exact next hypothesis/action: repeat on independent fresh seeds, then use matched non-pattern double-versus-single controls to isolate branch control from connector retention.


### 2026-10-11 12:45 (+04) — equal-pip connector control regression checkpoint
- Engine/rules: existing `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; no gameplay changes.
- Persisted `simulator/connector-other-matches-test.js`: deterministic reachable-state discovery seeds `0..19999` (stop after 10 eligible positions); verifies legal single actions, same discarded pip sum, connector vs non-connector distinction, double retained, and source-state immutability.
- Validation: source persisted but **not executed** in Node in this connector-only run; no pass claim. Test uses `closed-branch-control` for discovery.
- New complete deals: 0; new evaluated hidden worlds: 0; no new strategy finding. Verified prior full-round cumulative baseline remains 180,000; exact hidden allocations tracked separately.
- Confidence/limits: test scaffolding only, does not establish strategic advantage or isolate branch geometry; requires execution and independent paired-world runner.
- Exact next action: run `node qosha-research/simulator/connector-other-matches-test.js`; if green, implement/run paired-world equal-pip comparison on fresh seeds with identical continuation worlds and three policies; record first-place, remainder, minus-finish separately.


### 2026-10-19 20:54 (+04) — remembered-pass posterior ablation
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`; 3×9; deterministic V8 CommonJS regression green, Node CLI not run.
- Fresh seeds `1300000..1300199`: 200 deals × 3 focal seats × 2 opponent profiles × 5 variants = **6,000 complete continuations**, 0 unresolved; matched seeds/seats/opponents. Previous repository-validated 186,000 → **192,000** if persisted.
- Comparing alpha12/alpha20 next-pass heuristic with/without forbidden-tile inference from observed no-stock passes: memory finish-first deltas **+0.33/+0.83 pp** vs min-pips bots, **+0.33/+0.67 pp** vs branch-control bots; all exploratory seed-cluster 95% intervals include zero.
- Direct same-state policy changes: 30/3712, 40/3704, 34/3171, 31/3180 focal choices across respective alpha/opponent cells. Every pass-derived forbidden set checked against actual opponent hand; no contradictions.
- Finding: memory has little observed incremental effect here, not statistically confirmed; reply-aware benefit vs pure min-pips should not be attributed to memory. Partial posterior assumes uniform allowed unseen tiles, not full history-conditioned hidden-world model.
- Reproduce: `simulator/pass-memory-ablation.js test` then `1300000 200`; detailed linked checkpoint `runs/2026-10-19-2054-pass-memory-ablation.md`.
- Next: fresh seeds 1300200..1300999, calibrate memory posterior on true next-pass outcomes and condition on both opponents' histories. Branch semantics provisional; no block winner.


### 2026-10-21 16:45 (+04) — pass-conditioned paired changed-choice regret
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3×9; V8 CommonJS sampler regression and deterministic replay passed (Node CLI not run).
- Fresh discovery seeds `1303640..1304089`: **36** changed-choice positions (18 per opponent profile), **64** matched hidden worlds each, **4,608** complete counterfactual continuations; zero unresolved. No new independent full-deal baseline samples; previous verified full continuation scale **290,100** unchanged.
- Joint-minus-one alpha20 finish-first: **−2.865 pp** vs min-hand-pips, **−14.583 pp** vs closed-branch-control; joint/one/tied positions **6/7/5** and **8/8/2**. Mean remainder joint-minus-one +0.073/+0.630 pips. These selected-position averages are exploratory and heterogeneous, **not** a general strategy rule.
- Method: fix visible/played tiles, opponent hand sizes and both opponents' observed no-stock pass constraints; allocate hidden tiles uniformly subject to those constraints; force both moves in identical worlds, continue with identical deterministic bot policy. No block winner; provisional branch opening; ignores likelihood of prior opponent choices.
- Reproduce: `simulator/pass-choice-regret-runner.js test`; then `1303640 450 18 64`. Raw position rows: `runs/2026-10-21-pass-choice-regret-1303640.json`; note: `runs/2026-10-21-1645-pass-choice-regret.md`.
- Next: independent seeds `1304090..1304539`, 128 worlds/position; stratify by one/both opponents' pass histories, retest changed-action regret and run Node CLI regression.


### 2026-10-23 10:47 (+04) — equal-pip hashed-pair holdout / next-opponent mobility
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, 3×9. New executable runner `simulator/equal-pip-paired-runner.js` (V8 CommonJS test passed; Node CLI not run).
- Independent seeds `1311890..1312289`, 60 selected positions, 2880 hidden allocations, 5760 paired continuations; 0 new independent baseline rounds.
- Same-pip single-vs-one-double, deterministic hashed pair selection: min-hand-pips: double−single first-place -15.76 pp, remainder 1.61 pips, next-pass -7.71 pp; closed-branch-control: double−single first-place -11.32 pp, remainder 0.54 pips, next-pass -11.53 pp.
- Next-opponent mobility strata are post-action descriptive and do not prove a causal mechanism. Branch opening is provisional, hidden-world sampling ignores opponent policy-choice likelihood, block winner not assigned, finish-first is not match win. No universal strategy rule claimed.
- Cumulative: **290,100** full continuations (unchanged), **312448** paired counterfactual continuations (historical 4,000 separate).
- Data/method: `runs/2026-10-23-1047-equal-pip-hashed-1311890.json`, `runs/2026-10-23-1047-equal-pip-hashed-1311890.md`. Next: pre-action openness/hand-size stratification and independent larger holdout; branch fixture validation.


### 2026-10-23 11:53 (+04) — independent equal-pip pre-action strata holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; unchanged. V8 CommonJS deterministic runner regression passed; Node CLI not run.
- Fresh, disjoint discovery seed window **1312290..1312939**; 80 eligible focal positions (40 per continuation profile), **3,840 matched hidden allocations**, **7,680 forced counterfactual continuations**, no unresolved; **0 new independent full-strategy rounds**. Reproduce with `node qosha-research/simulator/equal-pip-paired-runner.js test`, then `node qosha-research/simulator/equal-pip-paired-runner.js 1312290 650 40 48 hashed`.
- Same discarded pip sum, one ordinary single vs one double, matched hidden worlds and continuation policy. Double−single finish-first: **−16.30 pp** (min-hand-pips; exploratory position-cluster normal 95% CI ±5.28 pp), **−16.82 pp** (closed-branch-control; ±7.16 pp). Mean focal remainder **+1.04 / +1.66 pips**. Double choice worse in **34/40** and **33/40** positions respectively; better in 4/40 and 5/40, ties 2/40 each.
- Pre-action branch openness <=2 vs >=3 opened numbers: min-pips **−15.63 / −16.59 pp** (n=12/28); branch-control **−13.67 / −18.92 pp** (n=16/24). Clockwise opponent hand <=5 vs >=6 stones: min-pips **−13.10 / −18.03 pp** (n=14/26); branch-control **−12.69 / −18.39 pp** (n=11/29). Subgroup interaction **not established**; cells are small and exploratory.
- New finding: the **direction** favoring the ordinary single over immediately opening a double at equal discarded pip sum replicates in an independent holdout under both bot profiles; **not a universal human-play rule**. Pre-action openness/hand-size splits do not isolate a clear interaction.
- Limitations: branch-opening interpretation still provisional; pass-conditioned hidden worlds omit prior-choice likelihood; first-eligible-position selection; post-action mobility is not a causal mediator; block winner unassigned; finish-first ≠ match win; uncorrected exploratory CIs and correlated worlds.
- Cumulative persisted scale: **290,100 complete continuations** unchanged; **320,128 paired counterfactual continuations** (previous 312,448 + 7,680). Historical 4,000 rounds remain separate.
- Full reproducibility and position-level rows: `runs/2026-10-23-1153-equal-pip-preaction-1312290.json`.
- Exact next hypothesis/action: run independent seed holdout for pre-action subgroup interactions with more positions, then construct explicit branch-opening geometry fixtures to test the rule assumption before causal interpretation.


### 2026-10-23 12:52:21 +04:00 — same-tile different-branch geometry paired discovery + independent holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9. No gameplay-rule changes. Executed deterministic V8 CommonJS regression and same-tile geometry fixture; Node CLI not run.
- New runner: `simulator/same-tile-geometry-runner.js`. It holds the **exact ordinary tile, discarded pips, remaining hand, opened numbers, and hidden world constant** and varies only the legal branch end receiving that tile. Compare the placement yielding more individually playable stones in the focal remaining hand against the placement yielding fewer; require 3+ stones pre-move. This removes the previous double-versus-single tile/pip confound for the narrower question of ordinary-tile placement geometry.
- Discovery: seed window `1312940..1313589`, 120 reachable focal positions, 5760 matched hidden allocations, 11520 counterfactual continuations; profile discovery scanned {"min-hand-pips":34,"closed-branch-control":106} seed counts. min-hand-pips: n=60, higher-own-mobility minus lower-own-mobility finish-first 5.07 pp (exploratory position-cluster 95% half-width 4.81 pp), remainder -0.63 pips, next-pass -6.01 pp, position signs 24/21/15 (high/low/tie); closed-branch-control: n=60, higher-own-mobility minus lower-own-mobility finish-first 9.20 pp (exploratory position-cluster 95% half-width 6.13 pp), remainder -1.86 pips, next-pass -0.42 pp, position signs 29/17/14 (high/low/tie).
- Independent holdout: disjoint seed window `1313590..1314239`, 120 positions, 5760 matched hidden allocations, 11520 continuations; scanned {"min-hand-pips":31,"closed-branch-control":103}. min-hand-pips: n=60, higher-own-mobility minus lower-own-mobility finish-first 2.33 pp (exploratory position-cluster 95% half-width 5.03 pp), remainder -0.09 pips, next-pass -3.02 pp, position signs 29/21/10 (high/low/tie); closed-branch-control: n=60, higher-own-mobility minus lower-own-mobility finish-first 5.31 pp (exploratory position-cluster 95% half-width 6.58 pp), remainder -0.81 pips, next-pass -14.83 pp, position signs 26/15/19 (high/low/tie).
- Finding: higher immediate **own** single-stone mobility had a positive mean finish-first effect under both profiles in both seed sets, but the independent holdout intervals include zero and many individual positions favor lower own mobility. **Provisional heuristic, not a universal rule**. A human-useful testable idea: when the *same* stone can go on two different numbered ends, prefer the end that preserves more playable stones in your own hand, unless opponent access/tempo creates a counterexample.
- Confidence/limits: directional replication with 60 positions/profile/cohort, but no multiplicity correction; correlated worlds and first-eligible selection; opponent prior-choice likelihood ignored in pass-conditioned uniform worlds; simplistic fixed bot continuation; block winner unassigned; finish-first not match win; branch opening interpretation still provisional. Geometry fixture validates internal consistency, not authentic human rules.
- Cumulative: **290,100** independent full continuations unchanged; paired counterfactual continuations **343,168** (previous 320,128 + new 23,040); 11,520 new hidden allocations. Historical 4,000 separate. No new independent full strategy deals credited.
- Reproduce: `node qosha-research/simulator/same-tile-geometry-runner.js test`; `node qosha-research/simulator/same-tile-geometry-runner.js 1312940 650 60 48`; repeat with `1313590 650 60 48`. Full position-level rows and seed formula: `runs/2026-10-23-1248-same-tile-geometry-1312940-1313590.json`.
- Exact next hypothesis/action: isolate counterexamples where higher own mobility helps the opponent more; stratify by **pre-action** focal/opponent hand sizes and matched-world next-opponent legal access, validate branch-opening semantics with externally confirmed fixture, then retest on fresh disjoint seeds.


### 2026-10-23 15:51:40 +04:00 — pre-action visible opponent-access holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; unchanged. Deterministic V8 CommonJS regression passed (Node CLI not run).
- Fresh disjoint seed windows `1316840..1317489` and `1317490..1318139`; 240 selected positions, 11520 matched hidden allocations, 23040 paired forced continuations, 0 independent baseline deals.
- New pre-action visible-only risk: count K playable among N unseen double-six stones after each legal placement; expected clockwise opponent playable stones = next hand size × K/N. The risk split uses predicted difference >0 vs <=0, without seeing opponents' hidden hands or rollout outcomes.
- Min-hand-pips: predicted opponent more access n=55, higher-own-mobility first-place -1.67 pp; predicted not-more-access n=65, 3.11 pp. Overall 0.92 pp.
- Closed-branch-control: predicted opponent more access n=60, -1.04 pp; predicted not-more-access n=60, 19.10 pp. Overall 9.03 pp.
- Finding: under the tested branch-control bot, choosing the side preserving more own moves is useful primarily when it does NOT predict more immediate moves for the clockwise opponent. The direction of this split replicated on both fresh cohorts; no universal human rule is established. Min-pips effect is less stable across cohorts.
- Calibration caveat: visible vs sampled next-playable correlations 0.970 / 0.966 are largely expected from the uniform hidden-world sampler and are NOT independent evidence of human-world calibration.
- Confidence/limitations: exploratory position-level intervals without multiplicity correction, correlated worlds, first-eligible selection, simple deterministic bots, ignores pass constraints in visible risk and earlier choice likelihood in hidden worlds, branch-opening semantics provisional, block winner unassigned; finish-first != match win.
- Cumulative: 290,100 independent full continuations unchanged; 412288 paired counterfactual continuations (historical 4,000 separate).
- Reproduce: `simulator/visible-access-holdout.js` test and both seed commands; position-level data `runs/2026-10-23-1547-visible-access-holdout.json`.
- Exact next action: compare pass-conditioned vs uniform visible opponent-access risk on new disjoint seeds and validate branch semantics with a real-game fixture.


### 2026-10-23 16:47 (+04) — joint pass-conditioned visible-access holdouts
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; no gameplay changes. New V8 CommonJS deterministic replay test passed (Node CLI not run).
- Fresh disjoint discovery seeds **1318140..1318789** and **1318790..1319439**; **240** same-tile branch positions, **11,520** matched hidden allocations, **23,040** paired continuations, 0 new independent baseline full rounds. Same hidden worlds and bot policy for each pair.
- Test: choose placement retaining more playable stones unless predicted next opponent can play more. Compare uniform unseen-tile hypergeometric to joint posterior conditioned on both opponents' observed no-stock passes. Identical seed sets, forced candidate actions and continuation policies.
- Cohort 1 min-pips: 60 positions (11 with pass history), 4 choices changed; joint−uniform finish-first **−0.56 pp** (exploratory 95% half-width 1.16 pp); conditional-world next-pass-delta MAE uniform/joint **0.113/0.019** (pass-history subset).
- Cohort 1 branch-control: 60 positions (34 with pass history), 2 choices changed; finish-first **+0.28 pp** (half-width 0.54 pp); conditional-world MAE **0.120/0.026**.
- Cohort 2 min-pips: 60 positions (13 with pass history), 2 choices changed; finish-first **+0.07 pp** (half-width 1.27 pp); conditional-world MAE **0.105/0.018**.
- Cohort 2 branch-control: 60 positions (34 with pass history), 5 choices changed; finish-first **+1.18 pp** (half-width 1.88 pp); conditional-world MAE **0.102/0.028**.
- Finding: conditioning on pass history changed **13/240** choices, but **no reliable new winning rule**: gains do not consistently exceed exploratory uncertainty. Better agreement of joint probabilities with worlds sampled from the joint posterior is expected and **not independent calibration against human play**.
- Limitations: provisional branch-opening rules; prior opponent policy-choice likelihood omitted; first-eligible position selection; only 13 changed choices; correlated worlds; uncorrected exploratory intervals; fixed bots; block winner unassigned; finish-first is not match win. Raw position rows not persisted, but deterministic runner can regenerate them.
- Reproduce: `node qosha-research/simulator/pass-conditioned-access-runner.js test`; `node qosha-research/simulator/pass-conditioned-access-runner.js 1318140 650 60 48`; `node qosha-research/simulator/pass-conditioned-access-runner.js 1318790 650 60 48`. Linked compact metrics: `runs/2026-10-23-1647-pass-conditioned-visible-access.json`.
- Cumulative: **290,100** full continuations unchanged; **435,328** paired counterfactual continuations (prior 412,288 + 23,040); historical 4,000 separate.
- Exact next hypothesis/action: oversample positions where pass conditioning changes the recommendation, >=128 matched worlds per position on independent seeds, add alternative continuation policies and verify real-game branch-opening semantics.

### 2026-10-23 17:48:11 (+04) — targeted pass-conditioned changed-choice geometry holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; no gameplay changes. V8 CommonJS deterministic regression: passed; Node CLI not run.
- Fresh discovery seeds `1319440..1321939`; eligible first-geometry positions: {"min-hand-pips":220,"closed-branch-control":220}; selected changed-choice positions **10**, **1280** matched hidden allocations, **2560** forced counterfactual continuations. No new independent full-strategy rounds.
- Joint pass-conditioned minus uniform visible-risk placement, matched worlds/continuation policy: {"min-hand-pips":{"all":{"positions":6,"finishFirstGainPP":11.71875,"exploratoryPosition95HalfWidthPP":28.783155700571356,"remainderGainPips":-0.5625,"minusFinishGainPP":-2.213541666666667,"blockGainPP":7.942708333333333,"nextPassGainPP":0,"jointBetter":4,"uniformBetter":2,"tied":0},"nextHistory":{"positions":0},"otherOnly":{"positions":6,"finishFirstGainPP":11.71875,"exploratoryPosition95HalfWidthPP":28.783155700571356,"remainderGainPips":-0.5625,"minusFinishGainPP":-2.213541666666667,"blockGainPP":7.942708333333333,"nextPassGainPP":0,"jointBetter":4,"uniformBetter":2,"tied":0}},"closed-branch-control":{"all":{"positions":4,"finishFirstGainPP":-2.734375,"exploratoryPosition95HalfWidthPP":5.359375,"remainderGainPips":1.48046875,"minusFinishGainPP":0,"blockGainPP":1.953125,"nextPassGainPP":0,"jointBetter":0,"uniformBetter":1,"tied":3},"nextHistory":{"positions":1,"finishFirstGainPP":0,"exploratoryPosition95HalfWidthPP":null,"remainderGainPips":0,"minusFinishGainPP":0,"blockGainPP":0,"nextPassGainPP":0,"jointBetter":0,"uniformBetter":0,"tied":1},"otherOnly":{"positions":3,"finishFirstGainPP":-3.6458333333333335,"exploratoryPosition95HalfWidthPP":7.145833333333332,"remainderGainPips":1.9739583333333333,"minusFinishGainPP":0,"blockGainPP":2.604166666666667,"nextPassGainPP":0,"jointBetter":0,"uniformBetter":1,"tied":2}}}.
- Finding: Targeted changed-choice sample remains small; do not infer a universal improvement. Conditioning affects a rare subset of positions; effect must be confirmed on independent seed windows and with nonuniform prior-choice models.
- Limitations: provisional branch opening, pass-conditioned uniform worlds omit opponent earlier policy-choice likelihood, selected positions are not representative, worlds correlated, fixed bots, no block winner, finish-first ≠ match win. Uncorrected position-level normal intervals.
- Reproduce: `node qosha-research/simulator/pass-changed-geometry-runner.js test`; `node qosha-research/simulator/pass-changed-geometry-runner.js 1319440 2500 220 128 12`. Raw rows and summaries: `runs/2026-10-23-1746-pass-changed-geometry-1319440.json`.
- Cumulative: **290,100** independent full continuations unchanged; **437,888** paired counterfactual continuations (prior 435,328 + 2560); historical 4,000 separate.
- Exact next action: independent changed-choice holdout with 256 worlds per position; stratify whether the *clockwise* or only the second opponent passed, then externally validate branch opening with a real-play fixture.



### 2026-10-23, 18:54:39 (+04) — three independent changed-choice pass-history geometry holdouts
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3×9. Deterministic V8 CommonJS regression passed (Node CLI not run); no rule/code changes.
- Fresh disjoint seed windows: 1321940..1326439; 1326440..1330939; 1330940..1335439. Each: max 4500 discovery seeds, first 350 eligible same-tile geometry positions per profile, 256 conditional matched hidden allocations per selected changed-choice position. Selection is deliberately targeted and not representative of all turns.
- **66 selected changed-choice positions**, **16896 hidden allocations**, **33792 forced paired continuations**, 0 new independent baseline rounds. Positions by cohort 20/22/24; no unresolved.
- Profiles: min-hand-pips and closed-branch-control. Outcome = finish-first, not match win. Joint posterior (both opponents' observed no-stock passes) choice minus uniform unseen-tile choice, identical hidden worlds and continuation policy.
- Min-hand-pips: all n=27, joint−uniform finish-first -7.00 pp (exploratory position-level 95% half-width ±10.67 pp), remainder -0.96 pips, joint/uniform/tie 8/16/3; clockwise pass history n=7: -16.52 pp; second opponent only n=20: -3.67 pp. 
- Closed-branch-control: all n=39, joint−uniform finish-first 0.48 pp (exploratory position-level 95% half-width ±6.48 pp), remainder -0.07 pips, joint/uniform/tie 14/11/14; clockwise pass history n=13: -2.25 pp; second opponent only n=26: 1.85 pp. 
- Cohort summaries: [{"seeds":[1321940,1326439],"positions":20,"summaries":{"min-hand-pips":{"all":{"positions":8,"finishFirstGainPP":-2.5390625,"exploratoryPosition95HalfWidthPP":17.84849536014433,"remainderGainPips":-1.64453125,"minusFinishGainPP":0,"blockGainPP":-0.29296875,"nextPassGainPP":0.634765625,"jointBetter":3,"uniformBetter":5,"tied":0},"nextHistory":{"positions":2,"finishFirstGainPP":-24.609375,"exploratoryPosition95HalfWidthPP":47.46875,"remainderGainPips":0.337890625,"minusFinishGainPP":0,"blockGainPP":1.171875,"nextPassGainPP":0,"jointBetter":0,"uniformBetter":2,"tied":0},"otherOnly":{"positions":6,"finishFirstGainPP":4.817708333333334,"exploratoryPosition95HalfWidthPP":16.676649028802554,"remainderGainPips":-2.3053385416666665,"minusFinishGainPP":0,"blockGainPP":-0.78125,"nextPassGainPP":0.8463541666666666,"jointBetter":3,"uniformBetter":3,"tied":0}},"closed-branch-control":{"all":{"positions":12,"finishFirstGainPP":3.4505208333333335,"exploratoryPosition95HalfWidthPP":9.966872365453984,"remainderGainPips":-1.4446614583333333,"minusFinishGainPP":0,"blockGainPP":2.34375,"nextPassGainPP":2.1484375,"jointBetter":3,"uniformBetter":2,"tied":7},"nextHistory":{"positions":4,"finishFirstGainPP":0,"exploratoryPosition95HalfWidthPP":0,"remainderGainPips":-0.791015625,"minusFinishGainPP":0,"blockGainPP":13.18359375,"nextPassGainPP":0,"jointBetter":0,"uniformBetter":0,"tied":4},"otherOnly":{"positions":8,"finishFirstGainPP":5.17578125,"exploratoryPosition95HalfWidthPP":15.141155599739006,"remainderGainPips":-1.771484375,"minusFinishGainPP":0,"blockGainPP":-3.076171875,"nextPassGainPP":3.22265625,"jointBetter":3,"uniformBetter":2,"tied":3}}}},{"seeds":[1326440,1330939],"positions":22,"summaries":{"min-hand-pips":{"all":{"positions":11,"finishFirstGainPP":-5.220170454545454,"exploratoryPosition95HalfWidthPP":12.935241111638355,"remainderGainPips":-0.9794034090909091,"minusFinishGainPP":-2.059659090909091,"blockGainPP":-9.588068181818182,"nextPassGainPP":0,"jointBetter":2,"uniformBetter":6,"tied":3},"nextHistory":{"positions":4,"finishFirstGainPP":8.3984375,"exploratoryPosition95HalfWidthPP":27.04275217409906,"remainderGainPips":-2.859375,"minusFinishGainPP":0,"blockGainPP":-12.109375,"nextPassGainPP":0,"jointBetter":1,"uniformBetter":1,"tied":2},"otherOnly":{"positions":7,"finishFirstGainPP":-13.002232142857142,"exploratoryPosition95HalfWidthPP":11.074455051491249,"remainderGainPips":0.09486607142857142,"minusFinishGainPP":-3.2366071428571432,"blockGainPP":-8.147321428571429,"nextPassGainPP":0,"jointBetter":1,"uniformBetter":5,"tied":1}},"closed-branch-control":{"all":{"positions":11,"finishFirstGainPP":-6.356534090909091,"exploratoryPosition95HalfWidthPP":12.324634629603763,"remainderGainPips":1.07421875,"minusFinishGainPP":-3.586647727272727,"blockGainPP":-4.403409090909091,"nextPassGainPP":0,"jointBetter":3,"uniformBetter":5,"tied":3},"nextHistory":{"positions":5,"finishFirstGainPP":-8.359375,"exploratoryPosition95HalfWidthPP":22.280345243727428,"remainderGainPips":0.60546875,"minusFinishGainPP":-0.3125,"blockGainPP":-1.953125,"nextPassGainPP":0,"jointBetter":2,"uniformBetter":1,"tied":2},"otherOnly":{"positions":6,"finishFirstGainPP":-4.6875,"exploratoryPosition95HalfWidthPP":14.87625990375129,"remainderGainPips":1.46484375,"minusFinishGainPP":-6.315104166666667,"blockGainPP":-6.4453125,"nextPassGainPP":0,"jointBetter":1,"uniformBetter":4,"tied":1}}}},{"seeds":[1330940,1335439],"positions":24,"summaries":{"min-hand-pips":{"all":{"positions":8,"finishFirstGainPP":-13.916015625,"exploratoryPosition95HalfWidthPP":27.202761030309393,"remainderGainPips":-0.2646484375,"minusFinishGainPP":-12.255859375,"blockGainPP":-0.341796875,"nextPassGainPP":12.890625,"jointBetter":3,"uniformBetter":5,"tied":0},"nextHistory":{"positions":1,"finishFirstGainPP":-100,"exploratoryPosition95HalfWidthPP":null,"remainderGainPips":3,"minusFinishGainPP":-100,"blockGainPP":0,"nextPassGainPP":100,"jointBetter":0,"uniformBetter":1,"tied":0},"otherOnly":{"positions":7,"finishFirstGainPP":-1.6183035714285716,"exploratoryPosition95HalfWidthPP":14.56071162123152,"remainderGainPips":-0.7310267857142857,"minusFinishGainPP":0.27901785714285715,"blockGainPP":-0.390625,"nextPassGainPP":0.4464285714285714,"jointBetter":3,"uniformBetter":4,"tied":0}},"closed-branch-control":{"all":{"positions":16,"finishFirstGainPP":2.9541015625,"exploratoryPosition95HalfWidthPP":11.09759478643204,"remainderGainPips":0.1650390625,"minusFinishGainPP":3.564453125,"blockGainPP":-6.494140625,"nextPassGainPP":0,"jointBetter":8,"uniformBetter":4,"tied":4},"nextHistory":{"positions":4,"finishFirstGainPP":3.125,"exploratoryPosition95HalfWidthPP":16.129691611974355,"remainderGainPips":0.1845703125,"minusFinishGainPP":0,"blockGainPP":0,"nextPassGainPP":0,"jointBetter":2,"uniformBetter":1,"tied":1},"otherOnly":{"positions":12,"finishFirstGainPP":2.897135416666667,"exploratoryPosition95HalfWidthPP":14.151502918042326,"remainderGainPips":0.15852864583333334,"minusFinishGainPP":4.752604166666666,"blockGainPP":-8.658854166666668,"nextPassGainPP":0,"jointBetter":6,"uniformBetter":3,"tied":3}}}}]
- Changed-choice seed/seat/turn/profile/history and outcome deltas: [{"seed":1321950,"seat":2,"turn":17,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":false,"winGain":-0.48828125,"pipsGain":1.0625,"minusGain":0,"blockGain":0},{"seed":1321961,"seat":1,"turn":12,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":false,"winGain":-0.00390625,"pipsGain":-0.38671875,"minusGain":0,"blockGain":0.0234375},{"seed":1321977,"seat":1,"turn":12,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.359375,"pipsGain":-2.66015625,"minusGain":0,"blockGain":0.0390625},{"seed":1321983,"seat":0,"turn":10,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.08984375,"pipsGain":-2.25,"minusGain":0,"blockGain":-0.015625},{"seed":1321985,"seat":0,"turn":16,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.25390625,"pipsGain":0.41796875,"minusGain":0,"blockGain":0},{"seed":1322014,"seat":1,"turn":10,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.0390625,"pipsGain":-2.0078125,"minusGain":0,"blockGain":0.05078125},{"seed":1322070,"seat":1,"turn":10,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.1640625,"pipsGain":-3.4375,"minusGain":0,"blockGain":-0.12109375},{"seed":1322073,"seat":2,"turn":13,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.03125,"pipsGain":-3.89453125,"minusGain":0,"blockGain":0},{"seed":1322014,"seat":1,"turn":22,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.125,"pipsGain":-1.25390625,"minusGain":0,"blockGain":0},{"seed":1322035,"seat":2,"turn":11,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.0703125,"pipsGain":-2.38671875,"minusGain":0,"blockGain":0},{"seed":1322085,"seat":0,"turn":23,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1322104,"seat":0,"turn":17,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.26953125,"pipsGain":0.98046875,"minusGain":0,"blockGain":0},{"seed":1322130,"seat":2,"turn":20,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":0,"pipsGain":-1,"minusGain":0,"blockGain":0},{"seed":1322165,"seat":1,"turn":19,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.51171875,"pipsGain":-2.42578125,"minusGain":0,"blockGain":-0.1640625},{"seed":1322175,"seat":2,"turn":18,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":-15,"minusGain":0,"blockGain":0},{"seed":1322226,"seat":0,"turn":17,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.0234375,"pipsGain":-2.58203125,"minusGain":0,"blockGain":-0.08203125},{"seed":1322229,"seat":0,"turn":20,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":8.49609375,"minusGain":0,"blockGain":0},{"seed":1322377,"seat":1,"turn":26,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1322410,"seat":2,"turn":25,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":-2.1640625,"minusGain":0,"blockGain":0.52734375},{"seed":1322436,"seat":1,"turn":22,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1326445,"seat":1,"turn":20,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1326458,"seat":2,"turn":12,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":false,"winGain":-0.1484375,"pipsGain":2.5703125,"minusGain":0,"blockGain":0},{"seed":1326500,"seat":1,"turn":10,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.22265625,"pipsGain":-0.5546875,"minusGain":0,"blockGain":0.01171875},{"seed":1326504,"seat":2,"turn":16,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":false,"winGain":0,"pipsGain":-14.328125,"minusGain":0,"blockGain":0},{"seed":1326534,"seat":0,"turn":8,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.40625,"pipsGain":0.9609375,"minusGain":-0.2265625,"blockGain":-0.01171875},{"seed":1326562,"seat":1,"turn":13,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":-1.8515625,"minusGain":0,"blockGain":0},{"seed":1326573,"seat":1,"turn":13,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.0078125,"pipsGain":-0.05859375,"minusGain":0,"blockGain":-0.14453125},{"seed":1326575,"seat":2,"turn":16,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.015625,"pipsGain":-0.15234375,"minusGain":0,"blockGain":-0.12890625},{"seed":1326604,"seat":2,"turn":12,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.12890625,"pipsGain":0.50390625,"minusGain":0,"blockGain":-0.296875},{"seed":1326611,"seat":1,"turn":17,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":true,"winGain":0.484375,"pipsGain":0.3203125,"minusGain":0,"blockGain":-0.484375},{"seed":1326637,"seat":2,"turn":9,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.14453125,"pipsGain":1.81640625,"minusGain":0,"blockGain":0},{"seed":1326493,"seat":0,"turn":17,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":0.06640625,"pipsGain":0.234375,"minusGain":-0.015625,"blockGain":-0.09765625},{"seed":1326504,"seat":2,"turn":13,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.359375,"pipsGain":2.29296875,"minusGain":-0.37890625,"blockGain":-0.0234375},{"seed":1326533,"seat":1,"turn":22,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":-0.6640625,"minusGain":0,"blockGain":0},{"seed":1326707,"seat":0,"turn":13,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.21875,"pipsGain":-0.8359375,"minusGain":0,"blockGain":0.01953125},{"seed":1326758,"seat":0,"turn":18,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1326780,"seat":2,"turn":20,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":-0.53515625,"pipsGain":1.5546875,"minusGain":0,"blockGain":0},{"seed":1326790,"seat":0,"turn":13,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.01953125,"pipsGain":2.41015625,"minusGain":0,"blockGain":-0.07421875},{"seed":1326848,"seat":2,"turn":10,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.0859375,"pipsGain":1.30859375,"minusGain":0,"blockGain":-0.0859375},{"seed":1326864,"seat":0,"turn":16,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":0.05078125,"pipsGain":1.90234375,"minusGain":0,"blockGain":0},{"seed":1326927,"seat":1,"turn":16,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.03515625,"pipsGain":3.61328125,"minusGain":0,"blockGain":-0.22265625},{"seed":1326940,"seat":0,"turn":20,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1331007,"seat":1,"turn":7,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.08203125,"pipsGain":-0.05859375,"minusGain":-0.00390625,"blockGain":-0.03515625},{"seed":1331012,"seat":2,"turn":8,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.1875,"pipsGain":-1.13671875,"minusGain":0,"blockGain":-0.0546875},{"seed":1331038,"seat":0,"turn":10,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.0078125,"pipsGain":-1.92578125,"minusGain":0,"blockGain":0.04296875},{"seed":1331045,"seat":1,"turn":8,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.14453125,"pipsGain":-0.8984375,"minusGain":0.0234375,"blockGain":0.01171875},{"seed":1331046,"seat":0,"turn":13,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":0.0859375,"pipsGain":-4.5390625,"minusGain":0,"blockGain":0.02734375},{"seed":1331046,"seat":1,"turn":20,"profile":"min-hand-pips","nextPassHistory":true,"otherPassHistory":false,"winGain":-1,"pipsGain":3,"minusGain":-1,"blockGain":0},{"seed":1331119,"seat":0,"turn":14,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.40234375,"pipsGain":3.2109375,"minusGain":0,"blockGain":0},{"seed":1331126,"seat":2,"turn":13,"profile":"min-hand-pips","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.0390625,"pipsGain":0.23046875,"minusGain":0,"blockGain":-0.01953125},{"seed":1330951,"seat":1,"turn":15,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":-0.13671875,"pipsGain":2.78515625,"minusGain":0,"blockGain":0},{"seed":1330976,"seat":0,"turn":14,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.0234375,"pipsGain":5.0625,"minusGain":0,"blockGain":-0.046875},{"seed":1331026,"seat":1,"turn":19,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.15625,"pipsGain":-0.5859375,"minusGain":0,"blockGain":-0.10546875},{"seed":1331031,"seat":2,"turn":16,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.17578125,"pipsGain":-1.0625,"minusGain":0,"blockGain":0},{"seed":1331096,"seat":0,"turn":16,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":0.00390625,"pipsGain":-1.15234375,"minusGain":0,"blockGain":0},{"seed":1331096,"seat":2,"turn":12,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.01953125,"pipsGain":0.15234375,"minusGain":0.03515625,"blockGain":0},{"seed":1331113,"seat":0,"turn":23,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":0,"minusGain":0,"blockGain":0},{"seed":1331141,"seat":2,"turn":16,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":1.0546875,"minusGain":0,"blockGain":-0.203125},{"seed":1331160,"seat":0,"turn":16,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":false,"winGain":0,"pipsGain":1.296875,"minusGain":0,"blockGain":0},{"seed":1331185,"seat":2,"turn":18,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.51953125,"pipsGain":2.74609375,"minusGain":0,"blockGain":-0.0625},{"seed":1331245,"seat":1,"turn":17,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0,"pipsGain":0.22265625,"minusGain":0,"blockGain":0},{"seed":1331266,"seat":2,"turn":16,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.16015625,"pipsGain":-3.0078125,"minusGain":0,"blockGain":-0.1796875},{"seed":1331341,"seat":2,"turn":14,"profile":"closed-branch-control","nextPassHistory":true,"otherPassHistory":true,"winGain":0.2578125,"pipsGain":-2.19140625,"minusGain":0,"blockGain":0},{"seed":1331479,"seat":0,"turn":19,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.296875,"pipsGain":-2.53125,"minusGain":0,"blockGain":-0.28125},{"seed":1331532,"seat":1,"turn":16,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":0.39453125,"pipsGain":-2.328125,"minusGain":0.53515625,"blockGain":-0.08984375},{"seed":1331548,"seat":2,"turn":19,"profile":"closed-branch-control","nextPassHistory":false,"otherPassHistory":true,"winGain":-0.3203125,"pipsGain":2.1796875,"minusGain":0,"blockGain":-0.0703125}]
- Finding: no reliable universal winning gain from pass-conditioning. Opponent identity of observed pass may matter, but small, selected strata and bot differences make interaction uncertain. Do not overinterpret uncorrected exploratory intervals.
- Limitations: provisional branch-opening semantics, previous opponent-choice likelihood ignored, uniform allocation conditional on passes, fixed bot policies, correlated worlds, selected rare changed-choice states, block winner unassigned, finish-first != match win.
- Reproduce: `node qosha-research/simulator/pass-changed-geometry-runner.js test`, then `node qosha-research/simulator/pass-changed-geometry-runner.js 1321940 4500 350 256 30`; `node qosha-research/simulator/pass-changed-geometry-runner.js 1326440 4500 350 256 30`; `node qosha-research/simulator/pass-changed-geometry-runner.js 1330940 4500 350 256 30`. These deterministic commands reproduce full per-position rows.
- Cumulative: **290,100** independent full continuations unchanged; **471,680** paired counterfactual continuations (previous 437,888 + 33792); historical 4,000 separate.
- Exact next action: oversample positions with clockwise-opponent pass history and evaluate under alternate continuation policies; independently validate opening/locking semantics with a real-play fixture before elevating any heuristic.

 
### 2026-10-23 21:52 (+04) — clockwise-opponent pass targeted geometry holdout
- Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`, branch opening provisional. Primary 3×9.
- Fresh discovery seeds: `1352940..1357439` and `1357440..1361939` (9,000 scanned); same-tile geometry changed-choice positions **only with previous clockwise-opponent pass**.
- Positions: **22**, hidden allocations: **5,632**, paired forced continuations: **11,264**; independent baseline rounds added: **0**. Strategies/continuations: min-hand-pips and closed-branch-control; joint pass-conditioned vs uniform unseen-tile placement on identical conditional worlds.
- All positions: joint−uniform finish-first **+4.74 pp**, exploratory position-level 95% half-width **±11.54 pp**; remainder **+0.17 pips**, immediate next pass **+0.07 pp**.
- Next-only n=13: finish-first **+11.21 pp** (±16.91 pp); both-history n=9: **−4.60 pp** (±12.80 pp). Profiles disagree: min-hand-pips n=11 **−5.50 pp** (±7.14 pp); closed-branch-control n=11 **+14.99 pp** (±20.67 pp).
- Validation: deterministic replay test passed; 22×256 conditional worlds and forced paired continuations completed with no unresolved outcomes. Recovered rule/branch semantics remain provisional.
- Finding: observed clockwise-opponent pass is **not** sufficient for a reliable universal choice rule; direction changes by bot and whether the other opponent also passed.
- Limitations: rare selected changed-choice states, correlated hidden worlds, exploratory intervals, provisional branch geometry, opponent policy-likelihood ignored, block winner unassigned; finish-first is not match win.
- Cumulative verified: **290,100** independent full continuations; **526,464** paired counterfactual continuations (previous 515,200 + 11,264); historical 4,000 excluded.
- Reproduce: `node qosha-research/simulator/pass-next-history-runner.js test`; `node qosha-research/simulator/pass-next-history-runner.js 1352940 4500 400 256 30`; repeat with start `1357440`.
- Run data: `runs/2026-10-23-2152-next-opponent-pass-geometry.json`; script: `simulator/pass-next-history-runner.js`.
- Next: fresh disjoint-seed validation of next-only vs both-history effects, whether immediate-pass gain predicts finish-first; validate branch locking/opening with a real-play fixture.


### 2026-10-23 22:53 (+04) — independent next-opponent-pass geometry holdouts
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, provisional branch-opening semantics; primary 3×9. V8 CommonJS deterministic replay regression passed (2 positions / 12 paired continuations).
- Fresh disjoint discovery seeds: `1361940..1366439` and `1366440..1370939`; **9,000** discovery seeds scanned. Matched same-tile geometry changed-choice positions with recorded clockwise-opponent pass; profiles `min-hand-pips` and `closed-branch-control`.
- **12 selected positions**, **3,072 conditional hidden allocations**, **6,144 forced paired continuations** (256 worlds per position), **0** new independent baseline rounds. Uniform hidden-tile choice versus joint pass-conditioned choice under identical hidden worlds and continuation policies.
- Overall joint−uniform finish-first: **+2.80 pp**, exploratory position-level 95% half-width **±12.82 pp**; remaining-pips improvement **−0.57** (negative means worse). Next-opponent-only history n=9: **−0.74 pp** (±15.95); both-opponents history n=3: **+13.41 pp** (±16.48). Min-hand-pips n=4: **+9.67 pp** (±10.95); closed-branch-control n=8: **−0.63 pp** (±18.50).
- Finding: **no statistically reliable new strategy rule**. Signs vary by bot and pass-history subgroup, and the selected sample is small. In particular, immediate next-pass gain was only +0.13 pp and does not establish downstream advantage.
- Confidence/limitations: targeted rare changed-choice positions, correlated hidden worlds, exploratory uncorrected normal intervals, fixed bots, uniform allocations conditioned on no-stock passes without opponent earlier action-likelihood, provisional branch rules, unassigned block winners; finish-first ≠ match win.
- Reproduce: `node qosha-research/simulator/pass-next-history-runner.js test`, then `node qosha-research/simulator/pass-next-history-runner.js 1361940 4500 400 256 30` and repeat with start `1366440`. Raw rows/seed-level summaries: `runs/2026-10-23-2250-next-pass-holdouts-1361940-1370939.json` (commit `19bdd060b3d7cb8315dc3e0a39ff344610a42113`).
- Verified cumulative: **290,100** independent full continuations unchanged; **532,608** paired counterfactual continuations (prior 526,464 + 6,144); historical 4,000 excluded.
- Exact next action: on fresh disjoint seeds, test whether immediate clockwise-opponent pass probability predicts finish-first; obtain a real-game locked/open branch fixture before elevating any pass-based recommendation.


### 2026-10-24 00:53 (+04) — independent same-stone next-pass tie-break holdouts

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; branch locking/opening still provisional. Main mode 3×9, later-round stock-1-1 handling. Deterministic replay regression passed (3 seeds, 36 continuations).
- Fresh disjoint seed cohorts **1371240..1371639** and **1371640..1372039**: **800 deals**, 2 opponent profiles × 3 focal seats × 2 policies = **9,600 full matched continuations**. No new sampled hidden-world counterfactual continuations. Policies: focal min-hand-pips baseline vs same-tile side tie-break maximizing exact hypergeometric next-opponent pass probability; opponent profiles min-hand-pips and closed-branch-control; same deals and seats for both.
- Fresh holdout 1 (400 deals): min-hand-pips finish-first **+1.00 pp** (exploratory seed-cluster ±1.20 pp), mean remainder **−0.03 pips**; closed-branch-control **+0.50 pp** (±0.73 pp), remainder **−0.05 pips**. Changed placements 233 and 127 respectively.
- Fresh holdout 2 (400 deals): min-hand-pips **+1.25 pp** (±1.18 pp), remainder **−0.11 pips**; closed-branch-control **+0.08 pp** (±0.63 pp), remainder **−0.076 pips**. Changed placements 227 and 127.
- Exploratory pooled analysis **only across the three same-code, disjoint-seed runs** (prior 300 deals 1370940..1371239 + new 800; **1,100 deals**, **13,200 full continuations**, **not** additional rounds): min-hand-pips **+1.03 pp ±0.74 pp**, remainder **-0.06 pips**; closed-branch-control **+0.55 pp ±0.47 pp**, remainder **-0.08 pips**. Computed by weighting each seed-cluster estimate by deal count; pooled half-width = sqrt(sum((n_i × halfwidth_i)^2))/sum(n_i). Same seeds across opponent profiles => profiles are not independent replications.
- Immediate next-opponent pass increased on changed placements: fresh cohorts min-hand-pips +17.17/+23.35 pp, closed-branch-control +27.56/+30.71 pp, **but finish-first gains are small**. The move-selection goal (forcing a pass) is not equivalent to maximizing round win probability.
- Finding/confidence: **no universal winning rule promoted**. Min-hand-pips gains have the same positive direction across three cohorts, but effect is small, exploratorily selected after earlier results, multiple hypotheses tested, and both pooled uncorrected exploratory intervals narrowly exclude zero; this is not confirmatory evidence because of prior hypothesis selection, multiple tests, and provisional branch semantics. Distinguish immediate next-pass prediction from final outcomes.
- Limitations: provisional locked/open branch interpretation; uniform unknown tiles not conditioned on earlier passes/action likelihood; one specific focal baseline and two fixed bots; no block winner assigned; finish-first ≠ match win; repeated opportunities within trajectories, exploratory uncorrected confidence intervals; no additional start/end-double stratification in this targeted run.
- Raw reproducible JSON: `runs/2026-10-24-0053-next-pass-tiebreak-independent-1371240-1372039.json`. Reproduce: `node qosha-research/simulator/next-pass-tiebreak-holdout.js test`; `node qosha-research/simulator/next-pass-tiebreak-holdout.js 1371240 400`; repeat with `1371640 400`. Historical 4,000 and all older engine cohorts excluded from this pooled estimate.
- Verified cumulative research scale: **303,300** full continuations (previous 293,700 + 9,600); **532,608** paired hidden-world counterfactual continuations unchanged; historical 4,000 excluded.
- Exact next hypothesis/action: create and validate a policy that only applies the next-pass tie-break when it does **not reduce focal player's post-action legal mobility**; test on fresh seeds 1372040+ against both original baseline and unrestricted pass tie-break. Obtain a real-game branch locking/opening fixture before promoting any general heuristic.


### 2026-10-24 01:45 (+04) — own-mobility guard vs unrestricted next-pass tie-break, fresh matched seeds
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; branch locking/opening remains provisional; primary 3×9. Deterministic replay regression passed (3 seeds, 54 continuations, **excluded** from research sample).
- Fresh disjoint seed range **1372040..1373239**: **1,200 deals**, 3 focal seats × 2 opponent profiles × 3 focal policies = **21,600 matched full continuations**; **0** new hidden-world counterfactual continuations. Policies: baseline `min-hand-pips`, unrestricted same-tile side tie-break maximizing exact uniform-hidden probability that clockwise opponent passes, and mobility-guarded tie-break allowing only moves with at least as many distinct playable remaining tiles as baseline. Opponents: `min-hand-pips` or `closed-branch-control`.
- Against min-hand-pips opponents (3,600 focal appearances/policy): baseline finish-first **32.25%**; unrestricted **33.72%**; guarded **33.86%**. Relative to baseline: unrestricted **1.47 pp ±0.69 pp**, guarded **1.61 pp ±0.58 pp** (uncorrected exploratory seed-cluster intervals).
- Against branch-control opponents: baseline **23.83%**, unrestricted **24.58%**, guarded **24.36%**. Relative to baseline: unrestricted **0.75 pp ±0.49 pp**; guarded **0.53 pp ±0.41 pp**.
- Finding: mobility guard **enforces nonnegative immediate own legal-tile mobility**, and reduces tie-break placements, but **does not consistently outperform unrestricted next-pass tie-break**: guarded−unrestricted finish-first is **0.14 pp** vs min-hand-pips opponents and **-0.22 pp** vs branch-control. Do **not** promote a universal rule. Passing the immediate next player is not a proven proxy for winning.
- Confidence/limitations: 1,200 matched fresh seeds and 3 independent discovery-free cohorts; confidence intervals exploratory/uncorrected and not pre-registered; correlated profiles; policy-specific bot outcomes; provisional branch semantics; exact hypergeometric next-pass model assumes uniform unknown allocation and ignores earlier opponent choices/passes; block winner unassigned; finish-first ≠ match win. Mobility counts *distinct playable remaining tiles*, not full future continuation value.
- Reproduce: `node qosha-research/simulator/next-pass-mobility-guard-holdout.js test`; `node qosha-research/simulator/next-pass-mobility-guard-holdout.js 1372040 1200`. Run data: `runs/2026-10-24-0145-next-pass-mobility-guard-1372040-1373239.json`.
- Verified cumulative: **324,900** full continuations (303,300 + 21,600), **532,608** paired hidden-world counterfactual continuations unchanged; historical 4,000 separate. This rerun aggregates the same 1,200 seeds; do not double-count the earlier 200/400/600 checks.
- Exact next hypothesis/action: isolate same-tile positions where preserving own mobility blocks an otherwise higher immediate pass chance; stratify by *second* opponent's newly playable tiles and by endgame hand size; run disjoint-seed confirmatory holdout. Seek real-play locked/open branch fixture before generalizing.


### 2026-10-24 02:51 (+04) — second-opponent reply access audit, fresh disjoint holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; **branch locking/opening remains provisional**. Primary mode 3×9.
- Fresh independent seeds **1373240..1373839**; **600 deals**, 3 focal seats × 2 opponent profiles × 3 focal policies = **10,800 full matched continuations**, 0 new hidden-world counterfactual continuations. Deterministic replay test passed (3 test seeds, 54 continuations excluded from counts).
- Strategies: focal min-hand-pips baseline, unrestricted exact next-pass same-stone side tie-break, and own-legal-tile mobility-guarded tie-break. Opponents: min-hand-pips and closed-branch-control. All policies share the same deal/seat/profile. No future or opponent-hand information enters policy decisions.
- Finish-first vs baseline, min-hand-pips opponents (1,800 focal appearances/policy): unrestricted **+0.72 pp ±0.95 pp**, guarded **+0.94 pp ±0.79 pp**. Branch-control opponents: unrestricted **+1.00 pp ±0.77 pp**, guarded **+0.89 pp ±0.65 pp**. Half-widths are exploratory, uncorrected 95% seed-cluster normal approximations. Final-pip deltas unrestricted/guarded: **−0.088/−0.106** and **−0.105/−0.074** respectively.
- NEW descriptive observation: among **565 unrestricted changed side placements** across both opponent profiles, second opponent's actual number of playable tiles **decreased 358 times**, **increased 24 times**, unchanged 183 times. Clockwise next opponent lost playable tiles in 399 placements; focal player's own mobility decreased in **207**. These are **within-policy event counts**, not independent trials or proof of match-win advantage. Audit reads actual hidden opponent hands *after choice* only; the policy never uses them.
- Mobility guard made 358 changed placements across both profiles, with **zero** immediate own-mobility losses by construction; no clear consistent win improvement over unrestricted (min-hand-pips +0.22 pp; branch-control −0.11 pp). First-change own-mobility-loss stratum under unrestricted had 114 and 77 focal appearances respectively; its finish-first deltas **−3.51 pp ±9.35** and **+3.90 pp ±10.03**: no reliable rule.
- Per-profile outcomes include finish-first, mean/median final pips, mean turns, block rates, −10/−20/−30/−40 counts, starting/ending doubles, first-change own/next/other access strata and early/late hand size in raw run data.
- Finding/confidence: **no reliable universal win heuristic yet**. A side choice that makes the next opponent less able to move also tends to restrict the second opponent under this model, but direct finish-first gains are small, exploratory, and not validated against real locked/open branch behavior.
- Limitations: branch semantics provisional; uniform unseen allocation without earlier choice likelihood; second-opponent access observed with full hidden information **only for audit**; repeated changes within rounds correlated; first-change strata selected; outcome comparisons include later divergence; no block winner; finish-first ≠ match win; no multiplicity adjustment. Historical 4,000 rounds excluded.
- Reproduce: `node qosha-research/simulator/next-pass-second-opponent-audit.js test`; `node qosha-research/simulator/next-pass-second-opponent-audit.js 1373240 600`. Raw summary: `runs/2026-10-24-0251-second-opponent-audit-1373240-1373839.json`.
- Verified cumulative: **335,700** full continuations (324,900 + 10,800); **532,608** paired hidden-world continuations unchanged.
- Exact next hypothesis/action: independently validate own-mobility-loss and second-opponent-access strata on disjoint seeds **1373840+**, ideally with a predeclared conditional tie-break; prioritize a real-play branch locking/opening fixture before promoting human recommendations.


### 2026-10-24 04:51 (+04) — conditional own-mobility sacrifice, fresh matched holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; **branch locking/opening provisional**; primary 3×9.
- Fresh disjoint seeds **1374640..1375239**: **600 deals**, 3 focal seats × 2 opponent profiles × 4 policies = **14,400 full matched continuations**, **0** new paired hidden-world continuations. Deterministic replay regression passed (3 seeds, 72 continuations, excluded from counts).
- Strategies: min-hand-pips baseline; unrestricted next-pass same-tile side tie-break; own-mobility guard; conditional-sacrifice gate. Gate allows loss of one or more immediately playable own tiles only when predicted clockwise-opponent pass gain ≥20 pp, second-opponent pass gain ≥15 pp, and combined expected opponent legal-tile reduction ≥1.5× own loss. Fixed thresholds before this fresh run, but exploratory in light of earlier related experiments. Opponent identities never used in decisions.
- Against min-hand-pips opponents (1,800 focal appearances per policy): conditional−baseline finish-first **+1.50 pp ±0.75 pp**, conditional−strict guard **+0.06 pp ±0.11 pp**; conditional accepted **6** mobility-sacrificing side choices. Strict guard−baseline +1.44 pp ±0.75 pp; unrestricted−baseline +1.22 pp ±0.85 pp.
- Against closed-branch-control opponents: conditional−baseline **+0.67 pp ±0.63 pp**, conditional−strict guard **+0.06 pp ±0.24 pp**; conditional accepted **21** mobility sacrifices. Strict guard−baseline +0.61 pp ±0.56 pp; unrestricted−baseline +0.39 pp ±0.71 pp.
- Finding: thresholded sacrifice only rarely differs from strict guard (**27 accepted sacrifices** across both opponent profiles); tiny +0.06 pp point estimate vs guard in each profile is within exploratory uncertainty. **No reliable new universal rule.** Relative to baseline, side tie-break policies sometimes improve finish-first, but the observed effect cannot yet be generalized.
- Confidence/limitations: matched seed clusters; normal 95% half-widths exploratory and uncorrected for multiple hypotheses; fixed bots, provisional branch semantics, uniform unseen allocations without prior-action likelihood, no block winner, finish-first ≠ match win. Actual opponent hands read only after decision for audit.
- Runner: `simulator/next-pass-sacrifice-threshold-holdout.js`; run data: `runs/2026-10-24-0451-conditional-sacrifice-1374640-1375239.json`. Reproduce with `node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js test` and `node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js 1374640 600`.
- Verified cumulative: **364,500** full continuations (**350,100** through prior 03:55 holdout + 14,400 fresh); **532,608** paired hidden-world continuations unchanged; historical 4,000 separate. The prior 03:55 run `runs/2026-10-24-0355-second-opponent-audit-holdout-1373840-1374639.json` was persisted but not reflected in RESULTS/STATUS; reconciled here without double counting.
- Exact next hypothesis/action: retest conditional sacrifice vs strict guard on independent seeds **1375240+**, stratifying by loss magnitude and next-pass gain; seek real-play locked/open branch fixture before human recommendations.



### 2026-10-24 05:56 (+04) — independent conditional-sacrifice vs strict mobility-guard holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; **four-branch locking/opening still provisional**; primary 3×9.
- Fresh, disjoint seeds **1375240..1376039**: **800 deals**, 3 focal seats × 2 opponent profiles × 4 policies = **19,200 matched full continuations**; 0 new hidden-world paired continuations. 3-seed deterministic replay and policy guard regression passed (72 continuations excluded); same-seed repeat deterministic.
- Preexisting, unchanged policy thresholds: next-player pass gain ≥20 pp, second-player pass gain ≥15 pp, and combined expected opponent legal-tile reduction ≥1.5× own mobility loss. Compared baseline min-hand-pips, unrestricted same-tile side choice, strict own-mobility guard, and conditional-sacrifice. Opponents: min-hand-pips or closed-branch-control. Same deal, seat and opponent profile across policies; no hidden opponent hands used for action selection.
- Against `min-hand-pips` opponents (2400 appearances per policy): conditional−guard finish-first **0.00 pp ±0.20 pp** (exploratory uncorrected seed-cluster 95% half-width); conditional−baseline **0.50 pp ±0.70 pp**; conditional accepted **10** own-mobility sacrifices, changed **344** placements vs guard's **336**; conditional−guard mean final pips **-0.01**.
- Against `closed-branch-control` opponents (2400 appearances per policy): conditional−guard finish-first **0.04 pp ±0.18 pp** (exploratory uncorrected seed-cluster 95% half-width); conditional−baseline **0.79 pp ±0.55 pp**; conditional accepted **18** own-mobility sacrifices, changed **179** placements vs guard's **160**; conditional−guard mean final pips **-0.01**.
- Finding: **no reliable universal benefit from sacrificing own legal moves**; comparisons are small/uncertain and the accepted-sacrifice subset is sparse. These are finish-first probabilities, **not** full match win rates.
- Confidence/limitations: independent deterministic matched seeds; seed-cluster intervals exploratory and uncorrected for multiple looks; conditional thresholds selected during prior exploration, simple deterministic bots, uniform hidden allocation without prior-action likelihood, branch rules provisional, block winner unassigned, no −30/−40 event inference from rare counts. Per-mode pips, medians, turn lengths, block/minus rates, starting/ending doubles and action audit are in linked JSON.
- Reproduce: `node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js test`; `node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js 1375240 800`. Run data: `runs/2026-10-24-0554-conditional-sacrifice-1375240-1376039.json`.
- Verified cumulative: **383,700** full continuations; **532,608** paired hidden-world continuations unchanged; historical 4,000 separate.
- Exact next action: independently audit accepted-sacrifice cases by own-mobility loss, both opponents' immediate access and late-game hand size; do not retune thresholds on this holdout. Seek real-game four-branch opening/locking fixture.


### 2026-10-24 06:53 (+04) — accepted-sacrifice event-level audit, independent matched seeds
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; four-branch locking/opening **still provisional**. Primary mode 3×9. New deterministic audit runner and regression tests passed (3 test seeds, 36 continuations, excluded from sample); replay cross-checks existing guard/conditional runner.
- Fresh disjoint seeds **1376040..1377639**: **1,600 deals**, 3 focal seats × 2 opponent profiles × 2 focal policies = **19,200 full matched continuations**; **0** new sampled hidden-world counterfactual continuations. Policies: strict own-mobility guard versus unchanged conditional-sacrifice threshold (next pass gain ≥20 pp; other pass gain ≥15 pp; expected combined opponent legal-tile reduction ≥1.5× own loss). Opponents: min-hand-pips and closed-branch-control. Actual opponent hands are used **only after policy choice for audit**.
- Min-hand-pips opponents (4,800 appearances/policy): conditional−guard finish-first **+0.042 pp ±0.116 pp** (exploratory uncorrected seed-cluster 95% half-width), mean final-pips delta **−0.0017**. **30** accepted-sacrifice events on 30 distinct seed/seat trajectories: own immediately playable tiles lost =1 in all 30; actual next-opponent access reduced 27/30; second-opponent access reduced 25/30; **both** reduced 22/30.
- Closed-branch-control opponents (4,800 appearances/policy): conditional−guard finish-first **+0.083 pp ±0.129 pp**, mean final-pips delta **−0.0069**. **37** accepted events on 37 trajectories / 36 distinct seeds: own loss =1 in all 37; actual next access reduced 35/37; second access reduced 33/37; **both** reduced 31/37.
- Across profiles: **67 accepted sacrifices** (not independent observations; same seeds tested against two bot profiles); **53** events restricted both opponents' immediate playable tiles. Endgame focal hand size ≤3 at **18/67** events; 4–6 at **36/67**; ≥7 at **13/67**. Conditional vs guard policy only diverged at these rare accepted choices. No cases of 2+ own-tile mobility loss were accepted in this holdout.
- **Finding:** the gate usually restricts both opponents when it sacrifices one own legal tile, but **no statistically reliable finish-first benefit** over the strict guard. The large selected-event-only outcome deltas (+6.7 pp / +10.8 pp) are *post-selection descriptive*, based on just 30/37 affected trajectories, and must not be promoted as causal or universal advice.
- Confidence/limitations: matched independent seeds, exploratory uncorrected intervals; threshold was chosen in earlier exploration, correlated profiles, simple bots, uniform hidden allocation ignoring prior actions, provisional branch semantics, no block winner, finish-first ≠ match victory. Rare-event counts do not support generalizing to ≥2 lost own moves or to −30/−40 outcomes. Historical 4,000 separate.
- Reproduce: `node qosha-research/simulator/sacrifice-event-audit.js test`; `node qosha-research/simulator/sacrifice-event-audit.js 1376040 1600`. Full event rows and all per-policy pips/medians/turns/block/minus/doubles: `runs/2026-10-24-accepted-sacrifice-event-audit-1376040-1377639.json`.
- Verified cumulative: **402,900** independent full continuations (**383,700 + 19,200**); **532,608** paired sampled hidden-world counterfactual continuations unchanged; historical 4,000 excluded.
- Exact next action: prioritize a real-play fixture for four-branch opening/locking. Then predeclare a **late-game (≤3 stones) sacrifice-vs-guard** matched hidden-world continuation study on fresh seeds **1377640+**, without retuning thresholds or using actual opponent hands for decisions.


### 2026-10-24 07:47:35 (+04) — independent late-game accepted-sacrifice audit (≤3 stones)
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; **four-branch locking/opening provisional**. Executed deterministic replay and prior-run regression (36 test continuations, excluded).
- Fresh disjoint seeds **1377640..1380039**: **2400 deals**, 3 focal seats × 2 opponent profiles × 2 policies = **28800 matched full continuations**. **0** new sampled hidden-world counterfactual continuations. Opponents: min-hand-pips and closed-branch-control; focal policies: strict own-mobility guard vs unchanged conditional-sacrifice thresholds (next pass gain ≥20 pp, other pass gain ≥15 pp, combined expected opponent legal reduction ≥1.5× own loss).
- Accepted sacrifices across profiles: **106**, including **30** with ≤3 focal stones. Late-game stratification is descriptive and selected on conditional-policy actions; no hidden opponent hands used in decisions. Matched full-trajectory counterfactuals share seed/seat/opponents but diverge after the chosen move.
- Min-pips opponents: conditional−guard finish-first **-0.028 pp ±0.094 pp** (uncorrected exploratory seed-cluster half-width); late accepted events **11**, with 1 favorable / 1 unfavorable / 9 unchanged finish-first outcomes.
- Branch-control opponents: conditional−guard finish-first **0.083 pp ±0.115 pp**; late accepted events **19**, with 4 favorable / 3 unfavorable / 12 unchanged outcomes.
- Finding/confidence: **no reliable new universal rule** from rare late accepted sacrifices. This run did not sample hidden worlds, so it is not a real-position Monte Carlo validation. Both opponent profiles reuse the same seeds; events within trajectories and across profiles are correlated; selection and multiple looks, fixed bots, provisional branches, uniform unknown-tile model, unassigned block winner, finish-first ≠ match win. Per-policy pips/median/turn/block/minus/starting/ending doubles and all accepted event rows are in linked JSON.
- Reproduce: `node qosha-research/simulator/sacrifice-event-audit.js test`; `node qosha-research/simulator/sacrifice-event-audit.js 1377640 2400`. Event/strata data: `runs/2026-10-24-0746-late-sacrifice-audit-1377640-1380039.json`.
- Verified cumulative: **431700** full continuations, **532,608** paired hidden-world counterfactual continuations unchanged; historical 4,000 separate.
- Exact next hypothesis/action: build a matched hidden-world Monte Carlo study from *pre-action* late-game states (≤3 focal stones) and compare all legal side placements with fixed opponent continuation policies on identical hidden allocations, stratified by both opponents' immediate legal access; independently validate branch-opening fixture before promoting human advice. Fresh seeds **1380040+**.


### 2026-10-24 08:47 (+04) — pre-action late-game all-side hidden-world Monte Carlo + independent holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch locking/opening remains **provisional**. New reproducible `simulator/late-side-mc.js`; deterministic replay test plus 8 existing invariant/regression suites passed in V8 CommonJS harness (Node CLI not run).
- Method: at first reachable **pre-action** focal hand size 2–3 with 2+ legal placements of the **same ordinary tile**, hash-select tile group and compare **all legal side placements**. Fix visible hand/played tiles, condition hidden allocations on recorded no-stock passes, force each candidate in **identical hidden worlds** with fixed continuation policy. Compare highest own remaining individually playable stones (own mobility) versus lowest visible-uniform expected next-opponent legal access (next risk). Actual opponent hands only audited **after** candidate selection; never used to choose. No full strategy rounds credited from discovery.
- Discovery seed window **1380040..1381839** (max 1800; stopped at 80 selected positions/profile, scanning 58 min-pips and 59 branch-control seeds): **160 positions**, **15360 matched hidden allocations**, **37728 forced candidate continuations**, 96 worlds/position. Own-mobility minus next-risk finish-first: min-pips **+2.005 pp ±2.249 pp** (exploratory uncorrected position-cluster 95% half-width), branch-control **+0.182 pp ±2.225 pp**. Policy recommendations disagreed at 13/80 and 8/80 positions.
- Independent holdout seed window **1381840..1383639** (max 1800; scanned 50 min-pips and 64 branch-control seeds): **160 positions**, **15360 matched hidden allocations**, **35808 forced candidate continuations**. Own minus risk finish-first: min-pips **+1.367 pp ±1.536 pp**, branch-control **+0.026 pp ±1.791 pp**; discordant at 17/80 and 15/80 positions. On discordant holdout states: min-pips +6.434 pp ±6.853 pp (n=17); branch-control +0.139 pp ±9.824 pp (n=15). This is **not** a confirmed benefit.
- Finding: **no reliable new human-useful rule**. In most late-game positions the two visible-only tie-breaks choose the same placement; where they differ, the independent holdout is noisy and opponent-policy-dependent. Do not promote the discovery-only stronger conditional effects. Finish-first is not match victory.
- Stored per-position: seed/seat/turn, hand size, opponent sizes, raw-deal starting doubles, opened numbers, branch ends, prior pass constraints, every legal candidate side, post-action own mobility, visible next-access estimate, mean and median remaining pips, finish-first, minus-finish counts, block/turn/ending-double averages, observed opponent access, and decision regret against the best sampled candidate. Run data: `runs/2026-10-24-0847-late-side-mc-discovery-1380040.json` and `runs/2026-10-24-0847-late-side-mc-holdout-1381840.json`.
- Reproduce: `node qosha-research/simulator/late-side-mc.js test`; `node qosha-research/simulator/late-side-mc.js 1380040 1800 80 96`; `node qosha-research/simulator/late-side-mc.js 1381840 1800 80 96`. These windows are disjoint; max seed ranges are not claims that every seed was examined.
- Confidence/limits: matched deterministic worlds, but only 320 selected positions and 53 discordant; worlds within position correlated; first-eligible selection, no multiplicity correction, fixed simplistic bot continuations, pass-conditioned uniform unseen allocation ignores earlier opponent choice likelihood, no assigned block winner, four-branch rule still provisional. Existing rules were not altered; no external real-game locking fixture was supplied.
- Verified cumulative: **431700** independent full continuations unchanged; **606144** sampled hidden-world forced counterfactual continuations (**532608 + 37728 + 35808**); **30720** new matched hidden allocations. Historical 4000 separate.
- Exact next hypothesis/action: predeclare and oversample **discordant** pre-action 2–3-stone same-tile placements on disjoint seeds **1383640+**, >=256 matched worlds/position, and compare at least two continuation policies; independently obtain/validate a real four-branch locked/open fixture before offering human advice.

### 2026-10-24 09:50 (+04) — independent discordant-only late side holdout
- Engine: `qosa-research-0.5.3`; recovered `qosa-1.0.0`; 3 players × 9 stones; four-branch opening **provisional**.
- New deterministic runner: `simulator/late-discordant-holdout.js` (V8 CommonJS determinism test passed; Node CLI not run). Actual **261 unique deals** examined, seeds **1383640..1383900**; requested scan envelope 1383640..1385839, but early-stop candidate cap prevented scanning the whole envelope. 640 preselected positions, 113 discordant found; first 40 per continuation policy retained.
- **80 discordant positions**, **256 matched hidden allocations per position** = **20480 hidden allocations**, **40960 forced counterfactual continuations**, zero new full-tournament rounds. Candidate actions differ only by legal side of the same ordinary tile. Compare maximizing immediate own playable stones against minimizing visible-uniform expected next-opponent legal tiles.
- `min-hand-pips` continuation: own-minus-risk finish-first **+2.861 pp**, exploratory position-cluster 95% half-width **±6.143 pp**; mean remaining pips **+0.047**, block rate **−23.076 pp**. Hand size 2: **+13.522 pp** (13 positions); hand size 3: **−2.271 pp** (27 positions).
- `closed-branch-control` continuation: own-minus-risk finish-first **+1.699 pp**, exploratory half-width **±7.570 pp**; mean remaining pips **+0.006**, block rate **−20.332 pp**. Hand size 2: **+16.264 pp** (11 positions); hand size 3: **−3.825 pp** (29 positions).
- Finding: **no statistically reliable overall strategy advantage**. An apparent 2-stone versus 3-stone sign reversal is *exploratory* and was not preregistered; test on fresh seeds before any human advice. Both continuations show lower block frequency when preserving own mobility, but blocks have no assigned winner and cannot be treated as wins.
- Limits: correlated positions/worlds, selection on discordance, fixed simple bots, conditional-uniform hidden opponent distribution with no policy-choice likelihood, first-eligible trajectories, provisional four-branch semantics, no match/block winner or multiplicity correction. Finishing first is not winning the 101-point match.
- New data: `runs/2026-10-24-0950-late-discordant-holdout-1383640.json`. Reproduce: `node qosha-research/simulator/late-discordant-holdout.js test`; `node qosha-research/simulator/late-discordant-holdout.js 1383640 2200 40 256`.
- Verified cumulative: **431700** independent full continuations unchanged; **647104** forced hidden-world counterfactual continuations (**606144 + 40960**); historical 4000 excluded.
- Exact next hypothesis/action: preregister hand-size interaction (own-mobility advantage for 2 stones, not 3), test on fresh disjoint seeds **>=1385840** with >=256 matched worlds per discordant position and two continuation policies; independently validate authentic locked/open four-branch fixture.


### 2026-10-24 10:53 (+04) — preregistered independent 2-vs-3 stone late-side holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; four-branch locking/opening **provisional**. Existing late-side and discordant deterministic replay tests passed in V8 CommonJS; Node CLI not run.
- Fresh requested seed envelope **1385840..1388039**, but early-stop cap scanned only **265 unique deals** (actual seeds **1385840..1386104**). First reachable 2–3-stone same-ordinary-tile multiple-side choice, selected only when own-mobility and visible next-risk policies disagree. **101 discordant positions** (61 min-pips / 40 branch-control), **25,856 matched hidden allocations**, **51,712 forced counterfactual continuations** (256 worlds/position), **0 new full-round baseline continuations**.
- Preregistered hypothesis: own-mobility tie-break helps with **2 stones** but not with **3 stones**; test interaction = (own-minus-risk finish-first delta at 2) − (delta at 3). Result (exploratory uncorrected position-cluster 95% half-width):
  - `min-hand-pips`: 2 stones **+4.88 pp ±6.87** (n=14), 3 stones **+4.26 pp ±9.36** (n=47); interaction **+0.63 pp ±11.61**.
  - `closed-branch-control`: 2 stones **+18.97 pp ±22.24** (n=9), 3 stones **+3.81 pp ±11.80** (n=31); interaction **+15.16 pp ±25.17**.
  - Overall own-minus-risk: **+4.40 pp ±7.36** and **+7.22 pp ±10.48**, respectively.
- **Finding:** the previously observed *sign reversal* (2 stones favor own mobility, 3 stones favor next-risk) **did not replicate**; both 3-stone estimates are positive but uncertain. No reliable universal rule or robust hand-size interaction. Own-mobility strongly reduced simulated blocks in these selected states, but block winner is unassigned, so block reductions cannot be called wins.
- Method: same visible state and focal hand, pass-conditioned uniform hidden worlds, identical candidate-specific continuation policies, no opponent-hand leakage into choices; same-tile different-side comparisons. Opponent profiles share some seeds, and within-position worlds are correlated. First-eligible/discordant selection, opponent-size/branch-state confounding, provisional branch rules, no prior-opponent-action likelihood, no block/match winner, multiple looks and wide exploratory CIs. **Finish-first is not 101-point match victory.**
- Reproduce: `node qosha-research/simulator/late-discordant-holdout.js test`; `node qosha-research/simulator/late-discordant-holdout.js 1385840 2200 80 256` (existing runner hardcodes older timestamp; stored data normalized to 10:53 and adds preregistered hand-size interaction). Data: `runs/2026-10-24-1053-late-discordant-hand-size-1385840.json`.
- Verified cumulative: **431,700** independent full continuations unchanged; **698,816** forced hidden-world counterfactual continuations (**647,104 + 51,712**); historical 4,000 excluded.
- Exact next hypothesis/action: test hand-size interaction on fresh **>=1388040** with matching/stratification on both opponent hand sizes and opened branches; separately validate authentic locked/open four-branch fixture before human advice.

### 2026-10-24 11:50 (+04) — independent opponent-size/opened-number stratified late-side holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; four-branch locking/opening **provisional**. Deterministic V8 CommonJS replay test passed; Node CLI not run.
- Requested fresh seed envelope **1388040..1390239**; early-stop actual **266 unique deals** scanned, seeds **1388040..1388305**. First 320 eligible positions per profile, then all discordant positions: **112** (68 min-hand-pips, 44 closed-branch-control). **28,672 matched hidden allocations**, 256 per position; **57,344 forced paired continuations**, 0 new full baseline rounds, no unresolved.
- Compared the legal side of the SAME ordinary tile maximizing immediate own mobility against the side minimizing uniform-visible next-opponent legal tiles. Both actions evaluated on the same pass-conditioned hidden worlds with identical continuation bot.
- Own-mobility minus next-risk finish-first: **+6.40 pp ±10.12 pp** (min-pips), **+0.89 pp ±8.23 pp** (branch-control); exploratory position-cluster 95% half-widths, no reliable overall advantage. Mean remainder difference **−0.364 / +0.333 pips**; block frequency **−22.60 / −28.93 pp** respectively, but block winner unassigned.
- Hand-size 2 vs 3, min-pips: **+10.48 pp (n=24)** vs **+4.17 pp (n=44)**; branch-control: **+7.20 pp (n=14)** vs **−2.06 pp (n=30)**. Unadjusted interactions +6.31 / +9.26 pp, uncertain.
- Exact matching on **both opponents' hand sizes and openedNumbers count**: min-pips **9 overlapping strata, 54 positions, 20 effective pairs**, descriptive weighted 2-minus-3 interaction **+9.15 pp**; branch-control **5 overlapping strata, 23 positions, 9 effective pairs**, **+7.12 pp**. **No corrected confidence interval for these sparse-cell contrasts**; do not treat as a validated rule.
- Geometry audit: all 112 selected states have 4 engine `active` sides. `openedNumbers` is 7 for 92 states and 6 for 20; this is **not** independent verification of actual locked/open four-branch mechanics. There is little late-stage opened-number variation.
- Finding: **no statistically reliable human-usable side-choice rule**. Opponent-size adjustment does not settle the 2-vs-3 interaction; earlier sign reversal remains unconfirmed.
- Limits: selected rare discordant states, correlated positions/worlds, exploratory uncorrected intervals, fixed simple bots, conditional-uniform unseen allocation without prior-action likelihood, provisional branch opening, no block winner or match scoring. Finish-first ≠ winning the 101-point match.
- Reproduce: `node qosha-research/simulator/late-opponent-strata-holdout.js test`; `node qosha-research/simulator/late-opponent-strata-holdout.js 1388040 2200 80 256`. Data: `runs/2026-10-24-1150-late-opponent-strata-1388040.json`.
- Verified cumulative: **431,700** independent full continuations unchanged; **756,160** forced hidden-world counterfactual continuations (698,816 + 57,344). Historical 4,000 separate.
- Exact next hypothesis/action: obtain a genuine four-branch locked/open fixture; increase exact opponent-size-matched cells on disjoint seeds >=1390240, then validate block/match scoring before claiming win benefits.


### 2026-10-24 12:51 (+04) — four-side kernel checks and fresh late-side opponent-size holdout
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9. Four-branch opening/locking **still provisional**. Added and executed `simulator/four-branch-lock-kernel-test.js` in a V8 CommonJS harness: four independent ends, inactive sides, locked/unlocked number, 24 valid four-double finish sequences and synthetic **−40** finish all passed. This is **not** an authentic real-game locking fixture. Existing late-opponent-strata replay regression passed; Node CLI not executed.
- Requested disjoint seed envelope **1390240..1392439**; actual **248 unique deals** examined, seeds **1390240..1390487** (early-stop candidate cap). **109 discordant late-game positions** (58 min-hand-pips, 51 closed-branch-control), **27,904 matched pass-conditioned hidden allocations**, **55,808 forced counterfactual continuations** (256 worlds/position), **0 new full strategy rounds**. Same ordinary tile, different legal side; own immediate mobility versus minimizing visible-uniform next-opponent legal access.
- Own-mobility minus next-risk finish-first: min-pips **+1.68 pp ±6.89 pp**, branch-control **−1.64 pp ±6.90 pp** (exploratory uncorrected position-cluster 95% half-width). Block rate deltas **−16.10 pp / −25.20 pp**, but block winner remains unassigned; cannot call these wins.
- Exact (both opponent hand sizes, opened-number count) matching for 2-vs-3 focal stones: min-pips **5 overlapping strata, 6 effective pairs**, descriptive interaction **+9.67 pp**; branch-control **6 strata, 10 pairs**, **−0.51 pp**. Too sparse for a reliable rule, no corrected confidence intervals. The interaction differs by opponent policy.
- Finding: **no reliable new human-play strategy rule**. Kernel four-side invariants pass but cannot settle real branch locking; selection on discordance, correlated positions/worlds, simplistic bots, uniform unseen allocation conditioned on passes, no prior-action likelihood, unassigned block/match winner and multiplicity limit inference. Finish-first is not winning a 101-point match.
- Reproduce: `node qosha-research/simulator/four-branch-lock-kernel-test.js`; `node qosha-research/simulator/late-opponent-strata-holdout.js test`; `node qosha-research/simulator/late-opponent-strata-holdout.js 1390240 2200 80 256` (runner has an older embedded timestamp; run JSON normalized to this checkpoint). Data: `runs/2026-10-24-1251-late-opponent-strata-1390240.json`.
- Verified cumulative: **431,700** independent full continuations unchanged; **811,968** forced hidden-world counterfactual continuations (756,160 + 55,808); historical 4,000 excluded.
- Exact next action: obtain an authentic locked/open four-branch real-game fixture; validate block winner and 101-point match scoring before claims of match win advantage; only pursue hand-size interaction on sufficiently populated exact matched strata using disjoint seeds >=1392440.

### 2026-10-24 13:53 (+04) — scoring contract audit and fresh matched strategy baseline
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9. **Four-branch opening/locking provisional**.
- Added `simulator/scoring-contract-test.js`: **1,056 passing assertions** (V8 CommonJS harness; Node CLI not run). Verified 3-pass empty-stock block, 5-player generic pass threshold, 0-0 zero-pip block with **no inferred winner**, finish precedence and −10/−20/−30/−40 classification, and 1,010 score-floor cases. **Block winner, loneZero=10, bust=101 and 101-point match winner remain unresolved**, so no match-winning claim.
- Fresh disjoint seeds **1392440..1395439**: **3,000 deals × 3 seat rotations = 9,000 matched full continuations**, 8,632 finishes, 368 blocks (**4.09%**), 0 unresolved; no new hidden-world forced counterfactual continuations. Strategies: random-legal, min-hand-pips, fast-doubles.
- Finish-first rates: **38.47% / 35.19% / 22.26%**, respectively. Mean remaining pips: **5.55 / 3.55 / 5.16**; medians **4 / 3 / 4**. −10 finishes: **199 / 307 / 35**; −20: **3 / 2 / 0**; no −30/−40 observed. Mean round length **24.33** turns.
- Across 30 disjoint 100-seed clusters, random minus min-pips finish-first **+3.28 pp ±1.33 pp** (exploratory 95% cluster half-width); min-pips minus random mean remainder **−2.00 ±0.14 pips**. These are **different objectives**, not a general human-play superiority rule. Only one bot triad, correlated seat rotations, provisional branches, and block/match scoring unvalidated.
- Reproduce: `node qosha-research/simulator/scoring-contract-test.js`; `node -e "const r=require('./qosha-research/simulator/strategy-runner'); console.log(JSON.stringify(r.runMatchedBaseline({startSeed:1392440,count:3000,maxTurns:200}),null,2))"`. Detailed data and exact confidence formula: `runs/2026-10-24-1353-scoring-baseline-1392440.json`.
- **Verified cumulative:** **440,700** independent full continuations (**431,700 + 9,000**); **811,968** forced hidden-world counterfactual continuations unchanged. Historical 4,000 separate.
- **Exact next action:** obtain authentic four-branch locking fixture and resolve block-winner/loneZero/bust semantics before 101-point match scoring; test the finish-first versus remaining-pips tradeoff with additional opponent profiles on disjoint seeds **>=1395440**.

### 2026-10-24 14:55 (+04) — four matched opponent profiles, direct closed-branch-control comparison
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3 players × 9 stones, 1 stock. **Authentic four-branch locking/opening remains provisional.** No engine or scoreboard/PWA changes.
- Fresh independent seed set **1395440..1398439** (3,000 distinct deals), each reused in **four** three-policy triads with all 3 seat rotations: **36,000 new full-round continuations**, **34,667 finishes**, **1,333 blocks** (3.70%), **0 unresolved**. Each triad has 9,000 matched rounds; across triads the same seeds are intentionally shared, so 36,000 runs are **not** 36,000 independent deals. No new hidden-world counterfactual continuations.
- Finish-first %, mean/median final remaining pips, minus counts by strategy (counts are for 9,000 appearances each):
  1. `random-legal / min-hand-pips / fast-doubles`: finish-first **37.68 / 36.06 / 22.00%**; mean pips **5.605 / 3.551 / 5.116**; medians **5 / 2 / 4**; −10 **211 / 326 / 34**, −20 **2 / 7 / 0**; 384 blocks, mean 24.339 turns.
  2. `random-legal / min-hand-pips / moderate-double-hold`: finish-first **30.40 / 30.90 / 34.94%**; mean pips **7.182 / 4.376 / 3.956**; medians **6 / 3 / 3**; −10 **178 / 292 / 380**, −20 **3 / 5 / 10**; 338 blocks, mean 24.387 turns.
  3. `random-legal / min-hand-pips / closed-branch-control`: finish-first **27.81 / 27.09 / 41.51%**; mean pips **7.894 / 5.352 / 3.662**; medians **7 / 4 / 2**; −10 **162 / 211 / 891**, −20 **3 / 4 / 36**, −30 **0 / 0 / 2**; 323 blocks, mean 25.350 turns.
  4. **Direct head-to-head** `closed-branch-control / moderate-double-hold / min-hand-pips`: finish-first **39.80 / 29.89 / 27.11%** (wins **3582 / 2690 / 2440**); mean pips **3.827 / 5.128 / 5.423**; medians **2 / 3 / 4**; −10 **1049 / 454 / 328**, −20 **49 / 9 / 7**, −30 **3 / 1 / 0**, −40 **0 / 0 / 0**; 288 blocks, mean 25.183 turns.
- Direct triad exploratory paired seed-cluster intervals: 30 nonoverlapping clusters of 100 seeds, Student-t(29) 95% half-widths. Closed-branch-control minus moderate-double-hold finish-first **+9.91 percentage points ±1.55 pp**; versus min-hand-pips **+12.69 pp ±1.35 pp**; mean remainder versus moderate-double-hold **−1.301 ±0.125 pips**. Seat rotations and opponent profiles are matched within clusters. Intervals uncorrected for multiple looks.
- **Finding (simulator-only):** the built-in `closed-branch-control` policy (prefers ordinary moves over opening a new double when both are available; when forced to open, prefers fewer doubles) strongly outperformed the two other heuristics in the **direct** 3-way contest, and also produced more −10/−20 finishes. This is a reproducible *candidate* heuristic, **not** yet a validated human-game rule: the provisional number-lock model may specifically reward delaying openings.
- Regression: previous 1392440..1395439 baseline exactly replayed **8632 finishes, 368 blocks, wins 3462/3167/2003**; deterministic replay of 20 new seeds passed; scoring-contract **1,056 assertions passed** and synthetic four-side/−40 kernel fixture passed in V8 CommonJS (Node CLI not run). Historical baseline not mixed.
- Limitations: branch lock/unlock behavior lacks an authentic real-table fixture; opening follow-up is a deterministic default, and `previousWinnerIndex=seed%3` is synthetic when 1-1 is in stock; simple deterministic bots, fixed three-player environment, correlated seat rotations and shared seeds across triads, no block winner, `loneZero=10` and `bust=101` unresolved, no complete-match outcome. Finish-first is **not** victory in a 101-point match.
- Reproduce with repository Node.js: `node -e "const r=require('./qosha-research/simulator/strategy-runner'); for(const s of [['random-legal','min-hand-pips','fast-doubles'],['random-legal','min-hand-pips','moderate-double-hold'],['random-legal','min-hand-pips','closed-branch-control'],['closed-branch-control','moderate-double-hold','min-hand-pips']]) console.log(JSON.stringify(r.runTournament({strategies:s,startSeed:1395440,count:3000,maxTurns:200})))"`; `node qosha-research/simulator/scoring-contract-test.js`; `node qosha-research/simulator/four-branch-lock-kernel-test.js`.
- **Verified cumulative:** **476,700 full continuations** (440,700 + 36,000); **811,968 forced hidden-world counterfactual continuations** unchanged; historical 4,000 separate. **Seed set consumed through 1398439**.
- **Exact next hypothesis/action:** isolate *delayed number-opening* as a single change against a matched, otherwise identical pip-based chooser; test on independent seeds **>=1398440** with opponent profiles including `closed-branch-control` itself. Audit early-game branch end/opened-number distributions and demand an authentic locked/open real-game fixture before converting the apparent large gain into advice. Keep 101-point match scoring gated until block-winner, loneZero and bust are confirmed.

### 2026-10-24 15:53 (+04) — isolated early-vs-late double-opening ablation
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary **3×9**, stock=1; **four-branch number-lock model remains provisional and is NOT an authenticated table rule**. Added `simulator/opening-timing-ablation.js` with deterministic tests for the exact action-family contrast, same choice when no conflict, mixed-finish precedence, and a 100-seed replay (900 continuations). V8 CommonJS harness passed; Node CLI not executed.
- Hypothesis, specified before fresh run: holding a number-opening double when a legal ordinary tile exists is better than opening immediately, **all else equal**. Two new policies `pip-late-opening` and `pip-early-opening` both maximize immediate removed pips and use the same deterministic tie-break; **the only difference** is preference for `single` vs `double-sequence` when both families are available. Both prioritize `mixed-finish`. A third bot is `min-hand-pips`, `closed-branch-control`, or `random-legal`.
- Fresh, nonoverlapping seed set **1398440..1400839**: **2,400 unique deals**, 3 opponent profiles × 3 seat rotations = **21,600 full-round continuations** (7,200/profile). 20,733 finishes, 867 blocks (**4.01%**), **0 unresolved**; **0** new forced hidden-world counterfactual continuations. Same 2,400 deals intentionally reused across profiles; do **not** count as 21,600 independent deals. Opening-followup default, synthetic `previousWinnerIndex=seed%3` when 1-1 in stock.
- Results by opponent profile, each experimental strategy appearing 7,200 times; rates = **finish first, NOT win 101-point match**:
  - Against `min-hand-pips`: late **52.58%**, early **15.72%**, third **27.86%**; late minus early **+36.86 pp ±1.84 pp** (24 seed clusters × 100 deals, exploratory uncorrected 95% t half-width). Mean final pips **2.714 / 7.197 / 4.793**, medians **0 / 6 / 3**; late minus early mean pips **−4.482 ±0.169**. Round mean **23.914** turns; **276** blocks. Late minus finishes: −10 **556**, −20 **23**, −30 **1**, −40 **0**; early: **38/1/0/0**. Mixed-family opportunities late **15,802** (opened early **0**), early **9,526** (opened early **9,526**).
  - Against `closed-branch-control`: late **45.03%**, early **14.63%**, third **36.44%**; late minus early **+30.40 pp ±1.31 pp**. Mean final pips **4.029 / 8.034 / 4.278**, medians **2 / 7 / 3**; pip delta **−4.006 ±0.150**. Round mean **25.007** turns; **281** blocks. Late minus finishes **461/29/1/0**, early **26/1/0/0**. Mixed-family opportunities late **13,717** (0 immediate openings), early **8,355** (all opened).
  - Against `random-legal`: late **51.79%**, early **15.49%**, third **28.42%**; late minus early **+36.31 pp ±1.30 pp**. Mean final pips **2.686 / 7.673 / 7.887**, medians **0 / 6 / 7**; pip delta **−4.987 ±0.145**. Round mean **24.094** turns; **310** blocks. Late minus finishes **475/18/1/0**, early **25/1/0/0**. Mixed-family opportunities late **16,405** (0 immediate openings), early **9,041** (all opened).
- Both experimental strategies start with **2.000 doubles on average after the compulsory 1-1 opening/followup**; late final double count per appearance **0.0104 / 0.0090 / 0.0092**, early **0.0047 / 0.0042 / 0.0017** in the three profiles. Opened-number count at finish ~**6.96–6.98**; opening timing rather than final number count is the modeled difference. Full-round block rate by profile **3.83% / 3.90% / 4.31%**; blocks have **no assigned winner**.
- **Finding (model-only):** delaying a double's number-opening *when an ordinary move is also legal* has a very large, reproducible advantage in this **specific provisional locking model**, robust to three simple opponent profiles. This is a controlled ablation, unlike the earlier composite `closed-branch-control` comparison. **Do not present as a real-game rule** until the real table's lock/open mechanics are independently confirmed; the large effect may be an artifact of this exact assumption.
- Confidence/limitations: intervals are exploratory, not corrected for multiple profiles; seeds are independent across deals but seat rotations and profile runs are correlated. Simple deterministic opponent bots, opening default, synthetic previous winner, no hidden-opponent action likelihood, no block winner, `loneZero=10` or `bust=101` validation, no full-match scoring. Finish-first ≠ match win. Existing historical 4,000 not mixed.
- Reproduce: `node qosha-research/simulator/opening-timing-ablation.js test`; `node qosha-research/simulator/opening-timing-ablation.js 1398440 2400`. Code commit `fe9aadfe4c40ab03af08d0e0228b5c004da2510b`.
- **Verified cumulative:** **498,300** full-round continuations (476,700 + 21,600); **811,968** forced hidden-world counterfactual continuations unchanged. Distinct seed sets counted separately; historical 4,000 excluded.
- **Exact next hypothesis/action:** isolate the *number of doubles opened in a forced double turn* (`fewest` vs `max-pips`) while holding the late-opening rule fixed, on fresh disjoint seeds **>=1400840**; audit why the modeled opening effect is so large; obtain a genuine four-branch locked/open real-table fixture. Do not enable 101-point match comparisons until block-winner/loneZero/bust are confirmed.

### 2026-10-24 16:48 (+04) — forced-double count ablation on disjoint seeds
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, **3 players × 9 stones**. Four-branch number locking **PROVISIONAL**; do not generalize to real table before authentic fixture. Added `simulator/forced-double-count-ablation.js` with six deterministic test categories (forced variable-count choice, equal late-opening priority, mixed-finish precedence, equal action when no count conflict, mandatory full all-double finish, 100-seed exact replay). All passed in **V8 CommonJS harness** (not Node CLI); replay ran 900 continuations but is **excluded from research totals**.
- Preregistered contrast: both experimental policies delay a number-opening double whenever a legal ordinary placement exists, and both maximize removed pips with identical tie-breaking otherwise. **Only** when forced to play doubles with variable sequence lengths: `pip-late-fewest-forced-doubles` opens exactly one; `pip-late-max-pips-forced-doubles` picks the maximum-pips available sequence (mean **2.22** doubles at variable-count choices). Mandatory full-double finishes unaffected. Opponents: `min-hand-pips`, `closed-branch-control`, `random-legal`.
- Fresh nonoverlapping seeds **1400840..1403239**: **2,400 unique deals × 3 profiles × 3 seat rotations = 21,600 full continuations**, **20,934 finishes**, **666 blocks (3.08%)**, **0 unresolved**; **0** new hidden-world forced counterfactual continuations. Reused identical 2,400 deals across profiles and rotations, not 21,600 independent deals. 7,200 rounds per opponent profile.
- Fewest vs max-pips finish-first rates (each policy 7,200 appearances per profile), mean final pips, and paired **fewest-minus-max** seed-cluster (24 × 100 deals) exploratory 95% t(23) half-widths:
  - Against `min-hand-pips`: **34.17% vs 41.64%**, difference **−7.47 ±1.75 percentage points**; mean remainder **4.725 vs 4.397**, difference **+0.329 ±0.181 pips**; **242 blocks**. Variable-count opportunities **5,534 vs 3,663** (different trajectories).
  - Against `closed-branch-control`: **33.64% vs 35.56%**, difference **−1.92 ±1.41 pp**; mean remainder **5.110 vs 5.134**, difference **−0.024 ±0.144 pips**; **186 blocks**. Opportunities **5,161 vs 3,433**.
  - Against `random-legal`: **34.49% vs 41.32%**, difference **−6.83 ±2.15 pp**; mean remainder **4.812 vs 4.505**, difference **+0.307 ±0.204 pips**; **238 blocks**. Opportunities **5,664 vs 3,606**.
- Minus finishes for fewest vs max-pips: against min-pips **−10: 688 vs 428, −20: 38 vs 18**; against closed-branch-control **635 vs 350, 38 vs 16**; against random **621 vs 349, 24 vs 17**; one −30 for max-pips vs random, no −40. Thus **fewest yields more minus finishes while max-pips more often finishes first**: optimize for match scoring only after 101-point semantics are validated.
- **Finding (simulator-only):** opening more available doubles on a forced-double turn improves **finish-first** over deliberately opening the fewest, strongly against min-pips/random and more modestly against closed-branch-control. This **does not contradict** the earlier advantage of delaying a double *when an ordinary move exists*: those are distinct decision points. Crucially, more −10/−20 under fewest means finish-first is not a complete scoring objective. No reliable real-game rule until four-branch locking is authenticated.
- Confidence/limits: paired seed-cluster exploratory intervals uncorrected for multiple profiles/looks; state trajectories diverge, so opportunities differ and are not paired state-level counterfactuals. Deterministic simple opponents; synthetic previous winner on 1-1 stock; default opening follow-up; no block winner, `loneZero=10`, `bust=101` or 101-point match victory. **Do not treat these as match win rates.**
- Reproduce: `node qosha-research/simulator/forced-double-count-ablation.js test`; `node qosha-research/simulator/forced-double-count-ablation.js 1400840 2400`. Detailed JSON: `runs/2026-10-24-1648-forced-double-count-1400840.json`.
- **Verified cumulative:** **519,900** full continuations (**498,300 + 21,600**); **811,968** forced hidden-world counterfactual continuations unchanged; historical 4,000 excluded. New unique seeds through **1403239**.
- **Exact next hypothesis/action:** test a hybrid forced-double policy that selects longer sequences only when doing so increases *next-turn mobility* or reduces opponent access, against pure max-pips and fewest on fresh disjoint seeds **>=1403240**; evaluate minus-vs-finish tradeoff under separately labelled provisional score assumptions. Obtain an authentic locked/open four-branch table fixture and clarify block-winner/loneZero/bust before full-match recommendations.

### 2026-10-24 17:49 (+04) — forced-double mobility-gate holdout (four matched profiles)
- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary **3×9**. Four-branch number-locking is **PROVISIONAL**; this is **not** authenticated real-table advice.
- New reproducible `simulator/forced-double-mobility-hybrid.js`: all compared policies defer double opening when an ordinary tile is playable. At a forced variable-count double choice, the hybrid selects the max-pips sequence rather than the fewest only if the resulting count of **distinct playable own tiles** increases and `3 × own mobility gain >= increase in full-deck ordinary-tile access`. The latter is an **unseen-opponent access proxy**, **not** a true opponent probability; it includes already played tiles. Identical tie-breaking/mandatory mixed-finish handling inherited from previous ablation.
- Fresh disjoint **2,400 unique deals, seeds 1403240..1405639**, four three-policy profiles × three seat rotations = **28,800 full continuations**, **27,945 finishes**, **855 blocks (2.97%)**, **0 unresolved**; same deals deliberately reused across profiles and rotations. No new hidden-world counterfactual continuations. Four profiles: hybrid/fewest/max-pips; hybrid/fewest/min-hand-pips; hybrid/max-pips/closed-branch-control; hybrid/fewest/random-legal.
- **Direct three-way** hybrid/fewest/max-pips: finish-first **28.43% / 32.58% / 36.11%** (7,200 appearances per policy). Mean remaining pips **6.034 / 5.170 / 5.065**; medians **4 / 3 / 3**. Paired hybrid-minus-fewest finish-first **−4.15 ±1.25 percentage points**, hybrid-minus-max **−7.68 ±1.09 pp** (24 nonoverlapping 100-seed clusters, exploratory uncorrected 95% t(23) half-width). Hybrid-minus-fewest mean remainder **+0.864 ±0.136 pips**; hybrid-minus-max **+0.969 ±0.125 pips**. −10 finishes **545 / 583 / 371** and −20 **19 / 24 / 15**; no −30/−40 in this profile. **Finish-first ≠ 101-point match victory**.
- Other profiles (hybrid vs comparison finish-first): against min-hand-pips as third bot, hybrid **35.47%** vs fewest **37.58%** (−2.11 ±1.97 pp); against closed-branch-control as third bot, hybrid **32.64%** vs max-pips **36.07%** (−3.43 ±1.30 pp); against random-legal as third bot, hybrid **34.64%** vs fewest **38.17%** (−3.53 ±1.69 pp). All paired cluster intervals exploratory and uncorrected. Mean round length across four profiles ≈ **25.76** turns.
- Gate actually selected longer only **549 / 20,521** hybrid variable-count opportunities (**2.68%**) across profiles: 135/4895, 132/5269, 131/5037, 151/5320. Thus this strict mobility/access gate behaves mostly like fewest, and did **not** improve finish-first. This is a **negative result for this exact threshold**, not evidence that all mobility-aware or minus-aware hybrids fail. Paths diverge between strategies; comparisons are matched by deal/seat, not identical decision states.
- Tests: seven deterministic hybrid checks incl. 100-seed replay (**1,200 test continuations excluded from totals**); scoring contract **1,056 assertions** and synthetic four-branch/−40 kernel passed in V8 CommonJS harness. Node CLI was not run. All new code and data under `qosha-research/`; no scoreboard/PWA changes.
- Limits: simple deterministic opponents, full-deck geometric access proxy includes already-played stones, selection effects/trajectories, correlated rotations/profiles, uncorrected repeated looks, synthetic previous winner if 1-1 is in stock, default opening follow-up, **no validated real branch lock**, no block winner, loneZero=10, bust=101 or match winner. Historical 4,000 not mixed.
- Reproduce: `node qosha-research/simulator/forced-double-mobility-hybrid.js test`; `node qosha-research/simulator/forced-double-mobility-hybrid.js 1403240 2400`; raw JSON `runs/2026-10-24-1749-forced-double-mobility-1403240.json`.
- **Verified cumulative:** **548,700 full continuations** (519,900 + 28,800), **811,968 forced hidden-world counterfactual continuations** unchanged; unique new seed set consumed through **1405639**.
- **Exact next hypothesis/action:** on fresh disjoint seeds **>=1405640**, test a **less restrictive, preregistered** double-count gate using hand size, own post-action mobility and minus-finish feasibility; compare to fewest and max-pips on matched deals. First add *within-position* forced-double counterfactuals so observed effects can be attributed to the action rather than diverging round trajectories. Continue seeking an authentic four-branch locked/open fixture and block-winner/loneZero/bust contract before 101-point match advice.
