import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ArticleCard from './components/ArticleCard';
import ReaderMode from './components/ReaderMode';
import DistractionFreeEditor from './components/DistractionFreeEditor';
import WriterAnalytics from './components/WriterAnalytics';
import MagicAuthModal from './components/MagicAuthModal';
import TopicOnboardingModal from './components/TopicOnboardingModal';
import { api } from './services/api';
import { Sparkles, TrendingUp, Zap, Shield, Filter, PenTool, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: null, name: 'All Stories' },
  { id: 1, name: 'Engineering & Tech' },
  { id: 2, name: 'Writing & Craft' },
  { id: 3, name: 'Design & Aesthetics' },
  { id: 4, name: 'Startup & Leadership' },
  { id: 5, name: 'Future & Culture' }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'reader' | 'studio' | 'analytics'
  const [feedMode, setFeedMode] = useState('trending'); // 'trending' | 'personalized'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [userInterests, setUserInterests] = useState({ 1: 5.0, 2: 4.5, 3: 3.0, 4: 2.0, 5: 1.0 });

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync theme to root dataset attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load articles based on mode and category
  const loadArticles = async () => {
    if (feedMode === 'personalized') {
      const data = await api.getPersonalizedFeed(userInterests);
      const filtered = selectedCategory ? data.filter(a => a.category_id === selectedCategory) : data;
      setArticles(filtered);
    } else {
      const data = await api.getTrendingFeed(selectedCategory);
      setArticles(data);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [feedMode, selectedCategory, userInterests]);

  // Load analytics
  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
  }, []);

  // Handle article selection (opens reader mode)
  const handleSelectArticle = (article) => {
    setActiveArticle(article);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.engageArticle(article.id, 'view');
  };

  // Engagement action handler (claps, bookmarks)
  const handleEngage = async (articleId, type) => {
    await api.engageArticle(articleId, type);
    if (type === 'like') {
      showToast('Appreciation recorded! Synced to Redis atomic buffer.');
    } else if (type === 'bookmark') {
      showToast('Story saved to your private library.');
    }
  };

  // Publish new story
  const handlePublish = async (articleData) => {
    const published = await api.publishArticle(articleData);
    showToast('Story published! Indexed in Dual-Factor feed.');
    setActiveArticle(published);
    setCurrentView('reader');
    loadArticles();
    return published;
  };

  // Notification helper
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '24px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{notification}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'feed' && (
          <div>
            
            {/* Hero Banner Section */}
            <section style={{
              padding: '60px 0 40px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)'
            }}>
              <div className="container">
                <div style={{ maxWidth: '820px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span className="badge badge-redis">
                      <Zap size={12} />
                      <span>PHP 8.2 • Redis • MySQL</span>
                    </span>
                    <span className="badge badge-ranking">
                      <TrendingUp size={12} />
                      <span>Dual-Factor Engine</span>
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: '3.4rem',
                    lineHeight: '1.1',
                    marginBottom: '16px',
                    letterSpacing: '-0.03em'
                  }}>
                    Empowering Independent Writers.
                  </h1>
                  
                  <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '28px'
                  }}>
                    Discover essays curated by custom recommendation vectors and dual-factor engagement velocity. Zero clutter, sub-50ms reads, passwordless login.
                  </p>

                  {/* Architecture Metrics Quick-Bar */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    padding: '16px 20px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Zap size={16} color="var(--accent-cyan)" />
                      <span><strong>Sub-50ms</strong> Redis Read Latency</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <TrendingUp size={16} color="var(--accent-amber)" />
                      <span><strong>Dual-Factor</strong> Ranking with Time Decay</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Sparkles size={16} color="var(--accent-primary)" />
                      <span><strong>Custom</strong> Interest Affinity Matcher</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Shield size={16} color="var(--accent-emerald)" />
                      <span><strong>Passwordless</strong> Magic Link Auth</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feed Controls & Category Bar */}
            <section style={{ padding: '28px 0 16px' }}>
              <div className="container">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  
                  {/* Algorithm Selector Switch */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--bg-elevated)',
                    padding: '4px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <button
                      onClick={() => setFeedMode('trending')}
                      className={`btn ${feedMode === 'trending' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                    >
                      <TrendingUp size={14} />
                      <span>Trending (Dual-Factor)</span>
                    </button>

                    <button
                      onClick={() => setFeedMode('personalized')}
                      className={`btn ${feedMode === 'personalized' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                    >
                      <Sparkles size={14} />
                      <span>For You (Recommended)</span>
                    </button>
                  </div>

                  {/* Category Taxonomy Filter Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id || 'all'}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`btn ${selectedCategory === cat.id ? 'btn-secondary' : 'btn-outline'}`}
                        style={{
                          fontSize: '0.8rem',
                          padding: '6px 14px',
                          borderColor: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--border-subtle)'
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Algorithmic Feed Details Description */}
                <div style={{ marginTop: '16px', fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {feedMode === 'trending' ? (
                    <span>
                      📊 <strong>Dual-Factor Mode:</strong> Ranking incorporates multi-signal engagement (views, claps, comments, bookmarks) divided by time-decay gravity <code style={{ fontFamily: 'var(--font-mono)' }}>(T + 2)^1.4</code>.
                    </span>
                  ) : (
                    <span>
                      ✨ <strong>Personalized Mode:</strong> Calibrated using your interest profile vector. Click <strong>"Interests"</strong> in the top navigation to adjust weights.
                    </span>
                  )}
                </div>

                {/* Articles Grid */}
                <div className="article-grid">
                  {articles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      feedMode={feedMode}
                      onSelectArticle={handleSelectArticle}
                      onEngage={handleEngage}
                    />
                  ))}
                </div>

              </div>
            </section>

          </div>
        )}

        {/* Reader Mode View */}
        {currentView === 'reader' && activeArticle && (
          <ReaderMode
            article={activeArticle}
            onBack={() => setCurrentView('feed')}
            onEngage={handleEngage}
            theme={theme}
            setTheme={setTheme}
          />
        )}

        {/* Writer Studio View */}
        {currentView === 'studio' && (
          <DistractionFreeEditor
            onPublish={handlePublish}
            onCancel={() => setCurrentView('feed')}
          />
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <WriterAnalytics analytics={analytics} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '36px 0',
        marginTop: '60px',
        background: 'var(--bg-secondary)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Scriblo</span> — Empowering Independent Writers.
            <div style={{ marginTop: '4px' }}>Built with React, PHP 8.2, Redis, MySQL, and AWS Architecture.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>⚡ Redis Read-Through</span>
            <span style={{ color: 'var(--accent-amber)' }}>🎯 Dual-Factor Ranker</span>
            <span style={{ color: 'var(--accent-primary)' }}>🧬 Recommendation Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MagicAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          showToast(`Welcome back! Authenticated as ${userData.email}`);
        }}
      />

      <TopicOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userInterests={userInterests}
        onSaveInterests={(updated) => {
          setUserInterests(updated);
          showToast('Reader interest vector updated!');
        }}
      />

    </div>
  );
}
