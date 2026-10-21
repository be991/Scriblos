import React from 'react';
import { X, Sparkles, Check, Cpu, Feather, Palette, Rocket, Compass } from 'lucide-react';

const TOPIC_OPTIONS = [
  { id: 1, name: 'Engineering & Tech', icon: Cpu, desc: 'Redis caching, distributed systems, web engines' },
  { id: 2, name: 'Writing & Craft', icon: Feather, desc: 'Prose techniques, independent publishing, essays' },
  { id: 3, name: 'Design & Aesthetics', icon: Palette, desc: 'Editorial typography, visual harmony, UX' },
  { id: 4, name: 'Startup & Leadership', icon: Rocket, desc: 'Solopreneur stacks, high-throughput APIs' },
  { id: 5, name: 'Future & Culture', icon: Compass, desc: 'Philosophy, digital consciousness, media' }
];

export default function TopicOnboardingModal({
  isOpen,
  onClose,
  userInterests,
  onSaveInterests
}) {
  if (!isOpen) return null;

  const toggleInterest = (catId) => {
    const current = userInterests[catId] || 0;
    const nextVal = current >= 4.0 ? 1.0 : 5.0; // Toggle high vs low
    onSaveInterests({ ...userInterests, [catId]: nextVal });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 10, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card-surface" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Personalize Your Recommendation Feed</h2>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Our custom recommendation engine calculates cosine vector similarity between these topic affinities and article content to curate your reading feed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {TOPIC_OPTIONS.map((topic) => {
            const Icon = topic.icon;
            const isHigh = (userInterests[topic.id] || 0) >= 4.0;

            return (
              <div
                key={topic.id}
                onClick={() => toggleInterest(topic.id)}
                className="card-surface"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderColor: isHigh ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: isHigh ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isHigh ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: isHigh ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{topic.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{topic.desc}</div>
                  </div>
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isHigh ? 'none' : '2px solid var(--text-muted)',
                  background: isHigh ? 'var(--accent-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isHigh && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
        >
          <span>Save Preferences & Update Feed</span>
        </button>
      </div>
    </div>
  );
}
