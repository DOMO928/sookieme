import 'server-only';
import Page0, { getMeta as meta0 } from './pages/index';
import Page1, { getMeta as meta1 } from './pages/about';
import Page2, { getMeta as meta2 } from './pages/study';
import Page3, { getMeta as meta3 } from './pages/lab-field-form';
import Page4, { getMeta as meta4 } from './pages/work-content-platform';
import Page5, { getMeta as meta5 } from './pages/work-interactive-3d';
import Page6, { getMeta as meta6 } from './pages/work-realtime-game';
import Page7, { getMeta as meta7 } from './pages/work-rust-renderer';
import Page8, { getMeta as meta8 } from './pages/work-web-platforms';
import Page9, { getMeta as meta9 } from './pages/work-xr';
import Page10, { getMeta as meta10 } from './pages/404';
export const pages = {
  '/': { Component: Page0, metadata: meta0 },
  '/about/': { Component: Page1, metadata: meta1 },
  '/study/': { Component: Page2, metadata: meta2 },
  '/lab/field-form/': { Component: Page3, metadata: meta3 },
  '/work/content-platform/': { Component: Page4, metadata: meta4 },
  '/work/interactive-3d/': { Component: Page5, metadata: meta5 },
  '/work/realtime-game/': { Component: Page6, metadata: meta6 },
  '/work/rust-renderer/': { Component: Page7, metadata: meta7 },
  '/work/web-platforms/': { Component: Page8, metadata: meta8 },
  '/work/xr/': { Component: Page9, metadata: meta9 },
  '/404/': { Component: Page10, metadata: meta10 },
};
