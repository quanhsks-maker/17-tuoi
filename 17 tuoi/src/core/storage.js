const KEYS = {
  ACCOUNTS: 'nam17_accounts',
  SAVES: 'nam17_saves',
  SESSION: 'nam17_current_user'
};

// Hàm đọc JSON an toàn, tự động chống sập game nếu bộ nhớ lỗi
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Dữ liệu lưu bị lỗi, tự động khôi phục mặc định:', err);
    return fallback;
  }
}

// Mã hóa mật khẩu 1 chiều (SHA-256)
export async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_nam17_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  const str = password + '_nam17_salt';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export function getAccounts() {
  return safeParse(localStorage.getItem(KEYS.ACCOUNTS), []);
}

export function saveAccounts(accounts) {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Không thể lưu danh sách tài khoản:', err);
  }
}

export function getSaves() {
  return safeParse(localStorage.getItem(KEYS.SAVES), {});
}

export function savePlayerProgress(userId, saveData) {
  try {
    const saves = getSaves();
    saves[userId] = { ...saveData, updated_at: Date.now(), schema_version: 1 };
    localStorage.setItem(KEYS.SAVES, JSON.stringify(saves));
  } catch (err) {
    console.error('Không thể lưu tiến trình game:', err);
  }
}

export function getPlayerProgress(userId) {
  const saves = getSaves();
  return saves[userId] || null;
}

export function setSession(userId) {
  localStorage.setItem(KEYS.SESSION, userId);
}

export function getSession() {
  return localStorage.getItem(KEYS.SESSION);
}

export function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
}
