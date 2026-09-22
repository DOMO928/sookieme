import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Intro from '@/components/ProjectIntro';
import Icon from '@/components/Icon';
import Diagram from '@/components/TechnicalDiagram';
export function getMeta(_locale: Locale) {
  return {
    title: 'Renderer — Sookie',
    shape: formId.renderer,
    kind: 'project',
  };
}
export default function WorkRustRenderer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <Intro
        locale={locale}
        number="01"
        category="RENDERING SYSTEMS"
        line1="Renderer"
        summary={t('rustRenderer.iDesignedAndImplementedA2dVector')}
        role={t('rustRenderer.newRendererArchitectureAndImplementation')}
        stack="Rust · wgpu · WGSL · WASM"
        sections={[
          { id: 'shared', label: 'Geometry' },
          { id: 'graph', label: 'Render Graph' },
          { id: 'recovery', label: 'Recovery' },
        ]}
      />
      <article className="story" id="story">
        <div className="story-lead">
          <p className="eyebrow">PROTOPIE / STUDIO XID</p>
          <h2>Cross-platform Rendering</h2>
          <p>{t('rustRenderer.theProjectMovedRenderingFromProtopieS')}</p>
          <p className="source-note">{t('rustRenderer.thisWorkWasStillInDevelopmentBefore')}</p>
        </div>
        <section id="shared">
          <p className="eyebrow">{t('rustRenderer.decision01Consistency')}</p>
          <h2>Geometry Consistency</h2>
          <p>{t('rustRenderer.interpretingStrokeWidthOrAlignmentIndependentlyAt')}</p>
          <Diagram
            locale={locale}
            type="stroke"
            caption={t('rustRenderer.conceptDiagramOfSharingStrokeInterpretationAcross')}
          />
          <p>{t('rustRenderer.iAlsoDistinguishedChangesThatRequireRebuilding')}</p>
        </section>
        <section id="graph">
          <p className="eyebrow">{t('rustRenderer.decision02RenderGraph')}</p>
          <h2>Render Graph</h2>
          <p>{t('rustRenderer.operationsSuchAsBlurAndCompositingConsume')}</p>
          <Diagram
            locale={locale}
            type="graph"
            caption={t('rustRenderer.conceptDiagramOfPassDependenciesAndTemporary')}
          />
          <p>{t('rustRenderer.planningAndGpuCommandEncodingWereSeparate')}</p>
        </section>
        <section id="recovery">
          <p className="eyebrow">{t('rustRenderer.decision03Recovery')}</p>
          <h2>Error Recovery</h2>
          <div className="decision-pairs">
            <div>
              <h3>{t('rustRenderer.whenRetryingMakesSense')}</h3>
              <p>{t('rustRenderer.transientFailuresRetryOnALaterFrame')}</p>
            </div>
            <div>
              <h3>{t('rustRenderer.whenInputNeedsToChange')}</h3>
              <p>{t('rustRenderer.workThatConsistentlyFailsOnTheSame')}</p>
            </div>
          </div>
        </section>
        <LocalLink className="next-project" href="/work/interactive-3d/" locale={locale}>
          <small>{t('rustRenderer.nextProject')}</small>
          <span>
            Interactive 3D <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
