/* ============================================
   Chable Tair — Word Explorer Module
   Dictionary lookup with definitions,
   phonetics, parts of speech
   ============================================ */

const WordExplorer = (() => {
  /* --- Module State --- */
  const state = {
    currentWord: null,
    activePOS: 0 // active part-of-speech tab index
  };

  /**
   * Search for a word definition.
   * @param {string} word - The word to look up
   */
  async function searchWord(word) {
    if (!word || word.trim() === '') return;

    const resultContainer = document.getElementById('word-result');
    const errorContainer = document.getElementById('word-error');

    if (errorContainer) errorContainer.classList.add('hidden');

    // Show loading
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="flex justify-center py-12">
          <div class="pulse-dot"><span></span><span></span><span></span></div>
        </div>`;
      resultContainer.classList.remove('hidden');
    }

    const data = await API.fetchWordDefinition(word.trim());

    if (!data) {
      if (resultContainer) resultContainer.classList.add('hidden');
      if (errorContainer) {
        errorContainer.classList.remove('hidden');
        errorContainer.innerHTML = `
          <div class="text-center py-8">
            <p class="text-2xl mb-2">🔍</p>
            <p class="dark:text-gray-300 text-gray-600 text-lg">No definition found for "<strong>${escapeHTML(word)}</strong>"</p>
            <p class="dark:text-gray-500 text-gray-400 text-sm mt-2">Try a different word or check the spelling.</p>
          </div>`;
      }
      return;
    }

    state.currentWord = data;
    state.activePOS = 0;
    renderDefinition(data);
  }

  /**
   * Render the word definition.
   * Uses .map() over meanings and definitions — HOF showcase.
   * @param {Object} data - Dictionary API response object
   */
  function renderDefinition(data) {
    const container = document.getElementById('word-result');
    if (!container) return;
    container.classList.remove('hidden');

    const phonetic = data.phonetic ||
      (data.phonetics && data.phonetics.find(p => p.text)?.text) || '';

    const audioUrl = data.phonetics &&
      data.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;

    const meanings = data.meanings || [];

    // Part of speech tabs using .map() — HOF
    const posTabs = meanings.map((m, index) => `
      <button onclick="WordExplorer.switchPOS(${index})"
              class="pos-tab px-4 py-2 rounded-lg text-sm font-medium transition-all
                     ${index === state.activePOS
                       ? 'bg-[#8b1a1a] text-white'
                       : 'dark:bg-white/5 bg-gray-200 dark:text-gray-300 text-gray-600 hover:bg-[#8b1a1a]/20'}">
        ${escapeHTML(m.partOfSpeech)}
      </button>
    `).join('');

    // Active meaning's definitions using .map() — HOF
    const activeMeaning = meanings[state.activePOS];
    const definitions = activeMeaning
      ? activeMeaning.definitions.map((def, index) => `
          <div class="mb-4 pl-4 border-l-2 border-[#8b1a1a]/30">
            <p class="dark:text-gray-200 text-gray-700">
              <span class="text-[#8b1a1a] font-semibold mr-2">${index + 1}.</span>
              ${escapeHTML(def.definition)}
            </p>
            ${def.example ? `
              <p class="dark:text-gray-400 text-gray-500 text-sm mt-1 italic">
                Example: "${escapeHTML(def.example)}"
              </p>
            ` : ''}
          </div>
        `).join('')
      : '<p class="dark:text-gray-400 text-gray-500">No definitions available.</p>';

    // Synonyms using .map() — HOF
    const synonyms = activeMeaning?.synonyms || [];
    const synonymsHtml = synonyms.length > 0
      ? `<div class="mt-4">
           <h4 class="text-sm font-semibold dark:text-gray-300 text-gray-600 mb-2">Synonyms</h4>
           <div class="flex flex-wrap gap-2">
             ${synonyms.slice(0, 10).map(s => `
               <button onclick="WordExplorer.searchFromSynonym('${escapeHTML(s)}')"
                       class="text-xs px-3 py-1 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a] hover:bg-[#8b1a1a]/30 transition-colors cursor-pointer">
                 ${escapeHTML(s)}
               </button>
             `).join('')}
           </div>
         </div>`
      : '';

    // Antonyms
    const antonyms = activeMeaning?.antonyms || [];
    const antonymsHtml = antonyms.length > 0
      ? `<div class="mt-4">
           <h4 class="text-sm font-semibold dark:text-gray-300 text-gray-600 mb-2">Antonyms</h4>
           <div class="flex flex-wrap gap-2">
             ${antonyms.slice(0, 10).map(a => `
               <button onclick="WordExplorer.searchFromSynonym('${escapeHTML(a)}')"
                       class="text-xs px-3 py-1 rounded-full dark:bg-white/[0.05] bg-black/[0.05] dark:text-[#a8a29e] text-[#57534e] hover:bg-red-600/30 transition-colors cursor-pointer">
                 ${escapeHTML(a)}
               </button>
             `).join('')}
           </div>
         </div>`
      : '';

    container.innerHTML = `
      <div class="glass rounded-2xl p-6 md:p-8">
        <!-- Word Header -->
        <div class="flex items-center gap-4 mb-6 flex-wrap">
          <h3 class="text-3xl md:text-4xl font-bold font-serif text-[#8b1a1a]">${escapeHTML(data.word)}</h3>
          ${phonetic ? `<span class="dark:text-gray-400 text-gray-500 text-lg">${escapeHTML(phonetic)}</span>` : ''}
          ${audioUrl ? `
            <button onclick="new Audio('${escapeHTML(audioUrl)}').play()"
                    class="p-2 rounded-full dark:bg-white/10 bg-gray-200 hover:bg-[#8b1a1a]/20 transition-colors" title="Listen to pronunciation">
              <svg class="w-5 h-5 text-[#8b1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- Part of Speech Tabs -->
        <div class="flex flex-wrap gap-2 mb-6">${posTabs}</div>

        <!-- Definitions -->
        <div class="space-y-1">${definitions}</div>

        <!-- Synonyms -->
        ${synonymsHtml}

        <!-- Antonyms -->
        ${antonymsHtml}
      </div>`;
  }

  /**
   * Switch the active part-of-speech tab.
   * @param {number} index - Tab index
   */
  function switchPOS(index) {
    state.activePOS = index;
    if (state.currentWord) {
      renderDefinition(state.currentWord);
    }
  }

  /**
   * Search from a synonym/antonym click.
   * @param {string} word - Word to search
   */
  function searchFromSynonym(word) {
    const input = document.getElementById('word-search');
    if (input) input.value = word;
    searchWord(word);
  }

  /**
   * Initialize the Word Explorer section.
   * Sets up search input with debounce.
   */
  function init() {
    const searchInput = document.getElementById('word-search');
    const searchBtn = document.getElementById('word-search-btn');

    if (searchInput) {
      // Search on Enter key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          searchWord(searchInput.value);
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        if (searchInput) searchWord(searchInput.value);
      });
    }
  }

  return { init, searchWord, switchPOS, searchFromSynonym, renderDefinition };
})();
