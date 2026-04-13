'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProfileStore } from '@/lib/state/use-profile-store';
import type { Profile } from '@/types';

const AVATAR_BG_OPTIONS: Array<{ id: Profile['avatarBg']; style: React.CSSProperties }> = [
  { id: 'cyan-purple', style: { background: 'linear-gradient(135deg, var(--cyan), var(--purple))' } },
  { id: 'gold-orange', style: { background: 'linear-gradient(135deg, var(--gold), var(--orange))' } },
  { id: 'green-cyan', style: { background: 'linear-gradient(135deg, var(--green), var(--cyan))' } },
  { id: 'red-purple', style: { background: 'linear-gradient(135deg, var(--red), var(--purple))' } },
  { id: 'pink-orange', style: { background: 'linear-gradient(135deg, #e91e63, var(--orange))' } },
  { id: 'blue-cyan', style: { background: 'linear-gradient(135deg, #3b99fc, var(--cyan))' } },
];

interface ProfileEditorModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileEditorModal({ open, onClose }: ProfileEditorModalProps) {
  const t = useTranslations();
  const { profile, setProfile } = useProfileStore();
  const [form, setForm] = useState<Profile>({ ...profile });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const updated = await res.json() as Profile;
      setProfile(updated);
      onClose();
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

          {/* Avatar picker */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.avatar')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATAR_BG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setForm((f) => ({ ...f, avatarBg: opt.id }))}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#000',
                    fontSize: 18,
                    cursor: 'pointer',
                    border: form.avatarBg === opt.id ? '2px solid var(--cyan)' : '2px solid transparent',
                    boxShadow: form.avatarBg === opt.id ? '0 0 12px var(--cyan-soft)' : 'none',
                    transition: 'all 0.15s',
                    ...opt.style,
                  }}
                >
                  {form.avatarInitials || 'A'}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t('vault.edit.nameHint')}</div>
          </div>

          {/* Initials */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.initials')}</label>
            <input
              style={{ ...inputStyle, width: 80 }}
              value={form.avatarInitials}
              maxLength={2}
              onChange={(e) => setForm((f) => ({ ...f, avatarInitials: e.target.value.toUpperCase() }))}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Handle */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('vault.edit.handle')}</label>
            <input
              style={inputStyle}
              value={form.handle}
              maxLength={24}
              onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value.toLowerCase() }))}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Twitter / Discord */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{t('vault.edit.twitter')}</label>
              <input
                style={inputStyle}
                value={form.twitter ?? ''}
                placeholder="@handle"
                onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('vault.edit.discord')}</label>
              <input
                style={inputStyle}
                value={form.discord ?? ''}
                placeholder="user#0000"
                onChange={(e) => setForm((f) => ({ ...f, discord: e.target.value }))}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
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
