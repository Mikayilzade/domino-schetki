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

2026-11-02 09:52 +04: fresh disjoint pass-history Cohort D: 12,424 unique deals, 264 joint-support multi-action states, 1,512 exact state-world assignments, 32,944 paired rollouts across four continuation profiles. Exploratory model-gap stratification is larger for 3–3 than 2–3 opponent hands; no tactic promoted.

See qosha-research/runs/2026-11-02-0952-pass-history-joint-support-cohort-D.md and JSON data. Reproducer and regression: qosha-research/simulator/pass-history-cohort-strata-audit.js and qosha-research/simulator/pass-history-cohort-strata-audit-test.js.
