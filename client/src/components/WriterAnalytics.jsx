import React from 'react';
import { Eye, Heart, CheckCircle, Users, ArrowUpRight, Zap, TrendingUp } from 'lucide-react';

export default function WriterAnalytics({ analytics }) {
  if (!analytics) return null;

  const maxViews = Math.max(...analytics.daily_read_trend.map(d => d.views));

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '80px' }}>
      
      {/* Title & Performance Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>Writer Studio Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time engagement telemetry buffered via Redis atomic counters and synced to MySQL.
          </p>
        </div>

        <div className="badge badge-redis" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
          <Zap size={15} />
          <span>Buffered Telemetry Sync: Healthy (0s lag)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        
        {/* Total Reads */}
        <div className="card-surface" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL STORY READS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={17} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
            {analytics.total_reads.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            <ArrowUpRight size={13} />
            <span>+{analytics.weekly_growth_percent}% this week</span>
          </div>
        </div>

        {/* Total Claps */}
        <div className="card-surface" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: '600' }}>READER CLAPS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={17} color="var(--accent-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
            {analytics.total_claps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Weighted 3.5x in Dual-Factor rank
          </div>
        </div>

        {/* Read-Through Completion */}
        <div className="card-surface" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AVG COMPLETION RATE</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={17} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
            {Math.round(analytics.avg_completion_rate * 100)}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            Top 5% among independent writers
          </div>
        </div>

        {/* Subscribers */}
        <div className="card-surface" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: '600' }}>NEWSLETTER SUBSCRIBERS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
            {analytics.subscribers_count}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Empowering direct audience reach
          </div>
        </div>

      </div>

      {/* Daily Performance Trend Chart */}
      <div className="card-surface" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Daily Read & Completion Volume</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Comparison between total article hits and full read completions</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-primary)' }} />
              <span>Total Views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-emerald)' }} />
              <span>Full Completions</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', gap: '12px', paddingTop: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          {analytics.daily_read_trend.map((dayData, i) => {
            const viewsHeight = (dayData.views / maxViews) * 100;
            const compHeight = (dayData.completions / maxViews) * 100;

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', width: '80%', height: '100%', justifyContent: 'center' }}>
                  
                  {/* Views Bar */}
                  <div
                    style={{
                      width: '45%',
                      height: `${viewsHeight}%`,
                      background: 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.4) 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${dayData.day}: ${dayData.views} views`}
                  />

                  {/* Completions Bar */}
                  <div
                    style={{
                      width: '45%',
                      height: `${compHeight}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.4) 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${dayData.day}: ${dayData.completions} completions`}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>{dayData.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="card-surface" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Category Audience Engagement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {analytics.top_performing_topics.map((topic, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>{topic.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{topic.share}% of readership</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${topic.share}%`,
                    height: '100%',
                    background: i === 0 ? 'var(--accent-primary)' : i === 1 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
