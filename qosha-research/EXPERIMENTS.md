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
