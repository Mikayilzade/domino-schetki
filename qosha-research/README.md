# Qoşa açdı research

Исследовательская папка для правил, симуляций и практической стратегии Qoşa açdı.

Цель: не менять приложение-счётки, а отдельно накапливать воспроизводимые данные, чтобы потом разбирать реальные позиции и давать советы по игре.

## Структура

- `RULES.md` — текущая спецификация правил и отмеченные неясности.
- `EXPERIMENTS.md` — протокол почасовых симуляций.
- `RESULTS.md` — накопленные результаты и выводы.
- `simulator/` — исследовательский движок, runners и тесты; спорные правила остаются явно provisional. `pass-history-conditioned-support.js` реконструирует pass-time hand и считает exact support под global-ever-open/current-only моделями.
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
2026-11-02T11:00:37+04:00: fresh disjoint pass-history opponent-choice likelihood holdout. Exact pass-consistent hidden worlds reweighted by equal-prior random-legal/min-hand-pips/fast-doubles mixtures; balanced 3–3 and 2–3 strata; posterior-weighted decision regret and ESS reported separately. No strategy promoted.

See qosha-research/runs/2026-11-02-1100-pass-history-opponent-choice-likelihood.md and qosha-research/runs/2026-11-02-1100-pass-history-opponent-choice-likelihood.json. Reproducer/test: qosha-research/simulator/pass-history-opponent-choice-likelihood.js and qosha-research/simulator/pass-history-opponent-choice-likelihood-test.js.
