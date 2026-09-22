import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import Icon from './Icon';
interface Props {
  locale: Locale;
  number: string;
  category: string;
  line1: string;
  line2?: string;
  summary: string;
  role: string;
  stack: string;
  sections: { id: string; label: string }[];
  backHref?: string;
  backLabel?: string;
}
export default function ProjectIntro({
  locale,
  number,
  category,
  line1,
  line2,
  summary,
  role,
  stack,
  sections,
  backHref = '/#work',
  backLabel,
}: Props) {
  const t = getTranslations(locale);
  const parentLabel = backLabel ?? t('interactive-3d.allWork');
  return (
    <>
      <section className="project-intro compact-intro">
        <LocalLink className="back-link" href={backHref} locale={locale}>
          <Icon locale={locale} name="arrow-left" /> {parentLabel}
        </LocalLink>
        <p className="eyebrow">
          {number} / {category}
        </p>
        <h1>
          {line1}
          {line2 && (
            <>
              {' '}
              <span>{line2}</span>
            </>
          )}
        </h1>
        <p className="project-summary">{summary}</p>
        <dl className="project-meta">
          <div>
            <dt>{t('projectIntro.role')}</dt>
            <dd>{role}</dd>
          </div>
          <div>
            <dt>{t('projectIntro.stack')}</dt>
            <dd>{stack}</dd>
          </div>
        </dl>
      </section>
      <nav className="case-navigation" aria-label={t('editorial.sections')}>
        <div className="case-navigation-links">
          {sections.map(({ id, label }) => (
            <LocalLink key={id} href={`#${id}`} locale={locale}>
              {label}
            </LocalLink>
          ))}
        </div>
        <LocalLink
          className="case-navigation-back"
          href={backHref}
          locale={locale}
          aria-label={parentLabel}
          title={parentLabel}
        >
          <Icon locale={locale} name="arrow-left" />
          <span>{parentLabel}</span>
        </LocalLink>
      </nav>
    </>
  );
}
