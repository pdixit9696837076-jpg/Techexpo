(() => {
  const testFlag = 'gramvyapar-pages-demo-test';
  if (new URLSearchParams(location.search).has('pages-demo')) {
    sessionStorage.setItem(testFlag, 'true');
  }
  const isPages = location.hostname.endsWith('.github.io') || sessionStorage.getItem(testFlag) === 'true';
  if (!isPages) return;

  const keys = {
    users: 'gramvyapar-demo-users',
    session: 'gramvyapar-demo-session',
    otp: 'gramvyapar-demo-otp',
    chats: 'gramvyapar-demo-chats',
    profiles: 'gramvyapar-demo-profiles'
  };
  const originalFetch = window.fetch.bind(window);

  document.querySelectorAll('a[href]').forEach((link) => {
    const target = new URL(link.href, location.href);
    if (target.origin === location.origin && target.pathname.endsWith('.html')) {
      target.searchParams.set('pages-demo', '1');
      link.href = target.href;
    }
  });
  const pwaScript = document.createElement('script');
  pwaScript.src = new URL('pwa.js?v=gramvyapar-app-2', document.baseURI).href;
  document.head.append(pwaScript);
  const jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
  const read = (key, fallback) => {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Could not read presentation demo data (${key}).`, error);
      throw new Error('Demo data is unreadable. Clear this site’s saved data and try again.');
    }
  };
  const currentUser = () => {
    const email = localStorage.getItem(keys.session);
    if (!email) return null;
    return read(keys.users, []).find((user) => user.email === email) || null;
  };
  const hashPassword = async (password) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  };
  const bodyOf = async (init) => {
    if (!init || !init.body) return {};
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  };
  const saveChats = (email, messages) => {
    const chats = read(keys.chats, {});
    chats[email] = messages.slice(-60);
    localStorage.setItem(keys.chats, JSON.stringify(chats));
  };

  const handleApi = async (pathname, init) => {
    const method = (init && init.method || 'GET').toUpperCase();
    const input = await bodyOf(init);

    if (pathname === '/api/signup' && method === 'POST') {
      const name = String(input.name || '').trim();
      const email = String(input.email || '').trim().toLowerCase();
      const phone = String(input.phone || '').replace(/\D/g, '');
      const password = String(input.password || '');
      if (!name || !email || !/^[6-9]\d{9}$/.test(phone) || password.length < 6) {
        return jsonResponse({ error: 'Name, valid email, mobile number and 6+ character password are required.' }, 400);
      }
      const users = read(keys.users, []);
      if (users.some((user) => user.email === email)) {
        return jsonResponse({ error: 'An account with this email already exists.' }, 409);
      }
      if (users.some((user) => user.phone === phone)) {
        return jsonResponse({ error: 'An account with this mobile number already exists.' }, 409);
      }
      users.push({ name, email, phone, passwordHash: await hashPassword(password) });
      localStorage.setItem(keys.users, JSON.stringify(users));
      return jsonResponse({ message: 'Account created.' }, 201);
    }

    if (pathname === '/api/login' && method === 'POST') {
      const email = String(input.email || '').trim().toLowerCase();
      const user = read(keys.users, []).find((account) => account.email === email);
      if (!user || user.passwordHash !== await hashPassword(String(input.password || ''))) {
        return jsonResponse({ error: 'Email or password is incorrect.' }, 401);
      }
      localStorage.setItem(keys.session, user.email);
      return jsonResponse({ message: `Welcome back, ${user.name}!` });
    }

    if (pathname === '/api/otp/request' && method === 'POST') {
      const phone = String(input.phone || '').replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return jsonResponse({ error: 'Enter a valid 10-digit Indian mobile number.' }, 400);
      }
      const user = read(keys.users, []).find((account) => account.phone === phone);
      if (!user) return jsonResponse({ error: 'No account found. Please make your account first.' }, 404);
      const otp = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
      sessionStorage.setItem(keys.otp, JSON.stringify({ phone, otp, expiresAt: Date.now() + 5 * 60_000 }));
      return jsonResponse({ message: 'Demo OTP generated.', demoOtp: otp });
    }

    if (pathname === '/api/otp/verify' && method === 'POST') {
      const savedOtp = readSessionOtp();
      const phone = String(input.phone || '').replace(/\D/g, '');
      const otp = String(input.otp || '');
      if (!savedOtp || savedOtp.phone !== phone || savedOtp.expiresAt <= Date.now() || savedOtp.otp !== otp) {
        return jsonResponse({ error: 'Invalid or expired OTP.' }, 401);
      }
      const user = read(keys.users, []).find((account) => account.phone === phone);
      if (!user) return jsonResponse({ error: 'No account found for this mobile number. Please make your account first.' }, 404);
      sessionStorage.removeItem(keys.otp);
      localStorage.setItem(keys.session, user.email);
      return jsonResponse({ message: 'Mobile number verified. Welcome to GramVyapar!' });
    }

    if (pathname === '/api/me' && method === 'GET') {
      const user = currentUser();
      return user ? jsonResponse({ user: { name: user.name, email: user.email, phone: user.phone } }) : jsonResponse({ error: 'Please log in to continue.' }, 401);
    }

    if (pathname === '/api/profile' && (method === 'GET' || method === 'PUT')) {
      const user = currentUser();
      if (!user) return jsonResponse({ error: 'Please log in to continue.' }, 401);
      const profiles = read(keys.profiles, {});
      if (method === 'GET') return jsonResponse({ profile: profiles[user.email] || null });

      const crafts = ['pottery', 'crochet', 'knitting', 'weaving', 'embroidery', 'bamboo', 'bell-metal', 'tailoring', 'dairy', 'food-processing', 'beauty'];
      const incomes = ['not-earning', 'under-5000', '5000-15000', '15000-30000', 'over-30000', 'prefer-not-to-say'];
      const confidenceLevels = ['beginner', 'learning', 'confident'];
      if (!crafts.includes(input.craft) || !incomes.includes(input.monthlyIncome) || !confidenceLevels.includes(input.businessConfidence)) {
        return jsonResponse({ error: 'Choose a craft, an income range, and a business experience level.' }, 400);
      }
      const profile = {
        craft: input.craft,
        monthlyIncome: input.monthlyIncome,
        businessConfidence: input.businessConfidence
      };
      profiles[user.email] = profile;
      localStorage.setItem(keys.profiles, JSON.stringify(profiles));
      return jsonResponse({ profile });
    }

    if (pathname === '/api/logout' && method === 'POST') {
      localStorage.removeItem(keys.session);
      return jsonResponse({ message: 'Logged out.' });
    }

    if (pathname === '/api/chat/status' && method === 'GET') {
      if (!currentUser()) return jsonResponse({ error: 'Please log in to continue.' }, 401);
      return jsonResponse({ configured: false, demoMode: true });
    }

    if (pathname === '/api/chat/history' && method === 'GET') {
      const user = currentUser();
      if (!user) return jsonResponse({ error: 'Please log in to continue.' }, 401);
      return jsonResponse({ messages: read(keys.chats, {})[user.email] || [] });
    }

    if (pathname === '/api/chat' && method === 'POST') {
      const user = currentUser();
      if (!user) return jsonResponse({ error: 'Please log in to continue.' }, 401);
      const message = String(input.message || '').trim();
      if (!message) return jsonResponse({ error: 'Write a message first.' }, 400);
      const isHindi = input.language === 'hi';
      const answer = isHindi
        ? `नमस्ते ${user.name}! यह प्रेज़ेंटेशन डेमो है, इसलिए AI चैट सर्वर से जुड़ी नहीं है। अपने उत्पाद की कीमत निकालने के लिए मूल्य कैलकुलेटर खोलें।`
        : `Hi ${user.name}! This is a presentation demo, so AI chat is not connected. Open the pricing calculator to estimate your product price.`;
      const chats = read(keys.chats, {});
      saveChats(user.email, [...(chats[user.email] || []), { role: 'user', message }, { role: 'model', message: answer }]);
      return jsonResponse({ answer });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  };

  const readSessionOtp = () => {
    const stored = sessionStorage.getItem(keys.otp);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Could not read the presentation demo OTP.', error);
      throw new Error('Demo OTP is unreadable. Request a new OTP and try again.');
    }
  };

  window.fetch = (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(url.pathname, init).catch((error) => {
        console.error('Presentation demo request failed.', error);
        return jsonResponse({ error: error.message || 'The presentation demo could not complete this request.' }, 500);
      });
    }
    return originalFetch(input, init);
  };
})();
