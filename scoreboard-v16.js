'use strict';

function drawPlacesV16(entities,points){
  return entities.map(e=>typeof displayPlaceV14==='function'?displayPlaceV14(e,points):({...e,points}));
}
function terminalTieV16(g,trigger){
  if(!g||!trigger)return[];
  if(g.mode==='classic')return (g.entities||[]).filter(e=>!e.exploded&&e.score>=101&&e.score===trigger.score);
  if(g.mode==='phone')return (g.entities||[]).filter(e=>!e.exploded&&e.score>=365&&e.score===trigger.score);
  return[];
}

const evaluateV16Base=evaluate;
evaluate=function(g,e,delta){
  evaluateV16Base(g,e,delta);
  if(!g?.pendingResult)return;
  if(g.mode==='classic'||g.mode==='phone'){
    const tied=terminalTieV16(g,e);
    if(tied.length>1){
      g.pendingResult={message:`Ничья: ${tied.map(scoreNameForEntity).join(' и ')}`,places:drawPlacesV16(tied,1),isDrawV16:true};
    }
    return;
  }
  if(g.mode==='qosha'){
    const alive=(g.entities||[]).filter(x=>!x.exploded);
    if(alive.length===2&&alive[0].score===alive[1].score&&g.pendingResult){
      g.pendingResult={message:`Ничья: ${alive.map(scoreNameForEntity).join(' и ')}`,places:drawPlacesV16(alive,1.5),isDrawV16:true};
    }
  }
};

const confirmResultV16Base=confirmResult;
confirmResult=function(){
  const g=ensureGame(),r=g?.pendingResult;
  if(!r?.isDrawV16)return confirmResultV16Base();
  const gameId=g.id;
  const before=new Map(state.players.map(p=>[p.id,{wins:Number(p.stats?.wins||0),modeDaily:JSON.parse(JSON.stringify(p.stats?.modeDaily||{}))}]));
  const result=confirmResultV16Base();
  state.players.forEach(p=>{const snap=before.get(p.id);if(!snap)return;p.stats=normalizeStats(p.stats);p.stats.wins=snap.wins;p.stats.modeDaily=snap.modeDaily;});
  const archived=(state.archive||[]).find(a=>a.id===gameId);
  if(archived){archived.isDraw=true;if(archived.result)archived.result.isDraw=true;}
  save();
  return result;
};

function updateHelpV16(html){
  html=html.replace('Первый достигший 101 или больше выигрывает партию.','Первый достигший 101 или больше выигрывает партию. При ничьей участники ничьей получают по 1 рейтинговому баллу; победа никому не засчитывается.');
  html=html.replace('После 300 игроку больше не записывается остаток руки, но очки «в игре» продолжают считаться.</p>','После 300 игроку больше не записывается остаток руки, но очки «в игре» продолжают считаться. Обычная победа даёт 1 рейтинговый балл; за каждую сухую сторону ниже 225 при победе на 365+ добавляется ещё +1. При ничьей участники получают по 1 баллу, победа никому не засчитывается.</p>');
  html=html.replace('Если остаются двое, меньший счёт получает 2 дневных балла, второй — 1. Если остаётся один — он получает 3.','Если остаются двое, меньший счёт получает 2 дневных балла, второй — 1. Если их счёт одинаковый — ничья, по 1.5 балла каждому. Если остаётся один — он получает 3.');
  html=html.replace('Когда приложение определит исход партии, оно только предложит результат. Победа и баллы сохраняются после подтверждения.','Когда приложение определит исход партии, оно только предложит результат. Победа, ничья и рейтинговые баллы сохраняются после подтверждения.');
  return html;
}
const renderMenuV16Base=renderMenu;
renderMenu=function(){return updateHelpV16(renderMenuV16Base());};

setTimeout(()=>{try{render();}catch(e){console.error('render v16',e);}},0);
