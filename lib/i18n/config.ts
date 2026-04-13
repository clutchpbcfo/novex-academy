import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { isSupported } from './langs';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const raw = cookieStore.get('novex_lang')?.value ?? 'en';
  const locale = isSupported(raw) ? raw : 'en';

  const messages = (await import(`./locales/${locale}.json`)).default;

  return { locale, messages };
});
