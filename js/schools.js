/* ============================================
   Chable Tair — Schools of Thought Module
   Browse philosophical schools, click to filter
   quotes by school keywords using HOFs
   ============================================ */

const Schools = (() => {
  /* --- Data: 10 Schools of Thought --- */
  const schools = [
    {
      id: 'stoicism',
      name: 'Stoicism',
      era: 'c. 300 BCE – 200 CE',
      thinkers: ['Marcus Aurelius', 'Seneca', 'Epictetus'],
      principle: 'Virtue is the sole good. External events are beyond our control; we can only control our responses through reason and self-discipline.',
      quote: { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
      keywords: ['virtue', 'control', 'reason', 'discipline', 'endure', 'nature', 'stoic', 'duty', 'acceptance']
    },
    {
      id: 'existentialism',
      name: 'Existentialism',
      era: '19th – 20th Century',
      thinkers: ['Jean-Paul Sartre', 'Simone de Beauvoir', 'Søren Kierkegaard'],
      principle: 'Existence precedes essence. We are condemned to be free — each individual must create meaning through authentic choices and personal responsibility.',
      quote: { text: 'Man is nothing else but what he makes of himself.', author: 'Jean-Paul Sartre' },
      keywords: ['freedom', 'choice', 'authentic', 'existence', 'meaning', 'self', 'anxiety', 'responsibility', 'absurd']
    },
    {
      id: 'absurdism',
      name: 'Absurdism',
      era: '20th Century',
      thinkers: ['Albert Camus', 'Søren Kierkegaard', 'Thomas Nagel'],
      principle: 'The universe is indifferent and meaningless, yet humans ceaselessly search for meaning. The absurd arises from this conflict — and we must embrace it without surrender.',
      quote: { text: 'One must imagine Sisyphus happy.', author: 'Albert Camus' },
      keywords: ['absurd', 'meaning', 'revolt', 'struggle', 'happiness', 'defiance', 'purpose', 'indifferent', 'embrace']
    },
    {
      id: 'nihilism',
      name: 'Nihilism',
      era: '19th Century',
      thinkers: ['Friedrich Nietzsche', 'Ivan Turgenev', 'Max Stirner'],
      principle: 'Life has no inherent meaning, purpose, or intrinsic value. All established moral and religious values are baseless — only through this recognition can one begin to create new values.',
      quote: { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
      keywords: ['meaning', 'nothing', 'value', 'purpose', 'illusion', 'power', 'will', 'destruction', 'truth']
    },
    {
      id: 'epicureanism',
      name: 'Epicureanism',
      era: 'c. 307 BCE',
      thinkers: ['Epicurus', 'Lucretius', 'Philodemus'],
      principle: 'Pleasure — especially tranquillity and freedom from fear — is the highest good. A simple life among friends, guided by prudence, leads to lasting happiness.',
      quote: { text: 'Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.', author: 'Epicurus' },
      keywords: ['pleasure', 'happiness', 'friendship', 'simple', 'peace', 'fear', 'desire', 'moderation', 'tranquil']
    },
    {
      id: 'zen-buddhism',
      name: 'Zen Buddhism',
      era: 'c. 7th Century CE',
      thinkers: ['Bodhidharma', 'Dōgen', 'Thích Nhất Hạnh'],
      principle: 'Direct insight into one\'s true nature through meditation and mindfulness. Enlightenment is not found in scriptures but in the immediate experience of the present moment.',
      quote: { text: 'When you realize nothing is lacking, the whole world belongs to you.', author: 'Laozi (Zen tradition)' },
      keywords: ['mindfulness', 'present', 'meditation', 'silence', 'awareness', 'breath', 'peace', 'compassion', 'stillness']
    },
    {
      id: 'taoism',
      name: 'Taoism',
      era: 'c. 4th Century BCE',
      thinkers: ['Laozi', 'Zhuangzi', 'Liezi'],
      principle: 'The Tao (the Way) is the fundamental, nameless force that flows through all things. By embracing simplicity, spontaneity, and wu wei (non-action), one achieves harmony with the natural order.',
      quote: { text: 'The journey of a thousand miles begins with a single step.', author: 'Laozi' },
      keywords: ['way', 'nature', 'flow', 'harmony', 'balance', 'simplicity', 'water', 'patience', 'stillness']
    },
    {
      id: 'pragmatism',
      name: 'Pragmatism',
      era: '1870s',
      thinkers: ['William James', 'Charles Sanders Peirce', 'John Dewey'],
      principle: 'The truth of an idea is measured by its practical consequences. Thought is a tool for action — beliefs are justified not by abstract reasoning alone but by their usefulness in experience.',
      quote: { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
      keywords: ['action', 'practical', 'experience', 'truth', 'consequence', 'useful', 'belief', 'inquiry', 'difference']
    },
    {
      id: 'rationalism',
      name: 'Rationalism',
      era: '17th – 18th Century',
      thinkers: ['René Descartes', 'Baruch Spinoza', 'Gottfried Wilhelm Leibniz'],
      principle: 'Reason is the chief source and test of knowledge. Certain truths — innate ideas and logical deductions — exist independently of sensory experience and form the foundation of understanding.',
      quote: { text: 'I think, therefore I am.', author: 'René Descartes' },
      keywords: ['reason', 'logic', 'mind', 'truth', 'knowledge', 'thought', 'certainty', 'innate', 'deduction']
    },
    {
      id: 'empiricism',
      name: 'Empiricism',
      era: '17th – 18th Century',
      thinkers: ['John Locke', 'David Hume', 'George Berkeley'],
      principle: 'All knowledge originates in sensory experience. The mind at birth is a tabula rasa — a blank slate — and understanding is built entirely through observation, perception, and reflection.',
      quote: { text: 'No man\'s knowledge here can go beyond his experience.', author: 'John Locke' },
      keywords: ['experience', 'senses', 'observation', 'knowledge', 'perception', 'evidence', 'nature', 'inquiry', 'reason']
    }
  ];

  /**
   * Create an HTML card for a single school of thought.
   * Uses escapeHTML() from utils.js for all dynamic text.
   * @param {Object} school - A school data object
   * @returns {string} HTML string for the school card
   */
  function createSchoolCard(school) {
    const firstLetter = escapeHTML(school.name.charAt(0));
    const restOfName = escapeHTML(school.name.slice(1));

    // Thinker badges — HOF .map()
    const thinkerBadges = school.thinkers
      .map(t => `<span class="inline-block text-xs px-2.5 py-1 rounded-full font-medium
                    dark:bg-white/[0.06] bg-black/[0.04]
                    dark:text-[#a8a29e] text-[#57534e]">${escapeHTML(t)}</span>`)
      .join('');

    // Keywords as small muted pills — HOF .map()
    const keywordPills = school.keywords
      .map(kw => `<span class="text-[10px] px-1.5 py-0.5 rounded
                     dark:bg-white/[0.06] bg-black/[0.04]
                     dark:text-[#6b6560] text-[#8a8580]">${escapeHTML(kw)}</span>`)
      .join('');

    return `
      <div class="glass rounded-xl border dark:border-white/[0.06] border-black/[0.06]
                  p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
           onclick="Schools.handleClick('${escapeHTML(school.id)}')">

        <!-- School Name with Drop-Cap -->
        <div class="mb-3">
          <h3 class="text-2xl font-bold dark:text-[#f5f0eb] text-[#0a0a0a]" style="font-family: 'Playfair Display', serif;">
            <span class="text-4xl leading-none text-[#8b1a1a] font-bold">${firstLetter}</span>${restOfName}
          </h3>
          <p class="text-xs uppercase tracking-wider mt-1
                    dark:text-[#6b6560] text-[#8a8580]">${escapeHTML(school.era)}</p>
        </div>

        <!-- Principle -->
        <p class="text-sm leading-relaxed mb-4
                  dark:text-[#a8a29e] text-[#57534e]">
          ${escapeHTML(school.principle)}
        </p>

        <!-- Thinker Badges -->
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${thinkerBadges}
        </div>

        <!-- Representative Quote -->
        <blockquote class="border-l-2 border-[#8b1a1a]/30 pl-4 mb-4">
          <p class="text-sm italic leading-relaxed
                    dark:text-[#f5f0eb]/80 text-[#0a0a0a]/80">
            "${escapeHTML(school.quote.text)}"
          </p>
          <cite class="block text-xs mt-1 not-italic
                       dark:text-[#6b6560] text-[#8a8580]">
            — ${escapeHTML(school.quote.author)}
          </cite>
        </blockquote>

        <!-- Keywords -->
        <div class="flex flex-wrap gap-1 mb-2">
          ${keywordPills}
        </div>

        <!-- CTA hint -->
        <p class="text-xs font-medium text-[#8b1a1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
          Explore quotes &rarr;
        </p>
      </div>`;
  }

  /**
   * Render all school cards into #schools-grid.
   * Uses .map() HOF to transform data → HTML.
   */
  function render() {
    const container = document.getElementById('schools-grid');
    if (!container) return;

    // HOF .map() — transform each school object into an HTML card string
    container.innerHTML = schools
      .map(school => createSchoolCard(school))
      .join('');
  }

  /**
   * Handle a school card click — filter quotes by that school's keywords.
   * Delegates to QuotesExplorer.filterByKeywords().
   * @param {string} schoolId - The id of the clicked school
   */
  function handleClick(schoolId) {
    // HOF .find() — locate the school by id
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    if (typeof QuotesExplorer !== 'undefined' && QuotesExplorer.filterByKeywords) {
      QuotesExplorer.filterByKeywords(school.keywords, school.name);
    }
  }

  /**
   * Initialize the Schools module.
   * Renders the school cards on load.
   */
  function init() {
    render();
  }

  /* --- Public API --- */
  return { render, createSchoolCard, handleClick, init };
})();
