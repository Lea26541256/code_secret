(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const colors = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
  const labels = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet'];
  const choices = byId('choices');
  function swatch(color) {
    const node = document.createElement('span');
    node.className = 'swatch';
    node.dataset.color = color;
    node.style.setProperty('--color', `var(--${color})`);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }
  for (let i = 0; i < 4; i++) {
    const label = document.createElement('label');
    label.className = 'position';
    const title = document.createElement('span');
    title.className = 'position-label';
    title.textContent = `POSITION ${i + 1}`;
    const select = document.createElement('select');
    select.id = `position-${i + 1}`;
    select.setAttribute('aria-label', `Couleur en position ${i + 1}`);
    select.add(new Option('Choisir', ''));
    colors.forEach((color, index) => select.add(new Option(labels[index], color)));
    label.append(title, swatch(''), select);
    choices.append(label);
  }
  colors.forEach((color, index) => {
    const item = document.createElement('span');
    item.className = 'palette-item';
    item.append(swatch(color), document.createTextNode(labels[index]));
    byId('palette').append(item);
  });
  const selects = Array.from(choices.querySelectorAll('select'));
  function updateDraft() {
    selects.forEach(select => {
      const peg = select.previousElementSibling;
      peg.dataset.color = select.value;
      peg.style.setProperty('--color', `var(--${select.value})`);
    });
    byId('selected-count').textContent = `${selects.filter(select => select.value).length} / 4 couleurs choisies`;
  }
  function clearDraft() { selects.forEach(select => { select.value = ''; }); updateDraft(); }
  function render(state, action) {
    if (action === 'start' || action === 'guess') clearDraft();
    byId('counter').textContent = `${state.attempts} / 10 essais`;
    byId('remaining').textContent = state.status === 'won' || state.status === 'lost'
      ? 'Partie terminée' : `${10 - state.attempts} disponibles`;
    const playing = state.status === 'playing';
    choices.disabled = !playing;
    byId('submit').disabled = !playing;
    byId('clear').disabled = !playing;
    byId('status').textContent = state.status === 'not-started' ? 'Prêt ? Lancez une nouvelle partie.' :
      state.status === 'won' ? `Code trouvé ! Bravo, victoire en ${state.attempts} essai${state.attempts > 1 ? 's' : ''}.` :
      state.status === 'lost' ? 'Dix essais écoulés. Partie perdue. Une nouvelle énigme vous attend !' :
      state.lastResult ? `${state.lastResult.wellPlaced} bien placée(s), ${state.lastResult.misplaced} mal placée(s). À vous de poursuivre.` :
      'Le code est choisi. Suivez votre intuition !';
    byId('error').textContent = playing && state.lastError ? state.lastError.message : '';
    byId('empty-history').hidden = state.history.length > 0;
    byId('history').replaceChildren();
    state.history.forEach((entry, index) => {
      const row = document.createElement('li');
      row.className = 'history-row' + (entry.result.wellPlaced === 4 ? ' winning' : '');
      const number = document.createElement('span');
      number.className = 'attempt-number'; number.textContent = String(index + 1).padStart(2, '0');
      number.setAttribute('aria-label', `Essai ${index + 1}`);
      const pegs = document.createElement('div'); pegs.className = 'guess-pegs';
      entry.guess.forEach(color => {
        const peg = document.createElement('span'); peg.className = 'history-peg';
        peg.append(swatch(color), document.createTextNode(labels[colors.indexOf(color)])); pegs.append(peg);
      });
      const result = document.createElement('div'); result.className = 'result';
      result.innerHTML = `<div><strong>${entry.result.wellPlaced}</strong> bien placée(s)</div><div><strong>${entry.result.misplaced}</strong> mal placée(s)</div>`;
      row.append(number, pegs, result); byId('history').append(row);
    });
  }
  const game = window.CodeSecretEngine.createGame(render);
  delete window.CodeSecretEngine;
  selects.forEach(select => select.addEventListener('change', updateDraft));
  byId('clear').addEventListener('click', () => { clearDraft(); selects[0].focus(); });
  byId('restart').addEventListener('click', async () => { await game.startGame(); selects[0].focus(); });
  byId('guess-form').addEventListener('submit', async event => {
    event.preventDefault();
    const state = await game.submitGuess(selects.map(select => select.value).filter(Boolean));
    if (state.status === 'playing' && !state.lastError) selects[0].focus();
  });
  render(game.getState(), 'initial');
  if (new URLSearchParams(window.location.search).get('test') === '1') window.codeSecretTest = game;
  else game.startGame();
})();
