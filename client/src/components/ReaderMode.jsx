import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Type, Heart, Bookmark, Share2, Check, UserPlus, Highlighter, MessageSquare, Download, Quote } from 'lucide-react';

export default function ReaderMode({
  article,
  onBack,
  onEngage,
  theme,
  setTheme
}) {
  const [fontSize, setFontSize] = useState(1.25);
  const [fontFamily, setFontFamily] = useState('serif');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [claps, setClaps] = useState(article.likes_count || 0);
  const [userClaps, setUserClaps] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Text selection & inline annotations
  const [selectionPopover, setSelectionPopover] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [marginalNotes, setMarginalNotes] = useState([]);
  const [activeNoteInput, setActiveNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const contentRef = useRef(null);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Text Selection Event Listener for Medium-style Marginal Actions
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      if (text.length > 3 && contentRef.current && contentRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setSelectionPopover({
          top: rect.top + window.scrollY - 46,
          left: rect.left + rect.width / 2
        });
      } else if (!activeNoteInput) {
        setSelectionPopover(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [activeNoteInput]);

  // Highlight Text Action
  const handleApplyHighlight = () => {
    if (selectedText) {
      setHighlights(prev => [...prev, selectedText]);
      setSelectionPopover(null);
      window.getSelection().removeAllRanges();
    }
  };

  // Add Marginal Note
  const handleSaveNote = () => {
    if (noteText.trim()) {
      setMarginalNotes(prev => [...prev, { quote: selectedText, note: noteText.trim(), time: 'Just now' }]);
      setNoteText('');
      setActiveNoteInput(false);
      setSelectionPopover(null);
      window.getSelection().removeAllRanges();
    }
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    const mdContent = `# ${article.title}\nBy ${article.author.name}\n\n${article.subtitle}\n\n---\n\n${article.content}\n\n---\nExported from Scriblo (Sub-50ms Editorial Publishing)`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.slug || 'scriblo-article'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Text-to-Speech Narrator using Web Speech API
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const plainText = `${article.title}. By ${article.author.name}. ${article.subtitle}. ${article.content.replace(/[#*`>]/g, '')}`;
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClap = () => {
    setClaps(prev => prev + 1);
    setUserClaps(prev => prev + 1);
    onEngage(article.id, 'like');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onEngage(article.id, 'bookmark');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '140px' }}>
      
      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '4px',
        background: 'linear-gradient(90deg, #6366f1, #a855f7, #f59e0b)',
        zIndex: 100,
        transition: 'width 0.1s ease-out'
      }} />

      {/* Floating Text Selection Popover */}
      {selectionPopover && (
        <div style={{
          position: 'absolute',
          top: `${selectionPopover.top}px`,
          left: `${selectionPopover.left}px`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          animation: 'fadeIn 0.15s ease'
        }}>
          {!activeNoteInput ? (
            <>
              <button
                onClick={handleApplyHighlight}
                className="btn btn-ghost"
                style={{ padding: '6px 8px', fontSize: '0.8rem', gap: '4px' }}
                title="Highlight quote"
              >
                <Highlighter size={14} color="var(--accent-amber)" />
                <span>Highlight</span>
              </button>
              <button
                onClick={() => setActiveNoteInput(true)}
                className="btn btn-ghost"
                style={{ padding: '6px 8px', fontSize: '0.8rem', gap: '4px' }}
                title="Add marginal note"
              >
                <MessageSquare size={14} color="var(--accent-cyan)" />
                <span>Note</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px' }}>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Leave thought..."
                autoFocus
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  width: '160px'
                }}
              />
              <button onClick={handleSaveNote} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reader Controls Toolbar (Sticky) */}
      <div style={{
        position: 'sticky',
        top: '72px',
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 0',
        marginBottom: '40px'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Back Button */}
          <button
            onClick={onBack}
            className="btn btn-ghost"
            style={{ gap: '6px', padding: '6px 12px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Stories</span>
          </button>

          {/* Reader Customization Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            
            {/* Audio Narrator TTS */}
            <button
              onClick={toggleSpeech}
              className={`btn ${isSpeaking ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              title="Listen to story with Web Speech audio narrator"
            >
              {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isSpeaking ? 'Pause Audio' : 'Listen'}</span>
            </button>

            {/* Font Toggle (Serif / Sans) */}
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              title="Toggle Serif / Sans-Serif font"
            >
              <Type size={15} />
              <span>{fontFamily === 'serif' ? 'Serif' : 'Sans'}</span>
            </button>

            {/* Font Sizing Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
              <button
                onClick={() => setFontSize(prev => Math.max(1.05, prev - 0.1))}
                style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: '700' }}
                title="Decrease font size"
              >
                A-
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>|</span>
              <button
                onClick={() => setFontSize(prev => Math.min(1.65, prev + 0.1))}
                style={{ padding: '4px 8px', fontSize: '0.95rem', fontWeight: '700' }}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
              <option value="dark">Dark Obsidian</option>
              <option value="sepia">Parchment Sepia</option>
              <option value="light">Editorial Light</option>
            </select>

            {/* Download / Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="btn btn-ghost"
              style={{ padding: '6px 10px' }}
              title="Export article as Markdown (.md)"
            >
              <Download size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* Main Article Reading Canvas */}
      <div className="reader-container" ref={contentRef}>
        
        {/* Category & Read Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <span className="badge badge-redis">{article.category_name}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{article.read_time_minutes} min read</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Published {new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '2.8rem',
          lineHeight: '1.18',
          marginBottom: '16px',
          letterSpacing: '-0.025em'
        }}>
          {article.title}
        </h1>

        {/* Subtitle / Abstract */}
        <p style={{
          fontSize: '1.3rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: '28px'
        }}>
          {article.subtitle}
        </p>

        {/* Author Bio Banner & 1-Click Follow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={article.author.avatar}
              alt={article.author.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>{article.author.name}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{article.author.bio}</div>
            </div>
          </div>

          <button
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <UserPlus size={14} />
            <span>{isSubscribed ? 'Following' : 'Follow Writer'}</span>
          </button>
        </div>

        {/* Hero Cover Image */}
        {article.cover_image && (
          <div style={{ marginBottom: '40px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={article.cover_image}
              alt={article.title}
              style={{ width: '100%', maxHeight: '440px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="reader-content"
          style={{
            fontFamily: fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)',
            fontSize: `${fontSize}rem`
          }}
        >
          {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return <h3 key={index}>{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.startsWith('> ')) {
              return <blockquote key={index}>{paragraph.replace('> ', '')}</blockquote>;
            }
            if (index === 0) {
              return <p key={index} className="lead">{paragraph}</p>;
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

        {/* Marginal Notes Community Section */}
        {marginalNotes.length > 0 && (
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Quote size={18} color="var(--accent-primary)" />
              <span>Reader Marginal Notes ({marginalNotes.length})</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {marginalNotes.map((item, idx) => (
                <div key={idx} className="card-surface" style={{ padding: '14px 18px' }}>
                  <div style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--accent-amber)', marginBottom: '6px' }}>
                    "{item.quote}"
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {item.note}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Bottom Engagement Bar */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backdropFilter: 'blur(20px)',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-md)',
        zIndex: 50
      }}>
        {/* Claps */}
        <button
          onClick={handleClap}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: userClaps > 0 ? 'var(--accent-amber)' : 'inherit',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
          title="Clap for this story (Multi-claps supported)"
        >
          <Heart size={20} fill={userClaps > 0 ? 'var(--accent-amber)' : 'none'} />
          <span>{claps}</span>
          {userClaps > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>(+{userClaps})</span>}
        </button>

        <span style={{ color: 'var(--border-subtle)' }}>|</span>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isBookmarked ? 'var(--accent-primary)' : 'inherit'
          }}
          title="Save to your library"
        >
          <Bookmark size={20} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} />
          <span style={{ fontSize: '0.85rem' }}>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <span style={{ color: 'var(--border-subtle)' }}>|</span>

        {/* Share */}
        <button
          onClick={handleShare}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Copy link to story"
        >
          {copied ? <Check size={18} color="var(--accent-emerald)" /> : <Share2 size={18} />}
          <span style={{ fontSize: '0.85rem' }}>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

    </div>
  );
}
