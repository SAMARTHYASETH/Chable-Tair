/* ============================================
   Chable Tair — Authors Module
   Group quotes by author, display author cards
   ============================================ */

const Authors = (() => {
  /* --- Module State --- */
  const state = {
    authorMap: {},    // { authorName: [quotes] }
    searchTerm: '',
    sortBy: 'most-quotes'
  };

  /**
   * Build author list from quotes using .reduce() — HOF.
   * Groups quotes by author name.
   * @param {Array} quotes - Array of normalized quote objects
   */
  function buildAuthorList(quotes) {
    // GROUP BY author using .reduce() — HOF showcase
    state.authorMap = quotes.reduce((acc, q) => {
      const author = q.author || 'Unknown';
      acc[author] = acc[author] || [];
      acc[author].push(q);
      return acc;
    }, {});

    renderAuthors();
  }

  /**
   * Render author cards with search and sort.
   * Uses Object.entries(), .filter(), .sort(), .map() — HOF pipeline.
   */
  function renderAuthors() {
    const container = document.getElementById('authors-grid');
    const countEl = document.getElementById('authors-count');
    if (!container) return;

    const search = state.searchTerm.toLowerCase();

    // PIPELINE: Object.entries → filter → sort → map
    const authorEntries = Object.entries(state.authorMap)
      // FILTER by search — HOF .filter()
      .filter(([name]) => search === '' || name.toLowerCase().includes(search))
      // SORT — HOF .sort()
      .sort((a, b) => {
        switch (state.sortBy) {
          case 'most-quotes': return b[1].length - a[1].length;
          case 'az':          return a[0].localeCompare(b[0]);
          case 'za':          return b[0].localeCompare(a[0]);
          default:            return b[1].length - a[1].length;
        }
      });

    // Update count
    if (countEl) countEl.textContent = authorEntries.length;

    if (authorEntries.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 dark:text-[#a8a29e] text-[#57534e]">
          <p class="text-lg">No authors found matching your search.</p>
        </div>`;
      return;
    }

    // RENDER using .map() — HOF
    // Show top 60 authors for performance
    container.innerHTML = authorEntries
      .slice(0, 60)
      .map(([name, quotes]) => createAuthorCard(name, quotes))
      .join('');
  }

  /**
   * Create an author card HTML string.
   * @param {string} name - Author name
   * @param {Array} quotes - Array of their quotes
   * @returns {string} HTML string
   */
  function createAuthorCard(name, quotes) {
    // Pick a sample quote (first one)
    const sample = quotes[0];
    const previewText = sample.text.length > 100
      ? sample.text.substring(0, 100) + '...'
      : sample.text;

    // Get unique tags across all their quotes using .reduce() and .flat-like approach — HOF
    const uniqueTags = [...new Set(
      quotes.reduce((tags, q) => [...tags, ...q.tags], [])
    )].slice(0, 3);

    const tagBadges = uniqueTags
      .map(tag => `<span class="tag-${escapeHTML(tag)} text-xs px-2 py-0.5 rounded-full font-medium">${escapeHTML(tag)}</span>`)
      .join('');

    return `
      <div class="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-bold dark:text-[#f5f0eb] text-[#0a0a0a] font-serif">${escapeHTML(name)}</h3>
          <span class="bg-[#8b1a1a]/20 text-[#8b1a1a] text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0">
            ${quotes.length}
          </span>
        </div>
        <p class="text-sm dark:text-[#a8a29e] text-[#57534e] italic mb-3 leading-relaxed">
          "${escapeHTML(previewText)}"
        </p>
        <div class="flex flex-wrap gap-1.5 mb-4">${tagBadges}</div>
        <button onclick="QuotesExplorer.filterByAuthor('${escapeHTML(name.replace(/'/g, "\\'"))}')"
                class="text-sm font-medium text-[#8b1a1a] hover:text-[#a52222] transition-colors group-hover:underline">
          View ${quotes.length} quote${quotes.length !== 1 ? 's' : ''} &rarr;
        </button>
      </div>`;
  }

  /**
   * Initialize the Authors section.
   * Sets up search and sort event listeners.
   */
  function init() {
    const searchInput = document.getElementById('authors-search');
    const sortSelect = document.getElementById('authors-sort');

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        state.searchTerm = e.target.value;
        renderAuthors();
      }, 300));
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderAuthors();
      });
    }
  }

  return { buildAuthorList, renderAuthors, init };
})();
