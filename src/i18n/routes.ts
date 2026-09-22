export const locales = ['ko', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const routePaths = [
  '/',
  '/about/',
  '/study/',
  '/lab/field-form/',
  '/work/content-platform/',
  '/work/interactive-3d/',
  '/work/realtime-game/',
  '/work/rust-renderer/',
  '/work/web-platforms/',
  '/work/xr/',
] as const;
export function localeFromPath(path: string): Locale {
  return path.startsWith('/en/') ? 'en' : path.startsWith('/de/') ? 'de' : 'ko';
}
export function unlocalizedPath(path: string) {
  return path.replace(/^\/(en|de)(?=\/)/, '') || '/';
}
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const match = path.match(/^([^?#]*)(.*)$/)!;
  const base = unlocalizedPath(match[1]);
  if (!routePaths.includes(base as (typeof routePaths)[number]) && base !== '/404/') return path;
  if (base === '/404/' && locale === 'ko') return '/404.html' + match[2];
  return (locale === 'ko' ? '' : `/${locale}`) + base + match[2];
}
