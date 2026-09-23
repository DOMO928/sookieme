import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Icon from '@/components/Icon';
import { getProjectGroups, getProjects } from '@/data/projects';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: 'Interactive — Sookie',
    description: t('interactive-3d.description'),
    shape: formId.interactive,
    kind: 'project',
  };
}
export default function WorkInteractive3d({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const projectGroups = getProjectGroups(locale),
    projects = getProjects(locale);
  return (
    <>
      <header className="collection-head">
        <LocalLink className="back-link" href="/#work" locale={locale}>
          <Icon name="arrow-left" />
          {t('interactive-3d.allWork')}
        </LocalLink>
        <p className="eyebrow">{t('interactive-3d.category')}</p>
        <h1>Interactive</h1>
        <p className="collection-summary">Web apps · 3D · XR</p>
        <nav className="category-nav" aria-label={t('interactive-3d.projectCategories')}>
          {projectGroups.map((group) => (
            <LocalLink key={group.id} href={`#${group.id}`} locale={locale}>
              {group.title}
              <span>
                {String(
                  projects
                    .filter((project) => project.group === group.id)
                    .reduce((count, project) => count + project.projectCount, 0),
                ).padStart(2, '0')}
              </span>
            </LocalLink>
          ))}
        </nav>
      </header>
      <div className="work-collection" id="story">
        {projectGroups.map((group) => (
          <section
            key={group.id}
            className="project-group"
            id={group.id}
            aria-labelledby={`${group.id}-title`}
          >
            <div className="group-heading">
              <h2 id={`${group.id}-title`}>{group.title}</h2>
              <p>{group.description}</p>
            </div>
            {projects
              .filter((project) => project.group === group.id)
              .map((project) => (
                <LocalLink
                  key={project.id}
                  className={`case-preview${project.image ? '' : ' case-preview-text'}`}
                  href={project.href}
                  data-project={project.shape}
                  id={project.id}
                  locale={locale}
                >
                  <div className="case-copy">
                    <p className="eyebrow">
                      {project.company}
                      {project.period && ` / ${project.period}`}
                    </p>
                    <h3>
                      {project.title}
                      <Icon name="arrow-up-right" />
                    </h3>
                    <p className="case-description">{project.summary}</p>
                    <ul
                      className="capability-tags"
                      aria-label={t('interactive-3d.coreCapabilities')}
                    >
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="case-art">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.alt}
                        width="1200"
                        height="750"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="case-pending">{t('media.comingSoon')}</span>
                    )}
                  </div>
                </LocalLink>
              ))}
          </section>
        ))}
        <LocalLink className="next-project" href="/study/" data-project="3" locale={locale}>
          <small>{t('interactive-3d.next')}</small>
          <span>
            Study <Icon name="arrow-right" />
          </span>
        </LocalLink>
      </div>
    </>
  );
}
