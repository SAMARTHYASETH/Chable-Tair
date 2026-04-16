# Chable Tair — The Perspective Engine

> A philosophy, psychology, and quotes exploration app that helps you see the world through different lenses.

![License](https://img.shields.io/badge/license-MIT-purple)
![Tech](https://img.shields.io/badge/tech-HTML%20%2B%20Tailwind%20%2B%20Vanilla%20JS-blueviolet)
![APIs](https://img.shields.io/badge/APIs-5%20free%20APIs-gold)

## Live Demo

[View Live Demo](#) *(Add your deployment URL here)*

## Screenshots

*(Add screenshots of the app here)*

| Dark Mode | Light Mode |
|-----------|------------|
| ![Dark Mode](#) | ![Light Mode](#) |

## Features

- **Quotes Explorer** — Browse 1,500+ quotes from multiple sources with search, filter by category, sort, and pagination
- **Auto-Tagging** — Quotes are automatically categorized (Philosophy, Psychology, Wisdom, Life, Motivation, Change, Love, Science) using keyword analysis
- **On This Day** — Discover historical events, births, and deaths that happened on today's date via Wikipedia
- **Great Minds** — Explore authors grouped by quote count with search and sort
- **Word Explorer** — Dictionary lookup with definitions, phonetics, audio pronunciation, synonyms, and antonyms
- **Favorites System** — Save, search, sort, and export your favorite quotes (persisted in localStorage)
- **Dark/Light Mode** — Toggle between themes with smooth transitions (preference saved to localStorage)
- **Daily Perspective** — Hero section with Quote of the Day, Word of the Day, and a Random Fact
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop
- **Glassmorphism UI** — Modern glass-effect cards with backdrop blur
- **Animated Particles** — Floating particle effects in the hero section
- **Skeleton Loaders** — Smooth loading placeholders while APIs respond
- **Toast Notifications** — User feedback for actions (add/remove favorites, copy to clipboard, errors)
- **Share Quotes** — Copy quotes to clipboard with one click
- **Smooth Navigation** — Scroll-based section highlighting and smooth scroll

## APIs Used

| API | Purpose | URL |
|-----|---------|-----|
| DummyJSON Quotes | 1,454 general quotes | [dummyjson.com/quotes](https://dummyjson.com/quotes) |
| Stoic Quotes | 50 philosophy quotes | [stoic-quotes.com/api](https://stoic-quotes.com/api/quotes) |
| Free Dictionary | Word definitions & phonetics | [dictionaryapi.dev](https://api.dictionaryapi.dev) |
| Wikipedia On This Day | Historical events by date | [api.wikimedia.org](https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday) |
| Useless Facts | Random fun facts | [uselessfacts.jsph.pl](https://uselessfacts.jsph.pl) |

All APIs are **free and require no authentication**.

## Technologies

- **HTML5** — Semantic markup, accessibility attributes
- **Tailwind CSS** (CDN) — Utility-first styling with dark mode support
- **Vanilla JavaScript** (ES6+) — No frameworks, no build tools
- **Google Fonts** — Inter (body) + Playfair Display (headings)
- **localStorage** — Client-side persistence for favorites and theme

## How to Run

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. That's it! No build step, no `npm install`, no server required.

```bash
# Clone the repo
git clone https://github.com/yourusername/chable-tair.git

# Open in browser
cd chable-tair
open index.html    # macOS
# or
start index.html   # Windows
# or
xdg-open index.html  # Linux
```

## Project Structure

```
chable-tair/
├── index.html              Main SPA — all sections in one file
├── css/
│   └── styles.css          Custom CSS: glassmorphism, animations, gradients, scrollbar
├── js/
│   ├── utils.js            Debounce, throttle, escapeHTML, toast notifications, skeleton loaders
│   ├── theme.js            Dark/Light mode toggle with localStorage persistence
│   ├── api.js              All API calls, fetchWithRetry, autoTag generator, quote normalization
│   ├── favorites.js        Favorites: localStorage CRUD, render saved quotes
│   ├── quotes.js           Quotes section: search, filter, sort, pagination — HOF showcase
│   ├── onthisday.js        On This Day: historical events timeline
│   ├── authors.js          Authors section: group by author, display cards
│   ├── wordExplorer.js     Word Explorer: dictionary lookup
│   └── app.js              Main init, navigation, section switching, hero data
├── assets/
│   └── favicon.svg         Brain/lightbulb SVG icon
└── README.md               This file
```

## Array Higher-Order Function (HOF) Usage

This project showcases extensive use of JavaScript Array HOFs. Here are key examples:

### `.filter()` — Search and tag filtering
```javascript
// Quotes filtered by search term AND active tag
const results = state.allQuotes
  .filter(q => search === '' || q.text.toLowerCase().includes(search) || q.author.toLowerCase().includes(search))
  .filter(q => state.activeTag === 'all' || q.tags.includes(state.activeTag));
```

### `.sort()` — Multi-criteria sorting
```javascript
// Sort quotes by author, length, or relevance
.sort((a, b) => {
  switch(state.sortBy) {
    case 'author-az': return a.author.localeCompare(b.author);
    case 'shortest':  return a.text.length - b.text.length;
    default:          return 0;
  }
});
```

### `.reduce()` — Grouping and aggregation
```javascript
// Group quotes by author
const authorMap = quotes.reduce((acc, q) => {
  acc[q.author] = acc[q.author] || [];
  acc[q.author].push(q);
  return acc;
}, {});

// Compute stats
const stats = results.reduce((acc, q) => {
  acc.authors.add(q.author);
  acc.totalLength += q.text.length;
  return acc;
}, { authors: new Set(), totalLength: 0 });
```

### `.map()` — Data transformation and rendering
```javascript
// Normalize API data
return data.quotes.map(q => ({
  id: `dj-${q.id}`,
  text: q.quote,
  author: q.author,
  tags: autoTag(q.quote)
}));

// Render cards
const html = paginated.map(q => createQuoteCard(q)).join('');
```

### `.some()` / `.find()` — Checking and searching
```javascript
// Check if quote is in favorites
function isFavorite(quoteId) {
  return getFavorites().some(f => f.id === quoteId);
}

// Auto-tag: check if any keyword matches
keywords.some(kw => lowerText.includes(kw))
```

### `Object.entries()` — Working with objects as arrays
```javascript
// Auto-tag using entries + filter + map
const tags = Object.entries(TAG_MAP)
  .filter(([tag, keywords]) => keywords.some(kw => lowerText.includes(kw)))
  .map(([tag]) => tag);
```

## Design System

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#0f0a1a` | `#faf5ff` |
| Primary | `#7c3aed` (violet) | `#7c3aed` |
| Secondary | `#f4c542` (gold) | `#f4c542` |
| Card BG | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.8)` |
| Text | `#e2e8f0` | `#1e1b4b` |
| Headings | Playfair Display, serif | Playfair Display, serif |
| Body | Inter, sans-serif | Inter, sans-serif |

## Future Enhancements

- [ ] Quote categories page with visual statistics
- [ ] Reading list / bookmarks with notes
- [ ] Quote image generator (share as image)
- [ ] Daily email digest of quotes
- [ ] User accounts with cloud sync
- [ ] Advanced search with regex support
- [ ] Quote recommendation engine
- [ ] Offline support with Service Worker
- [ ] PWA installation support
- [ ] Accessibility audit and WCAG compliance improvements
- [ ] Performance optimization with virtual scrolling
- [ ] Integration with more quote APIs

## Author

**Your Name** — [GitHub](#) | [Portfolio](#) | [Twitter](#)

---

*Built with curiosity and JavaScript.*
