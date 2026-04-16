/* ============================================
   Chable Tair — Philosophical Debate Module
   Side-by-side debate topics with voting,
   results tracking, and topic navigation
   ============================================ */

const Debate = (() => {
  /* --- Debate Topics Data --- */
  const topics = [
    {
      id: 'suffering',
      name: 'Suffering',
      question: 'Is suffering essential?',
      sideA: {
        author: 'Nietzsche',
        quote: 'To live is to suffer, to survive is to find some meaning in the suffering.',
        position: 'Suffering gives meaning'
      },
      sideB: {
        author: 'Vivekananda',
        quote: 'The whole secret of existence is to have no fear.',
        position: 'Fearlessness transcends suffering'
      }
    },
    {
      id: 'happiness',
      name: 'Happiness',
      question: 'Is happiness a choice?',
      sideA: {
        author: 'Aristotle',
        quote: 'Happiness depends upon ourselves.',
        position: 'Happiness is self-determined'
      },
      sideB: {
        author: 'Mill',
        quote: 'Ask yourself whether you are happy, and you cease to be so.',
        position: 'Happiness defies introspection'
      }
    },
    {
      id: 'death',
      name: 'Death',
      question: 'Should we fear death?',
      sideA: {
        author: 'Marcus Aurelius',
        quote: 'It is not death that a man should fear, but he should fear never beginning to live.',
        position: 'Fear unlived life, not death'
      },
      sideB: {
        author: 'Twain',
        quote: 'The fear of death follows from the fear of life. A man who lives fully is prepared to die at any time.',
        position: 'Full living dissolves fear'
      }
    },
    {
      id: 'freedom',
      name: 'Freedom',
      question: 'Is true freedom possible?',
      sideA: {
        author: 'Rousseau',
        quote: 'Man is born free, and everywhere he is in chains.',
        position: 'Freedom is our birthright, lost to society'
      },
      sideB: {
        author: 'Sartre',
        quote: 'Freedom is what we do with what is done to us.',
        position: 'Freedom is forged through response'
      }
    },
    {
      id: 'truth',
      name: 'Truth',
      question: 'Is there absolute truth?',
      sideA: {
        author: 'Nietzsche',
        quote: 'There are no facts, only interpretations.',
        position: 'Truth is perspectival'
      },
      sideB: {
        author: 'Churchill',
        quote: 'The truth is incontrovertible. Malice may attack it, ignorance may deride it, but in the end, there it is.',
        position: 'Truth is absolute and enduring'
      }
    },
    {
      id: 'love',
      name: 'Love',
      question: 'Is love rational?',
      sideA: {
        author: 'Pascal',
        quote: 'The heart has its reasons which reason knows nothing of.',
        position: 'Love transcends reason'
      },
      sideB: {
        author: 'Plato',
        quote: 'Love is a serious mental disease.',
        position: 'Love is irrational affliction'
      }
    },
    {
      id: 'meaning',
      name: 'Meaning',
      question: 'Is life inherently meaningful?',
      sideA: {
        author: 'Nietzsche',
        quote: 'He who has a why to live can bear almost any how.',
        position: 'Meaning is self-created purpose'
      },
      sideB: {
        author: 'Picasso',
        quote: 'The meaning of life is to find your gift. The purpose of life is to give it away.',
        position: 'Meaning is discovered and shared'
      }
    },
    {
      id: 'knowledge',
      name: 'Knowledge',
      question: 'Is knowledge power or burden?',
      sideA: {
        author: 'Bacon',
        quote: 'Knowledge is power.',
        position: 'Knowledge empowers'
      },
      sideB: {
        author: 'Ecclesiastes',
        quote: 'For in much wisdom is much grief, and he who increases knowledge increases sorrow.',
        position: 'Knowledge burdens the soul'
      }
    }
  ];

  /* --- Module State --- */
  const STORAGE_KEY = 'chable-tair-debate-votes';
  let currentTopicIndex = 0;
  let votes = {};

  /* --- localStorage CRUD --- */

  /**
   * Load votes from localStorage.
   */
  function loadVotes() {
    try {
      votes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      votes = {};
    }
  }

  /**
   * Save votes to localStorage.
   */
  function saveVotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  }

  /* --- Voting --- */

  /**
   * Cast a vote for a side on a topic.
   * Increments vote count, saves, re-renders results, shows toast.
   * @param {string} topicId - The topic identifier
   * @param {string} side - 'a' or 'b'
   */
  function vote(topicId, side) {
    if (!votes[topicId]) {
      votes[topicId] = { a: 0, b: 0 };
    }
    votes[topicId][side] += 1;
    saveVotes();
    renderResults(topicId);

    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      const chosen = side === 'a' ? topic.sideA : topic.sideB;
      showToast(`You resonated with ${escapeHTML(chosen.author)}`, 'success');
    }
  }

  /* --- Rendering --- */

  /**
   * Render the current debate topic into #debate-container.
   * Uses the debate-side glass card pattern with VS divider.
   */
  function renderTopic() {
    const topic = topics[currentTopicIndex];
    if (!topic) return;

    const topicLabel = document.getElementById('debate-topic-label');
    const questionEl = document.getElementById('debate-question');
    const container = document.getElementById('debate-container');
    const resultsEl = document.getElementById('debate-results');

    if (topicLabel) topicLabel.textContent = escapeHTML(topic.name);
    if (questionEl) questionEl.textContent = escapeHTML(topic.question);

    if (container) {
      const sides = [
        { key: 'a', data: topic.sideA },
        { key: 'b', data: topic.sideB }
      ];

      const cardsHtml = sides.map((side, index) => {
        const card = `
          <div class="debate-side glass rounded-xl p-6 flex flex-col justify-between
                      hover:border-[#8b1a1a]/40 border border-transparent transition-all duration-300">
            <div>
              <p class="font-['Playfair_Display'] italic text-lg md:text-xl leading-relaxed
                        dark:text-[#f5f0eb] text-[#0a0a0a] mb-4">
                "${escapeHTML(side.data.quote)}"
              </p>
              <p class="text-sm font-semibold text-[#8b1a1a] mb-1 font-sans">
                — ${escapeHTML(side.data.author)}
              </p>
              <p class="text-xs dark:text-[#6b6560] text-[#8a8580] font-sans">
                ${escapeHTML(side.data.position)}
              </p>
            </div>
            <button onclick="Debate.vote('${escapeHTML(topic.id)}', '${side.key}')"
                    class="mt-6 w-full py-2.5 px-4 rounded-lg text-sm font-semibold font-sans
                           bg-[#8b1a1a] text-white hover:bg-[#a52222] transition-colors duration-200
                           active:scale-[0.98]">
              This Resonates
            </button>
          </div>`;

        // Insert VS divider between the two cards (visible on md+)
        const divider = index === 0
          ? `<div class="hidden md:flex items-center justify-center">
               <span class="text-[#8b1a1a] font-bold text-xl font-serif select-none">VS</span>
             </div>`
          : '';

        return card + divider;
      }).join('');

      container.innerHTML = cardsHtml;
    }

    if (resultsEl) {
      renderResults(topic.id);
    }
  }

  /**
   * Render vote results as a percentage bar for a given topic.
   * Shows left %, progress bar, right %, and total count.
   * @param {string} topicId - The topic identifier
   */
  function renderResults(topicId) {
    const resultsEl = document.getElementById('debate-results');
    if (!resultsEl) return;

    const topicVotes = votes[topicId] || { a: 0, b: 0 };
    const total = topicVotes.a + topicVotes.b;

    if (total === 0) {
      resultsEl.innerHTML = `
        <p class="text-center text-sm dark:text-[#6b6560] text-[#8a8580] font-sans py-2">
          No perspectives shared yet. Be the first!
        </p>`;
      return;
    }

    const pctA = Math.round((topicVotes.a / total) * 100);
    const pctB = 100 - pctA;

    const topic = topics.find(t => t.id === topicId);
    const authorA = topic ? escapeHTML(topic.sideA.author) : 'Side A';
    const authorB = topic ? escapeHTML(topic.sideB.author) : 'Side B';

    resultsEl.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm font-sans">
          <span class="dark:text-[#f5f0eb] text-[#0a0a0a] font-medium">
            ${authorA} <span class="text-[#8b1a1a] font-bold">${escapeHTML(String(pctA))}%</span>
          </span>
          <span class="dark:text-[#f5f0eb] text-[#0a0a0a] font-medium">
            <span class="text-[#8b1a1a] font-bold">${escapeHTML(String(pctB))}%</span> ${authorB}
          </span>
        </div>
        <div class="w-full h-3 rounded-full dark:bg-white/[0.06] bg-black/[0.06] overflow-hidden">
          <div class="h-full bg-[#8b1a1a] rounded-full transition-all duration-700 ease-out"
               style="width: ${pctA}%"></div>
        </div>
        <p class="text-center text-xs dark:text-[#6b6560] text-[#8a8580] font-sans">
          ${escapeHTML(String(total))} perspective${total !== 1 ? 's' : ''} shared
        </p>
      </div>`;
  }

  /* --- Topic Navigation --- */

  /**
   * Navigate to the next debate topic. Wraps around to first.
   */
  function nextTopic() {
    currentTopicIndex = (currentTopicIndex + 1) % topics.length;
    renderTopic();
  }

  /**
   * Navigate to the previous debate topic. Wraps around to last.
   */
  function prevTopic() {
    currentTopicIndex = (currentTopicIndex - 1 + topics.length) % topics.length;
    renderTopic();
  }

  /* --- Initialization --- */

  /**
   * Initialize the Debate module.
   * Loads persisted votes and renders the first topic.
   */
  function init() {
    loadVotes();
    renderTopic();
  }

  /* --- Public API --- */
  return {
    init,
    vote,
    nextTopic,
    prevTopic,
    renderTopic,
    renderResults
  };
})();
