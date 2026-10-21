import React, { useState } from 'react';
import { Heart, Bookmark, Clock, Eye, Sparkles, TrendingUp, Share2 } from 'lucide-react';

export default function ArticleCard({
  article,
  onSelectArticle,
  onEngage,
  feedMode
}) {
  const [clapped, setClapped] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes_count || 0);
  const [bookmarksCount, setBookmarksCount] = useState(article.bookmarks_count || 0);

  const handleClap = (e) => {
    e.stopPropagation();
    setClapped(true);
    setLikesCount(prev => prev + 1);
    onEngage(article.id, 'like');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    const nextState = !bookmarked;
    setBookmarked(nextState);
    setBookmarksCount(prev => nextState ? prev + 1 : prev - 1);
    onEngage(article.id, 'bookmark');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <article
      className="card-surface article-card"
      onClick={() => onSelectArticle(article)}
      style={{ cursor: 'pointer' }}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={article.cover_image}
          alt={article.title}
          className="article-cover"
          loading="lazy"
        />

        {/* Category Pill Over Image */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
          <span className="badge badge-redis" style={{ backdropFilter: 'blur(8px)', background: 'rgba(9, 12, 16, 0.75)' }}>
            {article.category_name}
          </span>
        </div>

        {/* Algorithm Score Pill */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 2 }}>
          {feedMode === 'personalized' && article.recommendation ? (
            <span
              className="badge badge-ai"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(9, 12, 16, 0.85)' }}
              title={article.recommendation.match_reason}
            >
              <Sparkles size={12} />
              <span>{article.recommendation.match_percentage}% Match</span>
            </span>
          ) : (
            <span
              className="badge badge-ranking"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(9, 12, 16, 0.85)' }}
              title={`Dual-Factor Score: ${article.ranking_score || 120} (Engagement + Category Decay)`}
            >
              <TrendingUp size={12} />
              <span>Score {article.ranking_score || 120}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="article-body">
        
        {/* Author Bio Snippet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <img
            src={article.author.avatar}
            alt={article.author.name}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {article.author.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>{article.read_time_minutes} min read</span>
          </div>
        </div>

        {/* Headline & Subtitle */}
        <h2 className="article-title">{article.title}</h2>
        <p className="article-subtitle">{article.subtitle}</p>

        {/* Algorithmic Reason / Hook */}
        {article.recommendation && feedMode === 'personalized' && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--accent-primary)',
            background: 'var(--accent-glow)',
            padding: '6px 10px',
            borderRadius: '6px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={13} />
            <span>{article.recommendation.match_reason}</span>
          </div>
        )}

        {/* Card Footer with Engagements */}
        <div className="article-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Atomic views count">
              <Eye size={14} />
              <span>{(article.views_count || 0).toLocaleString()}</span>
            </div>
            
            <button
              onClick={handleClap}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: clapped ? 'var(--accent-amber)' : 'inherit',
                fontWeight: clapped ? '700' : '500',
                transition: 'transform 0.15s'
              }}
              title="Give appreciation claps"
            >
              <Heart size={14} fill={clapped ? 'var(--accent-amber)' : 'none'} />
              <span>{likesCount}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleBookmark}
              style={{ color: bookmarked ? 'var(--accent-primary)' : 'inherit' }}
              title="Save to reading list"
            >
              <Bookmark size={15} fill={bookmarked ? 'var(--accent-primary)' : 'none'} />
            </button>

            <button onClick={handleShare} title="Share article">
              <Share2 size={15} />
            </button>
          </div>
        </div>

      </div>
    </article>
  );
}
