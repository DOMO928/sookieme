import type { Metadata } from 'next';
import '@/styles/global.css';
import NotFoundContent from '@/content/pages/404';
export const metadata: Metadata = { title: 'Page not found — Sookie', robots: { index: false } };
export default function GlobalNotFound() {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body data-kind="about" data-shape="0">
        <div id="field-stage" aria-hidden="true">
          <div className="field-scrim" />
        </div>
        <header className="site-header">
          <a className="wordmark" href="/">
            Sookie.
          </a>
        </header>
        <main id="main">
          <NotFoundContent locale="ko" />
        </main>
      </body>
    </html>
  );
}
