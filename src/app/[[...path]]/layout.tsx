import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import '@/styles/global.css';
import '@/styles/editorial.css';
import { routeState } from '@/content/route-state';
import GraphicsStage from '@/components/GraphicsStage';
import SiteHeader, { chromeLabels } from '@/components/SiteHeader';
import PageBehaviors from '@/components/PageBehaviors';
import SiteFooter from '@/components/SiteFooter';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0c0d0f' };
export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const { locale, shape, kind } = routeState('/' + path.join('/') + '/');
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/icons/arrow-up-right.svg" type="image/svg+xml" />
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body data-shape={shape} data-kind={kind}>
        <a href="#main" className="skip">
          {chromeLabels[locale].skip}
        </a>
        <GraphicsStage />
        <SiteHeader locale={locale} kind={kind} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={locale} kind={kind} />
        <PageBehaviors />
      </body>
    </html>
  );
}
