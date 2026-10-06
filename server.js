const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const root = __dirname;
const envFile = path.join(root, '.env');

function projectEnvironment() {
  const values = {};
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return values;
}

const geminiConfig = () => {
  const values = projectEnvironment();
  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() || values.GEMINI_API_KEY?.trim() || '',
    model: process.env.GEMINI_MODEL?.trim() || values.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
    fastModel: process.env.GEMINI_FAST_MODEL?.trim() || values.GEMINI_FAST_MODEL?.trim() || 'gemini-2.5-flash-lite'
  };
};

const db = new DatabaseSync(path.join(root, 'gramvyapar.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS otp_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

const quickGreetingReply = (message, language, name) => {
  const greeting = message.toLocaleLowerCase('en').trim().replace(/[.!?,。！？]+$/u, '');
  if (!/^(?:hi+|hello+|hey+|namaste|नमस्ते|good morning|good afternoon|good evening)(?:\s+(?:there|gyaan))?$/u.test(greeting)) return null;
  return language === 'hi'
    ? `नमस्ते ${name}! मैं आपकी मदद के लिए यहाँ हूँ। आज आप किस बारे में बात करना चाहेंगे?`
    : `Hi ${name}! I'm here to help. What would you like to work on today?`;
};

const saveChatExchange = (userId, message, answer) => {
  const saveMessage = db.prepare('INSERT INTO chat_messages (user_id, role, message) VALUES (?, ?, ?)');
  db.exec('BEGIN IMMEDIATE');
  try {
    saveMessage.run(userId, 'user', message);
    saveMessage.run(userId, 'model', answer);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const json = (request, response, status, payload, headers = {}) => {
  const origin = request.headers.origin || '*';
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers
  });
  response.end(JSON.stringify(payload));
};

const sessionCookie = (token, maxAge) => `gramvyapar_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

const createSession = (response, userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const maxAge = 7 * 24 * 60 * 60;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(hash(token), userId, Date.now() + maxAge * 1000);
  response.setHeader('Set-Cookie', sessionCookie(token, maxAge));
};

const sessionUser = (request) => {
  const cookie = request.headers.cookie || '';
  const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('gramvyapar_session='))?.slice('gramvyapar_session='.length);
  if (!token) return null;
  const session = db.prepare('SELECT users.id, users.name, users.email, users.phone FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').get(hash(token), Date.now());
  return session || null;
};

const body = (request) => new Promise((resolve, reject) => {
  let data = '';
  request.on('data', (chunk) => {
    data += chunk;
    if (data.length > 20_000) {
      reject(new Error('Request body too large'));
      request.destroy();
    }
  });
  request.on('end', () => {
    try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('Invalid JSON')); }
  });
});

async function api(request, response, pathname) {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.origin || '*';
    response.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return response.end();
  }

  if (pathname === '/api/chat/status' && request.method === 'GET') {
    if (!sessionUser(request)) return json(request, response, 401, { error: 'Please log in to continue.' });
    const config = geminiConfig();
    return json(request, response, 200, { configured: Boolean(config.apiKey), model: config.model, fastModel: config.fastModel });
  }
  if (pathname === '/api/me' && request.method === 'GET') {
    const user = sessionUser(request);
    return user ? json(request, response, 200, { user }) : json(request, response, 401, { error: 'Please log in to continue.' });
  }
  if (pathname === '/api/logout' && request.method === 'POST') {
    const cookie = request.headers.cookie || '';
    const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('gramvyapar_session='))?.slice('gramvyapar_session='.length);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash(token));
    return json(request, response, 200, { message: 'Logged out.' }, { 'Set-Cookie': sessionCookie('', 0) });
  }
  if (pathname === '/api/chat/history' && request.method === 'GET') {
    const user = sessionUser(request);
    if (!user) return json(request, response, 401, { error: 'Please log in to continue.' });
    const messages = db.prepare('SELECT role, message, created_at AS createdAt FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 60').all(user.id).reverse();
    return json(request, response, 200, { messages });
  }
  if (pathname === '/api/chat' && request.method === 'POST') {
    const user = sessionUser(request);
    if (!user) return json(request, response, 401, { error: 'Please log in to continue.' });
    try {
      const input = await body(request);
      const message = String(input.message || '').trim();
      const isHindi = input.language === 'hi';
      const language = isHindi ? 'Hindi' : 'English';
      if (!message) return json(request, response, 400, { error: 'Write a message first.' });
      if (message.length > 4_000) return json(request, response, 413, { error: 'Message is too long. Please keep it under 4,000 characters.' });

      const greetingReply = quickGreetingReply(message, isHindi ? 'hi' : 'en', user.name);
      if (greetingReply) {
        saveChatExchange(user.id, message, greetingReply);
        return json(request, response, 200, { answer: greetingReply });
      }

      const config = geminiConfig();
      if (!config.apiKey) {
        return json(request, response, 503, { error: 'AI is not configured yet. Add your Gemini key to the project .env file, then refresh the dashboard.' });
      }

      const recent = db.prepare('SELECT role, message FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 4').all(user.id).reverse();
      const contents = [...recent, { role: 'user', message }].map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.message }]
      }));
      const models = [...new Set([config.model, config.fastModel])];
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are Gyaan, a friendly, practical assistant in GramVyapar for rural artisans. Help with crafts, pricing, bookkeeping, product photos, branding, online selling, and general questions. Be concise and direct: usually 2-4 short sentences or up to 3 bullets. Reply in ${language}; use Devanagari for Hindi. Address the user as ${user.name}. Never claim to submit applications, contact people, or verify eligibility. For current schemes or legal, medical, financial, or safety matters, state limits and recommend official or qualified sources. If unsure, say so.`
            }]
          },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 400, thinkingConfig: { thinkingLevel: 'LOW' } }
        })
      };
      const controllers = models.map(() => new AbortController());
      const timeouts = controllers.map((controller) => setTimeout(
        () => controller.abort(new DOMException('The AI took too long to respond.', 'TimeoutError')),
        8_000
      ));
      let answer;
      try {
        const attempts = models.map(async (requestModel, index) => {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(requestModel)}:generateContent`,
            { ...requestOptions, signal: controllers[index].signal }
          );
          let result;
          try {
            result = await geminiResponse.json();
          } catch {
            throw Object.assign(new Error('Gemini returned an invalid response.'), { status: 502 });
          }
          if (!geminiResponse.ok) {
            throw Object.assign(new Error('Gemini request failed.'), { status: geminiResponse.status });
          }
          const modelAnswer = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
          if (!modelAnswer) throw Object.assign(new Error('Gemini returned an empty response.'), { status: 502 });
          return modelAnswer;
        });
        answer = await Promise.any(attempts);
      } catch (error) {
        const failures = error.errors || [error];
        if (failures.every((failure) => failure.name === 'TimeoutError')) {
          return json(request, response, 504, { error: 'The AI took too long to respond. Please try again.' });
        }
        if (failures.some((failure) => failure.status === 429)) {
          return json(request, response, 429, { error: 'AI is busy right now. Please wait a moment and try again.' });
        }
        if (failures.some((failure) => failure.status === 401 || failure.status === 403)) {
          return json(request, response, 502, { error: 'Gemini rejected the API key. Check GEMINI_API_KEY in the project .env file.' });
        }
        if (failures.some((failure) => failure.status === 503)) {
          return json(request, response, 503, { error: 'Gemini is temporarily overloaded. Please wait a minute and try again.' });
        }
        return json(request, response, 502, { error: 'The AI could not answer right now. Please try again shortly.' });
      } finally {
        timeouts.forEach(clearTimeout);
        controllers.forEach((controller) => controller.abort());
      }

      saveChatExchange(user.id, message, answer);
      return json(request, response, 200, { answer });
    } catch (error) {
      if (error.name === 'TimeoutError') return json(request, response, 504, { error: 'The AI took too long to respond. Please try again.' });
      return json(request, response, 500, { error: 'Could not send your message. Please try again.' });
    }
  }
  try {
    const input = await body(request);
    if (pathname === '/api/signup' && request.method === 'POST') {
      const name = String(input.name || '').trim();
      const email = String(input.email || '').trim().toLowerCase();
      const phone = String(input.phone || '').replace(/\D/g, '');
      const password = String(input.password || '');
      if (!name || !email || !/^[6-9]\d{9}$/.test(phone) || password.length < 6) return json(request, response, 400, { error: 'Name, valid email, mobile number and 6+ character password are required.' });
      const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (exists) return json(request, response, 409, { error: 'An account with this email already exists.' });
      const phoneExists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      if (phoneExists) return json(request, response, 409, { error: 'An account with this mobile number already exists.' });
      db.prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)').run(name, email, phone, hash(password));
      return json(request, response, 201, { message: 'Account created.' });
    }
    if (pathname === '/api/login' && request.method === 'POST') {
      const email = String(input.email || '').trim().toLowerCase();
      const user = db.prepare('SELECT id, name, password_hash FROM users WHERE email = ?').get(email);
      if (!user || user.password_hash !== hash(String(input.password || ''))) return json(request, response, 401, { error: 'Email or password is incorrect.' });
      createSession(response, user.id);
      return json(request, response, 200, { message: `Welcome back, ${user.name}!` });
    }
    if (pathname === '/api/otp/request' && request.method === 'POST') {
      const phone = String(input.phone || '').replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(phone)) return json(request, response, 400, { error: 'Enter a valid 10-digit Indian mobile number.' });
      const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      if (!existing) return json(request, response, 404, { error: 'No account found. Please make your account first.' });
      const otp = String(crypto.randomInt(100000, 1000000));
      db.prepare('INSERT INTO otp_requests (phone, otp_hash, expires_at) VALUES (?, ?, ?)').run(phone, hash(otp), Date.now() + 5 * 60 * 1000);
      console.log(`[DEMO OTP] +91${phone}: ${otp}`);
      return json(request, response, 200, { message: 'OTP generated.', demoOtp: otp });
    }
    if (pathname === '/api/otp/verify' && request.method === 'POST') {
      const phone = String(input.phone || '').replace(/\D/g, '');
      const otp = String(input.otp || '');
      const requestRow = db.prepare('SELECT id, otp_hash FROM otp_requests WHERE phone = ? AND used = 0 AND expires_at > ? ORDER BY id DESC LIMIT 1').get(phone, Date.now());
      if (!requestRow || requestRow.otp_hash !== hash(otp)) return json(request, response, 401, { error: 'Invalid or expired OTP.' });
      db.prepare('UPDATE otp_requests SET used = 1 WHERE id = ?').run(requestRow.id);
      const existing = db.prepare('SELECT name FROM users WHERE phone = ?').get(phone);
      if (!existing) return json(request, response, 404, { error: 'No account found for this mobile number. Please make your account first.' });
      const user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      createSession(response, user.id);
      return json(request, response, 200, { message: 'Mobile number verified. Welcome to GramVyapar!' });
    }
    return json(request, response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(request, response, 500, { error: 'Something went wrong on the server.' });
  }
}

const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png' };
const defaultPort = Number(process.env.PORT) || 3000;

const startServer = (port) => {
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, `http://localhost:${port}`).pathname;
    if (pathname.startsWith('/api/')) return api(request, response, pathname);
    const requested = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
    const file = path.join(root, requested);
    if (!file.startsWith(root) || !fs.existsSync(file)) return json(request, response, 404, { error: 'Not found' });
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < 3010) {
      console.warn(`Port ${port} is busy. Trying http://localhost:${port + 1} instead...`);
      startServer(port + 1);
      return;
    }
    console.error(`Failed to start GramVyapar on port ${port}:`, error.message);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`GramVyapar running at http://localhost:${port}`);
  });
};

startServer(defaultPort);