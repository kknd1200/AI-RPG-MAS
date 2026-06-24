const Battle = (() => {
  let _state = null;

  // ── 전투 시작 ───────────────────────────────────────
  function start(payload) {
    const { stageId, difficulty } = payload;
    const stageData = MONSTER_DATA[stageId];
    if (!stageData) return;

    const player = StateManager.get('player');
    const party  = StateManager.get('party');

    const allies  = [player, ...party].filter(c => c && c.isAlive);
    const enemies = _buildEnemies(stageData, difficulty);

    _state = {
      stageId,
      difficulty,
      allies,
      enemies,
      turnOrder: [],
      currentTurn: 0,
      phase: 'player',    // player | enemy | status
      log: [],
      isOver: false,
      result: null,       // win | lose
      selectedAlly: 0,
      selectedAction: null
    };

    _buildTurnOrder();
    StateManager.set('battle', _state);
    Renderer.renderBattle(_state);
  }

  // ── 몬스터 빌드 ─────────────────────────────────────
  function _buildEnemies(stageData, difficulty) {
    const mults = { normal: 1.0, nightmare: 1.5, hell: 2.0 };
    const m = mults[difficulty] || 1.0;
    const pool = stageData.boss
      ? [...stageData.boss]
      : [...stageData.normal];

    return pool.map(template => ({
      ...template,
      hp:    Math.floor(template.hp    * m),
      maxHp: Math.floor(template.hp    * m),
      mp:    Math.floor(template.mp    * m),
      maxMp: Math.floor(template.mp    * m),
      atk:   Math.floor(template.atk   * m),
      def:   Math.floor(template.def   * m),
      isAlive: true,
      statusEffects: [],
      skills: template.skills
        ? template.skills.map(s => ({ ...s, currentCooldown: 0 }))
        : []
    }));
  }

  // ── 턴 순서 ─────────────────────────────────────────
  function _buildTurnOrder() {
    const all = [
      ..._state.allies.map(c  => ({ entity: c,  side: 'ally'  })),
      ..._state.enemies.map(e => ({ entity: e,  side: 'enemy' }))
    ];
    all.sort((a, b) => (b.entity.spd || 0) - (a.entity.spd || 0));
    _state.turnOrder = all;
    _state.currentTurn = 0;
  }

  // ── 플레이어 액션 ───────────────────────────────────
  function playerAction(action) {
    if (!_state || _state.isOver) return;
    const current = _state.turnOrder[_state.currentTurn];
    if (!current || current.side !== 'ally') return;

    const actor = current.entity;
    let result = null;

    switch (action.type) {
      case 'attack':
        result = _doAttack(actor, action.target);
        break;
      case 'skill':
        result = _doSkill(actor, action.skillId, action.target);
        break;
      case 'item':
        result = _doItem(actor, action.itemId, action.target);
        break;
      case 'defend':
        result = _doDefend(actor);
        break;
    }

    if (result) _addLog(result);
    _afterAction();
  }

  // ── 기본 공격 ───────────────────────────────────────
  function _doAttack(actor, target) {
    if (!target || !target.isAlive) return null;
    const { damage, isCrit } = _calcPhysicalDamage(actor, target);
    const actual = Character.takeDamage(target, damage);
    const log = `${actor.name}의 공격! ${target.name}에게 ${actual} 데미지${isCrit ? ' (치명타!)' : ''}`;
    Renderer.showDamageText(target, actual, isCrit ? 'critical' : 'physical');
    Renderer.animateAttack(actor);
    return { type: 'attack', actor, target, damage: actual, isCrit, log };
  }

  // ── 스킬 ────────────────────────────────────────────
  function _doSkill(actor, skillId, target) {
    const skill = actor.learnedSkills.find(s => s.id === skillId);
    if (!skill) return null;
    if (skill.currentCooldown > 0) return null;
    if (actor.mp < skill.mpCost) return null;

    actor.mp -= skill.mpCost;
    skill.currentCooldown = skill.cooldown;

    let log = `${actor.name}의 ${skill.name}!`;
    const results = [];

    // 타겟 리스트
    const targets = _resolveTargets(skill.target, actor, target);

    targets.forEach(t => {
      if (!t.isAlive && skill.damageType !== 'revive') return;
      const r = _applySkillEffect(actor, skill, t);
      results.push(r);
      log += ` ${r.log}`;
    });

    Renderer.animateSkill(actor, skill);
    return { type: 'skill', skill, actor, results, log };
  }

  function _resolveTargets(targetType, actor, selected) {
    switch (targetType) {
      case 'single':        return selected ? [selected] : [];
      case 'single_ally':   return selected ? [selected] : [];
      case 'all_enemy':     return _state.enemies.filter(e => e.isAlive);
      case 'all_ally':      return _state.allies.filter(a => a.isAlive);
      case 'self':          return [actor];
      default:              return selected ? [selected] : [];
    }
  }

  function _applySkillEffect(actor, skill, target) {
    let log = '';
    switch (skill.damageType) {
      case 'physical': {
        const { damage, isCrit } = _calcPhysicalDamage(actor, target, skill.multiplier);
        const actual = Character.takeDamage(target, damage);
        Renderer.showDamageText(target, actual, isCrit ? 'critical' : 'physical');
        log = `${target.name}에게 ${actual} 물리 데미지`;
        _applySkillStatusEffect(skill, target);
        return { target, damage: actual, isCrit, log };
      }
      case 'magic': {
        const damage = _calcMagicDamage(actor, target, skill.multiplier);
        const actual = Math.max(1, damage - Math.floor(target.def * 0.3));
        target.hp = Math.max(0, target.hp - actual);
        if (target.hp <= 0) target.isAlive = false;
        Renderer.showDamageText(target, actual, 'magic');
        log = `${target.name}에게 ${actual} 마법 데미지`;
        _applySkillStatusEffect(skill, target);
        return { target, damage: actual, log };
      }
      case 'heal': {
        const amount = Math.floor(
          (actor.matk + Math.floor(actor.stats.int / 3)) * (skill.multiplier || 1.5)
        );
        Character.heal(target, amount);
        Renderer.showDamageText(target, amount, 'heal');
        log = `${target.name} HP ${amount} 회복`;
        return { target, heal: amount, log };
      }
      case 'revive': {
        if (!target.isAlive) {
          target.isAlive = true;
          target.hp = Math.floor(target.maxHp * (skill.reviveHpPercent || 0.5));
          log = `${target.name} 부활!`;
        }
        return { target, log };
      }
      case 'buff':
      case 'debuff': {
        _applyBuffDebuff(actor, skill, target);
        log = `${target.name}에게 ${skill.name} 적용`;
        return { target, log };
      }
      default:
        return { target, log: '' };
    }
  }

  function _applySkillStatusEffect(skill, target) {
    if (!skill.effect) return;
    const e = skill.effect;
    const roll = Math.random();
    if (e.burn   && roll < e.burn.chance)    Character.addStatus(target, { id:'burn',    type:'burn',    ...e.burn });
    if (e.poison && roll < (e.poison.chance || 1)) Character.addStatus(target, { id:'poison', type:'poison', ...e.poison });
    if (e.stun   && roll < e.stun.chance)    Character.addStatus(target, { id:'stun',    type:'stun',    duration: e.stun.duration });
    if (e.slow   && roll < e.slow.chance)    Character.addStatus(target, { id:'slow',    type:'slow',    duration: e.slow.duration });
    if (e.blind  && roll < e.blind.chance)   Character.addStatus(target, { id:'blind',   type:'blind',   duration: e.blind.duration });
    if (e.curse  && roll < (e.curse.chance || 1)) Character.addStatus(target, { id:'curse',  type:'curse',   ...e.curse });
    if (e.silence && roll < (e.silence.chance || 1)) Character.addStatus(target, { id:'silence', type:'silence', duration: e.silence.duration });
    if (e.paralyze && roll < e.paralyze.chance) Character.addStatus(target, { id:'paralyze', type:'paralyze', duration: e.paralyze.duration });
  }

  function _applyBuffDebuff(actor, skill, target) {
    const e = skill.effect;
    if (!e) return;
    if (e.atkBuff)    target._atkMult  = (target._atkMult  || 1) * e.atkBuff;
    if (e.defBuff)    target._defMult  = (target._defMult  || 1) * e.defBuff;
    if (e.atkDebuff)  target._atkMult  = (target._atkMult  || 1) * e.atkDebuff;
    if (e.defDebuff)  target._defMult  = (target._defMult  || 1) * e.defDebuff;
    if (e.dodge)      target.dodgeRate = Math.min(0.9, (target.dodgeRate || 0) + e.dodge);
    if (e.dmgReduce)  target._dmgReduce = e.dmgReduce;
    if (e.duration) {
      setTimeout(() => {
        target._atkMult  = 1;
        target._defMult  = 1;
        target._dmgReduce = 0;
      }, e.duration * 3000);
    }
  }

  // ── 아이템 사용 ─────────────────────────────────────
  function _doItem(actor, itemId, target) {
    const inv = StateManager.get('inventory');
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx < 0) return null;
    const item = inv[idx];
    let log = `${actor.name}이(가) ${item.name} 사용!`;

    if (item.effect.hp)              Character.heal(target || actor, item.effect.hp);
    if (item.effect.mp)              Character.restoreMP(target || actor, item.effect.mp);
    if (item.effect.removeStatus)    Character.clearStatus(target || actor, item.effect.removeStatus);
    if (item.effect.removeAllStatus) Character.clearStatus(target || actor);

    StateManager.update('inventory', list => {
      const next = [...list];
      next.splice(idx, 1);
      return next;
    });
    return { type: 'item', item, log };
  }

  // ── 방어 ────────────────────────────────────────────
  function _doDefend(actor) {
    actor._defending = true;
    actor._defMult = (actor._defMult || 1) * 1.5;
    const log = `${actor.name}이(가) 방어 태세!`;
    return { type: 'defend', actor, log };
  }

  // ── 데미지 계산 ─────────────────────────────────────
  function _calcPhysicalDamage(actor, target, multiplier = 1.0) {
    const baseAtk = Math.floor((actor.atk || 5) * (actor._atkMult || 1));
    let damage = Math.floor(baseAtk * multiplier);
    const defReduction = Math.floor((target.def || 0) * (target._defMult || 1));
    damage = Math.max(1, damage - defReduction);
    if (target._dmgReduce) damage = Math.floor(damage * (1 - target._dmgReduce));

    const isCrit = Math.random() < (actor.critRate || 0.05);
    if (isCrit) damage = Math.floor(damage * (actor.critDmg || 1.5));
    return { damage, isCrit };
  }

  function _calcMagicDamage(actor, target, multiplier = 1.0) {
    const baseMatk = Math.floor((actor.matk || 3) * (actor._atkMult || 1));
    return Math.floor(baseMatk * multiplier);
  }

  // ── 적 AI ───────────────────────────────────────────
  function _enemyTurn(enemy) {
    if (!enemy.isAlive) { _nextTurn(); return; }
    if (Character.hasStatus(enemy, 'stun') || Character.hasStatus(enemy, 'paralyze')) {
      _addLog(`${enemy.name}은(는) 행동 불가!`);
      _nextTurn();
      return;
    }

    const aliveAllies = _state.allies.filter(a => a.isAlive);
    if (aliveAllies.length === 0) { _endBattle('lose'); return; }

    // 스킬 사용 가능 여부 확인
    const usableSkills = (enemy.skills || []).filter(
      s => s.currentCooldown <= 0 && enemy.mp >= (s.mpCost || 0)
    );
    const statusMoves = enemy.statusMoves || [];

    // 상태이상 기술 우선 (확률)
    for (const sm of statusMoves) {
      if (Math.random() < 0.3) {
        const targets = sm.target === 'all_enemy'
          ? aliveAllies
          : [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]];
        targets.forEach(t => {
          Character.addStatus(t, {
            id: sm.effect, type: sm.effect,
            duration: sm.duration || 2,
            damage: sm.damage || 0,
            chance: sm.chance
          });
        });
        _addLog(`${enemy.name}의 ${sm.name}! 상태이상 적용!`);
        _nextTurn();
        return;
      }
    }

    // 스킬 사용 (30% 확률)
    if (usableSkills.length > 0 && Math.random() < 0.3) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      const t = skill.target === 'all_enemy'
        ? aliveAllies[0]
        : aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
      const r = _doSkill(enemy, skill.id, t);
      if (r) _addLog(r.log);
      skill.currentCooldown = skill.cooldown;
      enemy.mp -= skill.mpCost || 0;
    } else {
      // 일반 공격
      const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
      const r = _doAttack(enemy, target);
      if (r) _addLog(r.log);
    }
    _nextTurn();
  }

  // ── 액션 후처리 ─────────────────────────────────────
  function _afterAction() {
    _checkBattleOver();
    if (!_state.isOver) _nextTurn();
  }

  function _nextTurn() {
    _state.currentTurn = (_state.currentTurn + 1) % _state.turnOrder.length;
    const next = _state.turnOrder[_state.currentTurn];

    // 죽은 유닛 스킵
    if (!next.entity.isAlive) { _nextTurn(); return; }

    // 상태이상 틱
    const tickResults = Character.tickStatus(next.entity);
    tickResults.forEach(r => {
      if (r.damage) _addLog(`${next.entity.name}이(가) ${r.type}으로 ${r.damage} 데미지!`);
    });

    // 쿨다운 틱
    Character.tickCooldowns(next.entity);

    _checkBattleOver();
    if (_state.isOver) return;

    if (next.side === 'enemy') {
      setTimeout(() => _enemyTurn(next.entity), 600);
    } else {
      _state.phase = 'player';
      Renderer.renderBattle(_state);
    }
  }

  // ── 전투 종료 ───────────────────────────────────────
  function _checkBattleOver() {
    const allEnemiesDead = _state.enemies.every(e => !e.isAlive);
    const allAlliesDead  = _state.allies.every(a  => !a.isAlive);
    if (allEnemiesDead)  { _endBattle('win');  return; }
    if (allAlliesDead)   { _endBattle('lose'); return; }
  }

  function _endBattle(result) {
    _state.isOver = true;
    _state.result = result;
    if (result === 'win') {
      _distributeRewards();
      GameEngine.onStageClear(_state.stageId);
    }
    Renderer.renderBattleResult(_state);
  }

  function _distributeRewards() {
    let totalExp  = 0;
    let totalGold = 0;
    _state.enemies.forEach(e => {
      totalExp  += e.expReward  || 0;
      totalGold += e.goldReward || 0;
    });

    const aliveAllies = _state.allies.filter(a => a.isAlive);
    const expShare = Math.floor(totalExp / Math.max(1, aliveAllies.length));

    aliveAllies.forEach(ally => {
      ally.exp = (ally.exp || 0) + expShare;
      const leveled = GameEngine.checkLevelUp(ally);
      if (leveled) _addLog(`${ally.name} 레벨업! Lv.${ally.level}`);
    });

    StateManager.update('gold', g => g + totalGold);
    _addLog(`전투 승리! EXP +${totalExp}  Gold +${totalGold}`);
  }

  function _addLog(text) {
    _state.log.push(text);
    if (_state.log.length > 30) _state.log.shift();
    Renderer.appendBattleLog(text);
  }

  function getState()      { return _state; }
  function getEnemies()    { return _state ? _state.enemies  : []; }
  function getAllies()      { return _state ? _state.allies   : []; }
  function getCurrentActor() {
    if (!_state) return null;
    return _state.turnOrder[_state.currentTurn]?.entity || null;
  }

  return {
    start, playerAction,
    getState, getEnemies, getAllies, getCurrentActor
  };
})();
