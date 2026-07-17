(() => {
  const key = 'sulafah-theme';
  const button = document.querySelector('.theme-toggle');
  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    button?.setAttribute('aria-label', theme === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن');
    if (button) button.querySelector('span').textContent = theme === 'dark' ? '☾' : '☼';
  };
  const saved = localStorage.getItem(key);
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  button?.addEventListener('click', () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem(key, next); });
  document.querySelectorAll('#year').forEach((el) => el.textContent = new Date().getFullYear());
})();
