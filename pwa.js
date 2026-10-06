(() => {
  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = new URL('app.webmanifest', document.baseURI).href;
  document.head.append(manifest);
  const theme = document.createElement('meta');
  theme.name = 'theme-color';
  theme.content = '#11112f';
  document.head.append(theme);
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = new URL('app-icon.svg', document.baseURI).href;
  icon.type = 'image/svg+xml';
  document.head.append(icon);

  const button = document.createElement('button');
  button.className = 'gramvyapar-install';
  button.type = 'button';
  button.setAttribute('aria-label', 'Install GramVyapar app');
  document.body.append(button);

  const isHindi = () => localStorage.getItem('gramvyapar-language') === 'hi';
  let installPrompt;
  const updateButton = () => {
    const hindi = isHindi();
    button.textContent = installPrompt
      ? (hindi ? 'ऐप इंस्टॉल करें ↓' : 'Install app ↓')
      : (hindi ? 'होम स्क्रीन पर जोड़ें' : 'Add to home screen');
    button.setAttribute('aria-label', hindi ? 'GramVyapar ऐप इंस्टॉल करें' : 'Install GramVyapar app');
  };
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) button.hidden = true;
  updateButton();

  const style = document.createElement('style');
  style.textContent = '.gramvyapar-install{position:fixed;z-index:9000;right:18px;bottom:18px;border:0;border-radius:999px;padding:12px 18px;background:#11112f;color:#fff;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 8px 24px #11112f33;cursor:pointer}.gramvyapar-install:hover{background:#26264d}.gramvyapar-install:focus-visible{outline:3px solid #edb42b;outline-offset:3px}@media(max-width:760px){.gramvyapar-install{right:12px;bottom:12px;font-size:13px}.dashboard-page .gramvyapar-install{bottom:calc(76px + env(safe-area-inset-bottom))}}';
  document.head.append(style);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    updateButton();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    button.hidden = true;
  });
  document.addEventListener('gramvyapar:language', updateButton);
  button.addEventListener('click', async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      updateButton();
      return;
    }
    const message = isHindi()
      ? 'Chrome मेन्यू (⋮) खोलें और “ऐप इंस्टॉल करें” या “होम स्क्रीन पर जोड़ें” चुनें।'
      : 'Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.';
    window.alert(message);
  });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI), { scope: './' })
      .catch((error) => console.error('Could not enable GramVyapar offline support.', error));
  }
})();
