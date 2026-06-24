const CLASS_DATA = {
  warrior: {
    id: 'warrior', name: '전사',
    baseWeapons: ['대검', '양손검'],
    baseStats: { str: 8, agi: 5, int: 3, vit: 6 },
    statBase: 'str',
    hpGrowth: [
      {val:12,w:30},{val:13,w:20},{val:14,w:20},
      {val:15,w:15},{val:16,w:10},{val:17,w:5}
    ],
    mpGrowth: [
      {val:6,w:30},{val:7,w:30},{val:8,w:20},
      {val:9,w:15},{val:10,w:5}
    ],
    startHP: 30, startMP: 10,
    description: '강력한 물리 공격의 전문가',
    color: '#e74c3c',
    emoji: '⚔️'
  },
  knight: {
    id: 'knight', name: '기사',
    baseWeapons: ['장검', '방패'],
    baseStats: { str: 7, agi: 4, int: 3, vit: 8 },
    statBase: 'str',
    hpGrowth: [
      {val:12,w:30},{val:13,w:20},{val:14,w:20},
      {val:15,w:15},{val:16,w:10},{val:17,w:5}
    ],
    mpGrowth: [
      {val:6,w:30},{val:7,w:30},{val:8,w:20},
      {val:9,w:15},{val:10,w:5}
    ],
    startHP: 30, startMP: 10,
    description: '방어와 공격을 겸비한 수호자',
    color: '#3498db',
    emoji: '🛡️'
  },
  mage: {
    id: 'mage', name: '마법사',
    baseWeapons: ['스태프', '오브'],
    baseStats: { str: 2, agi: 5, int: 10, vit: 3 },
    statBase: 'int',
    hpGrowth: [
      {val:6,w:30},{val:7,w:20},{val:8,w:20},
      {val:9,w:15},{val:10,w:10},{val:11,w:5}
    ],
    mpGrowth: [
      {val:15,w:30},{val:16,w:30},{val:17,w:20},
      {val:18,w:15},{val:19,w:5}
    ],
    startHP: 30, startMP: 10,
    description: '강력한 마법으로 적을 섬멸',
    color: '#9b59b6',
    emoji: '🔮'
  },
