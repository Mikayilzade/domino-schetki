'use strict';

function refreshEntityLabelsV14(g){
  if(!g?.entities)return;
  g.entities.forEach(e=>{e.short=scoreNameForEntity(e);});
}

const buildEntitiesV14Base=buildEntities;
buildEntities=function(){
  const entities=buildEntitiesV14Base();
  entities.forEach(e=>{e.short=scoreNameForEntity(e);});
  return entities;
};
Object.values(state.games||{}).forEach(refreshEntityLabelsV14);

function phoneDryOpponentsV14(g,winnerId){
  return (g.entities||[]).filter(e=>e.id!==winnerId&&Number(e.score||0)<225).length;
}
function phoneWinnerPointsV14(g,winner){
  if(Number(winner?.score||0)<365)return 1;
  return 1+phoneDryOpponentsV14(g,winner.id);
}
function displayPlaceV14(e,points){
  return {...e,short:scoreNameForEntity(e),displayName:scoreNameForEntity(e),points};
}

rankNormal=function(g,winnerId){
  refreshEntityLabelsV14(g);
  const winner=g.entities.find(e=>e.id===winnerId);
  if(!winner)return[];
  const points=g.mode==='phone'?phoneWinnerPointsV14(g,winner):1;
  return[displayPlaceV14(winner,points)];
};

evaluate=function(g,e,delta){
  refreshEntityLabelsV14(g);
  if(g.pendingResult)return;
  const name=scoreNameForEntity(e);
  if(g.mode==='classic'&&e.score>=101){
    g.pendingResult={message:`Победил ${name}`,places:rankNormal(g,e.id)};
    return;
  }
  if(g.mode==='phone'){
    const before=e.score-delta;
    const nobody300=g.entities.every(x=>x.id===e.id?before<300:x.score<300);
    if(state.calculator.phoneKind==='play'&&delta===35&&nobody300){
      g.pendingResult={message:`Победил ${name} (+35)`,places:rankNormal(g,e.id)};
      return;
    }
    if(e.score>=365){
      const dry=phoneDryOpponentsV14(g,e.id),bonus=dry?` · сухих: ${dry}`:'';
      g.pendingResult={message:`Победил ${name}${bonus}`,places:rankNormal(g,e.id),phoneDryCount:dry};
      return;
    }
  }
  if(g.mode==='qosha'&&e.score>=101){
    e.exploded=true;
    addHistory(g,{type:'system',text:`${name} взорвался на ${e.score}`,reversible:false});
    const alive=g.entities.filter(x=>!x.exploded);
    if(alive.length<=2){
      const sorted=[...alive].sort((a,b)=>a.score-b.score);
      const places=sorted.length===1
        ?[displayPlaceV14(sorted[0],3)]
        :[displayPlaceV14(sorted[0],2),displayPlaceV14(sorted[1],1)];
      g.pendingResult={message:sorted.length===1?`${scoreNameForEntity(sorted[0])} остался один`:`${scoreNameForEntity(sorted[0])} и ${scoreNameForEntity(sorted[1])} остались в игре`,places};
    }
  }
};

const confirmResultV14Base=confirmResult;
confirmResult=function(){
  const g=ensureGame(),r=g.pendingResult;
  if(!r)return;
  refreshEntityLabelsV14(g);
  const gameId=g.id;
  const snapshots=g.entities.map(e=>({
    id:e.id,
    name:e.name,
    short:scoreNameForEntity(e),
    displayName:scoreNameForEntity(e),
    memberIds:[...(e.memberIds||[])],
    score:e.score,
    exploded:!!e.exploded
  }));
  if(g.mode==='phone'&&Number(r.phoneDryCount||0)>0){
    const winner=r.places?.[0];
    const allOpponentsDry=Number(r.phoneDryCount||0)===(g.entities.length-1);
    if(allOpponentsDry&&winner){
      (winner.memberIds||[]).forEach(id=>{
        const p=state.players.find(x=>x.id===id);if(!p)return;
        p.stats=normalizeStats(p.stats);p.stats.drySweeps=Number(p.stats.drySweeps||0)+1;
      });
    }
  }
  const result=confirmResultV14Base();
  const archived=(state.archive||[]).find(a=>a.id===gameId);
  if(archived){
    archived.entities=snapshots;
    if(archived.result?.places)archived.result.places=archived.result.places.map(x=>({...x,short:x.displayName||x.short}));
  }
  save();
  return result;
};

const achievementsV14Base=achievementsV10;
achievementsV10=function(p){
  const base=achievementsV14Base(p);
  return [...base,['Всех оставил сухими',Number(p?.stats?.drySweeps||0)>=1,'Выиграть Телефон при 365+, когда все соперники остались ниже 225.']];
};
achievementsV8=achievementsV10;

function archiveEntityNameV14(e){
  if(e.displayName)return e.displayName;
  if((e.memberIds||[]).length)return scoreNameForEntity(e);
  return e.short||e.name||'Игрок';
}
archiveSectionV8=function(){return `<section class="menu-card"><div class="menu-title"><h2>Архив партий</h2><span>${state.archive.length}</span></div><div class="archive-list">${state.archive.slice().reverse().map((a,revIndex)=>{const number=state.archive.length-revIndex,hist=a.history||[];return `<details class="archive-game"><summary><b>Партия ${number} · ${esc(MODES[a.mode]?.title||a.mode)}</b><span>${new Date(a.endedAt).toLocaleString()}</span></summary><p>${(a.entities||[]).map(e=>`${esc(archiveEntityNameV14(e))} ${e.score}`).join(' · ')}</p><p>${hist.length||a.historyCount||0} записей</p><div class="archive-log">${hist.length?hist.map(h=>`<div class="archive-log-row"><time>${timeText(h.at)}</time><span>${esc(h.text||'')}</span></div>`).join(''):'<div class="empty">Подробный лог этой старой партии не сохранён</div>'}</div><div class="archive-id">ID: ${esc(a.id)}</div></details>`;}).join('')||'<div class="empty">Завершённых партий пока нет</div>'}</div></section>`;};

// Refresh labels immediately so current unfinished games also stop using initials.
Object.values(state.games||{}).forEach(refreshEntityLabelsV14);
save();
setTimeout(()=>{try{render();}catch(e){console.error('render v14',e);}},0);
