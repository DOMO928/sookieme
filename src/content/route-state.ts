import { formId } from '@/graphics/forms';
import { localeFromPath, unlocalizedPath, type Locale } from '@/i18n/routes';

const definitions = {
  '/': { shape: formId.home, kind: 'home' },
  '/about/': { shape: formId.about, kind: 'about' },
  '/study/': { shape: formId.study, kind: 'project' },
  '/lab/field-form/': { shape: formId.lab, kind: 'lab' },
  '/work/rust-renderer/': { shape: formId.renderer, kind: 'project' },
  '/work/interactive-3d/': { shape: formId.interactive, kind: 'project' },
  '/work/content-platform/': { shape: formId.content, kind: 'project' },
  '/work/realtime-game/': { shape: formId.game, kind: 'project' },
  '/work/web-platforms/': { shape: formId.web, kind: 'project' },
  '/work/xr/': { shape: formId.xr, kind: 'project' },
  '/404/': { shape: formId.home, kind: 'about' },
} as const;
export function routeState(pathname: string): {
  locale: Locale;
  path: string;
  shape: number;
  kind: string;
} {
  const normalized = (pathname.replace(/\/+$/, '') || '') + '/';
  const locale = localeFromPath(normalized),
    path = unlocalizedPath(normalized);
  return {
    locale,
    path,
    ...(definitions[path as keyof typeof definitions] ?? definitions['/404/']),
  };
}
