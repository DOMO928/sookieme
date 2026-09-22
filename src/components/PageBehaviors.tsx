'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setupPageMedia } from '@/interactions/media';
import { setupCaseNavigation } from '@/interactions/case-navigation';
export default function PageBehaviors() {
  const pathname = usePathname();
  useEffect(() => {
    const disposeMedia = setupPageMedia();
    const disposeNavigation = setupCaseNavigation();
    return () => {
      disposeMedia();
      disposeNavigation();
    };
  }, [pathname]);
  return null;
}
