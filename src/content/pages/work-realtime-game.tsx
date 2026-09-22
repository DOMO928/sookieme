import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Intro from '@/components/ProjectIntro';
import Icon from '@/components/Icon';
import ProjectVideo from '@/components/ProjectVideo';
import TechnicalDiagram from '@/components/TechnicalDiagram';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: 'Realtime 3D Game — Sookie',
    description: t('realtimeGame.amosGameClientBuiltWithReactAnd'),
    shape: formId.game,
    kind: 'project',
  };
}
export default function WorkRealtimeGame({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <Intro
        locale={locale}
        number="02"
        category="3D APPS / AMOS / 2020.08–2021.11"
        line1="Realtime"
        line2="3D Game"
        summary={t('realtimeGame.iBuiltTheWebClientForA')}
        role={t('realtimeGame.fullGameClientDevelopmentDevelopmentLead')}
        stack="React · Three.js · XState · Socket.IO"
        backHref="/work/interactive-3d/#amos"
        backLabel="Interactive"
        sections={[
          { id: 'client', label: 'Game Client' },
          { id: 'animation', label: 'Animation & Rendering' },
        ]}
      />
      <article className="story case-story" id="story">
        <section className="story-lead" id="client">
          <p className="eyebrow">REALTIME CLIENT</p>
          <ProjectVideo
            locale={locale}
            project="Amos"
            label={t('realtimeGame.gameClientScreenRecording')}
            src="/media/amos-gameplay.mp4"
            poster="/media/amos-gameplay.webp"
            width={1600}
            height={894}
            description={t('realtimeGame.amosRecordingBaccaratWebUiDealerCard')}
          />
          <h2>Game Client</h2>
          <p>{t('realtimeGame.iDevelopedTheClientForAReact')}</p>
          <div className="case-topics">
            <div>
              <h3>{t('realtimeGame.fromServerEventsToState')}</h3>
              <p>{t('realtimeGame.theClientJoinedRoomsAndReceivedGame')}</p>
            </div>
            <div>
              <h3>{t('realtimeGame.whenInputIsAllowed')}</h3>
              <p>{t('realtimeGame.iManagedAuthenticationSeparatelyFromTheWaiting')}</p>
            </div>
          </div>
        </section>
        <section id="animation">
          <h2>Animation & Rendering</h2>
          <div className="case-topics">
            <div>
              <h3>{t('realtimeGame.switchingBetweenClipsAndIk')}</h3>
              <p>{t('realtimeGame.clipsHandledEntryAndReturnMovementsDuring')}</p>
            </div>
            <div>
              <h3>{t('realtimeGame.renderingRepeatedCards')}</h3>
              <p>{t('realtimeGame.cardsSharedGeometryAndMaterialThroughInstancedmesh')}</p>
            </div>
          </div>
          <TechnicalDiagram
            locale={locale}
            type="instances"
            caption={t('realtimeGame.conceptDiagramOfCardRenderingWithShared')}
          />
        </section>
        <LocalLink
          className="next-project"
          href="/work/web-platforms/#kica"
          data-project="1"
          locale={locale}
        >
          <small>{t('realtimeGame.nextWebPlatforms')}</small>
          <span>
            Membership Platform <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
