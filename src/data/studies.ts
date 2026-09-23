import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
export function getStudies(locale: Locale) {
  const t = getTranslations(locale);
  return [
    {
      id: 'field-form',
      number: '01',
      title: 'Field / Form',
      year: '2026',
      status: t('studies.liveStudy'),
      stack: ['Rust', 'wgpu', 'WGSL', 'WebGPU'],
      description: t('studies.fieldFormSummary'),
      href: '/lab/field-form/',
      action: t('studies.tryTheControls'),
    },
    {
      id: 'skeletal-codec',
      number: '02',
      title: 'skeletal-codec',
      year: '2026',
      status: t('studies.researchInProgress'),
      stack: ['Animation', 'FK / IK', t('studies.compression')],
      description: t('studies.codecSummary'),
    },
  ] as const;
}
