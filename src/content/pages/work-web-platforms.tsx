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
    description: t('webPlatforms.description'),
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
        summary={t('webPlatforms.summary')}
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
          <p className="eyebrow">{t('webPlatforms.kicaCategory')}</p>
          <h2>Membership Platform</h2>
          <p className="case-deck">{t('webPlatforms.memberWebsiteAdminApi')}</p>
          <p>{t('webPlatforms.kicaOverview')}</p>
          <ul className="capability-tags">
            <li>Backend</li>
            <li>{t('webPlatforms.contentTooling')}</li>
            <li>{t('webPlatforms.apiIntegration')}</li>
          </ul>
          <ScreenPair
            locale={locale}
            first="/media/kica-site.webp"
            firstAlt={t('webPlatforms.kicaSiteAlt')}
            firstLabel={t('webPlatforms.kicaPublicWebsite')}
            second="/media/kica-cms.webp"
            secondAlt={t('webPlatforms.kicaAdminAlt')}
            secondLabel={t('webPlatforms.kicaContentManagement')}
          />
          <div className="service-map" role="img" aria-label={t('webPlatforms.kicaArchitecture')}>
            <div>
              <small>{t('webPlatforms.member')}</small>
              <strong>{t('webPlatforms.publicWebsite')}</strong>
              <span>{t('webPlatforms.memberFeatures')}</span>
            </div>
            <div className="map-core">
              <small>API & DATA</small>
              <strong>NestJS / PostgreSQL</strong>
              <span>{t('webPlatforms.membersOrdersContent')}</span>
            </div>
            <div>
              <small>{t('webPlatforms.operator')}</small>
              <strong>{t('webPlatforms.adminInterface')}</strong>
              <span>{t('webPlatforms.adminFeatures')}</span>
            </div>
          </div>
          <div className="case-topics">
            <div>
              <h3>{t('webPlatforms.koreanEnglishPagesAndSsr')}</h3>
              <p>{t('webPlatforms.memberSite')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.paymentsAndMembershipStatus')}</h3>
              <p>{t('webPlatforms.paymentVerification')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.contentManagedByOperators')}</h3>
              <p>{t('webPlatforms.memberAdministration')}</p>
            </div>
          </div>
          <p className="stack-note">Next.js · React · NestJS · TypeORM · PostgreSQL · Tiptap</p>
        </section>
        <section id="enc">
          <p className="eyebrow">{t('webPlatforms.encLawFirmWebsiteCms')}</p>
          <h2>Website & CMS</h2>
          <p className="case-deck">{t('webPlatforms.encCategory')}</p>
          <p>{t('webPlatforms.encOverview')}</p>
          <ul className="capability-tags">
            <li>{t('webPlatforms.contentTooling')}</li>
            <li>{t('webPlatforms.apiIntegration')}</li>
          </ul>
          <ScreenPair
            locale={locale}
            first="/media/enc-site.webp"
            firstAlt={t('webPlatforms.encSiteAlt')}
            firstLabel={t('webPlatforms.encPublicWebsite')}
            firstHeight={314}
            second="/media/enc-cms.webp"
            secondAlt={t('webPlatforms.encCmsAlt')}
            secondLabel={t('webPlatforms.encBannerManagement')}
          />
          <div className="case-topics">
            <div>
              <h3>{t('webPlatforms.sharedStructureAcrossPages')}</h3>
              <p>{t('webPlatforms.publicPageStructure')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.editingImagesAndOrder')}</h3>
              <p>{t('webPlatforms.bannerEditing')}</p>
            </div>
            <div>
              <h3>{t('webPlatforms.imageEditingHeading')}</h3>
              <p>{t('webPlatforms.articleImageEditing')}</p>
            </div>
          </div>
          <p className="stack-note">Next.js · React · TanStack Query · Tiptap · Tailwind CSS</p>
        </section>
        <LocalLink className="next-project" href="/work/xr/" data-project="0" locale={locale}>
          <small>{t('webPlatforms.nextXr')}</small>
          <span>
            WebAR Exhibitions <Icon name="arrow-right" />
          </span>
        </LocalLink>
      </article>
    </>
  );
}
