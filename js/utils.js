/* ============================================
   Chable Tair — Utility Functions
   Debounce, throttle, escapeHTML, toasts,
   skeleton loaders, scroll, and date helpers
   ============================================ */

/**
 * Debounce — delays function execution until after a pause in calls.
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Milliseconds to wait (default 300)
 * @returns {Function} Debounced function
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle — limits function execution to at most once per interval.
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Minimum milliseconds between calls
 * @returns {Function} Throttled function
 */
function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Escape HTML — prevents XSS by converting special characters to entities.
 * @param {string} str - The string to escape
 * @returns {string} Escaped string safe for innerHTML
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Show Toast Notification — displays a temporary message.
 * @param {string} message - The message to display
 * @param {string} type - 'success' | 'error' | 'info' (default 'info')
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colorMap = {
    success: 'bg-green-800',
    error: 'bg-red-900',
    info: 'bg-[#8b1a1a]'
  };

  const iconMap = {
    success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    info: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${colorMap[type] || colorMap.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`;
  toast.innerHTML = `${iconMap[type] || iconMap.info}<span class="text-sm font-medium">${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  // Auto-remove after 3 seconds with exit animation
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/**
 * Show Skeleton Loader — renders placeholder cards while data loads.
 * @param {HTMLElement} container - The DOM element to fill
 * @param {number} count - Number of skeleton cards (default 6)
 */
function showSkeletonLoader(container, count = 6) {
  if (!container) return;
  const skeletons = Array.from({ length: count }, () =>
    `<div class="skeleton skeleton-card glass rounded-2xl p-6">
       <div class="skeleton skeleton-title"></div>
       <div class="skeleton skeleton-text"></div>
       <div class="skeleton skeleton-text"></div>
       <div class="skeleton skeleton-text"></div>
       <div class="flex gap-2 mt-4">
         <div class="skeleton h-5 w-16 rounded-full"></div>
         <div class="skeleton h-5 w-20 rounded-full"></div>
       </div>
     </div>`
  ).join('');
  container.innerHTML = skeletons;
}

/**
 * Smooth Scroll to Element — scrolls to a target section.
 * @param {string} id - The element id to scroll to (without #)
 */
function scrollToElement(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const navHeight = document.querySelector('nav')?.offsetHeight || 80;
  const top = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Format Date — returns a nicely formatted date string.
 * @param {Date} date - The date object to format
 * @returns {string} Formatted string like "April 8, 2026"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
