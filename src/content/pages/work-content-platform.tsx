import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Intro from '@/components/ProjectIntro';
import Icon from '@/components/Icon';
import ProjectVideo from '@/components/ProjectVideo';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: '3D Content Platform — Sookie',
    description: t('contentPlatform.webClientDevelopmentAtBluebeakerContentSearch'),
    shape: formId.content,
    kind: 'project',
  };
}
export default function WorkContentPlatform({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <Intro
        locale={locale}
        number="02"
        category="3D APPS / BLUEBEAKER / 2022.03–2025.01"
        line1="3D Content"
        line2="Platform"
        summary={t('contentPlatform.iBuiltWebServicesForFindingEditing')}
        role={t('contentPlatform.fullClientDevelopmentDevelopmentLead')}
        stack="React · Next.js · Three.js · WebGL"
        backHref="/work/interactive-3d/#bluebeaker"
        backLabel="Interactive"
        sections={[
          { id: 'product', label: 'Product UI' },
          { id: 'tools', label: 'Content Tools' },
          { id: 'rendering', label: 'Rendering & Assets' },
        ]}
      />
      <article className="story case-story" id="story">
        <section className="story-lead" id="product">
          <ProjectVideo
            locale={locale}
            project="Bluebeaker"
            label={t('contentPlatform.text3dViewerScreenRecording')}
            src="/media/bluebeaker-viewer.mp4"
            poster="/media/bluebeaker-viewer.webp"
            width={1600}
            height={958}
            description={t('contentPlatform.bluebeakerRecordingRotatingAndZoomingAFace')}
          />
          <h2>Product UI</h2>
          <p>{t('contentPlatform.iDevelopedTheClientsForBluebeakerLab')}</p>
          <div className="case-topics">
            <div>
              <h3>{t('contentPlatform.searchInputsAndResults')}</h3>
              <p>{t('contentPlatform.inLibraryIConnectedSearchTermsContent')}</p>
            </div>
            <div>
              <h3>{t('contentPlatform.storageAndContentSpecificViewers')}</h3>
              <p>{t('contentPlatform.iConnectedFolderCreationRenamingAndFile')}</p>
            </div>
            <div>
              <h3>{t('contentPlatform.connectingWebAndDesktop')}</h3>
              <p>{t('contentPlatform.doctorRanAsAWebInterfaceInside')}</p>
            </div>
          </div>
        </section>
        <section id="tools">
          <h2>Content Tools</h2>
          <p>{t('contentPlatform.iBuiltAdminScreensWhereOperatorsAnd')}</p>
          <div className="case-topics">
            <div>
              <h3>{t('contentPlatform.registrationAndUploads')}</h3>
              <p>{t('contentPlatform.theClientFirstCreatedContentMetadataRequested')}</p>
            </div>
            <div>
              <h3>{t('contentPlatform.text3dSettingsAsControls')}</h3>
              <p>{t('contentPlatform.iConnectedPanelsForCameraCalibrationLighting')}</p>
            </div>
          </div>
        </section>
        <section id="rendering">
          <h2>Rendering & Assets</h2>
          <p>{t('contentPlatform.iWorkedOnBothViewerInteractionAnd')}</p>
          <div className="case-topics">
            <div>
              <h3>{t('contentPlatform.pickingAndMultipleViews')}</h3>
              <p>{t('contentPlatform.iUsedThreeMeshBvhForModel')}</p>
            </div>
            <div>
              <h3>{t('contentPlatform.automatingRepetitiveAssetWork')}</h3>
              <p>{t('contentPlatform.withGltfTransformIRemovedDuplicateAnd')}</p>
            </div>
          </div>
        </section>
        <LocalLink
          className="next-project"
          href="/work/realtime-game/"
          data-project="3"
          locale={locale}
        >
          <small>{t('contentPlatform.next3dApps')}</small>
          <span>
            Realtime 3D Game <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
