const languageKey = 'gramvyapar-language';
const sidebarKey = 'gramvyapar-sidebar-collapsed';
const sections = ['home', 'learn', 'shopping', 'value', 'schemes', 'chat'];
const names = {
  home: { en: 'Home', hi: 'होम' },
  learn: { en: 'Learn', hi: 'सीखें' },
  shopping: { en: 'Shopping', hi: 'खरीदारी' },
  value: { en: 'Pricing', hi: 'मूल्य' },
  schemes: { en: 'Schemes', hi: 'योजनाएँ' },
  chat: { en: 'Chat', hi: 'चैट' }
};
let currentSection = 'home';
let language = localStorage.getItem(languageKey) || 'hi';
const sidebar = document.querySelector('#sidebar');
const menuToggle = document.querySelector('#menu-toggle');
const isMobileLayout = () => window.matchMedia('(max-width: 760px)').matches;
const cartStorageKey = 'gramvyapar-cart';
const wishlistStorageKey = 'gramvyapar-wishlist';

function readStoredList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch (error) {
    console.warn(`Could not read saved ${key} data.`, error);
    return [];
  }
}

let cart = readStoredList(cartStorageKey);
let wishlist = readStoredList(wishlistStorageKey);

function saveShopState() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  document.querySelector('#cart-count').textContent = cart.length;
  document.querySelectorAll('.product-card').forEach((card) => {
    const button = card.querySelector('.wish-button');
    const saved = wishlist.includes(card.dataset.product);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? '♥' : '♡';
  });
}

function openShopDrawer(mode) {
  const overlay = document.querySelector('#shop-overlay');
  const title = document.querySelector('#drawer-title');
  const items = document.querySelector('#drawer-items');
  const footer = document.querySelector('#drawer-footer');
  const ids = mode === 'cart' ? cart : wishlist;
  title.textContent = mode === 'cart'
    ? (language === 'hi' ? 'आपकी कार्ट' : 'Your cart')
    : (language === 'hi' ? 'आपकी विशलिस्ट' : 'Your wishlist');
  items.replaceChildren();
  footer.replaceChildren();

  if (!ids.length) {
    const empty = document.createElement('p');
    empty.className = 'drawer-empty';
    empty.textContent = mode === 'cart'
      ? (language === 'hi' ? 'आपकी कार्ट अभी खाली है।' : 'Your cart is empty for now.')
      : (language === 'hi' ? 'आपकी विशलिस्ट अभी खाली है।' : 'Your wishlist is empty for now.');
    items.append(empty);
  }

  let total = 0;
  ids.forEach((id) => {
    const card = document.querySelector(`[data-product="${id}"]`);
    if (!card) return;
    const name = card.querySelector('.product-details h2').textContent;
    const price = Number(card.querySelector('.product-bottom b').textContent.replace(/[^\d]/g, ''));
    total += price;
    const row = document.createElement('div');
    row.className = 'drawer-item';
    const detail = document.createElement('div');
    const productName = document.createElement('b');
    productName.textContent = name;
    const productPrice = document.createElement('span');
    productPrice.textContent = `₹${price.toLocaleString('en-IN')}`;
    detail.append(productName, productPrice);
    const action = document.createElement('button');
    action.className = 'drawer-remove';
    action.type = 'button';
    action.textContent = mode === 'cart'
      ? (language === 'hi' ? 'हटाएँ' : 'Remove')
      : (language === 'hi' ? 'हटाएँ' : 'Remove');
    action.addEventListener('click', () => {
      if (mode === 'cart') cart = cart.filter((item) => item !== id);
      else wishlist = wishlist.filter((item) => item !== id);
      saveShopState();
      openShopDrawer(mode);
    });
    row.append(detail, action);
    items.append(row);
  });

  if (mode === 'cart' && cart.length) {
    const totalLine = document.createElement('div');
    totalLine.className = 'drawer-total';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = language === 'hi' ? 'कुल' : 'Subtotal';
    const totalAmount = document.createElement('b');
    totalAmount.textContent = `₹${total.toLocaleString('en-IN')}`;
    totalLine.append(totalLabel, totalAmount);
    const note = document.createElement('small');
    note.textContent = language === 'hi' ? 'चेकआउट जल्द उपलब्ध होगा।' : 'Checkout will be available soon.';
    footer.append(totalLine, note);
  }
  overlay.hidden = false;
}

function updateSidebarToggle() {
  const mobile = isMobileLayout();
  const expanded = !document.body.classList.contains('sidebar-collapsed');
  const labels = {
    en: mobile
      ? (expanded ? ['Hide bottom navigation', 'Hide bottom navigation'] : ['Show bottom navigation', 'Show bottom navigation'])
      : (expanded ? ['Collapse sidebar', 'Collapse sidebar'] : ['Expand sidebar', 'Expand sidebar']),
    hi: mobile
      ? (expanded ? ['नीचे का नेविगेशन छिपाएँ', 'नीचे का नेविगेशन छिपाएँ'] : ['नीचे का नेविगेशन दिखाएँ', 'नीचे का नेविगेशन दिखाएँ'])
      : (expanded ? ['साइडबार छिपाएँ', 'साइडबार छिपाएँ'] : ['साइडबार दिखाएँ', 'साइडबार दिखाएँ'])
  };
  const label = labels[language][0];
  menuToggle.setAttribute('aria-label', label);
  menuToggle.title = label;
  menuToggle.setAttribute('aria-expanded', String(expanded));
}

async function loadUser() {
  const response = await fetch('/api/me');
  if (!response.ok) {
    location.replace('login.html');
    return;
  }
  const { user } = await response.json();
  const firstName = user.name.split(/\s+/)[0];
  document.querySelector('#welcome-user').textContent = firstName;
  document.querySelector('#greeting-name').textContent = firstName;
  document.querySelector('#avatar').textContent = firstName.charAt(0).toUpperCase();
  await loadChatHistory();
}

function appendChatMessage(role, text) {
  const message = document.createElement('div');
  message.className = `chat-bubble ${role === 'user' ? 'user' : 'bot'}`;
  message.textContent = text;
  document.querySelector('#chat-messages').append(message);
  message.scrollIntoView({ block: 'nearest' });
  return message;
}

async function loadChatHistory() {
  const response = await fetch('/api/chat/history');
  if (!response.ok) return;
  const { messages } = await response.json();
  if (!messages.length) return;
  const chatMessages = document.querySelector('#chat-messages');
  chatMessages.replaceChildren();
  messages.forEach((message) => appendChatMessage(message.role === 'user' ? 'user' : 'bot', message.message));
}

async function loadAiStatus() {
  const status = document.querySelector('#ai-status');
  try {
    const response = await fetch('/api/chat/status');
    if (!response.ok) throw new Error('Could not check AI setup.');
    const data = await response.json();
    status.textContent = data.configured
      ? (language === 'hi' ? 'API key जुड़ी है' : 'API key connected')
      : (language === 'hi' ? '.env में API key डालें' : 'Add API key to .env');
    status.classList.toggle('ready', data.configured);
    status.classList.toggle('needs-key', !data.configured);
  } catch {
    status.textContent = language === 'hi' ? 'AI स्थिति नहीं मिली' : 'AI status unavailable';
    status.classList.add('needs-key');
  }
}

function showSection(section) {
  if (!sections.includes(section)) return;
  currentSection = section;
  document.querySelectorAll('.dash-section').forEach((panel) => panel.classList.toggle('active', panel.id === `section-${section}`));
  document.querySelectorAll('.side-link[data-section]').forEach((link) => link.classList.toggle('active', link.dataset.section === section));
  const title = document.querySelector('#current-page');
  title.dataset.en = names[section].en;
  title.dataset.hi = names[section].hi;
  title.textContent = names[section][language];
  sidebar.classList.remove('open');
  updateSidebarToggle();
  if (section === 'chat') loadAiStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-section]').forEach((item) => item.addEventListener('click', () => showSection(item.dataset.section)));
document.addEventListener('gramvyapar:language', (event) => {
  language = event.detail.language;
  const title = document.querySelector('#current-page');
  title.dataset.en = names[currentSection].en;
  title.dataset.hi = names[currentSection].hi;
  title.textContent = names[currentSection][language];
  updateSidebarToggle();
  loadAiStatus();
});
menuToggle.addEventListener('click', () => {
  document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem(sidebarKey, String(document.body.classList.contains('sidebar-collapsed')));
  updateSidebarToggle();
});
window.addEventListener('resize', updateSidebarToggle);
document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.replace('login.html');
});
document.querySelector('#price-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const materials = Number(document.querySelector('#materials').value);
  const hours = Number(document.querySelector('#hours').value);
  const hourly = Number(document.querySelector('#hourly').value);
  const packaging = Number(document.querySelector('#packaging').value);
  document.querySelector('#price').textContent = Math.ceil(materials + hours * hourly + packaging);
});
document.querySelector('#chat-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#chat-input');
  const submit = document.querySelector('#chat-form button');
  const text = input.value.trim();
  if (!text || submit.disabled) return;
  appendChatMessage('user', text);
  input.value = '';
  const typing = appendChatMessage('bot typing', language === 'hi' ? 'ज्ञान जवाब लिख रहा है…' : 'Gyaan is thinking…');
  submit.disabled = true;
  input.disabled = true;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not send your message.');
    typing.remove();
    appendChatMessage('bot', data.answer);
  } catch (error) {
    typing.classList.add('chat-error');
    typing.textContent = error.message;
  } finally {
    submit.disabled = false;
    input.disabled = false;
    input.focus();
  }
});
document.querySelectorAll('.add-cart').forEach((button) => button.addEventListener('click', () => {
  const id = button.closest('.product-card').dataset.product;
  if (!cart.includes(id)) cart.push(id);
  saveShopState();
  const originalText = button.dataset[language];
  button.textContent = language === 'hi' ? 'जोड़ दिया ✓' : 'Added ✓';
  window.setTimeout(() => { button.textContent = originalText; }, 1200);
}));
document.querySelectorAll('.wish-button').forEach((button) => button.addEventListener('click', () => {
  const id = button.closest('.product-card').dataset.product;
  wishlist = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
  saveShopState();
}));
document.querySelectorAll('.category-chip').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.category-chip').forEach((chip) => chip.classList.toggle('active', chip === button));
  filterProducts();
}));
document.querySelector('#shop-search').addEventListener('input', filterProducts);
function filterProducts() {
  const category = document.querySelector('.category-chip.active').dataset.category;
  const query = document.querySelector('#shop-search').value.trim().toLocaleLowerCase();
  document.querySelectorAll('.product-card').forEach((card) => {
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesSearch = card.querySelector('.product-details h2').textContent.toLocaleLowerCase().includes(query)
      || card.querySelector('.product-maker').textContent.toLocaleLowerCase().includes(query);
    card.hidden = !matchesCategory || !matchesSearch;
  });
}
document.querySelector('#cart-open').addEventListener('click', () => openShopDrawer('cart'));
document.querySelector('#wishlist-open').addEventListener('click', () => openShopDrawer('wishlist'));
document.querySelector('#drawer-close').addEventListener('click', () => {
  document.querySelector('#shop-overlay').hidden = true;
});
document.querySelector('#shop-overlay').addEventListener('click', (event) => {
  if (event.target.id === 'shop-overlay') event.currentTarget.hidden = true;
});
document.querySelector('#price-float-toggle').addEventListener('click', (event) => {
  const panel = document.querySelector('#price-float-panel');
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
});
const pricePanel = document.querySelector('#price-float-panel');
const priceExpandToggle = document.createElement('button');
priceExpandToggle.className = 'price-expand-toggle';
priceExpandToggle.type = 'button';
priceExpandToggle.setAttribute('aria-label', 'Expand pricing calculator');
priceExpandToggle.title = 'Expand to full screen';
priceExpandToggle.textContent = '⛶';
pricePanel.querySelector('.panel-close').before(priceExpandToggle);
function updatePriceExpandToggle() {
  const fullscreen = pricePanel.classList.contains('fullscreen');
  priceExpandToggle.textContent = fullscreen ? '⤡' : '⛶';
  priceExpandToggle.setAttribute('aria-label', fullscreen
    ? (language === 'hi' ? 'छोटे पैनल में दिखाएँ' : 'Show as compact panel')
    : (language === 'hi' ? 'पूरी स्क्रीन में खोलें' : 'Expand to full screen'));
  priceExpandToggle.title = priceExpandToggle.getAttribute('aria-label');
}
priceExpandToggle.addEventListener('click', () => {
  pricePanel.classList.toggle('fullscreen');
  updatePriceExpandToggle();
});
updatePriceExpandToggle();
document.querySelector('.price-float-panel .panel-close').addEventListener('click', () => {
  pricePanel.hidden = true;
  document.querySelector('#price-float-toggle').setAttribute('aria-expanded', 'false');
});
function updateQuickPrice() {
  const amount = ['materials', 'hours', 'hourly', 'packaging']
    .map((field) => Number(document.querySelector(`#quick-${field}`).value) || 0);
  document.querySelector('#quick-price-result').textContent = `₹${Math.ceil(amount[0] + amount[1] * amount[2] + amount[3]).toLocaleString('en-IN')}`;
}
document.querySelectorAll('#price-float-panel input').forEach((input) => input.addEventListener('input', updateQuickPrice));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelector('#shop-overlay').hidden = true;
    pricePanel.hidden = true;
    pricePanel.classList.remove('fullscreen');
    updatePriceExpandToggle();
    document.querySelector('#price-float-toggle').setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('gramvyapar:language', () => {
  updatePriceExpandToggle();
  if (!document.querySelector('#shop-overlay').hidden) {
    const mode = document.querySelector('#drawer-title').textContent.includes('wishlist') || document.querySelector('#drawer-title').textContent.includes('विशलिस्ट')
      ? 'wishlist' : 'cart';
    openShopDrawer(mode);
  }
});
loadUser();
loadAiStatus();
if (localStorage.getItem(sidebarKey) === 'true') document.body.classList.add('sidebar-collapsed');
updateSidebarToggle();
saveShopState();
