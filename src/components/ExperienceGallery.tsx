import { getTranslations } from '@/i18n/catalog';
import type { Locale } from '@/i18n/routes';
import LocalLink from '@/components/LocalLink';
import Icon from './Icon';
interface Props {
  locale: Locale;
}
export default function ExperienceGallery(props: Props) {
  const { locale } = props;
  const t = getTranslations(locale);
  const photos = [
    {
      image: 1,
      title: t('experienceGallery.qrInstructions'),
      description: t('experienceGallery.openTheArExperienceFromTheOn'),
      alt: t('experienceGallery.arInstructionsAndAQrCodeOn'),
      width: 750,
      height: 1000,
    },
    {
      image: 2,
      title: t('experienceGallery.pointTheCamera'),
      description: t('experienceGallery.thePhoneDisplaysTheRealLocation'),
      alt: t('experienceGallery.phoneAimedAtTheMoonSculptureWith'),
      width: 750,
      height: 1000,
    },
    {
      image: 3,
      title: t('experienceGallery.arOverlay'),
      description: t('experienceGallery.aRabbitCharacterAppearsInTheCamera'),
      alt: t('experienceGallery.phoneArViewShowingARabbitCharacter'),
      width: 750,
      height: 1000,
    },
    {
      image: 4,
      title: t('experienceGallery.physicalSpace'),
      description: t('experienceGallery.theLocationWithoutArContent'),
      alt: t('experienceGallery.theMoonSculptureAndBuildingsAtGangwon'),
      width: 750,
      height: 999,
    },
    {
      image: 5,
      title: t('experienceGallery.arPhoto'),
      description: t('experienceGallery.theSameLocationPhotographedWithTheAr'),
      alt: t('experienceGallery.arPhotoWithAVirtualRabbitOn'),
      width: 636,
      height: 1200,
    },
  ];
  return (
    <div
      className="experience-gallery"
      data-gallery
      role="region"
      aria-roledescription="carousel"
      aria-label={t('experienceGallery.gangwonGamyeongArExperiencePhotos')}
    >
      <div className="gallery-toolbar">
        <span>{t('experienceGallery.onSiteExperience')}</span>
        <div className="gallery-buttons" data-gallery-controls hidden>
          <span data-gallery-position aria-live="polite">
            01 / 05
          </span>
          <button
            type="button"
            data-gallery-prev
            aria-label={t('experienceGallery.previousExperiencePhoto')}
            aria-controls="gangwon-photos"
          >
            <Icon locale={locale} name="arrow-left" />
          </button>
          <button
            type="button"
            data-gallery-next
            aria-label={t('experienceGallery.nextExperiencePhoto')}
            aria-controls="gangwon-photos"
          >
            <Icon locale={locale} name="arrow-right" />
          </button>
        </div>
      </div>
      <div
        className="gallery-track"
        id="gangwon-photos"
        tabIndex={0}
        aria-label={t('experienceGallery.photoGalleryUseTheLeftRightArrow')}
      >
        {photos.map((photo, i) => (
          <figure
            key={photo.image}
            className="gallery-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${photos.length}: ${photo.title}`}
          >
            <LocalLink
              href={`/media/gangwon-ar-${photo.image}.webp`}
              target="_blank"
              rel="noopener"
              aria-label={t('media.enlarge', { label: photo.title })}
              locale={locale}
            >
              <img
                src={`/media/gangwon-ar-${photo.image}.webp`}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
            </LocalLink>
            <figcaption>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{photo.title}</strong>
                <p>{photo.description}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="gallery-credit">
        {t('experienceGallery.onSitePhotography')}
        <LocalLink
          href="https://blog.naver.com/kisgirl2422/223970722081"
          target="_blank"
          rel="noopener"
          locale={locale}
        >
          {t('experienceGallery.pinkkuNaverBlog')}
        </LocalLink>
        <span>{t('experienceGallery.text14Aug2025SelectAPhotoTo')}</span>
      </p>
    </div>
  );
}
