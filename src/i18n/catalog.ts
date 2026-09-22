import 'server-only';
import { createTranslator } from 'next-intl';
import ko from './locales/ko.json';
import en from './locales/en.json';
import de from './locales/de.json';
import type { Locale } from './routes';

const catalogs = { ko, en, de };
export function getTranslations(locale: Locale) {
  return createTranslator({
    locale,
    messages: catalogs[locale],
    onError(error) {
      throw error;
    },
  });
}
