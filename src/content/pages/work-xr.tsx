import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Intro from '@/components/ProjectIntro';
import Icon from '@/components/Icon';
import ProjectVideo from '@/components/ProjectVideo';
import ExperienceGallery from '@/components/ExperienceGallery';
import TrackingFigure from '@/components/TrackingFigure';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: 'WebAR Exhibitions — Sookie',
    description: t('xr.exhibitionWebarAndArVrContentFor'),
    shape: formId.xr,
    kind: 'project',
  };
}
export default function WorkXr({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <Intro
        locale={locale}
        number="02"
        category="XR / EXHIBITIONS / 2025"
        line1="WebAR"
        line2={t('xr.exhibitions')}
        summary={t('xr.iDevelopedArViewersAndInteractiveContent')}
        role={t('xr.webArViewersArVrContentDevelopment')}
        stack="Three.js · AlvaAR · 8th Wall"
        backHref="/work/interactive-3d/#xr"
        backLabel="Interactive"
        sections={[
          { id: 'desk', label: t('xr.theDeskOfDecision') },
          { id: 'gangwon', label: t('xr.gangwonGamyeong') },
          { id: 'haegwan', label: t('xr.haegwan1897') },
          { id: 'tracking', label: t('xr.implementation') },
        ]}
      />
      <article className="story case-story" id="story">
        <section className="story-lead xr-exhibit" id="desk">
          <div className="exhibit-heading">
            <div>
              <p className="eyebrow">01 / WAR MEMORIAL OF KOREA</p>
              <h2>{t('xr.theDeskOfDecision')}</h2>
              <p className="exhibition-place">{t('xr.warMemorialOfKoreaKoreanWarLeaders')}</p>
            </div>
            <time>2025.08</time>
          </div>
          <ProjectVideo
            locale={locale}
            project={t('xr.theDeskOfDecision')}
            label={t('xr.exhibitionIntroductionOnSiteArExperience')}
            src="/media/desk-ar.mp4"
            poster="/media/desk-ar.webp"
            description={t('xr.videoOfTheDeskOfDecisionExhibition')}
            width={1194}
            height={672}
          />
          <p>{t('xr.iDevelopedAWebArViewerThat')}</p>
        </section>
        <section className="xr-exhibit" id="gangwon">
          <div className="exhibit-heading">
            <div>
              <p className="eyebrow">02 / GANGWON GAMYEONG</p>
              <h2>{t('xr.gangwonGamyeong')}</h2>
              <p className="exhibition-place">{t('xr.wonjuCityInformationCenterArVrExperience')}</p>
            </div>
            <time>2025.01</time>
          </div>
          <p>{t('xr.iDevelopedOnSiteArContentIncluding')}</p>
          <ExperienceGallery locale={locale} />
        </section>
        <section className="xr-exhibit" id="haegwan">
          <div className="exhibit-heading">
            <div>
              <p className="eyebrow">03 / HAEGWAN 1897</p>
              <h2>{t('xr.haegwan1897')}</h2>
              <p className="exhibition-place">{t('xr.mokpoFoodCultureGalleryArGuide')}</p>
            </div>
            <time>2025.05</time>
          </div>
          <ProjectVideo
            locale={locale}
            project={t('xr.haegwan1897')}
            label={t('xr.haegwanVideoLabel')}
            src="/media/haegwan-ar.mp4"
            poster="/media/haegwan-ar.webp"
            description={t('xr.haegwanVideoDescription')}
            width={1280}
            height={720}
          />
          <p>{t('xr.iDevelopedThe3dModelViewerFor')}</p>
        </section>
        <section id="tracking">
          <p className="eyebrow">AlvaAR / Three.js</p>
          <h2>{t('xr.implementation')}</h2>
          <p>{t('xr.iUsedAlvaarAnd8thWallIn')}</p>
          <TrackingFigure locale={locale} />
          <div className="case-topics">
            <div>
              <h3>{t('xr.matchingVideoAndViewportDimensions')}</h3>
              <p>{t('xr.whenTheCameraFeedAndDisplayArea')}</p>
            </div>
            <div>
              <h3>{t('xr.applyingPoseToThreeJs')}</h3>
              <p>{t('xr.iDecomposedTheEstimatedPoseMatrixInto')}</p>
            </div>
          </div>
        </section>
        <LocalLink className="next-project" href="/study/" data-project="3" locale={locale}>
          <small>{t('interactive-3d.next')}</small>
          <span>
            Study <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
