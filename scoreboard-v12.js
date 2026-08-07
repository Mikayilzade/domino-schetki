'use strict';

const NICK_STORAGE_KEY_V12='domino-schetki-nicks-v1';

function readNickMapV12(){
  try{return JSON.parse(localStorage.getItem(NICK_STORAGE_KEY_V12)||'{}')||{};}catch{return{};}
}
function writeNickMapV12(){
  const map={};
  (state.players||[]).forEach(p=>{const n=String(p.nick||'').trim().slice(0,8);if(n)map[p.id]=n;});
  localStorage.setItem(NICK_STORAGE_KEY_V12,JSON.stringify(map));
}
function restoreNicksV12(){
  const map=readNickMapV12();
  (state.players||[]).forEach(p=>{if(map[p.id])p.nick=String(map[p.id]).slice(0,8);});
}
restoreNicksV12();

// Keep nicks outside the main state too, so future state migrations cannot drop them.
const saveV12Base=save;
save=function(){writeNickMapV12();return saveV12Base();};

function localDayFromIsoV12(iso){
  const d=new Date(iso);return Number.isNaN(d.getTime())?'':dayKey(d);
}
function archiveHasPlayerV12(a,p){
  if((a.result?.places||[]).some(x=>(x.memberIds||[]).includes(p.id)))return true;
  const tokens=[p.short, String(p.nick||'').trim(), String(p.fullName||'').trim().split(/\s+/)[0]].filter(Boolean);
  return (a.entities||[]).some(e=>{
    const short=String(e.short||'');const name=String(e.name||'');
    return tokens.some(t=>short.split('+').includes(t)||short===t||name===p.fullName||name.includes(t));
  });
}
function archivedScoreForPlayerV12(a,p){
  const tokens=[p.short,String(p.nick||'').trim(),String(p.fullName||'').trim().split(/\s+/)[0]].filter(Boolean);
  const e=(a.entities||[]).find(e=>{
    const short=String(e.short||'');const name=String(e.name||'');
    return tokens.some(t=>short.split('+').includes(t)||short===t||name===p.fullName||name.includes(t));
  });
  return Number(e?.score||0);
}
function subtractTodayMinusV12(s,today){
  const d=s.minus?.daily?.[today];if(!d)return;
  const events=Number(d.events??d.count??0),sum=Number(d.sum??d.total??0);
  s.minus.events=Math.max(0,Number(s.minus.events||0)-events);
  s.minus.sum=Math.max(0,Number(s.minus.sum||0)-sum);
  if(d.byAmount&&s.minus.byAmount){Object.entries(d.byAmount).forEach(([k,v])=>{s.minus.byAmount[k]=Math.max(0,Number(s.minus.byAmount[k]||0)-Number(v||0));});}
  delete s.minus.daily[today];
}
function resetTodayV12(){
  const today=dayKey();
  const removed=(state.archive||[]).filter(a=>localDayFromIsoV12(a.endedAt)===today);
  const removedIds=new Set(removed.map(a=>a.id));
  state.archive=(state.archive||[]).filter(a=>!removedIds.has(a.id));
  state.games={};
  state.modal=null;
  state.calculator.value='';

  (state.players||[]).forEach(p=>{
    const s=p.stats=normalizeStats(p.stats);
    delete s.modeDaily[today];
    delete s.rating.daily[today];
    subtractTodayMinusV12(s,today);

    // Rebuild the visible all-time counters from the archive that remains.
    const remaining=(state.archive||[]).filter(a=>archiveHasPlayerV12(a,p));
    s.games=remaining.length;
    s.points=remaining.reduce((n,a)=>n+archivedScoreForPlayerV12(a,p),0);
    s.wins=Object.values(s.modeDaily||{}).reduce((n,modes)=>n+Object.values(modes||{}).reduce((x,v)=>x+Number(v||0),0),0);
    s.rating.total=Object.values(s.rating.daily||{}).reduce((n,d)=>n+Number(d?.points||0),0);
    s.instant35=remaining.filter(a=>String(a.result?.message||'').includes('+35')&&(a.result?.places?.[0]?.memberIds||[]).includes(p.id)).length;
  });

  if(state.modeRanking?.daily)delete state.modeRanking.daily[today];
  if(state.modeRanking?.recordedGames)removedIds.forEach(id=>delete state.modeRanking.recordedGames[id]);
  state.screen='menu';
  ensureGame(state.mode);
  save();
  render();
}
function fullResetV12(){
  localStorage.removeItem(STORAGE_KEY);
  (typeof LEGACY_KEYS!=='undefined'?LEGACY_KEYS:[]).forEach(k=>localStorage.removeItem(k));
  localStorage.removeItem(NICK_STORAGE_KEY_V12);
  state=defaultState();
  state.screen='menu';
  state.games={};
  state.archive=[];
  if(typeof ensureModeRankingV10==='function')ensureModeRankingV10();
  save();
  render();
}

const renderMenuV12Base=renderMenu;
renderMenu=function(){
  return renderMenuV12Base()
    .replace('Сбросить текущие игры','Сбросить сегодняшний прогресс')
    .replace('Открывай этот раздел только когда действительно нужно удалить данные.','Сброс дня удаляет только данные сегодняшнего дня. Полный сброс удаляет вообще всё.');
};

// Capture reset clicks before the old handlers fire.
document.addEventListener('click',event=>{
  const btn=event.target?.closest?.('#reset-current,#reset-all');if(!btn)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(btn.id==='reset-current'){
    if(confirm('Удалить сегодняшние партии, победы, баллы, достижения за сегодня и текущие игры?'))resetTodayV12();
  }else{
    if(confirm('ПОЛНЫЙ СБРОС: удалить игроков, архив, статистику, достижения и ники?'))fullResetV12();
  }
},true);

// Save nickname immediately to a migration-proof store.
document.addEventListener('input',event=>{
  const el=event.target;if(!el?.matches?.('[data-nick]'))return;
  const p=state.players.find(x=>x.id===el.dataset.nick);if(!p)return;
  p.nick=String(el.value||'').trim().slice(0,8);writeNickMapV12();
},true);

document.addEventListener('change',event=>{
  const el=event.target;if(!el?.matches?.('[data-nick]'))return;
  const p=state.players.find(x=>x.id===el.dataset.nick);if(!p)return;
  p.nick=String(el.value||'').trim().slice(0,8);writeNickMapV12();save();
},true);

setTimeout(()=>{restoreNicksV12();try{render();}catch(e){console.error('render v12',e);}},0);
