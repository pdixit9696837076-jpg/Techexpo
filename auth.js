const message = document.querySelector('#message');
const showMessage = (text, error = false) => {
  message.hidden = !text;
  if (!text) {
    message.textContent = '';
    message.className = 'message';
    return;
  }
  if (localStorage.getItem('gramvyapar-language') === 'hi') {
    const translations = {
      'Cannot reach the GramVyapar server. Start it with "npm start" and open http://localhost:3000.': 'GramVyapar सर्वर से कनेक्ट नहीं हो पा रहा। "npm start" चलाएँ और http://localhost:3000 खोलें।',
      'The server returned an invalid response. Please refresh and try again.': 'सर्वर से सही जवाब नहीं मिला। पेज रीफ़्रेश करके फिर कोशिश करें।',
      'Email or password is incorrect.': 'ईमेल या पासवर्ड सही नहीं है।',
      'Enter a valid 10-digit Indian mobile number.': '10 अंकों का सही भारतीय मोबाइल नंबर लिखें।',
      'No account found. Please make your account first.': 'खाता नहीं मिला। पहले अपना खाता बनाएँ।',
      'No account found for this mobile number. Please make your account first.': 'इस मोबाइल नंबर से खाता नहीं मिला। पहले अपना खाता बनाएँ।',
      'Invalid or expired OTP.': 'OTP गलत है या उसकी समय-सीमा पूरी हो गई है।',
      'OTP sent successfully.': 'OTP सफलतापूर्वक भेज दिया गया।',
      'Account created! Redirecting to login…': 'खाता बन गया! लॉग इन पेज पर जा रहे हैं…',
      'Enter your email and we will send a reset link.': 'अपना ईमेल लिखें, हम पासवर्ड बदलने का लिंक भेजेंगे।',
      'Logged out.': 'आप लॉग आउट हो गए हैं।'
    };
    text = translations[text] || text.replace(/^Welcome back, (.+)!$/, 'वापस स्वागत है, $1!');
  }
  message.textContent = text;
  message.className = `message ${error ? 'error' : 'success'}`;
  if (error) message.focus({ preventScroll: true });
};
const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const serverPort = Number(location.port);
const isGramVyaparPort = serverPort >= 3000 && serverPort <= 3010;
const API_BASE = location.protocol === 'file:' || (localHost && !isGramVyaparPort)
  ? 'http://localhost:3000'
  : '';
const dashboardUrl = new URL('/dashboard.html', API_BASE || location.origin);

async function postJson(url, payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('Cannot reach the GramVyapar server. Start it with "npm start" and open http://localhost:3000.');
  }

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    if (response.ok && parsed && typeof parsed === 'object') {
      data = parsed;
    } else {
      throw new Error('Cannot reach the GramVyapar server. Start it with "npm start" and open http://localhost:3000.');
    }
  } else {
    try {
      data = await response.json();
    } catch {
      throw new Error('The server returned an invalid response. Please refresh and try again.');
    }
  }

  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
document.querySelectorAll('[data-toggle]').forEach((button) => button.addEventListener('click', () => { const input = document.querySelector(`#${button.dataset.toggle || button.dataset.for}`); input.type = input.type === 'password' ? 'text' : 'password'; button.textContent = input.type === 'password' ? 'Show' : 'Hide'; }));
const emailForm = document.querySelector('#email-login');
const mobileForm = document.querySelector('#mobile-login');
document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => { const mobile = button.dataset.mode === 'mobile'; document.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('active', item === button)); emailForm.hidden = mobile; mobileForm.hidden = !mobile; showMessage(''); }));
if (emailForm) emailForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  emailInput.removeAttribute('aria-invalid');
  passwordInput.removeAttribute('aria-invalid');
  try {
    await postJson('/api/login', {
      email: emailInput.value,
      password: passwordInput.value
    });
    location.replace(dashboardUrl.href);
  } catch (error) {
    if (error.message === 'Email or password is incorrect.') {
      emailInput.setAttribute('aria-invalid', 'true');
      passwordInput.setAttribute('aria-invalid', 'true');
    }
    showMessage(error.message, true);
  }
});
let requestedPhone = '';
document.querySelector('#send-otp')?.addEventListener('click', async () => {
  requestedPhone = document.querySelector('#phone').value.replace(/\D/g, '');
  try {
    const data = await postJson('/api/otp/request', { phone: requestedPhone });
    document.querySelector('#otp-area').hidden = false;
    document.querySelector('#demo-note').textContent = `Demo OTP: ${data.demoOtp}`;
    showMessage('OTP sent successfully.');
  } catch (error) {
    showMessage(error.message, true);
  }
});
document.querySelector('#verify-otp')?.addEventListener('click', async () => {
  try {
    await postJson('/api/otp/verify', {
      phone: requestedPhone,
      otp: document.querySelector('#otp').value
    });
    location.replace(dashboardUrl.href);
  } catch (error) {
    showMessage(error.message, true);
  }
});
document.querySelector('#signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await postJson('/api/signup', {
      name: document.querySelector('#name').value,
      email: document.querySelector('#signup-email').value,
      phone: document.querySelector('#signup-phone').value,
      password: document.querySelector('#signup-password').value
    });
    showMessage('Account created! Redirecting to login…');
    setTimeout(() => { location.href = 'login.html'; }, 900);
  } catch (error) {
    showMessage(error.message, true);
  }
});
document.querySelector('#forgot')?.addEventListener('click', () => showMessage('Enter your email and we will send a reset link.'));
