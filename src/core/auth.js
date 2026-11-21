import {
  getAccounts, saveAccounts, hashPassword,
  savePlayerProgress, setSession, getSession, clearSession
} from './storage.js';

export async function registerUser(username, email, password) {
  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
    return { ok: false, error: 'Tên tài khoản từ 3-20 ký tự, viết liền không dấu!' };
  }
  if (!cleanEmail.endsWith('@gmail.com') || cleanEmail.length < 11) {
    return { ok: false, error: 'Vui lòng nhập đúng định dạng Gmail (@gmail.com)!' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự!' };
  }

  const accounts = getAccounts();
  if (accounts.some(acc => acc.username === cleanUser)) {
    return { ok: false, error: 'Tên tài khoản này đã có người dùng!' };
  }
  if (accounts.some(acc => acc.email === cleanEmail)) {
    return { ok: false, error: 'Gmail này đã được đăng ký!' };
  }

  const userId = 'usr_' + Date.now();
  const passwordHash = await hashPassword(password);

  const newAccount = {
    user_id: userId,
    username: cleanUser,
    email: cleanEmail,
    password_hash: passwordHash,
    created_at: Date.now()
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  savePlayerProgress(userId, {
    user_id: userId,
    is_initialized: false,
    life_path: null,
    major_id: null,
    job_id: null,
    stats: { age: 17, month: 1, money: 500000, energy: 100, happiness: 80, knowledge: 10 },
    monthly_flags: { shop: false, park: false },
    position: { map_id: 'city_center', x: 570, y: 380 },
    inventory: []
  });

  setSession(userId);
  return { ok: true, user: newAccount };
}

export async function loginUser(username, password) {
  const cleanUser = username.trim().toLowerCase();
  const accounts = getAccounts();
  const account = accounts.find(acc => acc.username === cleanUser);

  if (!account) {
    return { ok: false, error: 'Tài khoản không tồn tại!' };
  }

  const passwordHash = await hashPassword(password);
  if (account.password_hash !== passwordHash) {
    return { ok: false, error: 'Sai mật khẩu rồi bạn ơi!' };
  }

  setSession(account.user_id);
  return { ok: true, user: account };
}

export function getCurrentUser() {
  const userId = getSession();
  if (!userId) return null;
  return getAccounts().find(acc => acc.user_id === userId) || null;
}

export function logoutUser() {
  clearSession();
}
