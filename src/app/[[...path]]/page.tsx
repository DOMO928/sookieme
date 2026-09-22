import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pages } from '@/content/registry';
import { routeState } from '@/content/route-state';
import { locales, routePaths, localizePath, type Locale } from '@/i18n/routes';

type Props = { params: Promise<{ path?: string[] }> };
type PageMeta = { shape?: number; title?: string; description?: string; noindex?: boolean };
const descriptions: Record<Locale, string> = {
  ko: '프론트엔드·그래픽스 개발자 정재숙의 포트폴리오. 웹 서비스, 3D·XR, Rust·wgpu 렌더러 개발 경험을 소개합니다.',
  en: 'Jaesook Jeong’s portfolio: frontend engineering, 3D and XR applications, and a Rust/wgpu renderer.',
  de: 'Portfolio von Jaesook Jeong: Frontend-Entwicklung, 3D- und XR-Anwendungen sowie ein Renderer mit Rust und wgpu.',
};
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    [...routePaths, '/404/'].map((path) => ({
      path: ((locale === 'ko' ? '' : locale) + path).split('/').filter(Boolean),
    })),
  );
}
async function resolvePage({ params }: Props) {
  const { path = [] } = await params;
  const state = routeState('/' + path.join('/') + '/');
  const page = pages[state.path as keyof typeof pages];
  if (!page) notFound();
  return { ...state, ...page };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { metadata, locale, path } = await resolvePage(props);
  const meta: PageMeta = metadata(locale);
  const title = meta.title ?? 'Sookie — Frontend & Graphics Engineer';
  const description = meta.description ?? descriptions[locale];
  const canonical = 'https://sookie.me' + localizePath(path, locale);
  return {
    title,
    description,
    robots: meta.noindex ? { index: false } : undefined,
    alternates: meta.noindex
      ? undefined
      : {
          canonical,
          languages: Object.fromEntries(
            [...locales, 'x-default'].map((lang) => [
              lang,
              'https://sookie.me' +
                localizePath(path, lang === 'x-default' ? 'ko' : (lang as Locale)),
            ]),
          ),
        },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      locale: { ko: 'ko_KR', en: 'en_US', de: 'de_DE' }[locale],
      images: [
        {
          url: 'https://sookie.me/images/og-field.jpg',
          width: 1200,
          height: 630,
          alt: 'Field / Form — Sookie',
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
  };
}
export default async function Page(props: Props) {
  const { Component, locale } = await resolvePage(props);
  return <Component locale={locale} />;
}
