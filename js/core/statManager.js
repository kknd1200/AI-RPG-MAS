const StateManager = (() => {
  let _state = {
    screen: 'intro',        // intro | create | town | dungeon | battle
    player: null,
    party: [],              // 동료 최대 3명
    currentDungeon: null,
    currentStage: null,
    difficulty: 'normal',   // normal | nightmare | hell
    battle: null,
    gold: 0,
    inventory: [],
    questLog: [],
    unlockedStages: ['1-1'],
    clearedStages: [],
    turn: 0
  };

  const _listeners = {};

  function get(key) {
    return key ? _state[key] : { ..._state };
  }

  function set(key, value) {
    const prev = _state[key];
    _state[key] = value;
    _emit(key, value, prev);
  }

  function update(key, updater) {
    const prev = _state[key];
    _state[key] = updater(prev);
    _emit(key, _state[key], prev);
  }

  function on(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
  }

  function off(key, fn) {
    if (!_listeners[key]) return;
    _listeners[key] = _listeners[key].filter(f => f !== fn);
  }

  function _emit(key, value, prev) {
    if (_listeners[key]) {
      _listeners[key].forEach(fn => fn(value, prev));
    }
    if (_listeners['*']) {
      _listeners['*'].forEach(fn => fn(key, value, prev));
    }
  }

  function reset() {
    _state = {
      screen: 'intro',
      player: null,
      party: [],
      currentDungeon: null,
      currentStage: null,
      difficulty: 'normal',
      battle: null,
      gold: 0,
      inventory: [],
      questLog: [],
      unlockedStages: ['1-1'],
      clearedStages: [],
      turn: 0
    };
  }

  return { get, set, update, on, off, reset };
})();
