/* ============================================
   Chable Tair — Zen Reading Mode Module
   Fullscreen immersive quote reader with
   typewriter text reveal and keyboard controls.
   Space = pause/resume, ←→ = nav, Esc = exit
   ============================================ */

const ZenMode = (() => {
  /* --- Module State --- */
  const state = {
    quotes: [],
    currentIndex: 0,
    isPaused: false,
    isActive: false,
    autoTimer: null,
    typeTimer: null,
    autoAdvanceMs: 8000  // 8 seconds per quote
  };

  /**
   * Shuffle an array (Fisher-Yates) — returns new array.
   * @param {Array} arr
   * @returns {Array}
   */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Open Zen Mode — enters fullscreen immersive reader.
   */
  function open() {
    const allQuotes = (typeof QuotesExplorer !== 'undefined')
      ? QuotesExplorer.getAllQuotes()
      : [];

    if (allQuotes.length === 0) {
      showToast('Loading quotes… try again in a moment.', 'info');
      return;
    }

    // Shuffle and pick up to 30 quotes for the session
    state.quotes = shuffle(allQuotes).slice(0, 30);
    state.currentIndex = 0;
    state.isPaused = false;
    state.isActive = true;

    const overlay = document.getElementById('zen-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    showQuote();
    startAutoAdvance();
    updateProgress();
  }

  /**
   * Close Zen Mode.
   */
  function close() {
    state.isActive = false;
    clearTimeout(state.autoTimer);
    clearTimeout(state.typeTimer);

    const overlay = document.getElementById('zen-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  /**
   * Typewriter reveal effect.
   * Reveals characters one by one into the target element.
   * @param {HTMLElement} el - The element to type into
   * @param {string} text - Full text to reveal
   * @param {Function} [onComplete] - Callback when done
   */
  function typeWriter(el, text, onComplete) {
    clearTimeout(state.typeTimer);
    el.textContent = '';
    el.classList.add('zen-typewriter');

    let i = 0;
    const speed = Math.max(20, Math.min(50, 2000 / text.length)); // adaptive speed

    function tick() {
      if (!state.isActive) return;
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        state.typeTimer = setTimeout(tick, speed);
      } else {
        el.classList.remove('zen-typewriter');
        if (onComplete) onComplete();
      }
    }
    tick();
  }

  /**
   * Display the current quote with typewriter effect.
   */
  function showQuote() {
    const quote = state.quotes[state.currentIndex];
    if (!quote) return;

    const textEl = document.getElementById('zen-text');
    const authorEl = document.getElementById('zen-author');

    if (authorEl) {
      authorEl.style.opacity = '0';
      authorEl.textContent = `— ${quote.author}`;
    }

    if (textEl) {
      const displayText = `"${quote.text}"`;
      typeWriter(textEl, displayText, () => {
        // Fade in author after typewriter finishes
        if (authorEl) {
          authorEl.style.transition = 'opacity 0.8s ease';
          authorEl.style.opacity = '1';
        }
      });
    }

    updateProgress();
  }

  /**
   * Update the progress bar.
   */
  function updateProgress() {
    const bar = document.getElementById('zen-progress-bar');
    const counter = document.getElementById('zen-counter');
    if (bar) {
      const pct = ((state.currentIndex + 1) / state.quotes.length) * 100;
      bar.style.width = pct + '%';
    }
    if (counter) {
      counter.textContent = `${state.currentIndex + 1} / ${state.quotes.length}`;
    }
  }

  /**
   * Start the auto-advance timer.
   */
  function startAutoAdvance() {
    clearTimeout(state.autoTimer);
    if (state.isPaused || !state.isActive) return;

    state.autoTimer = setTimeout(() => {
      nextQuote();
    }, state.autoAdvanceMs);
  }

  /**
   * Go to next quote.
   */
  function nextQuote() {
    if (state.currentIndex < state.quotes.length - 1) {
      state.currentIndex++;
      showQuote();
      startAutoAdvance();
    } else {
      // End of session — loop back
      state.currentIndex = 0;
      showQuote();
      startAutoAdvance();
    }
  }

  /**
   * Go to previous quote.
   */
  function prevQuote() {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      showQuote();
      startAutoAdvance();
    }
  }

  /**
   * Toggle pause/resume.
   */
  function togglePause() {
    state.isPaused = !state.isPaused;

    const pauseBtn = document.getElementById('zen-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = state.isPaused
        ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
        : `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }

    if (state.isPaused) {
      clearTimeout(state.autoTimer);
    } else {
      startAutoAdvance();
    }
  }

  /**
   * Handle keyboard events for Zen Mode.
   * Space = pause/resume, ArrowRight = next, ArrowLeft = prev, Escape = exit
   */
  function handleKeydown(e) {
    if (!state.isActive) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePause();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextQuote();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevQuote();
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }

  /**
   * Initialize — bind keyboard listener.
   */
  function init() {
    document.addEventListener('keydown', handleKeydown);
  }

  /* --- Public API --- */
  return {
    init,
    open,
    close,
    nextQuote,
    prevQuote,
    togglePause
  };
})();
