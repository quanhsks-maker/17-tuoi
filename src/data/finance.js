import { getVehicle, GEARS } from './items.js';

export function createDefaultFinance() {
  return {
    savings: 0,
    goldQty: 0,
    goldPrice: 8200000,
    goldPrev: 8200000,
    stockQty: 0,
    stockPrice: 500000,
    stockPrev: 500000
  };
}

export const BUSINESSES = [
  {
    id: 'coffee_cart',
    name: 'Xe cafe mang đi',
    cost: 25000000,
    monthlyProfit: 3500000,
    desc: 'Thuê người bán buổi sáng • Lãi TB ~3.5tr/tháng'
  },
  {
    id: 'mini_shop',
    name: 'Quán nước nhỏ',
    cost: 60000000,
    monthlyProfit: 9000000,
    desc: 'Có mặt bằng ổn định • Lãi TB ~9tr/tháng'
  },
  {
    id: 'tech_store',
    name: 'Cửa hàng phụ kiện',
    cost: 150000000,
    monthlyProfit: 24000000,
    desc: 'Bán lẻ & online • Lãi TB ~24tr/tháng'
  }
];

export function getMonthlyBusinessProfit(businessIds = []) {
  return BUSINESSES
    .filter(b => businessIds.includes(b.id))
    .reduce((sum, b) => sum + b.monthlyProfit, 0);
}

// Tính lãi kinh doanh thực tế mỗi tháng (biến động -20% đến +20%)
export function rollMonthlyBusinessProfit(businessIds = []) {
  const base = getMonthlyBusinessProfit(businessIds);
  if (base <= 0) return { profit: 0, label: '' };

  const factor = 0.8 + Math.random() * 0.4;
  const profit = Math.round((base * factor) / 50000) * 50000;
  let label = 'ổn định';
  if (factor >= 1.1) label = 'đông khách';
  else if (factor <= 0.9) label = 'hơi vắng';

  return { profit, label };
}

export function updateMarketMonthly(finance) {
  const interest = Math.round(finance.savings * 0.006);
  finance.savings += interest;

  finance.goldPrev = finance.goldPrice;
  const goldChange = (Math.random() * 0.13) - 0.06;
  const nextGold = Math.round((finance.goldPrice * (1 + goldChange)) / 50000) * 50000;
  finance.goldPrice = Math.max(7000000, Math.min(11500000, nextGold));

  finance.stockPrev = finance.stockPrice;
  const stockChange = (Math.random() * 0.33) - 0.15;
  const nextStock = Math.round((finance.stockPrice * (1 + stockChange)) / 10000) * 10000;
  finance.stockPrice = Math.max(200000, Math.min(1500000, nextStock));

  return { interest };
}

export function getPawnRedeemCost(pawnObj) {
  if (!pawnObj || typeof pawnObj !== 'object') return 0;
  const months = Math.max(1, pawnObj.months || 1);
  return Math.round((pawnObj.principal * (1 + 0.05 * months)) / 10000) * 10000;
}

export function getNetWorth(save) {
  const f = save.finance || createDefaultFinance();
  const bizValue = BUSINESSES
    .filter(b => (save.businesses || []).includes(b.id))
    .reduce((sum, b) => sum + b.cost, 0);

  // Cộng giá trị tài sản đang sở hữu (xe + laptop)
  let assetValue = 0;
  if (save.assets?.vehicle && save.assets.vehicle !== 'walk') {
    assetValue += getVehicle(save.assets.vehicle).price;
  }
  if (save.assets?.gears?.includes('laptop')) {
    const lap = GEARS.find(g => g.id === 'laptop');
    if (lap) assetValue += lap.price;
  }

  // Trừ khoản nợ đang cầm đồ
  let pawnDebt = 0;
  if (save.pawned?.vehicle && typeof save.pawned.vehicle === 'object') {
    pawnDebt += getPawnRedeemCost(save.pawned.vehicle);
  }
  if (save.pawned?.laptop && typeof save.pawned.laptop === 'object') {
    pawnDebt += getPawnRedeemCost(save.pawned.laptop);
  }

  return (
    save.stats.money +
    f.savings +
    f.goldQty * f.goldPrice +
    f.stockQty * f.stockPrice +
    bizValue +
    assetValue -
    pawnDebt
  );
}

export const MILESTONES = [
  {
    id: 'net_10m',
    name: 'Tự lập tài chính',
    desc: 'Tổng tài sản đạt 10.000.000đ',
    check: (save) => getNetWorth(save) >= 10000000
  },
  {
    id: 'buy_moto',
    name: 'Có xe máy riêng',
    desc: 'Mua được Xe máy trong mục Tài sản',
    check: (save) => save.assets?.vehicle === 'motorbike'
  },
  {
    id: 'grad_uni',
    name: 'Cầm bằng Đại học',
    desc: 'Tốt nghiệp Đại học và đi làm đúng ngành',
    check: (save) => save.life_path === 'STUDY' && !!save.job_id
  },
  {
    id: 'first_biz',
    name: 'Làm chủ nhỏ',
    desc: 'Mở được mô hình kinh doanh đầu tiên',
    check: (save) => (save.businesses || []).length > 0
  },
  {
    id: 'net_100m',
    name: '100 triệu đầu tiên',
    desc: 'Tổng tài sản đạt 100.000.000đ',
    check: (save) => getNetWorth(save) >= 100000000
  },
  {
    id: 'net_500m',
    name: 'Tự do tài chính',
    desc: 'Tổng tài sản đạt 500.000.000đ (Mục tiêu phá đảo)',
    check: (save) => getNetWorth(save) >= 500000000
  }
];