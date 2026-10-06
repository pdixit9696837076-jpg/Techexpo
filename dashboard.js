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
const artisanCrafts = [
  { id: 'pottery', en: 'Pottery: clay work & terracotta', hi: 'मिट्टी के बर्तन: मिट्टी का काम और टेराकोटा', name: { en: 'Pottery', hi: 'मिट्टी का काम' }, photo: 'artisan-pottery.jpg', alt: { en: 'Artisan shaping a clay pot on a pottery wheel', hi: 'चाक पर मिट्टी का बर्तन बनाते कारीगर' } },
  { id: 'crochet', en: 'Crochet: coasters, bags & home decor', hi: 'क्रोशे: कोस्टर, बैग और होम डेकोर', name: { en: 'Crochet', hi: 'क्रोशे' }, photo: 'artisan-crochet.jpg', alt: { en: 'Artisan making a colourful crochet craft', hi: 'रंगीन क्रोशे बनाते कारीगर' } },
  { id: 'knitting', en: 'Knitting: sweaters, mufflers & socks', hi: 'निटिंग: स्वेटर, मफलर और मोज़े', name: { en: 'Knitting', hi: 'निटिंग' }, photo: 'artisan-knitting.jpg', alt: { en: 'Hands knitting a colourful woollen textile', hi: 'रंगीन ऊनी कपड़ा बुनते हाथ' } },
  { id: 'weaving', en: 'Weaving & handloom: sarees, stoles & textiles', hi: 'बुनाई और हैंडलूम: साड़ी, स्टोल और कपड़ा', name: { en: 'Weaving', hi: 'बुनाई' }, photo: 'artisan-knitting.jpg', alt: { en: 'Handmade textile work with colourful yarn', hi: 'रंगीन धागों से हाथ से कपड़ा बनाते कारीगर' } },
  { id: 'embroidery', en: 'Embroidery & Aari work', hi: 'एम्ब्रॉइडरी और आरी काम', name: { en: 'Embroidery', hi: 'कढ़ाई' }, photo: 'artisan-tailoring.jpg', alt: { en: 'Artisan sewing and decorating handmade clothing', hi: 'हाथ से कपड़ों पर कढ़ाई और सिलाई करते कारीगर' } },
  { id: 'bamboo', en: 'Bamboo & cane craft', hi: 'बांस और केन क्राफ्ट', name: { en: 'Bamboo & cane craft', hi: 'बांस और केन क्राफ्ट' }, photo: 'artisan-bamboo.jpg', alt: { en: 'Artisan weaving bamboo and cane baskets', hi: 'बांस और केन की टोकरियाँ बनाते कारीगर' } },
  { id: 'bell-metal', en: 'Bell metal & lacquerware', hi: 'बेल मेटल और लैकरवेयर', name: { en: 'Bell metal', hi: 'बेल मेटल' }, photo: 'artisan-pottery.jpg', alt: { en: 'Traditional artisan shaping a handmade craft', hi: 'पारंपरिक हस्तकला बनाते कारीगर' } },
  { id: 'tailoring', en: 'Tailoring & stitching', hi: 'टेलरिंग और कढ़ाई/सीवन', name: { en: 'Tailoring', hi: 'टेलरिंग' }, photo: 'artisan-tailoring.jpg', alt: { en: 'Tailor stitching colourful fabric on a sewing machine', hi: 'सिलाई मशीन पर कपड़ा सिलते दर्ज़ी' } },
  { id: 'dairy', en: 'Dairy value-added products', hi: 'डेयरी वैल्यू एडेड प्रोडक्ट', name: { en: 'Dairy products', hi: 'डेयरी उत्पाद' }, photo: 'artisan-food-processing.jpg', alt: { en: 'Artisans preparing food products together', hi: 'मिलकर खाद्य उत्पाद बनाते कारीगर' } },
  { id: 'food-processing', en: 'Food processing: pickles, papad & snacks', hi: 'खाद्य प्रसंस्करण: आचार, पापड़ और नाश्ता', name: { en: 'Food processing', hi: 'खाद्य प्रसंस्करण' }, photo: 'artisan-food-processing.jpg', alt: { en: 'Artisans preparing fresh produce for food processing', hi: 'खाद्य प्रसंस्करण के लिए सब्ज़ियाँ तैयार करते कारीगर' } },
  { id: 'beauty', en: 'Beauty & wellness services', hi: 'सौंदर्य और स्वस्थ्य सेवा', name: { en: 'Beauty & wellness', hi: 'सौंदर्य और वेलनेस' }, photo: 'artisan-beauty.jpg', alt: { en: 'Artisan providing a traditional beauty service', hi: 'पारंपरिक सौंदर्य सेवा देती कारीगर' } }
];
const incomeOptions = [
  { id: 'not-earning', en: 'I am not earning yet', hi: 'अभी कमाई शुरू नहीं हुई है' },
  { id: 'under-5000', en: 'Less than ₹5,000', hi: '₹5,000 से कम' },
  { id: '5000-15000', en: '₹5,000–₹15,000', hi: '₹5,000–₹15,000' },
  { id: '15000-30000', en: '₹15,000–₹30,000', hi: '₹15,000–₹30,000' },
  { id: 'over-30000', en: 'More than ₹30,000', hi: '₹30,000 से ज़्यादा' },
  { id: 'prefer-not-to-say', en: 'Prefer not to say', hi: 'बताने की इच्छा नहीं है' }
];
const confidenceOptions = [
  { id: 'beginner', en: 'I am just starting out', hi: 'मैं अभी शुरुआत कर रहा/रही हूँ' },
  { id: 'learning', en: 'I know a little and want to learn more', hi: 'थोड़ा जानता/जानती हूँ और आगे सीखना चाहता/चाहती हूँ' },
  { id: 'confident', en: 'I feel confident about pricing and selling', hi: 'मुझे कीमत तय करने और बेचने का अच्छा अनुभव है' }
];
const shopProductPhotos = {
  'blue-pot': { src: 'shop-blue-pottery.jpg', en: 'Blue pottery vase', hi: 'नीली मिट्टी का फूलदान' },
  'woven-stole': { src: 'shop-handwoven-stole.jpg', en: 'Handwoven cotton stole', hi: 'हाथ से बुना सूती स्टोल' },
  'terracotta-lamp': { src: 'shop-terracotta-lamp.jpg', en: 'Terracotta table lamp', hi: 'टेराकोटा टेबल लैंप' },
  'woven-basket': { src: 'shop-bamboo-basket.jpg', en: 'Woven bamboo basket', hi: 'बाँस की बुनी टोकरी' }
};
let artisanProfile = null;
let requireProfileSetup = false;
let profileDialog;
let profileForm;
let profileError;

function buildArtisanProfileUi() {
  const profileCard = document.querySelector('.artisan-profile-card');
  profileCard.innerHTML = '<p class="eyebrow" id="profile-card-eyebrow"></p><span class="tip-icon">✦</span><h2 id="profile-card-title"></h2><p id="profile-card-summary"></p><button class="inline-link" id="edit-artisan-profile" type="button"></button>';

  profileDialog = document.createElement('dialog');
  profileDialog.className = 'artisan-setup';
  profileDialog.setAttribute('aria-labelledby', 'artisan-setup-title');
  profileDialog.innerHTML = `
    <p class="eyebrow" id="artisan-setup-eyebrow"></p>
    <h2 id="artisan-setup-title"></h2>
    <p class="artisan-setup-intro" id="artisan-setup-intro"></p>
    <form id="artisan-setup-form">
      <label for="artisan-craft"><span id="artisan-craft-label"></span><select id="artisan-craft" name="craft" required></select></label>
      <label for="artisan-income"><span id="artisan-income-label"></span><select id="artisan-income" name="monthlyIncome" required></select></label>
      <label for="artisan-confidence"><span id="artisan-confidence-label"></span><select id="artisan-confidence" name="businessConfidence" required></select></label>
      <p class="artisan-setup-error" id="artisan-setup-error" role="alert"></p>
      <div class="artisan-setup-actions"><button class="small-primary" id="artisan-setup-submit" type="submit"></button><button class="artisan-setup-cancel" id="artisan-setup-cancel" type="button"></button></div>
    </form>`;
  document.body.append(profileDialog);
  profileForm = profileDialog.querySelector('#artisan-setup-form');
  profileError = profileDialog.querySelector('#artisan-setup-error');

  document.querySelector('#edit-artisan-profile').addEventListener('click', () => openProfileSetup(false));
  document.querySelector('#artisan-setup-cancel').addEventListener('click', () => profileDialog.close());
  profileDialog.addEventListener('cancel', (event) => {
    if (requireProfileSetup) event.preventDefault();
  });
  profileForm.addEventListener('submit', saveArtisanProfile);
  updateProfileLanguage();
}

function updateProfileLanguage() {
  const text = language === 'hi'
    ? {
        cardEyebrow: 'आपकी कारीगरी और कारोबार',
        cardTitle: artisanProfile ? `आपकी ${getCraftName(artisanProfile.craft, 'hi')} की यात्रा` : 'अपनी कारीगरी से आगे बढ़ें।',
        cardSummary: artisanProfile
          ? `महीने की कमाई: ${getOptionName(incomeOptions, artisanProfile.monthlyIncome, 'hi')} · कारोबार का अनुभव: ${getOptionName(confidenceOptions, artisanProfile.businessConfidence, 'hi')}`
          : 'अपनी कला, कमाई और कारोबार के अनुभव के अनुसार सीखने और मदद पाने के लिए प्रोफ़ाइल भरें।',
        edit: 'जवाब बदलें →',
        setupEyebrow: 'आपका कारीगर सफर',
        setupTitle: 'आपका काम और कारोबार समझें',
        intro: 'आपके जवाबों से हम आपकी कला और ज़रूरत के मुताबिक सीखने के सुझाव देंगे।',
        craft: 'आपका मुख्य हुनर या काम क्या है?',
        income: 'आपकी औसत महीने की कमाई कितनी है?',
        confidence: 'कीमत तय करने और बेचने में आपका अनुभव कितना है?',
        placeholder: 'एक विकल्प चुनें',
        submit: 'प्रोफ़ाइल सहेजें और आगे बढ़ें',
        cancel: 'रद्द करें',
      }
    : {
        cardEyebrow: 'YOUR CRAFT & BUSINESS',
        cardTitle: artisanProfile ? `Your ${getCraftName(artisanProfile.craft, 'en')} journey` : 'Grow your craft with confidence.',
        cardSummary: artisanProfile
          ? `Monthly earnings: ${getOptionName(incomeOptions, artisanProfile.monthlyIncome, 'en')} · Business experience: ${getOptionName(confidenceOptions, artisanProfile.businessConfidence, 'en')}`
          : 'Set up your profile for learning and guidance that reflects your craft, earnings and business experience.',
        edit: 'Update your answers →',
        setupEyebrow: 'YOUR ARTISAN JOURNEY',
        setupTitle: 'Tell us about your work',
        intro: 'Your answers help us tailor learning and business guidance to your craft and needs.',
        craft: 'What is your main craft or line of work?',
        income: 'About how much do you earn in a typical month?',
        confidence: 'How confident are you with pricing and selling?',
        placeholder: 'Choose an option',
        submit: 'Save profile and continue',
        cancel: 'Cancel',
      };
  document.querySelector('#profile-card-eyebrow').textContent = text.cardEyebrow;
  document.querySelector('#profile-card-title').textContent = text.cardTitle;
  document.querySelector('#profile-card-summary').textContent = text.cardSummary;
  document.querySelector('#edit-artisan-profile').textContent = text.edit;
  document.querySelector('#artisan-setup-eyebrow').textContent = text.setupEyebrow;
  document.querySelector('#artisan-setup-title').textContent = text.setupTitle;
  document.querySelector('#artisan-setup-intro').textContent = text.intro;
  document.querySelector('#artisan-craft-label').textContent = text.craft;
  document.querySelector('#artisan-income-label').textContent = text.income;
  document.querySelector('#artisan-confidence-label').textContent = text.confidence;
  document.querySelector('#artisan-setup-submit').textContent = text.submit;
  document.querySelector('#artisan-setup-cancel').textContent = text.cancel;
  [
    ['#artisan-craft', artisanCrafts],
    ['#artisan-income', incomeOptions],
    ['#artisan-confidence', confidenceOptions]
  ].forEach(([selector, options]) => {
    const select = profileDialog.querySelector(selector);
    const previousValue = select.value;
    select.replaceChildren(new Option(text.placeholder, ''));
    options.forEach((option) => select.add(new Option(option[language], option.id)));
    if (options.some((option) => option.id === previousValue)) select.value = previousValue;
  });
  if (artisanProfile) renderArtisanProfile(artisanProfile);
}

function getCraftName(craftId, selectedLanguage) {
  const craft = artisanCrafts.find((item) => item.id === craftId);
  return craft ? craft.name[selectedLanguage] : '';
}

function getOptionName(options, optionId, selectedLanguage) {
  return options.find((option) => option.id === optionId)?.[selectedLanguage] || '';
}

function prepareLessonPhotos() {
  document.querySelectorAll('.learning-card').forEach((card) => {
    const lesson = artisanCrafts.find((craft) => craft.en === card.querySelector('h2').dataset.en);
    if (!lesson) return;
    card.dataset.craft = lesson.id;
    const image = card.querySelector('img');
    image.src = `reference-assets/${lesson.photo}`;
    image.alt = lesson.alt[language];
    image.loading = 'lazy';
    image.decoding = 'async';
  });
  const nextLessonImage = document.querySelector('.lesson-row img');
  nextLessonImage.src = 'reference-assets/artisan-pottery.jpg';
  nextLessonImage.alt = artisanCrafts[0].alt[language];
  nextLessonImage.loading = 'lazy';
  nextLessonImage.decoding = 'async';
}

function buildCertificatePreviews() {
  const quickLinks = document.querySelector('.quick-links');
  const previews = document.createElement('section');
  previews.className = 'certificate-previews';
  previews.setAttribute('aria-labelledby', 'certificate-previews-title');
  previews.innerHTML = `
    <div class="certificate-heading">
      <div>
        <p class="eyebrow" data-en="SAMPLE TEMPLATES — PREVIEW ONLY" data-hi="नमूना डिज़ाइन — केवल पूर्वावलोकन">SAMPLE TEMPLATES — PREVIEW ONLY</p>
        <h2 id="certificate-previews-title" data-en="Certificate designs" data-hi="प्रमाणपत्र डिज़ाइन">Certificate designs</h2>
      </div>
      <p data-en="These are sample designs, not earned credentials." data-hi="ये नमूना डिज़ाइन हैं, अर्जित प्रमाणपत्र नहीं।">These are sample designs, not earned credentials.</p>
    </div>
    <div class="certificate-grid">
      <article class="certificate-card">
        <span class="certificate-seal" aria-hidden="true">✦</span>
        <span class="certificate-label" data-en="CRAFT LEARNING · SAMPLE" data-hi="हस्तकला सीखना · नमूना">CRAFT LEARNING · SAMPLE</span>
        <h3 data-en="Craft Foundations" data-hi="हस्तकला की बुनियाद">Craft Foundations</h3>
        <p data-en="A preview of a certificate design for a craft-learning path." data-hi="हस्तकला सीखने के पाठ्यक्रम के प्रमाणपत्र डिज़ाइन का नमूना।">A preview of a certificate design for a craft-learning path.</p>
        <small data-en="PREVIEW ONLY · NOT EARNED" data-hi="केवल नमूना · अर्जित नहीं">PREVIEW ONLY · NOT EARNED</small>
      </article>
      <article class="certificate-card certificate-card-business">
        <span class="certificate-seal" aria-hidden="true">₹</span>
        <span class="certificate-label" data-en="BUSINESS LEARNING · SAMPLE" data-hi="व्यापार सीखना · नमूना">BUSINESS LEARNING · SAMPLE</span>
        <h3 data-en="Digital Selling Basics" data-hi="डिजिटल बिक्री की बुनियाद">Digital Selling Basics</h3>
        <p data-en="A preview of a certificate design for selling skills." data-hi="बिक्री कौशल के प्रमाणपत्र डिज़ाइन का नमूना।">A preview of a certificate design for selling skills.</p>
        <small data-en="PREVIEW ONLY · NOT EARNED" data-hi="केवल नमूना · अर्जित नहीं">PREVIEW ONLY · NOT EARNED</small>
      </article>
    </div>`;
  quickLinks.before(previews);
}

function prepareProductPhotos() {
  document.querySelectorAll('.product-card').forEach((card) => {
    const product = shopProductPhotos[card.dataset.product];
    if (!product) return;
    const image = document.createElement('img');
    image.src = `reference-assets/${product.src}`;
    image.alt = language === 'hi' ? product.hi : product.en;
    image.loading = 'lazy';
    image.decoding = 'async';
    card.querySelector('.product-art').replaceChildren(image);
  });
}

function openProfileSetup(required) {
  requireProfileSetup = required;
  document.querySelector('#artisan-setup-cancel').hidden = required;
  profileError.textContent = '';
  profileForm.elements.craft.value = artisanProfile?.craft || '';
  profileForm.elements.monthlyIncome.value = artisanProfile?.monthlyIncome || '';
  profileForm.elements.businessConfidence.value = artisanProfile?.businessConfidence || '';
  if (!profileDialog.open) profileDialog.showModal();
}

function renderArtisanProfile(profile) {
  const craft = artisanCrafts.find((item) => item.id === profile.craft);
  if (!craft) return;
  const lesson = document.querySelector(`.learning-card[data-craft="${profile.craft}"]`);
  if (lesson) {
    const lessonGrid = lesson.parentElement;
    lessonGrid.prepend(lesson);
    const lessonImage = lesson.querySelector('img');
    const homeLesson = document.querySelector('.next-card .lesson-row');
    homeLesson.querySelector('img').src = lessonImage.src;
    homeLesson.querySelector('img').alt = lessonImage.alt;
    homeLesson.querySelector('.lesson-tag').textContent = language === 'hi' ? 'आपकी कला · सुझाया गया पाठ' : 'YOUR CRAFT · SUGGESTED LESSON';
    homeLesson.querySelector('h3').textContent = craft[language];
    homeLesson.querySelector('p').textContent = language === 'hi' ? 'आपके हुनर के अनुसार चुना गया पाठ' : 'A lesson selected for your craft';
  }
  document.querySelector('#profile-card-title').textContent = language === 'hi'
    ? `आपकी ${craft.name.hi} की यात्रा`
    : `Your ${craft.name.en} journey`;
  document.querySelector('#profile-card-summary').textContent = language === 'hi'
    ? `महीने की कमाई: ${getOptionName(incomeOptions, profile.monthlyIncome, language)} · कारोबार का अनुभव: ${getOptionName(confidenceOptions, profile.businessConfidence, language)}`
    : `Monthly earnings: ${getOptionName(incomeOptions, profile.monthlyIncome, language)} · Business experience: ${getOptionName(confidenceOptions, profile.businessConfidence, language)}`;
}

async function saveArtisanProfile(event) {
  event.preventDefault();
  if (!profileForm.reportValidity()) return;
  const submit = document.querySelector('#artisan-setup-submit');
  submit.disabled = true;
  profileError.textContent = '';
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        craft: profileForm.elements.craft.value,
        monthlyIncome: profileForm.elements.monthlyIncome.value,
        businessConfidence: profileForm.elements.businessConfidence.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save your profile.');
    artisanProfile = data.profile;
    renderArtisanProfile(artisanProfile);
    requireProfileSetup = false;
    profileDialog.close();
  } catch (error) {
    console.error('Could not save the artisan profile.', error);
    profileError.textContent = error.message || 'Could not save your profile. Please try again.';
  } finally {
    submit.disabled = false;
  }
}

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
  const profileResponse = await fetch('/api/profile');
  if (!profileResponse.ok) throw new Error('Could not load your artisan profile. Please refresh and try again.');
  const { profile } = await profileResponse.json();
  if (profile) {
    requireProfileSetup = false;
    artisanProfile = profile;
    renderArtisanProfile(profile);
  } else {
    openProfileSetup(true);
  }
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
    status.textContent = data.demoMode
      ? (language === 'hi' ? 'डेमो: AI चैट बंद है' : 'Demo: AI chat is off')
      : data.configured
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
  updateProfileLanguage();
  document.querySelectorAll('.learning-card').forEach((card) => {
    const craft = artisanCrafts.find((item) => item.id === card.dataset.craft);
    if (craft) card.querySelector('img').alt = craft.alt[language];
  });
  document.querySelector('.lesson-row img').alt = artisanCrafts[0].alt[language];
  document.querySelectorAll('.product-card').forEach((card) => {
    const image = card.querySelector('.product-art img');
    const product = shopProductPhotos[card.dataset.product];
    if (image && product) image.alt = product[language];
  });
});
menuToggle.addEventListener('click', () => {
  document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem(sidebarKey, String(document.body.classList.contains('sidebar-collapsed')));
  updateSidebarToggle();
});
window.addEventListener('resize', updateSidebarToggle);
document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.replace(location.hostname.endsWith('.github.io') ? 'login.html?pages-demo=1' : 'login.html');
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
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelector('#shop-overlay').hidden = true;
  }
});
document.addEventListener('gramvyapar:language', () => {
  if (!document.querySelector('#shop-overlay').hidden) {
    const mode = document.querySelector('#drawer-title').textContent.includes('wishlist') || document.querySelector('#drawer-title').textContent.includes('विशलिस्ट')
      ? 'wishlist' : 'cart';
    openShopDrawer(mode);
  }
});
buildArtisanProfileUi();
buildCertificatePreviews();
prepareLessonPhotos();
prepareProductPhotos();
loadUser().catch((error) => {
  console.error('Could not load the artisan dashboard.', error);
  openProfileSetup(true);
  profileError.textContent = error.message || 'Could not load your artisan profile. Please refresh and try again.';
});
loadAiStatus();
if (localStorage.getItem(sidebarKey) === 'true') document.body.classList.add('sidebar-collapsed');
updateSidebarToggle();
saveShopState();
