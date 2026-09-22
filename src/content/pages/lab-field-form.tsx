import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId, forms } from '@/graphics/forms';
import Icon from '@/components/Icon';
export function getMeta(_locale: Locale) {
  return {
    title: 'Field / Form — Sookie Graphics Lab',
    shape: formId.lab,
    kind: 'lab',
  };
}
export default function LabFieldForm({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <section className="lab-head">
        <p className="eyebrow">{t('labFieldForm.study01LiveExperiment')}</p>
        <h1>Field / Form</h1>
        <p className="lab-description">
          {t('labFieldForm.theGraphicsExperimentBehindThisSiteS')}
          <br />
          {t('labFieldForm.tryDifferentFormsAndRenderingPaths')}
        </p>
        <LocalLink className="quiet-link" href="/study/" locale={locale}>
          {t('labFieldForm.backToStudy')}
          <Icon locale={locale} name="arrow-left" />
        </LocalLink>
        <div className="lab-console">
          <div className="lab-controls">
            <label htmlFor="backend-select">
              {t('labFieldForm.renderingPath')}
              <select id="backend-select" disabled>
                <option value="auto">{t('labFieldForm.autoPreferWebgpu')}</option>
                <option value="webgl">{t('labFieldForm.webgl2CompatibilityPath')}</option>
                <option value="static">{t('labFieldForm.staticImage')}</option>
              </select>
            </label>
            <label htmlFor="shape-select">
              {t('labFieldForm.form')}
              <select id="shape-select" defaultValue={formId.lab} disabled>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {String(form.id + 1).padStart(2, '0')} — {form.label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="view-select">
              {t('labFieldForm.view')}
              <select id="view-select" disabled>
                <option value="0">{t('labFieldForm.particleField')}</option>
                <option value="1">{t('labFieldForm.targetGeometry')}</option>
                <option value="2">{t('labFieldForm.velocity')}</option>
              </select>
            </label>
            <button id="graphics-retry" hidden>
              {t('labFieldForm.retryGraphics')}
            </button>
            <button id="measure" disabled>
              {t('labFieldForm.measure10Seconds')}
            </button>
            <button id="save-frame" disabled>
              {t('labFieldForm.saveCurrentFrame')}
            </button>
          </div>
          <div className="lab-readouts">
            <dl className="lab-metrics">
              <div>
                <dt>Backend</dt>
                <dd id="lab-backend">{t('labFieldForm.preparing')}</dd>
              </div>
              <div>
                <dt>{t('labFieldForm.particles')}</dt>
                <dd id="lab-particles">—</dd>
              </div>
              <div>
                <dt>{t('labFieldForm.positionVelocityBuffer')}</dt>
                <dd id="lab-memory">—</dd>
              </div>
              <div>
                <dt>rAF median / p95</dt>
                <dd id="lab-frame">{t('labFieldForm.collectingSamples')}</dd>
              </div>
              <div>
                <dt>{t('labFieldForm.drawingBuffer')}</dt>
                <dd id="lab-viewport">—</dd>
              </div>
            </dl>
            <p id="measurement-result" className="lab-note" aria-live="polite">
              {t('labFieldForm.frameIntervalsMeasuredInThisBrowserThese')}
            </p>
          </div>
        </div>
        <LocalLink className="read-story" href="#implementation" locale={locale}>
          {t('labFieldForm.readAboutTheImplementation')}
          <Icon locale={locale} name="arrow-right" />
        </LocalLink>
      </section>
      <article className="story" id="implementation">
        <section className="story-lead">
          <p className="eyebrow">{t('labFieldForm.independentStudySeptember2026')}</p>
          <h2>{t('labFieldForm.persistentScene')}</h2>
          <p>{t('labFieldForm.aGraphicsExperimentBuiltForThisPortfolio')}</p>
          <p>{t('labFieldForm.theSilverParticlesAndSenseOfDepth')}</p>
        </section>
        <section>
          <p className="eyebrow">{t('labFieldForm.dataCompute')}</p>
          <h2>Surface Morphing</h2>
          <p>{t('labFieldForm.aStableIdAndIntegerHashProvide')}</p>
          <p>{t('labFieldForm.theComputeShaderReadsEachParticleS')}</p>
          <p>{t('labFieldForm.surfaceDeformationAndFreeDriftHaveSeparate')}</p>
          <p>{t('labFieldForm.aShortPointerHistorySuppliesDirectionAnd')}</p>
          <div className="technical-flow">
            <div className="flow-origin">
              <code>Position + velocity</code>
              <span>{t('labFieldForm.gpuStorageBuffer32BytesPerParticle')}</span>
            </div>
            <div className="flow-branches">
              <div>
                <b>Target</b>
                <span>{t('labFieldForm.shapeSampleId')}</span>
              </div>
              <div>
                <b>Compute</b>
                <span>{t('labFieldForm.targetForceDamping')}</span>
              </div>
              <div>
                <b>Render</b>
                <span>{t('labFieldForm.statePointerPointSprites')}</span>
              </div>
            </div>
          </div>
          <p>{t('labFieldForm.eachParticleUpdatesOnlyItsOwnState')}</p>
        </section>
        <section>
          <p className="eyebrow">RENDERING & LIFETIME</p>
          <h2>Rendering & Lifetime</h2>
          <p>{t('labFieldForm.depthAndPerSampleSizeVariationMix')}</p>
          <p>{t('labFieldForm.theCanvasPersistsDuringNavigationANew')}</p>
          <p>{t('labFieldForm.whenWebgpuIsUnavailableTheSiteTries')}</p>
        </section>
        <section>
          <p className="eyebrow">{t('labFieldForm.sourceReproduction')}</p>
          <h2>{t('labFieldForm.sourceCode')}</h2>
          <p>{t('labFieldForm.theRunningShaderRustEntryPointAnd')}</p>
          <div className="archive-list">
            <LocalLink href="/source/field.wgsl.txt" target="_blank" locale={locale}>
              <code>field.wgsl</code>
              <span>
                <b>{t('labFieldForm.shapesSimulationRendering')}</b>
                <small>{t('labFieldForm.targetFunctionsComputePointSprites')}</small>
              </span>
              <Icon locale={locale} name="arrow-up-right" />
            </LocalLink>
            <LocalLink href="/source/lib.rs.txt" target="_blank" locale={locale}>
              <code>lib.rs</code>
              <span>
                <b>Rust / wgpu</b>
                <small>{t('labFieldForm.deviceBuffersPipelinesFrames')}</small>
              </span>
              <Icon locale={locale} name="arrow-up-right" />
            </LocalLink>
            <LocalLink href="/source/controller.ts.txt" target="_blank" locale={locale}>
              <code>controller.ts</code>
              <span>
                <b>{t('labFieldForm.browserController')}</b>
                <small>{t('labFieldForm.navigationInputPausingFallback')}</small>
              </span>
              <Icon locale={locale} name="arrow-up-right" />
            </LocalLink>
            <LocalLink href="/source/field-form-source.zip" download locale={locale}>
              <code>source.zip</code>
              <span>
                <b>{t('labFieldForm.downloadTheIndependentImplementation')}</b>
                <small>{t('labFieldForm.rustCrateWgslBrowserCodeAndBuild')}</small>
              </span>
              <Icon locale={locale} name="download-simple" />
            </LocalLink>
          </div>
        </section>
        <LocalLink className="next-project" href="/study/" locale={locale}>
          <small>{t('labFieldForm.backToIndex')}</small>
          <span>
            Study <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
