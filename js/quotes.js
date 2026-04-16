/* ============================================
   Chable Tair — Quotes Explorer Module
   THE HOF SHOWCASE — search, filter, sort,
   pagination using Array Higher-Order Functions
   ============================================ */

const QuotesExplorer = (() => {
  /* --- Module State --- */
  const state = {
    allQuotes: [],
    filteredQuotes: [],
    currentPage: 1,
    perPage: 12,
    searchTerm: '',
    activeTag: 'all',
    sortBy: 'relevance',
    keywordFilter: [],
    keywordLabel: ''
  };

  /**
   * Core pipeline — applies all filters and renders.
   * HOF showcase: .filter() → .filter() → .filter() → .sort() → .reduce() → .slice() → .map()
   */
  function applyFiltersAndRender() {
    const search = state.searchTerm.toLowerCase();

    const results = state.allQuotes
      // FILTER by search term — HOF
      .filter(q =>
        search === '' ||
        q.text.toLowerCase().includes(search) ||
        q.author.toLowerCase().includes(search)
      )
      // FILTER by active tag — HOF
      .filter(q =>
        state.activeTag === 'all' ||
        q.tags.includes(state.activeTag)
      )
      // FILTER by keyword (from Schools of Thought) — HOF
      .filter(q =>
        !state.keywordFilter || state.keywordFilter.length === 0 ||
        state.keywordFilter.some(kw =>
          q.text.toLowerCase().includes(kw.toLowerCase()) ||
          q.author.toLowerCase().includes(kw.toLowerCase())
        )
      )
      // SORT — HOF
      .sort((a, b) => {
        switch (state.sortBy) {
          case 'author-az': return a.author.localeCompare(b.author);
          case 'author-za': return b.author.localeCompare(a.author);
          case 'shortest':  return a.text.length - b.text.length;
          case 'longest':   return b.text.length - a.text.length;
          default:          return 0;
        }
      });

    // STATS using .reduce() — HOF
    const stats = results.reduce((acc, q) => {
      acc.authors.add(q.author);
      acc.totalLength += q.text.length;
      return acc;
    }, { authors: new Set(), totalLength: 0 });

    // Clamp page
    const totalPages = Math.ceil(results.length / state.perPage) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    // PAGINATION using .slice()
    const startIndex = (state.currentPage - 1) * state.perPage;
    const paginated = results.slice(startIndex, startIndex + state.perPage);

    // RENDER using .map() — HOF
    const html = paginated.map(q => createQuoteCard(q)).join('');

    const grid = document.getElementById('quotes-grid');
    const statsBar = document.getElementById('quotes-stats');
    const emptyState = document.getElementById('quotes-empty');

    if (grid) grid.innerHTML = html || '';
    if (emptyState) emptyState.classList.toggle('hidden', results.length > 0);
    if (grid) grid.classList.toggle('hidden', results.length === 0);

    // Stats bar — show keyword filter banner if active
    if (statsBar) {
      if (state.keywordLabel) {
        statsBar.innerHTML = `<span>Filtering by: <strong class="text-[#8b1a1a]">${escapeHTML(state.keywordLabel)}</strong></span> <button onclick="QuotesExplorer.clearKeywordFilter()" class="ml-2 text-[#8b1a1a] hover:underline text-sm font-sans">✕ Clear</button>`;
      } else {
        statsBar.textContent = `Showing ${paginated.length} of ${results.length} quotes | ${stats.authors.size} unique authors`;
      }
    }

    renderPagination(results.length);
    state.filteredQuotes = results;
  }

  /**
   * Create a single quote card HTML.
   */
  function createQuoteCard(quote) {
    const isFav = Favorites.isFavorite(quote.id);
    const tagBadges = quote.tags
      .map(tag => `<span class="tag-${escapeHTML(tag)} text-xs px-2 py-0.5 rounded-full font-medium font-sans">${escapeHTML(tag)}</span>`)
      .join('');

    const quoteData = escapeHTML(JSON.stringify({
      id: quote.id, text: quote.text, author: quote.author, tags: quote.tags
    }));

    return `
      <div class="quote-card glass rounded-xl p-6 relative group quote-decoration" data-quote-id="${escapeHTML(quote.id)}">
        <p class="text-base md:text-lg mb-4 dark:text-[#f5f0eb] text-[#0a0a0a] leading-relaxed font-['Playfair_Display'] italic">
          "${escapeHTML(quote.text)}"
        </p>
        <p class="text-sm font-semibold text-[#8b1a1a] mb-3 font-sans">— ${escapeHTML(quote.author)}</p>
        <div class="flex flex-wrap gap-1.5 mb-3">${tagBadges}</div>
        <div class="flex items-center gap-2">
          <button onclick='QuotesExplorer.handleFavorite(${quoteData})'
                  class="fav-btn transition-colors p-1 ${isFav ? 'text-[#8b1a1a]' : 'dark:text-[#6b6560] text-[#8a8580] hover:text-[#8b1a1a]'}"
                  title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
            <svg class="w-5 h-5 ${isFav ? 'fill-current' : ''}" ${isFav ? '' : 'fill="none" stroke="currentColor"'} viewBox="0 0 24 24">
              <path ${isFav ? '' : 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2"'} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button onclick='QuotesExplorer.handleShare(${quoteData})'
                  class="dark:text-[#6b6560] text-[#8a8580] hover:text-[#8b1a1a] transition-colors p-1" title="Share quote">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  function handleFavorite(quoteJson) {
    try {
      const quote = typeof quoteJson === 'string' ? JSON.parse(quoteJson) : quoteJson;
      Favorites.toggleFavorite(quote);
      applyFiltersAndRender();
    } catch (e) { console.error('Error toggling favorite:', e); }
  }

  function handleShare(quoteJson) {
    try {
      const quote = typeof quoteJson === 'string' ? JSON.parse(quoteJson) : quoteJson;
      const text = `"${quote.text}" — ${quote.author}\n\nShared from Chable Tair`;
      navigator.clipboard.writeText(text).then(() => showToast('Quote copied to clipboard!', 'success'));
    } catch { showToast('Failed to copy quote.', 'error'); }
  }

  function renderPagination(totalResults) {
    const container = document.getElementById('quotes-pagination');
    if (!container) return;
    const totalPages = Math.ceil(totalResults / state.perPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let startPage = Math.max(1, state.currentPage - 3);
    let endPage = Math.min(totalPages, startPage + 6);
    if (endPage - startPage < 6) startPage = Math.max(1, endPage - 6);

    const pageButtons = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
      .map(page => `
        <button onclick="QuotesExplorer.goToPage(${page})"
                class="px-3 py-1.5 rounded-lg text-sm font-medium font-sans transition-all
                       ${page === state.currentPage
                         ? 'bg-[#8b1a1a] text-white'
                         : 'dark:bg-white/[0.05] bg-black/[0.05] dark:text-[#a8a29e] text-[#57534e] hover:bg-[#8b1a1a]/20'}"
                ${page === state.currentPage ? 'aria-current="page"' : ''}>
          ${page}
        </button>`).join('');

    container.innerHTML = `
      <div class="flex items-center justify-center gap-2 flex-wrap font-sans">
        <button onclick="QuotesExplorer.goToPage(${state.currentPage - 1})"
                class="px-3 py-1.5 rounded-lg text-sm font-medium dark:bg-white/[0.05] bg-black/[0.05] dark:text-[#a8a29e] text-[#57534e] hover:bg-[#8b1a1a]/20 transition-all ${state.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${state.currentPage === 1 ? 'disabled' : ''}>Prev</button>
        ${pageButtons}
        <button onclick="QuotesExplorer.goToPage(${state.currentPage + 1})"
                class="px-3 py-1.5 rounded-lg text-sm font-medium dark:bg-white/[0.05] bg-black/[0.05] dark:text-[#a8a29e] text-[#57534e] hover:bg-[#8b1a1a]/20 transition-all ${state.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                ${state.currentPage === totalPages ? 'disabled' : ''}>Next</button>
      </div>`;
  }

  function goToPage(page) {
    const totalPages = Math.ceil(state.filteredQuotes.length / state.perPage) || 1;
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    applyFiltersAndRender();
    scrollToElement('quotes');
  }

  function setSearch(term) { state.searchTerm = term; state.currentPage = 1; applyFiltersAndRender(); }
  function setTag(tag) {
    state.activeTag = tag;
    state.currentPage = 1;
    applyFiltersAndRender();
    document.querySelectorAll('#quotes .filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tag === tag);
    });
  }
  function setSort(sortBy) { state.sortBy = sortBy; state.currentPage = 1; applyFiltersAndRender(); }

  /** Filter by author name — used by Authors "View Quotes" button */
  function filterByAuthor(authorName) {
    const searchInput = document.getElementById('quotes-search');
    if (searchInput) searchInput.value = authorName;
    state.searchTerm = authorName;
    state.activeTag = 'all';
    state.keywordFilter = [];
    state.keywordLabel = '';
    state.currentPage = 1;
    document.querySelectorAll('#quotes .filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tag === 'all');
    });
    applyFiltersAndRender();
    scrollToElement('quotes');
  }

  /** Filter by keywords — used by Schools of Thought */
  function filterByKeywords(keywords, label) {
    const searchInput = document.getElementById('quotes-search');
    if (searchInput) searchInput.value = '';
    state.searchTerm = '';
    state.activeTag = 'all';
    state.keywordFilter = keywords;
    state.keywordLabel = label;
    state.currentPage = 1;
    document.querySelectorAll('#quotes .filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tag === 'all');
    });
    applyFiltersAndRender();
    scrollToElement('quotes');
  }

  /** Clear keyword filter */
  function clearKeywordFilter() {
    state.keywordFilter = [];
    state.keywordLabel = '';
    state.currentPage = 1;
    applyFiltersAndRender();
  }

  function getAllQuotes() { return state.allQuotes; }
  function getFilteredQuotes() { return state.filteredQuotes; }

  async function init() {
    const grid = document.getElementById('quotes-grid');
    if (grid) showSkeletonLoader(grid, 6);
    const quotes = await API.fetchAllData();
    state.allQuotes = quotes;
    applyFiltersAndRender();

    const searchInput = document.getElementById('quotes-search');
    if (searchInput) searchInput.addEventListener('input', debounce((e) => setSearch(e.target.value), 300));

    document.querySelectorAll('#quotes .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => setTag(chip.dataset.tag));
    });

    const sortSelect = document.getElementById('quotes-sort');
    if (sortSelect) sortSelect.addEventListener('change', (e) => setSort(e.target.value));

    return quotes;
  }

  return {
    init, applyFiltersAndRender, handleFavorite, handleShare,
    goToPage, setSearch, setTag, setSort,
    filterByAuthor, filterByKeywords, clearKeywordFilter,
    getAllQuotes, getFilteredQuotes
  };
})();
