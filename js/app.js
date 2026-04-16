/* ============================================
   Chable Tair — Main App Module
   Initialization, navigation, hero data,
   back-to-top, and section highlighting
   ============================================ */

const App = (() => {
  /* --- Philosophical words for Word of the Day rotation --- */
  const HERO_WORDS = [
    'perspective', 'wisdom', 'philosophy', 'consciousness',
    'resilience', 'serendipity', 'ephemeral', 'paradigm'
  ];

  /**
   * Initialize all navigation functionality.
   * Smooth scroll links, mobile menu, active section highlighting.
   */
  function initNavigation() {
    // --- Smooth scroll for nav links ---
    document.querySelectorAll('a[data-scroll]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        scrollToElement(targetId);
        closeMobileMenu();
      });
    });

    // --- Mobile hamburger menu ---
    const hamburger = document.getElementById('hamburger-btn');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const mobileCloseBtn = document.getElementById('mobile-menu-close');

    if (hamburger) {
      hamburger.addEventListener('click', openMobileMenu);
    }
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay || e.target.id === 'mobile-menu-backdrop') closeMobileMenu();
      });
    }

    // Mobile nav links
    document.querySelectorAll('#mobile-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        closeMobileMenu();
        setTimeout(() => scrollToElement(targetId), 350);
      });
    });

    // --- Active section highlighting using Intersection Observer ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('active', href === id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  /**
   * Open mobile menu.
   */
  function openMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const panel = document.getElementById('mobile-menu-panel');
    if (overlay) {
      overlay.style.display = 'block';
      overlay.classList.remove('closing');
    }
    if (panel) {
      panel.classList.remove('closing');
    }
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close mobile menu with animation.
   */
  function closeMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const panel = document.getElementById('mobile-menu-panel');
    if (overlay) {
      overlay.classList.add('closing');
    }
    if (panel) {
      panel.classList.add('closing');
    }
    setTimeout(() => {
      if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('closing');
      }
      if (panel) {
        panel.classList.remove('closing');
      }
    }, 350);
    document.body.style.overflow = '';
  }

  /**
   * Load hero section data — Quote of the Day, Word of the Day, Random Fact.
   * Fetches from multiple APIs concurrently.
   */
  async function loadHeroData() {
    const quoteCard = document.getElementById('hero-quote');
    const wordCard = document.getElementById('hero-word');
    const factCard = document.getElementById('hero-fact');

    // Fetch all three concurrently
    const [allQuotes, wordData, factData] = await Promise.all([
      API.fetchAllData(),
      API.fetchWordDefinition(HERO_WORDS[Math.floor(Math.random() * HERO_WORDS.length)]),
      API.fetchRandomFact()
    ]);

    // Quote of the Day — pick random from fetched quotes
    if (quoteCard && allQuotes.length > 0) {
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      quoteCard.innerHTML = `
        <p class="quote-text text-sm md:text-base dark:text-[#a8a29e] text-[#57534e] mb-2 leading-relaxed font-['Playfair_Display'] italic">
          "${escapeHTML(randomQuote.text.length > 150 ? randomQuote.text.substring(0, 150) + '...' : randomQuote.text)}"
        </p>
        <p class="text-xs font-semibold text-[#8b1a1a] font-sans">— ${escapeHTML(randomQuote.author)}</p>`;
    }

    // Word of the Day
    if (wordCard && wordData) {
      const firstMeaning = wordData.meanings?.[0];
      const firstDef = firstMeaning?.definitions?.[0];
      wordCard.innerHTML = `
        <p class="text-lg font-bold font-['Playfair_Display'] text-[#8b1a1a] mb-1">${escapeHTML(wordData.word)}</p>
        ${wordData.phonetic ? `<p class="dark:text-[#6b6560] text-[#8a8580] text-xs mb-1 font-sans">${escapeHTML(wordData.phonetic)}</p>` : ''}
        ${firstMeaning ? `<p class="text-[#8b1a1a] text-xs italic mb-1 font-sans">${escapeHTML(firstMeaning.partOfSpeech)}</p>` : ''}
        ${firstDef ? `<p class="dark:text-[#a8a29e] text-[#57534e] text-xs leading-relaxed">${escapeHTML(firstDef.definition.length > 120 ? firstDef.definition.substring(0, 120) + '...' : firstDef.definition)}</p>` : ''}`;
    } else if (wordCard) {
      wordCard.innerHTML = `<p class="dark:text-[#6b6560] text-[#8a8580] text-sm font-sans">Word unavailable right now.</p>`;
    }

    // Random Fact
    if (factCard && factData) {
      factCard.innerHTML = `
        <p class="dark:text-[#a8a29e] text-[#57534e] text-sm leading-relaxed">${escapeHTML(factData.text)}</p>`;
    } else if (factCard) {
      factCard.innerHTML = `<p class="dark:text-[#6b6560] text-[#8a8580] text-sm font-sans">Fact unavailable right now.</p>`;
    }

    return allQuotes;
  }

  /**
   * Initialize back-to-top button.
   */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 500) {
        btn.style.display = 'flex';
        btn.classList.remove('hide');
      } else {
        btn.classList.add('hide');
        setTimeout(() => {
          if (btn.classList.contains('hide')) btn.style.display = 'none';
        }, 300);
      }
    }, 150));

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Main initialization — called on DOMContentLoaded.
   * Orchestrates all module initialization.
   */
  async function init() {
    // 1. Initialize theme (dark/light mode)
    ThemeManager.init();

    // 2. Set up theme toggle buttons
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => ThemeManager.toggle());
    }
    const themeBtnMobile = document.getElementById('theme-toggle-mobile');
    if (themeBtnMobile) {
      themeBtnMobile.addEventListener('click', () => ThemeManager.toggle());
    }

    // 3. Initialize navigation
    initNavigation();

    // 4. Initialize back-to-top
    initBackToTop();

    // 5. Load hero data and quotes simultaneously
    const quotes = await loadHeroData();

    // 6. Initialize Quotes Explorer
    const quotesGrid = document.getElementById('quotes-grid');
    if (quotesGrid) showSkeletonLoader(quotesGrid, 6);

    QuotesExplorer.init().then(() => {
      // 7. Build authors from loaded quotes
      Authors.buildAuthorList(QuotesExplorer.getAllQuotes());
    });

    // 8. Initialize all modules
    Authors.init();
    WordExplorer.init();
    Favorites.init();
    OnThisDay.init();

    // 9. New modules
    Schools.init();
    Debate.init();
    Remix.init();
    ZenMode.init();

    // 10. CTA button
    const ctaBtn = document.getElementById('cta-explore');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => scrollToElement('quotes'));
    }

    console.log('Chable Tair — The Perspective Engine initialized.');
  }

  // --- Start the app on DOM ready ---
  document.addEventListener('DOMContentLoaded', init);

  return { init, loadHeroData, closeMobileMenu };
})();
