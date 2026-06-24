const ITEM_DATA = {
  consumables: [
    {
      id: 'hp_potion_s', name: '소형 HP 포션', type: 'consumable',
      effect: { hp: 50 }, price: 30,
      description: 'HP 50 회복', emoji: '🧪'
    },
    {
      id: 'hp_potion_m', name: '중형 HP 포션', type: 'consumable',
      effect: { hp: 150 }, price: 80,
      description: 'HP 150 회복', emoji: '🧪'
    },
    {
      id: 'hp_potion_l', name: '대형 HP 포션', type: 'consumable',
      effect: { hp: 400 }, price: 200,
      description: 'HP 400 회복', emoji: '🧪'
    },
    {
      id: 'mp_potion_s', name: '소형 MP 포션', type: 'consumable',
      effect: { mp: 20 }, price: 30,
      description: 'MP 20 회복', emoji: '💧'
    },
    {
      id: 'mp_potion_m', name: '중형 MP 포션', type: 'consumable',
      effect: { mp: 60 }, price: 80,
      description: 'MP 60 회복', emoji: '💧'
    },
    {
      id: 'antidote', name: '해독제', type: 'consumable',
      effect: { removeStatus: 'poison' }, price: 25,
      description: '독 상태이상 제거', emoji: '💊'
    },
    {
      id: 'elixir', name: '엘릭서', type: 'consumable',
      effect: { removeAllStatus: true }, price: 150,
      description: '모든 상태이상 제거', emoji: '✨'
    }
  ],
  scrolls: [
    {
      id: 'scroll_atk', name: '공격 강화 주문서', type: 'scroll',
      effect: { atkBonus: 3, permanent: true }, price: 200,
      description: '장비 공격력 +3 (영구)', emoji: '📜'
    },
    {
      id: 'scroll_def', name: '방어 강화 주문서', type: 'scroll',
      effect: { defBonus: 3, permanent: true }, price: 200,
      description: '장비 방어력 +3 (영구)', emoji: '📜'
    },
    {
      id: 'scroll_identify', name: '감정 주문서', type: 'scroll',
      effect: { identify: true }, price: 50,
      description: '미감정 아이템 감정', emoji: '🔍'
    }
  ],
  equipment: [
    {
      id: 'iron_sword', name: '철검', type: 'weapon',
      forClass: ['warrior', 'knight'],
      stats: { atk: 10 }, price: 100,
      description: '기본 철제 검', emoji: '⚔️', enhanceLevel: 0
    },
    {
      id: 'magic_staff', name: '마법 스태프', type: 'weapon',
      forClass: ['mage', 'cleric'],
      stats: { matk: 12 }, price: 120,
      description: '마법력이 깃든 스태프', emoji: '🪄', enhanceLevel: 0
    },
    {
      id: 'iron_dagger', name: '철 단검', type: 'weapon',
      forClass: ['rogue'],
      stats: { atk: 8, spd: 3 }, price: 90,
      description: '빠른 철제 단검', emoji: '🗡️', enhanceLevel: 0
    },
    {
      id: 'iron_knuckle', name: '철 너클', type: 'weapon',
      forClass: ['monk'],
      stats: { atk: 9, spd: 2 }, price: 95,
      description: '단단한 철 너클', emoji: '👊', enhanceLevel: 0
    },
    {
      id: 'leather_armor', name: '가죽 갑옷', type: 'armor',
      forClass: ['warrior','knight','rogue','monk'],
      stats: { def: 8 }, price: 80,
      description: '기본 가죽 방어구', emoji: '🥋', enhanceLevel: 0
    },
    {
      id: 'cloth_robe', name: '천 로브', type: 'armor',
      forClass: ['mage','cleric'],
      stats: { def: 4, mp: 20 }, price: 70,
      description: '마법사용 기본 로브', emoji: '👘', enhanceLevel: 0
    },
    {
      id: 'iron_shield', name: '철 방패', type: 'shield',
      forClass: ['knight','cleric'],
      stats: { def: 10 }, price: 110,
      description: '단단한 철제 방패', emoji: '🛡️', enhanceLevel: 0
    }
  ]
};
