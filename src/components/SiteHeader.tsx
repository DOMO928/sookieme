import LocalLink from './LocalLink';
import Icon from './Icon';
import LanguageSwitch from './LanguageSwitch';
import type { Locale } from '@/i18n/routes';
import styles from './SiteHeader.module.css';
export const chromeLabels = {
  ko: {
    skip: '본문으로 건너뛰기',
    home: 'Sookie 홈',
    nav: '주 메뉴',
    work: 'Work',
    about: 'About',
    resume: 'Résumé',
    pdf: '한국어 PDF',
    language: '언어 선택',
  },
  en: {
    skip: 'Skip to content',
    home: 'Sookie home',
    nav: 'Main navigation',
    work: 'Work',
    about: 'About',
    resume: 'Résumé',
    pdf: 'Korean PDF',
    language: 'Language',
  },
  de: {
    skip: 'Zum Inhalt',
    home: 'Sookie Startseite',
    nav: 'Hauptnavigation',
    work: 'Projekte',
    about: 'Über mich',
    resume: 'Lebenslauf',
    pdf: 'PDF auf Koreanisch',
    language: 'Sprache',
  },
};
export default function SiteHeader({ locale, kind }: { locale: Locale; kind: string }) {
  const labels = chromeLabels[locale];
  return (
    <header className={`site-header ${styles.header}`}>
      <LocalLink className="wordmark" href="/" locale={locale} aria-label={labels.home}>
        Sookie<span className="wordmark-dot">.</span>
      </LocalLink>
      <nav className={styles.primary} aria-label={labels.nav}>
        <LocalLink
          href="/#work"
          locale={locale}
          aria-current={kind === 'home' ? 'page' : undefined}
        >
          {labels.work}
        </LocalLink>
        <LocalLink
          href="/about/"
          locale={locale}
          aria-current={kind === 'about' ? 'page' : undefined}
        >
          {labels.about}
        </LocalLink>
      </nav>
      <a
        className={styles.resume}
        href="/documents/Jaesook-Jeong-Resume.pdf"
        target="_blank"
        rel="noopener"
        title={labels.pdf}
        aria-label={`${labels.resume} · ${labels.pdf}`}
      >
        <span className={styles.fullResume}>{labels.resume}</span>
        <span className={styles.shortResume} aria-hidden="true">
          CV
        </span>
        <small className={styles.pdf}>KO</small>
        <Icon name="arrow-up-right" />
      </a>
      <LanguageSwitch locale={locale} label={labels.language} />
    </header>
  );
}
