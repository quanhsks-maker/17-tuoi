export const VEHICLES = [
  { id: 'walk', name: 'Đi bộ', price: 0, speed: 230, desc: 'Tốc độ mặc định' },
  { id: 'bike', name: 'Xe đạp cũ', price: 1500000, speed: 310, desc: 'Di chuyển nhanh hơn (+35% tốc độ)' },
  { id: 'motorbike', name: 'Xe máy', price: 18000000, speed: 410, desc: 'Chạy mượt khắp thành phố (+80% tốc độ)' }
];

export const GEARS = [
  {
    id: 'laptop',
    name: 'Laptop cũ',
    price: 6000000,
    desc: 'Đi học +8 Học lực (thay vì +5), ôn thi +14 Học lực'
  }
];

export const ROOMS = [
  {
    id: 'basic',
    name: 'Trọ bình dân',
    rent: 1500000,
    maxEnergy: 100,
    happyBonus: 0,
    desc: '1.500.000đ/tháng • Thể lực tối đa 100'
  },
  {
    id: 'ac_room',
    name: 'Phòng máy lạnh',
    rent: 2500000,
    maxEnergy: 100,
    happyBonus: 10,
    desc: '2.500.000đ/tháng • Hồi +10 Tinh thần mỗi tháng'
  },
  {
    id: 'mini_apt',
    name: 'Chung cư mini',
    rent: 4500000,
    maxEnergy: 120,
    happyBonus: 20,
    desc: '4.500.000đ/tháng • Thể lực tối đa 120, hồi +20 Tinh thần'
  }
];

export function getVehicle(id) {
  return VEHICLES.find(v => v.id === id) || VEHICLES[0];
}

export function getRoom(id) {
  return ROOMS.find(r => r.id === id) || ROOMS[0];
}
