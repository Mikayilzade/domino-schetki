'use strict';

MODES.qosha.target = 101;
MODES.qosha.note = 'Игра до 101: штрафы и минусы за гошу';

const checkWinnerBeforeQosha101 = checkWinner;
checkWinner = function checkWinnerWithQosha101(entity, amount, isHand) {
  checkWinnerBeforeQosha101(entity, amount, isHand);
  if (!state.game.winnerId && state.game.mode === 'qosha' && entity.score >= 101) {
    state.game.winnerId = entity.id;
  }
};

render();
