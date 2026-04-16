/* ============================================
   Chable Tair — Quote Remix / Mashup Module
   Splits two random quotes at midpoint and
   combines halves for surprising juxtapositions.
   Lock one half, re-roll the other, save to favs.
   ============================================ */

const Remix = (() => {
  /* --- Module State --- */
  const state = {
    quoteA: null,       // full quote object for top half
    quoteB: null,       // full quote object for bottom half
    splitA: '',         // first half text (from quoteA)
    splitB: '',         // second half text (from quoteB)
    lockedHalf: null    // 'top' | 'bottom' | null
  };

  /**
   * Split a quote roughly at midpoint on a word boundary.
   * @param {string} text - Quote text to split
   * @returns {[string, string]} Two halves
   */
  function splitAtMidpoint(text) {
    const words = text.split(/\s+/);
    if (words.length <= 2) return [text, ''];
    const mid = Math.ceil(words.length / 2);
    return [
      words.slice(0, mid).join(' '),
      words.slice(mid).join(' ')
    ];
  }

  /**
   * Pick a random quote from the loaded quotes pool.
   * Avoids picking the same quote as the `exclude` param.
   * @param {Object|null} exclude - Quote object to avoid
   * @returns {Object|null}
   */
  function pickRandom(exclude) {
    const quotes = (typeof QuotesExplorer !== 'undefined')
      ? QuotesExplorer.getAllQuotes()
      : [];
    if (quotes.length === 0) return null;

    let attempts = 0;
    let pick;
    do {
      pick = quotes[Math.floor(Math.random() * quotes.length)];
      attempts++;
    } while (exclude && pick.id === exclude.id && attempts < 20);

    return pick;
  }

  /**
   * Generate a fresh remix. Respects locked half.
   * Uses splitAtMidpoint for each quote, then crosses halves.
   */
  function generate() {
    if (state.lockedHalf !== 'top') {
      state.quoteA = pickRandom(state.quoteB);
    }
    if (state.lockedHalf !== 'bottom') {
      state.quoteB = pickRandom(state.quoteA);
    }

    if (!state.quoteA || !state.quoteB) return;

    const [aFirst] = splitAtMidpoint(state.quoteA.text);
    const [, bSecond] = splitAtMidpoint(state.quoteB.text);

    state.splitA = aFirst;
    state.splitB = bSecond || splitAtMidpoint(state.quoteB.text)[0];

    renderRemix();
  }

  /**
   * Render the remix modal content.
   */
  function renderRemix() {
    const topText = document.getElementById('remix-top-text');
    const topAuthor = document.getElementById('remix-top-author');
    const bottomText = document.getElementById('remix-bottom-text');
    const bottomAuthor = document.getElementById('remix-bottom-author');
    const lockTopBtn = document.getElementById('remix-lock-top');
    const lockBottomBtn = document.getElementById('remix-lock-bottom');

    if (topText) topText.textContent = `"${state.splitA}`;
    if (topAuthor && state.quoteA) topAuthor.textContent = `— ${state.quoteA.author}`;

    if (bottomText) bottomText.textContent = `${state.splitB}"`;
    if (bottomAuthor && state.quoteB) bottomAuthor.textContent = `— ${state.quoteB.author}`;

    // Update lock button states
    if (lockTopBtn) {
      lockTopBtn.classList.toggle('bg-[#8b1a1a]', state.lockedHalf === 'top');
      lockTopBtn.classList.toggle('text-white', state.lockedHalf === 'top');
      lockTopBtn.classList.toggle('dark:bg-white/[0.06]', state.lockedHalf !== 'top');
      lockTopBtn.classList.toggle('bg-black/[0.06]', state.lockedHalf !== 'top');
      lockTopBtn.title = state.lockedHalf === 'top' ? 'Unlock top half' : 'Lock top half';
    }
    if (lockBottomBtn) {
      lockBottomBtn.classList.toggle('bg-[#8b1a1a]', state.lockedHalf === 'bottom');
      lockBottomBtn.classList.toggle('text-white', state.lockedHalf === 'bottom');
      lockBottomBtn.classList.toggle('dark:bg-white/[0.06]', state.lockedHalf !== 'bottom');
      lockBottomBtn.classList.toggle('bg-black/[0.06]', state.lockedHalf !== 'bottom');
      lockBottomBtn.title = state.lockedHalf === 'bottom' ? 'Unlock bottom half' : 'Lock bottom half';
    }
  }

  /**
   * Toggle lock on a half.
   * @param {string} half - 'top' or 'bottom'
   */
  function toggleLock(half) {
    state.lockedHalf = state.lockedHalf === half ? null : half;
    renderRemix();
  }

  /**
   * Open the remix modal with a fresh generation.
   */
  function open() {
    state.lockedHalf = null;
    generate();
    const modal = document.getElementById('remix-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close the remix modal.
   */
  function close() {
    const modal = document.getElementById('remix-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  /**
   * Save the current remix to favorites with a "remix" tag.
   * Creates a synthetic quote object.
   */
  function saveRemix() {
    if (!state.quoteA || !state.quoteB) return;

    const remixText = `${state.splitA} ${state.splitB}`;
    const remixAuthor = `${state.quoteA.author} × ${state.quoteB.author}`;

    const remixQuote = {
      id: 'remix-' + Date.now(),
      text: remixText,
      author: remixAuthor,
      tags: ['remix']
    };

    if (typeof Favorites !== 'undefined') {
      Favorites.addFavorite(remixQuote);
      Favorites.updateFavoriteBadge();
      Favorites.renderFavorites();
      showToast('Remix saved to favorites!', 'success');
    }
  }

  /**
   * Copy the current remix to clipboard.
   */
  function shareRemix() {
    if (!state.quoteA || !state.quoteB) return;

    const text = `"${state.splitA} ${state.splitB}"\n— ${state.quoteA.author} × ${state.quoteB.author}\n\nRemixed on Chable Tair`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Remix copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy remix.', 'error');
    });
  }

  /**
   * Initialize — just bind the modal close events.
   */
  function init() {
    const modal = document.getElementById('remix-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
    }

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('remix-modal');
        if (modal && !modal.classList.contains('hidden')) {
          close();
        }
      }
    });
  }

  /* --- Public API --- */
  return {
    init,
    open,
    close,
    generate,
    toggleLock,
    saveRemix,
    shareRemix
  };
})();
