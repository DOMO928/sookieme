import 'server-only';
import Home, { getMeta as getHomeMeta } from './pages/index';
import About, { getMeta as getAboutMeta } from './pages/about';
import Study, { getMeta as getStudyMeta } from './pages/study';
import FieldForm, { getMeta as getFieldFormMeta } from './pages/lab-field-form';
import ContentPlatform, { getMeta as getContentPlatformMeta } from './pages/work-content-platform';
import Interactive3D, { getMeta as getInteractive3DMeta } from './pages/work-interactive-3d';
import RealtimeGame, { getMeta as getRealtimeGameMeta } from './pages/work-realtime-game';
import RustRenderer, { getMeta as getRustRendererMeta } from './pages/work-rust-renderer';
import WebPlatforms, { getMeta as getWebPlatformsMeta } from './pages/work-web-platforms';
import XR, { getMeta as getXRMeta } from './pages/work-xr';
import NotFound, { getMeta as getNotFoundMeta } from './pages/404';
export const pages = {
  '/': { Component: Home, metadata: getHomeMeta },
  '/about/': { Component: About, metadata: getAboutMeta },
  '/study/': { Component: Study, metadata: getStudyMeta },
  '/lab/field-form/': { Component: FieldForm, metadata: getFieldFormMeta },
  '/work/content-platform/': { Component: ContentPlatform, metadata: getContentPlatformMeta },
  '/work/interactive-3d/': { Component: Interactive3D, metadata: getInteractive3DMeta },
  '/work/realtime-game/': { Component: RealtimeGame, metadata: getRealtimeGameMeta },
  '/work/rust-renderer/': { Component: RustRenderer, metadata: getRustRendererMeta },
  '/work/web-platforms/': { Component: WebPlatforms, metadata: getWebPlatformsMeta },
  '/work/xr/': { Component: XR, metadata: getXRMeta },
  '/404/': { Component: NotFound, metadata: getNotFoundMeta },
};
