import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Icon from '@/components/Icon';
import styles from './about.module.css';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: t('about.title'),
    description: t('about.description'),
    shape: formId.about,
    kind: 'about',
  };
}
export default function About({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <section className={`about-head ${styles.head}`}>
      <p className="eyebrow">{t('about.eyebrow')}</p>
      <h1>
        Jaesook
        <br />
        Jeong<span className={styles.alias}>Sookie</span>
      </h1>
      <p className={styles.role}>Frontend &amp; Graphics Engineer</p>
      <div className={styles.bio}>
        <p>{t('about.intro')}</p>
        <p>{t('about.backgroundIntro')}</p>
        <p>{t('about.startupsExperience')}</p>
        <p>{t('about.curiosity')}</p>
        <p>{t('about.cultures')}</p>
      </div>
      <div className={styles.links}>
        <LocalLink href="/#work" locale={locale}>
          {t('editorial.viewWork')}
          <Icon name="arrow-up-right" />
        </LocalLink>
        <LocalLink
          href="/documents/Jaesook-Jeong-Resume.pdf"
          locale={locale}
          target="_blank"
          rel="noopener"
        >
          {t('about.resume')}
          <Icon name="arrow-up-right" />
        </LocalLink>
      </div>
      <div className={styles.contact}>
        <span>{t('about.contact')}</span>
        <a href="mailto:jeong.jaesook92@gmail.com">
          jeong.jaesook92@gmail.com
          <Icon name="arrow-up-right" />
        </a>
      </div>
    </section>
  );
}
