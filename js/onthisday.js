/* ============================================
   Chable Tair — On This Day Module
   Historical events timeline from Wikipedia
   ============================================ */

const OnThisDay = (() => {
  /* --- Module State --- */
  const state = {
    allItems: [],  // Combined events, births, deaths
    filter: 'all', // 'all', 'events', 'births', 'deaths'
    maxItems: 50   // Limit display for performance
  };

  /**
   * Fetch data and render the timeline.
   */
  async function fetchAndRender() {
    const container = document.getElementById('onthisday-timeline');
    const dateEl = document.getElementById('onthisday-date');

    // Show loading state
    if (container) {
      container.innerHTML = `
        <div class="flex justify-center py-12">
          <div class="pulse-dot"><span></span><span></span><span></span></div>
        </div>`;
    }

    // Display today's date
    if (dateEl) {
      dateEl.textContent = formatDate(new Date());
    }

    const data = await API.fetchOnThisDay();
    if (!data) {
      if (container) {
        container.innerHTML = `
          <div class="text-center py-12 dark:text-[#a8a29e] text-[#57534e]">
            <p class="text-lg">Unable to load historical events. Please try again later.</p>
          </div>`;
      }
      return;
    }

    // Normalize and merge all types using .map() — HOF
    const events = (data.events || []).map(e => ({ ...e, type: 'events' }));
    const births = (data.births || []).map(e => ({ ...e, type: 'births' }));
    const deaths = (data.deaths || []).map(e => ({ ...e, type: 'deaths' }));

    // Merge using spread
    state.allItems = [...events, ...births, ...deaths];

    applyFilter();
  }

  /**
   * Apply filter and render timeline.
   * Uses .filter(), .sort(), .slice(), and .map() — HOF pipeline.
   */
  function applyFilter() {
    const container = document.getElementById('onthisday-timeline');
    if (!container) return;

    const filtered = state.allItems
      // FILTER by type — HOF .filter()
      .filter(item => state.filter === 'all' || item.type === state.filter)
      // SORT by year descending — HOF .sort()
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      // LIMIT for performance — .slice()
      .slice(0, state.maxItems);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 dark:text-[#a8a29e] text-[#57534e]">
          <p class="text-lg">No events found for this filter.</p>
        </div>`;
      return;
    }

    // RENDER using .map() — HOF
    container.innerHTML = `
      <div class="timeline-container">
        ${filtered.map(item => createEventCard(item)).join('')}
      </div>`;
  }

  /**
   * Create a timeline event card.
   * @param {Object} item - Event object with year, text, type, pages
   * @returns {string} HTML string
   */
  function createEventCard(item) {
    const typeColors = {
      events: 'bg-[#8b1a1a]',
      births: 'bg-green-600',
      deaths: 'bg-red-600'
    };

    const typeLabels = {
      events: 'Event',
      births: 'Birth',
      deaths: 'Death'
    };

    const typeColor = typeColors[item.type] || 'bg-[#8b1a1a]';
    const typeLabel = typeLabels[item.type] || 'Event';

    // Check for thumbnail from Wikipedia pages
    const page = (item.pages && item.pages.length > 0) ? item.pages[0] : null;
    const thumbnail = page?.thumbnail?.source || '';
    const pageTitle = page?.title || '';

    return `
      <div class="timeline-item mb-6">
        <div class="glass rounded-2xl p-5 hover:scale-[1.01] transition-transform">
          <div class="flex items-start gap-4">
            ${thumbnail ? `
              <img src="${escapeHTML(thumbnail)}" alt="${escapeHTML(pageTitle)}"
                   class="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                   loading="lazy" onerror="this.style.display='none'">
            ` : ''}
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="text-xl font-bold text-[#8b1a1a] font-bold">${item.year || 'Unknown'}</span>
                <span class="${typeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium">${typeLabel}</span>
              </div>
              <p class="dark:text-[#a8a29e] text-[#57534e] text-sm leading-relaxed">
                ${escapeHTML(item.text || '')}
              </p>
              ${pageTitle ? `
                <p class="text-xs text-[#8b1a1a] mt-2 font-medium">${escapeHTML(pageTitle)}</p>
              ` : ''}
            </div>
          </div>
        </div>
      </div>`;
  }

  /**
   * Initialize the On This Day section.
   * Sets up filter button listeners.
   */
  async function init() {
    // Filter buttons
    document.querySelectorAll('.otd-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;

        // Update active button styling
        document.querySelectorAll('.otd-filter-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.filter === state.filter);
        });

        applyFilter();
      });
    });

    // Load "More" button
    const loadMoreBtn = document.getElementById('otd-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        state.maxItems += 30;
        applyFilter();
      });
    }

    await fetchAndRender();
  }

  return { init, fetchAndRender, applyFilter };
})();
