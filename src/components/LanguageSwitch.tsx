'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { locales, localizePath, type Locale } from '@/i18n/routes';
const names = { ko: '한국어', en: 'English', de: 'Deutsch' };
const shortNames = { ko: '한', en: 'EN', de: 'DE' };
export default function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [suffix, setSuffix] = useState('');
  useEffect(() => {
    const sync = () => setSuffix(location.search + location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    document.addEventListener('click', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
      document.removeEventListener('click', sync);
    };
  }, [pathname]);
  return (
    <nav className="language-switch" aria-label={label}>
      {locales.map((language) => (
        <Link
          key={language}
          data-language-link
          href={localizePath(pathname, language) + suffix}
          lang={language}
          hrefLang={language}
          aria-label={names[language]}
          title={names[language]}
          aria-current={locale === language ? 'true' : undefined}
          onPointerEnter={() => setSuffix(location.search + location.hash)}
          onFocus={() => setSuffix(location.search + location.hash)}
          onClick={(event) => {
            // Read the current anchor at activation, including hash-only Next navigations.
            const current = location.search + location.hash;
            if (
              current !== suffix &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey &&
              event.button === 0
            ) {
              event.preventDefault();
              router.push(localizePath(pathname, language) + current);
            }
          }}
        >
          {shortNames[language]}
        </Link>
      ))}
    </nav>
  );
}
