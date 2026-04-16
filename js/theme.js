/* ============================================
   Chable Tair — Theme Module
   Dark/Light mode toggle with localStorage
   ============================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'chable-tair-theme';
  const html = document.documentElement;

  /**
   * Initialize theme — check localStorage, default to dark mode.
   */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light') {
      html.classList.remove('dark');
    } else {
      // Default to dark mode
      html.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
    }
    updateIcon();
  }

  /**
   * Toggle between dark and light mode.
   * Saves preference to localStorage and updates the icon.
   */
  function toggle() {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    updateIcon();
  }

  /**
   * Update the sun/moon icon on the toggle button.
   */
  function updateIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = html.classList.contains('dark');
    btn.innerHTML = isDark
      ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /**
   * Check if current theme is dark.
   * @returns {boolean}
   */
  function isDark() {
    return html.classList.contains('dark');
  }

  return { init, toggle, isDark };
})();
