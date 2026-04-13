import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Providers } from '@/components/providers';
import { SUPPORTED_LOCALES, RTL_LOCALES } from '@/lib/i18n/langs';
import type { SupportedLocale } from '@/lib/i18n/langs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Novex Academy',
  description: "The trader's playbook — regime-aware and fleet-verified.",
};

function getLocale(): SupportedLocale {
  const raw = cookies().get('novex_lang')?.value ?? 'en';
  return (SUPPORTED_LOCALES as readonly string[]).includes(raw)
    ? (raw as SupportedLocale)
    : 'en';
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const isRtl = (RTL_LOCALES as string[]).includes(locale);
  const messages = (await import(`@/lib/i18n/locales/${locale}.json`)).default as Record<string, string>;

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
