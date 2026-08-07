'use strict';

// Track +35 wins explicitly. The stat existed before but was never incremented.
const confirmResultV18Base = confirmResult;
confirmResult = function(){
  const g = ensureGame();
  const r = g?.pendingResult;
  const isInstant35 = g?.mode === 'phone' && /\(\+35\)/.test(String(r?.message || ''));
  const winnerIds = isInstant35 ? [...(r?.places?.[0]?.memberIds || [])] : [];
  const result = confirmResultV18Base();
  if (isInstant35 && winnerIds.length){
    winnerIds.forEach(id => {
      const p = state.players.find(x => x.id === id);
      if (!p) return;
      p.stats = normalizeStats(p.stats);
      p.stats.instant35 = Number(p.stats.instant35 || 0) + 1;
    });
    save();
    render();
  }
  return result;
};

function achievementProgressV18(p){
  const s = normalizeStats(p.stats), r = s.rating || {};
  const rows = [
    ['Первая партия', s.games >= 1, 'Завершить первую сохранённую партию.', `${Math.min(s.games,1)}/1`],
    ['Первая победа', s.wins >= 1, 'Впервые занять первое место.', `${Math.min(s.wins,1)}/1`],
    ['5 побед', s.wins >= 5, 'Набрать пять побед за всё время.', `${Math.min(s.wins,5)}/5`],
    ['10 партий', s.games >= 10, 'Завершить десять партий.', `${Math.min(s.games,10)}/10`],
    ['50 партий', s.games >= 50, 'Стать постоянным игроком — 50 партий.', `${Math.min(s.games,50)}/50`],
    ['Телефон взорван +35', Number(s.instant35||0) >= 1, 'Выиграть Телефон одной записью +35 до порога 300.', `${Math.min(Number(s.instant35||0),1)}/1`],
    ['100 рейтинговых баллов', Number(r.total||0) >= 100, 'Накопить 100 рейтинговых баллов.', `${Math.min(Number(r.total||0),100)}/100`],
    ['10 минусов', Number(s.minus?.events||0) >= 10, 'Сделать десять минусовых записей. Ошибочно реверснутые не считаются.', `${Math.min(Number(s.minus?.events||0),10)}/10`],
    ['Всех оставил сухими', Number(p?.stats?.drySweeps||0) >= 1, 'Выиграть Телефон при 365+, когда все соперники остались ниже 225.', `${Math.min(Number(p?.stats?.drySweeps||0),1)}/1`]
  ];
  return rows;
}

// Replace the stats block with one that also shows progress for locked achievements.
statsSectionV8 = function(){
  return `<section class="menu-card"><div class="menu-title"><h2>Статистика и достижения</h2><span>за всё время</span></div>${state.players.map(p=>{
    const s=normalizeStats(p.stats),today=typeof todayRatingV8==='function'?todayRatingV8(p):{points:0},ach=achievementProgressV18(p);
    return `<details><summary><b>${esc(p.fullName)}</b> · ${s.wins} побед · ${today.points||0} бал. сегодня</summary><div class="stats-grid-v8"><div class="stats-box"><b>${s.games}</b><span>партий</span></div><div class="stats-box"><b>${s.wins}</b><span>побед</span></div><div class="stats-box"><b>${s.rating.total||0}</b><span>рейтинговых баллов</span></div><div class="stats-box"><b>${s.instant35||0}</b><span>побед +35</span></div><div class="stats-box"><b>${s.minus.events||0}</b><span>минусов</span></div><div class="stats-box"><b>−${s.minus.sum||0}</b><span>сумма минусов</span></div></div><h3>Достижения</h3><div class="achievement-list">${ach.map(([n,on,d,progress])=>`<div class="achievement ${on?'':'locked'}"><div class="achievement-head-v18"><b>${on?'✓':'○'} ${esc(n)}</b><span>${esc(progress)}</span></div><small>${esc(d)}</small></div>`).join('')}</div></details>`;
  }).join('')}</section>`;
};

// Always ask iOS for a fresh worker; using a versioned worker URL prevents a stale
// installed PWA from running a mixed set of old/new modules.
window.addEventListener('load', async ()=>{
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./sw.js?v=18', { updateViaCache:'none' });
    await reg.update();
  } catch (e) { console.warn('SW v18 update', e); }
});

setTimeout(()=>{try{render();}catch(e){console.error('render v18',e);}},0);
