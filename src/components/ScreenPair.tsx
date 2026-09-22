import type { ReactNode } from 'react';
import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
interface Props {
  locale: Locale;
  children?: ReactNode;
  first: string;
  firstAlt: string;
  firstLabel: string;
  firstWidth?: number;
  firstHeight?: number;
  second?: string;
  secondAlt?: string;
  secondLabel?: string;
}
export default function ScreenPair(props: Props) {
  const { locale } = props;
  const t = getTranslations(locale);
  const {
    first,
    firstAlt,
    firstLabel,
    second,
    secondAlt = '',
    secondLabel = '',
    firstWidth = 1253,
    firstHeight = 705,
  } = props;
  return (
    <div className={`screen-pair${second ? ' has-second' : ''}`}>
      <figure>
        <LocalLink
          href={first}
          target="_blank"
          rel="noopener"
          aria-label={t('media.enlarge', { label: firstLabel })}
          locale={locale}
        >
          <img
            src={first}
            alt={firstAlt}
            width={firstWidth}
            height={firstHeight}
            loading="lazy"
            decoding="async"
          />
        </LocalLink>
        <figcaption>
          <span>{firstLabel}</span>
          <span>{t('screenPair.originalUiSampleData')}</span>
        </figcaption>
      </figure>
      {second && (
        <figure>
          <LocalLink
            href={second}
            target="_blank"
            rel="noopener"
            aria-label={t('media.enlarge', { label: secondLabel })}
            locale={locale}
          >
            <img
              src={second}
              alt={secondAlt}
              width="1265"
              height="712"
              loading="lazy"
              decoding="async"
            />
          </LocalLink>
          <figcaption>
            <span>{secondLabel}</span>
            <span>{t('screenPair.originalUiSampleData')}</span>
          </figcaption>
        </figure>
      )}
    </div>
  );
}
