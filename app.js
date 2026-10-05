(() => {
  'use strict';

  const { config, copy, fonts, screens, themes } = window.SuperKeyboard;
  const root = document.documentElement;
  const query = new URLSearchParams(location.search);
  const systemAppearance = matchMedia('(prefers-color-scheme: dark)');
  const featured = ['latte', 'lilac', 'tide', 'bauhaus', 'arcade', 'typewriter'];
  const categories = ['all', 'soft', 'minimal', 'classic', 'colorful'];
  const get = id => document.getElementById(id);
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) { /* Storage is optional. */ } };
  const preferredLanguage = query.get('lang') || read('sk-web-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
  let language = preferredLanguage === 'zh' ? 'zh' : 'en';
  let selectedTheme = 'latte';
  let selectedFont = 'caveat';
  let selectedScreen = 0;
  let category = 'all';
  let expanded = false;
  const preferredAppearance = query.get('theme') || read('sk-web-theme');
  let followsSystemAppearance = preferredAppearance !== 'light' && preferredAppearance !== 'dark';

  const local = pair => pair[language === 'zh' ? 0 : 1];
  const t = (key, vars = {}) => {
    let value = local(copy[key]);
    for (const [name, replacement] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, replacement);
    return value;
  };
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const isDark = () => root.dataset.theme === 'dark';

  function updateAppearanceAssets() {
    get('site-favicon').href = isDark() ? 'assets/favicon-dark.png' : 'assets/favicon-light.png';
    document.querySelector('meta[name="theme-color"]').content = isDark() ? '#17211b' : '#f7f7ef';
  }

  // Same 4.5:1 legend rule as the native app. Colors below come from its catalog.
  function luminance(hex) {
    const values = hex.replace('#', '').match(/.{2}/g).map(v => parseInt(v, 16) / 255);
    const [r, g, b] = values.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) {
    const values = [luminance(a), luminance(b)];
    return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
  }
  function readable(legend, background) {
    if (contrast(legend, background) >= 4.5) return legend;
    return contrast('000000', background) > contrast('FFFFFF', background) ? '000000' : 'FFFFFF';
  }
  const fontFamily = id => fonts.find(font => font.id === id)?.family || 'Outfit';

  function keyboard(theme, dark) {
    const board = create('div', `keyboard ${theme.style}`);
    const colors = dark ? theme.dark : theme.light;
    const [background, key, fn, accent, legend, accentLegend] = colors;
    const properties = {
      'bg': background, 'key': key, 'fn': fn, 'accent': accent,
      'legend': readable(legend, key), 'fn-legend': readable(legend, fn),
      'accent-legend': readable(accentLegend, accent)
    };
    for (const [name, value] of Object.entries(properties)) board.style.setProperty(`--kb-${name}`, `#${value}`);
    board.style.setProperty('--kb-font', `"${fontFamily(theme.font)}", sans-serif`);
    if (theme.gradient) board.style.background = `linear-gradient(145deg, #${background}, #${theme.gradient[dark ? 1 : 0]})`;
    board.setAttribute('role', 'img');
    board.setAttribute('aria-label', t('themes.demo', { name: local(theme.name) }));
    const rows = [
      [...'QWERTYUIOP'],
      [...'ASDFGHJKL'],
      [{ label: '⇧', kind: 'function' }, ...'ZXCVBNM', { label: '⌫', kind: 'function' }],
      [{ label: '123', kind: 'function' }, { label: '◎', kind: 'function' }, { label: t('key.space'), kind: 'space' }, { label: t('key.return'), kind: 'return' }]
    ];
    for (const keys of rows) {
      const row = create('div', 'key-row');
      row.setAttribute('aria-hidden', 'true');
      for (const key of keys) row.append(create('span', `key ${key.kind || ''}`, key.label || key));
      board.append(row);
    }
    return board;
  }

  function renderHero() {
    const theme = themes.find(item => item.id === selectedTheme);
    const board = keyboard(theme, isDark());
    board.id = 'hero-board';
    board.classList.add('keyboard-hero');
    get('hero-board').replaceWith(board);
    get('hero-theme-name').textContent = local(theme.name);
    get('hero-theme-number').textContent = `${String(themes.indexOf(theme) + 1).padStart(2, '0')} / 24`;
    get('hero-accent').style.background = `#${(isDark() ? theme.dark : theme.light)[3]}`;
    const swatches = featured.map(id => {
      const item = themes.find(theme => theme.id === id);
      const button = create('button', 'swatch-button');
      button.type = 'button';
      button.dataset.themeId = id;
      button.setAttribute('aria-label', t('themes.preview', { name: local(item.name) }));
      button.setAttribute('aria-pressed', String(id === selectedTheme));
      const circle = create('span');
      circle.style.background = `#${(isDark() || item.darkPreview ? item.dark : item.light)[3]}`;
      button.append(circle);
      return button;
    });
    get('hero-swatches').replaceChildren(...swatches);
  }

  function renderGallery() {
    get('category-tabs').replaceChildren(...categories.map(id => {
      const button = create('button', 'category-tab', t(`category.${id}`));
      button.type = 'button';
      button.dataset.category = id;
      button.setAttribute('aria-pressed', String(id === category));
      return button;
    }));
    const visible = category === 'all'
      ? expanded ? themes : featured.map(id => themes.find(theme => theme.id === id))
      : themes.filter(theme => theme.category === category);
    get('theme-grid').replaceChildren(...visible.map(theme => {
      const button = create('button', 'theme-card');
      button.type = 'button';
      button.dataset.themeId = theme.id;
      button.setAttribute('aria-label', t('themes.preview', { name: local(theme.name) }));
      button.setAttribute('aria-pressed', String(theme.id === selectedTheme));
      const stage = create('div', 'theme-card-stage');
      const palette = isDark() || theme.darkPreview ? theme.dark : theme.light;
      stage.style.setProperty('--stage', `#${palette[0]}`);
      const demo = keyboard(theme, isDark() || theme.darkPreview);
      demo.removeAttribute('role');
      demo.removeAttribute('aria-label');
      demo.setAttribute('aria-hidden', 'true');
      stage.append(demo);
      const caption = create('div', 'theme-card-caption');
      const info = create('div');
      info.append(create('h3', '', local(theme.name)), create('p', 'theme-card-meta', t(`category.${theme.category}`)));
      caption.append(info, create('span', 'theme-badge', theme.premium ? 'PRO' : t('themes.free')));
      button.append(stage, caption);
      return button;
    }));
    const more = get('show-all-themes');
    more.hidden = category !== 'all';
    more.setAttribute('aria-expanded', String(expanded));
    more.querySelector('[data-i18n]').textContent = t(expanded ? 'themes.less' : 'themes.more');
    more.querySelector('[aria-hidden]').textContent = expanded ? '−' : '＋';
  }

  function fitFontSample() {
    const sample = get('font-sample');
    sample.style.fontSize = '';
    if (!sample.clientWidth || sample.scrollWidth <= sample.clientWidth) return;
    let size = Math.floor(parseFloat(getComputedStyle(sample).fontSize) * sample.clientWidth / sample.scrollWidth);
    sample.style.fontSize = `${size}px`;
    while (sample.scrollWidth > sample.clientWidth && size > 24) sample.style.fontSize = `${--size}px`;
  }

  function renderFonts() {
    const font = fonts.find(item => item.id === selectedFont);
    get('font-sample').style.fontFamily = `"${font.family}", sans-serif`;
    get('font-name').textContent = font.name;
    get('font-options').replaceChildren(...fonts.map(item => {
      const button = create('button', 'font-option');
      button.type = 'button';
      button.dataset.fontId = item.id;
      button.setAttribute('aria-label', t('fonts.option', { name: item.name }));
      button.setAttribute('aria-pressed', String(item.id === selectedFont));
      const specimen = create('span', '', 'Aa');
      specimen.style.fontFamily = `"${item.family}", sans-serif`;
      button.append(specimen, create('small', '', item.name), create('small', 'font-character', t(`font.${item.id}`)));
      return button;
    }));
    fitFontSample();
  }

  function renderScreens() {
    const screen = screens[selectedScreen];
    get('screen-tabs').replaceChildren(...screens.map((item, index) => {
      const button = create('button', 'screen-tab', local(item.label));
      button.type = 'button';
      button.dataset.screenIndex = index;
      button.setAttribute('aria-pressed', String(index === selectedScreen));
      return button;
    }));
    get('screen-title').textContent = local(screen.title);
    get('screen-description').textContent = local(screen.description);
    get('screen-counter').textContent = `${String(selectedScreen + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
    for (const id of ['screenshot-image', 'screenshot-full']) {
      get(id).src = `assets/screenshots/${screen.file}`;
      get(id).alt = local(screen.alt);
    }
    get('screenshot-dialog-title').textContent = local(screen.label);
    get('screenshot-open').setAttribute('aria-label', t('screens.zoom', { name: local(screen.label) }));
  }

  function renderDownloads() {
    for (const [id, url, status] of [['app-store-link', config.appStoreURL, 'app-store-status'], ['testflight-link', config.testFlightURL, 'testflight-status']]) {
      const link = get(id);
      let available = false;
      try { available = Boolean(url) && new URL(url).protocol === 'https:'; } catch (_) { /* Keep an invalid link unavailable. */ }
      link.setAttribute('aria-disabled', String(!available));
      if (available) {
        link.href = url;
        link.removeAttribute('tabindex');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else {
        link.removeAttribute('href');
        link.tabIndex = -1;
      }
      get(status).textContent = t(available ? 'download.available' : 'download.soon');
    }
  }

  function updateURL(key, value) {
    try {
      const url = new URL(location.href);
      url.searchParams.set(key, value);
      history.replaceState(null, '', url);
    } catch (_) { /* file:// browsers may restrict History; preferences still work. */ }
  }

  function updateControls() {
    get('language-toggle').replaceChildren(document.createTextNode(language === 'zh' ? 'EN ' : '中文 '), create('span', '', '↗'));
    get('language-toggle').lastElementChild.setAttribute('aria-hidden', 'true');
    get('language-toggle').setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换为中文');
    get('theme-toggle').setAttribute('aria-label', t(isDark() ? 'mode.light' : 'mode.dark'));
    get('theme-toggle').setAttribute('aria-pressed', String(isDark()));
    get('menu-toggle').setAttribute('aria-label', t(get('menu-toggle').getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.menu'));
  }

  function translate() {
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]').content = t('meta.description');
    document.querySelector('meta[property="og:title"]').content = t('meta.title');
    document.querySelector('meta[property="og:description"]').content = t('meta.description');
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
    updateControls();
    renderHero();
    renderGallery();
    renderFonts();
    renderScreens();
    renderDownloads();
  }

  function chooseTheme(id) {
    if (!themes.some(theme => theme.id === id)) return;
    selectedTheme = id;
    // Only refresh the board and pressed state so keyboard focus stays on its button.
    const theme = themes.find(item => item.id === id);
    const board = keyboard(theme, isDark());
    board.id = 'hero-board';
    board.classList.add('keyboard-hero');
    get('hero-board').replaceWith(board);
    get('hero-theme-name').textContent = local(theme.name);
    get('hero-theme-number').textContent = `${String(themes.indexOf(theme) + 1).padStart(2, '0')} / 24`;
    get('hero-accent').style.background = `#${(isDark() ? theme.dark : theme.light)[3]}`;
    document.querySelectorAll('[data-theme-id]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.themeId === id)));
    get('announcement').textContent = t('themes.changed', { name: local(theme.name) });
  }

  function closeMenu() {
    get('navigation').dataset.open = 'false';
    get('menu-toggle').setAttribute('aria-expanded', 'false');
    updateControls();
  }

  get('language-toggle').addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    save('sk-web-language', language);
    updateURL('lang', language);
    translate();
  });
  get('theme-toggle').addEventListener('click', () => {
    followsSystemAppearance = false;
    root.dataset.theme = isDark() ? 'light' : 'dark';
    save('sk-web-theme', root.dataset.theme);
    updateURL('theme', root.dataset.theme);
    updateAppearanceAssets();
    updateControls();
    renderHero();
    renderGallery();
  });
  get('hero-swatches').addEventListener('click', event => {
    const button = event.target.closest('[data-theme-id]');
    if (button) chooseTheme(button.dataset.themeId);
  });
  get('theme-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-theme-id]');
    if (button) chooseTheme(button.dataset.themeId);
  });
  get('category-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    renderGallery();
    get('category-tabs').querySelector(`[data-category="${category}"]`).focus({ preventScroll: true });
  });
  get('show-all-themes').addEventListener('click', () => {
    expanded = !expanded;
    renderGallery();
    if (!expanded) get('themes').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  get('font-options').addEventListener('click', event => {
    const button = event.target.closest('[data-font-id]');
    if (!button) return;
    selectedFont = button.dataset.fontId;
    const font = fonts.find(item => item.id === selectedFont);
    get('font-sample').style.fontFamily = `"${font.family}", sans-serif`;
    get('font-name').textContent = font.name;
    get('font-options').querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.fontId === selectedFont)));
    fitFontSample();
  });
  get('screen-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-screen-index]');
    if (!button) return;
    selectedScreen = Number(button.dataset.screenIndex);
    renderScreens();
    get('screen-tabs').querySelector(`[data-screen-index="${selectedScreen}"]`).focus({ preventScroll: true });
  });
  get('menu-toggle').addEventListener('click', () => {
    const open = get('menu-toggle').getAttribute('aria-expanded') !== 'true';
    get('navigation').dataset.open = String(open);
    get('menu-toggle').setAttribute('aria-expanded', String(open));
    updateControls();
  });
  get('navigation').addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const wasOpen = get('menu-toggle').getAttribute('aria-expanded') === 'true';
    closeMenu();
    if (wasOpen) get('menu-toggle').focus();
  });

  function openDialog(id) {
    get(id).showModal();
    document.body.classList.add('dialog-open');
  }
  get('screenshot-open').addEventListener('click', () => openDialog('screenshot-dialog'));
  get('privacy-open').addEventListener('click', () => openDialog('privacy-dialog'));
  get('licenses-open').addEventListener('click', () => openDialog('licenses-dialog'));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });

  systemAppearance.addEventListener('change', event => {
    if (!followsSystemAppearance) return;
    root.dataset.theme = event.matches ? 'dark' : 'light';
    updateAppearanceAssets();
    updateControls();
    renderHero();
    renderGallery();
  });

  get('copyright-year').textContent = String(new Date().getFullYear());
  updateAppearanceAssets();
  translate();
  document.fonts.ready.then(fitFontSample);
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitFontSample);
  });
})();
