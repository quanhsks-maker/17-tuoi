import { registerUser, loginUser, logoutUser } from '../core/auth.js';

export function initAuthUI(onLoginSuccess) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const regError = document.getElementById('reg-error');

  // Chuyển tab Đăng nhập / Tạo tài khoản
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginError.textContent = '';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    regError.textContent = '';
  });

  // Xử lý Đăng nhập
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const res = await loginUser(u, p);
    if (!res.ok) {
      loginError.textContent = res.error;
      return;
    }
    onLoginSuccess(res.user);
  });

  // Xử lý Đăng ký
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    regError.textContent = '';
    const u = document.getElementById('reg-username').value;
    const em = document.getElementById('reg-email').value;
    const p = document.getElementById('reg-password').value;
    const res = await registerUser(u, em, p);
    if (!res.ok) {
      regError.textContent = res.error;
      return;
    }
    onLoginSuccess(res.user);
  });

  // Nút đăng xuất tạm thời để test
  document.getElementById('btn-logout').addEventListener('click', () => {
    logoutUser();
    location.reload();
  });
}
