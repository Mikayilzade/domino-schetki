'use strict';

function ensureModeRankingV10(){
  if(!state.modeRanking) state.modeRanking={recordedGames:{},daily:{}};
  state.modeRanking.recordedGames=state.modeRanking.recordedGames||{};
  state.modeRanking.daily=state.modeRanking.daily||{};
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
  const g=state.games?.[state.mode];
  const r=g?.pendingResult;
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

function dateKeysV10(days){
  const out=[]; const d=new Date();
  for(let i=0;i<days;i++){const x=new Date(d);x.setDate(d.getDate()-i);out.push(dayKey(x));}
  return out;
}
function modeScoresV10(mode,period){
  ensureModeRankingV10();
  const keys=period==='today'?[dayKey()]:period==='week'?dateKeysV10(7):Object.keys(state.modeRanking.daily);
  const totals={};
  keys.forEach(k=>{const b=state.modeRanking.daily?.[k]?.[mode]||{};Object.entries(b).forEach(([pid,v])=>totals[pid]=(totals[pid]||0)+Number(v||0));});
  return state.players.map(p=>({p,points:totals[p.id]||0})).sort((a,b)=>b.points-a.points||a.p.fullName.localeCompare(b.p.fullName));
}
function miniBoardV10(mode,period,title){
  const rows=modeScoresV10(mode,period).slice(0,5);
  return `<div class="mini-board-v10"><h4>${title}</h4>${rows.map((r,i)=>`<div class="rank-row-v10"><span>${i+1}. ${esc(scoreNameForPlayer(r.p))}</span><b>${r.points}</b></div>`).join('')}</div>`;
}
function leaderboardSectionV10(){
  return `<section class="menu-card leaderboard-v10"><details><summary><b>Рейтинг по режимам</b><span>Сегодня · 7 дней · всё время</span></summary><p class="note">Баллы: 1-е место — 2, 2-е — 1, остальные — 0; при полном разгроме — 3. Рейтинг считается отдельно для каждого режима.</p>${Object.keys(MODES).map(mode=>`<details class="mode-rank-v10" ${mode===state.mode?'open':''}><summary><b>${esc(MODES[mode].title)}</b></summary><div class="rank-periods-v10">${miniBoardV10(mode,'today','Сегодня')}${miniBoardV10(mode,'week','7 дней')}${miniBoardV10(mode,'all','Всё время')}</div></details>`).join('')}</details></section>`;
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

setTimeout(()=>{try{render();}catch(e){console.error(e);}},0);
