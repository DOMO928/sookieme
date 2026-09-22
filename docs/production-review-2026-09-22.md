# Production code review — 2026-09-22

## Scope and release criteria

Baseline: `9a5b4b0`. Review the portfolio repository and deployed site; do not publish parent-workspace/company source. Keep the existing visual direction and project content. Findings require a concrete trigger and code or runtime evidence. Avoid speculative rewrites. Fix confirmed high-impact issues, add targeted regression coverage, then verify the production build and deployed behavior.

A successful release means: all registered routes and locales build; internal navigation/anchors work; one graphics runtime survives navigation and releases its resources; fallback content survives unavailable GPU/JavaScript; reduced-motion and visibility preferences are respected; media controls remain usable; public files exclude private source; the repository link names its destination truthfully; existing and new relevant checks pass. Browser coverage and any external blockers must be stated separately from code verification.

## Detailed review plan

1. **Repository, release, dependencies**
   - Inspect Git state, remote visibility, permissions, remote/local divergence, CI workflow and deploy configuration.
   - Audit lockfile dependencies; review public archive allowlist, licenses, generated artifacts and reproducible setup.
   - Check production HTTP status, security headers, cache behavior and asset sizes.
2. **Routing, content and localization**
   - Inspect static route generation, unknown routes, SEO metadata, canonical/hreflang/sitemap consistency.
   - Trace Next links, anchor links, back/forward, language switching with query/hash, document language and footer state.
   - Confirm all three catalogs are complete and route-specific content is server rendered.
3. **Graphics lifecycle and failure handling**
   - Follow React acquire/release, asynchronous initialization, backend switching, stale results, canvas reparenting and cleanup.
   - Inspect RAF ownership, time steps, pointer input, resize/DPR, hidden tabs, reduced motion, data saving and static fallback.
   - Review Rust/wgpu buffers, compute dispatch, ping-pong use, pipeline state, errors and device loss; inspect WebGL resource cleanup and context loss.
4. **Media and interaction**
   - Inspect video autoplay/manual pause, visibility and preference changes, gallery order/control state, section navigation and event cleanup.
   - Reproduce confirmed edge cases and add behavioral regression tests where they prevent recurrence.
5. **Accessibility, responsive layout and performance**
   - Check semantic navigation, focus/keyboard behavior, link labels, native controls, reduced motion, no-JS content and GPU fallback.
   - Inspect mobile/desktop layout for touched components, page/asset weight and render scheduling. Do not infer real-device performance from desktop timings.
6. **Maintainability and GitHub link**
   - Review shared components, styling boundaries, unused imports/dependencies, content duplication, formatter/check scripts and README accuracy.
   - Place the repository link unobtrusively in the shared footer, with clear locale-appropriate naming; avoid presenting an outdated remote as current source.
7. **Verification and release**
   - Run TypeScript/build/tests, Rust/WASM validation if changed, dependency audit and diff checks.
   - Browser-check key navigation, language/anchor retention, Lab/backend/fallback behavior, media/gallery and footer at narrow/wide sizes.
   - Commit scoped fixes, deploy, verify live output, record fixed findings and remaining limits with file/line references.

## 검토 결과

검토 기준 커밋은 `9a5b4b0`입니다. 실제로 재현한 오류를 먼저 고쳤고, 기존 시각 디자인이나 프로젝트 설명을 불필요하게 바꾸지 않았습니다. 아래 P2는 특정 사용 조건에서 기능이나 자원 관리가 잘못되는 문제, P3는 유지보수·진단 품질 개선입니다. 코드 검토와 아래 테스트 범위에서 배포를 막는 P0/P1 문제는 발견하지 못했습니다. 모든 기기에서 오류가 없다는 뜻은 아닙니다.

| 우선순위 | 발견한 문제와 발생 조건 | 수정 | 검증 근거 |
| --- | --- | --- | --- |
| P2 | WebGL에서 정지 화면을 저장할 때 마지막 렌더 이후 drawing buffer를 읽으면 빈 PNG가 나올 수 있음 | 저장 요청을 다음 렌더에 연결하고, 그 프레임 안에서 `toBlob` 실행. 버퍼 보존 옵션은 사용하지 않음 | 기존 코드에서 회귀 테스트 실패 → 수정 후 통과. 브라우저에서 내려받은 PNG 육안 확인 |
| P2 | WebGL shader compile/link 실패 시 중간 자원이 남고, 최종 해제 시 context를 명시적으로 반환하지 않음 | 실패 경로의 shader/program 정리, 최종 context 반환, 중복 destroy 방어 | compile 실패·link 실패·중복 destroy 각각 테스트 |
| P2 | RAF가 멈춘 상황에서는 WebGL context loss가 다음 frame 호출까지 감지되지 않음 | context loss 이벤트에서 즉시 정적 이미지로 전환 | RAF 호출 없이 context loss를 전달하는 회귀 테스트 |
| P2 | 영상의 자동 정지 이벤트가 늦게 도착하면 사용자 수동 정지로 기록될 수 있음 | 자동 정지에서 발생한 이벤트를 별도로 추적. 수동 정지 의사는 계속 유지 | 빠른 화면 진입/이탈, 수동 정지 후 복귀 테스트. XR 영상 브라우저 확인 |
| P2 | 페이지를 연 뒤 데이터 절약 설정을 바꿔도 자동 재생 정책이 갱신되지 않음 | connection과 reduced-motion 변경 감지. 진행 중인 play 요청 완료 시에도 최신 설정 확인 | 설정 변경 시 자동 재생 중지, 네이티브 수동 재생 유지 테스트 |
| P2 | Lab의 select가 runtime 연결 전부터 활성화되어 선택이 무시될 수 있음 | SSR에서는 비활성화, 이벤트 연결 후 활성화. GPU 지원 여부에 따라 기능별 상태 반영 | 3개 언어의 정적 HTML 검사 및 WebGPU/WebGL/static 전환 확인 |
| P3 | 그래픽스 코드 청크 로드 실패가 처리되지 않은 Promise rejection으로 남음 | 동적 import 실패를 처리하고 SSR 이미지와 본문 유지 | 오류 경로 코드 검토. 실제 네트워크 차단 재현은 수행하지 않음 |
| P3 | 로컬 preview가 일반 소스 TXT와 RSC payload를 같은 MIME으로 제공 | RSC 파일에만 `text/x-component`, 공개 소스는 `text/plain` | HTTP 응답 직접 확인. 영상 Range 요청 206도 확인 |
| P3 | 압축된 CSS·Rust 코드, 사용하지 않는 import, 검사 대상에서 빠진 Rust | 가독성 정리, unused 검사 활성화, Prettier·Rust 검사 CI 추가 | TypeScript/format/cargo check/cargo fmt 통과 |
| P3 | 저장소 링크 부재, README의 배포 디렉터리·영상 설명이 실제 구현과 다름 | 공통 푸터에 GitHub 링크 추가, 운영 문서 정정 | 30개 콘텐츠 URL의 공통 푸터 검사, 320·390·1280px 시각 확인 |

WebGL 캡처 방식은 [WebGL Fundamentals의 같은 프레임 내 캡처 설명](https://webglfundamentals.org/webgl/lessons/webgl-tips.html)을 따릅니다. context 반환은 [MDN WebGL 권장 사항](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)에 근거합니다.

## 구조별 판단

### Routing / React / i18n

- 10개 콘텐츠 경로 × 한국어·영어·독일어 = 30개 URL을 정적으로 생성합니다. 오류 페이지를 포함한 35개 HTML과 내부 링크·앵커·미디어 경로를 검사했습니다.
- 각 페이지의 언어, canonical/hreflang, sitemap, h1/main의 개수, 중복 ID, 이미지 alt·크기를 확인했습니다.
- 번역 catalog와 Shiki는 서버 빌드에만 사용됩니다. 브라우저 JS에 전체 번역이나 syntax highlighter가 포함되지 않는지 검사했습니다.
- 홈 → Renderer → 영어 → 독일어 → 뒤로 가기에서 canvas의 instance ID가 같고 canvas가 한 개임을 DOM에서 확인했습니다. 언어를 바꿔도 `#graph`와 활성 메뉴가 유지됩니다.
- 새 페이지를 추가할 때 registry/routes/form map을 함께 편집해야 하는 구조입니다. 현재 규모에서는 명시적이고 검사 가능하므로 CMS나 복잡한 추상화를 도입하지 않았습니다.

### GPU / 자원 수명

- retained runtime과 release lease가 React layout 교체를 연결합니다. 최종 해제 시 RAF·리스너·observer·GPU 자원을 정리합니다. 비동기 초기화의 epoch는 뒤늦게 완료된 이전 renderer를 폐기합니다.
- WGSL의 각 compute invocation은 자기 입자 상태만 읽고 씁니다. 이웃 입자 의존성이 없으므로 단일 state buffer가 타당합니다. compute 뒤 render가 같은 버퍼를 읽는 순서도 일치합니다.
- Rust uniform 구조와 WGSL 정렬, dispatch 경계 검사, surface 오류 처리, device 오류 플래그, buffer/device 해제를 검토했습니다. Rust 코드는 서식만 정리하고 WASM을 다시 생성했습니다.
- 모바일 입자 수와 DPR 상한, hidden tab 정지, reduced-motion 정지·재표시 경로를 유지했습니다. 성능 표시값은 rAF 간격이며 GPU 실행 시간이나 기기 간 벤치마크가 아닙니다.
- WebGL은 analytic compatibility renderer입니다. WebGPU compute와 동일한 시뮬레이션이라고 소개하지 않습니다. shader의 두 구현을 향후 바꿀 때는 양쪽을 함께 검증해야 합니다.

### 미디어 / 접근성 / 배포물

- 자동 재생과 수동 조작을 분리하고 네이티브 영상 컨트롤을 유지했습니다. 화면 밖의 영상은 정지합니다. 네 영상은 fast-start MP4이며 원본 MOV는 배포하지 않습니다.
- XR 사진의 순서, 갤러리 탐색, 출처 링크를 확인했습니다. 원본 사진 5개의 순서는 세 언어에서 회귀 검사합니다.
- 키보드 링크, 실제 anchor, skip link, 네이티브 select/button, locale별 접근성 이름을 유지했습니다. GitHub 링크의 터치 영역은 높이 44px 이상입니다.
- 회사 내부 소스와 원본 문서는 이 저장소에 포함하지 않습니다. 공개 source.zip은 독립 제작한 Field / Form 코드의 allowlist로 생성합니다. 테스트가 사내 archive 경로·환경 파일·로컬 QA 경로의 공개 유입을 검사합니다.
- npm advisory audit는 검토 당시 0건입니다. 검토한 tracked 텍스트에서 credential 패턴도 발견하지 못했습니다. 이는 전문 침투 테스트를 대신하지 않습니다.
- Vercel Next.js adapter의 Output Directory는 `.next`를 유지합니다. `out`은 portable export 및 로컬 preview용입니다. 다른 설정으로 바꾸지 않습니다.

## 검증 기록

| 검사 | 결과 |
| --- | --- |
| `npm run format:check` | 통과. Next가 생성하는 `next-env.d.ts`는 formatter 대상에서 제외 |
| `npm run check` | 통과. `noUnusedLocals` / `noUnusedParameters` 활성화 |
| `npm run build` | 통과. 콘텐츠·오류 페이지·sitemap 정적 생성 |
| `npm test` | 30개 통과. 기존 18개 + graphics/WebGL/media 회귀 12개 |
| `npm run check:rust` | wasm32-unknown-unknown release 검사 통과 |
| `npm run build:wasm` | 통과. wasm-bindgen 0.2.123 |
| `cargo fmt --manifest-path graphics-rust/Cargo.toml --check` | 통과 |
| `git diff --check` | 통과 |
| 폰트 subset | 소스에 사용된 한글 437자 모두 포함, 누락 0 |
| 브라우저 | WebGPU → WebGL2 → static → WebGPU, 형태 변경, PNG 저장, locale/hash/back, 영상·갤러리 확인 |
| 브라우저 콘솔 | 위 검증 동선에서 error/warn 없음 |
| 화면 크기 | 320×740 About, 390×844 Home, 1280×720 desktop. 새 푸터 겹침·수평 overflow 없음 |
| HTTP | preview TXT/RSC MIME, MP4 Range=206 확인 |

회귀 테스트는 이전 구현에서 실제로 실패하는 경로를 확인한 뒤 수정했습니다. VM 테스트는 브라우저 event/RAF/GPU adapter 경계를 대체하며, 실제 GPU 드라이버의 동작 자체를 검증하지는 않습니다. 화면 기록은 로컬 `qa/production-review-2026-09-22/`에 있으며 공개 빌드에 포함하지 않습니다.

## 수정 위치

- [프레임 저장·runtime 제어](../src/graphics/controller.ts#L182), [캡처 함수](../src/graphics/controller.ts#L362)
- [WebGL 생성 실패 정리](../src/graphics/webgl.ts#L66), [context loss](../src/graphics/webgl.ts#L111), [최종 해제](../src/graphics/webgl.ts#L158)
- [영상 정지 원인 구분](../src/interactions/media.ts#L16), [환경 설정 변경](../src/interactions/media.ts#L58)
- [청크 로드 실패 처리](../src/components/GraphicsStage.tsx#L29), [Lab 초기 컨트롤](../src/content/pages/lab-field-form.tsx#L31)
- [공통 GitHub 푸터](../src/components/SiteFooter.tsx#L10), [preview MIME](../scripts/serve.mjs#L48)
- [graphics 회귀 테스트](../tests/graphics-lifecycle.test.mjs), [WebGL 회귀 테스트](../tests/webgl-lifecycle.test.mjs), [media 회귀 테스트](../tests/media-lifecycle.test.mjs)

## 공개 저장소 / 배포 결과

- 공개 저장소: [DOMO928/sookieme](https://github.com/DOMO928/sookieme). 검토한 현재 파일 140개를 최초 공개 커밋으로 게시했습니다. 이전 개발 이력은 로컬에 별도 보관하고 게시하지 않았습니다.
- 코드 커밋: [`a627d97`](https://github.com/DOMO928/sookieme/commit/a627d9783bdd051f2db66b7f44a6f70903e0c6b1).
- [GitHub Actions](https://github.com/DOMO928/sookieme/actions/runs/35705517136): Linux의 새 환경에서 npm ci → format → TypeScript → production build → 30 tests → Rust check → rustfmt 모두 성공했습니다.
- Vercel production: `dpl_4Z2YLVgDbNVEUCGhA5J9WuH6Dxuk`, `READY`. [sookie.me](https://sookie.me/) 연결 완료.
- 배포된 30개 콘텐츠 URL 모두 HTTP 200, 올바른 문서 언어와 GitHub 링크를 확인했습니다. 없는 URL은 404, 공개 WGSL은 text/plain, source.zip은 application/zip입니다.
- 실제 도메인에서 Rust/wgpu 실행, Renderer 이동, canvas 한 개 유지, 새 푸터 링크와 콘솔 오류 없음까지 확인했습니다.
- 이번 배포는 Vercel CLI로 수행했습니다. GitHub push 시 자동 배포 연결을 구성했다고 주장하지 않습니다.

## 검증 범위와 남은 점

1. 실제 iOS Safari, Android 기기, Firefox에서의 GPU·배터리·장시간 동작 테스트는 수행하지 않았습니다. 모바일 viewport 검증을 실제 기기 검증으로 간주하지 않습니다.
2. WebGL 실패·reduced-motion·hidden tab·비동기 초기화 경쟁은 회귀 테스트로 검증했습니다. OS GPU reset, 실제 장치 메모리 부족, WebGPU device loss는 강제로 재현하지 않았습니다.
3. reduced-motion은 지원하지만 사용자 요청에 따라 별도 배경 정지 메뉴를 다시 추가하지 않았습니다. 전체 WCAG 적합성 인증을 주장하지 않습니다.
4. Next의 `globalNotFound`는 현재 experimental 옵션입니다. 오류 페이지 정적 산출물은 검사하며, Next 업그레이드 때 재확인해야 합니다.
5. GPU/DOM 생명주기 회귀 테스트는 CI에서 실행되지만, 화면 크기별 스크린샷과 실제 브라우저 검증은 이번 리뷰에서 수동으로 수행했습니다. 모든 시각 회귀가 자동 검출되는 구성은 아닙니다.
