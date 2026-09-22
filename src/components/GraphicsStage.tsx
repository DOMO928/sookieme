'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { routeState } from '@/content/route-state';
import type { FieldController } from '@/graphics/controller';

export default function GraphicsStage() {
  const host = useRef<HTMLDivElement>(null),
    runtime = useRef<FieldController | null>(null);
  const pathname = usePathname() ?? '/';
  useLayoutEffect(() => {
    const { locale, shape, kind } = routeState(pathname);
    document.documentElement.lang = locale;
    document.body.dataset.shape = String(shape);
    document.body.dataset.kind = kind;
    runtime.current?.syncRoute();
  }, [pathname]);
  useEffect(() => {
    let mounted = true,
      release: (() => void) | undefined;
    void import('@/graphics/controller')
      .then(({ acquireField }) => {
        if (!mounted || !host.current) return;
        const lease = acquireField(host.current);
        runtime.current = lease.controller;
        release = lease.release;
        runtime.current.syncRoute();
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        host.current?.setAttribute('data-fallback', 'true');
        console.warn('[Field / Form] Graphics module unavailable; keeping the static view.', error);
      });
    return () => {
      mounted = false;
      runtime.current = null;
      release?.();
    };
  }, []);
  return (
    <div id="field-stage" ref={host} aria-hidden="true">
      <div className="field-scrim" />
    </div>
  );
}
