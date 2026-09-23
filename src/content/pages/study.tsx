import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Icon from '@/components/Icon';
import Diagram from '@/components/TechnicalDiagram';
import { getStudies } from '@/data/studies';
export function getMeta(_locale: Locale) {
  return {
    title: 'Study — Sookie',
    shape: formId.study,
    kind: 'project',
  };
}
export default function Study({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const studies = getStudies(locale);
  return (
    <>
      <header className="study-head">
        <p className="eyebrow">{t('study.category')}</p>
        <h1>Study</h1>
        <p>{t('study.description')}</p>
      </header>
      <div className="study-list">
        {studies.map((study) => (
          <section key={study.id} className="study-entry" id={study.id}>
            <div className="study-number">{study.number}</div>
            <div className="study-content">
              <div className="study-meta">
                <span>{study.status}</span>
                <span>{study.year}</span>
              </div>
              <h2>{study.title}</h2>
              <div className="study-tags">
                {study.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="study-description">{study.description}</p>
              {study.id === 'field-form' ? (
                <>
                  <LocalLink
                    className="study-preview"
                    href={study.href}
                    locale={locale}
                    aria-label={study.action}
                  >
                    <img
                      src="/images/form-8.webp"
                      alt=""
                      width="1200"
                      height="750"
                      loading="lazy"
                    />
                    <span>
                      Field / Form <Icon name="arrow-up-right" />
                    </span>
                  </LocalLink>
                  <LocalLink className="source-link" href={study.href} locale={locale}>
                    {study.action} <Icon name="arrow-up-right" />
                  </LocalLink>
                </>
              ) : (
                <>
                  <details className="research-notes">
                    <summary>
                      {t('study.approachAndValidationPlan')}
                      <Icon name="arrow-right" />
                    </summary>
                    <div>
                      <Diagram locale={locale} type="codec" caption={t('study.codecDiagram')} />
                      <ol className="research-steps">
                        <li>
                          <b>FK → world pose → IK targets</b>
                          <p>{t('study.ikReconstruction')}</p>
                        </li>
                        <li>
                          <b>Sparse keys + interpolation</b>
                          <p>{t('study.keyframeSelection')}</p>
                        </li>
                        <li>
                          <b>ML interpolation</b>
                          <p>{t('study.learnedInterpolation')}</p>
                        </li>
                      </ol>
                    </div>
                  </details>
                </>
              )}
            </div>
          </section>
        ))}
        <LocalLink className="next-project" href="/" locale={locale}>
          <small>{t('study.backToWork')}</small>
          <span>
            {t('index.selectedWork')}
            <Icon name="arrow-right" />
          </span>
        </LocalLink>
      </div>
    </>
  );
}
