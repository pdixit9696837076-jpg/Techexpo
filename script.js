const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

document.querySelectorAll('[data-toast]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('This feature will be available soon.');
  });
});

const dialog = document.querySelector('#login-dialog');
const loginButton = document.querySelector('[data-open-login]');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const tabs = document.querySelectorAll('[data-auth-tab]');
const methodButtons = document.querySelectorAll('[data-login-method]');
const mobileFields = document.querySelector('.mobile-login-fields');
let loginMethod = 'email';

function openAuth(mode = 'login') {
  dialog.showModal();
  switchAuth(mode);
}

function switchAuth(mode) {
  const isLogin = mode === 'login';
  loginForm.hidden = !isLogin;
  signupForm.hidden = isLogin;
  [loginForm, signupForm].forEach((form) => {
    form.querySelectorAll('input').forEach((input) => { input.disabled = form.hidden; });
  });
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.authTab === mode));
  if (isLogin) setLoginMethod(document.querySelector('[data-login-method="email"]'));
}

loginButton.addEventListener('click', () => openAuth('login'));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
tabs.forEach((tab) => tab.addEventListener('click', () => switchAuth(tab.dataset.authTab)));
document.querySelectorAll('[data-open-signup]').forEach((button) => button.addEventListener('click', () => switchAuth('signup')));
document.querySelectorAll('[data-open-login]').forEach((button) => {
  if (button !== loginButton) button.addEventListener('click', () => switchAuth('login'));
});
function setLoginMethod(button) {
    loginMethod = button.dataset.loginMethod;
    const emailMode = loginMethod === 'email';
    methodButtons.forEach((item) => item.classList.toggle('active', item === button));
    document.querySelector('#login-email').closest('label').hidden = !emailMode;
    document.querySelector('#login-password').closest('label').hidden = !emailMode;
    loginForm.querySelector('.auth-row').hidden = !emailMode;
    loginForm.querySelector('.auth-submit').hidden = !emailMode;
    loginForm.querySelector('.dialog-note').hidden = !emailMode;
    mobileFields.hidden = emailMode;
    loginForm.querySelector('#login-email').disabled = !emailMode;
    loginForm.querySelector('#login-password').disabled = !emailMode;
    mobileFields.querySelectorAll('input').forEach((input) => { input.disabled = emailMode; });
}
methodButtons.forEach((button) => {
  button.addEventListener('click', () => setLoginMethod(button));
});

document.querySelectorAll('.toggle-password').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.querySelector(`#${button.dataset.for}`);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'Show' : 'Hide';
  });
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.querySelector('#login-email').value.trim().toLowerCase();
  const password = document.querySelector('#login-password').value;
  fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      dialog.close();
      loginForm.reset();
      showToast(data.message);
    }).catch((error) => showToast(error.message));
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const account = {
    name: document.querySelector('#signup-name').value.trim(),
    email: document.querySelector('#signup-email').value.trim().toLowerCase(),
    phone: document.querySelector('#signup-phone').value.replace(/\D/g, ''),
    password: document.querySelector('#signup-password').value
  };
  fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      signupForm.reset();
      switchAuth('login');
      document.querySelector('#login-email').value = account.email;
      showToast('Account created. You can now log in.');
    }).catch((error) => showToast(error.message));
});

async function requestMobileOtp() {
  const phone = document.querySelector('#mobile-number').value.replace(/\D/g, '');
  const response = await fetch('/api/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  lastPhone = phone;
  document.querySelector('#mobile-display').textContent = `+91 ${phone}`;
  document.querySelector('#otp-demo').textContent = `Demo OTP: ${data.demoOtp}`;
  document.querySelector('#otp-demo').hidden = false;
  document.querySelector('#mobile-request-step').hidden = true;
  document.querySelector('#mobile-verify-step').hidden = false;
  document.querySelector('#mobile-otp').focus();
}

const mobileNumber = document.querySelector('#mobile-number');
const mobileOtp = document.querySelector('#mobile-otp');
let lastPhone = '';
document.querySelector('#send-mobile-otp').addEventListener('click', () => requestMobileOtp().catch((error) => showToast(error.message)));
document.querySelector('#verify-mobile').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: lastPhone, otp: mobileOtp.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    dialog.close();
    loginForm.reset();
    document.querySelector('#mobile-request-step').hidden = false;
    document.querySelector('#mobile-verify-step').hidden = true;
    document.querySelector('[data-login-method="email"]').click();
    showToast(data.message);
  } catch (error) {
    showToast(error.message);
  }
});
document.querySelector('#resend-mobile').addEventListener('click', () => requestMobileOtp().catch((error) => showToast(error.message)));

document.querySelector('#forgot-password').addEventListener('click', () => {
  const email = document.querySelector('#login-email').value.trim();
  showToast(email ? `Password reset link demo sent to ${email}.` : 'Enter your email first.');
});

document.querySelector('.menu-button').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('mobile-open');
});
