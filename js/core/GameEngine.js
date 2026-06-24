const GameEngine = (() => {

  async function init() {
    console.log('GameEngine 초기화...');
    await SaveManager.initDrive();
    const save = await SaveManager.load();
    if (save && save.player) {
      SaveManager.applySaveData(save);
      _showScreen('town');
      Renderer.renderTown();
    } else {
      _showScreen('intro');
      Renderer.renderIntro();
    }
  }

  // ── 화면 전환 ───────────────────────────────────────
  function _showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${name}`);
    if (target) {
      target.classList.add('active');
      target.classList.remove('anim-fadein');
      void target.offsetWidth;
      target.classList.add('anim-fadein');
    }
    StateManager.set('screen', name);
  }

  function goTo(screen, payload) {
    switch (screen) {
      case 'intro':
        _showScreen('intro');
        Renderer.renderIntro();
        break;
      case 'create':
        _showScreen('create');
        CharacterCreate.render();
        break;
      case 'town':
        _showScreen('town');
        Renderer.renderTown();
        break;
      case 'dungeon':
        _showScreen('dungeon');
        Renderer.renderDungeon(payload);
        break;
      case 'battle':
        _showScreen('battle');
        Battle.start(payload);
        break;
    }
  }

  // ── 레벨업 처리 ─────────────────────────────────────
  function checkLevelUp(character) {
    const expTable = _getExpTable();
    let leveled = false;
    while (
      character.level < 30 &&
      character.exp >= expTable[character.level]
    ) {
      character.exp -= expTable[character.level];
      character.level++;
      _applyLevelUp(character);
      leveled = true;
    }
    return leveled;
  }

  function _applyLevelUp(character) {
    const cls = CLASS_DATA[character.classId];
    const hpGain = _weightedRandom(cls.hpGrowth);
    const mpGain = _weightedRandom(cls.mpGrowth);
    character.maxHp += hpGain;
    character.maxMp += mpGain;
    character.hp = Math.min(character.hp + hpGain, character.maxHp);
    character.mp = Math.min(character.mp + mpGain, character.maxMp);
    character.statPoints  = (character.statPoints  || 0) + 3;
    character.skillPoints = (character.skillPoints || 0) + 1;
    console.log(`${character.name} 레벨업! Lv.${character.level} HP+${hpGain} MP+${mpGain}`);
  }

  function _getExpTable() {
    const table = {};
    for (let lv = 1; lv <= 30; lv++) {
      table[lv] = Math.floor(50 * Math.pow(lv, 1.6));
    }
    return table;
  }

  // ── 스테이지 클리어 처리 ────────────────────────────
  function onStageClear(stageId) {
    const state = StateManager.get();
    if (!state.clearedStages.includes(stageId)) {
      StateManager.update('clearedStages', list => [...list, stageId]);
    }
    const next = _getNextStage(stageId);
    if (next) {
      StateManager.update('unlockedStages', list =>
        list.includes(next) ? list : [...list, next]
      );
    }
    SaveManager.save();
  }

  function _getNextStage(stageId) {
    const [world, stage] = stageId.split('-').map(Number);
    if (stage < 10) return `${world}-${stage + 1}`;
    return null;
  }

  // ── 유틸 ───────────────────────────────────────────
  function _weightedRandom(table) {
    const total = table.reduce((s, t) => s + t.w, 0);
    let r = Math.random() * total;
    for (const t of table) {
      r -= t.w;
      if (r <= 0) return t.val;
    }
    return table[table.length - 1].val;
  }

  function weightedRandom(table) {
    return _weightedRandom(table);
  }

  function calcDamage(attacker, damageType) {
    const stats = attacker.stats;
    if (damageType === 'physical') {
      return Math.floor(attacker.atk + Math.floor(stats.str / 3));
    }
    if (damageType === 'magic') {
      return Math.floor(attacker.matk + Math.floor(stats.int / 3));
    }
    return attacker.atk;
  }

  return {
    init, goTo,
    checkLevelUp,
    onStageClear,
    weightedRandom,
    calcDamage
  };
})();
