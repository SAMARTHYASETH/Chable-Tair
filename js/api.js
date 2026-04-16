/* ============================================
   Chable Tair — API Module
   All API calls, fetchWithRetry, autoTag,
   and quote normalization
   ============================================ */

const API = (() => {
  /* --- Tag keyword map for auto-tagging quotes --- */
  const TAG_MAP = {
    philosophy:  ['wisdom', 'truth', 'virtue', 'knowledge', 'reason', 'mind', 'think', 'philosophy', 'philosopher'],
    psychology:  ['mind', 'behavior', 'emotion', 'feel', 'conscious', 'habit', 'fear', 'psychology', 'mental'],
    wisdom:      ['wise', 'wisdom', 'learn', 'understand', 'knowledge', 'truth', 'fool'],
    life:        ['life', 'live', 'death', 'exist', 'purpose', 'journey', 'path', 'world'],
    motivation:  ['success', 'achieve', 'goal', 'dream', 'effort', 'courage', 'strength', 'great', 'power'],
    change:      ['change', 'grow', 'transform', 'evolve', 'adapt', 'begin', 'new', 'future'],
    love:        ['love', 'heart', 'compassion', 'kind', 'care', 'empathy', 'friend'],
    science:     ['nature', 'universe', 'science', 'discover', 'observe', 'reason', 'experiment']
  };

  /**
   * Fetch with retry — wraps fetch with error handling and retry logic.
   * @param {string} url - The URL to fetch
   * @param {number} retries - Number of retries (default 3)
   * @returns {Promise<any>} Parsed JSON response
   */
  async function fetchWithRetry(url, retries = 3) {
    let lastError;
    // Use Array.from to create retry attempts array, then use reduce-style sequential logic
    const attempts = Array.from({ length: retries }, (_, i) => i);

    // Sequential retry using a loop-free recursive approach
    async function tryFetch(attemptIndex) {
      if (attemptIndex >= attempts.length) {
        throw lastError || new Error('All fetch attempts failed');
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.json();
      } catch (error) {
        lastError = error;
        console.warn(`Fetch attempt ${attemptIndex + 1} failed for ${url}:`, error.message);
        // Wait before retry (exponential backoff)
        if (attemptIndex < attempts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attemptIndex + 1)));
        }
        return tryFetch(attemptIndex + 1);
      }
    }

    return tryFetch(0);
  }

  /**
   * Auto-tag a quote based on keyword matching.
   * Uses .filter(), .some(), and .map() — HOF showcase.
   * @param {string} text - The quote text to analyze
   * @returns {string[]} Array of tag names
   */
  function autoTag(text) {
    const lowerText = text.toLowerCase();
    const tags = Object.entries(TAG_MAP)
      .filter(([tag, keywords]) => keywords.some(kw => lowerText.includes(kw)))
      .map(([tag]) => tag);
    return tags.length > 0 ? tags : ['general'];
  }

  /**
   * Fetch all quotes from DummyJSON.
   * @returns {Promise<Array>} Normalized quotes array
   */
  async function fetchAllQuotes() {
    try {
      const data = await fetchWithRetry('https://dummyjson.com/quotes?limit=0');
      // Normalize using .map() — HOF
      return data.quotes.map(q => ({
        id: `dj-${q.id}`,
        text: q.quote,
        author: q.author,
        tags: autoTag(q.quote)
      }));
    } catch (error) {
      console.error('Failed to fetch DummyJSON quotes:', error);
      showToast('Failed to load quotes. Retrying...', 'error');
      return [];
    }
  }

  /**
   * Fetch stoic philosophy quotes.
   * @param {number} count - Number of quotes to fetch (default 50)
   * @returns {Promise<Array>} Normalized quotes array
   */
  async function fetchStoicQuotes(count = 50) {
    try {
      const data = await fetchWithRetry(`https://stoic-quotes.com/api/quotes?num=${count}`);
      // Normalize using .map() — HOF, with unique IDs
      return data.map((q, index) => ({
        id: `stoic-${index}`,
        text: q.text,
        author: q.author,
        tags: [...autoTag(q.text), 'philosophy'] // Always tag stoic quotes with philosophy
          .filter((tag, i, arr) => arr.indexOf(tag) === i) // Deduplicate using .filter()
      }));
    } catch (error) {
      console.error('Failed to fetch Stoic quotes:', error);
      return [];
    }
  }

  /**
   * Fetch and merge all quote data from both sources.
   * @returns {Promise<Array>} Unified, tagged quotes array
   */
  async function fetchAllData() {
    const [dummyQuotes, stoicQuotes] = await Promise.all([
      fetchAllQuotes(),
      fetchStoicQuotes()
    ]);
    // Merge using spread and concatenation
    return [...dummyQuotes, ...stoicQuotes];
  }

  /**
   * Fetch word definition from the Free Dictionary API.
   * @param {string} word - The word to look up
   * @returns {Promise<Object|null>} Definition data or null
   */
  async function fetchWordDefinition(word) {
    try {
      const data = await fetchWithRetry(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      return data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch definition for "${word}":`, error);
      return null;
    }
  }

  /**
   * Fetch On This Day events from Wikipedia.
   * @returns {Promise<Object|null>} Events data with events, births, deaths
   */
  async function fetchOnThisDay() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    try {
      const data = await fetchWithRetry(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${mm}/${dd}`
      );
      return data;
    } catch (error) {
      console.error('Failed to fetch On This Day data:', error);
      showToast('Failed to load historical events.', 'error');
      return null;
    }
  }

  /**
   * Fetch a random useless fact.
   * @returns {Promise<Object|null>} Fact object with text and source
   */
  async function fetchRandomFact() {
    try {
      const data = await fetchWithRetry('https://uselessfacts.jsph.pl/api/v2/facts/random');
      return data;
    } catch (error) {
      console.error('Failed to fetch random fact:', error);
      return null;
    }
  }

  return {
    fetchWithRetry,
    autoTag,
    fetchAllQuotes,
    fetchStoicQuotes,
    fetchAllData,
    fetchWordDefinition,
    fetchOnThisDay,
    fetchRandomFact
  };
})();
