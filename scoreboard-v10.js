'use strict';

function ensureModeRankingV10(){
  if(!state.modeRanking) state.modeRanking={recordedGames:{},daily:{}};
  state.modeRanking.recordedGames=state.modeRanking.recordedGames||{};
  state.modeRanking.daily=state.modeRanking.daily||{};
  if(!state.analytics) state.analytics={mode:'all',period:'week',anchor:dayKey(),month:dayKey().slice(0,7),from:dayKey(),to:dayKey(),players:[]};
  state.analytics.mode=state.analytics.mode||'all';
  state.analytics.period=state.analytics.period||'week';
  state.analytics.anchor=state.analytics.anchor||dayKey();
  state.analytics.month=state.analytics.month||dayKey().slice(0,7);
  state.analytics.from=state.analytics.from||dayKey();
  state.analytics.to=state.analytics.to||dayKey();
  state.analytics.players=Array.isArray(state.analytics.players)?state.analytics.players:[];
}
function rankDayBucketV10(dateKey,mode){
  ensureModeRankingV10();
  state.modeRanking.daily[dateKey]=state.modeRanking.daily[dateKey]||{};
  state.modeRanking.daily[dateKey][mode]=state.modeRanking.daily[dateKey][mode]||{};
  return state.modeRanking.daily[dateKey][mode];
}
function addModeRankV10(mode,playerId,points,dateKey=dayKey()){
  const bucket=rankDayBucketV10(dateKey,mode);
  bucket[playerId]=(bucket[playerId]||0)+Number(points||0);
}
function recordPendingResultV10(){
  ensureModeRankingV10();
  const g=state.games?.[state.mode],r=g?.pendingResult;
  if(!g||!r||state.modeRanking.recordedGames[g.id])return;
  (r.places||[]).forEach(place=>{
    let e=null;
    if(place.id)e=g.entities.find(x=>x.id===place.id);
    if(!e&&place.entityId)e=g.entities.find(x=>x.id===place.entityId);
    if(!e)e=g.entities.find(x=>x.short===place.short||x.name===place.name);
    if(!e)return;
    (e.memberIds||[]).forEach(pid=>addModeRankV10(g.mode,pid,place.points||0));
  });
  state.modeRanking.recordedGames[g.id]=true;
  save();
}
if(typeof confirmResult==='function'){
  const confirmResultV9=confirmResult;
  confirmResult=function(){recordPendingResultV10();return confirmResultV9();};
}

function parseDateKeyV10(k){const [y,m,d]=String(k).split('-').map(Number);return new Date(y,m-1,d);}
function keyFromDateV10(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function keysBetweenV10(from,to){
  const a=parseDateKeyV10(from),b=parseDateKeyV10(to),out=[];
  if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))return out;
  const start=a<=b?a:b,end=a<=b?b:a;
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))out.push(keyFromDateV10(d));
  return out;
}
function calendarWeekV10(anchor){
  const d=parseDateKeyV10(anchor),day=d.getDay()||7;
  const monday=new Date(d);monday.setDate(d.getDate()-day+1);
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  return {from:keyFromDateV10(monday),to:keyFromDateV10(sunday)};
}
function calendarMonthV10(month){
  const [y,m]=String(month).split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0);
  return {from:keyFromDateV10(first),to:keyFromDateV10(last)};
}
function analyticsRangeV10(){
  ensureModeRankingV10();const a=state.analytics;
  if(a.period==='all')return null;
  if(a.period==='day')return {from:a.anchor,to:a.anchor};
  if(a.period==='week')return calendarWeekV10(a.anchor);
  if(a.period==='month')return calendarMonthV10(a.month);
  return {from:a.from,to:a.to};
}
function analyticsLabelV10(){
  const a=state.analytics,r=analyticsRangeV10();
  if(a.period==='all')return 'Всё время';
  if(a.period==='day')return new Date(`${r.from}T12:00:00`).toLocaleDateString();
  if(a.period==='week')return `${new Date(`${r.from}T12:00:00`).toLocaleDateString()} — ${new Date(`${r.to}T12:00:00`).toLocaleDateString()} · Пн–Вс`;
  if(a.period==='month'){const [y,m]=a.month.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString([], {month:'long',year:'numeric'});}
  return `${new Date(`${r.from}T12:00:00`).toLocaleDateString()} — ${new Date(`${r.to}T12:00:00`).toLocaleDateString()}`;
}
function selectedPlayerIdsV10(){ensureModeRankingV10();return state.analytics.players.length?state.analytics.players:state.players.map(p=>p.id);}
function analyticsScoresV10(){
  ensureModeRankingV10();const a=state.analytics,r=analyticsRangeV10();
  const keys=r?keysBetweenV10(r.from,r.to):Object.keys(state.modeRanking.daily);
  const modes=a.mode==='all'?Object.keys(MODES):[a.mode],totals={};
  keys.forEach(k=>modes.forEach(mode=>{const b=state.modeRanking.daily?.[k]?.[mode]||{};Object.entries(b).forEach(([pid,v])=>totals[pid]=(totals[pid]||0)+Number(v||0));}));
  const allowed=new Set(selectedPlayerIdsV10());
  return state.players.filter(p=>allowed.has(p.id)).map(p=>({p,points:totals[p.id]||0})).sort((x,y)=>y.points-x.points||x.p.fullName.localeCompare(y.p.fullName));
}
function periodControlsV10(){
  const a=state.analytics;
  const extra=a.period==='day'||a.period==='week'?`<label>Дата<input type="date" id="rank-anchor" value="${esc(a.anchor)}"></label>`:a.period==='month'?`<label>Месяц<input type="month" id="rank-month" value="${esc(a.month)}"></label>`:a.period==='custom'?`<label>С<input type="date" id="rank-from" value="${esc(a.from)}"></label><label>По<input type="date" id="rank-to" value="${esc(a.to)}"></label>`:'';
  return `<div class="analytics-controls-v10"><label>Игра<select id="rank-mode"><option value="all" ${a.mode==='all'?'selected':''}>Все режимы</option>${Object.entries(MODES).map(([id,m])=>`<option value="${id}" ${a.mode===id?'selected':''}>${esc(m.title)}</option>`).join('')}</select></label><label>Период<select id="rank-period"><option value="day" ${a.period==='day'?'selected':''}>День</option><option value="week" ${a.period==='week'?'selected':''}>Календарная неделя</option><option value="month" ${a.period==='month'?'selected':''}>Месяц</option><option value="custom" ${a.period==='custom'?'selected':''}>Свой диапазон</option><option value="all" ${a.period==='all'?'selected':''}>Всё время</option></select></label>${extra}</div>`;
}
function playerFilterV10(){
  const chosen=new Set(selectedPlayerIdsV10());
  return `<div class="player-filter-v10"><div class="filter-head-v10"><b>Игроки</b><button id="rank-toggle-all">${state.analytics.players.length?'Выбрать всех':'Снять всех'}</button></div><div class="player-chips-v10">${state.players.map(p=>`<label class="player-chip-v10"><input type="checkbox" data-rank-player="${p.id}" ${chosen.has(p.id)?'checked':''}><span>${esc(scoreNameForPlayer(p))}</span></label>`).join('')}</div></div>`;
}
function resultTableV10(){
  const rows=analyticsScoresV10();
  return `<div class="analytics-result-v10"><div class="analytics-label-v10">${esc(analyticsLabelV10())}</div>${rows.length?rows.map((r,i)=>`<div class="rank-row-big-v10"><span><b>${i+1}</b> ${esc(scoreNameForPlayer(r.p))}</span><strong>${r.points} бал.</strong></div>`).join(''):'<div class="empty">Игроки не выбраны</div>'}</div>`;
}
function leaderboardSectionV10(){
  return `<section class="menu-card leaderboard-v10"><details open><summary><b>Итоги и рейтинг</b><span>день · неделя · месяц · период</span></summary><p class="note">Неделя считается календарно: с понедельника по воскресенье. Выбери игру, период и игроков — таблица пересчитается автоматически.</p>${periodControlsV10()}${playerFilterV10()}${resultTableV10()}</details></section>`;
}

function achievementsV10(p){const s=normalizeStats(p.stats),r=s.rating||{};return[
  ['Первая партия',s.games>=1,'Завершить первую сохранённую партию.'],
  ['Первая победа',s.wins>=1,'Впервые занять первое место.'],
  ['5 побед',s.wins>=5,'Набрать пять побед за всё время.'],
  ['10 партий',s.games>=10,'Завершить десять партий.'],
  ['50 партий',s.games>=50,'Стать постоянным игроком — 50 партий.'],
  ['Телефон взорван +35',s.instant35>=1,'Выиграть Телефон одной записью +35 до порога 300.'],
  ['100 рейтинговых баллов',(r.total||0)>=100,'Накопить 100 баллов за места.'],
  ['10 минусов',s.minus.events>=10,'Получить десять отдельных минусовых записей.']
];}
achievementsV8=achievementsV10;
statsSectionV8=function(){return `<section class="menu-card"><div class="menu-title"><h2>Статистика и достижения</h2><span>за всё время</span></div>${state.players.map(p=>{const s=normalizeStats(p.stats),today=todayRating(p),ach=achievementsV10(p);return `<details><summary><b>${esc(p.fullName)}</b> · ${s.wins} побед · ${today.points} бал. сегодня</summary><div class="stats-grid-v8"><div class="stats-box"><b>${s.games}</b><span>партий</span></div><div class="stats-box"><b>${s.wins}</b><span>побед</span></div><div class="stats-box"><b>${s.rating.total||0}</b><span>рейтинговых баллов</span></div><div class="stats-box"><b>${s.instant35||0}</b><span>побед +35</span></div><div class="stats-box"><b>${s.minus.events||0}</b><span>минусов</span></div><div class="stats-box"><b>−${s.minus.sum||0}</b><span>сумма минусов</span></div></div><h3>Достижения</h3><div class="achievement-list">${ach.map(([n,on,d])=>`<div class="achievement ${on?'':'locked'}"><b>${on?'✓':'○'} ${n}</b><small>${esc(d)}</small></div>`).join('')}</div></details>`;}).join('')}</section>`;};

const renderMenuV9=renderMenu;
renderMenu=function(){
  let html=renderMenuV9();
  html=html.replace('<section class="menu-card danger-zone">',leaderboardSectionV10()+'<section class="menu-card danger-zone">');
  html=html.replace(/<section class="menu-card danger-zone"><h2>Данные<\/h2>([\s\S]*?)<\/section>/,`<section class="menu-card danger-zone safe-data-v10"><details><summary><b>Данные и сброс</b><span>закрыто для безопасности</span></summary><p class="note">Открывай этот раздел только когда действительно нужно удалить данные.</p>$1</details></section>`);
  return html;
};

const bindV10Base=bind;
bind=function(){
  bindV10Base();ensureModeRankingV10();
  document.getElementById('rank-mode')?.addEventListener('change',e=>{state.analytics.mode=e.target.value;render();});
  document.getElementById('rank-period')?.addEventListener('change',e=>{state.analytics.period=e.target.value;render();});
  document.getElementById('rank-anchor')?.addEventListener('change',e=>{state.analytics.anchor=e.target.value||dayKey();render();});
  document.getElementById('rank-month')?.addEventListener('change',e=>{state.analytics.month=e.target.value||dayKey().slice(0,7);render();});
  document.getElementById('rank-from')?.addEventListener('change',e=>{state.analytics.from=e.target.value||dayKey();render();});
  document.getElementById('rank-to')?.addEventListener('change',e=>{state.analytics.to=e.target.value||dayKey();render();});
  document.querySelectorAll('[data-rank-player]').forEach(el=>el.addEventListener('change',()=>{
    const all=state.players.map(p=>p.id),selected=[...document.querySelectorAll('[data-rank-player]:checked')].map(x=>x.dataset.rankPlayer);
    state.analytics.players=selected.length===all.length?[]:selected;render();
  }));
  document.getElementById('rank-toggle-all')?.addEventListener('click',()=>{state.analytics.players=state.analytics.players.length?[]:state.players.map(p=>p.id);render();});
};

setTimeout(()=>{try{render();}catch(e){console.error(e);}},0);
