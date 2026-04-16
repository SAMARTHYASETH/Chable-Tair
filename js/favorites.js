/* ============================================
   Chable Tair — Favorites Module
   localStorage CRUD for saved quotes
   ============================================ */

const Favorites = (() => {
  const STORAGE_KEY = 'chable-tair-favorites';

  /**
   * Get all favorites from localStorage.
   * @returns {Array} Array of saved quote objects
   */
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Save favorites array to localStorage.
   * @param {Array} favorites - Array of quote objects
   */
  function saveFavorites(favorites) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }

  /**
   * Add a quote to favorites.
   * @param {Object} quote - Quote object { id, text, author, tags }
   */
  function addFavorite(quote) {
    const favorites = getFavorites();
    // Check if already exists using .find() — HOF
    if (!favorites.find(f => f.id === quote.id)) {
      favorites.push({ ...quote, savedAt: Date.now() });
      saveFavorites(favorites);
    }
  }

  /**
   * Remove a quote from favorites using .filter() — HOF.
   * @param {string} quoteId - The id of the quote to remove
   */
  function removeFavorite(quoteId) {
    const favorites = getFavorites();
    const updated = favorites.filter(f => f.id !== quoteId);
    saveFavorites(updated);
  }

  /**
   * Check if a quote is in favorites using .some() — HOF.
   * @param {string} quoteId - The id to check
   * @returns {boolean}
   */
  function isFavorite(quoteId) {
    return getFavorites().some(f => f.id === quoteId);
  }

  /**
   * Toggle a quote in/out of favorites.
   * @param {Object} quote - Quote object
   */
  function toggleFavorite(quote) {
    if (isFavorite(quote.id)) {
      removeFavorite(quote.id);
      showToast('Removed from favorites', 'info');
    } else {
      addFavorite(quote);
      showToast('Added to favorites!', 'success');
    }
    updateFavoriteBadge();
    // Re-render favorites section if visible
    renderFavorites();
  }

  /**
   * Get favorite count for the nav badge.
   * @returns {number}
   */
  function getFavoriteCount() {
    return getFavorites().length;
  }

  /**
   * Update the favorites count badge in the navbar.
   */
  function updateFavoriteBadge() {
    const badge = document.getElementById('fav-count-badge');
    if (!badge) return;
    const count = getFavoriteCount();
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }

  /**
   * Export favorites as formatted text using .reduce() — HOF.
   * @returns {string}
   */
  function exportFavorites() {
    const favorites = getFavorites();
    return favorites.reduce((text, q, index) => {
      return text + `${index + 1}. "${q.text}" — ${q.author}\n\n`;
    }, 'My Favorite Quotes from Chable Tair:\n\n');
  }

  /**
   * Render the favorites section with search and sort.
   * Uses .filter(), .sort(), .map() — HOF pipeline.
   */
  function renderFavorites() {
    const container = document.getElementById('favorites-grid');
    const countEl = document.getElementById('favorites-total-count');
    const emptyState = document.getElementById('favorites-empty');
    const searchInput = document.getElementById('favorites-search');
    const sortSelect = document.getElementById('favorites-sort');

    if (!container) return;

    const favorites = getFavorites();
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const sortBy = sortSelect?.value || 'newest';

    // Filter using .filter() — HOF
    const filtered = favorites
      .filter(q =>
        searchTerm === '' ||
        q.text.toLowerCase().includes(searchTerm) ||
        q.author.toLowerCase().includes(searchTerm)
      )
      // Sort using .sort() — HOF
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest': return (b.savedAt || 0) - (a.savedAt || 0);
          case 'oldest': return (a.savedAt || 0) - (b.savedAt || 0);
          case 'author-az': return a.author.localeCompare(b.author);
          case 'author-za': return b.author.localeCompare(a.author);
          default: return 0;
        }
      });

    // Update count
    if (countEl) countEl.textContent = favorites.length;

    // Show/hide empty state
    if (emptyState) {
      emptyState.classList.toggle('hidden', filtered.length > 0);
    }

    // Render cards using .map() — HOF
    if (filtered.length > 0) {
      container.innerHTML = filtered.map(q => createFavoriteCard(q)).join('');
    } else if (favorites.length > 0 && filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-400">
          <p class="text-lg">No favorites match your search.</p>
        </div>`;
    } else {
      container.innerHTML = '';
    }
  }

  /**
   * Create a favorite card HTML string.
   * @param {Object} quote - Quote object
   * @returns {string} HTML string
   */
  function createFavoriteCard(quote) {
    // Tag badges using .map() — HOF
    const tagBadges = (quote.tags || [])
      .map(tag => `<span class="tag-${escapeHTML(tag)} text-xs px-2 py-0.5 rounded-full font-medium">${escapeHTML(tag)}</span>`)
      .join('');

    return `
      <div class="favorite-card quote-card glass rounded-2xl p-6 relative group quote-decoration"
           data-quote-id="${escapeHTML(quote.id)}">
        <p class="quote-text text-base md:text-lg mb-4 dark:text-[#f5f0eb] text-[#0a0a0a] leading-relaxed">
          "${escapeHTML(quote.text)}"
        </p>
        <p class="text-sm font-semibold text-[#8b1a1a] mb-3">
          — ${escapeHTML(quote.author)}
        </p>
        <div class="flex flex-wrap gap-1.5 mb-3">${tagBadges}</div>
        <div class="flex items-center gap-2">
          <button onclick="Favorites.toggleFavorite(${escapeHTML(JSON.stringify(JSON.stringify(quote)))})"
                  class="text-red-500 hover:text-red-400 transition-colors p-1" title="Remove from favorites">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button onclick="Favorites.shareFavorite(${escapeHTML(JSON.stringify(JSON.stringify(quote)))})"
                  class="dark:text-[#a8a29e] text-[#57534e] hover:text-[#8b1a1a] transition-colors p-1" title="Share">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  /**
   * Share a favorite quote (copy to clipboard).
   * @param {string} quoteJson - JSON string of quote object
   */
  function shareFavorite(quoteJson) {
    try {
      const quote = JSON.parse(quoteJson);
      const text = `"${quote.text}" — ${quote.author}\n\nShared from Chable Tair`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Quote copied to clipboard!', 'success');
      });
    } catch {
      showToast('Failed to copy quote.', 'error');
    }
  }

  /**
   * Initialize the favorites section event listeners.
   */
  function init() {
    const searchInput = document.getElementById('favorites-search');
    const sortSelect = document.getElementById('favorites-sort');
    const exportBtn = document.getElementById('favorites-export');

    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => renderFavorites(), 300));
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', () => renderFavorites());
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const text = exportFavorites();
        navigator.clipboard.writeText(text).then(() => {
          showToast('Favorites copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to export favorites.', 'error');
        });
      });
    }

    updateFavoriteBadge();
    renderFavorites();
  }

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoriteCount,
    updateFavoriteBadge,
    exportFavorites,
    renderFavorites,
    shareFavorite,
    init
  };
})();
