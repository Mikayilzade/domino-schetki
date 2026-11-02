# Qoşa açdı research

Исследовательская папка для правил, симуляций и практической стратегии Qoşa açdı.

Цель: не менять приложение-счётки, а отдельно накапливать воспроизводимые данные, чтобы потом разбирать реальные позиции и давать советы по игре.

## Структура

- `RULES.md` — текущая спецификация правил и отмеченные неясности.
- `EXPERIMENTS.md` — протокол почасовых симуляций.
- `RESULTS.md` — накопленные результаты и выводы.
- `simulator/` — исследовательский движок, runners и тесты; спорные правила остаются явно provisional. `pass-history-conditioned-support.js` реконструирует pass-time hand и считает exact support под global-ever-open/current-only моделями; `pass-history-opponent-choice-softmax.js` сравнивает softmax action-likelihood по temperature grid.
- `runs/` — отчёты и машинно-читаемые данные отдельных воспроизводимых когорт.

## Принцип

Сначала корректность правил и движка, потом объём. Любой вывод должен хранить:
- версию правил/движка;
- число раздач;
- состав стратегий;
- seed/диапазон seed;
- метрику;
- уровень уверенности;
- известные ограничения.

Исторические результаты из чата сохраняются отдельно от новых прогонов.

## Latest checkpoint
2026-11-02T14:50:21+04:00: fresh disjoint softmax temperature grid on 100 joint-support multi-action positions (50 each 3–3 / 2–3); 599 exact state-world assignments and 8,694 paired rollouts. All first-finish regret shifts <1 pp with descriptive intervals including zero; no strategy promoted. See `qosha-research/runs/2026-11-02-1450-pass-history-opponent-choice-temperature-grid.md` and `.json`.
