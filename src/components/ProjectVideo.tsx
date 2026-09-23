import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
interface Props {
  locale: Locale;
  project: string;
  label: string;
  src: string;
  poster: string;
  description: string;
  width: number;
  height: number;
}
export default function ProjectVideo(props: Props) {
  const { locale } = props;
  const t = getTranslations(locale);
  const { project, label, src, poster, description, width, height } = props;
  return (
    <figure className="project-image">
      <video
        data-project-video
        src={src}
        poster={poster}
        width={width}
        height={height}
        aria-label={description}
        controls
        muted
        loop
        playsInline
        preload="none"
      >
        <LocalLink href={src} locale={locale}>
          {t('media.watch', { project })}
        </LocalLink>
      </video>
      <figcaption>
        <span>{project}</span>
        <span>{label}</span>
      </figcaption>
    </figure>
  );
}
