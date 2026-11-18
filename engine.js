(function (root) {
  'use strict';
  const COLORS = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
  const CONFIG = { apiVersion: '0.2', rulesVersion: 'code-couleurs-1.0', secretLength: 4,
    maxAttempts: 10, allowDuplicates: true, colors: COLORS };
  const MESSAGES = {
    'game-not-started': 'Démarrez une nouvelle partie avant de proposer un code.',
    'game-finished': 'La partie est terminée. Démarrez une nouvelle partie.',
    'invalid-options': 'Les options doivent être un objet contenant uniquement un éventuel secret.',
    'invalid-type': 'Utilisez un tableau complet de noms de couleurs.',
    'invalid-length': 'Choisissez exactement quatre couleurs. Aucun essai utilisé.',
    'invalid-color': 'Une couleur ne fait pas partie des six couleurs autorisées.'
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  function validateCode(code) {
    if (!Array.isArray(code)) return 'invalid-type';
    for (let i = 0; i < code.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(code, i) || typeof code[i] !== 'string') return 'invalid-type';
    }
    if (code.length !== 4) return 'invalid-length';
    if (code.some(color => !COLORS.includes(color))) return 'invalid-color';
    return null;
  }
  function score(secret, guess) {
    let wellPlaced = 0;
    const remainingSecret = {}, remainingGuess = {};
    for (let i = 0; i < 4; i++) {
      if (secret[i] === guess[i]) wellPlaced++;
      else {
        remainingSecret[secret[i]] = (remainingSecret[secret[i]] || 0) + 1;
        remainingGuess[guess[i]] = (remainingGuess[guess[i]] || 0) + 1;
      }
    }
    const misplaced = COLORS.reduce((total, color) => total + Math.min(
      remainingSecret[color] || 0, remainingGuess[color] || 0), 0);
    return { wellPlaced, misplaced };
  }
  function emptyState(status = 'not-started') {
    return { status, attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
  }
  function createGame(onChange = () => {}) {
    let state = emptyState();
    let secret = null;
    const getState = () => copy(state);
    function notify(action) { onChange(getState(), action); return getState(); }
    async function startGame(options) {
      if (options === undefined) options = {};
      const plain = options !== null && typeof options === 'object' &&
        (Object.getPrototypeOf(options) === Object.prototype || Object.getPrototypeOf(options) === null);
      let error = !plain || Reflect.ownKeys(options).some(key => key !== 'secret') ? 'invalid-options' : null;
      const hasSecret = !error && Object.prototype.hasOwnProperty.call(options, 'secret');
      if (!error && hasSecret) error = validateCode(options.secret);
      if (error) throw Object.assign(new Error(MESSAGES[error]), { code: error });
      secret = hasSecret ? options.secret.slice() : Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
      state = emptyState('playing');
      return notify('start');
    }
    async function submitGuess(guess) {
      const error = state.status === 'not-started' ? 'game-not-started' :
        state.status !== 'playing' ? 'game-finished' : validateCode(guess);
      if (error) {
        state.lastError = { code: error, message: MESSAGES[error] };
        return notify('refuse');
      }
      const savedGuess = guess.slice();
      const result = score(secret, savedGuess);
      state.history.push({ guess: savedGuess, result });
      state.attempts = state.history.length;
      state.lastGuess = savedGuess;
      state.lastResult = result;
      state.lastError = null;
      state.status = result.wellPlaced === 4 ? 'won' : state.attempts === 10 ? 'lost' : 'playing';
      return notify('guess');
    }
    return Object.freeze({ version: '0.2', getConfig: () => copy(CONFIG), getState, startGame, submitGuess });
  }
  if (typeof module === 'object' && module.exports) module.exports = { createGame, score, validateCode };
  else root.CodeSecretEngine = Object.freeze({ createGame });
})(typeof window === 'object' ? window : globalThis);
