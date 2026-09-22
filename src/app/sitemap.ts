import type { MetadataRoute } from 'next';
import { locales, routePaths, localizePath } from '@/i18n/routes';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routePaths.map((path) => ({
      url: 'https://sookie.me' + localizePath(path, locale),
      alternates: {
        languages: Object.fromEntries(
          locales.map((lang) => [lang, 'https://sookie.me' + localizePath(path, lang)]),
        ),
      },
    })),
  );
}
