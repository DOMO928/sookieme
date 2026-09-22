import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
export function getMeta(_locale: Locale) {
  return {
    title: 'Page not found — Sookie',
    kind: 'about',
    noindex: true,
  };
}
export default function NotFoundContent({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <div className="about-head">
        <p className="eyebrow">404</p>
        <h1>{t('404.backToTheField')}</h1>
        <p>{t('404.pageNotFound')}</p>
        <LocalLink className="quiet-link" href="/" locale={locale}>
          {t('404.backToSelectedWork')}
        </LocalLink>
      </div>
    </>
  );
}
