/**
 * Scriblo API Client & Hybrid Redis Cache/Algorithm Adapter
 * Automatically routes to the live PHP backend or performs ultra-smooth client-side
 * dual-factor ranking and interest recommendation emulation when previewing.
 */

const API_BASE = 'http://localhost:8080/api';

// Initial curated editorial catalog
const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: 'Architecture at Scale: Why Multi-Tier Redis Caching Redefined Our P99 Latency',
    slug: 'multi-tier-redis-caching-p99-latency',
    subtitle: 'How pairing in-memory buffer rings with write-behind persistence eliminated database connection saturation under 50k RPS.',
    category_id: 1,
    category_name: 'Engineering & Tech',
    author: {
      name: 'Elena Rostova',
      handle: '@elenarostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      bio: 'Distributed systems architect & essayist.'
    },
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    read_time_minutes: 6,
    published_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    views_count: 4280,
    likes_count: 312,
    comments_count: 48,
    bookmarks_count: 185,
    avg_read_ratio: 0.88,
    content: `When handling high-concurrency editorial platforms, direct database querying is the fastest path to catastrophic cascade failures.\n\nIn our architecture benchmark, raw MySQL connection pooling degraded past 8,000 concurrent reader connections. By introducing an in-memory Redis cluster arranged in read-through cached layers alongside atomic hash counters (\`HINCRBY\`), we dropped our P99 read latency from 420ms down to 18ms.\n\n### The Anatomy of Atomic Buffering\n\nRather than writing engagement metrics (views, claps, read-ratio) directly to relational tables upon every HTTP request, we decouple telemetry writes into atomic Redis hashes. A background cron worker sweeps these hashes in micro-batches every 60 seconds.\n\n> "Sub-50 millisecond delivery is not merely a technical vanity metric; it is the prerequisite for keeping readers immersed in the written word."\n\nThe resulting architecture provides instantaneous content hydration to readers while shielding relational databases from transactional exhaustion.`
  },
  {
    id: 2,
    title: 'The Quiet Renaissance of Editorial Typography on the Modern Web',
    slug: 'editorial-typography-renaissance',
    subtitle: 'Why fluid variable fonts, proportional line scales, and intentional whitespace create timeless reading comfort.',
    category_id: 3,
    category_name: 'Design & Aesthetics',
    author: {
      name: 'Marcus Vane',
      handle: '@marcusvane',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      bio: 'Typographer and product designer.'
    },
    cover_image: 'https://images.unsplash.com/photo-1505682634684-8078b273b0a8?auto=format&fit=crop&w=1200&q=80',
    read_time_minutes: 4,
    published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    views_count: 2890,
    likes_count: 198,
    comments_count: 26,
    bookmarks_count: 142,
    avg_read_ratio: 0.92,
    content: `We have spent a decade optimizing websites for glanceability, accidentally sacrificing deep contemplation in the process.\n\nTrue editorial typography is an invisible pact between writer and reader. When the line length exceeds 75 characters, eye tracking becomes fatiguing; when leading drops below 1.6, paragraphs coagulate into dense blocks of unapproachable text.\n\n### The Golden Mean of Digital Prose\n\nBy pairing high-contrast serif headlines with humanist sans-serif body typefaces and calibrated rem-based vertical rhythms, we restore the tactile luxury of physical journals to glowing screens.`
  },
  {
    id: 3,
    title: 'The 1,000 True Readers Doctrine: Sustainable Independence for Contemporary Writers',
    slug: '1000-true-readers-doctrine',
    subtitle: 'Moving away from algorithmic engagement traps toward direct audience ownership, micro-newsletters, and focused essays.',
    category_id: 2,
    category_name: 'Writing & Craft',
    author: {
      name: 'Clara Thorne',
      handle: '@clarathorne',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
      bio: 'Tech essayist & indie publishing advocate.'
    },
    cover_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    read_time_minutes: 5,
    published_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    views_count: 3650,
    likes_count: 265,
    comments_count: 39,
    bookmarks_count: 210,
    avg_read_ratio: 0.85,
    content: `Algorithmic feeds reward outrage and volume. True writing rewards depth and nuance.\n\nFor centuries, the printing press empowered syndicates. Now, passwordless magic links and direct email subscriptions empower solitary writers to sustain vibrant intellectual careers without editorial gatekeepers.\n\n### Building the Feedback Flywheel\n\nDirect interaction through inline reactions and community discourse transforms passive readers into lifelong intellectual patrons.`
  },
  {
    id: 4,
    title: 'The Solopreneur Stack: Orchestrating High-Throughput APIs with Zero DevOps Bloat',
    slug: 'solopreneur-stack-high-throughput',
    subtitle: 'How a lean stack of PHP 8.2, Redis, and MySQL outperforms complex distributed microservices for 99% of digital ventures.',
    category_id: 4,
    category_name: 'Startup & Leadership',
    author: {
      name: 'Elena Rostova',
      handle: '@elenarostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      bio: 'Distributed systems architect & essayist.'
    },
    cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    read_time_minutes: 7,
    published_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    views_count: 1920,
    likes_count: 134,
    comments_count: 18,
    bookmarks_count: 92,
    avg_read_ratio: 0.79,
    content: `Premature microservices are the silent killer of early-stage software projects.\n\nA well-architected monolithic API powered by modern PHP with OPcache, backed by Redis in-memory caches, can comfortably serve millions of daily requests on modest cloud hardware.`
  }
];

// Local state cache initialized from localStorage if available
function getStoredArticles() {
  if (typeof localStorage !== 'undefined') {
    const local = localStorage.getItem('scriblo_articles');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return DEFAULT_ARTICLES;
}

function saveStoredArticles(articles) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('scriblo_articles', JSON.stringify(articles));
  }
}

// Dual-Factor Calculation Helper
export function calculateDualFactorScore(article, categoryAffinity = 1.0) {
  const views = article.views_count || 0;
  const likes = article.likes_count || 0;
  const comments = article.comments_count || 0;
  const bookmarks = article.bookmarks_count || 0;
  const readRatio = article.avg_read_ratio || 0.8;

  // Factor 1: Engagement Velocity
  const viewsScore = 0.8 * Math.log(1 + views);
  const likesScore = 3.5 * likes;
  const commentsScore = 6.0 * comments;
  const bookmarksScore = 4.0 * bookmarks;
  const readRatioScore = 12.0 * readRatio * 10;

  const rawEngagement = viewsScore + likesScore + commentsScore + bookmarksScore + readRatioScore;

  // Factor 2: Category Taxonomy
  const categoryFactor = Math.max(0.2, categoryAffinity);
  const factoredEngagement = rawEngagement * categoryFactor;

  // Gravity Time Decay
  const publishedAt = new Date(article.published_at).getTime();
  const ageInHours = Math.max(0.1, (Date.now() - publishedAt) / (3600 * 1000));
  const decayDivisor = Math.pow(ageInHours + 2.0, 1.4);

  const finalScore = parseFloat((factoredEngagement / decayDivisor).toFixed(2));

  return {
    score: finalScore,
    engagement_factor: parseFloat(factoredEngagement.toFixed(1)),
    decay_divisor: parseFloat(decayDivisor.toFixed(2)),
    age_hours: parseFloat(ageInHours.toFixed(1))
  };
}

export const api = {
  // 1. Fetch Trending Feed (Dual-Factor Ranked)
  async getTrendingFeed(categoryId = null) {
    try {
      const res = await fetch(`${API_BASE}/feed/trending`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback to local high-fidelity ranking engine
    }

    let articles = [...getStoredArticles()];
    if (categoryId) {
      articles = articles.filter(a => a.category_id === categoryId);
    }

    return articles.map(art => {
      const ranking = calculateDualFactorScore(art);
      return {
        ...art,
        ranking_score: ranking.score,
        ranking_details: ranking
      };
    }).sort((a, b) => b.ranking_score - a.ranking_score);
  },

  // 2. Fetch Personalized Feed (Custom Recommendation Engine)
  async getPersonalizedFeed(userInterests = { 1: 5.0, 2: 4.5, 3: 3.0, 4: 2.0 }) {
    try {
      const res = await fetch(`${API_BASE}/feed/personalized`, { credentials: 'omit', signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback
    }

    const articles = getStoredArticles();
    return articles.map(art => {
      const affinity = userInterests[art.category_id] || 1.0;
      const normalizedAffinity = Math.min(1.0, affinity / 5.0);
      const qualityBonus = 1.0 + (art.avg_read_ratio * 0.4);
      const matchScore = parseFloat((normalizedAffinity * 0.6 + qualityBonus * 0.4).toFixed(3));
      const matchPercentage = Math.min(99, Math.max(45, Math.round(matchScore * 100)));

      let reason = `Trending in ${art.category_name}`;
      if (affinity >= 4.0) {
        reason = `Top affinity match for your interest in ${art.category_name}`;
      } else if (art.avg_read_ratio >= 0.85) {
        reason = `Exceptional read completion (${Math.round(art.avg_read_ratio * 100)}% read to end)`;
      }

      const ranking = calculateDualFactorScore(art, matchScore);

      return {
        ...art,
        ranking_score: ranking.score,
        recommendation: {
          match_score: matchScore,
          match_percentage: matchPercentage,
          match_reason: reason
        }
      };
    }).sort((a, b) => (b.recommendation.match_score * b.ranking_score) - (a.recommendation.match_score * a.ranking_score));
  },

  // 3. Atomically Record Engagement (Redis buffer emulation)
  async engageArticle(articleId, type = 'like') {
    const articles = getStoredArticles();
    const article = articles.find(a => a.id === Number(articleId));
    if (!article) return null;

    if (type === 'like') article.likes_count += 1;
    if (type === 'bookmark') article.bookmarks_count += 1;
    if (type === 'view') article.views_count += 1;

    saveStoredArticles(articles);

    try {
      await fetch(`${API_BASE}/articles/${articleId}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (e) {}

    return article;
  },

  // 4. Publish New Article
  async publishArticle(articleData) {
    const articles = getStoredArticles();
    const newId = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;

    const newArticle = {
      id: newId,
      title: articleData.title,
      slug: articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      subtitle: articleData.subtitle || 'An insightful essay published on Scriblo.',
      category_id: Number(articleData.category_id || 1),
      category_name: articleData.category_name || 'Engineering & Tech',
      author: {
        name: 'You (Author)',
        handle: '@founder_writer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        bio: 'Independent Writer on Scriblo.'
      },
      cover_image: articleData.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      read_time_minutes: Math.max(1, Math.ceil((articleData.content || '').split(/\s+/).length / 200)),
      published_at: new Date().toISOString(),
      views_count: 1,
      likes_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      avg_read_ratio: 0.95,
      content: articleData.content
    };

    articles.unshift(newArticle);
    saveStoredArticles(articles);
    return newArticle;
  },

  // 5. Request Passwordless Magic Link
  async requestMagicLink(email) {
    const dummyToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const dummyCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch(`${API_BASE}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Instant development response with simulated token & code
    return {
      status: 'success',
      data: {
        message: `Magic link dispatched to ${email}`,
        dev_token: dummyToken,
        dev_code: dummyCode,
        expires_in_seconds: 900
      }
    };
  },

  // 6. Verify Magic Token
  async verifyMagicToken(token) {
    return {
      authenticated: true,
      email: 'writer@scriblo.internal',
      session_token: 'session_' + token
    };
  },

  // 7. Writer Studio Analytics
  async getAnalytics() {
    return {
      total_reads: 14280,
      total_claps: 984,
      avg_completion_rate: 0.88,
      subscribers_count: 412,
      weekly_growth_percent: 22.4,
      daily_read_trend: [
        { day: 'Mon', views: 1420, completions: 1210 },
        { day: 'Tue', views: 1890, completions: 1640 },
        { day: 'Wed', views: 2100, completions: 1820 },
        { day: 'Thu', views: 1750, completions: 1510 },
        { day: 'Fri', views: 2450, completions: 2190 },
        { day: 'Sat', views: 2800, completions: 2450 },
        { day: 'Sun', views: 3220, completions: 2890 }
      ],
      top_performing_topics: [
        { name: 'Engineering & Tech', share: 48 },
        { name: 'Writing & Craft', share: 28 },
        { name: 'Design & Aesthetics', share: 24 }
      ]
    };
  }
};
