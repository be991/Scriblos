import React from 'react';
import { PenTool, Sparkles, Zap, BarChart3, Sun, Moon, BookOpen, UserCheck, Flame } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  theme,
  setTheme,
  user,
  onOpenAuth,
  onOpenOnboarding
}) {
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('sepia');
    else if (theme === 'sepia') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="glass-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Brand Logo & Caching Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button
            onClick={() => setCurrentView('feed')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}>
              <PenTool size={22} color="#ffffff" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(90deg, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: theme === 'light' ? '#0f172a' : 'transparent',
                display: 'block',
                lineHeight: 1
              }}>
                Scriblo
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Empowering Writers
              </span>
            </div>
          </button>

          {/* Redis P99 Latency Pill */}
          <div
            className="badge badge-redis"
            title="Redis in-memory caching active — Sub-50ms API latency"
            style={{ cursor: 'help', display: 'none', mdDisplay: 'inline-flex' }}
          >
            <Zap size={13} />
            <span>Redis 18ms</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${currentView === 'feed' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setCurrentView('feed')}
            style={{ fontWeight: currentView === 'feed' ? '700' : '500' }}
          >
            <Flame size={16} color="var(--accent-amber)" />
            <span>Articles</span>
          </button>

          <button
            className={`btn ${currentView === 'studio' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setCurrentView('studio')}
            style={{ fontWeight: currentView === 'studio' ? '700' : '500' }}
          >
            <PenTool size={16} color="var(--accent-primary)" />
            <span>Studio</span>
          </button>

          <button
            className={`btn ${currentView === 'analytics' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setCurrentView('analytics')}
            style={{ fontWeight: currentView === 'analytics' ? '700' : '500' }}
          >
            <BarChart3 size={16} color="var(--accent-emerald)" />
            <span>Analytics</span>
          </button>

          <button
            className="btn btn-ghost"
            onClick={onOpenOnboarding}
            title="Configure recommendation preferences"
            style={{ gap: '6px' }}
          >
            <Sparkles size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.875rem' }}>Interests</span>
          </button>
        </nav>

        {/* Right Action Icons & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Theme Cycler (Dark -> Sepia -> Light) */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
            title={`Current theme: ${theme}. Click to switch.`}
          >
            {theme === 'dark' ? <Moon size={18} /> : theme === 'sepia' ? <BookOpen size={18} color="#9e5b22" /> : <Sun size={18} color="#f59e0b" />}
          </button>

          {/* New Story Quick Button */}
          <button
            onClick={() => setCurrentView('studio')}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '6px', fontSize: '0.875rem', padding: '8px 16px' }}
          >
            <PenTool size={15} />
            <span>Write</span>
          </button>

          {/* Passwordless Auth / User Avatar */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  color: '#ffffff'
                }}
                title={user.email}
              >
                {user.email[0].toUpperCase()}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <UserCheck size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
