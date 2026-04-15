'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProfileStore } from '@/lib/state/use-profile-store';
import type { Profile } from '@/types';

const EMOJI_AVATARS = ['⚡', '🔥', '🚀', '💎', '🐋', '🏰', '⚔️', '👑', '🛸', '🎯', '🧠', '🐼', '💀', '🌊', '🦅', '🎮', '🥷'];

interface ProfileEditorModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditorModal({ open, onClose }: ProfileEditorModalProps) {
  const t = useTranslations();
  const { profile, setProfile } = useProfileStore();
  const [form, setForm] = useState<Profile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`Save failed (${res.status})`);
      }

      const updated = await res.json() as Profile;
      setProfile(updated);
      onClose();
    } catch (err: any) {
      console.error('[ProfileEditor] Save error:', err);
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elev)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    transition: 'border 0.15s',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 700,
    marginBottom: 6,
  };

  const selectedEmoji = form.avatarEmoji ?? '⚡';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,8,13,0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.25s',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'var(--text-muted)',
              fontSize: 22,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            ×
          </button>

          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            {t('vault.edit.title')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
            {t('vault.edit.sub')}
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,59,48,0.12)',
              border: '1px solid rgba(255,59,48,0.3)',
              color: '#ff6b6b',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Emoji avatar picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{t('vault.edit.avatar')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
              {EMOJI_AVATARS.map((em) => (
                <button
                  key={em}
                  onClick={() => setForm((f) => ({ ...f, avatarEmoji: em }))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: selectedEmoji === em ? 'rgba(0,229,255,0.12)' : 'var(--bg-elev)',
                    border: selectedEmoji === em ? '2px solid var(--cyan)' : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    cursor: 'pointer',
                    boxShadow: selectedEmoji === em ? '0 0 12px rgba(0,229,255,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Display name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.name')}</label>
            <input
              style={inputStyle}
              value={form.displayName}
              maxLength={20}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '';
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t('vault.edit.nameHint')}</div>
          </div>

          {/* Handle */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.handle')}</label>
            <input
              style={inputStyle}
              value={form.handle}
              maxLength={24}
              onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value.toLowerCase() }))}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.bio')}</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={form.bio}
              maxLength={140}
              placeholder={t('vault.edit.bioPh')}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* Twitter / TradingView */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{t('vault.edit.twitter')}</label>
              <input
                style={inputStyle}
                value={form.twitter ?? ''}
                placeholder="@handle"
                onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cyan)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('vault.edit.tradingView')}</label>
              <input
                style={inputStyle}
                value={form.tradingView ?? ''}
                placeholder="TV username"
                onChange={(e) => setForm((f) => ({ ...f, tradingView: e.target.value }))}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cyan)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>For private indicator access</div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              {t('vault.edit.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 22px',
                background: 'var(--cyan)',
                color: '#000',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                border: 'none',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? '...' : t('vault.edit.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
