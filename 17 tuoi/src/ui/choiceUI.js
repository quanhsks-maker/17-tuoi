import { MAJORS } from '../data/majors.js';
import { getRandom17Jobs } from '../data/jobs.js';
import { getPlayerProgress, savePlayerProgress } from '../core/storage.js';

export function initChoiceUI(user, onChoiceCompleted) {
  const stepMain = document.getElementById('choice-step-main');
  const stepStudy = document.getElementById('choice-step-study');
  const stepWork = document.getElementById('choice-step-work');
  const majorListEl = document.getElementById('major-list');

  // Đặt lại màn hình về bước chọn 2 nhánh
  stepMain.classList.remove('hidden');
  stepStudy.classList.add('hidden');
  stepWork.classList.add('hidden');

  // Nút chọn ĐI HỌC
  document.getElementById('btn-choose-study').onclick = () => {
    stepMain.classList.add('hidden');
    stepStudy.classList.remove('hidden');
    renderMajors(user, majorListEl, onChoiceCompleted);
  };

  // Nút quay lại từ màn chọn ngành
  document.getElementById('btn-back-choice').onclick = () => {
    stepStudy.classList.add('hidden');
    stepMain.classList.remove('hidden');
  };

  // Nút chọn ĐI LÀM (Quay Random)
  document.getElementById('btn-choose-work').onclick = () => {
    stepMain.classList.add('hidden');
    stepWork.classList.remove('hidden');
    startRandomJobSpin(user, onChoiceCompleted);
  };
}

function renderMajors(user, container, onChoiceCompleted) {
  container.innerHTML = '';
  MAJORS.forEach(major => {
    const card = document.createElement('div');
    card.className = 'major-item';
    card.innerHTML = `
      <div class="major-top">
        <span>${major.icon} ${major.name}</span>
        <span class="major-fee">Học phí: ${major.tuition_fee.toLocaleString()}đ/kỳ</span>
      </div>
      <div class="major-future">🎯 Tương lai: ${major.future_job_name}</div>
      <div class="path-desc">${major.description}</div>
    `;
    card.onclick = () => {
      const save = getPlayerProgress(user.user_id);
      save.is_initialized = true;
      save.life_path = 'STUDY';
      save.major_id = major.major_id;
      save.job_id = null;
      savePlayerProgress(user.user_id, save);
      onChoiceCompleted(save);
    };
    container.appendChild(card);
  });
}

function startRandomJobSpin(user, onChoiceCompleted) {
  const jobs = getRandom17Jobs();
  const iconEl = document.getElementById('roulette-icon');
  const nameEl = document.getElementById('roulette-name');
  const quoteEl = document.getElementById('roulette-quote');
  const statsEl = document.getElementById('roulette-stats');
  const confirmBtn = document.getElementById('btn-confirm-work');

  confirmBtn.classList.add('hidden');
  quoteEl.textContent = 'Đang quay vận mệnh tuổi 17...';
  statsEl.textContent = '';

  let count = 0;
  const spinInterval = setInterval(() => {
    const tempJob = jobs[count % jobs.length];
    iconEl.textContent = tempJob.icon;
    nameEl.textContent = tempJob.name;
    count++;
  }, 100);

  // Dừng quay sau 1.5 giây và chốt nghề ngẫu nhiên
  setTimeout(() => {
    clearInterval(spinInterval);
    const chosenJob = jobs[Math.floor(Math.random() * jobs.length)];
    iconEl.textContent = chosenJob.icon;
    nameEl.textContent = chosenJob.name;
    quoteEl.textContent = `"${chosenJob.funny_quote}"`;
    statsEl.textContent = `💰 Thu nhập: +${chosenJob.income_per_shift.toLocaleString()}đ / ca | ⚡ Tốn ${chosenJob.energy_cost} năng lượng`;
    confirmBtn.classList.remove('hidden');

    confirmBtn.onclick = () => {
      const save = getPlayerProgress(user.user_id);
      save.is_initialized = true;
      save.life_path = 'WORK';
      save.major_id = null;
      save.job_id = chosenJob.job_id;
      savePlayerProgress(user.user_id, save);
      onChoiceCompleted(save);
    };
  }, 1500);
}
