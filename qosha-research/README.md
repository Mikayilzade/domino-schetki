# Qoşa açdı research

Исследовательская папка для правил, симуляций и практической стратегии Qoşa açdı.

Цель: не менять приложение-счётки, а отдельно накапливать воспроизводимые данные, чтобы потом разбирать реальные позиции и давать советы по игре.

## Структура

- `RULES.md` — текущая спецификация правил и отмеченные неясности.
- `EXPERIMENTS.md` — протокол почасовых симуляций.
- `RESULTS.md` — накопленные результаты и выводы.
- `simulator/` — исследовательский движок, runners, тесты и trace-calibration utilities; спорные правила остаются явно provisional. `pass-history-conditioned-support.js` реконструирует pass-time hand и считает exact support; opponent-choice softmax runners исследуют likelihood assumptions; `pass-history-trace-temperature-calibration.js` готовит leakage-safe calibration по реальным decision traces и считает cluster-robust uncertainty по round-seat группам.
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

## Current execution status (2026-11-14 21:53 Asia/Baku)

**Validation remains blocked, not green.** The executable shell has Node v22.16.0 but `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still fails with `Could not resolve host: github.com`. The GitHub connector can read/write individual files but does not itself supply an executable checkout. The preflight recursively checks all simulator JS/JSON files and their literal relative imports; a partial copy of only the 17 test entrypoints is insufficient.

**Verified runtime status:** 0/17 full gameplay suites and 0/4 hidden-world suites executed in the current blocked environment. No new strategy deals or Monte Carlo samples from this checkpoint. Historical 180,000 matched-seat rounds are a separate legacy subtotal, **not** an all-time count. Self-contained exact opening oracles have been tested separately, but do not validate the gameplay engine. Branch unlock, block allocation, and `loneZero=10` remain provisional.

**Recovery plan:** obtain a complete research-only simulator checkout (including unreferenced JS/JSON utilities) through restored DNS or a verified connector-based reconstruction. Run `node qosha-research/simulator/validation-checkout-preflight.js`, then `validation-gate.js` and `hidden-world-validation-gate.js`, archive actual JSON and timings under `qosha-research/runs/`, then execute both fingerprint replays and repair failures before resuming matched-seed strategy comparisons. Do not modify live PWA files or create GitHub Actions. Dated details are in `STATUS.md` and `RESULTS.md`.
