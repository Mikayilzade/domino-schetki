'use strict';

// Resilient navigation that does not depend on the layered bind() wrappers.
document.addEventListener('click', event => {
  const open = event.target?.closest?.('#open-menu');
  if (open) {
    event.preventDefault();
    state.screen = 'menu';
    state.modal = null;
    try { save(); } catch (e) { console.warn(e); }
    render();
    return;
  }

  const back = event.target?.closest?.('#back-score');
  if (back) {
    event.preventDefault();
    state.screen = 'score';
    state.modal = null;
    try { save(); } catch (e) { console.warn(e); }
    render();
  }
}, true);
