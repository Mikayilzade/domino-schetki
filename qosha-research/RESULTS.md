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


### 2026-10-09 01:00:45 +04:00 — independent branch-side-matched endpoint holdout
- engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, primary 3×9; no gameplay changes
- experiment: 32 exact-matched high/low endpoint position pairs per discovery policy (128 distinct positions), seeds 134000..135999 under closed-branch-control and 136000..137999 under min-hand-pips; 25 deterministic hidden worlds per position; **3200 new worlds**, 9600 policy-world evaluations, 48000 candidate continuations; 0 new complete strategy rounds
- matching: exact branch starting number X, connector gap, focal hand size, opponent minimum <=3 vs >=4, **and branch side**. Within each position, compare spending low vs spending high on identical hidden worlds; between positions compare high-endpoint >=5 vs low-endpoint <=4. Three continuation policies: closed-branch-control, min-hand-pips, fast-doubles.
- validation: side-match self-test passed; all paired candidates resolved; V8 CommonJS harness (not Node CLI)
- finding: All six side-matched finish-first differences have unadjusted 95% position-pair CIs crossing zero; no reliable high-endpoint effect. Opposite-sign point estimates across policies: true; 95% CIs exploratory/unadjusted. No human-ready rule.
- finish-first matched differences (percentage points, high-endpoint context minus low): closed-branch-control/closed-branch-control 1.12 [-10.19,12.44]; closed-branch-control/min-hand-pips 1.63 [-9.01,12.26]; closed-branch-control/fast-doubles -0.13 [-9.12,8.87]; min-hand-pips/closed-branch-control -0.37 [-7.85,7.10]; min-hand-pips/min-hand-pips -1.50 [-8.51,5.51]; min-hand-pips/fast-doubles -0.50 [-8.10,7.10].
- cumulative: **180,000** persisted complete strategy rounds (historical 4,000 separate); **48410** fixed-visible hidden worlds. Previous endpoint holdout 45,210; this run +3,200.
- limitations: assumption-labelled locked/open branch rules, handcrafted bots, first eligible selection, other tiles and full opponent hand-size vector not matched, block winner unassigned, correlated worlds within positions; observational between-position comparisons, no multiple-comparison adjustment.
- reproducibility: `simulator/endpoint-side-matched-holdout.js 32 25`, linked `runs/2026-10-09-0100-endpoint-side-matched-holdout.json`; world seed `6100000 + 1000*dealSeed + worldIndex` (index 0..24).
- exact next hypothesis/action: match the **full two-opponent hand-size vector** and side on independent seeds 138000..141999; compare sign stability and investigate concrete counterexamples rather than promoting endpoint value alone.


### 2026-10-09 02:55:33 +04:00 — same-state endpoint mobility, fresh-seed discovery
- engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; no gameplay-rule changes.
- sample: seed scans `142000..143999` (closed-branch-control discovery) and `144000..145999` (min-hand-pips discovery); 24 positions per discovery policy × each of 3 pre-defined mobility groups = **144 reachable positions**; 25 fixed-visible worlds per position = **3,600 new hidden worlds**, **10,800 policy-world evaluations**, **51,300 candidate continuations**; 0 new complete strategy rounds.
- comparison: from the **same position** choose X-LOW vs X-HIGH on the **same open branch side**, with both endpoints opened; count other hand tiles touching the resulting LOW/HIGH endpoint. Positive aligned effect means choosing the endpoint with **more remaining connectors** helps finish first.
- finish-first advantage of mobility-aligned choice, equal position weight (96 non-tie positions): closed-branch-control **7.25 pp [3.26, 11.24]**; min-hand-pips **5.88 pp [2.45, 9.30]**; fast-doubles **3.04 pp [-0.06, 6.14]**. CIs are exploratory normal approximations clustered by selected position, not by world.
- finding: **provisional tactical signal**: keeping a playable continuation on the new endpoint correlates with a better finish-first outcome under two continuation policies; the third is borderline and not independently significant. Do not yet promote a universal rule.
- validation: V8 CommonJS harness self-test passed (deterministic replay and source-state immutability); this was **not** a Node CLI run. No unresolved candidate continuations.
- cumulative persisted research scale after this checkpoint: **180,000 full strategy rounds** (historical 4,000 separate) and **55,210 fixed-visible hidden worlds**.
- limitations: branch semantics still assumption-labelled; first-eligible selection; quota stratification; correlated worlds; simple bot policies; block winner unassigned; exploratory unadjusted CIs; hand composition is not causally isolated.
- reproducibility: `simulator/endpoint-mobility-holdout.js 24 25`, `runs/2026-10-09-0255-endpoint-mobility-holdout.json`; seed formula `6100000+1000*dealSeed+worldIndex`.
- exact next action: independent holdout on seeds `146000..149999`, same quota/25 worlds/three continuation policies; check mobility effect by full opponent hand-size vector and alternate branch ends, document counterexamples before human advice.


### 2026-10-09 03:50:22 +04:00 — independent endpoint mobility replication
- engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9; no gameplay-rule changes.
- independent holdout: 144 reachable positions, 3600 fixed-visible worlds, 10800 policy-world evaluations, 54525 candidate continuations; deal seed ranges 146000..147999 and 148000..149999; 25 worlds per position.
- baseline: 180,000 persisted full rounds (historical 4,000 separate); cumulative fixed-visible hidden worlds **58810**.
- continuation policies: closed-branch-control, min-hand-pips, fast-doubles; selection quotas 24 per mobility group and discovery policy; same-state candidate comparisons.
- aligned finish-first delta (more connectors minus fewer): closed-branch-control 6.00 pp [2.76, 9.24]; min-hand-pips 4.08 pp [-0.21, 8.37]; fast-doubles 4.17 pp [1.17, 7.16]. Exploratory position-level 95% CIs, no multiplicity adjustment.
- finding: Independent holdout does not robustly confirm the endpoint mobility effect across all continuation policies; retain as conditional hypothesis only.
- counterexamples: seed 146510 (0-6, 3-6, 3-4, 4-4, opponents 3/4); seed 146321 (0-3, 0-5, 2-2, 4-5, opponents 4/4); seed 149493 (5-6, 0-5, 0-1, 2-2, 2-5, opponents 5/4).
- validation: V8 CommonJS harness; deterministic replay and source-state immutability self-tests passed; not Node CLI.
- limitations: assumption-labelled locked/open branches, first-eligible selection, simple bots, block winner unassigned, correlated worlds, exploratory subgroup splits.
- reproducibility: `simulator/endpoint-mobility-replication.js 24 25`; `runs/2026-10-09-0348-endpoint-mobility-replication.json`; world seed `6100000+1000*dealSeed+worldIndex`.
- exact next action: Check whether the mobility advantage survives against new opponent continuation policies and when an opponent has 1-2 tiles; seek counterexamples with multiple open sides.
