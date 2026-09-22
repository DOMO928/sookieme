import type { Locale } from '@/i18n/routes';
import Icon from './Icon';

const sourceLabel = {
  ko: '이 사이트의 소스 코드 — GitHub',
  en: 'Source code for this site — GitHub',
  de: 'Quellcode dieser Website — GitHub',
};

export default function SiteFooter({ locale, kind }: { locale: Locale; kind: string }) {
  return (
    <footer className={`site-footer${kind === 'home' ? ' home-footer' : ''}`}>
      <span>© 2026 Jaesook Jeong</span>
      <a
        href="https://github.com/DOMO928/sookieme"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={sourceLabel[locale]}
      >
        GitHub <Icon locale={locale} name="arrow-up-right" />
      </a>
    </footer>
  );
}
