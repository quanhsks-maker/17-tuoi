import { savePlayerProgress } from '../core/storage.js';
import { sound } from '../core/sound.js';
import { MAJORS } from '../data/majors.js';
import { getJobById, getRandom17Jobs } from '../data/jobs.js';
import { pickRandomQuestions } from '../data/examQuestions.js';
import { VEHICLES, GEARS, ROOMS, getVehicle, getRoom } from '../data/items.js';
import { createDefaultRelations } from '../data/relations.js';
import {
  createDefaultFinance,
  updateMarketMonthly,
  getNetWorth,
  MILESTONES,
  BUSINESSES,
  getMonthlyBusinessProfit,
  rollMonthlyBusinessProfit,
  getPawnRedeemCost
} from '../data/finance.js';
import { pickRandomMonthlyEvent } from '../data/events.js';

const STUDENT_ALLOWANCE = 1000000;
const MAX_DEBT = -3000000;
const MAX_EXTRA_DEBT_BUFFER = 2000000;

const EXTRA_SHOP_ITEMS = [
  {
    id: 'raincoat_pro',
    name: 'Áo mưa bộ cao cấp',
    price: 350000,
    desc: 'Đi lại đỡ lạnh mùa mưa, giảm nguy cơ bị ốm khi trở trời.'
  },
  {
    id: 'anc_headset',
    name: 'Tai nghe chống ồn',
    price: 900000,
    desc: 'Học tập & ôn thi tập trung hơn, giảm hao tinh thần khi học/ôn.'
  },
  {
    id: 'study_lamp',
    name: 'Đèn bàn học LED',
    price: 450000,
    desc: 'Tăng thêm +2 Học lực mỗi lần tự học tại phòng hoặc ôn thi.'
  },
  {
    id: 'thermal_bag',
    name: 'Túi giữ nhiệt chạy việc',
    price: 600000,
    desc: 'Hỗ trợ chạy kèo & làm ca nhanh gọn, cộng thêm +100.000đ mỗi ca làm.'
  },
  {
    id: 'mini_coffee',
    name: 'Máy pha cafe mini',
    price: 750000,
    desc: 'Pha nhanh ly cafe ở phòng, hồi thêm +4 Tinh thần khi qua tháng.'
  },
  {
    id: 'power_bank',
    name: 'Sạc dự phòng 20.000mAh',
    price: 550000,
    desc: 'Ra ngoài yên tâm hơn, cộng +10 Thể lực tối đa.'
  }
];

export function initHudUI(user, save, engine) {
  const infoEl = document.getElementById('hud-player-info');
  const moneyEl = document.getElementById('hud-money');
  const energyEl = document.getElementById('hud-energy');
  const happyEl = document.getElementById('hud-happy');
  const knowEl = document.getElementById('hud-know');
  const barEnergy = document.getElementById('bar-energy');
  const barHappy = document.getElementById('bar-happy');
  const barKnow = document.getElementById('bar-know');
  const goalEl = document.getElementById('hud-goal');

  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const interactBtn = document.getElementById('btn-interact');
  const toastEl = document.getElementById('hud-toast');

  const eventModal = document.getElementById('event-modal');
  const eventTitle = document.getElementById('event-title');
  const eventDesc = document.getElementById('event-desc');
  const eventActions = eventModal.querySelector('.event-actions');

  const examModal = document.getElementById('exam-modal');
  const examProgress = document.getElementById('exam-progress');
  const examBonusEl = document.getElementById('exam-bonus');
  const examQuestionEl = document.getElementById('exam-question');
  const examOptionsEl = document.getElementById('exam-options');

  const menuModal = document.getElementById('menu-modal');
  const btnOpenMenu = document.getElementById('btn-open-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');

  const profileModal = document.getElementById('profile-modal');
  const profileContent = document.getElementById('profile-content');
  const btnCloseProfile = document.getElementById('btn-close-profile');

  const shopModal = document.getElementById('shop-modal');
  const shopContent = document.getElementById('shop-content');
  const btnCloseShop = document.getElementById('btn-close-shop');

  const relModal = document.getElementById('rel-modal');
  const relContent = document.getElementById('rel-content');
  const btnCloseRel = document.getElementById('btn-close-rel');

  const financeModal = document.getElementById('finance-modal');
  const financeContent = document.getElementById('finance-content');
  const btnCloseFinance = document.getElementById('btn-close-finance');

  const actionModal = document.getElementById('action-modal');
  const actionTitle = document.getElementById('action-title');
  const actionDesc = document.getElementById('action-desc');
  const actionList = document.getElementById('action-list');
  const btnCloseAction = document.getElementById('btn-close-action');

  if (!save.stats.month || save.stats.month > 12) save.stats.month = 1;
  if (!save.monthly_flags) save.monthly_flags = {};
  if (typeof save.low_happy_months !== 'number') save.low_happy_months = 0;
  if (!save.assets) save.assets = { vehicle: 'walk', room: 'basic', gears: [] };
  if (!Array.isArray(save.assets.gears)) save.assets.gears = [];
  if (!save.relations) save.relations = createDefaultRelations();
  if (!save.finance) save.finance = createDefaultFinance();
  if (!save.milestones) save.milestones = [];
  if (!save.job_shifts) save.job_shifts = {};
  if (!save.businesses) save.businesses = [];
  if (typeof save.gym_bonus !== 'number') save.gym_bonus = 0;
  if (typeof save.extra_debt_buffer !== 'number') save.extra_debt_buffer = 0;
  save.extra_debt_buffer = Math.min(MAX_EXTRA_DEBT_BUFFER, Math.max(0, save.extra_debt_buffer));
  if (!save.pawned) save.pawned = {};
  if (typeof save.is_sick !== 'boolean') save.is_sick = false;

  if (typeof save.pawned.vehicle === 'string') {
    const v = getVehicle(save.pawned.vehicle);
    save.pawned.vehicle = { id: v.id, principal: Math.round(v.price * 0.6), months: 1 };
  }
  if (save.pawned.laptop === true) {
    save.pawned.laptop = { principal: 3500000, months: 1 };
  }

  let currentTarget = null;
  let toastTimer = null;

  function closeAllSubModals() {
    if (menuModal) menuModal.classList.add('hidden');
    if (profileModal) profileModal.classList.add('hidden');
    if (shopModal) shopModal.classList.add('hidden');
    if (relModal) relModal.classList.add('hidden');
    if (financeModal) financeModal.classList.add('hidden');
    if (actionModal) actionModal.classList.add('hidden');
  }

  const dismissibleModals = [menuModal, profileModal, shopModal, relModal, financeModal, actionModal];
  dismissibleModals.forEach((m) => {
    if (!m) return;
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        sound.playClick();
        m.classList.add('hidden');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllSubModals();
    }
  });

  function hasItem(itemId) {
    return save.assets.gears.includes(itemId);
  }

  function hasLaptop() {
    return hasItem('laptop') && !save.pawned.laptop;
  }

  function getFullNetWorth() {
    const extraVal = EXTRA_SHOP_ITEMS
      .filter(item => hasItem(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    return getNetWorth(save) + extraVal;
  }

  function getMaxEnergy() {
    const bankBonus = hasItem('power_bank') ? 10 : 0;
    return getRoom(save.assets.room).maxEnergy + (save.gym_bonus || 0) + bankBonus;
  }

  function getCurrentRent() {
    return getRoom(save.assets.room).rent;
  }

  function getDebtLimit() {
    return MAX_DEBT - Math.min(MAX_EXTRA_DEBT_BUFFER, save.extra_debt_buffer || 0);
  }

  function syncEngineState() {
    const activeVeh = save.pawned.vehicle ? 'walk' : save.assets.vehicle;
    engine.setPlayerSpeed(getVehicle(activeVeh).speed);
    engine.setNpcUnlocked('linh', !!save.relations.linh?.unlocked);
  }

  syncEngineState();
  engine.setWeather([9, 10, 11].includes(save.stats.month) ? 'rain' : 'clear');

  if (btnToggleSound) {
    btnToggleSound.onclick = () => {
      sound.muted = !sound.muted;
      btnToggleSound.textContent = sound.muted ? '🔇' : '🔊';
      if (!sound.muted) sound.playClick();
    };
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  function showEventModal(title, desc, buttons) {
    closeAllSubModals();
    eventTitle.textContent = title;
    eventDesc.textContent = desc;
    eventActions.innerHTML = '';

    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.style === 'safe' ? 'btn-event-safe' : 'btn-event-risk';
      btn.textContent = b.label;
      btn.onclick = () => {
        sound.playClick();
        eventModal.classList.add('hidden');
        b.onClick();
      };
      eventActions.appendChild(btn);
    });

    eventModal.classList.remove('hidden');
  }

  function getJobLevelInfo(jobKey) {
    const shifts = save.job_shifts[jobKey] || 0;
    const level = Math.min(5, Math.floor(shifts / 8) + 1);
    const mult = 1 + (level - 1) * 0.15;
    const progress = level >= 5 ? 8 : shifts % 8;
    return { shifts, level, mult, progress };
  }

  function getPlaystyleTitle() {
    const totalShifts = Object.values(save.job_shifts || {}).reduce((a, b) => a + (b || 0), 0);
    const netWorth = getFullNetWorth();
    if (netWorth >= 50000000) return 'Dân đầu tư có số';
    if (save.life_path === 'STUDY' && save.stats.knowledge >= 60) return 'Sinh viên bám mục tiêu';
    if (totalShifts >= 12) return 'Tay cày bền bỉ';
    if (save.stats.money < 0) return 'Dân xoay xở qua bão';
    return 'Tân binh lập nghiệp';
  }

  function getChapterQuests() {
    const jobKey = save.job_id || 'part_time';
    const { level } = getJobLevelInfo(jobKey);
    const hasOwnGear = save.assets.vehicle !== 'walk' || save.assets.gears.length > 0;
    const netWorth = getFullNetWorth();

    return [
      {
        title: 'Chặng 1: Đứng vững dòng tiền đầu tiên',
        done: netWorth >= 3000000 && save.stats.money >= 0,
        status: netWorth >= 3000000 && save.stats.money >= 0 ? 'Hoàn thành' : `Tài sản ${netWorth.toLocaleString()}đ / 3.000.000đ`
      },
      {
        title: 'Chặng 2: Có phương tiện hoặc đồ dùng riêng',
        done: hasOwnGear,
        status: hasOwnGear ? 'Hoàn thành' : 'Chưa sở hữu xe hoặc đồ dùng'
      },
      {
        title: 'Chặng 3: Nâng tay nghề lên Bậc 2/5',
        done: level >= 2,
        status: level >= 2 ? `Đã đạt Bậc ${level}/5` : `Hiện tại Bậc ${level}/5`
      },
      {
        title: 'Chặng 4: Bứt phá mốc 20.000.000đ tài sản',
        done: netWorth >= 20000000,
        status: netWorth >= 20000000 ? 'Hoàn thành' : `${netWorth.toLocaleString()}đ / 20.000.000đ`
      }
    ];
  }

  // ==================== BẢNG THÔNG TIN NHÂN VẬT ====================
  function renderProfileModal() {
    if (!profileContent) return;
    profileContent.innerHTML = '';

    const job = save.job_id ? getJobById(save.job_id) : null;
    const major = save.major_id ? MAJORS.find(m => m.major_id === save.major_id) : null;
    const jobKey = job ? job.job_id : 'part_time';
    const { level, mult, progress } = getJobLevelInfo(jobKey);
    const baseShiftPay = job ? job.income_per_shift : 1800000;
    const bagBonus = hasItem('thermal_bag') ? 100000 : 0;
    const realShiftPay = Math.round(baseShiftPay * mult) + bagBonus;

    const room = getRoom(save.assets.room);
    const activeVeh = getVehicle(save.pawned.vehicle ? 'walk' : save.assets.vehicle);
    const maxE = getMaxEnergy();

    const statusList = [];
    if (save.is_sick) statusList.push('🤒 Đang ốm (hồi ít thể lực)');
    if (save.low_happy_months >= 1) statusList.push('⚠️ Sắp kiệt sức (cần hồi Tinh thần)');
    if (save.stats.money < 0) statusList.push(`⚠️ Đang nợ ${Math.abs(save.stats.money).toLocaleString()}đ`);
    if (save.extra_debt_buffer > 0) statusList.push(`Đã nới trần nợ thêm +${(save.extra_debt_buffer / 1000000).toFixed(0)}tr`);
    if (statusList.length === 0) statusList.push('Bình thường');

    const card1 = document.createElement('div');
    card1.className = 'profile-card';
    card1.innerHTML = `
      <strong>${user.username} • ${save.stats.age} tuổi (Tháng ${save.stats.month}/12)</strong>
      <div class="profile-line">• Danh hiệu hiện tại: <b>${getPlaystyleTitle()}</b></div>
      <div class="profile-line">• Hướng đi: ${save.life_path === 'STUDY' ? 'Học Đại học' : 'Đi làm tự do'}${major ? ` (${major.name})` : ''}</div>
      <div class="profile-line">• Nghề hiện tại: ${job ? job.name : 'Làm thêm'} — <b>Bậc ${level}/5</b> (${progress}/8 ca)</div>
      <div class="profile-line">• Lương thực nhận/ca: <b>${realShiftPay.toLocaleString()}đ</b> (+${Math.round((mult - 1) * 100)}%${bagBonus ? ' + túi giữ nhiệt' : ''})</div>
      <div class="profile-line">• Trạng thái: ${statusList.join(' • ')}</div>
    `;
    profileContent.appendChild(card1);

    const quests = getChapterQuests();
    const cardQuests = document.createElement('div');
    cardQuests.className = 'profile-card';
    cardQuests.innerHTML = `
      <strong>Mục tiêu chặng ngắn</strong>
      ${quests.map(q => `<div class="profile-line">${q.done ? '✅' : '▫️'} <b>${q.title}</b> — ${q.status}</div>`).join('')}
    `;
    profileContent.appendChild(cardQuests);

    const card2 = document.createElement('div');
    card2.className = 'profile-card';
    card2.innerHTML = `
      <strong>Chỉ số & Chỗ ở</strong>
      <div class="profile-line">• Tiền mặt: <b>${save.stats.money.toLocaleString()}đ</b> • Tổng tài sản: <b>${getFullNetWorth().toLocaleString()}đ</b></div>
      <div class="profile-line">• Thể lực: <b>${save.stats.energy}/${maxE}</b> (Gym +${save.gym_bonus}/30${hasItem('power_bank') ? ' • Sạc dự phòng +10' : ''})</div>
      <div class="profile-line">• Tinh thần: <b>${save.stats.happiness}/100</b> • Học lực: <b>${save.stats.knowledge}/100</b></div>
      <div class="profile-line">• Phòng đang ở: <b>${room.name}</b> (${room.rent.toLocaleString()}đ/tháng — đổi phòng tại Chủ trọ)</div>
      <div class="profile-line">• Xe đang đi: ${activeVeh.name}</div>
    `;
    profileContent.appendChild(card2);

    const ownedBizNames = BUSINESSES
      .filter(b => save.businesses.includes(b.id))
      .map(b => b.name);
    const passiveAvg = getMonthlyBusinessProfit(save.businesses);

    const pawnLines = [];
    if (save.pawned.vehicle) {
      const vObj = getVehicle(save.pawned.vehicle.id);
      const cost = getPawnRedeemCost(save.pawned.vehicle);
      pawnLines.push(`• ${vObj.name}: Tháng ${save.pawned.vehicle.months}/6 • Chuộc ${cost.toLocaleString()}đ`);
    }
    if (save.pawned.laptop) {
      const cost = getPawnRedeemCost(save.pawned.laptop);
      pawnLines.push(`• Laptop cũ: Tháng ${save.pawned.laptop.months}/6 • Chuộc ${cost.toLocaleString()}đ`);
    }
    if (pawnLines.length === 0) pawnLines.push('• Không có món nào đang cầm đồ.');

    const card3 = document.createElement('div');
    card3.className = 'profile-card';
    card3.innerHTML = `
      <strong>Kinh doanh & Cầm đồ</strong>
      <div class="profile-line">• Kinh doanh: ${ownedBizNames.length ? ownedBizNames.join(', ') : 'Chưa mở'} (TB ~${passiveAvg.toLocaleString()}đ/th)</div>
      <div class="profile-line">• Tiết kiệm: ${save.finance.savings.toLocaleString()}đ • Vàng: ${save.finance.goldQty} chỉ • CP: ${save.finance.stockQty} cp</div>
      <div class="profile-line" style="margin-top:4px;"><b>Đồ đang cầm:</b></div>
      ${pawnLines.map(line => `<div class="profile-line">${line}</div>`).join('')}
      <div class="profile-line" style="margin-top:4px;">• Cột mốc đã đạt: <b>${save.milestones.length}/${MILESTONES.length}</b></div>
    `;
    profileContent.appendChild(card3);
  }

  if (btnCloseProfile && profileModal) {
    btnCloseProfile.onclick = () => {
      sound.playClick();
      profileModal.classList.add('hidden');
    };
  }

  function checkMilestones() {
    let newlyUnlocked = null;
    for (const m of MILESTONES) {
      if (!save.milestones.includes(m.id) && m.check(save)) {
        save.milestones.push(m.id);
        newlyUnlocked = m;
      }
    }

    if (newlyUnlocked) {
      sound.playSuccess();
      if (newlyUnlocked.id === 'net_500m') {
        showEventModal(
          'ĐẠT MỤC TIÊU: TỰ DO TÀI CHÍNH',
          `Ở tuổi ${save.stats.age}, tổng tài sản của bạn đã vượt 500.000.000đ. Bạn đã hoàn thành hành trình từ năm 17 tuổi với 500k trong túi!`,
          [{ label: 'Tiếp tục chơi tự do', style: 'safe', onClick: () => {} }]
        );
      } else {
        showToast(`Đạt cột mốc mới: ${newlyUnlocked.name}!`);
      }
    }
  }

  function getGoalText() {
    const rent = getCurrentRent();
    const maxDebtAbs = Math.abs(getDebtLimit());
    if (save.low_happy_months >= 1 && save.stats.happiness <= 15) {
      return 'Nguy hiểm: Tinh thần chạm 0 tháng trước! Hồi Tinh thần ngay kẻo kiệt sức thua game.';
    }
    if (save.is_sick) {
      return 'Cảnh báo: Bạn đang bị ốm (hồi ít thể lực). Ghé Phòng khám mua thuốc ngay.';
    }
    if (save.pawned.vehicle) {
      const m = save.pawned.vehicle.months;
      return `Nhắc nhở: Xe đang cầm đồ (Tháng ${m}/6) — ghé Tiệm cầm đồ chuộc sớm kẻo mất xe.`;
    }
    if (save.pawned.laptop) {
      const m = save.pawned.laptop.months;
      return `Nhắc nhở: Laptop đang cầm đồ (Tháng ${m}/6) — chuộc sớm kẻo quá hạn 6 tháng.`;
    }
    if (save.stats.money < 0) {
      return `Cảnh báo: Đang nợ ${Math.abs(save.stats.money).toLocaleString()}đ (nợ quá ${maxDebtAbs.toLocaleString()}đ bị đuổi trọ).`;
    }
    if (save.stats.happiness <= 15) {
      return 'Cảnh báo: Tinh thần rất thấp, gặp Minh, Linh, Quán Net hoặc Quán nước.';
    }
    if (save.stats.energy < 50) {
      return `Gợi ý: Hết thể lực làm/học, về Phòng trọ qua tháng (tiền nhà ${rent.toLocaleString()}đ).`;
    }
    if (save.life_path === 'STUDY' && !save.job_id) {
      const major = MAJORS.find(m => m.major_id === save.major_id);
      const fee = major ? major.tuition_fee.toLocaleString() : '12.000.000';
      return `Mục tiêu: Đạt 100 Học lực & giữ đủ ${fee}đ tiền mặt đóng học phí.`;
    }
    if (save.life_path === 'WORK') {
      if (save.stats.knowledge >= 50 && save.stats.month === 6) {
        return 'Tháng 6 rồi! Tới Trường ĐH để vào phòng thi Đại học ngay.';
      }
      if (save.stats.knowledge >= 50) {
        return 'Đã đủ 50 Học lực. Kỳ thi ĐH mở vào Tháng 6 (có thể ôn thêm lấy điểm cộng).';
      }
      return 'Gợi ý: Đi làm cày bậc lương, gặp Minh nhận kèo hoặc ghé Trường ĐH ôn thi.';
    }
    return `Tổng tài sản: ${getFullNetWorth().toLocaleString()}đ / 500.000.000đ (Mục tiêu tự do tài chính).`;
  }

  function updateHUD() {
    const maxE = getMaxEnergy();
    let roleName = '';
    if (save.job_id) {
      const job = getJobById(save.job_id);
      roleName = job ? job.name : '';
    } else if (save.major_id) {
      const major = MAJORS.find(m => m.major_id === save.major_id);
      roleName = major ? `SV ${major.name}` : '';
    }

    const sickTag = save.is_sick ? ' • 🤒 Đang ốm' : '';
    infoEl.textContent = `${user.username} • ${save.stats.age}t • T${save.stats.month}/12 • ${roleName}${sickTag}`;

    if (save.stats.money < 0) {
      moneyEl.style.color = '#f87171';
      moneyEl.textContent = `Nợ ${Math.abs(save.stats.money).toLocaleString()}đ`;
    } else {
      moneyEl.style.color = '#34d399';
      moneyEl.textContent = `${save.stats.money.toLocaleString()}đ`;
    }

    energyEl.textContent = `${save.stats.energy}/${maxE}`;
    happyEl.textContent = `${save.stats.happiness}/100`;
    knowEl.textContent = `${save.stats.knowledge}/100`;

    barEnergy.style.width = `${Math.min(100, (save.stats.energy / maxE) * 100)}%`;
    barHappy.style.width = `${Math.min(100, save.stats.happiness)}%`;
    barKnow.style.width = `${Math.min(100, save.stats.knowledge)}%`;

    goalEl.textContent = getGoalText();
  }

  function clampStats() {
    save.stats.energy = Math.max(0, Math.min(getMaxEnergy(), save.stats.energy));
    save.stats.happiness = Math.max(0, Math.min(100, save.stats.happiness));
    save.stats.knowledge = Math.max(0, Math.min(100, save.stats.knowledge));
    for (const key of ['ba', 'minh', 'linh']) {
      if (save.relations[key]) {
        save.relations[key].affection = Math.max(0, Math.min(100, save.relations[key].affection));
      }
    }
  }

  function commitAndRender() {
    clampStats();
    syncEngineState();
    checkMilestones();
    updateHUD();
    savePlayerProgress(user.user_id, save);
  }

  // ==================== BẢNG ĐẦU TƯ, KINH DOANH & CỘT MỐC ====================
  function formatTrend(curr, prev) {
    const diff = curr - prev;
    if (diff > 0) return `<span class="price-up">▲ +${diff.toLocaleString()}đ</span>`;
    if (diff < 0) return `<span class="price-down">▼ ${diff.toLocaleString()}đ</span>`;
    return `<span class="price-flat">— Giữ giá</span>`;
  }

  function renderFinanceModal() {
    const f = save.finance;
    const netWorth = getFullNetWorth();
    financeContent.innerHTML = '';

    const banner = document.createElement('div');
    banner.className = 'networth-banner';
    banner.innerHTML = `<span>Tổng tài sản ròng</span><strong>${netWorth.toLocaleString()}đ</strong>`;
    financeContent.appendChild(banner);

    const bizWrap = document.createElement('div');
    const passive = getMonthlyBusinessProfit(save.businesses);
    bizWrap.innerHTML = `<div class="shop-section-title">Tự kinh doanh (Lãi TB: ~${passive.toLocaleString()}đ/tháng)</div>`;
    BUSINESSES.forEach(b => {
      const owned = save.businesses.includes(b.id);
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `<div class="shop-item-info"><strong>${b.name}</strong><small>${b.desc}</small></div>`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = owned ? 'btn-buy owned' : 'btn-buy';
      btn.textContent = owned ? 'Đang chạy' : `${(b.cost / 1000000).toFixed(0)}tr`;
      btn.disabled = owned;
      btn.onclick = () => {
        if (save.stats.money < b.cost) return showToast(`Cần ${b.cost.toLocaleString()}đ vốn để mở ${b.name}.`);
        sound.playSuccess();
        save.stats.money -= b.cost;
        save.businesses.push(b.id);
        engine.spawnFloatingText(`Mở ${b.name}!`, '#34d399');
        showToast(`Đã mở ${b.name}! Mỗi tháng tự động có lãi về ví.`);
        commitAndRender();
        renderFinanceModal();
      };
      row.appendChild(btn);
      bizWrap.appendChild(row);
    });
    financeContent.appendChild(bizWrap);

    const bankCard = document.createElement('div');
    bankCard.className = 'rel-card';
    bankCard.innerHTML = `
      <div class="rel-head"><strong>Tiết kiệm ngân hàng</strong><span>Lãi 0.6%/tháng</span></div>
      <small style="color:#cbd5e1;font-size:12px;">Đang gửi: <b>${f.savings.toLocaleString()}đ</b></small>
    `;
    const bankBtns = document.createElement('div');
    bankBtns.className = 'rel-btns';

    const btnDep = document.createElement('button');
    btnDep.className = 'btn-rel-act';
    btnDep.textContent = 'Gửi +1.000.000đ';
    btnDep.onclick = () => {
      if (save.stats.money < 1000000) return showToast('Cần ít nhất 1.000.000đ tiền mặt để gửi.');
      sound.playCoin();
      save.stats.money -= 1000000;
      f.savings += 1000000;
      commitAndRender();
      renderFinanceModal();
    };

    const btnWith = document.createElement('button');
    btnWith.className = 'btn-rel-act';
    btnWith.textContent = 'Rút hết';
    btnWith.disabled = f.savings <= 0;
    btnWith.onclick = () => {
      sound.playCoin();
      save.stats.money += f.savings;
      f.savings = 0;
      showToast('Đã rút toàn bộ tiền tiết kiệm về ví.');
      commitAndRender();
      renderFinanceModal();
    };
    bankBtns.append(btnDep, btnWith);
    bankCard.appendChild(bankBtns);
    financeContent.appendChild(bankCard);

    const goldCard = document.createElement('div');
    goldCard.className = 'rel-card';
    goldCard.innerHTML = `
      <div class="rel-head"><strong>Vàng 9999 (1 chỉ)</strong><span>${formatTrend(f.goldPrice, f.goldPrev)}</span></div>
      <small style="color:#cbd5e1;font-size:12px;">Giá: <b>${f.goldPrice.toLocaleString()}đ</b> • Đang giữ: <b>${f.goldQty} chỉ</b></small>
    `;
    const goldBtns = document.createElement('div');
    goldBtns.className = 'rel-btns';

    const btnBuyGold = document.createElement('button');
    btnBuyGold.className = 'btn-rel-act';
    btnBuyGold.textContent = 'Mua 1 chỉ';
    btnBuyGold.onclick = () => {
      if (save.stats.money < f.goldPrice) return showToast('Không đủ tiền mặt mua 1 chỉ vàng.');
      sound.playCoin();
      save.stats.money -= f.goldPrice;
      f.goldQty += 1;
      commitAndRender();
      renderFinanceModal();
    };

    const btnSellGold = document.createElement('button');
    btnSellGold.className = 'btn-rel-act';
    btnSellGold.textContent = 'Bán 1 chỉ';
    btnSellGold.disabled = f.goldQty <= 0;
    btnSellGold.onclick = () => {
      sound.playCoin();
      f.goldQty -= 1;
      save.stats.money += f.goldPrice;
      commitAndRender();
      renderFinanceModal();
    };
    goldBtns.append(btnBuyGold, btnSellGold);
    goldCard.appendChild(goldBtns);
    financeContent.appendChild(goldCard);

    const stockCard = document.createElement('div');
    stockCard.className = 'rel-card';
    stockCard.innerHTML = `
      <div class="rel-head"><strong>Cổ phiếu công nghệ</strong><span>${formatTrend(f.stockPrice, f.stockPrev)}</span></div>
      <small style="color:#cbd5e1;font-size:12px;">Giá: <b>${f.stockPrice.toLocaleString()}đ</b> • Đang giữ: <b>${f.stockQty} cp</b></small>
    `;
    const stockBtns = document.createElement('div');
    stockBtns.className = 'rel-btns';

    const btnBuyStock = document.createElement('button');
    btnBuyStock.className = 'btn-rel-act';
    btnBuyStock.textContent = 'Mua 1 cp';
    btnBuyStock.onclick = () => {
      if (save.stats.money < f.stockPrice) return showToast('Không đủ tiền mặt mua cổ phiếu.');
      sound.playCoin();
      save.stats.money -= f.stockPrice;
      f.stockQty += 1;
      commitAndRender();
      renderFinanceModal();
    };

    const btnSellStock = document.createElement('button');
    btnSellStock.className = 'btn-rel-act';
    btnSellStock.textContent = 'Bán hết';
    btnSellStock.disabled = f.stockQty <= 0;
    btnSellStock.onclick = () => {
      sound.playCoin();
      save.stats.money += f.stockQty * f.stockPrice;
      f.stockQty = 0;
      commitAndRender();
      renderFinanceModal();
    };
    stockBtns.append(btnBuyStock, btnSellStock);
    stockCard.appendChild(stockBtns);
    financeContent.appendChild(stockCard);

    const msWrap = document.createElement('div');
    msWrap.innerHTML = `<div class="shop-section-title">Cột mốc cuộc đời (${save.milestones.length}/${MILESTONES.length})</div>`;
    MILESTONES.forEach(m => {
      const done = save.milestones.includes(m.id);
      const row = document.createElement('div');
      row.className = done ? 'milestone-row done' : 'milestone-row';
      row.innerHTML = `<div><strong>${m.name}</strong><small>${m.desc}</small></div><span class="milestone-tag">${done ? 'Đã đạt' : 'Chưa đạt'}</span>`;
      msWrap.appendChild(row);
    });
    financeContent.appendChild(msWrap);
  }

  if (btnCloseFinance && financeModal) {
    btnCloseFinance.onclick = () => {
      sound.playClick();
      financeModal.classList.add('hidden');
    };
  }

  // ==================== BẢNG MỐI QUAN HỆ ====================
  function renderRelModal() {
    relContent.innerHTML = '';

    const ba = save.relations.ba;
    const baCard = document.createElement('div');
    baCard.className = 'rel-card';
    baCard.innerHTML = `
      <div class="rel-head"><strong>${ba.name} (${ba.role})</strong><span>Thân thiết: ${ba.affection}/100</span></div>
      <div class="stat-track"><div class="stat-fill fill-rel" style="width:${ba.affection}%"></div></div>
    `;
    const baBtns = document.createElement('div');
    baBtns.className = 'rel-btns';

    const btnCallBa = document.createElement('button');
    btnCallBa.className = 'btn-rel-act';
    btnCallBa.textContent = save.monthly_flags.rel_ba_call ? 'Gọi hỏi thăm (Đã dùng)' : 'Gọi hỏi thăm (+10 Tinh thần)';
    btnCallBa.disabled = !!save.monthly_flags.rel_ba_call;
    btnCallBa.onclick = () => {
      sound.playClick();
      save.monthly_flags.rel_ba_call = true;
      ba.affection += 6;
      save.stats.happiness += 10;
      engine.spawnFloatingText('+10 Tinh thần', '#34d399');
      showToast('Gọi điện nói chuyện với ba một lúc, thấy nhẹ lòng hẳn (+10 Tinh thần).');
      commitAndRender();
      renderRelModal();
    };

    const btnSendBa = document.createElement('button');
    btnSendBa.className = 'btn-rel-act';
    btnSendBa.textContent = save.monthly_flags.rel_ba_send ? 'Gửi biếu ba (Đã dùng)' : 'Gửi biếu ba 500k';
    btnSendBa.disabled = !!save.monthly_flags.rel_ba_send;
    btnSendBa.onclick = () => {
      if (save.stats.money < 500000) return showToast('Không đủ 500.000đ để gửi về cho ba.');
      sound.playCoin();
      save.monthly_flags.rel_ba_send = true;
      save.stats.money -= 500000;
      ba.affection += 15;
      save.stats.happiness += 12;
      engine.spawnFloatingText('-500k', '#f87171');
      showToast('Gửi 500.000đ về phụ ba, ba dặn nhớ giữ sức khỏe (+15 Thân thiết).');
      commitAndRender();
      renderRelModal();
    };

    const btnAskBa = document.createElement('button');
    btnAskBa.className = 'btn-rel-act';
    btnAskBa.textContent = save.monthly_flags.rel_ba_ask ? 'Nhờ ba hỗ trợ (Đã dùng)' : (ba.affection < 50 ? 'Nhờ ba (Cần 50 Thân)' : 'Nhờ ba hỗ trợ 1tr');
    btnAskBa.disabled = !!save.monthly_flags.rel_ba_ask || ba.affection < 50;
    btnAskBa.onclick = () => {
      sound.playCoin();
      save.monthly_flags.rel_ba_ask = true;
      save.stats.money += 1000000;
      ba.affection -= 10;
      engine.spawnFloatingText('+1.000.000đ', '#34d399');
      showToast('Ba chuyển nóng cho 1.000.000đ xoay xở (-10 Thân thiết).');
      commitAndRender();
      renderRelModal();
    };

    baBtns.append(btnCallBa, btnSendBa, btnAskBa);
    baCard.appendChild(baBtns);
    relContent.appendChild(baCard);

    const minh = save.relations.minh;
    const minhCard = document.createElement('div');
    minhCard.className = 'rel-card';
    minhCard.innerHTML = `
      <div class="rel-head"><strong>${minh.name} (${minh.role})</strong><span>Thân thiết: ${minh.affection}/100</span></div>
      <div class="stat-track"><div class="stat-fill fill-rel" style="width:${minh.affection}%"></div></div>
    `;
    const minhBtns = document.createElement('div');
    minhBtns.className = 'rel-btns';

    const btnHangMinh = document.createElement('button');
    btnHangMinh.className = 'btn-rel-act';
    btnHangMinh.textContent = save.monthly_flags.rel_minh_hang ? 'Đi cafe (Đã dùng)' : 'Đi cafe (50k | +15 Tinh thần)';
    btnHangMinh.disabled = !!save.monthly_flags.rel_minh_hang;
    btnHangMinh.onclick = () => {
      if (save.stats.money < 50000) return showToast('Cần 50.000đ đi cafe với Minh.');
      sound.playClick();
      save.monthly_flags.rel_minh_hang = true;
      save.stats.money -= 50000;
      save.stats.happiness += 15;
      minh.affection += 10;
      engine.spawnFloatingText('+15 Tinh thần', '#34d399');
      showToast('Ngồi chém gió với Minh xả stress (+15 Tinh thần, +10 Thân thiết).');
      commitAndRender();
      renderRelModal();
    };

    const btnGigMinh = document.createElement('button');
    btnGigMinh.className = 'btn-rel-act';
    btnGigMinh.textContent = save.monthly_flags.rel_minh_gig
      ? 'Nhận kèo chung (Đã dùng)'
      : (minh.affection >= 50 ? 'Nhận kèo chung (+800k | -30 Thể lực)' : 'Nhận kèo chung (Cần 50 Thân thiết)');
    btnGigMinh.disabled = !!save.monthly_flags.rel_minh_gig || minh.affection < 50;
    btnGigMinh.onclick = () => {
      if (save.stats.energy < 30) return showToast('Cần 30 Thể lực để chạy kèo cùng Minh.');
      sound.playCoin();
      save.monthly_flags.rel_minh_gig = true;
      save.stats.energy -= 30;
      save.stats.money += 800000;
      minh.affection += 5;
      engine.spawnFloatingText('+800.000đ', '#34d399');
      showToast('Chạy kèo làm thêm cùng Minh chia đôi được 800.000đ!');
      commitAndRender();
      renderRelModal();
    };

    minhBtns.append(btnHangMinh, btnGigMinh);
    minhCard.appendChild(minhBtns);
    relContent.appendChild(minhCard);

    const linh = save.relations.linh;
    const linhCard = document.createElement('div');
    linhCard.className = 'rel-card';
    if (!linh.unlocked) {
      linhCard.innerHTML = `
        <div class="rel-head"><strong>Chưa có người yêu</strong><span>Độc thân</span></div>
        <small style="color:#94a3b8;font-size:12px;">Ghé Quán nước chọn "Bắt chuyện làm quen" để tìm cơ hội.</small>
      `;
    } else {
      const warnHtml = linh.ignoredMonths >= 1
        ? `<small style="color:#fbbf24;font-size:12px;display:block;margin-top:4px;">⚠️ Tháng trước chưa quan tâm, Linh đang hơi dỗi — nhớ nhắn tin hoặc hẹn hò tháng này!</small>`
        : '';
      linhCard.innerHTML = `
        <div class="rel-head"><strong>${linh.name} (${linh.role})</strong><span>Tình cảm: ${linh.affection}/100</span></div>
        <div class="stat-track"><div class="stat-fill fill-rel" style="width:${linh.affection}%"></div></div>
        ${warnHtml}
      `;
      const linhBtns = document.createElement('div');
      linhBtns.className = 'rel-btns';

      const btnDateLinh = document.createElement('button');
      btnDateLinh.className = 'btn-rel-act';
      btnDateLinh.textContent = save.monthly_flags.rel_linh_date ? 'Đi hẹn hò (Đã dùng)' : 'Đi hẹn hò (200k | +25 Tinh thần)';
      btnDateLinh.disabled = !!save.monthly_flags.rel_linh_date;
      btnDateLinh.onclick = () => {
        if (save.stats.money < 200000) return showToast('Cần 200.000đ đi ăn uống xem phim với Linh.');
        sound.playSuccess();
        save.monthly_flags.rel_linh_date = true;
        save.stats.money -= 200000;
        save.stats.happiness += 25;
        linh.affection += 12;
        linh.ignoredMonths = 0;
        engine.spawnFloatingText('+25 Tinh thần', '#f472b6');
        showToast('Đi hẹn hò với Linh rất vui (+25 Tinh thần, +12 Tình cảm).');
        commitAndRender();
        renderRelModal();
      };

      const btnTextLinh = document.createElement('button');
      btnTextLinh.className = 'btn-rel-act';
      btnTextLinh.textContent = save.monthly_flags.rel_linh_text ? 'Nhắn tin (Đã dùng)' : 'Nhắn tin quan tâm (+8 Tinh thần)';
      btnTextLinh.disabled = !!save.monthly_flags.rel_linh_text;
      btnTextLinh.onclick = () => {
        sound.playClick();
        save.monthly_flags.rel_linh_text = true;
        save.stats.happiness += 8;
        linh.affection += 5;
        linh.ignoredMonths = 0;
        engine.spawnFloatingText('+8 Tinh thần', '#f472b6');
        showToast('Nhắn tin hỏi thăm, Linh nhắc bạn nhớ đi ngủ sớm (+8 Tinh thần).');
        commitAndRender();
        renderRelModal();
      };

      linhBtns.append(btnDateLinh, btnTextLinh);
      linhCard.appendChild(linhBtns);
    }
    relContent.appendChild(linhCard);
  }

  if (btnCloseRel && relModal) {
    btnCloseRel.onclick = () => {
      sound.playClick();
      relModal.classList.add('hidden');
    };
  }

  // ==================== BẢNG TÀI SẢN ĐANG SỞ HỮU (CHỈ XEM) ====================
  function renderShopModal() {
    shopContent.innerHTML = '';

    const roomSec = document.createElement('div');
    roomSec.innerHTML = '<div class="shop-section-title">Chỗ ở hiện tại</div>';
    const room = getRoom(save.assets.room);
    const roomRow = document.createElement('div');
    roomRow.className = 'shop-item';
    roomRow.innerHTML = `
      <div class="shop-item-info">
        <strong>${room.name} (${room.rent.toLocaleString()}đ/tháng)</strong>
        <small>${room.desc} • Muốn đổi/nâng cấp phòng hãy gặp Chủ trọ.</small>
      </div>
      <span class="milestone-tag">Đang thuê</span>
    `;
    roomSec.appendChild(roomRow);
    shopContent.appendChild(roomSec);

    const vehSec = document.createElement('div');
    vehSec.innerHTML = '<div class="shop-section-title">Phương tiện đang sở hữu</div>';
    const vehObj = getVehicle(save.assets.vehicle);
    const vehRow = document.createElement('div');
    vehRow.className = 'shop-item';
    if (save.pawned.vehicle) {
      const redeemCost = getPawnRedeemCost(save.pawned.vehicle);
      vehRow.innerHTML = `<div class="shop-item-info"><strong>${vehObj.name} (Đang cầm đồ)</strong><small>Tháng ${save.pawned.vehicle.months}/6 • Chuộc ${redeemCost.toLocaleString()}đ tại Tiệm cầm đồ</small></div>`;
    } else if (save.assets.vehicle === 'walk') {
      vehRow.innerHTML = `<div class="shop-item-info"><strong>Đi bộ</strong><small>Chưa mua xe riêng — ghé Shop trên bản đồ (màu vàng trên minimap) để mua</small></div>`;
    } else {
      vehRow.innerHTML = `<div class="shop-item-info"><strong>${vehObj.name}</strong><small>${vehObj.desc}</small></div><span class="milestone-tag">Đang dùng</span>`;
    }
    vehSec.appendChild(vehRow);
    shopContent.appendChild(vehSec);

    const gearSec = document.createElement('div');
    gearSec.innerHTML = '<div class="shop-section-title">Đồ dùng & trang bị đang có</div>';
    const allCatalog = [...GEARS, ...EXTRA_SHOP_ITEMS];
    const ownedCatalog = allCatalog.filter(item => hasItem(item.id));
    if (ownedCatalog.length === 0) {
      const emptyRow = document.createElement('div');
      emptyRow.className = 'shop-item';
      emptyRow.innerHTML = `<div class="shop-item-info"><strong>Chưa có món đồ nào</strong><small>Di chuyển tới Shop phía dưới Tiệm Cầm Đồ trên bản đồ để mua sắm</small></div>`;
      gearSec.appendChild(emptyRow);
    } else {
      ownedCatalog.forEach(item => {
        const row = document.createElement('div');
        row.className = 'shop-item';
        const isPawnedLaptop = item.id === 'laptop' && !!save.pawned.laptop;
        const badge = isPawnedLaptop ? `Đang cầm (T${save.pawned.laptop.months}/6)` : 'Đang có';
        row.innerHTML = `<div class="shop-item-info"><strong>${item.name}</strong><small>${item.desc}</small></div><span class="milestone-tag">${badge}</span>`;
        gearSec.appendChild(row);
      });
    }
    shopContent.appendChild(gearSec);
  }

  // ==================== SHOP MUA SẮM TẠI BẢN ĐỒ ====================
  function openItemShopMenu() {
    if (shopModal) shopModal.classList.add('hidden');
    const items = [];

    VEHICLES.filter(v => v.price > 0).forEach(v => {
      const owned = save.assets.vehicle === v.id || (v.id === 'bike' && save.assets.vehicle === 'motorbike');
      items.push({
        label: `[Xe] ${v.name}`,
        sub: `${v.price.toLocaleString()}đ • ${v.desc}`,
        btnText: owned ? 'Đã có' : `${(v.price / 1000000).toFixed(1)}tr`,
        disabled: owned,
        keepOpen: true,
        onClick: () => {
          if (save.stats.money < v.price) return showToast(`Cần ${v.price.toLocaleString()}đ để mua ${v.name}.`);
          sound.playSuccess();
          save.stats.money -= v.price;
          save.assets.vehicle = v.id;
          delete save.pawned.vehicle;
          showToast(`Đã mua ${v.name}! Di chuyển nhanh hơn rõ rệt.`);
          commitAndRender();
          openItemShopMenu();
        }
      });
    });

    [...GEARS, ...EXTRA_SHOP_ITEMS].forEach(g => {
      const owned = hasItem(g.id);
      const priceLabel = g.price >= 1000000
        ? `${(g.price / 1000000).toFixed(1)}tr`
        : `${Math.round(g.price / 1000)}k`;
      items.push({
        label: g.name,
        sub: `${g.price.toLocaleString()}đ • ${g.desc}`,
        btnText: owned ? 'Đã có' : priceLabel,
        disabled: owned,
        keepOpen: true,
        onClick: () => {
          if (save.stats.money < g.price) return showToast(`Cần ${g.price.toLocaleString()}đ để mua ${g.name}.`);
          sound.playSuccess();
          save.stats.money -= g.price;
          save.assets.gears.push(g.id);
          showToast(`Đã mua ${g.name}!`);
          commitAndRender();
          openItemShopMenu();
        }
      });
    });

    openActionMenu('Shop đồ dùng & xe', `Tiền mặt hiện có: ${save.stats.money.toLocaleString()}đ`, items);
  }

  if (btnCloseShop && shopModal) {
    btnCloseShop.onclick = () => {
      sound.playClick();
      shopModal.classList.add('hidden');
    };
  }

  if (btnCloseAction && actionModal) {
    btnCloseAction.onclick = () => {
      sound.playClick();
      actionModal.classList.add('hidden');
    };
  }

  // ==================== MENU NHANH ====================
  if (btnOpenMenu && menuModal) {
    btnOpenMenu.onclick = () => {
      sound.playClick();
      closeAllSubModals();
      menuModal.classList.remove('hidden');
    };
  }

  if (btnCloseMenu && menuModal) {
    btnCloseMenu.onclick = () => {
      sound.playClick();
      menuModal.classList.add('hidden');
    };
  }

  const menuRoutes = [
    { id: 'menu-go-profile', modal: profileModal, render: renderProfileModal },
    { id: 'menu-go-finance', modal: financeModal, render: renderFinanceModal },
    { id: 'menu-go-rel', modal: relModal, render: renderRelModal },
    { id: 'menu-go-shop', modal: shopModal, render: renderShopModal }
  ];

  menuRoutes.forEach(({ id, modal, render }) => {
    const btn = document.getElementById(id);
    if (btn && modal && menuModal) {
      btn.onclick = () => {
        sound.playClick();
        menuModal.classList.add('hidden');
        if (typeof render === 'function') render();
        modal.classList.remove('hidden');
      };
    }
  });

  // ==================== TÌNH HUỐNG CÓ LỰA CHỌN THEO NGỮ CẢNH ====================
  function triggerContextualSituation() {
    if (save.stats.money < 0) {
      showEventModal(
        'Áp lực trả nợ đầu tháng',
        `Ví đang âm ${Math.abs(save.stats.money).toLocaleString()}đ. Bạn chọn cách xoay xở nào?`,
        [
          {
            label: 'Nhận kèo giao vặt gấp (+350k | -20 Thể lực)',
            style: 'safe',
            onClick: () => {
              if (save.stats.energy < 20) {
                save.stats.happiness -= 8;
                showToast('Thiếu sức nhận kèo gấp nên hơi chán (-8 Tinh thần).');
              } else {
                sound.playCoin();
                save.stats.energy -= 20;
                save.stats.money += 350000;
                engine.spawnFloatingText('+350.000đ', '#34d399');
                showToast('Chạy nhanh kèo giao vặt bù bớt tiền nợ (+350.000đ).');
              }
              commitAndRender();
            }
          },
          {
            label: 'Giữ sức bình tĩnh (+8 Tinh thần)',
            style: 'risk',
            onClick: () => {
              save.stats.happiness += 8;
              engine.spawnFloatingText('+8 Tinh thần', '#34d399');
              showToast('Hít thở sâu, sắp xếp lại kế hoạch chứ không cuống (+8 Tinh thần).');
              commitAndRender();
            }
          }
        ]
      );
      return;
    }

    if (save.life_path === 'WORK' && save.stats.month === 5 && save.stats.knowledge >= 35) {
      showEventModal(
        'Sát kỳ thi Đại học Tháng 6',
        `Học lực đang là ${save.stats.knowledge}/100. Bạn dồn lực chuẩn bị cho tháng sau hay giữ nhịp làm việc?`,
        [
          {
            label: 'Dồn sức ôn tập (+6 Học lực | -15 Thể lực)',
            style: 'safe',
            onClick: () => {
              if (save.stats.energy >= 15) {
                save.stats.energy -= 15;
                save.stats.knowledge += 6;
                engine.spawnFloatingText('+6 Học lực', '#38bdf8');
                showToast('Tranh thủ rà lại kiến thức trước kỳ thi (+6 Học lực).');
              } else {
                showToast('Thể lực hơi thấp nên chỉ đọc lướt qua.');
              }
              commitAndRender();
            }
          },
          {
            label: 'Giữ nhịp thoải mái (+10 Tinh thần)',
            style: 'risk',
            onClick: () => {
              save.stats.happiness += 10;
              engine.spawnFloatingText('+10 Tinh thần', '#34d399');
              showToast('Giữ đầu óc thư thả để không bị ngợp (+10 Tinh thần).');
              commitAndRender();
            }
          }
        ]
      );
      return;
    }

    const ev = pickRandomMonthlyEvent();
    showEventModal(
      ev.title,
      ev.desc,
      ev.choices.map(c => ({
        label: c.label,
        style: c.style,
        onClick: () => {
          const res = c.apply(save);
          if (res.floatText) engine.spawnFloatingText(res.floatText, res.floatColor);
          showToast(res.msg);
          commitAndRender();
        }
      }))
    );
  }

  // ==================== MENU HOẠT ĐỘNG TẠI TỪNG ĐỊA ĐIỂM & NPC ====================
  function openActionMenu(title, desc, actions) {
    actionTitle.textContent = title;
    actionDesc.textContent = desc;
    actionList.innerHTML = '';

    actions.forEach(act => {
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `<div class="shop-item-info"><strong>${act.label}</strong><small>${act.sub}</small></div>`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = act.disabled ? 'btn-buy owned' : 'btn-buy';
      btn.textContent = act.btnText || (act.disabled ? 'Đã dùng' : 'Chọn');
      btn.disabled = !!act.disabled;
      btn.onclick = () => {
        sound.playClick();
        if (!act.keepOpen) actionModal.classList.add('hidden');
        act.onClick();
      };
      row.appendChild(btn);
      actionList.appendChild(row);
    });

    actionModal.classList.remove('hidden');
  }

  function openNpcMenu(npc) {
    if (npc.id === 'landlord') {
      const currentRoom = getRoom(save.assets.room);
      const maxDebtAbs = Math.abs(getDebtLimit());
      const canExtend = save.extra_debt_buffer < MAX_EXTRA_DEBT_BUFFER;
      const debtText = save.stats.money < 0
        ? `Phòng: ${currentRoom.name} (${currentRoom.rent.toLocaleString()}đ/th) • Nợ ${Math.abs(save.stats.money).toLocaleString()}đ/${maxDebtAbs.toLocaleString()}đ.`
        : `Phòng: ${currentRoom.name} (${currentRoom.rent.toLocaleString()}đ/th) • Hạn mức nợ: ${maxDebtAbs.toLocaleString()}đ.`;

      const landlordActions = [
        {
          label: 'Chọn / đổi phòng trọ với Chủ trọ',
          sub: 'Xem các loại phòng đang cho thuê và đổi ngay',
          btnText: 'Đổi phòng',
          onClick: () => {
            openActionMenu(
              'Thuê & nâng cấp phòng trọ',
              `Phòng hiện tại: ${currentRoom.name} (${currentRoom.rent.toLocaleString()}đ/tháng).`,
              ROOMS.map(r => {
                const isCurrent = save.assets.room === r.id;
                return {
                  label: r.name,
                  sub: `${r.rent.toLocaleString()}đ/tháng • ${r.desc}`,
                  btnText: isCurrent ? 'Đang ở' : 'Thuê phòng',
                  disabled: isCurrent,
                  onClick: () => {
                    save.assets.room = r.id;
                    showToast(`Đã chuyển sang thuê ${r.name} (${r.rent.toLocaleString()}đ/tháng).`);
                    commitAndRender();
                  }
                };
              })
            );
          }
        },
        {
          label: 'Hỏi thăm & xin khất nhẹ tiền nhà',
          sub: 'Bớt áp lực trọ • +6 Tinh thần (1 lần/tháng)',
          disabled: !!save.monthly_flags.npc_landlord_talk,
          onClick: () => {
            save.monthly_flags.npc_landlord_talk = true;
            save.stats.happiness += 6;
            engine.spawnFloatingText('+6 Tinh thần', '#34d399');
            showToast('Chủ trọ gật đầu bảo cứ làm ăn đàng hoàng rồi trả dần (+6 Tinh thần).');
            commitAndRender();
          }
        },
        {
          label: canExtend ? 'Xin gia hạn hạn mức nợ thêm 1.000.000đ (150k)' : 'Đã đạt mức gia hạn tối đa (+2tr)',
          sub: canExtend ? 'Trả 150.000đ phí gia hạn (tối đa cộng thêm 2.000.000đ)' : 'Chủ trọ không thể nới thêm nữa',
          btnText: !canExtend ? 'Tối đa' : (save.monthly_flags.npc_landlord_extend ? 'Đã dùng' : 'Chọn'),
          disabled: !!save.monthly_flags.npc_landlord_extend || !canExtend,
          onClick: () => {
            if (save.stats.money < 150000) return showToast('Cần 150.000đ đưa chủ trọ làm tin.');
            save.stats.money -= 150000;
            save.monthly_flags.npc_landlord_extend = true;
            save.extra_debt_buffer = Math.min(MAX_EXTRA_DEBT_BUFFER, save.extra_debt_buffer + 1000000);
            engine.spawnFloatingText('Nới trần nợ +1tr', '#fbbf24');
            showToast(`Đã gia hạn trần nợ lên ${Math.abs(getDebtLimit()).toLocaleString()}đ với chủ trọ.`);
            commitAndRender();
          }
        }
      ];

      openActionMenu('Chủ trọ', debtText, landlordActions);
      return;
    }

    if (npc.id === 'minh') {
      const minh = save.relations.minh;
      openActionMenu(`Minh (Thân thiết: ${minh.affection}/100)`, 'Đứng chờ gần Quán Net rủ đi cafe hoặc chạy kèo.', [
        {
          label: 'Đi cafe tán gẫu (50k)',
          sub: '50.000đ • +15 Tinh thần, +10 Thân thiết (1 lần/tháng)',
          disabled: !!save.monthly_flags.rel_minh_hang,
          onClick: () => {
            if (save.stats.money < 50000) return showToast('Cần 50.000đ đi cafe với Minh.');
            save.monthly_flags.rel_minh_hang = true;
            save.stats.money -= 50000;
            save.stats.happiness += 15;
            minh.affection += 10;
            engine.spawnFloatingText('+15 Tinh thần', '#34d399');
            showToast('Ngồi chém gió với Minh xả stress (+15 Tinh thần, +10 Thân thiết).');
            commitAndRender();
          }
        },
        {
          label: 'Chạy kèo làm thêm chung (+800k)',
          sub: minh.affection >= 50 ? '-30 Thể lực, +800.000đ (1 lần/tháng)' : 'Cần đạt 50 Thân thiết với Minh',
          btnText: save.monthly_flags.rel_minh_gig ? 'Đã dùng' : (minh.affection < 50 ? 'Thiếu điểm' : 'Chọn'),
          disabled: !!save.monthly_flags.rel_minh_gig || minh.affection < 50,
          onClick: () => {
            if (save.stats.energy < 30) return showToast('Cần 30 Thể lực để chạy kèo.');
            sound.playCoin();
            save.monthly_flags.rel_minh_gig = true;
            save.stats.energy -= 30;
            save.stats.money += 800000;
            minh.affection += 5;
            engine.spawnFloatingText('+800.000đ', '#34d399');
            showToast('Chạy kèo phụ việc cùng Minh chia đôi được 800.000đ!');
            commitAndRender();
          }
        }
      ]);
      return;
    }

    if (npc.id === 'linh') {
      const linh = save.relations.linh;
      const linhDesc = linh.ignoredMonths >= 1
        ? 'Linh đang hơi dỗi vì tháng trước bạn chưa hỏi thăm.'
        : 'Đang đợi gần Quán nước.';
      openActionMenu(`Linh (Tình cảm: ${linh.affection}/100)`, linhDesc, [
        {
          label: 'Đi hẹn hò ăn uống (200k)',
          sub: '200.000đ • +25 Tinh thần, +12 Tình cảm (1 lần/tháng)',
          disabled: !!save.monthly_flags.rel_linh_date,
          onClick: () => {
            if (save.stats.money < 200000) return showToast('Cần 200.000đ đi hẹn hò.');
            sound.playSuccess();
            save.monthly_flags.rel_linh_date = true;
            save.stats.money -= 200000;
            save.stats.happiness += 25;
            linh.affection += 12;
            linh.ignoredMonths = 0;
            engine.spawnFloatingText('+25 Tinh thần', '#f472b6');
            showToast('Đi hẹn hò với Linh rất vui (+25 Tinh thần, +12 Tình cảm).');
            commitAndRender();
          }
        },
        {
          label: 'Trò chuyện & quan tâm',
          sub: 'Miễn phí • +8 Tinh thần, +5 Tình cảm (1 lần/tháng)',
          disabled: !!save.monthly_flags.rel_linh_text,
          onClick: () => {
            save.monthly_flags.rel_linh_text = true;
            save.stats.happiness += 8;
            linh.affection += 5;
            linh.ignoredMonths = 0;
            engine.spawnFloatingText('+8 Tinh thần', '#f472b6');
            showToast('Nói chuyện với Linh thấy thoải mái hơn (+8 Tinh thần).');
            commitAndRender();
          }
        }
      ]);
    }
  }

  function advanceMonth() {
    const maxE = getMaxEnergy();
    if (save.stats.energy > maxE - 30) {
      sound.playAlert();
      showToast('Thể lực còn gần đầy, hãy đi học hoặc đi làm trước khi qua tháng mới.');
      return;
    }

    if (save.stats.happiness <= 0) save.low_happy_months += 1;
    else save.low_happy_months = 0;

    const notes = [];

    if (save.pawned.vehicle) {
      save.pawned.vehicle.months += 1;
      if (save.pawned.vehicle.months > 6) {
        save.assets.vehicle = 'walk';
        delete save.pawned.vehicle;
        notes.push('Quá hạn 6 tháng, tiệm thanh lý xe');
      }
    }
    if (save.pawned.laptop) {
      save.pawned.laptop.months += 1;
      if (save.pawned.laptop.months > 6) {
        save.assets.gears = save.assets.gears.filter(g => g !== 'laptop');
        delete save.pawned.laptop;
        notes.push('Quá hạn 6 tháng, tiệm thanh lý Laptop');
      }
    }

    const linh = save.relations.linh;
    if (linh && linh.unlocked) {
      if (!save.monthly_flags.rel_linh_date && !save.monthly_flags.rel_linh_text) {
        linh.ignoredMonths = (linh.ignoredMonths || 0) + 1;
        linh.affection -= 15;
        if (linh.ignoredMonths >= 2 || linh.affection <= 0) {
          linh.unlocked = false;
          linh.affection = 0;
          save.stats.happiness -= 20;
          notes.push('Chia tay Linh (-20 Tinh thần)');
        } else {
          notes.push('Linh dỗi vì ít quan tâm (-15 Tình cảm)');
        }
      } else if (linh.affection >= 60) {
        save.stats.happiness += 5;
        notes.push('Linh động viên (+5 Tinh thần)');
      }
    }

    const { interest } = updateMarketMonthly(save.finance);
    if (interest > 0) notes.push(`Lãi tiết kiệm +${interest.toLocaleString()}đ`);

    const { profit: bizProfit, label: bizLabel } = rollMonthlyBusinessProfit(save.businesses);
    if (bizProfit > 0) {
      save.stats.money += bizProfit;
      notes.push(`${bizLabel} +${bizProfit.toLocaleString()}đ`);
    }

    save.stats.month += 1;
    if (save.stats.month > 12) {
      save.stats.month = 1;
      save.stats.age += 1;
      notes.push(`Sang tuổi ${save.stats.age}`);
    }

    const isRainy = [9, 10, 11].includes(save.stats.month) || Math.random() < 0.2;
    engine.setWeather(isRainy ? 'rain' : 'clear');

    const sickChance = hasItem('raincoat_pro') ? 0.07 : 0.18;
    if (isRainy && !save.is_sick && Math.random() < sickChance) {
      save.is_sick = true;
      notes.push('Trở trời bị ốm');
    }

    if (hasItem('mini_coffee')) {
      save.stats.happiness += 4;
      notes.push('Cafe phòng +4 Tinh thần');
    }

    save.monthly_flags = {};

    if (save.life_path === 'STUDY' && !save.job_id) {
      save.stats.money += STUDENT_ALLOWANCE;
      notes.push('Trợ cấp +1.000.000đ');
    }

    const room = getRoom(save.assets.room);
    save.stats.money -= room.rent;

    const sickPenalty = save.is_sick ? 25 : 0;
    const summaryPrefix = notes.length ? ` • ${notes.join(' • ')}` : '';

    if (save.stats.money < 0) {
      sound.playAlert();
      save.stats.energy = Math.max(40, Math.min(maxE, 70) - sickPenalty);
      save.stats.happiness -= 15;
      engine.spawnFloatingText(`Nợ ${Math.abs(save.stats.money).toLocaleString()}đ`, '#f87171');
      showToast(`Thiếu tiền nhà (${room.rent.toLocaleString()}đ), đang nợ ${Math.abs(save.stats.money).toLocaleString()}đ${summaryPrefix}`);
    } else {
      sound.playClick();
      save.stats.energy = Math.max(50, maxE - sickPenalty);
      if (room.happyBonus > 0) save.stats.happiness += room.happyBonus;
      engine.spawnFloatingText(bizProfit > 0 ? `+${(bizProfit / 1000000).toFixed(1)}tr lãi` : `-${(room.rent / 1000000).toFixed(1)}tr tiền nhà`, bizProfit > 0 ? '#34d399' : '#fbbf24');
      showToast(`Đã trả ${room.rent.toLocaleString()}đ tiền nhà, hồi Thể lực${summaryPrefix}`);
    }

    commitAndRender();

    const debtLimit = getDebtLimit();
    if (save.stats.money < debtLimit) {
      triggerGameOver(`Bạn đã nợ tiền trọ vượt mức (${Math.abs(save.stats.money).toLocaleString()}đ) và bị chủ trọ lấy lại phòng.`);
      return;
    }
    if (save.low_happy_months >= 2) {
      triggerGameOver('Bạn để Tinh thần chạm mức 0 suốt 2 tháng liên tiếp, kiệt sức và buộc phải tạm dừng kế hoạch ở thành phố.');
      return;
    }

    if (Math.random() < 0.45) {
      triggerContextualSituation();
    }
  }

  function triggerGameOver(reason) {
    sound.playAlert();
    showEventModal('KẾT THÚC HÀNH TRÌNH', reason, [
      {
        label: 'Chơi lại từ năm 17 tuổi',
        style: 'safe',
        onClick: () => {
          savePlayerProgress(user.user_id, {
            user_id: user.user_id,
            is_initialized: false,
            life_path: null,
            major_id: null,
            job_id: null,
            stats: { age: 17, month: 1, money: 500000, energy: 100, happiness: 80, knowledge: 10 },
            monthly_flags: {},
            assets: { vehicle: 'walk', room: 'basic', gears: [] },
            relations: createDefaultRelations(),
            finance: createDefaultFinance(),
            milestones: [],
            businesses: [],
            job_shifts: {},
            gym_bonus: 0,
            extra_debt_buffer: 0,
            pawned: {},
            is_sick: false,
            low_happy_months: 0,
            failed_exam_age: null,
            position: { map_id: 'city_center', x: 570, y: 380 },
            inventory: []
          });
          window.location.reload();
        }
      }
    ]);
  }

  function startUniversityExam() {
    closeAllSubModals();
    const questions = pickRandomQuestions(5);
    const bonus = save.stats.knowledge >= 85 ? 2 : (save.stats.knowledge >= 70 ? 1 : 0);
    let qIndex = 0;
    let correctCount = 0;

    examModal.classList.remove('hidden');

    function renderQuestion() {
      const item = questions[qIndex];
      examProgress.textContent = `Câu ${qIndex + 1}/${questions.length}`;
      examBonusEl.textContent = `Cộng học lực: +${bonus}đ`;
      examQuestionEl.textContent = item.q;
      examOptionsEl.innerHTML = '';

      const labels = ['A', 'B', 'C', 'D'];
      item.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exam-opt-btn';
        btn.textContent = `${labels[idx]}. ${optText}`;

        btn.onclick = () => {
          const allBtns = examOptionsEl.querySelectorAll('button');
          allBtns.forEach(b => (b.disabled = true));

          if (idx === item.answer) {
            sound.playCoin();
            correctCount += 1;
            btn.classList.add('correct');
          } else {
            sound.playAlert();
            btn.classList.add('wrong');
            if (allBtns[item.answer]) allBtns[item.answer].classList.add('correct');
          }

          setTimeout(() => {
            qIndex += 1;
            if (qIndex < questions.length) renderQuestion();
            else finishExam();
          }, 650);
        };
        examOptionsEl.appendChild(btn);
      });
    }

    function finishExam() {
      const finalScore = Math.min(10, correctCount * 2 + bonus);
      examProgress.textContent = 'KẾT QUẢ THI';
      examBonusEl.textContent = `Tổng: ${finalScore}/10 điểm`;
      examOptionsEl.innerHTML = '';

      if (finalScore < 6) {
        sound.playAlert();
        examQuestionEl.textContent = `Bạn đúng ${correctCount}/5 câu (+${bonus}đ học lực) = ${finalScore}/10 điểm. Chưa đủ điểm chuẩn tối thiểu (6 điểm).`;
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-event-risk';
        closeBtn.textContent = 'Đóng (-10 Học lực, Tháng 6 năm sau thi lại)';
        closeBtn.onclick = () => {
          examModal.classList.add('hidden');
          save.stats.knowledge = Math.max(0, save.stats.knowledge - 10);
          save.stats.happiness -= 15;
          save.failed_exam_age = save.stats.age;
          showToast(`Thi trượt (${finalScore}/10 điểm). Đợi Tháng 6 năm sau thi lại.`);
          commitAndRender();
        };
        examOptionsEl.appendChild(closeBtn);
        return;
      }

      sound.playSuccess();
      examQuestionEl.textContent = `Chúc mừng! Bạn đạt ${finalScore}/10 điểm. Chọn ngành đủ điểm chuẩn để nhập học:`;
      MAJORS.forEach((m) => {
        const minScore = m.tuition_fee >= 15000000 ? 8 : 6;
        const qualified = finalScore >= minScore;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exam-major-btn';
        btn.disabled = !qualified;
        btn.innerHTML = `<strong>${m.name}</strong><small>Điểm chuẩn: ${minScore}/10 • Học phí: ${m.tuition_fee.toLocaleString()}đ ${qualified ? '• Đủ điểm' : '• Thiếu điểm'}</small>`;
        btn.onclick = () => {
          examModal.classList.add('hidden');
          save.life_path = 'STUDY';
          save.major_id = m.major_id;
          save.job_id = null;
          save.stats.happiness += 25;
          showToast(`Đã trúng tuyển và nhập học ngành ${m.name}!`);
          commitAndRender();
        };
        examOptionsEl.appendChild(btn);
      });
    }

    renderQuestion();
  }

  function triggerGamblingTrap() {
    showEventModal(
      'Lời mời chơi app chẵn lẻ',
      'Người quen ở công viên rủ tải app dự đoán chẵn lẻ, nói bỏ 500.000đ là gỡ nhanh trong vài phút. Bạn chọn cách nào?',
      [
        {
          label: 'Từ chối thẳng (+5 Học lực)',
          style: 'safe',
          onClick: () => {
            save.stats.knowledge += 5;
            engine.spawnFloatingText('+5 Học lực', '#38bdf8');
            showToast('Bạn từ chối thẳng và đi về (+5 Học lực).');
            commitAndRender();
          }
        },
        {
          label: 'Thử nạp 500.000đ',
          style: 'risk',
          onClick: () => {
            if (save.stats.money < 500000) return showToast('Không đủ 500.000đ trong túi nên bạn bỏ qua.');
            if (Math.random() < 0.85) {
              sound.playAlert();
              save.stats.money -= 500000;
              save.stats.happiness -= 20;
              engine.spawnFloatingText('-500.000đ', '#f87171');
              showToast('Mất trắng 500.000đ, app khóa rút tiền (-20 Tinh thần).');
            } else {
              sound.playCoin();
              save.stats.money += 300000;
              save.stats.happiness += 5;
              engine.spawnFloatingText('+300.000đ', '#34d399');
              showToast('Thắng nhẹ 300.000đ, nhưng kiểu mồi này rất dễ cuốn sâu.');
            }
            commitAndRender();
          }
        }
      ]
    );
  }

  engine.onNearTargetChange = (target) => {
    currentTarget = target;
    if (!target) {
      interactBtn.disabled = true;
      interactBtn.textContent = 'Lại gần địa điểm / NPC';
      return;
    }
    interactBtn.disabled = false;
    interactBtn.textContent = target.kind === 'npc'
      ? `Nói chuyện với ${target.data.name}`
      : `Vào ${target.data.name}`;
  };

  interactBtn.onclick = () => {
    if (!currentTarget) return;
    sound.playClick();

    if (currentTarget.kind === 'npc') {
      openNpcMenu(currentTarget.data);
      return;
    }

    const id = currentTarget.data.id;

    if (id === 'item_shop') {
      openItemShopMenu();
      return;
    }

    if (id === 'home') {
      const room = getRoom(save.assets.room);
      openActionMenu('Phòng trọ', `Đang ở: ${room.name} (${room.rent.toLocaleString()}đ/tháng — đổi trọ ở chỗ Chủ trọ).`, [
        {
          label: 'Qua tháng mới',
          sub: `Đóng ${room.rent.toLocaleString()}đ tiền nhà, hồi Thể lực`,
          btnText: 'Qua tháng',
          onClick: advanceMonth
        },
        {
          label: 'Tự học tại phòng',
          sub: `Miễn phí • -20 Thể lực, +${4 + (hasItem('study_lamp') ? 2 : 0)} Học lực (1 lần/tháng)`,
          disabled: !!save.monthly_flags.home_study,
          onClick: () => {
            if (save.stats.energy < 20) return showToast('Không đủ 20 Thể lực.');
            const gain = 4 + (hasItem('study_lamp') ? 2 : 0);
            const happyLoss = hasItem('anc_headset') ? 0 : 2;
            save.monthly_flags.home_study = true;
            save.stats.energy -= 20;
            save.stats.knowledge += gain;
            save.stats.happiness -= happyLoss;
            engine.spawnFloatingText(`+${gain} Học lực`, '#38bdf8');
            showToast(`Ngồi tự học ở phòng xong (+${gain} Học lực).`);
            commitAndRender();
          }
        },
        {
          label: 'Ngủ bù lấy sức',
          sub: 'Miễn phí • +15 Thể lực, +5 Tinh thần (1 lần/tháng)',
          disabled: !!save.monthly_flags.home_nap,
          onClick: () => {
            save.monthly_flags.home_nap = true;
            save.stats.energy += 15;
            save.stats.happiness += 5;
            engine.spawnFloatingText('+15 Thể lực', '#fbbf24');
            showToast('Ngủ bù một giấc sâu (+15 Thể lực, +5 Tinh thần).');
            commitAndRender();
          }
        }
      ]);
      return;
    }

    if (id === 'gym') {
      const hasPass = !!save.monthly_flags.gym_pass;
      const bonusLeft = Math.max(0, 30 - save.gym_bonus);
      openActionMenu(
        'Phòng Gym',
        `Đã tăng thêm +${save.gym_bonus}/30 Thể lực tối đa.`,
        [
          {
            label: hasPass ? 'Tập luyện (Đã có thẻ tháng)' : 'Tập lẻ 1 buổi (30k)',
            sub: `${hasPass ? 'Miễn phí' : '30.000đ'} • -25 Thể lực, +8 Tinh thần${bonusLeft > 0 ? `, +${hasPass ? 3 : 2} Thể lực tối đa` : ''}`,
            disabled: !!save.monthly_flags.gym_done,
            onClick: () => {
              if (!hasPass && save.stats.money < 30000) return showToast('Cần 30.000đ vé tập lẻ.');
              if (save.stats.energy < 25) return showToast('Cần 25 Thể lực để tập Gym.');
              if (!hasPass) save.stats.money -= 30000;
              save.stats.energy -= 25;
              save.stats.happiness += 8;
              save.monthly_flags.gym_done = true;
              const add = Math.min(bonusLeft, hasPass ? 3 : 2);
              save.gym_bonus += add;
              sound.playSuccess();
              engine.spawnFloatingText(add > 0 ? `+${add} Max Thể lực` : '+8 Tinh thần', '#fbbf24');
              showToast(add > 0 ? `Tập sung sức! Thể lực tối đa tăng lên ${getMaxEnergy()}.` : 'Tập xong người khỏe khoắn hẳn (+8 Tinh thần).');
              commitAndRender();
            }
          },
          {
            label: 'Mua thẻ tập tháng (300k)',
            sub: 'Tập hiệu quả hơn (+3 Max Thể lực/buổi) và +10 Tinh thần',
            disabled: hasPass,
            btnText: hasPass ? 'Đã có' : '300k',
            onClick: () => {
              if (save.stats.money < 300000) return showToast('Cần 300.000đ mua thẻ tháng.');
              sound.playCoin();
              save.stats.money -= 300000;
              save.monthly_flags.gym_pass = true;
              save.stats.happiness += 10;
              showToast('Đã mua thẻ Gym tháng này (+10 Tinh thần).');
              commitAndRender();
            }
          }
        ]
      );
      return;
    }

    if (id === 'net') {
      openActionMenu('Quán Net', 'Chỗ xả stress giá rẻ và thi đấu giải cỏ cuối tuần.', [
        {
          label: 'Chơi game giải trí (20k)',
          sub: '20.000đ • -15 Thể lực, +25 Tinh thần (1 lần/tháng)',
          disabled: !!save.monthly_flags.net_play,
          onClick: () => {
            if (save.stats.money < 20000) return showToast('Không đủ 20.000đ nạp giờ chơi.');
            if (save.stats.energy < 15) return showToast('Cần 15 Thể lực.');
            save.stats.money -= 20000;
            save.stats.energy -= 15;
            save.stats.happiness += 25;
            save.monthly_flags.net_play = true;
            engine.spawnFloatingText('+25 Tinh thần', '#34d399');
            showToast('Làm vài ván game xả sạch mệt mỏi (+25 Tinh thần).');
            commitAndRender();
          }
        },
        {
          label: 'Rủ Minh ra Net đánh chung (40k)',
          sub: '40.000đ • -15 Thể lực, +20 Tinh thần, +10 Thân thiết Minh',
          disabled: !!save.monthly_flags.net_minh,
          onClick: () => {
            if (save.stats.money < 40000) return showToast('Cần 40.000đ bao tiền máy & nước.');
            if (save.stats.energy < 15) return showToast('Cần 15 Thể lực.');
            save.stats.money -= 40000;
            save.stats.energy -= 15;
            save.stats.happiness += 20;
            save.relations.minh.affection += 10;
            save.monthly_flags.net_minh = true;
            engine.spawnFloatingText('+10 Thân Minh', '#f472b6');
            showToast('Leo rank chung với Minh cực vui (+20 Tinh thần, +10 Thân thiết).');
            commitAndRender();
          }
        },
        {
          label: 'Đăng ký đánh giải cỏ (50k)',
          sub: '-20 Thể lực • 45% thắng giải ăn 400.000đ',
          disabled: !!save.monthly_flags.net_tour,
          onClick: () => {
            if (save.stats.money < 50000) return showToast('Cần 50.000đ lệ phí giải.');
            if (save.stats.energy < 20) return showToast('Cần 20 Thể lực.');
            save.stats.money -= 50000;
            save.stats.energy -= 20;
            save.monthly_flags.net_tour = true;
            if (Math.random() < 0.45) {
              sound.playSuccess();
              save.stats.money += 400000;
              save.stats.happiness += 15;
              engine.spawnFloatingText('+400.000đ!', '#34d399');
              showToast('Vô địch giải cỏ quán Net! Nhận thưởng 400.000đ (+15 Tinh thần).');
            } else {
              sound.playAlert();
              save.stats.happiness -= 8;
              engine.spawnFloatingText('Loại sớm', '#f87171');
              showToast('Gặp đội mạnh quá bị loại ngay vòng đầu (-8 Tinh thần).');
            }
            commitAndRender();
          }
        }
      ]);
      return;
    }

    if (id === 'clinic') {
      openActionMenu(
        'Phòng khám & Hiệu thuốc',
        save.is_sick ? 'Bạn đang bị ốm, cần uống thuốc để hồi lại phong độ.' : 'Bạn đang khỏe mạnh, không cần dùng thuốc.',
        [
          {
            label: 'Mua thuốc cảm (100k)',
            sub: save.is_sick ? 'Chữa khỏi ốm ngay • +20 Thể lực' : 'Chỉ dùng khi đang bị ốm',
            btnText: save.is_sick ? 'Mua' : 'Đang khỏe',
            disabled: !save.is_sick,
            onClick: () => {
              if (save.stats.money < 100000) return showToast('Cần 100.000đ mua thuốc.');
              sound.playSuccess();
              save.stats.money -= 100000;
              save.is_sick = false;
              save.stats.energy += 20;
              engine.spawnFloatingText('Khỏi ốm!', '#34d399');
              showToast('Uống thuốc xong người nhẹ hẳn, đã khỏi ốm (+20 Thể lực).');
              commitAndRender();
            }
          },
          {
            label: 'Khám & truyền đạm (250k)',
            sub: save.is_sick ? 'Chữa khỏi ốm • +40 Thể lực, +10 Tinh thần' : 'Chỉ dùng khi đang bị ốm',
            btnText: save.is_sick ? 'Khám' : 'Đang khỏe',
            disabled: !save.is_sick,
            onClick: () => {
              if (save.stats.money < 250000) return showToast('Cần 250.000đ chi phí khám.');
              sound.playSuccess();
              save.stats.money -= 250000;
              save.is_sick = false;
              save.stats.energy += 40;
              save.stats.happiness += 10;
              engine.spawnFloatingText('Khỏe hẳn!', '#34d399');
              showToast('Khám và truyền đạm xong, đã hồi lại sức (+40 Thể lực).');
              commitAndRender();
            }
          }
        ]
      );
      return;
    }

    if (id === 'pawn') {
      const pawnActions = [];

      if (save.assets.vehicle !== 'walk') {
        const veh = getVehicle(save.assets.vehicle);
        const pawnVal = Math.round(veh.price * 0.6);
        if (!save.pawned.vehicle) {
          pawnActions.push({
            label: `Cầm ${veh.name}`,
            sub: `Nhận +${pawnVal.toLocaleString()}đ • Lãi 5%/tháng (quá 6 tháng mất xe)`,
            btnText: 'Cầm đồ',
            onClick: () => {
              sound.playCoin();
              save.stats.money += pawnVal;
              save.pawned.vehicle = { id: veh.id, principal: pawnVal, months: 1 };
              engine.spawnFloatingText(`+${pawnVal.toLocaleString()}đ`, '#34d399');
              showToast(`Đã cầm ${veh.name} lấy ${pawnVal.toLocaleString()}đ.`);
              commitAndRender();
            }
          });
        } else {
          const redeemVal = getPawnRedeemCost(save.pawned.vehicle);
          const m = save.pawned.vehicle.months;
          pawnActions.push({
            label: `Chuộc lại ${veh.name} (Tháng ${m}/6)`,
            sub: `Trả ${redeemVal.toLocaleString()}đ (gồm lãi 5%/tháng) để lấy lại xe`,
            btnText: 'Chuộc',
            onClick: () => {
              if (save.stats.money < redeemVal) return showToast(`Cần ${redeemVal.toLocaleString()}đ để chuộc xe.`);
              sound.playSuccess();
              save.stats.money -= redeemVal;
              delete save.pawned.vehicle;
              showToast(`Đã chuộc lại ${veh.name}!`);
              commitAndRender();
            }
          });
        }
      }

      if (hasItem('laptop')) {
        const pawnVal = 3500000;
        if (!save.pawned.laptop) {
          pawnActions.push({
            label: 'Cầm Laptop cũ',
            sub: `Nhận +${pawnVal.toLocaleString()}đ • Lãi 5%/tháng (quá 6 tháng mất máy)`,
            btnText: 'Cầm đồ',
            onClick: () => {
              sound.playCoin();
              save.stats.money += pawnVal;
              save.pawned.laptop = { principal: pawnVal, months: 1 };
              engine.spawnFloatingText('+3.500.000đ', '#34d399');
              showToast('Đã cầm Laptop lấy 3.500.000đ xoay xở.');
              commitAndRender();
            }
          });
        } else {
          const redeemVal = getPawnRedeemCost(save.pawned.laptop);
          const m = save.pawned.laptop.months;
          pawnActions.push({
            label: `Chuộc lại Laptop (Tháng ${m}/6)`,
            sub: `Trả ${redeemVal.toLocaleString()}đ để lấy lại Laptop`,
            btnText: 'Chuộc',
            onClick: () => {
              if (save.stats.money < redeemVal) return showToast(`Cần ${redeemVal.toLocaleString()}đ để chuộc Laptop.`);
              sound.playSuccess();
              save.stats.money -= redeemVal;
              delete save.pawned.laptop;
              showToast('Đã chuộc lại Laptop!');
              commitAndRender();
            }
          });
        }
      }

      pawnActions.push({
        label: 'Săn đồ thanh lý (200k)',
        sub: 'Thử vận may mua đồ cũ bán lại kiếm lời (1 lần/tháng)',
        disabled: !!save.monthly_flags.pawn_flip,
        onClick: () => {
          if (save.stats.money < 200000) return showToast('Cần 200.000đ vốn săn đồ.');
          save.stats.money -= 200000;
          save.monthly_flags.pawn_flip = true;
          if (Math.random() < 0.45) {
            sound.playCoin();
            save.stats.money += 450000;
            engine.spawnFloatingText('+250k lãi!', '#34d399');
            showToast('Mua trúng món đồ còn ngon, bán lại lời được 250.000đ!');
          } else {
            sound.playAlert();
            engine.spawnFloatingText('Lỗ 200k', '#f87171');
            showToast('Đồ lỗi không bán lại được, coi như mất 200.000đ học phí.');
          }
          commitAndRender();
        }
      });

      openActionMenu('Tiệm Cầm Đồ', 'Lãi cầm đồ 5%/tháng, quá 6 tháng không chuộc tiệm sẽ thanh lý.', pawnActions);
      return;
    }

    if (id === 'work') {
      const job = save.job_id ? getJobById(save.job_id) : null;
      const jobKey = job ? job.job_id : 'part_time';
      const cost = job ? job.energy_cost : 50;
      const baseIncome = job ? job.income_per_shift : 1800000;
      const happyDelta = job ? job.happiness_change : -10;
      const jobTitle = job ? job.name : 'Làm thêm';

      const { level, mult, progress } = getJobLevelInfo(jobKey);
      const bagBonus = hasItem('thermal_bag') ? 100000 : 0;
      const actualIncome = Math.round(baseIncome * mult) + bagBonus;
      const otIncome = Math.round(actualIncome * 1.4);

      const recordShift = () => {
        const oldLv = getJobLevelInfo(jobKey).level;
        save.job_shifts[jobKey] = (save.job_shifts[jobKey] || 0) + 1;
        const newLv = getJobLevelInfo(jobKey).level;
        if (newLv > oldLv) {
          sound.playSuccess();
          showToast(`Thăng bậc nghề ${jobTitle} lên Bậc ${newLv}/5 (+${(newLv - 1) * 15}% lương)!`);
        }
      };

      const workActions = [
        {
          label: `Làm ca chính (${jobTitle})`,
          sub: `+${actualIncome.toLocaleString()}đ • -${cost} Thể lực`,
          onClick: () => {
            if (save.stats.happiness <= 0) return showToast('Tinh thần kiệt quệ, hãy nghỉ ngơi trước.');
            if (save.stats.energy < cost) return showToast(`Cần ${cost} Thể lực.`);
            sound.playCoin();
            save.stats.energy -= cost;
            save.stats.money += actualIncome;
            save.stats.happiness += happyDelta;
            engine.spawnFloatingText(`+${actualIncome.toLocaleString()}đ`, '#34d399');
            showToast(`${jobTitle}: +${actualIncome.toLocaleString()}đ.`);
            recordShift();
            commitAndRender();
          }
        },
        {
          label: 'Tăng ca (OT)',
          sub: `+${otIncome.toLocaleString()}đ • -70 Thể lực, -20 Tinh thần (dễ bị ốm)`,
          onClick: () => {
            if (save.stats.happiness <= 10) return showToast('Tinh thần quá thấp, không chịu nổi tăng ca.');
            if (save.stats.energy < 70) return showToast('Cần ít nhất 70 Thể lực để tăng ca.');
            sound.playCoin();
            save.stats.energy -= 70;
            save.stats.money += otIncome;
            save.stats.happiness -= 20;
            const sickChance = hasItem('raincoat_pro') ? 0.12 : 0.25;
            if (Math.random() < sickChance) save.is_sick = true;
            engine.spawnFloatingText(`+${otIncome.toLocaleString()}đ`, '#34d399');
            showToast(save.is_sick ? `Tăng ca kiếm ${otIncome.toLocaleString()}đ nhưng bị kiệt sức ốm rồi!` : `Tăng ca mệt rã rời nhưng kiếm được ${otIncome.toLocaleString()}đ.`);
            recordShift();
            commitAndRender();
          }
        }
      ];

      if (save.life_path === 'WORK') {
        workActions.push({
          label: 'Xin đổi công việc khác',
          sub: 'Chọn lại nghề phổ thông phù hợp hơn',
          btnText: 'Xem việc',
          onClick: () => {
            const jobs17 = getRandom17Jobs();
            openActionMenu('Chọn công việc mới', 'Chọn nghề bạn muốn chuyển sang:', jobs17.map(j => ({
              label: j.name,
              sub: `${j.income_per_shift.toLocaleString()}đ/ca • Tinh thần ${j.happiness_change >= 0 ? '+' : ''}${j.happiness_change}`,
              disabled: save.job_id === j.job_id,
              btnText: save.job_id === j.job_id ? 'Đang làm' : 'Nhận việc',
              onClick: () => {
                save.job_id = j.job_id;
                showToast(`Đã chuyển sang làm ${j.name}.`);
                commitAndRender();
              }
            })));
          }
        });
      }

      const lvText = level >= 5 ? 'Bậc 5/5 (Tối đa, +60% lương)' : `Bậc ${level}/5 (+${(level - 1) * 15}% lương • ${progress}/8 ca lên bậc)`;
      openActionMenu('Chỗ làm', `${jobTitle} — ${lvText}.`, workActions);
      return;
    }

    if (id === 'shop') {
      const linh = save.relations.linh;
      const shopActions = [
        {
          label: 'Ngồi uống nước nghỉ ngơi',
          sub: '35.000đ • +20 Tinh thần (1 lần/tháng)',
          disabled: !!save.monthly_flags.shop,
          onClick: () => {
            if (save.stats.money < 35000) return showToast('Không đủ 35.000đ.');
            save.stats.money -= 35000;
            save.stats.happiness += 20;
            save.monthly_flags.shop = true;
            engine.spawnFloatingText('+20 Tinh thần', '#34d399');
            showToast('Ngồi quán nước nghỉ ngơi (+20 Tinh thần).');
            commitAndRender();
          }
        },
        {
          label: 'Ngồi cafe tự ôn bài',
          sub: `45.000đ • -20 Thể lực, +${6 + (hasItem('study_lamp') ? 2 : 0)} Học lực`,
          disabled: !!save.monthly_flags.shop_study,
          onClick: () => {
            if (save.stats.money < 45000) return showToast('Không đủ 45.000đ.');
            if (save.stats.energy < 20) return showToast('Cần 20 Thể lực.');
            const gain = 6 + (hasItem('study_lamp') ? 2 : 0);
            const happyGain = hasItem('anc_headset') ? 8 : 5;
            save.stats.money -= 45000;
            save.stats.energy -= 20;
            save.stats.knowledge += gain;
            save.stats.happiness += happyGain;
            save.monthly_flags.shop_study = true;
            engine.spawnFloatingText(`+${gain} Học lực`, '#38bdf8');
            showToast(`Ngồi góc quán học tập trung (+${gain} Học lực, +${happyGain} Tinh thần).`);
            commitAndRender();
          }
        }
      ];

      if (!linh.unlocked) {
        shopActions.push({
          label: 'Bắt chuyện làm quen',
          sub: '50.000đ • Có cơ hội làm quen người yêu mới',
          disabled: !!save.monthly_flags.shop_flirt,
          onClick: () => {
            if (save.stats.money < 50000) return showToast('Cần 50.000đ mời nước.');
            save.stats.money -= 50000;
            save.monthly_flags.shop_flirt = true;
            if (Math.random() < 0.6) {
              sound.playSuccess();
              linh.unlocked = true;
              linh.affection = 30;
              linh.ignoredMonths = 0;
              save.stats.happiness += 15;
              engine.spawnFloatingText('Quen Linh!', '#f472b6');
              showToast('Làm quen thành công với Linh! Linh đã đứng gần Quán nước.');
            } else {
              save.stats.happiness -= 5;
              showToast('Nói chuyện chưa hợp lắm, hẹn dịp khác vậy (-5 Tinh thần).');
            }
            commitAndRender();
          }
        });
      }

      openActionMenu('Quán nước', 'Không gian yên tĩnh để nghỉ ngơi, học bài hoặc làm quen bạn mới.', shopActions);
      return;
    }

    if (id === 'park') {
      openActionMenu('Công viên', 'Chọn hoạt động ngoài trời:', [
        {
          label: 'Đi dạo quanh công viên',
          sub: '-20 Thể lực • Gặp sự kiện ngẫu nhiên (1 lần/tháng)',
          disabled: !!save.monthly_flags.park,
          onClick: () => {
            if (save.stats.energy < 20) return showToast('Cần ít nhất 20 Thể lực.');
            save.stats.energy -= 20;
            save.monthly_flags.park = true;

            const roll = Math.random();
            if (roll < 0.25) {
              commitAndRender();
              triggerGamblingTrap();
              return;
            } else if (roll < 0.48) {
              save.stats.happiness += 20;
              engine.spawnFloatingText('+20 Tinh thần', '#34d399');
              showToast('Đánh cầu lông với mấy anh trong công viên (+20 Tinh thần).');
            } else if (roll < 0.65) {
              save.stats.knowledge += 5;
              engine.spawnFloatingText('+5 Học lực', '#38bdf8');
              showToast('Ngồi nói chuyện với người đi làm lâu năm (+5 Học lực).');
            } else if (roll < 0.80) {
              sound.playCoin();
              save.stats.money += 150000;
              engine.spawnFloatingText('+150.000đ', '#34d399');
              showToast('Nhặt được 150.000đ rơi bên ghế đá.');
            } else {
              const rainLoss = hasItem('raincoat_pro') ? -4 : -10;
              save.stats.happiness += rainLoss;
              engine.spawnFloatingText(`${rainLoss} Tinh thần`, '#f87171');
              showToast(hasItem('raincoat_pro') ? 'Đổ mưa rào nhưng có áo mưa bộ nên vẫn gọn gàng (-4 Tinh thần).' : 'Đang đi bộ thì trời đổ mưa rào (-10 Tinh thần).');
            }
            commitAndRender();
          }
        },
        {
          label: 'Chạy bộ tập thể dục',
          sub: 'Miễn phí • -15 Thể lực, +12 Tinh thần (1 lần/tháng)',
          disabled: !!save.monthly_flags.park_run,
          onClick: () => {
            if (save.stats.energy < 15) return showToast('Cần 15 Thể lực.');
            save.stats.energy -= 15;
            save.stats.happiness += 12;
            save.monthly_flags.park_run = true;
            engine.spawnFloatingText('+12 Tinh thần', '#34d399');
            showToast('Chạy vài vòng quanh hồ thấy đầu óc tỉnh táo hẳn (+12 Tinh thần).');
            commitAndRender();
          }
        }
      ]);
      return;
    }

    if (id === 'uni') {
      if (save.life_path === 'WORK') {
        if (save.stats.knowledge >= 50 && save.stats.month === 6) {
          if (save.failed_exam_age === save.stats.age) {
            showToast(`Tháng 6 năm ${save.stats.age} tuổi bạn đã thi rồi. Đợi Tháng 6 năm sau nhé.`);
            return;
          }
          startUniversityExam();
          return;
        }
        if (save.stats.money < 200000) return showToast('Cần 200.000đ mua tài liệu ôn thi.');
        if (save.stats.energy < 30) return showToast('Không đủ 30 Thể lực để ôn thi.');
        const gain = (hasLaptop() ? 14 : 10) + (hasItem('study_lamp') ? 2 : 0);
        const happyLoss = hasItem('anc_headset') ? 2 : 5;
        save.stats.money -= 200000;
        save.stats.energy -= 30;
        save.stats.knowledge += gain;
        save.stats.happiness -= happyLoss;
        engine.spawnFloatingText(`+${gain} Học lực`, '#38bdf8');
        showToast(`Ôn thi xong: +${gain} Học lực (${save.stats.knowledge >= 50 ? 'Đợi Tháng 6 thi ĐH' : `${save.stats.knowledge}/50 để thi`}).`);
        commitAndRender();
        return;
      }

      if (save.job_id) return showToast('Bạn đã tốt nghiệp. Qua Chỗ làm để làm việc.');
      const major = MAJORS.find(m => m.major_id === save.major_id);
      if (save.stats.knowledge >= 100 && save.stats.money >= major.tuition_fee) {
        sound.playSuccess();
        save.stats.money -= major.tuition_fee;
        save.job_id = major.future_job_id;
        save.stats.happiness += 30;
        engine.spawnFloatingText('Tốt nghiệp!', '#34d399');
        showToast(`Đã đóng đủ học phí và tốt nghiệp! Bắt đầu làm ${major.future_job_name}.`);
        commitAndRender();
        return;
      }
      if (save.stats.happiness <= 0) return showToast('Tinh thần quá căng thẳng, hãy nghỉ ngơi trước.');
      if (save.stats.energy < 50) return showToast('Cần 50 Thể lực để đi học.');

      const studyGain = (hasLaptop() ? 8 : 5) + (hasItem('study_lamp') ? 2 : 0);
      const happyLoss = hasItem('anc_headset') ? 4 : 8;
      save.stats.energy -= 50;
      save.stats.knowledge += studyGain;
      save.stats.happiness -= happyLoss;
      engine.spawnFloatingText(`+${studyGain} Học lực`, '#38bdf8');
      showToast(`Đi học: +${studyGain} Học lực, -50 Thể lực (Cần 100 Học lực & ${major.tuition_fee.toLocaleString()}đ tiền mặt học phí).`);
      commitAndRender();
    }
  };

  // Xử lý Joystick cảm ứng & chuột
  const zone = document.getElementById('joystick-zone');
  const knob = document.getElementById('joystick-knob');
  let active = false;
  const maxDist = 34;

  function handleMove(clientX, clientY) {
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    engine.setJoystickInput(dx / maxDist, dy / maxDist);
  }

  function resetJoystick() {
    active = false;
    knob.style.transform = 'translate(-50%, -50%)';
    engine.setJoystickInput(0, 0);
  }

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    active = true;
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  zone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (active) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  zone.addEventListener('touchend', resetJoystick);
  zone.addEventListener('mousedown', (e) => { active = true; handleMove(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => { if (active) handleMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', resetJoystick);

  updateHUD();
}