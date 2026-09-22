import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import { formId } from '@/graphics/forms';
import Intro from '@/components/ProjectIntro';
import Icon from '@/components/Icon';
import ScreenPair from '@/components/ScreenPair';
export function getMeta(locale: Locale) {
  const t = getTranslations(locale);
  return {
    title: 'Web Platforms — KICA & ENC / Sookie',
    description: t('webPlatforms.kicaSPublicSiteAdminInterfaceAnd'),
    shape: formId.web,
    kind: 'project',
  };
}
export default function WorkWebPlatforms({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <>
      <Intro
        locale={locale}
        number="02"
        category="WEB PLATFORMS"
        line1="Web"
        line2="Platforms"
        summary={t('webPlatforms.iBuiltMemberFacingWebsitesTogetherWith')}
        role={t('webPlatforms.frontendCmsBackendKica')}
        stack="React · Next.js · NestJS · PostgreSQL"
        backHref="/work/interactive-3d/#web-platforms"
        backLabel="Interactive"
        sections={[
          { id: 'kica', label: 'KICA' },
          { id: 'enc', label: 'ENC' },
        ]}
      />
      <article className="story case-story" id="story">
        <section className="story-lead" id="kica">
          <p className="eyebrow">{t('webPlatforms.kicaKoreaInHouseCounselAssociation2023')}</p>
          <h2>Membership Platform</h2>
          <p className="case-deck">{t('webPlatforms.memberWebsiteAdminApi')}</p>
          <p>{t('webPlatforms.iIndependentlyDesignedAndDevelopedTheKorea')}</p>
          <ul className="capability-tags">
            <li>Backend</li>
            <li>{t('webPlatforms.contentTooling')}</li>
            <li>{t('webPlatforms.apiIntegration')}</li>
          </ul>
          <ScreenPair
            locale={locale}
            first="/media/kica-site.webp"
            firstAlt={t('webPlatforms.kicaSOriginalHomepageLayoutWithLocal')}
            firstLabel={t('webPlatforms.kicaPublicWebsite')}
            second="/media/kica-cms.webp"
            secondAlt={t('webPlatforms.kicaSOriginalAdminInterfaceForDesktop')}
            secondLabel={t('webPlatforms.kicaContentManagement')}
          />
          <div
            className="service-map"
            role="img"
            aria-label={t('webPlatforms.kicaImplementationScopeNextJsMemberSite')}
          >
            <div>
              <small>{t('webPlatforms.member')}</small>
              <strong>{t('webPlatforms.publicWebsite')}</strong>
              <span>{t('webPlatforms.registrationDuesBoardsEvents')}</span>
            </div>
            <div className="map-core">
              <small>API & DATA</small>
              <strong>NestJS / PostgreSQL</strong>
              <span>{t('webPlatforms.membersOrdersContent')}</span>
            </div>
            <div>
              <small>{t('webPlatforms.operator')}</small>
              <strong>{t('webPlatforms.adminInterface')}</strong>
              <span>{t('webPlatforms.membersContentEmailAnalytics')}</span>
            </div>
          </div>
          <div className="case-topics">
            <div>
              <h3>{t('webPlatforms.koreanEnglishPagesAndSsr')}</h3>
              <p>{t('webPlatforms.iBuiltTheKoreanAndEnglishSites')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.paymentsAndMembershipStatus')}</h3>
              <p>{t('webPlatforms.theClientSPaymentCompleteResponseWas')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.contentManagedByOperators')}</h3>
              <p>{t('webPlatforms.theAdminInterfaceManagedMembersDuesBoards')}</p>
            </div>
          </div>
          <p className="stack-note">Next.js · React · NestJS · TypeORM · PostgreSQL · Tiptap</p>
        </section>
        <section id="enc">
          <p className="eyebrow">{t('webPlatforms.encLawFirmWebsiteCms')}</p>
          <h2>Website & CMS</h2>
          <p className="case-deck">{t('webPlatforms.websiteContentEditingPublishing')}</p>
          <p>{t('webPlatforms.iDevelopedEncSPublicWebsiteAnd')}</p>
          <ul className="capability-tags">
            <li>{t('webPlatforms.contentTooling')}</li>
            <li>{t('webPlatforms.apiIntegration')}</li>
          </ul>
          <ScreenPair
            locale={locale}
            first="/media/enc-site.webp"
            firstAlt={t('webPlatforms.reproductionOfEncSOriginalResponsiveHomepage')}
            firstLabel={t('webPlatforms.encPublicWebsite')}
            firstHeight={314}
            second="/media/enc-cms.webp"
            secondAlt={t('webPlatforms.encSOriginalCmsForDesktopMobile')}
            secondLabel={t('webPlatforms.encBannerManagement')}
          />
          <div className="case-topics">
            <div>
              <h3>{t('webPlatforms.sharedStructureAcrossPages')}</h3>
              <p>{t('webPlatforms.pagesUsedSharedNextJsAppRouter')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.editingImagesAndOrder')}</h3>
              <p>{t('webPlatforms.eachBannerHadSeparateDesktopAndMobile')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.directControlOverArticleImages')}</h3>
              <p>{t('webPlatforms.iCustomizedTiptapSImageExtensionTo')}</p>
            </div>
          </div>
          <p className="stack-note">Next.js · React · TanStack Query · Tiptap · Tailwind CSS</p>
        </section>
        <LocalLink className="next-project" href="/work/xr/" data-project="0" locale={locale}>
          <small>{t('webPlatforms.nextXr')}</small>
          <span>
            WebAR Exhibitions <Icon locale={locale} name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
