// Small runtime-only catalog. The full project-copy catalog stays on the build side.
const labels = {
  debug: [
    'GPU 시각화는 WebGPU에서만 지원합니다',
    'GPU visualization is available only in WebGPU',
    'GPU-Visualisierung ist nur mit WebGPU verfügbar',
  ],
  still: ['정지', 'Still', 'Angehalten'],
  collecting: ['수집 중', 'Collecting samples', 'Messung läuft'],
  interrupted: ['그래픽 실행 중단', 'Graphics stopped', 'Grafik angehalten'],
  failed: [
    'GPU 초기화 또는 실행 실패 · 본문은 계속 열람할 수 있습니다',
    'GPU initialization or rendering failed · Content remains available',
    'GPU-Initialisierung oder Rendering fehlgeschlagen · Inhalte bleiben verfügbar',
  ],
  static: [
    '정적 렌더 이미지 · GPU 실행 없음',
    'Static render · GPU inactive',
    'Statisches Bild · GPU inaktiv',
  ],
  measure: ['10초 측정', 'Measure 10 seconds', '10 Sekunden messen'],
  navigation: ['페이지 이동', 'Page navigation', 'Seitenwechsel'],
  measuring: ['측정 중…', 'Measuring…', 'Messung läuft…'],
  recording: [
    '같은 화면을 유지하며 10초 동안 수집합니다.',
    'Collecting for 10 seconds. Keep this view open.',
    'Messung für 10 Sekunden. Diese Ansicht geöffnet lassen.',
  ],
  shape: ['형상 변경', 'Form changed', 'Form geändert'],
  mode: ['시각화 변경', 'View changed', 'Ansicht geändert'],
  backend: ['렌더 경로 변경', 'Rendering path changed', 'Rendering-Pfad geändert'],
  resize: ['화면 크기 변경', 'Viewport resized', 'Fenstergröße geändert'],
  visibility: ['탭 표시 상태 변경', 'Tab visibility changed', 'Tab-Sichtbarkeit geändert'],
  motion: ['모션 설정 변경', 'Motion preference changed', 'Bewegungseinstellung geändert'],
} as const;
function lang() {
  return document.documentElement.lang === 'en'
    ? 1
    : document.documentElement.lang === 'de'
      ? 2
      : 0;
}
export function ui(key: keyof typeof labels) {
  return labels[key][lang()];
}
export function measurement(count: number, median: string, p95: string) {
  return [
    `${count} frames · 중앙값 ${median} ms · p95 ${p95} ms. rAF 프레임 간격이며 GPU 실행 시간이 아닙니다.`,
    `${count} frames · median ${median} ms · p95 ${p95} ms. rAF frame intervals, not GPU execution time.`,
    `${count} Frames · Median ${median} ms · p95 ${p95} ms. rAF-Frame-Abstände, keine GPU-Ausführungszeiten.`,
  ][lang()];
}
export function invalidated(reason: string, recording: boolean) {
  return [
    `${recording ? '측정 취소' : '측정 조건 변경'}: ${reason}. 현재 설정으로 다시 측정해 주세요.`,
    `${recording ? 'Measurement cancelled' : 'Measurement conditions changed'}: ${reason}. Measure again with the current settings.`,
    `${recording ? 'Messung abgebrochen' : 'Messbedingungen geändert'}: ${reason}. Bitte mit den aktuellen Einstellungen erneut messen.`,
  ][lang()];
}
