const Character = (() => {

  // ── 캐릭터 생성 ─────────────────────────────────────
  function create(name, classId, isPlayer = true) {
    const cls = CLASS_DATA[classId];
    if (!cls) throw new Error(`Unknown class: ${classId}`);

    const stats = { ...cls.baseStats };
    const maxHp = cls.startHP;
    const maxMp = cls.startMP;

    return {
      id: isPlayer ? 'player' : `npc_${classId}_${Date.now()}`,
      name,
      classId,
      className: cls.name,
      level: 1,
      exp: 0,
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      stats,                    // { str, agi, int, vit }
      statPoints: 0,
      skillPoints: 1,
      atk: _calcAtk(cls, stats),
      matk: _calcMatk(cls, stats),
      def: 3,
      spd: stats.agi + 5,
      critRate: 0.05,
      critDmg: 1.5,
      dodgeRate: 0.0,
      equipment: { weapon: null, armor: null, shield: null },
      learnedSkills: _getStarterSkills(classId),
      passives: _getStarterPassives(classId),
      statusEffects: [],
      isPlayer,
      isAlive: true,
      weapon: cls.baseWeapons[0],
      color: cls.color,
      emoji: cls.emoji
    };
  }

  // ── NPC 동료 프리셋 ─────────────────────────────────
  const NPC_PRESETS = [
    {
      id: 'npc_aria',   name: '아리아',   classId: 'cleric',
      desc: '신성한 빛으로 동료를 치유하는 성직자',
      joinCost: 500, level: 1
    },
    {
      id: 'npc_gareth', name: '가레스',   classId: 'knight',
      desc: '철벽 수비로 파티를 지키는 기사',
      joinCost: 600, level: 1
    },
    {
      id: 'npc_lyra',   name: '리라',     classId: 'mage',
      desc: '강력한 마법으로 적을 섬멸하는 마법사',
      joinCost: 700, level: 1
    },
    {
      id: 'npc_shadow', name: '쉐도우',   classId: 'rogue',
      desc: '어둠 속에서 기습하는 도적',
      joinCost: 550, level: 1
    },
    {
      id: 'npc_brom',   name: '브롬',     classId: 'warrior',
      desc: '거대한 대검을 휘두르는 전사',
      joinCost: 580, level: 1
    },
    {
      id: 'npc_kira',   name: '키라',     classId: 'monk',
      desc: '번개 같은 주먹을 날리는 권사',
      joinCost: 560, level: 1
    }
  ];

  function createNPC(presetId) {
    const preset = NPC_PRESETS.find(p => p.id === presetId);
    if (!preset) return null;
    const char = create(preset.name, preset.classId, false);
    char.id = preset.id;
    char.desc = preset.desc;
    char.joinCost = preset.joinCost;
    return char;
  }

  function getNPCPresets() { return NPC_PRESETS; }

  // ── 스탯 배분 ───────────────────────────────────────
  function allocateStat(character, statKey) {
    if ((character.statPoints || 0) <= 0) return false;
    if (!['str','agi','int','vit'].includes(statKey)) return false;
    character.stats[statKey]++;
    character.statPoints--;
    _recalcDerivedStats(character);
    return true;
  }

  function _recalcDerivedStats(character) {
    const cls = CLASS_DATA[character.classId];
    const s = character.stats;
    character.atk  = _calcAtk(cls, s);
    character.matk = _calcMatk(cls, s);
    character.spd  = s.agi + 5 + (character.level - 1) * 0.5;
    // 체력 보너스
    const vitBonus = s.vit * 10;
    const baseHp = cls.startHP + (character.level - 1) * 14;
    character.maxHp = baseHp + vitBonus + _getEquipBonus(character, 'hp');
    character.hp = Math.min(character.hp, character.maxHp);
    _applyPassiveBonuses(character);
  }

  function _calcAtk(cls, stats) {
    const base = 5;
    if (['warrior','knight'].includes(cls.id)) {
      return base + Math.floor(stats.str / 3);
    }
    if (['rogue','monk'].includes(cls.id)) {
      return base + Math.floor(stats.agi / 3);
    }
    return base + Math.floor(stats.str / 3);
  }

  function _calcMatk(cls, stats) {
    const base = 3;
    if (['mage','cleric'].includes(cls.id)) {
      return base + Math.floor(stats.int / 3);
    }
    return base + Math.floor(stats.int / 3);
  }

  // ── 장비 ────────────────────────────────────────────
  function equip(character, item) {
    if (!_canEquip(character, item)) return false;
    const slot = item.type; // weapon | armor | shield
    character.equipment[slot] = item;
    _recalcDerivedStats(character);
    return true;
  }

  function unequip(character, slot) {
    character.equipment[slot] = null;
    _recalcDerivedStats(character);
  }

  function _canEquip(character, item) {
    return item.forClass
      ? item.forClass.includes(character.classId)
      : true;
  }

  function _getEquipBonus(character, stat) {
    let bonus = 0;
    Object.values(character.equipment).forEach(eq => {
      if (eq && eq.stats && eq.stats[stat]) bonus += eq.stats[stat];
    });
    return bonus;
  }

  // ── 스킬 배움 ───────────────────────────────────────
  function learnSkill(character, skillId) {
    if ((character.skillPoints || 0) <= 0) return false;
    const classSkills = SKILL_DATA[character.classId];
    if (!classSkills) return false;
    const allSkills = [...classSkills.active, ...classSkills.passive];
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill) return false;
    if (character.level < skill.unlockLevel) return false;
    if (character.learnedSkills.find(s => s.id === skillId)) return false;
    character.learnedSkills.push({ ...skill, currentCooldown: 0 });
    character.skillPoints--;
    if (skill.type === 'passive') {
      character.passives.push(skill);
      _applyPassiveBonuses(character);
    }
    return true;
  }

  function _getStarterSkills(classId) {
    const data = SKILL_DATA[classId];
    if (!data) return [];
    return data.active
      .filter(s => s.unlockLevel <= 1)
      .map(s => ({ ...s, currentCooldown: 0 }));
  }

  function _getStarterPassives(classId) {
    return [];
  }

  function _applyPassiveBonuses(character) {
    character.passives.forEach(p => {
      const e = p.effect;
      if (e.defBonus)      character.def      = (character.def || 0) + e.defBonus;
      if (e.hpBonus)       character.maxHp   += e.hpBonus;
      if (e.speedBonus)    character.spd     += e.speedBonus;
      if (e.critRate)      character.critRate = Math.min(0.75, (character.critRate || 0.05) + e.critRate);
      if (e.critDmgBonus)  character.critDmg  = (character.critDmg || 1.5) + e.critDmgBonus;
    });
  }

  // ── HP/MP 조작 ──────────────────────────────────────
  function heal(character, amount) {
    character.hp = Math.min(character.maxHp, character.hp + amount);
  }

  function restoreMP(character, amount) {
    character.mp = Math.min(character.maxMp, character.mp + amount);
  }

  function takeDamage(character, amount) {
    const reduced = Math.max(1, amount - (character.def || 0));
    character.hp = Math.max(0, character.hp - reduced);
    if (character.hp <= 0) character.isAlive = false;
    return reduced;
  }

  // ── 상태이상 ────────────────────────────────────────
  function addStatus(character, effect) {
    const existing = character.statusEffects.find(e => e.id === effect.id);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
    } else {
      character.statusEffects.push({ ...effect });
    }
  }

  function tickStatus(character) {
    const results = [];
    character.statusEffects = character.statusEffects.filter(e => {
      if (e.type === 'poison' || e.type === 'burn') {
        const dmg = e.damage || 5;
        character.hp = Math.max(0, character.hp - dmg);
        if (character.hp <= 0) character.isAlive = false;
        results.push({ type: e.type, damage: dmg });
      }
      if (e.type === 'regen') {
        const h = e.amount || 3;
        heal(character, h);
        results.push({ type: 'regen', amount: h });
      }
      e.duration--;
      return e.duration > 0;
    });
    return results;
  }

  function clearStatus(character, type) {
    if (type) {
      character.statusEffects = character.statusEffects.filter(e => e.type !== type);
    } else {
      character.statusEffects = [];
    }
  }

  function hasStatus(character, type) {
    return character.statusEffects.some(e => e.type === type);
  }

  // ── 쿨다운 틱 ───────────────────────────────────────
  function tickCooldowns(character) {
    character.learnedSkills.forEach(skill => {
      if (skill.currentCooldown > 0) skill.currentCooldown--;
    });
  }

  // ── HP 바 비율 ──────────────────────────────────────
  function hpPercent(character) {
    return character.maxHp > 0
      ? Math.max(0, Math.min(1, character.hp / character.maxHp))
      : 0;
  }

  function mpPercent(character) {
    return character.maxMp > 0
      ? Math.max(0, Math.min(1, character.mp / character.maxMp))
      : 0;
  }

  // ── 전투 스탯 요약 ──────────────────────────────────
  function getSummary(character) {
    return {
      name: character.name,
      class: character.className,
      level: character.level,
      hp: character.hp,
      maxHp: character.maxHp,
      mp: character.mp,
      maxMp: character.maxMp,
      atk: character.atk,
      matk: character.matk,
      def: character.def,
      spd: character.spd
    };
  }

  return {
    create, createNPC, getNPCPresets,
    allocateStat, equip, unequip,
    learnSkill,
    heal, restoreMP, takeDamage,
    addStatus, tickStatus, clearStatus, hasStatus,
    tickCooldowns,
    hpPercent, mpPercent,
    getSummary,
    NPC_PRESETS
  };
})();
