import { locale, t } from './i18n.js';

(async () => {
  document.documentElement.lang = locale;
  document.title = t('appName');
  const api = globalThis.browser ?? globalThis.chrome;
  const url = api.runtime.getURL('index.html');
  const status = document.querySelector('#status');
  status.textContent = t('opening');

  try {
    const windows = await api.windows.getAll({ populate: true });
    const existing = windows.find((item) => item.tabs?.some((tab) => tab.url === url));
    if (existing) {
      await api.windows.update(existing.id, { focused: true });
    } else {
      await api.windows.create({
        url,
        type: 'popup',
        width: 450,
        height: 680,
        left: Math.max(0, screen.availWidth - 470),
        top: 60,
      });
    }
    window.close();
  } catch (error) {
    status.textContent = t('openingFailed');
    console.error('Local Converter:', error);
  }
})();
