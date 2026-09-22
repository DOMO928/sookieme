import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Icon from '@/components/Icon';
export function getMeta(_locale: Locale) {
  return {
    shape: formId.home,
  };
}
export default function Home({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <section className="home-stage" aria-label={t('index.aboutJaesookJeong')}>
        <div className="home-intro">
          <p className="home-name">Jaesook Jeong</p>
          <h1>Sookie</h1>
          <p className="home-description">Frontend &amp; Graphics Engineer</p>
          <LocalLink className="quiet-link" href="/about/" locale={locale}>
            {t('index.aboutMe')}
            <Icon locale={locale} name="arrow-up-right" />
          </LocalLink>
        </div>
        <div className="work-index" id="work">
          <p className="eyebrow">
            {t('editorial.index')}
            <span>01 — 03</span>
          </p>
          <LocalLink
            className="work-link"
            href="/work/rust-renderer/"
            data-project="1"
            locale={locale}
          >
            <span className="work-number">01</span>
            <span>
              <strong>Renderer</strong>
              <small>{t('index.renderingSystemsProtopie')}</small>
            </span>
            <Icon locale={locale} name="arrow-up-right" />
          </LocalLink>
          <LocalLink
            className="work-link"
            href="/work/interactive-3d/"
            data-project="2"
            locale={locale}
          >
            <span className="work-number">02</span>
            <span>
              <strong>Interactive</strong>
              <small>3D apps · Web platforms · XR</small>
            </span>
            <Icon locale={locale} name="arrow-up-right" />
          </LocalLink>
          <LocalLink className="work-link" href="/study/" data-project="3" locale={locale}>
            <span className="work-number">03</span>
            <span>
              <strong>Study</strong>
              <small>{t('index.graphicsAnimationExperiments')}</small>
            </span>
            <Icon locale={locale} name="arrow-up-right" />
          </LocalLink>
        </div>
      </section>
    </>
  );
}
