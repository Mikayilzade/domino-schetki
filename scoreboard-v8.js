'use strict';

function metricForEntityV8(e,mode){
  if(mode==='qosha'){
    const pts=e.memberIds.map(id=>todayRating(state.players.find(p=>p.id===id)).points||0);
    return `★ ${Math.max(0,...pts)} бал.`;
  }
  return `🏆 ${entityWins(e,mode)}`;
}

renderEntityCard=function(e,mode){
  const selected=e.id===state.calculator.selectedEntityId,name=scoreNameForEntity(e);
  return `<div class="player-card ${selected?'selected':''} ${e.exploded?'exploded':''}"><button class="player-main" data-entity="${e.id}" ${e.exploded?'disabled':''}><small class="score-metric">${e.exploded?'ВЗОРВАН':metricForEntityV8(e,mode)}</small><span class="score-name ${scoreNameClass(name)}">${esc(name)}</span><strong>${e.score}</strong></button><button class="edit-btn" data-edit="${e.id}" aria-label="Исправить">✎</button></div>`;
};

function rosterSignature(e){return [...(e.memberIds||[])].sort().join('|');}
function reconcileGamesV8(){
  Object.keys(state.games||{}).forEach(mode=>{
    const g=state.games[mode]; if(!g||g.ended)return;
    const old=new Map((g.entities||[]).map(e=>[rosterSignature(e),e]));
    const fresh=buildEntities();
    fresh.forEach(e=>{const prev=old.get(rosterSignature(e));if(prev){e.score=prev.score;e.exploded=prev.exploded;}});
    g.entities=fresh; g.pendingResult=null;
  });
  const g=state.games?.[state.mode];
  if(g&&!g.entities.some(e=>e.id===state.calculator.selectedEntityId))state.calculator.selectedEntityId=g.entities.find(e=>!e.exploded)?.id||g.entities[0]?.id||null;
}

function achievementsV8(p){const s=normalizeStats(p.stats), r=s.rating||{};return[
  ['Первая партия',s.games>=1],['Первая победа',s.wins>=1],['5 побед',s.wins>=5],['10 партий',s.games>=10],['50 партий',s.games>=50],['Телефон взорван +35',s.instant35>=1],['100 рейтинговых баллов',(r.total||0)>=100],['10 минусов',s.minus.events>=10]
];}
function statsSectionV8(){return `<section class="menu-card"><div class="menu-title"><h2>Статистика и достижения</h2><span>за всё время</span></div>${state.players.map(p=>{const s=normalizeStats(p.stats),today=todayRating(p),ach=achievementsV8(p);return `<details><summary><b>${esc(p.fullName)}</b> · ${s.wins} побед · ${today.points} бал. сегодня</summary><div class="stats-grid-v8"><div class="stats-box"><b>${s.games}</b><span>партий</span></div><div class="stats-box"><b>${s.wins}</b><span>побед</span></div><div class="stats-box"><b>${s.rating.total||0}</b><span>рейтинговых баллов</span></div><div class="stats-box"><b>${s.instant35||0}</b><span>побед +35</span></div><div class="stats-box"><b>${s.minus.events||0}</b><span>минусов</span></div><div class="stats-box"><b>−${s.minus.sum||0}</b><span>сумма минусов</span></div></div><h3>Достижения</h3><div class="achievement-list">${ach.map(([n,on])=>`<div class="achievement ${on?'':'locked'}"><span>${on?'✓':'○'} ${n}</span></div>`).join('')}</div></details>`;}).join('')}</section>`;}
function archiveSectionV8(){return `<section class="menu-card"><div class="menu-title"><h2>Архив партий</h2><span>${state.archive.length}</span></div><div class="archive-list">${state.archive.slice().reverse().map((a,revIndex)=>{const number=state.archive.length-revIndex;const hist=a.history||[];return `<details class="archive-game"><summary><b>Партия ${number} · ${esc(MODES[a.mode]?.title||a.mode)}</b><span>${new Date(a.endedAt).toLocaleString()}</span></summary><p>${(a.entities||[]).map(e=>`${esc(scoreNameForEntity(e))} ${e.score}`).join(' · ')}</p><p>${hist.length||a.historyCount||0} записей</p><div class="archive-log">${hist.length?hist.map(h=>`<div class="archive-log-row"><time>${timeText(h.at)}</time><span>${esc(h.text||'')}</span></div>`).join(''):'<div class="empty">Подробный лог этой старой партии не сохранён</div>'}</div><div class="archive-id">ID: ${esc(a.id)}</div></details>`;}).join('')||'<div class="empty">Завершённых партий пока нет</div>'}</div></section>`;}

const renderMenuV7=renderMenu;
renderMenu=function(){
  let html=renderMenuV7();
  html=html.replace(/<section class="menu-card"><div class="menu-title"><h2>Архив партий<\/h2>[\s\S]*?<\/section>/,archiveSectionV8());
  html=html.replace('<section class="menu-card danger-zone">',statsSectionV8()+'<section class="menu-card danger-zone">');
  return html;
};

const bindV7=bind;
bind=function(){
  bindV7();
  document.querySelectorAll('[data-active],[data-team]').forEach(el=>{
    const old=el.onchange;
    el.onchange=()=>{if(old)old();reconcileGamesV8();save();render();};
  });
};
