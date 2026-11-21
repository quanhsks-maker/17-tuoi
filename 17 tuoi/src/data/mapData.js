export const MAP_CONFIG = {
  width: 1200,
  height: 1200
};

export const BUILDINGS = [
  {
    id: 'home',
    name: 'Phòng trọ',
    icon: '🏠',
    x: 140,
    y: 140,
    w: 180,
    h: 130,
    actionLabel: 'Vào Phòng trọ'
  },
  {
    id: 'gym',
    name: 'Phòng Gym',
    icon: '🏋️',
    x: 485,
    y: 140,
    w: 170,
    h: 130,
    actionLabel: 'Vào Phòng Gym'
  },
  {
    id: 'uni',
    name: 'Trường ĐH',
    icon: '🏫',
    x: 790,
    y: 120,
    w: 240,
    h: 150,
    actionLabel: 'Vào Trường ĐH'
  },
  {
    id: 'net',
    name: 'Quán Net',
    icon: '🎮',
    x: 135,
    y: 490,
    w: 185,
    h: 130,
    actionLabel: 'Vào Quán Net'
  },
  {
    id: 'park',
    name: 'Công viên',
    icon: '🌳',
    x: 470,
    y: 470,
    w: 200,
    h: 160,
    isWalkable: true,
    actionLabel: 'Vào Công viên'
  },
  {
    id: 'clinic',
    name: 'Phòng khám',
    icon: '🏥',
    x: 820,
    y: 490,
    w: 190,
    h: 130,
    actionLabel: 'Vào Phòng khám'
  },
  {
    id: 'shop',
    name: 'Quán nước',
    icon: '☕',
    x: 140,
    y: 810,
    w: 190,
    h: 130,
    actionLabel: 'Vào Quán nước'
  },
  {
    id: 'pawn',
    name: 'Tiệm Cầm Đồ',
    icon: '🤝',
    x: 485,
    y: 820,
    w: 175,
    h: 130,
    actionLabel: 'Vào Tiệm Cầm Đồ'
  },
  {
    id: 'work',
    name: 'Chỗ làm',
    icon: '🏢',
    x: 800,
    y: 800,
    w: 230,
    h: 150,
    actionLabel: 'Vào Chỗ làm'
  },
  {
    id: 'item_shop',
    name: 'Shop',
    icon: '🛍️',
    x: 485,
    y: 1010,
    w: 160,
    h: 110,
    actionLabel: 'Vào Shop'
  }
];

export const STORY_NPCS = [
  {
    id: 'landlord',
    name: 'Chủ trọ',
    role: 'Quản lý nhà trọ',
    x: 340,
    y: 255,
    color: '#d97706',
    shirt: '#78350f',
    requiresUnlocked: false
  },
  {
    id: 'minh',
    name: 'Minh',
    role: 'Bạn thân',
    x: 335,
    y: 560,
    color: '#2563eb',
    shirt: '#1d4ed8',
    requiresUnlocked: false
  },
  {
    id: 'linh',
    name: 'Linh',
    role: 'Người yêu',
    x: 345,
    y: 875,
    color: '#ec4899',
    shirt: '#db2777',
    requiresUnlocked: true
  }
];