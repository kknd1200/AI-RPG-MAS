const Dungeon = (() => {

  const STAGE_INFO = {
    '1-1':  { name: '어둠의 숲 입구',  type: 'normal', world: 1, stage: 1 },
    '1-2':  { name: '어둠의 숲 깊은곳', type: 'normal', world: 1, stage: 2 },
    '1-3':  { name: '늑대 서식지',     type: 'normal', world: 1, stage: 3 },
    '1-4':  { name: '오크 진영',       type: 'normal', world: 1, stage: 4 },
    '1-5':  { name: '암흑 요새',       type: 'boss',   world: 1, stage: 5, bossName: '암흑기사 카론' },
    '1-6':  { name: '해골 묘지',       type: 'normal', world: 1, stage: 6 },
    '1-7':  { name: '마법사 탑',       type: 'normal', world: 1, stage: 7 },
    '1-8':  { name: '골렘 광산',       type: 'normal', world: 1, stage: 8 },
    '1-9':  { name: '뱀파이어 성',     type: 'normal', world: 1, stage: 9 },
    '1-10': { name: '마왕의 성',       type: 'final',  world: 1, stage: 10, bossName: '마왕 발타자르' }
  };

  const DIFFICULTY_MULT = {
    normal:    { label: '일반',   expMult: 1.0, goldMult: 1.0, color: '#2ecc71' },
    nightmare: { label: '악몽',   expMult: 1.8, goldMult: 1.8, color: '#e67e22' },
    hell:      { label: '지옥',   expMult: 3.0, goldMult: 3.0, color: '#e74c3c' }
  };

  function getStageInfo(stageId) {
    return STAGE_INFO[stageId] || null;
  }

  function getAllStages() {
    return Object.entries(STAGE_INFO).map(([id, info]) => ({ id, ...info }));
  }

  function getDifficultyInfo(difficulty) {
    return DIFFICULTY_MULT[difficulty] || DIFFICULTY_MULT.normal;
  }

  function isUnlocked(stageId) {
    const unlocked = StateManager.get('unlockedStages');
    return unlocked.includes(stageId);
  }

  function isCleared(stageId) {
    const cleared = StateManager.get('clearedStages');
    return cleared.includes(stageId);
  }

  function canEnter(stageId) {
    return isUnlocked(stageId);
  }

  function enter(stageId, difficulty = 'normal') {
    if (!canEnter(stageId)) return false;
    StateManager.set('currentStage', stageId);
    StateManager.set('difficulty', difficulty);
    GameEngine.goTo('battle', { stageId, difficulty });
    return true;
  }

  function getStageLabel(stageId) {
    const info = STAGE_INFO[stageId];
    if (!info) return stageId;
    const icons = { normal: '', boss: '⚔️ ', final: '💀 ' };
    return `${icons[info.type] || ''}${info.name}`;
  }

  function getRecommendedLevel(stageId) {
    const info = STAGE_INFO[stageId];
    if (!info) return 1;
    return info.stage * 2 - 1;
  }

  return {
    getStageInfo, getAllStages,
    getDifficultyInfo,
    isUnlocked, isCleared, canEnter,
    enter,
    getStageLabel,
    getRecommendedLevel,
    STAGE_INFO,
    DIFFICULTY_MULT
  };
})();
