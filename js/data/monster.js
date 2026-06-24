const MONSTER_DATA = {

  // ─── 1-1 ~ 1-4 일반 몬스터 ───────────────────────────
  '1-1': {
    normal: [
      {
        id: 'goblin', name: '고블린', emoji: '👺',
        hp: 40, mp: 10, atk: 8, def: 3, spd: 6,
        expReward: 15, goldReward: 8,
        skills: [],
        passive: null,
        statusMoves: []
      }
    ]
  },
  '1-2': {
    normal: [
      {
        id: 'slime', name: '슬라임', emoji: '🟢',
        hp: 35, mp: 5, atk: 6, def: 5, spd: 4,
        expReward: 12, goldReward: 6,
        skills: [],
        passive: null,
        statusMoves: []
      }
    ]
  },
  '1-3': {
    normal: [
      {
        id: 'wolf', name: '검은늑대', emoji: '🐺',
        hp: 55, mp: 10, atk: 12, def: 4, spd: 10,
        expReward: 20, goldReward: 12,
        skills: [
          {
            id: 'wolf_howl', name: '울부짖음', target: 'all_enemy',
            mpCost: 5, cooldown: 3, currentCooldown: 0,
            damageType: 'debuff', effect: { atkDebuff: 0.85, duration: 2 },
            description: '공격력 15% 감소'
          }
        ],
        passive: null,
        statusMoves: []
      }
    ]
  },
  '1-4': {
    normal: [
      {
        id: 'orc', name: '오크', emoji: '👹',
        hp: 70, mp: 10, atk: 15, def: 8, spd: 5,
        expReward: 25, goldReward: 15,
        skills: [
          {
            id: 'orc_rage', name: '분노', target: 'self',
            mpCost: 8, cooldown: 4, currentCooldown: 0,
            damageType: 'buff', effect: { atkBuff: 1.5, duration: 2 },
            description: '공격력 50% 증가 (2턴)'
          }
        ],
        passive: null,
        statusMoves: []
      }
    ]
  },

  // ─── 1-5 중간보스 ───────────────────────────────────
  '1-5': {
    normal: [
      {
        id: 'dark_knight_minion', name: '암흑기사 부하', emoji: '🗡️',
        hp: 60, mp: 15, atk: 13, def: 6, spd: 7,
        expReward: 20, goldReward: 10,
        skills: [],
        passive: null,
        statusMoves: []
      }
    ],
    boss: [
      {
        id: 'dark_knight', name: '암흑기사 카론', emoji: '🖤',
        hp: 300, mp: 80, atk: 25, def: 15, spd: 9,
        expReward: 150, goldReward: 80,
        isBoss: true,
        skills: [
          {
            id: 'dark_slash', name: '암흑 베기', target: 'single',
            mpCost: 10, cooldown: 2, currentCooldown: 0,
            damageType: 'physical', multiplier: 2.0,
            description: '물리 데미지 2배'
          },
          {
            id: 'dark_wave', name: '암흑파', target: 'all_enemy',
            mpCost: 20, cooldown: 4, currentCooldown: 0,
            damageType: 'magic', multiplier: 1.5,
            effect: { curse: { duration: 2, atkDebuff: 0.8 } },
            description: '전체 마법 + 저주'
          }
        ],
        passive: {
          id: 'dark_armor', name: '암흑 갑옷',
          effect: { physicalResist: 0.15 },
          description: '물리 데미지 15% 감소'
        },
        statusMoves: [
          { name: '암흑 포효', target: 'all_enemy', effect: 'fear', chance: 0.3, duration: 1 }
        ]
      },
      {
        id: 'shadow_beast', name: '그림자 야수', emoji: '🐾',
        hp: 200, mp: 40, atk: 20, def: 8, spd: 14,
        expReward: 100, goldReward: 50,
        isBoss: true,
        skills: [
          {
            id: 'shadow_bite', name: '그림자 물기', target: 'single',
            mpCost: 8, cooldown: 2, currentCooldown: 0,
            damageType: 'physical', multiplier: 1.8,
            effect: { poison: { damage: 6, duration: 3 } },
            description: '물리 + 독'
          }
        ],
        passive: {
          id: 'shadow_dodge', name: '그림자 회피',
          effect: { dodgeRate: 0.2 },
          description: '회피율 20%'
        },
        statusMoves: []
      }
    ]
  },

  // ─── 1-6 ~ 1-9 일반 몬스터 ───────────────────────────
  '1-6': {
    normal: [
      {
        id: 'skeleton', name: '스켈레톤', emoji: '💀',
        hp: 80, mp: 10, atk: 18, def: 6, spd: 7,
        expReward: 30, goldReward: 18,
        skills: [
          {
            id: 'bone_throw', name: '뼈 투척', target: 'single',
            mpCost: 5, cooldown: 3, currentCooldown: 0,
            damageType: 'physical', multiplier: 1.5,
            description: '원거리 물리 공격'
          }
        ],
        passive: null,
        statusMoves: []
      }
    ]
  },
  '1-7': {
    normal: [
      {
        id: 'dark_mage', name: '암흑 마법사', emoji: '🧙',
        hp: 65, mp: 60, atk: 10, def: 4, spd: 8,
        expReward: 35, goldReward: 22,
        skills: [
          {
            id: 'dark_bolt', name: '암흑 볼트', target: 'single',
            mpCost: 12, cooldown: 2, currentCooldown: 0,
            damageType: 'magic', multiplier: 2.0,
            description: '마법 데미지 2배'
          }
        ],
        passive: null,
        statusMoves: [
          { name: '저주', target: 'single', effect: 'curse', chance: 0.4, duration: 2 }
        ]
      }
    ]
  },
  '1-8': {
    normal: [
      {
        id: 'golem', name: '골렘', emoji: '🗿',
        hp: 120, mp: 0, atk: 22, def: 18, spd: 3,
        expReward: 40, goldReward: 28,
        skills: [],
        passive: {
          id: 'stone_body', name: '석재 몸',
          effect: { physicalResist: 0.2, magicResist: 0.1 },
          description: '물리 20%, 마법 10% 저항'
        },
        statusMoves: []
      }
    ]
  },
  '1-9': {
    normal: [
      {
        id: 'vampire', name: '뱀파이어', emoji: '🧛',
        hp: 100, mp: 50, atk: 24, def: 10, spd: 12,
        expReward: 50, goldReward: 35,
        skills: [
          {
            id: 'blood_drain', name: '흡혈', target: 'single',
            mpCost: 15, cooldown: 3, currentCooldown: 0,
            damageType: 'magic', multiplier: 1.5,
            effect: { lifesteal: 0.5 },
            description: '마법 + 데미지 50% 흡혈'
          }
        ],
        passive: {
          id: 'undead', name: '언데드',
          effect: { hpRegenPerTurn: 5 },
          description: '매 턴 HP 5 회복'
        },
        statusMoves: []
      }
    ]
  },

  // ─── 1-10 최종보스 ──────────────────────────────────
  '1-10': {
    normal: [
      {
        id: 'demon_soldier', name: '마왕 병사', emoji: '😈',
        hp: 90, mp: 20, atk: 20, def: 10, spd: 9,
        expReward: 35, goldReward: 20,
        skills: [],
        passive: null,
        statusMoves: []
      }
    ],
    boss: [
      {
        id: 'demon_lord', name: '마왕 발타자르', emoji: '👿',
        hp: 800, mp: 200, atk: 45, def: 25, spd: 15,
        expReward: 500, goldReward: 300,
        isBoss: true, isFinalBoss: true,
        skills: [
          {
            id: 'hellfire', name: '지옥불', target: 'all_enemy',
            mpCost: 30, cooldown: 3, currentCooldown: 0,
            damageType: 'magic', multiplier: 2.0,
            effect: { burn: { damage: 10, duration: 3 } },
            description: '전체 마법 + 화상'
          },
          {
            id: 'demon_slash', name: '마왕 참격', target: 'single',
            mpCost: 20, cooldown: 2, currentCooldown: 0,
            damageType: 'physical', multiplier: 3.0,
            description: '강력한 단일 물리 3배'
          },
          {
            id: 'chaos_nova', name: '카오스 노바', target: 'all_enemy',
            mpCost: 50, cooldown: 6, currentCooldown: 0,
            damageType: 'magic', multiplier: 3.5,
            effect: { random_status: true },
            description: '전체 마법 3.5배 + 랜덤 상태이상'
          }
        ],
        passive: {
          id: 'demonic_power', name: '마왕의 힘',
          effect: { physicalResist: 0.2, magicResist: 0.2, atkBonusOnLowHp: 1.5 },
          description: 'HP 50% 이하시 공격력 1.5배, 물리/마법 20% 저항'
        },
        statusMoves: [
          { name: '공포 포효', target: 'all_enemy', effect: 'fear',   chance: 0.5, duration: 2 },
          { name: '저주의 손길', target: 'single', effect: 'curse',  chance: 0.6, duration: 3 },
          { name: '독 안개',    target: 'all_enemy', effect: 'poison', chance: 0.4, duration: 3, damage: 12 }
        ]
      },
      {
        id: 'demon_general', name: '마왕 장군 그림', emoji: '⚔️',
        hp: 500, mp: 100, atk: 35, def: 20, spd: 12,
        expReward: 300, goldReward: 150,
        isBoss: true,
        skills: [
          {
            id: 'war_cry', name: '전쟁의 함성', target: 'all_ally',
            mpCost: 20, cooldown: 4, currentCooldown: 0,
            damageType: 'buff', effect: { atkBuff: 1.3, duration: 3 },
            description: '아군 공격력 30% 증가'
          },
          {
            id: 'cleave', name: '휩쓸기', target: 'all_enemy',
            mpCost: 15, cooldown: 3, currentCooldown: 0,
            damageType: 'physical', multiplier: 1.8,
            description: '전체 물리 1.8배'
          }
        ],
        passive: {
          id: 'commanders_aura', name: '지휘관의 오라',
          effect: { allyAtkBonus: 0.1 },
          description: '아군 공격력 10% 증가'
        },
        statusMoves: []
      },
      {
        id: 'demon_witch', name: '마녀 리리스', emoji: '🧙‍♀️',
        hp: 400, mp: 300, atk: 20, def: 12, spd: 16,
        expReward: 250, goldReward: 120,
        isBoss: true,
        skills: [
          {
            id: 'dark_ritual', name: '암흑 의식', target: 'all_enemy',
            mpCost: 40, cooldown: 5, currentCooldown: 0,
            damageType: 'magic', multiplier: 2.5,
            effect: { silence: { chance: 0.5, duration: 2 } },
            description: '전체 마법 2.5배 + 침묵'
          },
          {
            id: 'curse_of_weakness', name: '약화의 저주', target: 'all_enemy',
            mpCost: 25, cooldown: 4, currentCooldown: 0,
            damageType: 'debuff',
            effect: { atkDebuff: 0.7, defDebuff: 0.7, duration: 3 },
            description: '공격/방어력 30% 감소 (3턴)'
          }
        ],
        passive: {
          id: 'mana_surge', name: '마나 급증',
          effect: { mpRegenPerTurn: 15, magicDmgBonus: 0.2 },
          description: '매 턴 MP 15 회복, 마법 데미지 +20%'
        },
        statusMoves: [
          { name: '저주', target: 'all_enemy', effect: 'curse', chance: 0.5, duration: 3 }
        ]
      }
    ]
  }
};
