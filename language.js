(() => {
  const key = 'gramvyapar-language';
  let language = localStorage.getItem(key) || 'hi';
  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-en][data-hi]').forEach((element) => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-en-html][data-hi-html]').forEach((element) => {
      element.innerHTML = element.getAttribute(`data-${language}-html`);
    });
    document.querySelectorAll('[data-en-placeholder][data-hi-placeholder]').forEach((element) => {
      element.placeholder = element.getAttribute(`data-${language}-placeholder`);
    });
    document.querySelectorAll('[data-en-aria][data-hi-aria]').forEach((element) => {
      element.setAttribute('aria-label', element.getAttribute(`data-${language}-aria`));
    });
    document.querySelectorAll('[data-en-label][data-hi-label]').forEach((element) => {
      const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (textNode) textNode.textContent = `${element.getAttribute(`data-${language}-label`)} `;
    });
    if (document.body.classList.contains('auth-page')) {
      document.title = language === 'hi'
        ? (document.querySelector('#signup-form') ? 'खाता बनाएँ — GramVyapar' : 'लॉग इन — GramVyapar')
        : (document.querySelector('#signup-form') ? 'Create Account — GramVyapar' : 'Log In — GramVyapar');
    }
    if (document.body.classList.contains('dashboard-page')) {
      document.title = language === 'hi' ? 'GramVyapar — आपका कार्यस्थल' : 'GramVyapar — Your workspace';
    }
    const landingTranslations = {
      '.hero .pill': ['● Digital learning for every artisan', '● हर कारीगर के लिए डिजिटल सीख'],
      '.hero h1': ['Turn your craft into<br><span>a thriving livelihood.</span>', 'अपनी कला को<br><span>आजीविका में बदलें।</span>'],
      '.hero>p': ['GramVyapar connects rural makers with the skills, business confidence, and customers they need to grow — in a language that feels like home.', 'GramVyapar ग्रामीण कारीगरों को कौशल, व्यापार का आत्मविश्वास और ग्राहक पाने में मदद करता है — उनकी अपनी भाषा में।'],
      '.hero-actions .dark-button': ['Get Started Free <b>→</b>', 'मुफ्त शुरू करें <b>→</b>'],
      '.hero-actions .outline-button': ['↪ &nbsp; Log In', '↪ &nbsp; लॉग इन'],
      '.hero-points span': [['✓ Skill assessment', '✓ Business guidance', '✓ Direct selling'], ['✓ कौशल जाँच', '✓ व्यापार मार्गदर्शन', '✓ सीधे बिक्री']],
      '.panel-head b': ['GramVyapar Growth Guide', 'GramVyapar विकास साथी'],
      '.panel-head small': ['PERSONALISED ARTISAN JOURNEY', 'आपकी कारीगरी का सफर'],
      '.panel-focus small:first-child': ['PRIORITY FOCUS', 'मुख्य लक्ष्य'],
      '.panel-focus>b': ['Price your work with confidence', 'अपने काम का सही मूल्य तय करें'],
      '.decision small': [['✦ &nbsp; NEXT BEST STEP'], ['✦ &nbsp; अगला बेहतर कदम']],
      '.decision p': ['Your pottery assessment shows strong craft skills. We’ve added a 15-minute pricing lesson and a local marketplace checklist.', 'आपकी मिट्टी के बर्तन की जाँच में अच्छा कौशल दिखा। हमने मूल्य तय करने का 15 मिनट का पाठ और बाज़ार सूची जोड़ी है।'],
      '.decision a': ['Start next lesson &nbsp;→', 'अगला पाठ शुरू करें &nbsp;→'],
      '.section-intro h2': ['Built for the<br><span>maker in you.</span>', 'आपकी कला<br><span>आपकी पहचान।</span>'],
      '.section-intro h3': ['Everything you need to grow with confidence.', 'आगे बढ़ने के लिए हर ज़रूरी सुविधा।'],
      '.section-intro p': ['From your first assessment to your first direct sale, GramVyapar brings the whole journey together in one simple platform.', 'पहली कौशल जाँच से पहली सीधी बिक्री तक, GramVyapar आपका पूरा सफर एक आसान मंच पर लाता है।'],
      '.feature-grid article h3': [['Personalised skill path', 'Craft + business lessons', 'Progress that feels real', 'Find your customers', 'Know your next step', 'A community that supports you'], ['आपके लिए कौशल योजना', 'हस्तकला और व्यापार पाठ', 'अपनी प्रगति देखें', 'ग्राहक पाएँ', 'अगला कदम जानें', 'सहयोगी समुदाय']],
      '.feature-grid article p': [['Discover your strengths and get a learning plan made for your craft, your pace, and your goals.', 'Learn better making, fair pricing, bookkeeping, branding, photography, and selling in local languages.', 'Track your learning, earn trusted certificates, and see how every lesson moves your work forward.', 'List handmade products on a direct marketplace and keep more of the value you create.', 'Get clear recommendations for mentors, internships, government schemes, and new opportunities.', 'Learn from verified trainers and stories of artisans who are building sustainable incomes.'], ['अपनी खूबियाँ जानें और अपनी कला, रफ्तार और लक्ष्य के अनुसार सीखने की योजना पाएँ।', 'कारीगरी, सही मूल्य, हिसाब-किताब, पहचान, फोटोग्राफी और बिक्री अपनी भाषा में सीखें।', 'सीखने की प्रगति देखें, प्रमाणपत्र पाएँ और हर पाठ के साथ आगे बढ़ें।', 'हस्तनिर्मित उत्पाद सीधे बाज़ार में रखें और अपनी कमाई का अधिक हिस्सा पाएँ।', 'मार्गदर्शक, इंटर्नशिप, सरकारी योजनाओं और नए अवसरों की जानकारी पाएँ।', 'विश्वसनीय प्रशिक्षकों और आगे बढ़ रहे कारीगरों से सीखें।']],
      '.workflow-heading h2': ['One journey.<br><span>Many possibilities.</span>', 'एक सफर।<br><span>अनेक मौके।</span>'],
      '.workflow-heading p': ['Five simple steps designed to take you from raw skill to a stronger, more independent livelihood.', 'कौशल से आत्मनिर्भर आजीविका तक पहुँचने के पाँच आसान कदम।'],
      '.workflow-grid article h3': [['Discover', 'Learn', 'Practice', 'Certify', 'Grow'], ['जानें', 'सीखें', 'अभ्यास करें', 'प्रमाणित हों', 'आगे बढ़ें']],
      '.workflow-grid article p': [['Take a quick assessment to understand your craft and business strengths.', 'Build practical skills through short, local-language lessons.', 'Apply each lesson to your own products and get helpful feedback.', 'Complete your pathway and earn a certificate that proves your progress.', 'Price, list, sell, and connect with opportunities that fit your journey.'], ['अपनी कला और व्यापार की खूबियाँ जानने के लिए छोटी जाँच करें।', 'अपनी भाषा के छोटे पाठों से काम के कौशल सीखें।', 'सीखे हुए को अपने उत्पादों पर आज़माएँ और सुझाव पाएँ।', 'सीख पूरी करके अपनी प्रगति का प्रमाणपत्र पाएँ।', 'सही मूल्य तय करें, बेचें और नए अवसरों से जुड़ें।']],
      '.closing .pill': ['For every hand that creates', 'हर हुनरमंद हाथ के लिए'],
      '.closing h2': ['Your skill already has value.<br><span>Let’s grow it together.</span>', 'आपकी कला अनमोल है।<br><span>आइए, इसे साथ बढ़ाएँ।</span>'],
      '.topbar .logo small,footer .logo small': ['RURAL SKILL ECOSYSTEM', 'ग्रामीण कौशल मंच'],
      'footer p': ['Learn. Make. Earn. — directly from the people who create.', 'सीखें। बनाएँ। कमाएँ। — सीधे बनाने वाले कारीगरों से।'],
      'footer>div>b': [['Platform', 'Account'], ['मंच', 'खाता']],
      'footer>div>a:not(.logo)': [['Learning paths', 'Business toolkit', 'How it works', 'Create account', 'Log in', 'Privacy & terms'], ['सीखने के रास्ते', 'व्यापार के साधन', 'यह कैसे काम करता है', 'खाता बनाएँ', 'लॉग इन', 'नियम और गोपनीयता']]
    };
    Object.entries(landingTranslations).forEach(([selector, values]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const languageIndex = language === 'hi' ? 1 : 0;
        const content = Array.isArray(values[0]) ? values[languageIndex][index] : values[languageIndex];
        if (content !== undefined) element.innerHTML = content;
      });
    });
    document.querySelectorAll('[data-language-toggle]').forEach((button) => {
      button.textContent = language === 'en' ? 'हिंदी' : 'English';
      button.setAttribute('aria-label', language === 'en' ? 'हिंदी में बदलें' : 'Switch to English');
    });
    document.dispatchEvent(new CustomEvent('gramvyapar:language', { detail: { language } }));
  }
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-language-toggle]')) return;
    language = language === 'en' ? 'hi' : 'en';
    localStorage.setItem(key, language);
    applyLanguage();
  });
  applyLanguage();
})();
