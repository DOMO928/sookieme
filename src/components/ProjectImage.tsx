import type { ReactNode } from 'react';
import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
interface Props {
  locale: Locale;
  children?: ReactNode;
  project: string;
  label: string;
  src?: string;
  alt?: string;
}
export default function ProjectImage(props: Props) {
  const { locale } = props;
  const t = getTranslations(locale);
  const { project, label, src, alt = '' } = props;
  return (
    <figure className="project-image">
      {src ? (
        <img src={src} alt={alt} width="1600" height="900" loading="lazy" decoding="async" />
      ) : (
        <div className="image-skeleton" role="img" aria-label={t('media.placeholder', { project })}>
          <span className="image-skeleton-label">{label}</span>
          <div className="image-skeleton-center">
            <span className="image-skeleton-mark" aria-hidden="true"></span>
            <span>{project}</span>
            <small>{t('media.comingSoon')}</small>
          </div>
          <span className="image-skeleton-ratio" aria-hidden="true">
            16 : 9
          </span>
        </div>
      )}
      <figcaption>
        <span>{project}</span>
        <span>{label}</span>
      </figcaption>
    </figure>
  );
}
