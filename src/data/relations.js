export const DEFAULT_RELATIONS = {
  ba: {
    id: 'ba',
    name: 'Ba',
    role: 'Gia đình',
    affection: 60,
    unlocked: true
  },
  minh: {
    id: 'minh',
    name: 'Minh',
    role: 'Bạn thân',
    affection: 40,
    unlocked: true
  },
  linh: {
    id: 'linh',
    name: 'Linh',
    role: 'Người yêu',
    affection: 0,
    unlocked: false,
    ignoredMonths: 0
  }
};

export function createDefaultRelations() {
  return JSON.parse(JSON.stringify(DEFAULT_RELATIONS));
}
