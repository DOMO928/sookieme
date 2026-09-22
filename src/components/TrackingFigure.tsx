import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import styles from './TrackingFigure.module.css';

export default function TrackingFigure({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <figure className={styles.figure}>
      <div className={styles.heading} aria-hidden="true">
        <span>ALVAAR → THREE.JS</span>
        <span>CAMERA-POSE PATH</span>
      </div>
      <picture>
        <source
          media="(max-width: 900px)"
          srcSet="/images/tracking-flow-mobile.svg"
          width={297}
          height={538}
        />
        <img
          src="/images/tracking-flow.svg"
          width={789}
          height={117}
          alt={t('trackingFigure.description')}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <figcaption>{t('trackingFigure.caption')}</figcaption>
    </figure>
  );
}
