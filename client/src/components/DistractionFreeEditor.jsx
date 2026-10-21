import React, { useState, useEffect } from 'react';
import { Send, Image, Sparkles, CheckCircle2, TrendingUp, Info } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Engineering & Tech', slug: 'tech' },
  { id: 2, name: 'Writing & Craft', slug: 'writing' },
  { id: 3, name: 'Design & Aesthetics', slug: 'design' },
  { id: 4, name: 'Startup & Leadership', slug: 'startup' },
  { id: 5, name: 'Future & Culture', slug: 'culture' }
];

const PRESET_COVERS = [
  { label: 'Architecture & Tech', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Writing & Ink', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Minimalist Design', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Startup Innovation', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80' }
];

export default function DistractionFreeEditor({ onPublish, onCancel }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft if exists
  useEffect(() => {
    const draft = localStorage.getItem('scriblo_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.content) setContent(parsed.content);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
      } catch (e) {}
    }
  }, []);

  // Auto-save draft every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        localStorage.setItem('scriblo_draft', JSON.stringify({
          title, subtitle, content, categoryId, coverImage, savedAt: Date.now()
        }));
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, subtitle, content, categoryId, coverImage]);

  // Compute metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Projected dual-factor freshness score
  const selectedCat = CATEGORIES.find(c => c.id === Number(categoryId));
  const projectedScore = (100.0 * 1.0 / Math.pow(2.1, 1.4)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and article body content.');
      return;
    }

    setIsSubmitting(true);
    const newArticle = await onPublish({
      title,
      subtitle,
      content,
      category_id: categoryId,
      category_name: selectedCat?.name || 'General',
      cover_image: coverImage
    });

    localStorage.removeItem('scriblo_draft');
    setIsSubmitting(false);
  };

  return (
    <div className="reader-container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      
      {/* Studio Header Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-primary)' }}>
            Writer Studio
          </span>
          {lastSaved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={13} color="var(--accent-emerald)" />
              <span>Draft cached {lastSaved}</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onCancel} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '9px 22px' }}
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Story'}</span>
          </button>
        </div>
      </div>

      {/* Projected Dual-Factor Rank Banner */}
      <div className="card-surface" style={{ padding: '16px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '700' }}>Dual-Factor Freshness Score: ~{projectedScore}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Initial rank calculated using {selectedCat?.name} taxonomy relevance + fresh time decay divisor.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div><strong>{wordCount}</strong> words</div>
          <div><strong>~{readTime}</strong> min read</div>
        </div>
      </div>

      {/* Editor Form Inputs */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Category & Cover Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Taxonomy Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Cover Image Preset
            </label>
            <select
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            >
              {PRESET_COVERS.map((preset, i) => (
                <option key={i} value={preset.url}>{preset.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your story..."
            rows={2}
            style={{
              width: '100%',
              fontSize: '2.5rem',
              fontWeight: '800',
              fontFamily: 'var(--font-serif)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              resize: 'none',
              lineHeight: '1.2'
            }}
          />
        </div>

        {/* Subtitle Input */}
        <div>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add an engaging subtitle or abstract..."
            style={{
              width: '100%',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-sans)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px'
            }}
          />
        </div>

        {/* Selected Cover Image Preview */}
        {coverImage && (
          <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '280px' }}>
            <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
          </div>
        )}

        {/* Body Content Canvas */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story. Support Markdown headers (###), quotes (>), and paragraphs..."
            rows={14}
            style={{
              width: '100%',
              fontSize: '1.15rem',
              fontFamily: 'var(--font-serif)',
              lineHeight: '1.8',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              resize: 'vertical'
            }}
          />
        </div>

      </form>
    </div>
  );
}
