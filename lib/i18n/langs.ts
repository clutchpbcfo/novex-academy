export const SUPPORTED_LOCALES = [
  'en', 'ja', 'de', 'it', 'es', 'fr', 'pt', 'zh', 'ko', 'ar', 'sw', 'hi', 'tr', 'ru', 'vi',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: SupportedLocale[] = ['ar'];

export const LANGS = [
  { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
  { code: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', native: '中文' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية' },
  { code: 'sw', flag: '🇰🇪', name: 'Swahili', native: 'Kiswahili' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', native: 'Türkçe' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', native: 'Русский' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', native: 'Tiếng Việt' },
] as const;

export function isSupported(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}
