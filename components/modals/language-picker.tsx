'use client';

import { useState, useEffect, useRef } from 'react';
import { LANGS } from '@/lib/i18n/langs';
import { useRouter } from 'next/navigation';

export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const lang = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('novex_lang='))
      ?.split('=')[1] ?? 'en';
    setCurrent(lang);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  function selectLang(code: string) {
    setCurrent(code);
    const domain = process.env.NODE_ENV === 'production' ? '; domain=.novex.finance' : '';
    document.cookie = `novex_lang=${code}; path=/${domain}; max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
    router.refresh();
  }

  const currentLang = LANGS.find((l) => l.code === current) ?? LANGS[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          padding: '7px 10px',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.color = 'var(--text-primary)';
          el.style.borderColor = 'var(--border-strong)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.color = 'var(--text-secondary)';
          el.style.borderColor = 'var(--border)';
        }}
      >
        <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
        <span>{currentLang.code.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>▾</span>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 42,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            zIndex: 200,
            minWidth: 220,
            maxHeight: 420,
            overflowY: 'auto',
            padding: 6,
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => selectLang(l.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                fontSize: 13,
                color: l.code === current ? 'var(--cyan)' : 'var(--text-primary)',
                background: l.code === current ? 'var(--cyan-soft)' : 'transparent',
                fontWeight: l.code === current ? 700 : 400,
                borderRadius: 6,
                cursor: 'pointer',
                border: 'none',
                textAlign: 'left',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                if (l.code !== current) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (l.code !== current) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <span>{l.native}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {l.code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
