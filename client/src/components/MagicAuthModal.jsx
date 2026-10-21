import React, { useState } from 'react';
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function MagicAuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [sentResult, setSentResult] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await api.requestMagicLink(email);
      setSentResult(res.data);
    } catch (err) {
      setError('Failed to generate magic link. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (token) => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        email: email || 'writer@scriblo.internal',
        token: token || 'token_demo_123',
        role: 'writer'
      });
      setIsLoading(false);
      onClose();
    }, 400);
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
        maxWidth: '460px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {!sentResult ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>Passwordless Sign In</h2>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              No passwords to remember. Enter your email and we'll dispatch a secure, single-use magic login link verified in Redis.
            </p>

            {error && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.825rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSendLink}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '14px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                {isLoading ? 'Generating Link...' : 'Send Magic Link'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Magic Link Sent!</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                We sent a secure sign-in token to <strong>{email}</strong> (valid for 15 minutes).
              </p>
            </div>

            {/* Instant Demo Verification Box */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                <KeyRound size={15} />
                <span>Instant Demo Verification</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                In production, clicking the email link triggers verification. In this demo, authenticate immediately:
              </p>

              <button
                onClick={() => handleVerify(sentResult.dev_token)}
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.875rem', padding: '10px' }}
              >
                <span>Complete Sign In Instantly</span>
                <Sparkles size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
