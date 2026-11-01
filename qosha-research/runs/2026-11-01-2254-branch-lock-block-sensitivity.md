# Qoşa açdı research checkpoint — 2026-11-01 22:54:59 +04 (Asia/Baku)

## Что проверено

- **500 новых раздач, 3×9**, seeds `3415120–3415619`, 500 уникальных распределений; 3,000 policy rounds, 104 блока.
- Global unlock vs local-side counterfactual: на 6,200 событиях локальная модель дала на 41.3% меньше legal actions; side choice менялся в 46.4%, выбранная группа камней — только в 0.6%. Это чувствительность модели, не подтверждение правила.
- При блоке минимальный остаток очков давал уникального кандидата в 101/104 случаях; контраст по числу камней совпал с ним лишь в 14/104. Реальный победитель/подсчёт блока не установлен.
- Deduplicated delay audit: 80 позиций, 1,920 hidden-world draws → 1,878 уникальных allocation внутри видимых состояний, 42 повтора. После dedup 3,756 paired continuations; интервалы finish-first включают ноль.

## Вывод

Надёжного тактического преимущества нет. Открытие числа действительно меняет мобильность следующего соперника в модели, но эффект на finish-first не подтверждён. Ветви и блок остаются provisional.

## Регрессия

Повторно прогнан исторический branch-lock contract cohort (500 deals, 11,795 positions, 41,451 action applications, 0 failures); он не добавлен к cumulative count. Fixtures: block 22, mixed-finish/block 11, scoring 1,056 assertions; новые runners 8 и 5 assertions — все прошли.

## Следующий шаг

Свежие seeds от `3416220`: выборка поздних позиций по размеру руки следующего соперника и повтор paired/deduplicated unlock-delay анализа. Параллельно нужен реальный игровой trace/ruling для открытия ветвей и подсчёта блока.

[Raw JSON](./2026-11-01-2254-branch-lock-block-sensitivity.json)
