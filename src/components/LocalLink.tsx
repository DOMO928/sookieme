import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';
import { localizePath, routePaths, unlocalizedPath, type Locale } from '@/i18n/routes';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { locale: Locale; href: string };
export default function LocalLink({ locale, href, children, ...props }: Props) {
  const localized = localizePath(href, locale);
  const path = unlocalizedPath(localized.split(/[?#]/)[0]);
  const internal = !href.startsWith('#') && routePaths.some((route) => route === path);
  if (internal && !props.download && !props.target)
    return (
      <Link {...props} href={localized}>
        {children}
      </Link>
    );
  return (
    <a {...props} href={localized}>
      {children}
    </a>
  );
}
