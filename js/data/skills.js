const SKILL_DATA = {

  // ─── 전사 ───────────────────────────────────────────
  warrior: {
    active: [
      {
        id: 'warrior_slash', name: '강베기', type: 'active', target: 'single',
        mpCost: 5, cooldown: 2, currentCooldown: 0,
        damageType: 'physical', multiplier: 1.8,
        description: '강력한 한 번의 베기. 물리 데미지 1.8배',
        unlockLevel: 1
      },
      {
        id: 'warrior_whirlwind', name: '회오리베기', type: 'active', target: 'all_enemy',
        mpCost: 12, cooldown: 4, currentCooldown: 0,
        damageType: 'physical', multiplier: 1.2,
        description: '모든 적에게 회오리 공격. 물리 데미지 1.2배',
        unlockLevel: 5
      },
      {
        id: 'warrior_berserk', name: '광전사', type: 'active', target: 'self',
        mpCost: 8, cooldown: 5, currentCooldown: 0,
        damageType: 'buff', effect: { atkBuff: 1.5, defDebuff: 0.8, duration: 3 },
        description: '공격력 50% 증가, 방어력 20% 감소 (3턴)',
        unlockLevel: 10
      },
      {
        id: 'warrior_execute', name: '처형', type: 'active', target: 'single',
        mpCost: 15, cooldown: 6, currentCooldown: 0,
        damageType: 'physical', multiplier: 3.0,
        condition: { targetHpBelow: 0.3 },
        description: 'HP 30% 이하 적에게 물리 데미지 3배',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'warrior_toughness', name: '강인함', type: 'passive',
        effect: { defBonus: 5 },
        description: '방어력 +5',
        unlockLevel: 3
      },
      {
        id: 'warrior_crit', name: '치명적 일격', type: 'passive',
        effect: { critRate: 0.1 },
        description: '치명타 확률 +10%',
        unlockLevel: 8
      }
    ]
  },

  // ─── 기사 ───────────────────────────────────────────
  knight: {
    active: [
      {
        id: 'knight_shield_bash', name: '방패 강타', type: 'active', target: 'single',
        mpCost: 6, cooldown: 2, currentCooldown: 0,
        damageType: 'physical', multiplier: 1.5,
        effect: { stun: { chance: 0.3, duration: 1 } },
        description: '방패로 강타. 30% 확률로 1턴 스턴',
        unlockLevel: 1
      },
      {
        id: 'knight_provoke', name: '도발', type: 'active', target: 'all_enemy',
        mpCost: 8, cooldown: 3, currentCooldown: 0,
        damageType: 'debuff', effect: { taunt: true, duration: 2 },
        description: '모든 적의 공격을 자신에게 집중 (2턴)',
        unlockLevel: 5
      },
      {
        id: 'knight_holy_shield', name: '신성 방패', type: 'active', target: 'all_ally',
        mpCost: 14, cooldown: 5, currentCooldown: 0,
        damageType: 'buff', effect: { defBuff: 1.4, duration: 3 },
        description: '파티 전체 방어력 40% 증가 (3턴)',
        unlockLevel: 10
      },
      {
        id: 'knight_judgment', name: '심판의 일격', type: 'active', target: 'single',
        mpCost: 18, cooldown: 6, currentCooldown: 0,
        damageType: 'physical', multiplier: 2.5,
        effect: { defBreak: { amount: 0.3, duration: 2 } },
        description: '물리 2.5배 + 적 방어력 30% 감소 (2턴)',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'knight_iron_will', name: '철의 의지', type: 'passive',
        effect: { hpBonus: 20 },
        description: '최대 HP +20',
        unlockLevel: 3
      },
      {
        id: 'knight_counter', name: '반격', type: 'passive',
        effect: { counterChance: 0.2, counterMultiplier: 0.5 },
        description: '피격 시 20% 확률로 반격 (데미지 50%)',
        unlockLevel: 8
      }
    ]
  },

  // ─── 마법사 ───────────────────────────────────────────
  mage: {
    active: [
      {
        id: 'mage_fireball', name: '파이어볼', type: 'active', target: 'single',
        mpCost: 8, cooldown: 2, currentCooldown: 0,
        damageType: 'magic', multiplier: 2.0,
        effect: { burn: { chance: 0.4, damage: 5, duration: 2 } },
        description: '마법 데미지 2배 + 40% 화상 (2턴)',
        unlockLevel: 1
      },
      {
        id: 'mage_blizzard', name: '블리자드', type: 'active', target: 'all_enemy',
        mpCost: 16, cooldown: 4, currentCooldown: 0,
        damageType: 'magic', multiplier: 1.3,
        effect: { slow: { chance: 0.5, duration: 2 } },
        description: '전체 마법 1.3배 + 50% 슬로우',
        unlockLevel: 5
      },
      {
        id: 'mage_arcane_surge', name: '비전 폭발', type: 'active', target: 'single',
        mpCost: 20, cooldown: 5, currentCooldown: 0,
        damageType: 'magic', multiplier: 3.5,
        description: '강력한 마법 집중 공격. 마법 데미지 3.5배',
        unlockLevel: 10
      },
      {
        id: 'mage_meteor', name: '메테오', type: 'active', target: 'all_enemy',
        mpCost: 30, cooldown: 7, currentCooldown: 0,
        damageType: 'magic', multiplier: 2.5,
        effect: { stun: { chance: 0.3, duration: 1 } },
        description: '전체 마법 2.5배 + 30% 스턴',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'mage_mana_shield', name: '마나 보호막', type: 'passive',
        effect: { mpToDefense: 0.1 },
        description: '최대 MP의 10%를 방어력으로 전환',
        unlockLevel: 3
      },
      {
        id: 'mage_spell_amp', name: '주문 증폭', type: 'passive',
        effect: { magicDmgBonus: 0.15 },
        description: '마법 데미지 +15%',
        unlockLevel: 8
      }
    ]
  },

  // ─── 성직자 ───────────────────────────────────────────
  cleric: {
    active: [
      {
        id: 'cleric_heal', name: '치유', type: 'active', target: 'single_ally',
        mpCost: 8, cooldown: 1, currentCooldown: 0,
        damageType: 'heal', multiplier: 2.0,
        description: '아군 단일 HP 회복 (지력 기반)',
        unlockLevel: 1
      },
      {
        id: 'cleric_holy_light', name: '신성한 빛', type: 'active', target: 'single',
        mpCost: 10, cooldown: 2, currentCooldown: 0,
        damageType: 'magic', multiplier: 1.8,
        effect: { blind: { chance: 0.4, duration: 2 } },
        description: '신성 마법 1.8배 + 40% 실명 (2턴)',
        unlockLevel: 5
      },
      {
        id: 'cleric_mass_heal', name: '대치유', type: 'active', target: 'all_ally',
        mpCost: 20, cooldown: 5, currentCooldown: 0,
        damageType: 'heal', multiplier: 1.5,
        description: '파티 전체 HP 회복',
        unlockLevel: 10
      },
      {
        id: 'cleric_resurrection', name: '부활', type: 'active', target: 'single_ally',
        mpCost: 25, cooldown: 8, currentCooldown: 0,
        damageType: 'revive', reviveHpPercent: 0.5,
        description: '전투불능 아군을 HP 50%로 부활',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'cleric_regen', name: '재생', type: 'passive',
        effect: { hpRegenPerTurn: 3 },
        description: '매 턴 HP 3 회복',
        unlockLevel: 3
      },
      {
        id: 'cleric_blessing', name: '축복', type: 'passive',
        effect: { allStatBonus: 2 },
        description: '파티 전체 모든 스탯 +2',
        unlockLevel: 8
      }
    ]
  },

  // ─── 도적 ───────────────────────────────────────────
  rogue: {
    active: [
      {
        id: 'rogue_backstab', name: '기습', type: 'active', target: 'single',
        mpCost: 6, cooldown: 2, currentCooldown: 0,
        damageType: 'physical', multiplier: 2.2,
        effect: { critGuaranteed: true },
        description: '반드시 치명타. 물리 데미지 2.2배',
        unlockLevel: 1
      },
      {
        id: 'rogue_poison', name: '독 바르기', type: 'active', target: 'single',
        mpCost: 8, cooldown: 3, currentCooldown: 0,
        damageType: 'physical', multiplier: 1.2,
        effect: { poison: { damage: 8, duration: 3 } },
        description: '물리 1.2배 + 3턴 독 (턴당 8 데미지)',
        unlockLevel: 5
      },
      {
        id: 'rogue_shadowstep', name: '그림자 발걸음', type: 'active', target: 'self',
        mpCost: 10, cooldown: 4, currentCooldown: 0,
        damageType: 'buff', effect: { dodge: 0.5, duration: 2 },
        description: '2턴간 회피율 50% 증가',
        unlockLevel: 10
      },
      {
        id: 'rogue_fan_knives', name: '단검 난사', type: 'active', target: 'all_enemy',
        mpCost: 18, cooldown: 5, currentCooldown: 0,
        damageType: 'physical', multiplier: 1.4,
        description: '전체 적에게 물리 데미지 1.4배',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'rogue_swift', name: '신속', type: 'passive',
        effect: { speedBonus: 5 },
        description: '속도 +5',
        unlockLevel: 3
      },
      {
        id: 'rogue_deadly', name: '치명타 강화', type: 'passive',
        effect: { critDmgBonus: 0.5 },
        description: '치명타 데미지 +50%',
        unlockLevel: 8
      }
    ]
  },

  // ─── 권사 ───────────────────────────────────────────
  monk: {
    active: [
      {
        id: 'monk_combo', name: '연속 공격', type: 'active', target: 'single',
        mpCost: 7, cooldown: 2, currentCooldown: 0,
        damageType: 'physical', hits: 3, multiplier: 0.8,
        description: '3회 연속 공격, 각 0.8배 물리 데미지',
        unlockLevel: 1
      },
      {
        id: 'monk_inner_ki', name: '내공 방출', type: 'active', target: 'single',
        mpCost: 12, cooldown: 3, currentCooldown: 0,
        damageType: 'magic', multiplier: 1.8,
        effect: { paralyze: { chance: 0.35, duration: 1 } },
        description: '내공 마법 1.8배 + 35% 마비 (1턴)',
        unlockLevel: 5
      },
      {
        id: 'monk_iron_body', name: '금강불괴', type: 'active', target: 'self',
        mpCost: 15, cooldown: 5, currentCooldown: 0,
        damageType: 'buff', effect: { dmgReduce: 0.5, duration: 3 },
        description: '3턴간 받는 데미지 50% 감소',
        unlockLevel: 10
      },
      {
        id: 'monk_dragon_fist', name: '용권', type: 'active', target: 'single',
        mpCost: 22, cooldown: 6, currentCooldown: 0,
        damageType: 'physical', multiplier: 4.0,
        description: '최강의 일격. 물리 데미지 4배',
        unlockLevel: 15
      }
    ],
    passive: [
      {
        id: 'monk_endurance', name: '인내', type: 'passive',
        effect: { hpBonus: 15, defBonus: 3 },
        description: '최대 HP +15, 방어력 +3',
        unlockLevel: 3
      },
      {
        id: 'monk_flow', name: '흐름', type: 'passive',
        effect: { mpRegenPerTurn: 2 },
        description: '매 턴 MP 2 회복',
        unlockLevel: 8
      }
    ]
  }
};
