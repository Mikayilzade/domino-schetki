# Протокол почасовых симуляций

## Приоритет

1. Проверить корректность движка и legal moves.
2. Только после этого увеличивать объём.
3. Сравнивать стратегии на одинаковых seed/раздачах.
4. Хранить не только win rate, но и причины выигрыша/проигрыша.

## Основной режим

Сначала 3 игрока × 9 камней.

На каждом валидированном запуске сравнивать минимум:
- random legal;
- минимизация суммы очков руки;
- быстрый сброс дублей;
- умеренное удержание дублей;
- контроль закрытых ветвей;
- темповая стратегия;
- стратегия, ориентированная на шанс −10/−20;
- anti-minus;
- гибридная стратегия на основе лучших признаков предыдущих прогонов.

## Метрики

По каждой стратегии собирать:
- долю побед/первого места;
- средний остаток очков;
- медианный остаток;
- среднее число ходов до конца;
- частоты −10/−20/−30/−40;
- частоты блока;
- сколько дублей было в стартовой руке и сколько осталось к финишу;
- эффект владения конкретными дублями;
- ценность открытия каждой ветви;
- эффект выбора между несколькими легальными ходами;
- regret: разница между выбранным ходом и лучшей альтернативой в одинаковом скрытом мире.

## Анализ позиций

Для реальных партий использовать Monte Carlo по неизвестным раскладам:
- фиксировать известные камни;
- случайно распределять неизвестные;
- для каждого кандидата продолжать игру одинаковыми политиками;
- сравнивать не один показатель, а вероятность победы, средний остаток и риск минуса.

## Защита от ложных выводов

Не объявлять правило «сильным», если:
- выборка мала;
- разница находится в шуме;
- стратегия получила преимущество только против одного типа бота;
- движок менялся между сравниваемыми прогонами.

Все новые гипотезы сначала писать как гипотезы, затем подтверждать отдельным прогоном.

## Branch-label symmetry and policy tie-breaks (2026-10-31)

The four branch labels are treated as interchangeable by the research kernel. Deterministic policy tie-breaks must therefore be invariant under a permutation of branch labels (canonicalize the labels before tie-breaking, or use a seeded symmetric tie-break). Before promoting a branch/late-pass result, run the 24-permutation metamorphic check on the same hidden worlds. Record eligibility changes separately from candidate-classification changes. Raw numeric side order is an explicit ablation only, not the default research policy.


## Seeded hidden-world deduplication (2026-10-31)

A deterministic seed draw does **not** guarantee a unique hidden allocation: the conditional world space is finite, so distinct seeds can land on the same assignment. For every seeded hidden-world experiment:
- canonicalize the complete seat/stock assignment and report both seed draws and unique allocation count;
- record duplicate seed pairs rather than failing solely because a duplicate occurred;
- in development/holdout splits, keep the first occurrence and exclude later repeated assignments from analysis so a duplicated world cannot leak across cohorts;
- report the post-dedup holdout size explicitly. Do not treat seed count as independent unique-world count.


## Branch-label action/transition equivariance (2026-10-31)

Before strategy conclusions rely on branch labels, sample reachable states and apply all 24 permutations of the four labels. Compare draw/pass state and legal action sets after mapping each action's side; then apply every corresponding legal action and compare the mapped successor state. Track pass/draw transitions separately. Count unique seeded deal allocations and report duplicate seeds explicitly.

Measure policy-choice changes separately for each policy. These mismatches diagnose label-sensitive tie-breaks; they are not strategy outcome differences. When the state has automorphic/symmetric branches, a unique deterministic equivariant choice may not exist. Prefer a symmetric random tie-break distribution or compare action-orbit outcomes rather than silently using raw side index. Keep the branch symmetry assumption separate from physical rule authentication.


## Symmetric action-orbit tie-break (2026-10-31)

- Keep the existing policy's primary score unchanged; retain all best-ranked actions rather than falling back to raw side labels.
- For non-random policies, group side-specific actions by the selected branch's `active/end` descriptor (state automorphism orbit); sample an orbit uniformly, then a member uniformly. `random-legal` samples across all legal actions.
- Validate **distributional** equivariance under all 24 branch-label permutations. Do not demand same-seed deterministic action equivariance in automorphic states: a unique deterministic choice may be mathematically impossible.
- Full-round comparisons use identical deals and seat rotations. Report outcome changes as tie-break sensitivity, not strategy superiority; keep physical branch/block assumptions separate.

## Reachable branch lock/open contract (2026-11-01)

For seeded reachable-state audits, validate action/apply round trips, 28-tile conservation, ordinary-single opening gates, inactive-side rejection, and exact opened-number updates. A double-only sequence must preserve branch geometry. For mixed finish, test finish-double exposure **after** the ordinary prefix: that prefix may extend a branch and expose the double. Keep late-arrival chronology fixtures explicitly model-labelled; they are not physical-rule authentication. Continue reporting unique full allocations separately from seed draws and keep strategy populations separate from property-audit cohorts.

## Opening follow-up orientation and symmetry (2026-11-01)

The research initializer currently chooses the canonical `up` branch for the mandatory 1-1 follow-up whenever that branch is legal. Preserve this default for historical/replay compatibility, but treat it as a representation convention, not a physical or tactical preference. Branch-label audits must report action-set equivariance separately from default-choice/tie-break mismatches. Validation trajectories should use an explicit seeded symmetric/action-orbit selector (or canonicalize branch labels before policy evaluation); matched-seed outcome changes are tie-break sensitivity only. Physical branch symmetry remains a separate authentication question.


## Seeded opening follow-up side selector (2026-11-01)

For the mandatory 1-1 follow-up, keep the initializer's canonical tile choice fixed and vary only the selected side. The validation selector uses unsigned seed modulo the four candidate sides, giving equal side mass over four seed residues. This is distributionally symmetric; do not claim same-seed deterministic mapped-choice equivariance in automorphic states. Compare against the canonical-up default on matched deals and identical continuation policies. Treat outcome changes as tie-break sensitivity, not strategy superiority, and keep physical four-branch authentication separate.


## Within-state common-hidden-world regret on model-agreement positions (2026-11-01)

- Count root legal-action-set disagreement between the global-ever-open and current-only branch models separately; do not merge disagreement positions into the agreement regret cohort.
- Eligible regret states require at least two in-hand legal actions and identical root action keys in both models. Fix the focal hand, all played/known tiles, public branch geometry/opening state, and hidden hand sizes.
- Sample hidden worlds uniformly from the remaining tile allocation conditional on those fixed facts. Reuse each exact hidden allocation for every candidate action; deduplicate within each visible state. If the conditional space is small, enumerate it or use a deterministic hash-ranked subset rather than waiting for impossible unique draws.
- Force each candidate, then continue with the same policy and action-orbit tie-break. Evaluate global-ever-open and current-only continuations separately.
- Report oracle regret per metric (first-finish chance, mean remainder, minus-finish risk, expected minus loss), plus unique states/worlds, candidate-world evaluations, finite-space method, duplicate count, and model assumptions. The oracle is hindsight over sampled worlds; it is not an executable perfect-information strategy.
- Stratified small samples are diagnostic only; no strategy promotion or 101-match win-rate claim. Record pass-history conditioning (or its absence) explicitly.

## Separate model-specific pass posterior (2026-11-01)

When a visible state includes forced-pass evidence and two provisional branch models:
- compute global-ever-open and current-only posterior supports separately, alongside the joint intersection used for paired model-agreement comparisons;
- report global-only, current-only-exclusive, joint, and neither support counts separately; totals across visible states are state-world assignments, not global unique allocations;
- evaluate the same root common-action set under identical continuation policies and deterministic hidden-world ranking; report model-specific regret and its difference from the joint-intersection estimate;
- do not infer voluntary tile choices as facts unless an explicit opponent-choice likelihood is preregistered; pass consistency alone is not full public-history conditioning;
- keep this diagnostic separate from strategy-strength holdouts and do not promote a tactic from stratified hindsight-oracle regret;


## Per-state hidden-world uniqueness accounting (2026-11-01)

For importance-sampled Monte Carlo with replacement, report seed draws, unique complete allocations **within each visible state**, and duplicate draws separately. Do not label repeated draws as unique worlds; preserve draw multiplicity only when the estimator is explicitly with-replacement. Report the per-state unique-count distribution and importance-weight ESS as different quantities. In any train/holdout split, keep deal/state clusters disjoint and prevent canonical hidden allocations from leaking across cohorts. When a conditional state space is small, prefer exact enumeration or deterministic unique-world sampling and report method/coverage.
## Holdout allocation preflight (2026-11-01)

Deal-level checks on a locked holdout seed set may verify only deterministic replay, complete allocation uniqueness, 28-tile conservation, and broad sampler sanity. They must not inspect game outcomes/pass labels, select or tune a model, or change a preregistered prior. Report these preflight deals separately; they do not count as evaluated holdout samples until the full runner emits the planned outcome labels and metrics.


## Choice-history prior status (2026-11-01 19:48 +04)

The discovery-selected 10% closed-control prior did not show a reliable independent holdout improvement. On seeds 3413170–3413569, the state-clustered gain was +0.000939 ± 0.012501 (approximate 95% half-width); the interval includes zero. Pooled with the earlier independent holdout, 113 uncertain positions / 159 labels gave +0.002363 ± 0.009358, also including zero. Treat choice-history weighting as unsupported for now; do not reselect prior weights on these cohorts or promote a tactic.

Next priority: branch-label action/transition permutation audit and isolated block-scoring fixtures. Internal reachability tests are not physical-rule authentication; four-side locking/reopening and blocked-round winner remain provisional.


## Policy-generated branch-label audit (2026-11-01)

For the four-branch metamorphic check, generate reachable trajectories with a fixed mix of fast-doubles, min-hand-pips, and closed-branch-control across all three seat rotations. Use the action-orbit symmetric tie-break and the seeded 1-1 follow-up side selector; keep the canonical follow-up tile choice unchanged. Deduplicate visible states, select deterministic hash-ranked strata, and compare legal sets plus every mapped successor under all 24 branch-label permutations. Check policy choice distributions separately from action/transition equivariance. These are model consistency tests, not strategy-strength comparisons or physical-rule authentication.

## Matched branch-lock and block-winner sensitivity (2026-11-01)

- Compare global-ever-open with a **one-step local-side-only counterfactual** on the same policy-generated trajectory. Restrict only the newly opened number to one matching side; keep other opened numbers global. Report legal-action count, pass flips, side-choice changes, and tile-group choice changes separately. This is not a full local-rule rollout and cannot authenticate the physical rule.
- At block end, compare candidate seat sets for minimum pip total, fewest tile count (contrast only), last passer (diagnostic only), and current no-winner model. Do not infer point allocation, tie-break, score floor, or 101-match outcome from these identity comparisons.
- For unlock-delay Monte Carlo, deduplicate complete hidden assignments **within each visible state** before paired continuation evaluation. Report seed draws, unique worlds, duplicate seed pairs, ESS, and post-dedup paired continuation count. Use the same exact hidden allocation and continuation seed in both arms.
- The one-turn delayed-unlock arm is an explicitly nonlegal intervention. Select late positions by next-opponent hand size on future runs; do not promote a tactic from mechanism-only results.



## Matched legal branch-opening double vs ordinary single, stratified by next-opponent hand size (2026-11-02)

- Compare two **legal** actions from the same visible state: a one-double sequence that opens an unopened number vs an ordinary single. Select the pair with minimum absolute pip gap; report exact equal-pip pairs separately because tile identity and retained hand still differ.
- Stratify next-opponent hand size exactly 1, 2, 3, and 4. Use disjoint seed windows for continuation profiles, rotate the focal seat by seed, and select at most one position per seed/profile.
- Fix the focal hand, known/played tiles, public state, and hidden hand sizes. Sample hidden allocations conditional on recorded no-stock pass exclusions. Canonicalize complete seat/stock allocations and deduplicate within each visible state; preserve duplicate seed pairs and report draws, unique assignments, repeats, and ESS.
- Reuse each unique hidden allocation for both candidate actions. Continue with the same profile and symmetric action-orbit tie-break. Report finish-first, remainder, minus risk/loss, block, next-opponent mobility/pass/finish, turn length, ending doubles, and pairwise hindsight regret per metric.
- Pairwise oracle regret is limited to the compared candidate pair and sampled worlds; it is not an executable perfect-information strategy. This is not a pure unlock ablation. Global/local branch geometry remains provisional; no strategy promotion without independent holdout and physical rule authentication.
