import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import { formId } from '../graphics/forms';
export function getProjectGroups(locale: Locale) {
  const t = getTranslations(locale);
  return [
    {
      id: '3d-apps',
      title: '3D Apps',
      description: t('projects.productSummary'),
    },
    {
      id: 'web-platforms',
      title: 'Web Platforms',
      description: t('projects.webSummary'),
    },
    {
      id: 'xr',
      title: 'XR',
      description: t('projects.xrSummary'),
    },
  ] as const;
}

// Form IDs are stable, independent of the position or category of a case.
export function getProjects(locale: Locale) {
  const t = getTranslations(locale);
  return [
    {
      id: 'bluebeaker',
      group: '3d-apps',
      projectCount: 1,
      title: '3D Content Platform',
      company: 'Bluebeaker',
      period: '2022.03–2025.01',
      href: '/work/content-platform/',
      shape: formId.content,
      summary: t('projects.bluebeakerSummary'),
      tags: [
        t('projects.interactionTag'),
        t('webPlatforms.contentTooling'),
        t('webPlatforms.apiIntegration'),
      ],
      image: '/media/bluebeaker-viewer.webp',
      alt: t('projects.bluebeaker3dViewerInUse'),
    },
    {
      id: 'amos',
      group: '3d-apps',
      projectCount: 1,
      title: 'Realtime 3D Game',
      company: 'Amos',
      period: '2020.08–2021.11',
      href: '/work/realtime-game/',
      shape: formId.game,
      summary: t('projects.amosSummary'),
      tags: [t('projects.stateManagement'), t('projects.interactionTag'), 'Rendering'],
      image: '/media/amos-gameplay.webp',
      alt: t('projects.amosAlt'),
    },
    {
      id: 'kica',
      group: 'web-platforms',
      projectCount: 1,
      title: 'Membership Platform',
      company: t('projects.kicaCompany'),
      period: '2023',
      href: '/work/web-platforms/#kica',
      shape: formId.web,
      summary: t('projects.kicaSummary'),
      tags: ['Backend', t('webPlatforms.contentTooling'), t('webPlatforms.apiIntegration')],
      image: '/media/kica-site.webp',
      alt: t('projects.kicaAlt'),
    },
    {
      id: 'enc',
      group: 'web-platforms',
      projectCount: 1,
      title: 'Website & CMS',
      company: t('projects.encLawFirm'),
      period: '',
      href: '/work/web-platforms/#enc',
      shape: formId.web,
      summary: t('projects.encSummary'),
      tags: [t('webPlatforms.contentTooling'), t('webPlatforms.apiIntegration')],
      image: '/media/enc-cms.webp',
      alt: t('projects.encAlt'),
    },
    {
      id: 'desk',
      group: 'xr',
      projectCount: 1,
      title: t('xr.theDeskOfDecision'),
      company: t('xr.deskLocation'),
      period: '2025.08',
      href: '/work/xr/#desk',
      shape: formId.xr,
      summary: t('editorial.deskSummary'),
      tags: ['WebAR', t('projects.interactionTag')],
      image: '/media/desk-ar.webp',
      alt: t('projects.usingAPhoneForArAtThe'),
    },
    {
      id: 'gangwon',
      group: 'xr',
      projectCount: 1,
      title: t('xr.gangwonGamyeong'),
      company: t('xr.gangwonLocation'),
      period: '2025.01',
      href: '/work/xr/#gangwon',
      shape: formId.xr,
      summary: t('editorial.gangwonSummary'),
      tags: ['WebAR', t('projects.interactionTag')],
      image: '/media/gangwon-ar-5.webp',
      alt: t('experienceGallery.arPhotoAlt'),
    },
    {
      id: 'haegwan',
      group: 'xr',
      projectCount: 1,
      title: t('xr.haegwan1897'),
      company: t('xr.haegwanLocation'),
      period: '2025.05',
      href: '/work/xr/#haegwan',
      shape: formId.xr,
      summary: t('editorial.haegwanSummary'),
      tags: ['WebAR', t('projects.interactionTag')],
      image: '/media/haegwan-ar.webp',
      alt: t('xr.haegwanPreviewDescription'),
    },
  ] as const;
}
