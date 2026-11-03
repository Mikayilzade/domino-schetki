# Qoşa açdı — рабочая спецификация правил

Статус: восстановлено из игровых разборов пользователя и предыдущего симулятора `qosa-1.0.0`. Спорные места помечаются и не должны незаметно превращаться в правила.

## Колода и режимы

Используется стандартный double-six набор: 28 камней.

Основной режим исследования:
- 3 игрока;
- по 9 камней;
- 1 камень остаётся в базаре;
- конфигурация старого движка: `draw=one_then_play_or_pass`, `openingDraw=only_three_players`;
- `globalDoubleOpening=true`;
- `multiDouble=true`;
- `mixedFinish=all_four_ends_closed_by_remaining_doubles`;
- `loneZero=10`;
- `scoreFloor=0`;
- `bust=101`.

Дополнительный режим:
- 5 игроков;
- по 5 камней;
- 3 камня в базаре.

## Ветви

Первый сыгранный дубль создаёт четыре направления/ветви: вверх, влево, вправо, вниз.

В игре различаются:
- открытая ветвь;
- закрытая/ещё не открытая ветвь;
- текущее значение свободного конца ветви.

Дубль соответствующего числа открывает это число/ветвь для дальнейшей игры. Невышедший дубль может сохранять ветвь закрытой и тем самым влиять на доступность ходов.

## Старт раздачи на троих

Подтверждено пользователем 2026-10-01:
- раздача всегда начинается с дубля `1-1`;
- если `1-1` находится у одного из трёх игроков, этот игрок выкладывает `1-1`, забирает единственный камень из базара и затем делает ещё один ход на единицу;
- после стартового хода очередь идёт по часовой стрелке;
- если `1-1` оказался в базаре на первой раздаче матча, камни перемешиваются и раздаются заново;
- если `1-1` оказался в базаре во второй или последующей раздаче, его забирает победитель предыдущей раздачи, выкладывает `1-1` и затем делает ещё один ход на единицу.

Если после `1-1` и обязательного добора стартующему нечем продолжить на единицу, он пасует. Ход переходит следующему игроку по часовой стрелке; на дальнейших кругах игрок также пасует, пока у него не появится легальный ход.

## Ход

Обычный ход — один камень.

Дубли имеют отдельное правило:
- при наличии подходящих дублей можно сыграть несколько дублей за один ход;
- если это не финиш, игрок сам решает, сколько подходящих дублей сыграть; выкладывать всю доступную серию необязательно;
- если оставшиеся камни игрока — подходящие дубли и их можно закрыть этим ходом, они выкладываются все как финишная серия;
- практически возможны серии до четырёх дублей, если они закрывают соответствующие открытые концы;
- нельзя произвольно сыграть обычный камень, а затем добавить дубль тем же ходом, кроме специальных ситуаций, разрешённых правилом множественных дублей.

Если допустимого камня нет, применяется правило добора/пропуска соответствующего режима.

## Минус

Минус возникает только при завершении раздачи последним камнем или последними камнями-дублями.

Рабочая шкала:
- последний дубль: −10;
- два последних дубля: −20;
- три последних дубля: −30;
- четыре последних дубля, закрывающие четыре стороны: −40.

Ключевой принцип: обычное наличие дублей в руке само по себе минуса не даёт.

Подтверждён mixed finish: если игрок ставит обычный последний недубль и после этого все оставшиеся в руке дубли могут быть сыграны на доступные значения, они выкладываются в том же ходу. Например, при руке `1-5, 5-5, 2-2`, если после `1-5` доступны `5` и `2`, игрок заканчивает ход всеми двумя дублями и получает −20.

## Блок

При блоке оставшиеся камни считаются по сумме очков. Игрок, закончивший раздачу, получает 0. Для общего счёта действует нижняя граница 0.

## Подтверждённые игровые наблюдения

- Слепое удержание всех дублей до конца обычно ухудшает результат.
- Возможность сыграть несколько дублей за ход резко меняет ценность дублей: они не только риск, но и средство темпа/контроля.
- Закрытая ветвь позволяет выбирать момент открытия и ограничивать пространство соперников.
- −10 встречается заметно чаще, −20 реже; −30/−40 существенно более редкие события.
- −40 на троих возможно; отсутствие такого исхода в небольшой выборке не означает невозможность.

## Требует дополнительной валидации

Перед массовыми выводами движок должен отдельно проверить:
1. формальное условие открытия/разблокировки ветви дублем;
2. поведение базара и пропуска для 5 игроков;
3. трактовку `loneZero=10`.

Старт с `1-1`, добровольные неполные multi-double серии и mixed finish больше не считаются неопределёнными.

## Live PWA match-scoring cross-check (read-only, 2026-11-02)

This is repository implementation evidence, not independent authentication of physical table rules.

- `index.html` loads the `scoreboard.js` + versioned `scoreboard-v*` chain (through v19); it does **not** load `app.js`, `qosha-rules.js`, or `qosha-101.js`. Do not treat those unreferenced legacy scripts as the active PWA.
- The active Qoşa path in `scoreboard.js`/`scoreboard-v14.js` applies a zero score floor, marks an entity exploded when its score reaches **101 or more**, and prepares a result once at most two entities remain. With two survivors, the lower score is assigned 2 daily points and the other 1. A one-survivor branch assigns 3 points, but under the stop-at-two flow it is not reached from an ordinary 3+ player sequence; it is covered only as a separate code-path fixture.
- `scoreboard-extra.js` help text says that finishing with a gosha removes 10 and that the score cannot fall below zero. The UI accepts manual score entries; the source does not define whether this phrase is exactly the recovered `loneZero=10` parameter or what hand/finish qualifies. Keep `loneZero=10` unresolved.
- The unreferenced `qosha-101.js` instead declares a target-reaching win at 101. It is a conflicting legacy variant, not evidence for the current active PWA and must not be mixed with `bust=101`.
- **Correction (active scoreboard-v16.js):** equal survivor scores at the 101-triggered result produce a draw, 1.5 rating points each and no recorded win. The earlier stable-sort 2/1 interpretation applies only to the uncorrected research adapter, not the active PWA. No physical tie rule is authenticated.

Compatibility tests live in `simulator/match-scoring.js` and `simulator/match-scoring-test.js`. These tests preserve the source-derived PWA contract separately from round-kernel and physical-rule validation.

## Sequential score-event order audit (read-only, 2026-11-03)

- The active PWA calculator applies a score entry to one entity, then evaluates the Qoşa 101 threshold. In the active scoreboard.js / scoreboard-v14.js path, a score of 101 or more marks that entity exploded; when at most two entities remain, a pending match result is created immediately.
- This is sequential manual score-entry behavior, not an atomic round batch. If multiple players would cross 101 from one round's entries, the first entered event can determine which seat explodes and which two survivors are ranked. The entry order is the user's manual action order; a simulator's fixed seat order is only a declared harness convention.
- The research adapter currently tests a provisional mapping for finish outcomes: each seat receives its terminal hand pip sum and the empty finisher additionally receives the finish-minus. This is not independently authenticated as the exact table scoring convention.
- Block outcomes remain unscored until block winner/tie allocation is confirmed. The PWA help text says penalties add points and finishing with a gosha removes 10, but does not resolve the full terminal-pip mapping or loneZero=10.
- Evidence is implementation-only: scoreboard.js, scoreboard-v14.js, and scoreboard-extra.js; no live PWA files were changed.

## Sequential score-event order audit (read-only, 2026-11-03)

- The active PWA calculator applies a score entry to one entity, then evaluates the Qoşa 101 threshold. In the active scoreboard.js / scoreboard-v14.js path, a score of 101 or more marks that entity exploded; when at most two entities remain, a pending match result is created immediately.
- This is sequential manual score-entry behavior, not an atomic round batch. If multiple players would cross 101 from one round's entries, the first entered event can determine which seat explodes and which two survivors are ranked. The entry order is the user's manual action order; a simulator's fixed seat order is only a declared harness convention.
- The calculator returns before evaluating a zero input. The research adapter therefore skips zero score deltas and distinguishes them from pending nonzero events.
- The research adapter currently tests a provisional mapping for finish outcomes: each seat receives its terminal hand pip sum and the empty finisher additionally receives the finish-minus. This is not independently authenticated as the exact table scoring convention.
- Block outcomes remain unscored until block winner/tie allocation is confirmed. The PWA help text says penalties add points and finishing with a gosha removes 10, but does not resolve the full terminal-pip mapping or loneZero=10.
- Evidence is implementation-only: scoreboard.js, scoreboard-v14.js, and scoreboard-extra.js; no live PWA files were changed.


## Active PWA v16 tie overlay (read-only, 2026-11-03)

- `scoreboard-v16.js` wraps the v14 Qoşa evaluator: after a 101 bust with exactly two survivors, equal current scores set `isDrawV16` and award 1.5 rating points to each; the confirmation wrapper suppresses win counts. Later v17–v19 scripts do not replace the Qoşa evaluator.
- The legacy research `match-scoring.js` is retained to reproduce old cohorts; `match-scoring-v16.js` and `finish-score-match-integration-v16.js` are the active-source-compatible, opt-in research variant. A null place means no unique first place.
- Sequential event order can create or remove a tie when positive or negative survivor deltas are pending after a bust. This is PWA implementation behavior, not authentication of physical table scoring.
